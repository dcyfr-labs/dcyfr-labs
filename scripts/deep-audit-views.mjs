#!/usr/bin/env node
/**
 * Deep Audit - Check ALL Redis Keys for View Data
 *
 * Searches for views in any pattern or location.
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

console.log('🔍 DEEP AUDIT - Searching ALL Redis Keys for View Data\n');

try {
  // Get ALL keys in the database
  const allKeys = await redis.keys('*');
  console.log(`Total keys in database: ${allKeys.length}\n`);

  // Filter keys that might contain view data
  const viewRelated = allKeys.filter(
    (key) =>
      key.includes('view') ||
      key.includes('Visit') ||
      key.includes('impression') ||
      key.includes('pageview') ||
      key.includes('analytics')
  );

  console.log(`Keys potentially related to views: ${viewRelated.length}\n`);

  // Group by pattern
  const patterns = {};
  for (const key of viewRelated) {
    const parts = key.split(':');
    const pattern = parts.slice(0, 2).join(':') + ':*';
    if (!patterns[pattern]) {
      patterns[pattern] = [];
    }
    patterns[pattern].push(key);
  }

  console.log('📊 View-Related Key Patterns:\n');

  for (const [pattern, keys] of Object.entries(patterns)) {
    console.log(`  ${pattern} (${keys.length} keys)`);

    // For each pattern, try to sum up values
    let patternTotal = 0;
    let validKeys = 0;

    for (const key of keys.slice(0, 10)) {
      // Sample first 10
      try {
        // Check key type
        const type = await redis.type(key);

        if (type === 'string') {
          const value = await redis.get(key);
          const num = parseInt(value);
          if (!isNaN(num)) {
            patternTotal += num;
            validKeys++;
          }
        } else if (type === 'zset') {
          const count = await redis.zcard(key);
          console.log(`    ${key}: ${count} entries (ZSET)`);
        }
      } catch (e) {
        // Skip errors
      }
    }

    if (validKeys > 0) {
      console.log(`    Sample total (${validKeys} keys): ${patternTotal} views`);
    }
    console.log('');
  }

  // Check for any aggregated analytics keys
  console.log('\n🔍 Searching for Aggregated Analytics:\n');

  const analyticsKeys = allKeys.filter(
    (key) =>
      key.includes('analytics') ||
      key.includes('stats') ||
      key.includes('metrics') ||
      key.includes('total')
  );

  if (analyticsKeys.length > 0) {
    console.log(`Found ${analyticsKeys.length} analytics/stats keys:`);
    for (const key of analyticsKeys.slice(0, 20)) {
      console.log(`  ${key}`);
    }
  }

  // Check if we're looking at the right database
  console.log('\n\n🔧 Database Connection Info:\n');
  console.log(`  URL: ${process.env.UPSTASH_REDIS_REST_URL?.substring(0, 40)}...`);
  console.log(`  Total keys: ${allKeys.length}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'unknown'}`);
  console.log(`  Vercel Env: ${process.env.VERCEL_ENV || 'unknown'}`);

  // Check for old view key patterns (in case they were renamed)
  const oldPatterns = ['pageviews:*', 'views:*', 'blog:views:*', 'post:views:*', 'count:*'];

  console.log('\n\n🔍 Checking for Alternative Key Patterns:\n');

  for (const pattern of oldPatterns) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      console.log(`  ${pattern}: ${keys.length} keys found`);
      console.log(`    Sample: ${keys.slice(0, 3).join(', ')}`);
    }
  }
} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}
