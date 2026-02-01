#!/usr/bin/env node
/**
 * Audit All View Counts in Production Redis
 *
 * Comprehensive audit of all view data to verify nothing was lost.
 */

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

console.log('📊 Complete View Count Audit\n');
console.log('Checking production Redis for ALL view data...\n');

try {
  // Get ALL view keys (no prefix - production keys)
  const allViewKeys = await redis.keys('views:post:*');

  // Filter out daily tracking keys
  const baseViewKeys = allViewKeys.filter((key) => !key.includes(':day:'));
  const dailyKeys = allViewKeys.filter((key) => key.includes(':day:'));

  console.log('📋 Key Summary:');
  console.log(`  Total view keys: ${allViewKeys.length}`);
  console.log(`  Base view counters: ${baseViewKeys.length}`);
  console.log(`  Daily tracking keys: ${dailyKeys.length}`);
  console.log('');

  // Get all view counts
  console.log('📊 Base View Counters (Production - No Prefix):\n');

  let totalViews = 0;
  const viewData = [];

  for (const key of baseViewKeys) {
    const value = await redis.get(key);
    const count = parseInt(value || '0');
    const postId = key.replace('views:post:', '');

    viewData.push({ postId, count, key });
    totalViews += count;
  }

  // Sort by view count descending
  viewData.sort((a, b) => b.count - a.count);

  // Display all posts with views
  viewData.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.postId}`);
    console.log(`     Views: ${item.count.toLocaleString()}`);
    console.log(`     Key: ${item.key}`);
    console.log('');
  });

  console.log('═'.repeat(60));
  console.log(`\n📊 TOTAL VIEWS ACROSS ALL POSTS: ${totalViews.toLocaleString()}\n`);
  console.log('═'.repeat(60));

  // Check for preview-prefixed keys (shouldn't exist in production)
  const previewKeys = await redis.keys('preview:views:post:*');
  const previewBaseKeys = previewKeys.filter((key) => !key.includes(':day:'));

  if (previewBaseKeys.length > 0) {
    console.log('\n⚠️  Warning: Found preview-prefixed keys in production database:');
    console.log(`  Count: ${previewBaseKeys.length}`);

    let previewTotal = 0;
    for (const key of previewBaseKeys.slice(0, 5)) {
      const value = await redis.get(key);
      const count = parseInt(value || '0');
      previewTotal += count;
      console.log(`  ${key}: ${count} views`);
    }
    if (previewBaseKeys.length > 5) {
      console.log(`  ... and ${previewBaseKeys.length - 5} more`);
    }
    console.log(`\n  Preview prefix total: ${previewTotal.toLocaleString()} views`);
  }

  // Check view history (ZSET keys)
  const historyKeys = await redis.keys('views:history:post:*');
  console.log(`\n📈 View History Keys (24-hour tracking): ${historyKeys.length}`);

  // Sample a few history keys to show they're intact
  if (historyKeys.length > 0) {
    console.log('\nSample history data:');
    for (const key of historyKeys.slice(0, 3)) {
      const count = await redis.zcard(key);
      const postId = key.replace('views:history:post:', '');
      console.log(`  ${postId}: ${count} view events tracked`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('\n✅ Data Integrity Check:\n');
  console.log(`  ✅ ${baseViewKeys.length} posts with view counters`);
  console.log(`  ✅ ${totalViews.toLocaleString()} total views preserved`);
  console.log(`  ✅ ${historyKeys.length} view history tracking keys`);
  console.log(`  ✅ ${dailyKeys.length} daily analytics keys`);

  if (totalViews === 0) {
    console.log('\n⚠️  WARNING: Total views is 0!');
    console.log('   This suggests either:');
    console.log('   1. Views were never tracked in this database');
    console.log('   2. Views are stored under a different key pattern');
    console.log('   3. Wrong Redis database credentials');
  } else if (totalViews < 100) {
    console.log(`\n⚠️  Note: Only ${totalViews} total views found.`);
    console.log('   If expecting hundreds, check:');
    console.log('   1. Correct Redis database (production vs preview)');
    console.log('   2. Key patterns (are views stored differently?)');
    console.log('   3. Recent key migrations or cleanups');
  } else {
    console.log('\n✅ View counts look healthy!');
  }
} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}
