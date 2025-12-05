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
    
    if (!postsByDate.has(post.dateKey)) {
      postsByDate.set(post.dateKey, []);
    }
    postsByDate.get(post.dateKey).push(post);
    
    const draftLabel = post.draft ? ' [DRAFT]' : '';
    console.log(`   ${post.dateKey} | ${post.id}${draftLabel}`);
    console.log(`            ${post.slug}`);
  }

  // Step 2: Process each key pattern
  const operations = { merge: [], delete: [], keep: [] };
  const stats = { strings: 0, zsets: 0 };

  console.log('\n' + '='.repeat(70));
  console.log('\n🔍 ANALYZING REDIS KEYS:\n');

  for (const { pattern, type, prefix } of KEY_PATTERNS) {
    const keys = await client.keys(pattern);
    
    for (const key of keys.sort()) {
      const suffix = key.replace(prefix, '');
      
      // Extract the ID part (before any :day: or other suffixes)
      let id, extraSuffix = '';
      if (suffix.includes(':day:')) {
        [id, ...extraSuffix] = suffix.split(':day:');
        extraSuffix = ':day:' + extraSuffix.join(':day:');
      } else {
        id = suffix.split(':')[0];
        const remaining = suffix.slice(id.length);
        if (remaining.startsWith(':')) {
          extraSuffix = remaining;
        }
      }
      
      // Check if this is a valid current ID
      if (validIds.has(id)) {
        operations.keep.push({ key, id, type });
        continue;
      }
      
      // Check if it's a slug-based key for a current post
      const matchBySlug = posts.find(p => p.slug === id && !p.draft);
      if (matchBySlug) {
        operations.merge.push({
          fromKey: key,
          toKey: `${prefix}${matchBySlug.id}${extraSuffix}`,
          toId: matchBySlug.id,
          type,
          reason: `Slug-based key → ${matchBySlug.slug}`,
        });
        continue;
      }
      
      // Check if it's a date-based ID that matches a current post
      const dateKey = extractDateFromId(id);
      if (dateKey) {
        const matchingPosts = postsByDate.get(dateKey) || [];
        const nonDraftPosts = matchingPosts.filter(p => !p.draft);
        
        if (nonDraftPosts.length === 1) {
          const targetPost = nonDraftPosts[0];
          operations.merge.push({
            fromKey: key,
            toKey: `${prefix}${targetPost.id}${extraSuffix}`,
            toId: targetPost.id,
            type,
            reason: `Date match (${dateKey}) → ${targetPost.slug}`,
          });
          continue;
        }
      }
      
      // Check for test posts or truly orphaned keys
      if (id.startsWith('test-post-')) {
        operations.delete.push({ key, type, reason: 'Test post' });
      } else if (dateKey && !postsByDate.has(dateKey)) {
        operations.delete.push({ key, type, reason: `No post on date ${dateKey}` });
      } else {
        operations.delete.push({ key, type, reason: 'Orphaned key' });
      }
    }
  }

  // Report
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

  // Execute
  if (!DRY_RUN) {
    console.log('\n' + '='.repeat(70));
    console.log('\n🚀 EXECUTING CHANGES:\n');
    
    // Merge operations
    for (const op of operations.merge) {
      if (op.type === 'string') {
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
      } else if (op.type === 'zset') {
        // For sorted sets, union the data
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
    }
    
    // Delete operations
    for (const op of operations.delete) {
      await client.del(op.key);
      console.log(`   🗑️  Deleted: ${op.key}`);
      if (op.type === 'string') stats.strings++;
      else if (op.type === 'zset') stats.zsets++;
    }
    
    console.log(`\n✅ Migration complete!`);
    console.log(`   Strings processed: ${stats.strings}`);
    console.log(`   Sorted sets processed: ${stats.zsets}`);
  } else {
    console.log('\n💡 Run without --dry-run to apply these changes.');
  }

  // Final state - show current post stats
  console.log('\n' + '='.repeat(70));
  console.log('\n📈 FINAL ANALYTICS STATE:\n');
  
  for (const post of posts.filter(p => !p.draft).sort((a, b) => b.dateKey.localeCompare(a.dateKey))) {
    const viewKey = `views:post:${post.id}`;
    const shareKey = `shares:post:${post.id}`;
    const views = await client.get(viewKey) || '0';
    const shares = await client.get(shareKey) || '0';
    
    console.log(`   ${post.title.substring(0, 50)}`);
    console.log(`   Views: ${views} | Shares: ${shares}\n`);
  }

  await client.quit();
}

main().catch(console.error);
