#!/usr/bin/env node
/**
 * Fix Double-Prefixed Redis Keys
 *
 * Migrates keys from 'preview:preview:*' to 'preview:*'
 * This fixes the bug introduced in commit 2c5689d2 where the prefix
 * was applied twice in some environments.
 *
 * Usage:
 *   npm run fix:redis-keys         # Run migration (production)
 *   npm run fix:redis-keys:dry-run # Preview what would be migrated
 */

import dotenv from 'dotenv';
import { Redis } from '@upstash/redis';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const DRY_RUN = process.argv.includes('--dry-run');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

console.log('🔧 Fix Double-Prefixed Redis Keys\n');
console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE (will modify keys)'}\n`);

try {
  // Find all double-prefixed keys
  const doubleKeys = await redis.keys('preview:preview:*');

  if (doubleKeys.length === 0) {
    console.log('✅ No double-prefixed keys found. Database is clean!');
    process.exit(0);
  }

  console.log(`Found ${doubleKeys.length} double-prefixed keys:\n`);

  // Group by pattern for clarity
  const patterns = {};
  for (const key of doubleKeys) {
    const pattern = key.split(':').slice(0, 3).join(':');
    if (!patterns[pattern]) {
      patterns[pattern] = [];
    }
    patterns[pattern].push(key);
  }

  // Display grouped keys
  for (const [pattern, keys] of Object.entries(patterns)) {
    console.log(`  ${pattern}:* (${keys.length} keys)`);
    console.log(`    Sample: ${keys.slice(0, 3).join(', ')}`);
  }

  console.log('\n📋 Migration Plan:\n');

  let migrated = 0;
  let errors = 0;

  for (const oldKey of doubleKeys) {
    const newKey = oldKey.replace('preview:preview:', 'preview:');

    console.log(`  ${oldKey}`);
    console.log(`    → ${newKey}`);

    if (!DRY_RUN) {
      try {
        // Check key type first (some keys are ZSETs, not strings)
        const type = await redis.type(oldKey);

        if (type === 'string') {
          // Get the value and TTL
          const value = await redis.get(oldKey);
          const ttl = await redis.ttl(oldKey);

          if (value !== null) {
            // Set the new key with same value and TTL
            if (ttl > 0) {
              await redis.setex(newKey, ttl, value);
            } else {
              await redis.set(newKey, value);
            }

            // Delete the old key
            await redis.del(oldKey);
            migrated++;
            console.log(`    ✅ Migrated (string)`);
          } else {
            console.log(`    ⚠️ Skipped (null value)`);
          }
        } else if (type === 'zset') {
          // Sorted set - copy all members
          const members = await redis.zrange(oldKey, 0, -1, { withScores: true });
          const ttl = await redis.ttl(oldKey);

          if (members && members.length > 0) {
            // Add all members to new key
            for (let i = 0; i < members.length; i += 2) {
              const member = members[i];
              const score = members[i + 1];
              await redis.zadd(newKey, { score, member });
            }

            // Set TTL if exists
            if (ttl > 0) {
              await redis.expire(newKey, ttl);
            }

            // Delete old key
            await redis.del(oldKey);
            migrated++;
            console.log(`    ✅ Migrated (zset, ${members.length / 2} members)`);
          } else {
            console.log(`    ⚠️ Skipped (empty zset)`);
          }
        } else {
          console.log(`    ⚠️ Skipped (type: ${type} - not supported yet)`);
        }
      } catch (error) {
        console.error(`    ❌ Error: ${error.message}`);
        errors++;
      }
    }
  }

  console.log('\n' + '='.repeat(60));

  if (DRY_RUN) {
    console.log(`\n📊 Summary (DRY RUN):`);
    console.log(`  Keys to migrate: ${doubleKeys.length}`);
    console.log(`\n💡 Run without --dry-run to apply changes`);
  } else {
    console.log(`\n📊 Migration Complete:`);
    console.log(`  ✅ Migrated: ${migrated}`);
    console.log(`  ❌ Errors: ${errors}`);
    console.log(`  📊 Success Rate: ${((migrated / doubleKeys.length) * 100).toFixed(1)}%`);
  }
} catch (error) {
  console.error('❌ Fatal Error:', error.message);
  process.exit(1);
}
