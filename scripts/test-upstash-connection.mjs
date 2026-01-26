#!/usr/bin/env node
/**
 * Test Upstash Redis Connectivity
 *
 * Verifies that Upstash credentials are configured correctly and
 * the connection is working.
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '../.env.local') });

import { redis } from '../src/mcp/shared/redis-client.ts';

async function testUpstashConnection() {
  console.log('🔍 Testing Upstash Redis Connection...\n');

  try {
    // Test 1: Basic connectivity with PING
    console.log('Test 1: PING command...');
    const pingResult = await redis.ping();
    console.log(`✅ PING successful: ${pingResult}\n`);

    // Test 2: SET/GET operations
    console.log('Test 2: SET/GET operations...');
    const testKey = 'upstash:connection:test';
    const testValue = JSON.stringify({
      timestamp: new Date().toISOString(),
      test: 'Upstash connectivity test',
    });

    await redis.setEx(testKey, 60, testValue); // 60 second TTL
    console.log(`✅ SET successful: ${testKey}`);

    const retrievedValue = await redis.get(testKey);
    console.log(`✅ GET successful: ${retrievedValue}\n`);

    // Test 3: Delete test key
    console.log('Test 3: Cleanup...');
    await redis.del(testKey);
    console.log(`✅ DEL successful: ${testKey}\n`);

    // Test 4: Check existing keys count
    console.log('Test 4: Scanning existing keys...');
    const [cursor, keys] = await redis.scan(0, { count: 100 });
    console.log(`✅ Found ${keys.length} existing keys in database`);

    if (keys.length > 0) {
      console.log(`\n📊 Sample keys (first 10):`);
      keys.slice(0, 10).forEach((key, i) => {
        console.log(`  ${i + 1}. ${key}`);
      });

      if (keys.length > 10) {
        console.log(`  ... and ${keys.length - 10} more`);
      }
    } else {
      console.log('  (Database is empty - this is a fresh Upstash instance)');
    }

    console.log('\n✅ All tests passed! Upstash connection is working correctly.');
    console.log('\n📝 Next steps:');

    if (keys.length === 0) {
      console.log('  ⚠️  Your Upstash instance is empty.');
      console.log('  → You may need to migrate data from your old Redis instance.');
      console.log('  → Run: npm run redis:check-old to inspect old Redis data');
    } else {
      console.log(`  ✓ Your Upstash instance has ${keys.length} keys.`);
      console.log('  → Verify this is expected data.');
    }
  } catch (error) {
    console.error('❌ Connection test failed:');
    console.error(error);
    console.error('\n💡 Troubleshooting:');
    console.error('  1. Check UPSTASH_REDIS_REST_URL is set correctly');
    console.error('  2. Check UPSTASH_REDIS_REST_TOKEN is set correctly');
    console.error('  3. Verify credentials in Upstash dashboard');
    process.exit(1);
  }
}

testUpstashConnection();
