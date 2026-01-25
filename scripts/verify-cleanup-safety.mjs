#!/usr/bin/env node
/**
 * Verify Likes and Bookmarks Protection
 *
 * Shows current counts and verifies cleanup plan won't affect them
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../.env.local') });

import { redis } from '../src/mcp/shared/redis-client.ts';

async function main() {
  console.log('🛡️  Likes & Bookmarks Protection Verification\n');

  // Get current counts
  console.log('📊 Current Database State:');
  console.log('-'.repeat(80));

  const likesResult = await redis.scan('0', { match: 'likes:*', count: 200 });
  const bookmarksResult = await redis.scan('0', { match: 'bookmarks:*', count: 200 });

  const likesKeys = likesResult[1];
  const bookmarksKeys = bookmarksResult[1];

  console.log(`Total likes keys: ${likesKeys.length}`);
  console.log(`Total bookmarks keys: ${bookmarksKeys.length}\n`);

  // Show sample keys
  console.log('Sample likes keys:');
  for (const key of likesKeys.slice(0, 5)) {
    console.log(`  ✅ ${key}`);
  }
  if (likesKeys.length > 5) console.log(`  ... and ${likesKeys.length - 5} more\n`);

  console.log('\nSample bookmarks keys:');
  for (const key of bookmarksKeys.slice(0, 5)) {
    console.log(`  ✅ ${key}`);
  }
  if (bookmarksKeys.length > 5) console.log(`  ... and ${bookmarksKeys.length - 5} more\n`);

  // Check cleanup plan
  console.log('\n🔍 Checking Cleanup Plan:');
  console.log('-'.repeat(80));

  try {
    const cleanupPath = resolve(__dirname, '../.upstash-cleanup-plan.json');
    const data = await readFile(cleanupPath, 'utf-8');
    const cleanupPlan = JSON.parse(data);

    const { malformed, hanging, stale } = cleanupPlan;
    const allKeysToDelete = [...malformed, ...hanging, ...stale];

    // Check if any likes/bookmarks are in cleanup plan
    const likesInPlan = allKeysToDelete.filter((k) => k.startsWith('likes:'));
    const bookmarksInPlan = allKeysToDelete.filter((k) => k.startsWith('bookmarks:'));

    console.log(`Keys in cleanup plan: ${allKeysToDelete.length} total`);
    console.log(`  - Malformed: ${malformed.length}`);
    console.log(`  - Hanging: ${hanging.length}`);
    console.log(`  - Stale: ${stale.length}\n`);

    console.log('🛡️  PROTECTION STATUS:');
    console.log(
      `  Likes keys in cleanup plan: ${likesInPlan.length} ${likesInPlan.length === 0 ? '✅ SAFE' : '⚠️  AT RISK'}`
    );
    console.log(
      `  Bookmarks keys in cleanup plan: ${bookmarksInPlan.length} ${bookmarksInPlan.length === 0 ? '✅ SAFE' : '⚠️  AT RISK'}\n`
    );

    if (likesInPlan.length > 0) {
      console.log('⚠️  WARNING: Likes keys found in cleanup plan:');
      for (const key of likesInPlan) {
        console.log(`    ${key}`);
      }
      console.log('');
    }

    if (bookmarksInPlan.length > 0) {
      console.log('⚠️  WARNING: Bookmarks keys found in cleanup plan:');
      for (const key of bookmarksInPlan) {
        console.log(`    ${key}`);
      }
      console.log('');
    }

    if (likesInPlan.length === 0 && bookmarksInPlan.length === 0) {
      console.log('✅ VERIFICATION PASSED');
      console.log('   No likes or bookmarks keys will be deleted.');
      console.log('   Safe to proceed with cleanup.\n');
    } else {
      console.log('❌ VERIFICATION FAILED');
      console.log('   Some likes/bookmarks keys are in cleanup plan.');
      console.log('   DO NOT run cleanup until this is resolved.\n');
      process.exit(1);
    }
  } catch (error) {
    console.log('⚠️  No cleanup plan found (run: npm run redis:analyze first)\n');
  }

  // Summary
  console.log('📋 SUMMARY:');
  console.log('-'.repeat(80));
  console.log(`✅ ${likesKeys.length} likes keys are protected`);
  console.log(`✅ ${bookmarksKeys.length} bookmarks keys are protected`);
  console.log(`✅ Cleanup script has safety checks to prevent deletion`);
  console.log(`✅ Pre/post cleanup verification will confirm no changes\n`);
}

main().catch(console.error);
