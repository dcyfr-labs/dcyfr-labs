#!/usr/bin/env node
/**
 * Inspect Old Redis Instance
 *
 * Connects to the original Redis instance (REDIS_URL) and provides
 * a comprehensive report of what data exists, so we can plan migration.
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

async function scanRedisKeys(client) {
  const allKeysArray = [];
  let scanCursor = '0';
  do {
    const result = await client.scan(scanCursor, { MATCH: '*', COUNT: 1000 });
    scanCursor = result.cursor.toString();
    allKeysArray.push(...result.keys);
  } while (scanCursor !== '0');
  return allKeysArray;
}

function groupKeysByPrefix(keys) {
  const keysByPrefix = new Map();
  for (const key of keys) {
    const prefix = key.split(':')[0];
    if (!keysByPrefix.has(prefix)) keysByPrefix.set(prefix, []);
    keysByPrefix.get(prefix).push(key);
  }
  return keysByPrefix;
}

async function printPrefixSummary(keysByPrefix, client) {
  console.log('📋 Keys by Prefix:\n');
  for (const [prefix, keys] of [...keysByPrefix.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${prefix}:* (${keys.length} keys)`);
    for (const sample of keys.slice(0, 3)) {
      const type = await client.type(sample);
      const ttl = await client.ttl(sample);
      const ttlStr = ttl === -1 ? 'no expiry' : ttl === -2 ? 'expired' : `${ttl}s`;
      console.log(`    - ${sample} (${type}, TTL: ${ttlStr})`);
    }
    if (keys.length > 3) console.log(`    ... and ${keys.length - 3} more`);
    console.log('');
  }
}

async function readKeyValue(client, type, key) {
  if (type === 'string') {
    const value = await client.get(key);
    const preview = value.length > 200 ? value.substring(0, 200) + '...' : value;
    console.log(`    ${preview}`);
  } else if (type === 'list') {
    const length = await client.lLen(key);
    const items = await client.lRange(key, 0, 2);
    console.log(`    Length: ${length}, First items:`, items);
  } else if (type === 'set') {
    const members = await client.sMembers(key);
    console.log(`    Members (${members.length}):`, members.slice(0, 3));
  } else if (type === 'zset') {
    const count = await client.zCard(key);
    const items = await client.zRange(key, 0, 2);
    console.log(`    Count: ${count}, First items:`, items);
  } else if (type === 'hash') {
    const all = await client.hGetAll(key);
    console.log(`    Fields:`, Object.keys(all).slice(0, 5));
  }
}

async function printPatternSamples(allKeysArray, client) {
  console.log('📄 Sample Data (first key of each type):\n');
  const importantPatterns = ['analytics:*', 'activity:*', 'github:*'];
  for (const pattern of importantPatterns) {
    const keys = allKeysArray.filter((k) => k.startsWith(pattern.replace('*', '')));
    if (keys.length === 0) continue;
    const sampleKey = keys[0];
    const type = await client.type(sampleKey);
    console.log(`  ${sampleKey} (${type}):`);
    try {
      await readKeyValue(client, type, sampleKey);
    } catch (error) {
      console.log(`    (Error reading: ${error.message})`);
    }
    console.log('');
  }
}

async function inspectOldRedis() {
  console.log('🔍 Inspecting Old Redis Instance...\n');

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.error('❌ REDIS_URL not found in environment variables');
    console.error('   Make sure .env.local has REDIS_URL configured');
    process.exit(1);
  }

  console.log(`📍 Connecting to: ${redisUrl.replace(/\/\/.*@/, '//***@')}\n`);

  const client = createClient({ url: redisUrl, socket: { connectTimeout: 10000 } });

  try {
    await client.connect();
    console.log('✅ Connected successfully\n');

    console.log('📊 Database Statistics:');
    const info = await client.info('keyspace');
    console.log(info || '  (No keyspace info available)');
    console.log('');

    console.log('🔑 Scanning all keys...');
    const allKeysArray = await scanRedisKeys(client);
    console.log(`\n📦 Total Keys: ${allKeysArray.length}\n`);

    if (allKeysArray.length === 0) {
      console.log('✨ Old Redis instance is empty - no migration needed!');
      await client.quit();
      return;
    }

    const keysByPrefix = groupKeysByPrefix(allKeysArray);
    await printPrefixSummary(keysByPrefix, client);
    await printPatternSamples(allKeysArray, client);

    console.log('\n💡 Migration Recommendation:\n');
    console.log(`  ⚠️  You have ${allKeysArray.length} keys in your old Redis instance.`);
    console.log('  → Migration is recommended to preserve existing data.');
    console.log('  → Run: npm run redis:migrate to migrate data to Upstash');

    await client.quit();
    console.log('\n✅ Inspection complete');
  } catch (error) {
    console.error('❌ Inspection failed:');
    console.error(error);
    console.error('\n💡 This may indicate:');
    console.error('  1. Old Redis instance is no longer accessible');
    console.error('  2. REDIS_URL credentials are incorrect');
    console.error('  3. Network connectivity issues');
    try { await client.quit(); } catch (e) { /* ignore */ }
    process.exit(1);
  }
}

inspectOldRedis();
