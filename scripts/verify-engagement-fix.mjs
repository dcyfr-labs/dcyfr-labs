#!/usr/bin/env node

/**
 * Verify Blog Post Engagement Fix
 *
 * Quick verification that the "Building Event-Driven Architecture with Inngest"
 * blog post now shows correct engagement counts after consolidation.
 */

import { Redis } from '@upstash/redis';
import { config } from 'dotenv';

config({ path: '.env.local' });

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const POST_SLUG = 'building-event-driven-architecture';

if (!REDIS_URL || !REDIS_TOKEN) {
  console.error(
    '❌ UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN environment variables are required'
  );
  process.exit(1);
}

async function verifyFix() {
  const client = new Redis({ url: REDIS_URL, token: REDIS_TOKEN });

  try {
    console.log('✅ Connected to Redis\n');

    // Check consolidated engagement data
    const likes = await client.get(`likes:post:${POST_SLUG}`);
    const bookmarks = await client.get(`bookmarks:post:${POST_SLUG}`);

    console.log('📊 Current Engagement for "Building Event-Driven Architecture with Inngest":');
    console.log(`   Likes: ${likes || 0}`);
    console.log(`   Bookmarks: ${bookmarks || 0}`);
    console.log(`   Total: ${parseInt(likes || '0') + parseInt(bookmarks || '0')}\n`);

    // Check for any remaining duplicate keys
    const duplicateKeys = [
      `likes:activity:${POST_SLUG}`,
      `likes:post:event-driven-architecture`,
      `bookmarks:activity:${POST_SLUG}`,
      `bookmarks:post:event-driven-architecture`,
    ];

    console.log('🔍 Checking for remaining duplicates:');
    let foundDuplicates = false;

    for (const key of duplicateKeys) {
      const exists = await client.exists(key);
      if (exists === 1) {
        const value = await client.get(key);
        console.log(`   ⚠️  ${key} = ${value} (should be deleted)`);
        foundDuplicates = true;
      }
    }

    if (!foundDuplicates) {
      console.log('   ✅ No duplicate keys found');
    }

    // Overall status
    const hasEngagement = parseInt(likes || '0') + parseInt(bookmarks || '0') > 0;

    console.log('\n📈 STATUS:');
    if (hasEngagement && !foundDuplicates) {
      console.log('   ✅ Fix successful - engagement data consolidated and visible');
    } else if (hasEngagement && foundDuplicates) {
      console.log('   ⚠️  Engagement data present but duplicates remain');
    } else if (!hasEngagement) {
      console.log('   ⚠️  No engagement data found - may need to restore from backup');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verifyFix().catch(console.error);
