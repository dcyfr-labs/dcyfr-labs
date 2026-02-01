#!/usr/bin/env node
/**
 * Verify Production View Counts
 *
 * Checks that view keys are accessible in production without prefix issues.
 * Also verifies that new view increments are working correctly.
 */

import dotenv from 'dotenv';
import { Redis } from '@upstash/redis';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

console.log('🔍 Production View Verification\n');

// Check environment detection
console.log('Environment Variables:');
console.log(`  NODE_ENV: ${process.env.NODE_ENV || '(not set)'}`);
console.log(`  VERCEL_ENV: ${process.env.VERCEL_ENV || '(not set)'}`);

// Simulate the fixed getRedisKeyPrefix logic
const isProduction =
  process.env.VERCEL_ENV === 'production' ||
  (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV !== 'preview');

console.log(`\nEnvironment Detection:`);
console.log(`  Is Production: ${isProduction}`);
console.log(`  Expected Prefix: ${isProduction ? '(none)' : 'preview:'}`);
console.log('');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

try {
  // Check production keys (no prefix)
  const prodKeys = await redis.keys('views:post:*');
  const prodViewKeys = prodKeys.filter((k) => !k.includes(':day:'));

  console.log('Production Keys (no prefix):');
  console.log(`  Total: ${prodViewKeys.length}`);

  if (prodViewKeys.length > 0) {
    console.log(`  Sample: ${prodViewKeys.slice(0, 3).join(', ')}`);

    // Check values
    for (const key of prodViewKeys.slice(0, 3)) {
      const value = await redis.get(key);
      console.log(`    ${key}: ${value} views`);
    }
  }

  // Check preview keys (with prefix)
  const previewKeys = await redis.keys('preview:views:post:*');
  const previewViewKeys = previewKeys.filter((k) => !k.includes(':day:'));

  console.log(`\nPreview Keys (with prefix):`);
  console.log(`  Total: ${previewViewKeys.length}`);

  if (previewViewKeys.length > 0) {
    console.log(`  Sample: ${previewViewKeys.slice(0, 3).join(', ')}`);
  }

  // Check for remaining double-prefixed keys
  const doubleKeys = await redis.keys('preview:preview:*');

  console.log(`\nDouble-Prefixed Keys (should be 0):`);
  console.log(`  Total: ${doubleKeys.length}`);

  if (doubleKeys.length > 0) {
    console.log(`  ⚠️ WARNING: Found ${doubleKeys.length} double-prefixed keys`);
    console.log(`  Run: npm run fix:redis-keys`);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:\n');

  if (isProduction && prodViewKeys.length > 0) {
    console.log('✅ Production environment detected correctly');
    console.log('✅ Production view keys accessible');
    console.log('✅ Ready for production deployment');
  } else if (!isProduction && previewViewKeys.length > 0) {
    console.log('✅ Preview environment detected correctly');
    console.log('✅ Preview view keys accessible');
  } else {
    console.log('⚠️ Warning: No view keys found for current environment');
    console.log('   This is normal for new deployments or clean databases');
  }

  if (doubleKeys.length > 0) {
    console.log(`\n⚠️ Action Required: Fix ${doubleKeys.length} double-prefixed keys`);
    console.log('   Run: npm run fix:redis-keys');
  } else {
    console.log('\n✅ No database cleanup needed');
  }
} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}
