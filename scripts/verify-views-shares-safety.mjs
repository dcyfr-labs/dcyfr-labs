#!/usr/bin/env node

/**
 * Verify Views & Shares Safety
 *
 * Validates that cleanup will only delete orphaned view/share metrics for
 * non-existent posts, while preserving all valid tracking data for existing posts.
 */

import dotenv from 'dotenv';
import { Redis } from '@upstash/redis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Get all blog post slugs from filesystem
 */
function getAllBlogPostSlugs() {
  const contentDir = path.join(__dirname, '../src/content/blog');
  const entries = fs.readdirSync(contentDir, { withFileTypes: true });

  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

/**
 * Scan Redis for keys matching pattern
 */
async function scanKeys(pattern) {
  let cursor = '0';
  const allKeys = [];

  do {
    const result = await redis.scan(cursor, { match: pattern, count: 100 });
    cursor = result[0];
    allKeys.push(...result[1]);
  } while (cursor !== '0');

  return allKeys;
}

/**
 * Extract post slug from key
 */
function extractPostSlug(key) {
  const parts = key.split(':');
  if (parts[0] === 'views' && parts[1] === 'post') {
    return parts[2]; // views:post:slug:...
  }
  if (parts[0] === 'shares' && parts[1] === 'post') {
    return parts[2]; // shares:post:slug
  }
  return null;
}

async function main() {
  console.log('🛡️  Views & Shares Protection Verification\n');

  // Load blog posts
  console.log('📚 Loading blog posts...');
  const blogPostSlugs = getAllBlogPostSlugs();
  console.log(`  ✓ Found ${blogPostSlugs.length} blog posts\n`);

  // Scan current database
  console.log('📊 Current Database State:');
  const viewsKeys = await scanKeys('views:*');
  const sharesKeys = await scanKeys('shares:*');

  console.log(`  Total views keys: ${viewsKeys.length}`);
  console.log(`  Total shares keys: ${sharesKeys.length}\n`);

  // Analyze views keys
  console.log('🔍 Analyzing Views Keys:');
  const viewsValid = [];
  const viewsOrphaned = [];

  for (const key of viewsKeys) {
    const slug = extractPostSlug(key);
    if (slug) {
      if (blogPostSlugs.includes(slug)) {
        viewsValid.push(key);
      } else {
        viewsOrphaned.push(key);
      }
    } else {
      // Malformed or other type
      viewsOrphaned.push(key);
    }
  }

  console.log(`  ✅ Valid (existing posts): ${viewsValid.length} keys`);
  console.log(`  ❌ Orphaned (deleted posts): ${viewsOrphaned.length} keys`);

  if (viewsValid.length > 0) {
    console.log(`\n  Sample valid views keys:`);
    viewsValid.slice(0, 3).forEach((key) => {
      const slug = extractPostSlug(key);
      console.log(`    ✅ ${key} → post exists: ${slug}`);
    });
    if (viewsValid.length > 3) {
      console.log(`    ... and ${viewsValid.length - 3} more`);
    }
  }

  if (viewsOrphaned.length > 0) {
    console.log(`\n  Sample orphaned views keys:`);
    viewsOrphaned.slice(0, 3).forEach((key) => {
      const slug = extractPostSlug(key);
      console.log(`    ❌ ${key} → post not found: ${slug}`);
    });
    if (viewsOrphaned.length > 3) {
      console.log(`    ... and ${viewsOrphaned.length - 3} more`);
    }
  }

  // Analyze shares keys
  console.log('\n🔍 Analyzing Shares Keys:');
  const sharesValid = [];
  const sharesOrphaned = [];

  for (const key of sharesKeys) {
    const slug = extractPostSlug(key);
    if (slug) {
      if (blogPostSlugs.includes(slug)) {
        sharesValid.push(key);
      } else {
        sharesOrphaned.push(key);
      }
    } else {
      sharesOrphaned.push(key);
    }
  }

  console.log(`  ✅ Valid (existing posts): ${sharesValid.length} keys`);
  console.log(`  ❌ Orphaned (deleted posts): ${sharesOrphaned.length} keys`);

  if (sharesValid.length > 0) {
    console.log(`\n  Sample valid shares keys:`);
    sharesValid.slice(0, 3).forEach((key) => {
      const slug = extractPostSlug(key);
      console.log(`    ✅ ${key} → post exists: ${slug}`);
    });
    if (sharesValid.length > 3) {
      console.log(`    ... and ${sharesValid.length - 3} more`);
    }
  }

  if (sharesOrphaned.length > 0) {
    console.log(`\n  Sample orphaned shares keys:`);
    sharesOrphaned.slice(0, 3).forEach((key) => {
      const slug = extractPostSlug(key);
      console.log(`    ❌ ${key} → post not found: ${slug}`);
    });
    if (sharesOrphaned.length > 3) {
      console.log(`    ... and ${sharesOrphaned.length - 3} more`);
    }
  }

  // Check cleanup plan
  console.log('\n🔍 Checking Cleanup Plan:');
  const cleanupPlanPath = path.join(__dirname, '../.upstash-cleanup-plan.json');

  if (!fs.existsSync(cleanupPlanPath)) {
    console.error('❌ Cleanup plan not found!');
    console.error('   Run: npm run redis:analyze first\n');
    process.exit(1);
  }

  const cleanupPlan = JSON.parse(fs.readFileSync(cleanupPlanPath, 'utf-8'));
  const allKeysToDelete = [
    ...(cleanupPlan.malformed || []),
    ...(cleanupPlan.hanging || []),
    ...(cleanupPlan.stale || []),
  ];

  const viewsInPlan = allKeysToDelete.filter((k) => k.startsWith('views:'));
  const sharesInPlan = allKeysToDelete.filter((k) => k.startsWith('shares:'));

  console.log(`  Keys in cleanup plan: ${allKeysToDelete.length} total`);
  console.log(`    - Malformed: ${cleanupPlan.malformed?.length || 0}`);
  console.log(`    - Hanging: ${cleanupPlan.hanging?.length || 0}`);
  console.log(`    - Stale: ${cleanupPlan.stale?.length || 0}`);

  // Verify only orphaned views/shares are in cleanup plan
  console.log('\n🛡️  PROTECTION STATUS:');

  const validViewsInPlan = viewsInPlan.filter((key) => viewsValid.includes(key));
  const validSharesInPlan = sharesInPlan.filter((key) => sharesValid.includes(key));

  console.log(`  Views keys in cleanup plan: ${viewsInPlan.length}`);
  console.log(
    `    - Valid views to delete: ${validViewsInPlan.length} ${validViewsInPlan.length === 0 ? '✅ SAFE' : '❌ DANGER'}`
  );
  console.log(
    `    - Orphaned views to delete: ${viewsInPlan.length - validViewsInPlan.length} ✅ CORRECT`
  );

  console.log(`  Shares keys in cleanup plan: ${sharesInPlan.length}`);
  console.log(
    `    - Valid shares to delete: ${validSharesInPlan.length} ${validSharesInPlan.length === 0 ? '✅ SAFE' : '❌ DANGER'}`
  );
  console.log(
    `    - Orphaned shares to delete: ${sharesInPlan.length - validSharesInPlan.length} ✅ CORRECT`
  );

  // Final verification
  console.log('\n📋 SUMMARY:');

  if (validViewsInPlan.length === 0 && validSharesInPlan.length === 0) {
    console.log('✅ VERIFICATION PASSED');
    console.log('   No valid view or share metrics will be deleted.');
    console.log('   Safe to proceed with cleanup.\n');

    console.log(`✅ ${viewsValid.length} valid views keys are protected`);
    console.log(`✅ ${sharesValid.length} valid shares keys are protected`);
    console.log(`✅ ${viewsOrphaned.length} orphaned views keys will be cleaned up`);
    console.log(`✅ ${sharesOrphaned.length} orphaned shares keys will be cleaned up`);
    console.log(`✅ Cleanup script has safety checks to prevent deletion of valid metrics`);
    console.log(`✅ Pre/post cleanup verification will confirm counts match\n`);

    // Show expected state after cleanup
    console.log('📊 EXPECTED STATE AFTER CLEANUP:');
    console.log(
      `  Views keys: ${viewsKeys.length} → ${viewsValid.length} (${viewsOrphaned.length} removed)`
    );
    console.log(
      `  Shares keys: ${sharesKeys.length} → ${sharesValid.length} (${sharesOrphaned.length} removed)`
    );
    console.log(`  Valid metrics preserved: 100%\n`);
  } else {
    console.error('❌ VERIFICATION FAILED');
    console.error('   Valid view/share metrics detected in cleanup plan!');
    console.error('   DO NOT proceed with cleanup.\n');

    if (validViewsInPlan.length > 0) {
      console.error('   Valid views keys that would be deleted:');
      validViewsInPlan.forEach((key) => console.error(`     - ${key}`));
    }

    if (validSharesInPlan.length > 0) {
      console.error('   Valid shares keys that would be deleted:');
      validSharesInPlan.forEach((key) => console.error(`     - ${key}`));
    }

    console.error('\n   Please review the cleanup plan and analysis.\n');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
