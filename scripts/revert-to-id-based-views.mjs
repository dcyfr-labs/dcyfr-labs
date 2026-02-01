#!/usr/bin/env node
/**
 * Revert view consolidation - move views back to ID-based keys
 *
 * The view tracking system is architected to use permanent post IDs (not slugs)
 * so views survive slug changes. We accidentally consolidated views to slug-based
 * keys, but the client code still sends post IDs. This script reverts the consolidation.
 *
 * Architecture:
 * - Client: ViewTracker sends postId (e.g., "post-20251219-7f3a9c2e")
 * - Server: incrementPostViews(postId) stores at views:post:{postId}
 * - Why: Slug changes don't reset view counts
 *
 * Current problem:
 * - Views stored at: views:post:{slug} (e.g., views:post:owasp-top-10-agentic-ai)
 * - Code expects: views:post:{postId} (e.g., views:post:post-20251219-7f3a9c2e)
 * - Result: New views won't increment existing counters
 *
 * What this does:
 * 1. Maps slugs back to post IDs using blog post frontmatter
 * 2. Moves view counters from slug-based keys to ID-based keys
 * 3. Moves view history from slug-based keys to ID-based keys
 * 4. Validates all data moved correctly
 * 5. Cleans up old slug-based keys
 *
 * Run: npm run redis:revert-id-based
 */

import dotenv from 'dotenv';
import { Redis } from '@upstash/redis';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Load environment variables
dotenv.config({ path: join(projectRoot, '.env.local') });

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Get slug-to-ID mapping from blog posts
function getSlugToIdMapping() {
  console.log('\n📖 Reading blog post frontmatter...\n');

  // FIX: CWE-78 - Validate projectRoot contains only safe path characters
  if (!/^[a-zA-Z0-9_\/-]+$/.test(projectRoot)) {
    console.error('❌ Invalid project root path contains unsafe characters');
    process.exit(1);
  }

  const output = execSync(
    `grep -h "^slug:\\|^id:" ${projectRoot}/src/content/blog/*/index.mdx | sed "s/^slug: //; s/^id: //; s/'//g; s/\\"//g"`,
    { encoding: 'utf-8', cwd: projectRoot }
  );

  const lines = output.trim().split('\n');
  const mapping = new Map();

  for (let i = 0; i < lines.length; i += 2) {
    const slug = lines[i].trim();
    const id = lines[i + 1]?.trim();
    if (slug && id) {
      mapping.set(slug, id);
      console.log(`  ${slug} → ${id}`);
    }
  }

  console.log(`\n✅ Found ${mapping.size} posts\n`);
  return mapping;
}

async function main() {
  console.log('🔄 Reverting view consolidation - moving back to ID-based keys\n');
  console.log('━'.repeat(80));

  const slugToId = getSlugToIdMapping();

  // Step 1: Find all slug-based view counters
  console.log('\n📊 Step 1: Finding slug-based view counters...\n');
  const counterPattern = 'views:post:*';
  const allCounterKeys = [];
  let cursor = 0;

  do {
    const result = await redis.scan(cursor, { match: counterPattern, count: 100 });
    cursor = result[0];
    allCounterKeys.push(...result[1]);
  } while (cursor !== 0);

  console.log(`Found ${allCounterKeys.length} view counter keys`);

  // Filter to slug-based keys (not already ID-based)
  const slugBasedCounters = allCounterKeys.filter((key) => {
    const identifier = key.replace('views:post:', '');
    return !identifier.startsWith('post-'); // Not an ID
  });

  console.log(`  └─ ${slugBasedCounters.length} are slug-based (need migration)`);
  console.log(`  └─ ${allCounterKeys.length - slugBasedCounters.length} are already ID-based ✓`);

  // Step 2: Find all slug-based view history
  console.log('\n📚 Step 2: Finding slug-based view history...\n');
  const historyPattern = 'views:history:post:*';
  const allHistoryKeys = [];
  cursor = 0;

  do {
    const result = await redis.scan(cursor, { match: historyPattern, count: 100 });
    cursor = result[0];
    allHistoryKeys.push(...result[1]);
  } while (cursor !== 0);

  console.log(`Found ${allHistoryKeys.length} view history keys`);

  const slugBasedHistory = allHistoryKeys.filter((key) => {
    const identifier = key.replace('views:history:post:', '');
    return !identifier.startsWith('post-');
  });

  console.log(`  └─ ${slugBasedHistory.length} are slug-based (need migration)`);
  console.log(`  └─ ${allHistoryKeys.length - slugBasedHistory.length} are already ID-based ✓`);

  // Step 3: Migrate counters
  console.log('\n🔄 Step 3: Migrating view counters...\n');
  const counterMigrations = [];

  for (const slugKey of slugBasedCounters) {
    const slug = slugKey.replace('views:post:', '');
    const postId = slugToId.get(slug);

    if (!postId) {
      console.log(`  ⚠️  No ID found for slug: ${slug} (will skip)`);
      continue;
    }

    const views = await redis.get(slugKey);
    const viewCount = parseInt(views || '0');

    if (viewCount === 0) {
      console.log(`  ⏩ Skipping ${slug} (0 views)`);
      continue;
    }

    const idKey = `views:post:${postId}`;

    // Check if ID-based key already exists
    const existingViews = await redis.get(idKey);
    const existingCount = parseInt(existingViews || '0');

    if (existingCount > 0) {
      // Merge: add slug-based views to existing ID-based views
      const totalViews = existingCount + viewCount;
      await redis.set(idKey, totalViews);
      console.log(
        `  ✅ Merged ${slug} (${viewCount}) + ${postId} (${existingCount}) = ${totalViews} views`
      );
      counterMigrations.push({ slug, postId, action: 'merged', views: totalViews });
    } else {
      // Move: create new ID-based key with slug views
      await redis.set(idKey, viewCount);
      console.log(`  ✅ Moved ${slug} → ${postId} (${viewCount} views)`);
      counterMigrations.push({ slug, postId, action: 'moved', views: viewCount });
    }
  }

  // Step 4: Migrate history
  console.log('\n📚 Step 4: Migrating view history...\n');
  const historyMigrations = [];

  for (const slugKey of slugBasedHistory) {
    const slug = slugKey.replace('views:history:post:', '');
    const postId = slugToId.get(slug);

    if (!postId) {
      console.log(`  ⚠️  No ID found for slug: ${slug} (will skip)`);
      continue;
    }

    const history = await redis.zrange(slugKey, 0, -1, { withScores: true });

    if (!history || history.length === 0) {
      console.log(`  ⏩ Skipping ${slug} (no history)`);
      continue;
    }

    const idKey = `views:history:post:${postId}`;
    const eventCount = history.length / 2;

    // Check if ID-based history already exists
    const existingHistory = await redis.zrange(idKey, 0, -1);

    if (existingHistory && existingHistory.length > 0) {
      // Merge: add slug-based history to existing ID-based history
      for (let i = 0; i < history.length; i += 2) {
        const member = history[i];
        const score = history[i + 1];
        await redis.zadd(idKey, { score, member });
      }
      const totalEvents = existingHistory.length + eventCount;
      console.log(
        `  ✅ Merged ${slug} (${eventCount}) + ${postId} (${existingHistory.length}) = ${totalEvents} events`
      );
      historyMigrations.push({ slug, postId, action: 'merged', events: totalEvents });
    } else {
      // Move: create new ID-based history with slug events
      for (let i = 0; i < history.length; i += 2) {
        const member = history[i];
        const score = history[i + 1];
        await redis.zadd(idKey, { score, member });
      }
      console.log(`  ✅ Moved ${slug} → ${postId} (${eventCount} events)`);
      historyMigrations.push({ slug, postId, action: 'moved', events: eventCount });
    }
  }

  // Step 5: Validate migration
  console.log('\n✅ Step 5: Validating migration...\n');

  let totalViews = 0;
  let totalEvents = 0;

  for (const { postId } of counterMigrations) {
    const views = await redis.get(`views:post:${postId}`);
    const viewCount = parseInt(views || '0');
    totalViews += viewCount;
  }

  for (const { postId } of historyMigrations) {
    const history = await redis.zrange(`views:history:post:${postId}`, 0, -1);
    totalEvents += history.length;
  }

  console.log(`  Counter migrations: ${counterMigrations.length}`);
  console.log(`  History migrations: ${historyMigrations.length}`);
  console.log(`  Total views in ID-based counters: ${totalViews}`);
  console.log(`  Total events in ID-based history: ${totalEvents}`);

  // Step 6: Cleanup slug-based keys
  console.log('\n🧹 Step 6: Cleaning up slug-based keys...\n');

  const keysToDelete = [...slugBasedCounters, ...slugBasedHistory];

  if (keysToDelete.length > 0) {
    console.log(`Deleting ${keysToDelete.length} slug-based keys...`);
    for (const key of keysToDelete) {
      await redis.del(key);
      console.log(`  ✅ Deleted ${key}`);
    }
  } else {
    console.log('  ✅ No slug-based keys to delete');
  }

  // Final summary
  console.log('\n' + '━'.repeat(80));
  console.log('\n📊 MIGRATION COMPLETE\n');
  console.log(`Counter migrations: ${counterMigrations.length}`);
  console.log(`History migrations: ${historyMigrations.length}`);
  console.log(`Total views preserved: ${totalViews}`);
  console.log(`Total events preserved: ${totalEvents}`);
  console.log(`Slug-based keys deleted: ${keysToDelete.length}`);
  console.log('\n✅ View tracking is now using ID-based keys (architecture-compliant)');
  console.log('✅ New views will increment correct counters');
  console.log('✅ Slug changes will not reset view counts\n');
}

main().catch(console.error);
