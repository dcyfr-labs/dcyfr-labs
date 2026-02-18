#!/usr/bin/env node

/**
 * Migrate anonymized production data to preview/development databases
 *
 * Usage:
 *   node scripts/migrate-redis-data.mjs preview  # Copy to preview
 *   node scripts/migrate-redis-data.mjs dev      # Copy to development
 *
 * Environment variables required:
 *   UPSTASH_REDIS_REST_URL          - Production database URL
 *   UPSTASH_REDIS_REST_TOKEN        - Production database token
 *   UPSTASH_REDIS_REST_URL_PREVIEW  - Preview/Dev database URL
 *   UPSTASH_REDIS_REST_TOKEN_PREVIEW - Preview/Dev database token
 */

import { config } from 'dotenv';
import { Redis } from '@upstash/redis';

// Load .env.local for development
config({ path: '.env.local' });

const targetEnv = process.argv[2] || 'preview';

if (!['preview', 'dev'].includes(targetEnv)) {
  console.error('❌ Invalid target environment. Use: preview or dev');
  process.exit(1);
}

// Source: Production
const prodUrl = process.env.UPSTASH_REDIS_REST_URL;
const prodToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!prodUrl || !prodToken) {
  console.error('❌ Missing production Redis credentials');
  console.error('   Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
  process.exit(1);
}

const prodClient = new Redis({
  url: prodUrl,
  token: prodToken,
});

// Target: Preview or Development (same database, different key prefixes)
const targetUrl = process.env.UPSTASH_REDIS_REST_URL_PREVIEW;
const targetToken = process.env.UPSTASH_REDIS_REST_TOKEN_PREVIEW;

if (!targetUrl || !targetToken) {
  console.error('❌ Missing preview/dev Redis credentials');
  console.error('   Set UPSTASH_REDIS_REST_URL_PREVIEW and UPSTASH_REDIS_REST_TOKEN_PREVIEW');
  process.exit(1);
}

const targetClient = new Redis({ url: targetUrl, token: targetToken });

// Patterns to copy (non-sensitive data only)
const SAFE_PATTERNS = [
  'views:*', // View counts
  'shares:*', // Share counts
  'likes:*', // Like counts
  'bookmarks:*', // Bookmark counts
  'blog:*', // Blog-related data (trending, milestones, etc.)
  'active:*', // Activity tracking
  'activity:*', // Activity data
];

// Patterns to SKIP (sensitive data)
const SKIP_PATTERNS = [
  'session:*', // User sessions
  'ratelimit:*', // Rate limit state
  'security:*', // IP blocks, reputation
  'api:usage:*', // API usage tracking
];

/**
 * Migrate a single key from production to target environment by its Redis type.
 */
async function migrateKeyByType(key, type, ttl, targetKey) {
  switch (type) {
    case 'string': {
      const stringValue = await prodClient.get(key);
      if (stringValue === null) return false;
      if (ttl > 0) await targetClient.setex(targetKey, ttl, stringValue);
      else await targetClient.set(targetKey, stringValue);
      return true;
    }
    case 'hash': {
      const hashValue = await prodClient.hgetall(key);
      if (!hashValue || Object.keys(hashValue).length === 0) return false;
      await targetClient.hset(targetKey, hashValue);
      if (ttl > 0) await targetClient.expire(targetKey, ttl);
      return true;
    }
    case 'list': {
      const listValue = await prodClient.lrange(key, 0, -1);
      if (!listValue || listValue.length === 0) return false;
      await targetClient.rpush(targetKey, ...listValue);
      if (ttl > 0) await targetClient.expire(targetKey, ttl);
      return true;
    }
    case 'set': {
      const setValue = await prodClient.smembers(key);
      if (!setValue || setValue.length === 0) return false;
      await targetClient.sadd(targetKey, ...setValue);
      if (ttl > 0) await targetClient.expire(targetKey, ttl);
      return true;
    }
    case 'zset': {
      const zsetValue = await prodClient.zrange(key, 0, -1, { withScores: true });
      if (!zsetValue || zsetValue.length === 0) return false;
      const members = [];
      for (let i = 0; i < zsetValue.length; i += 2) {
        members.push({ score: zsetValue[i + 1], member: zsetValue[i] });
      }
      await targetClient.zadd(targetKey, ...members);
      if (ttl > 0) await targetClient.expire(targetKey, ttl);
      return true;
    }
    case 'none':
      console.log(`  ⚠️ Skipping ${key} (key doesn't exist)`);
      return false;
    default:
      console.log(`  ⚠️ Skipping ${key} (unsupported type: ${type})`);
      return false;
  }
}

/**
 * Migrate a single key from production to target environment.
 */
async function migrateKey(key, seenKeys, processedKeys, totalKeys) {
  if (seenKeys.has(key)) return { processedKeys, totalKeys };
  seenKeys.add(key);
  const newProcessed = processedKeys + 1;

  if (newProcessed % 50 === 0) {
    console.log(`  ⏳ Progress: ${newProcessed} keys processed, ${totalKeys} migrated`);
  }

  try {
    const type = await prodClient.type(key);
    const ttl = await prodClient.ttl(key);
    const targetKey =
      targetEnv === 'preview' ? `preview:migration:${key}` : `dev:migration:${key}`;
    const migrated = await migrateKeyByType(key, type, ttl, targetKey);
    return { processedKeys: newProcessed, totalKeys: totalKeys + (migrated ? 1 : 0) };
  } catch (error) {
    console.error(`  ❌ Error migrating key ${key}:`, error.message);
    return { processedKeys: newProcessed, totalKeys };
  }
}

/**
 * Migrate keys matching a pattern from production to target environment
 * @param {string} pattern - Redis key pattern (e.g., 'views:*')
 * @returns {Promise<number>} - Number of keys migrated
 */
async function migratePattern(pattern) {
  console.log(`📋 Migrating pattern: ${pattern}`);

  let cursor = 0;
  let totalKeys = 0;
  let processedKeys = 0;
  const seenKeys = new Set();
  let iterations = 0;
  const MAX_ITERATIONS = 1000;

  do {
    iterations++;
    if (iterations > MAX_ITERATIONS) {
      console.log(`  ⚠️ Stopping after ${iterations} iterations (safety limit)`);
      break;
    }

    try {
      const result = await prodClient.scan(cursor, { match: pattern, count: 100 });
      const [newCursor, keys] = Array.isArray(result) ? result : [0, []];
      console.log(`  📦 Batch ${iterations}: ${keys.length} keys (cursor: ${cursor} -> ${newCursor})`);

      if (keys.length === 0) { console.log(`  ℹ️ No keys found for this pattern`); break; }

      const newKeysFound = keys.filter((k) => !seenKeys.has(k)).length;
      if (newKeysFound === 0) { console.log(`  ✓ All keys processed (no new keys in this batch)`); break; }

      cursor = newCursor;

      for (const key of keys) {
        const result = await migrateKey(key, seenKeys, processedKeys, totalKeys);
        processedKeys = result.processedKeys;
        totalKeys = result.totalKeys;
      }
    } catch (error) {
      console.error(`  ❌ Error scanning pattern ${pattern}:`, error.message);
      break;
    }

    if (processedKeys > 10000) {
      console.log(`  ⚠️ Stopping after processing ${processedKeys} keys (safety limit)`);
      break;
    }
  } while (cursor !== 0);

  console.log(`✅ Migrated ${totalKeys} keys for ${pattern} (processed ${processedKeys} total)`);
  return totalKeys;
}

/**
 * Main migration function
 */
async function main() {
  console.log(`🚀 Starting migration to ${targetEnv} environment`);
  console.log(`📊 Source: Production database`);
  console.log(`🎯 Target: ${targetEnv} database\n`);

  let grandTotal = 0;

  for (const pattern of SAFE_PATTERNS) {
    const count = await migratePattern(pattern);
    grandTotal += count;
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`📊 Total keys migrated: ${grandTotal}`);
  console.log(`🎯 Target environment: ${targetEnv}`);
  console.log(`🔑 Key prefix: ${targetEnv}:migration:*`);
  console.log(`\n⚠️ SKIPPED sensitive patterns: ${SKIP_PATTERNS.join(', ')}`);
  console.log(`\n💡 Verify migration with:`);
  console.log(`   curl http://localhost:3000/api/health/redis`);
}

main().catch((error) => {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
});
