#!/usr/bin/env node

/**
 * Comprehensive blog analytics migration script
 * 
 * Migrates ALL orphaned Redis keys to current post IDs:
 * - views:post:{id} - Total view counts
 * - views:history:post:{id} - View history sorted sets
 * - views:post:{id}:day:* - Daily view tracking
 * - shares:post:{id} - Total share counts
 * - shares:history:post:{id} - Share history sorted sets
 * - blog:milestone:{id}:* - Milestone achievements
 * - session:view:{id}:* - Session tracking
 * 
 * Strategy: Match orphaned keys by date prefix to current posts
 */

import { createClient } from 'redis';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import yaml from 'js-yaml';

const REDIS_URL = process.env.REDIS_URL;
const DRY_RUN = process.argv.includes('--dry-run');
const CONTENT_DIR = path.join(process.cwd(), 'src/content/blog');

if (!REDIS_URL) {
  console.error('❌ REDIS_URL required');
  process.exit(1);
}

function generatePostId(publishedAt, slug) {
  const input = `${publishedAt}:${slug}`;
  const hash = crypto.createHash('sha256').update(input).digest('hex').substring(0, 8);
  const datePart = publishedAt.split('T')[0];
  const date = datePart.replace(/-/g, '');
  return `post-${date}-${hash}`;
}

function extractDateFromId(id) {
  // Handle both post-YYYYMMDD-hash and post-YYYY-MM-DDTHH:MM:SSZ-hash formats
  const match = id.match(/^post-(\d{8})-/) || id.match(/^post-(\d{4}-\d{2}-\d{2})T/);
  if (match) {
    return match[1].replace(/-/g, '');
  }
  return null;
}

function getAllPosts() {
  const entries = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });
  const posts = [];

  for (const entry of entries) {
    let slug, filePath;

    if (entry.isFile() && entry.name.endsWith('.mdx')) {
      slug = entry.name.replace(/\.mdx$/, '');
      filePath = path.join(CONTENT_DIR, entry.name);
    } else if (entry.isDirectory()) {
      const indexPath = path.join(CONTENT_DIR, entry.name, 'index.mdx');
      if (fs.existsSync(indexPath)) {
        slug = entry.name;
        filePath = indexPath;
      } else continue;
    } else continue;

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents, {
      engines: { yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) },
    });

    const publishedAt = data.publishedAt;
    const datePart = publishedAt.split('T')[0];
    const dateKey = datePart.replace(/-/g, '');
    // Use explicit id if available, otherwise generate
    const id = data.id || generatePostId(publishedAt, slug);

    posts.push({
      slug,
      id,
      publishedAt,
      dateKey,
      title: data.title,
      draft: data.draft || false,
    });
  }

  return posts;
}

// Key pattern definitions
const KEY_PATTERNS = [
  { pattern: 'views:post:*', type: 'string', prefix: 'views:post:' },
  { pattern: 'views:history:post:*', type: 'zset', prefix: 'views:history:post:' },
  { pattern: 'shares:post:*', type: 'string', prefix: 'shares:post:' },
  { pattern: 'shares:history:post:*', type: 'zset', prefix: 'shares:history:post:' },
  { pattern: 'blog:milestone:*', type: 'string', prefix: 'blog:milestone:' },
  { pattern: 'session:view:*', type: 'string', prefix: 'session:view:' },
];

/**
 * Extract the base id and optional suffix from a Redis key suffix.
 * Handles :day: sub-keys like `post-20240101-abc123:day:2024-01-01`.
 */
function extractIdParts(suffix) {
  if (suffix.includes(':day:')) {
    const [idPart, ...rest] = suffix.split(':day:');
    return { id: idPart, extraSuffix: ':day:' + rest.join(':day:') };
  }
  const id = suffix.split(':')[0];
  const remaining = suffix.slice(id.length);
  return { id, extraSuffix: remaining.startsWith(':') ? remaining : '' };
}

/**
 * Classify a single Redis key as keep / merge / delete.
 * Returns an operation object or null (should not happen).
 */
function classifyKey({ key, id, extraSuffix, type, prefix }, posts, postsByDate, validIds) {
  if (validIds.has(id)) {
    return { action: 'keep', key, id, type };
  }

  const matchBySlug = posts.find(p => p.slug === id && !p.draft);
  if (matchBySlug) {
    return {
      action: 'merge',
      fromKey: key,
      toKey: `${prefix}${matchBySlug.id}${extraSuffix}`,
      toId: matchBySlug.id,
      type,
      reason: `Slug-based key → ${matchBySlug.slug}`,
    };
  }

  const dateKey = extractDateFromId(id);
  if (dateKey) {
    const nonDraftPosts = (postsByDate.get(dateKey) || []).filter(p => !p.draft);
    if (nonDraftPosts.length === 1) {
      const targetPost = nonDraftPosts[0];
      return {
        action: 'merge',
        fromKey: key,
        toKey: `${prefix}${targetPost.id}${extraSuffix}`,
        toId: targetPost.id,
        type,
        reason: `Date match (${dateKey}) → ${targetPost.slug}`,
      };
    }
  }

  if (id.startsWith('test-post-')) {
    return { action: 'delete', key, type, reason: 'Test post' };
  }
  if (dateKey && !postsByDate.has(dateKey)) {
    return { action: 'delete', key, type, reason: `No post on date ${dateKey}` };
  }
  return { action: 'delete', key, type, reason: 'Orphaned key' };
}

/**
 * Analyze all Redis keys for a single KEY_PATTERNS entry.
 * Pushes results into the operations object.
 */
async function analyzePatternKeys(client, { pattern, type, prefix }, posts, postsByDate, validIds, operations) {
  const keys = await client.keys(pattern);
  for (const key of keys.sort()) {
    const suffix = key.replace(prefix, '');
    const { id, extraSuffix } = extractIdParts(suffix);
    const op = classifyKey({ key, id, extraSuffix, type, prefix }, posts, postsByDate, validIds);
    operations[op.action].push(op);
  }
}

/**
 * Execute a single string-type merge operation.
 */
async function executeMergeString(client, op, stats) {
  const fromValue = await client.get(op.fromKey);
  if (fromValue) {
    const toValue = await client.get(op.toKey) || '0';
    const newValue = parseInt(toValue) + parseInt(fromValue);
    await client.set(op.toKey, newValue.toString());
    console.log(`   ✅ Merged string: ${op.fromKey}`);
    console.log(`      ${toValue} + ${fromValue} = ${newValue}`);
  }
  await client.del(op.fromKey);
  stats.strings++;
}

/**
 * Execute a single zset-type merge operation.
 */
async function executeMergeZset(client, op, stats) {
  const members = await client.zRangeWithScores(op.fromKey, 0, -1);
  if (members.length > 0) {
    for (const { score, value } of members) {
      await client.zAdd(op.toKey, { score, value });
    }
    console.log(`   ✅ Merged zset: ${op.fromKey} (${members.length} entries)`);
  }
  await client.del(op.fromKey);
  stats.zsets++;
}

/**
 * Execute all merge and delete operations against Redis.
 */
async function executeAllOperations(client, operations, stats) {
  console.log('\n' + '='.repeat(70));
  console.log('\n🚀 EXECUTING CHANGES:\n');

  for (const op of operations.merge) {
    if (op.type === 'string') {
      await executeMergeString(client, op, stats);
    } else if (op.type === 'zset') {
      await executeMergeZset(client, op, stats);
    }
  }

  for (const op of operations.delete) {
    await client.del(op.key);
    console.log(`   🗑️  Deleted: ${op.key}`);
    if (op.type === 'string') stats.strings++;
    else if (op.type === 'zset') stats.zsets++;
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`   Strings processed: ${stats.strings}`);
  console.log(`   Sorted sets processed: ${stats.zsets}`);
}

/**
 * Display the final analytics state for all non-draft posts.
 */
async function displayFinalState(client, posts) {
  console.log('\n' + '='.repeat(70));
  console.log('\n📈 FINAL ANALYTICS STATE:\n');

  const sorted = posts.filter(p => !p.draft).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  for (const post of sorted) {
    const views = await client.get(`views:post:${post.id}`) || '0';
    const shares = await client.get(`shares:post:${post.id}`) || '0';
    console.log(`   ${post.title.substring(0, 50)}`);
    console.log(`   Views: ${views} | Shares: ${shares}\n`);
  }
}

async function main() {
  console.log(`\n🔄 Comprehensive Blog Analytics Migration`);
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE (will modify Redis)'}\n`);
  console.log('='.repeat(70) + '\n');

  const client = createClient({ url: REDIS_URL });
  await client.connect();

  // Step 1: Build post lookup
  const posts = getAllPosts();
  const postsByDate = new Map();
  const validIds = new Set();

  console.log('📚 CURRENT POSTS:\n');
  for (const post of posts) {
    validIds.add(post.id);
    if (!postsByDate.has(post.dateKey)) postsByDate.set(post.dateKey, []);
    postsByDate.get(post.dateKey).push(post);
    const draftLabel = post.draft ? ' [DRAFT]' : '';
    console.log(`   ${post.dateKey} | ${post.id}${draftLabel}`);
    console.log(`            ${post.slug}`);
  }

  // Step 2: Analyze all Redis key patterns
  const operations = { merge: [], delete: [], keep: [] };
  const stats = { strings: 0, zsets: 0 };

  console.log('\n' + '='.repeat(70));
  console.log('\n🔍 ANALYZING REDIS KEYS:\n');

  for (const patternDef of KEY_PATTERNS) {
    await analyzePatternKeys(client, patternDef, posts, postsByDate, validIds, operations);
  }

  // Report keep/merge/delete
  console.log('✅ VALID KEYS (keeping):\n');
  for (const { key, type } of operations.keep.slice(0, 10)) {
    console.log(`   [${type}] ${key}`);
  }
  if (operations.keep.length > 10) {
    console.log(`   ... and ${operations.keep.length - 10} more`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n🔀 KEYS TO MERGE:\n');
  for (const op of operations.merge) {
    console.log(`   [${op.type}] ${op.fromKey}`);
    console.log(`       → ${op.toKey}`);
    console.log(`       Reason: ${op.reason}`);
    console.log('');
  }

  console.log('='.repeat(70));
  console.log('\n🗑️  KEYS TO DELETE:\n');
  for (const op of operations.delete) {
    console.log(`   [${op.type}] ${op.key}`);
    console.log(`       Reason: ${op.reason}`);
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 SUMMARY:\n');
  console.log(`   Keep:   ${operations.keep.length} keys`);
  console.log(`   Merge:  ${operations.merge.length} keys`);
  console.log(`   Delete: ${operations.delete.length} keys`);

  // Execute or dry-run note
  if (!DRY_RUN) {
    await executeAllOperations(client, operations, stats);
  } else {
    console.log('\n💡 Run without --dry-run to apply these changes.');
  }

  await displayFinalState(client, posts);
  await client.quit();
}

main().catch(console.error);
