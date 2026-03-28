#!/usr/bin/env node

/**
 * Redis Engagement Data Consolidation Script
 *
 * Fixes the "Building Event-Driven Architecture with Inngest" blog post
 * duplicate engagement data issue by consolidating:
 *
 * FROM (duplicates):
 * - likes:activity:building-event-driven-architecture
 * - likes:post:event-driven-architecture
 * - bookmarks:activity:building-event-driven-architecture
 * - bookmarks:post:event-driven-architecture
 *
 * TO (consolidated):
 * - likes:post:building-event-driven-architecture
 * - bookmarks:post:building-event-driven-architecture
 *
 * The correct slug is "building-event-driven-architecture" based on the
 * directory structure in src/content/blog/building-event-driven-architecture/
 */

import { Redis } from '@upstash/redis';
import { config } from 'dotenv';

config({ path: '.env.local' });

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const DRY_RUN = process.argv.includes('--dry-run');

if (!REDIS_URL || !REDIS_TOKEN) {
  console.error(
    '❌ UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN environment variables are required'
  );
  process.exit(1);
}

const client = new Redis({ url: REDIS_URL, token: REDIS_TOKEN });

const CORRECT_SLUG = 'building-event-driven-architecture';
const SHORT_SLUG = 'event-driven-architecture';

async function requestUserConfirmation() {
  const readline = await import('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) => {
    rl.question('\n   Continue? (y/N): ', resolve);
  });
  rl.close();
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

async function applyConsolidation(client, sourceKeys, targetKeys, totalLikes, totalBookmarks) {
  if (totalLikes > 0) {
    await client.set(targetKeys.likes, totalLikes);
    console.log(`   ✅ Set ${targetKeys.likes} = ${totalLikes}`);
  }

  if (totalBookmarks > 0) {
    await client.set(targetKeys.bookmarks, totalBookmarks);
    console.log(`   ✅ Set ${targetKeys.bookmarks} = ${totalBookmarks}`);
  }

  const keysToDelete = Object.values(sourceKeys);
  for (const key of keysToDelete) {
    const exists = await client.exists(key);
    if (exists === 1) {
      await client.del(key);
      console.log(`   🗑️  Deleted ${key}`);
    }
  }

  return keysToDelete;
}

async function consolidateEngagementData() {
  console.log(`\n🔄 Redis Engagement Data Consolidation`);
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE (will modify Redis)'}\n`);
  console.log('='.repeat(70) + '\n');

  try {
    console.log('✅ Connected to Redis\n');

    // Key mappings
    const sourceKeys = {
      activityLikes: `likes:activity:${CORRECT_SLUG}`,
      postLikes: `likes:post:${SHORT_SLUG}`,
      activityBookmarks: `bookmarks:activity:${CORRECT_SLUG}`,
      postBookmarks: `bookmarks:post:${SHORT_SLUG}`,
    };

    const targetKeys = {
      likes: `likes:post:${CORRECT_SLUG}`,
      bookmarks: `bookmarks:post:${CORRECT_SLUG}`,
    };

    console.log('🔍 CURRENT STATE:\n');

    // Check current values
    const currentValues = {};
    for (const [name, key] of Object.entries(sourceKeys)) {
      const value = await client.get(key);
      currentValues[name] = parseInt(value || '0', 10);
      console.log(`   ${key} = ${currentValues[name]}`);
    }

    // Check existing target values (important for multiple consolidation runs)
    const existingTarget = {
      likes: parseInt((await client.get(targetKeys.likes)) || '0', 10),
      bookmarks: parseInt((await client.get(targetKeys.bookmarks)) || '0', 10),
    };

    if (existingTarget.likes > 0 || existingTarget.bookmarks > 0) {
      console.log(`\n📋 EXISTING TARGET VALUES:`);
      console.log(`   ${targetKeys.likes} = ${existingTarget.likes} (current)`);
      console.log(`   ${targetKeys.bookmarks} = ${existingTarget.bookmarks} (current)`);
    }

    console.log(`\n📊 ANALYSIS:\n`);

    // Calculate totals (including existing target values)
    const totalLikes = currentValues.activityLikes + currentValues.postLikes + existingTarget.likes;
    const totalBookmarks =
      currentValues.activityBookmarks + currentValues.postBookmarks + existingTarget.bookmarks;

    console.log(
      `   Total Likes: ${currentValues.activityLikes} + ${currentValues.postLikes} + ${existingTarget.likes} (existing) = ${totalLikes}`
    );
    console.log(
      `   Total Bookmarks: ${currentValues.activityBookmarks} + ${currentValues.postBookmarks} + ${existingTarget.bookmarks} (existing) = ${totalBookmarks}`
    );

    console.log(`\n🎯 CONSOLIDATION PLAN:\n`);
    console.log(`   ${targetKeys.likes} = ${totalLikes}`);
    console.log(`   ${targetKeys.bookmarks} = ${totalBookmarks}`);
    console.log(`   DELETE: ${sourceKeys.activityLikes}`);
    console.log(`   DELETE: ${sourceKeys.postLikes}`);
    console.log(`   DELETE: ${sourceKeys.activityBookmarks}`);
    console.log(`   DELETE: ${sourceKeys.postBookmarks}`);

    if (totalLikes === 0 && totalBookmarks === 0) {
      console.log('\n⚠️  No engagement data found - nothing to consolidate');
      return;
    }

    if (DRY_RUN) {
      console.log(`\n🔒 DRY RUN MODE - No changes made`);
      console.log('   Run without --dry-run to apply changes');
      return;
    }

    // Confirm before proceeding
    console.log(`\n⚠️  About to consolidate ${totalLikes} likes and ${totalBookmarks} bookmarks`);
    console.log('   This will DELETE the duplicate keys and create consolidated ones');

    // Auto-proceed in CI/scripts, otherwise require confirmation
    if (!process.env.CI && !process.env.NODE_ENV?.includes('test')) {
      const confirmed = await requestUserConfirmation();
      if (!confirmed) {
        console.log('\n❌ Aborted by user');
        return;
      }
    }

    console.log(`\n🚀 APPLYING CONSOLIDATION...\n`);

    const deletedKeys = await applyConsolidation(
      client,
      sourceKeys,
      targetKeys,
      totalLikes,
      totalBookmarks
    );

    console.log(`\n✅ CONSOLIDATION COMPLETE!\n`);

    // Verify final state
    console.log('🔍 FINAL STATE:\n');
    const finalLikes = await client.get(targetKeys.likes);
    const finalBookmarks = await client.get(targetKeys.bookmarks);

    console.log(`   ${targetKeys.likes} = ${finalLikes || 0}`);
    console.log(`   ${targetKeys.bookmarks} = ${finalBookmarks || 0}`);

    console.log(`\n📈 SUMMARY:`);
    console.log(`   Consolidated ${totalLikes} likes and ${totalBookmarks} bookmarks`);
    console.log(`   Deleted ${deletedKeys.length} duplicate keys`);
    console.log(`   Post engagement data now unified under: ${CORRECT_SLUG}`);
  } catch (error) {
    console.error('\n❌ Error during consolidation:', error);
    process.exit(1);
  }
}

async function main() {
  await consolidateEngagementData();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { consolidateEngagementData };
