#!/usr/bin/env node
import dotenv from 'dotenv';
import { Redis } from '@upstash/redis';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync, readFileSync } from 'fs';
import { parse } from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

console.log('🔍 Finding Orphaned View Data\n');

// Get all actual post slugs from content directory
const contentDir = join(__dirname, '..', 'src', 'content', 'blog');
const entries = readdirSync(contentDir, { withFileTypes: true });

const activeSlugs = new Set();
const slugMapping = {}; // old slug -> new slug

for (const entry of entries) {
  if (!entry.isDirectory() || entry.name.startsWith('.')) continue;

  const mdxPath = join(contentDir, entry.name, 'index.mdx');
  try {
    const content = readFileSync(mdxPath, 'utf-8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (frontmatterMatch) {
      const frontmatter = parse(frontmatterMatch[1]);
      const slug = frontmatter.slug || entry.name;
      activeSlugs.add(slug);

      // Check for old slugs in frontmatter
      if (frontmatter.previousSlugs || frontmatter.oldSlugs) {
        const oldSlugs = frontmatter.previousSlugs || frontmatter.oldSlugs;
        if (Array.isArray(oldSlugs)) {
          oldSlugs.forEach((oldSlug) => {
            slugMapping[oldSlug] = slug;
          });
        }
      }
    }
  } catch (err) {
    // Skip if no index.mdx
  }
}

console.log(`Found ${activeSlugs.size} active posts\n`);

// Get all view keys from Redis
const allViewKeys = await redis.keys('views:*');
const viewCounterKeys = allViewKeys.filter(
  (k) => k.startsWith('views:post:') && !k.includes(':day:') && !k.includes(':history:')
);

const historyKeys = allViewKeys.filter((k) => k.startsWith('views:history:post:'));

// Find orphaned keys
const orphanedCounters = [];
const orphanedHistory = [];
const activeCounters = [];

for (const key of viewCounterKeys) {
  const slug = key.replace('views:post:', '');
  if (!activeSlugs.has(slug)) {
    const count = parseInt((await redis.get(key)) || '0');
    orphanedCounters.push({ key, slug, count });
  } else {
    activeCounters.push(slug);
  }
}

for (const key of historyKeys) {
  const slug = key.replace('views:history:post:', '');
  if (!activeSlugs.has(slug)) {
    const count = await redis.zcard(key);
    orphanedHistory.push({ key, slug, count });
  }
}

console.log('📊 ANALYSIS:\n');
console.log(`Active post slugs: ${activeSlugs.size}`);
console.log(`Active view counters: ${activeCounters.length}`);
console.log(`Orphaned view counters: ${orphanedCounters.length}`);
console.log(`Orphaned history keys: ${orphanedHistory.length}`);

if (orphanedCounters.length > 0) {
  console.log('\n⚠️  ORPHANED VIEW COUNTERS:\n');
  orphanedCounters.sort((a, b) => b.count - a.count);
  orphanedCounters.forEach((item) => {
    const mapped = slugMapping[item.slug] || '(no mapping)';
    console.log(`  ${item.slug}: ${item.count} views`);
    console.log(`    Key: ${item.key}`);
    console.log(`    Should map to: ${mapped}`);
  });
}

if (orphanedHistory.length > 0) {
  console.log('\n⚠️  ORPHANED HISTORY KEYS:\n');
  orphanedHistory.sort((a, b) => b.count - a.count);
  orphanedHistory.forEach((item) => {
    const mapped = slugMapping[item.slug] || '(no mapping)';
    console.log(`  ${item.slug}: ${item.count} events`);
    console.log(`    Key: ${item.key}`);
    console.log(`    Should map to: ${mapped}`);
  });
}

const totalOrphanedViews = orphanedCounters.reduce((sum, item) => sum + item.count, 0);
const totalOrphanedEvents = orphanedHistory.reduce((sum, item) => sum + item.count, 0);

console.log('\n' + '='.repeat(60));
console.log('\n💡 SUMMARY:\n');
console.log(`  Total orphaned view counts: ${totalOrphanedViews}`);
console.log(`  Total orphaned history events: ${totalOrphanedEvents}`);
console.log(`  Total orphaned keys: ${orphanedCounters.length + orphanedHistory.length}`);

if (totalOrphanedViews > 0 || totalOrphanedEvents > 0) {
  console.log('\n🔧 RECOMMENDATION:');
  console.log('  Create a consolidation script to:');
  console.log('  1. Add previousSlugs to post frontmatter');
  console.log('  2. Merge orphaned views into active post counters');
  console.log('  3. Merge orphaned history events into active history');
}
