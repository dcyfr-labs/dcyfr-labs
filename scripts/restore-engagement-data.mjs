#!/usr/bin/env node

/**
 * Restore Missing Engagement Data
 *
 * Fixes the data loss that occurred during consolidation due to script bug.
 *
 * Original totals (from consolidation logs):
 * - First run: 2 likes + 1 bookmark
 * - Second run: 1 additional like found
 * - Expected total: 3 likes + 1 bookmark
 * - Current actual: 1 like + 1 bookmark
 * - Missing: 2 likes
 */

import { createClient } from 'redis';
import { config } from 'dotenv';

config({ path: '.env.local' });

const REDIS_URL = process.env.REDIS_URL;
const POST_SLUG = 'building-event-driven-architecture';

if (!REDIS_URL) {
  console.error('❌ REDIS_URL environment variable is required');
  process.exit(1);
}

async function restoreMissingData() {
  const client = createClient({ url: REDIS_URL });

  try {
    await client.connect();
    console.log('✅ Connected to Redis\n');

    console.log('🔍 ENGAGEMENT DATA LOSS ANALYSIS:\n');

    // Current state
    const currentLikes = await client.get(`likes:post:${POST_SLUG}`);
    const currentBookmarks = await client.get(`bookmarks:post:${POST_SLUG}`);

    console.log('Current state:');
    console.log(`   Likes: ${currentLikes || 0}`);
    console.log(`   Bookmarks: ${currentBookmarks || 0}`);

    console.log('\nExpected state (from consolidation logs):');
    console.log('   Likes: 3 (2 from first run + 1 from second run)');
    console.log('   Bookmarks: 1');
    console.log('   Total: 4');

    const expectedLikes = 3;
    const expectedBookmarks = 1;
    const currentLikesNum = parseInt(currentLikes || '0', 10);
    const currentBookmarksNum = parseInt(currentBookmarks || '0', 10);

    const missingLikes = expectedLikes - currentLikesNum;
    const missingBookmarks = expectedBookmarks - currentBookmarksNum;

    console.log('\nMissing data:');
    console.log(`   Missing likes: ${missingLikes}`);
    console.log(`   Missing bookmarks: ${missingBookmarks}`);

    if (missingLikes === 0 && missingBookmarks === 0) {
      console.log('\n✅ No data restoration needed');
      return;
    }

    console.log('\n🔧 RESTORATION PLAN:');
    console.log(`   Set likes:post:${POST_SLUG} = ${expectedLikes}`);
    console.log(`   Set bookmarks:post:${POST_SLUG} = ${expectedBookmarks}`);

    // Restore correct values
    await client.set(`likes:post:${POST_SLUG}`, expectedLikes);
    await client.set(`bookmarks:post:${POST_SLUG}`, expectedBookmarks);

    console.log('\n✅ RESTORATION COMPLETE!\n');

    // Verify
    const verifiedLikes = await client.get(`likes:post:${POST_SLUG}`);
    const verifiedBookmarks = await client.get(`bookmarks:post:${POST_SLUG}`);

    console.log('🔍 VERIFIED FINAL STATE:');
    console.log(`   Likes: ${verifiedLikes}`);
    console.log(`   Bookmarks: ${verifiedBookmarks}`);
    console.log(`   Total: ${parseInt(verifiedLikes || '0') + parseInt(verifiedBookmarks || '0')}`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.disconnect();
  }
}

restoreMissingData().catch(console.error);
