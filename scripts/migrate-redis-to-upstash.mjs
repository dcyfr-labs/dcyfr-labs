#!/usr/bin/env node
/**
 * Migrate Data from Old Redis to Upstash
 *
 * Transfers all data from REDIS_URL (old instance) to Upstash.
 * Preserves TTLs and data structures.
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '../.env.local') });

import { createClient } from 'redis';
import { redis as upstashClient } from '../src/mcp/shared/redis-client.ts';

async function migrateKeyToUpstash(key, type, ttl, oldClient) {
  if (type === 'string') {
    const value = await oldClient.get(key);
    if (ttl > 0) await upstashClient.setex(key, ttl, value);
    else await upstashClient.set(key, value);
    return true;
  }
  if (type === 'list') {
    const values = await oldClient.lRange(key, 0, -1);
    if (!values.length) return false;
    await upstashClient.del(key);
    await upstashClient.lpush(key, ...values.reverse());
    if (ttl > 0) await upstashClient.expire(key, ttl);
    return true;
  }
  if (type === 'set') {
    const members = await oldClient.sMembers(key);
    if (!members.length) return false;
    await upstashClient.del(key);
    await upstashClient.sadd(key, ...members);
    if (ttl > 0) await upstashClient.expire(key, ttl);
    return true;
  }
  if (type === 'zset') {
    const items = await oldClient.zRangeWithScores(key, 0, -1);
    if (!items.length) return false;
    await upstashClient.del(key);
    await upstashClient.zadd(key, ...items.map(item => ({ score: item.score, member: item.value })));
    if (ttl > 0) await upstashClient.expire(key, ttl);
    return true;
  }
  if (type === 'hash') {
    const hash = await oldClient.hGetAll(key);
    if (!Object.keys(hash).length) return false;
    await upstashClient.del(key);
    await upstashClient.hset(key, hash);
    if (ttl > 0) await upstashClient.expire(key, ttl);
    return true;
  }
  return null; // unsupported type
}

async function migrateRedisData() {
  console.log('🚀 Starting Redis to Upstash Migration...\n');

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.error('❌ REDIS_URL not found in environment variables');
    process.exit(1);
  }

  console.log('📍 Source: Old Redis instance');
  console.log('📍 Target: Upstash\n');

  // Connect to old Redis
  const oldClient = createClient({
    url: redisUrl,
    socket: { connectTimeout: 10000 },
  });

  try {
    await oldClient.connect();
    console.log('✅ Connected to old Redis instance\n');

    // Test Upstash connection
    await upstashClient.ping();
    console.log('✅ Connected to Upstash\n');

    // Get all keys
    console.log('🔍 Scanning keys in old Redis...');
    const allKeys = [];
    let scanCursor = '0';

    do {
      const result = await oldClient.scan(scanCursor, { COUNT: 1000 });
      scanCursor = result.cursor.toString();
      allKeys.push(...result.keys);
    } while (scanCursor !== '0');

    console.log(`📦 Found ${allKeys.length} keys to migrate\n`);

    if (allKeys.length === 0) {
      console.log('✨ No keys to migrate - old instance is empty');
      await oldClient.quit();
      return;
    }

    // Ask for confirmation
    console.log('⚠️  This will overwrite any existing keys in Upstash with the same names.');
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log('🔄 Starting migration...\n');

    let migrated = 0;
    let failed = 0;
    const errors = [];

    for (let i = 0; i < allKeys.length; i++) {
      const key = allKeys[i];
      const progress = `[${i + 1}/${allKeys.length}]`;

      try {
        const type = await oldClient.type(key);
        const ttl = await oldClient.ttl(key);

        const result = await migrateKeyToUpstash(key, type, ttl, oldClient);
        if (result === null) {
          console.log(`${progress} ⚠️  Skipping ${key} (unsupported type: ${type})`);
          continue;
        }

        if (result) {
          migrated++;
          if (migrated % 10 === 0) {
            console.log(`${progress} ✅ Migrated ${migrated} keys...`);
          }
        }
      } catch (error) {
        failed++;
        errors.push({ key, error: error.message });
        console.error(`${progress} ❌ Failed to migrate ${key}: ${error.message}`);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`  ✅ Successfully migrated: ${migrated} keys`);
    console.log(`  ❌ Failed: ${failed} keys`);
    console.log(`  📦 Total processed: ${allKeys.length} keys\n`);

    if (errors.length > 0 && errors.length <= 10) {
      console.log('❌ Errors:');
      errors.forEach(({ key, error }) => {
        console.log(`  - ${key}: ${error}`);
      });
      console.log('');
    }

    // Verify migration
    console.log('🔍 Verifying migration...');
    const [_, upstashKeys] = await upstashClient.scan(0, { count: 1000 });
    console.log(`✅ Upstash now has ${upstashKeys.length} keys\n`);

    console.log('✅ Migration complete!');
    console.log('\n💡 Next steps:');
    console.log('  1. Test your application with Upstash');
    console.log('  2. Verify all features work correctly');
    console.log('  3. Keep old Redis instance as backup for 7-14 days');
    console.log('  4. Remove REDIS_URL from .env.local when confident');

    await oldClient.quit();
  } catch (error) {
    console.error('❌ Migration failed:');
    console.error(error);

    try {
      await oldClient.quit();
    } catch (e) {
      // Ignore quit errors
    }

    process.exit(1);
  }
}

migrateRedisData();
