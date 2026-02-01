#!/usr/bin/env node
import dotenv from 'dotenv';
import { Redis } from '@upstash/redis';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

console.log('📊 Final View Status Report\n');

// Get all view keys
const allViewKeys = await redis.keys('views:*');

// Categorize keys
const slugBasedCounters = allViewKeys.filter(
  (k) =>
    k.startsWith('views:post:') &&
    !k.startsWith('views:post:post-') &&
    !k.startsWith('views:post:project-') &&
    !k.includes(':day:') &&
    !k.includes(':history:')
);

const idBasedCounters = allViewKeys.filter(
  (k) =>
    (k.startsWith('views:post:post-') || k.startsWith('views:post:project-')) &&
    !k.includes(':day:') &&
    !k.includes(':history:')
);

const slugBasedHistory = allViewKeys.filter(
  (k) =>
    k.startsWith('views:history:post:') &&
    !k.includes('views:history:post:post-') &&
    !k.includes('views:history:post:project-')
);

const idBasedHistory = allViewKeys.filter(
  (k) => k.startsWith('views:history:post:post-') || k.startsWith('views:history:post:project-')
);

console.log('🔑 KEY TYPES:\n');
console.log(`  Slug-based counters: ${slugBasedCounters.length}`);
console.log(`  ID-based counters (orphaned): ${idBasedCounters.length}`);
console.log(`  Slug-based history: ${slugBasedHistory.length}`);
console.log(`  ID-based history (orphaned): ${idBasedHistory.length}`);

// Calculate totals
let slugViews = 0;
let idViews = 0;

for (const key of slugBasedCounters) {
  slugViews += parseInt((await redis.get(key)) || '0');
}

for (const key of idBasedCounters) {
  idViews += parseInt((await redis.get(key)) || '0');
}

console.log('\n📈 VIEW TOTALS:\n');
console.log(`  Active (slug-based) views: ${slugViews}`);
console.log(`  Orphaned (ID-based) views: ${idViews}`);
console.log(`  Grand total: ${slugViews + idViews}`);

if (slugBasedCounters.length > 0) {
  console.log('\n✅ TOP ACTIVE POSTS (by view count):\n');
  const posts = [];
  for (const key of slugBasedCounters) {
    const slug = key.replace('views:post:', '');
    const views = parseInt((await redis.get(key)) || '0');
    posts.push({ slug, views });
  }
  posts.sort((a, b) => b.views - a.views);
  posts.slice(0, 10).forEach((post, i) => {
    console.log(`  ${i + 1}. ${post.slug}: ${post.views} views`);
  });
}

if (idBasedCounters.length > 0) {
  console.log('\n⚠️  ORPHANED ID-BASED KEYS (need cleanup):\n');
  const orphans = [];
  for (const key of idBasedCounters) {
    const id = key.replace('views:post:', '');
    const views = parseInt((await redis.get(key)) || '0');
    orphans.push({ id, views });
  }
  orphans.sort((a, b) => b.views - a.views);
  orphans.forEach((orphan) => {
    console.log(`  ${orphan.id}: ${orphan.views} views`);
  });
}

console.log('\n' + '='.repeat(60));
console.log('\n🎯 STATUS:\n');
if (idBasedCounters.length === 0 && idBasedHistory.length === 0) {
  console.log('  ✅ All views successfully consolidated to slug-based keys!');
  console.log('  ✅ No orphaned data remaining.');
} else {
  console.log(`  ⚠️  ${idBasedCounters.length + idBasedHistory.length} orphaned keys remain.`);
  console.log('  💡 Run consolidation script to merge these.');
}
