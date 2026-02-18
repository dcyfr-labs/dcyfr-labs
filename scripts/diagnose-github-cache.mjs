#!/usr/bin/env node
/**
 * Diagnose GitHub Data Cache Issues
 *
 * Checks:
 * 1. Redis connection
 * 2. Cache key existence
 * 3. Environment prefix configuration
 * 4. Cache data validity
 */

import { Redis } from '@upstash/redis';
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

// Determine environment
function getEnvironment() {
  const isProduction = process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production';
  const isPreview = process.env.VERCEL_ENV === 'preview';
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isProduction) return 'production';
  if (isPreview) return 'preview';
  if (isDevelopment) return 'development';
  return 'unknown';
}

// Get Redis key prefix
function getKeyPrefix() {
  const env = getEnvironment();

  if (env === 'production') return '';
  if (env === 'preview') {
    const prNumber = process.env.VERCEL_GIT_PULL_REQUEST_ID || 'preview';
    return `preview:${prNumber}:`;
  }
  if (env === 'development') {
    const username = process.env.USER || process.env.USERNAME || 'dev';
    return `dev:${username}:`;
  }
  return 'unknown:';
}

/**
 * Check Redis credentials and return redisUrl + redisToken for the environment.
 * Exits if credentials are missing.
 */
function resolveRedisCredentials(environment) {
  const hasProductionCreds = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
  const hasPreviewCreds = !!(process.env.UPSTASH_REDIS_REST_URL_PREVIEW && process.env.UPSTASH_REDIS_REST_TOKEN_PREVIEW);

  console.log('🔑 Redis Configuration:');
  console.log(`   Production credentials: ${hasProductionCreds ? '✅' : '❌'}`);
  console.log(`   Preview credentials: ${hasPreviewCreds ? '✅' : '❌'}`);

  let redisUrl, redisToken;
  if (environment === 'production') {
    redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  } else {
    redisUrl = process.env.UPSTASH_REDIS_REST_URL_PREVIEW || process.env.UPSTASH_REDIS_REST_URL;
    redisToken = process.env.UPSTASH_REDIS_REST_TOKEN_PREVIEW || process.env.UPSTASH_REDIS_REST_TOKEN;
  }

  if (!redisUrl || !redisToken) {
    console.error('\n❌ ERROR: No Redis credentials available for this environment');
    console.error('   Please configure environment variables:');
    if (environment === 'production') {
      console.error('   - UPSTASH_REDIS_REST_URL');
      console.error('   - UPSTASH_REDIS_REST_TOKEN');
    } else {
      console.error('   - UPSTASH_REDIS_REST_URL_PREVIEW (or fallback to production)');
      console.error('   - UPSTASH_REDIS_REST_TOKEN_PREVIEW (or fallback to production)');
    }
    process.exit(1);
  }

  console.log(`   Using: ${environment === 'production' ? 'Production' : 'Preview'} Redis`);
  console.log(`   URL: ${redisUrl.substring(0, 30)}...`);
  console.log('');
  return { redisUrl, redisToken };
}

/**
 * Check the prefixed and un-prefixed cache keys for a given cacheKey.
 * Returns `{ mainCacheWithPrefix, mainCacheNoPrefix }`.
 */
async function checkCacheKeys(redis, keyPrefix, cacheKey) {
  console.log(`   Key: ${keyPrefix}${cacheKey}`);
  const mainCacheWithPrefix = await redis.get(keyPrefix + cacheKey);
  console.log(`   Status: ${mainCacheWithPrefix ? '✅ EXISTS' : '❌ NOT FOUND'}`);
  if (mainCacheWithPrefix) {
    try {
      const data = JSON.parse(mainCacheWithPrefix);
      console.log(`   Total Contributions: ${data.totalContributions}`);
      console.log(`   Last Updated: ${data.lastUpdated}`);
      console.log(`   Source: ${data.source}`);
    } catch (_e) {
      console.log(`   ⚠️  Data is not valid JSON`);
    }
  }
  console.log('');

  console.log(`   Key (no prefix): ${cacheKey}`);
  const mainCacheNoPrefix = await redis.get(cacheKey);
  console.log(`   Status: ${mainCacheNoPrefix ? '✅ EXISTS' : '❌ NOT FOUND'}`);
  if (mainCacheNoPrefix && mainCacheNoPrefix !== mainCacheWithPrefix) {
    console.log(`   ⚠️  Data exists but at different key!`);
    try {
      const data = JSON.parse(mainCacheNoPrefix);
      console.log(`   Total Contributions: ${data.totalContributions}`);
      console.log(`   Last Updated: ${data.lastUpdated}`);
    } catch (_e) {
      console.log(`   Data is not valid JSON`);
    }
  }
  console.log('');
  return { mainCacheWithPrefix, mainCacheNoPrefix };
}

/**
 * Print recommendations based on cache state.
 */
function printRecommendations(mainCacheWithPrefix, mainCacheNoPrefix) {
  console.log('💡 Recommendations:\n');
  if (!mainCacheWithPrefix && !mainCacheNoPrefix) {
    console.log('   ❌ Cache is empty. Possible causes:');
    console.log('      1. Inngest function has not run yet');
    console.log('      2. Inngest is configured for different environment');
    console.log('      3. Cache expired (1 hour TTL)');
    console.log('      4. Redis connection issue during write');
    console.log('');
    console.log('   🔧 Solutions:');
    console.log('      - Trigger manual refresh: Send event "github/data.refresh"');
    console.log('      - Check Inngest dashboard for function logs');
    console.log('      - Verify Inngest environment variables match this environment');
  } else if (mainCacheNoPrefix && !mainCacheWithPrefix) {
    console.log('   ⚠️  Key exists without prefix!');
    console.log('      This means data was written without environment prefix');
    console.log('      but app is trying to read WITH prefix.');
    console.log('');
    console.log('   🔧 Solution:');
    console.log('      - Ensure Inngest and app use same Redis client');
    console.log('      - Check that both import from @/mcp/shared/redis-client');
  } else {
    console.log('   ✅ Cache is healthy!');
    console.log('      Data exists and should be accessible by the app.');
    console.log('');
    console.log('   If you\'re still seeing cache misses:');
    console.log('      - Check app is running in same environment');
    console.log('      - Verify Redis client import paths');
    console.log('      - Check for connection errors in app logs');
  }
}

async function diagnose() {
  console.log('🔍 GitHub Cache Diagnostics\n');

  const environment = getEnvironment();
  const keyPrefix = getKeyPrefix();

  console.log('📍 Environment Information:');
  console.log(`   Environment: ${environment}`);
  console.log(`   Key Prefix: ${keyPrefix || '(none - production)'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   VERCEL_ENV: ${process.env.VERCEL_ENV || '(not set)'}`);
  console.log('');

  const { redisUrl, redisToken } = resolveRedisCredentials(environment);

  console.log('📡 Connecting to Redis...');
  const redis = new Redis({ url: redisUrl, token: redisToken });
  try {
    await redis.ping();
    console.log('   ✅ Connected successfully\n');
  } catch (error) {
    console.error('   ❌ Connection failed:', error.message);
    process.exit(1);
  }

  const cacheKey = 'github:contributions:dcyfr';
  const fallbackKey = 'github:fallback-data';

  console.log('🔎 Checking Cache Keys:\n');
  const { mainCacheWithPrefix, mainCacheNoPrefix } = await checkCacheKeys(redis, keyPrefix, cacheKey);

  console.log(`   Fallback Key: ${keyPrefix}${fallbackKey}`);
  const fallbackCache = await redis.get(keyPrefix + fallbackKey);
  console.log(`   Status: ${fallbackCache ? '✅ EXISTS' : '❌ NOT FOUND'}`);
  console.log('');

  console.log('📋 All GitHub-related keys:\n');
  try {
    const pattern = keyPrefix ? `${keyPrefix}github:*` : 'github:*';
    console.log(`   Scanning for pattern: ${pattern}`);
    console.log('   (Note: Full key scan not available via Upstash REST API)');
    console.log('   Checked keys:');
    console.log(`   - ${keyPrefix}${cacheKey}: ${mainCacheWithPrefix ? 'EXISTS' : 'MISSING'}`);
    console.log(`   - ${keyPrefix}${fallbackKey}: ${fallbackCache ? 'EXISTS' : 'MISSING'}`);
  } catch (error) {
    console.log(`   ⚠️  Could not scan keys: ${error.message}`);
  }
  console.log('');

  printRecommendations(mainCacheWithPrefix, mainCacheNoPrefix);
  console.log('\n✅ Diagnosis complete\n');
}

diagnose().catch((error) => {
  console.error('❌ Diagnostic failed:', error);
  process.exit(1);
});
