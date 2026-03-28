#!/usr/bin/env node
/**
 * Clear Test Data from Redis (PRODUCTION SAFE)
 *
 * This script removes sample/test analytics milestone data from Redis.
 * It only removes the specific test data keys, not all Redis data.
 *
 * Safe to run in production - only clears the fabricated analytics milestones.
 */

import { Redis } from '@upstash/redis';

const TEST_DATA_KEYS = [
  'analytics:milestones',
  'github:traffic:milestones',
  // 'google:analytics:milestones', // Removed - not implemented
  'search:console:milestones',
];

async function clearTestData() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.error('❌ UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not configured');
    process.exit(1);
  }

  const redis = new Redis({ url, token });

  try {
    console.log('📊 TEST DATA KEYS TO CLEAR');
    console.log('='.repeat(70));

    let totalRemoved = 0;
    const results = [];

    for (const key of TEST_DATA_KEYS) {
      try {
        const exists = await redis.exists(key);

        if (exists) {
          const data = await redis.get(key);
          const parsed = JSON.parse(data || '[]');
          const itemCount = parsed.length || 0;

          await redis.del(key);
          const removed = itemCount;
          totalRemoved += removed;

          results.push({
            key,
            status: '✅ REMOVED',
            items: removed,
          });

          console.log(`\n✅ ${key}`);
          console.log(`   Items deleted: ${removed}`);
        } else {
          results.push({
            key,
            status: '⏭️  NOT FOUND',
            items: 0,
          });

          console.log(`\n⏭️  ${key}`);
          console.log(`   Not found in Redis (already cleared)`);
        }
      } catch (error) {
        results.push({
          key,
          status: '❌ ERROR',
          error: error.message,
        });

        console.log(`\n❌ ${key}`);
        console.log(`   Error: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📈 SUMMARY');
    console.log('-'.repeat(70));
    console.log(`   Total test data items removed: ${totalRemoved}`);
    console.log(`   Keys processed: ${TEST_DATA_KEYS.length}`);
    console.log(`   Removed: ${results.filter((r) => r.status === '✅ REMOVED').length}`);
    console.log(`   Not found: ${results.filter((r) => r.status === '⏭️  NOT FOUND').length}`);
    console.log(`   Errors: ${results.filter((r) => r.status === '❌ ERROR').length}`);

    console.log('\n' + '='.repeat(70));
    console.log('✅ CLEANUP COMPLETE');
    console.log('-'.repeat(70));
    console.log('Test data has been removed from Redis.');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Verify no test data appears in activity feed');
    console.log('  2. Ensure Redis contains only real data');
    console.log('  3. Monitor logs for any missing milestone warnings');
    console.log('  4. Deploy real data ingestion scripts when ready');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing test data:', error.message);
    process.exit(1);
  }
}

clearTestData();
