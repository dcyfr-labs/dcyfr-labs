#!/usr/bin/env node
import dotenv from 'dotenv';
import { Redis } from '@upstash/redis';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const isDryRun = process.argv.includes('--dry-run');

console.log('🧹 Cleaning Up Orphaned View Keys\n');
if (isDryRun) {
  console.log('⚠️  DRY RUN MODE - No changes will be made\n');
}

// Manual mappings for posts that changed IDs
const manualMappings = {
  'post-20251222-ui-demo': 'demo-ui',
  'post-20251209-diagrams-0001': 'demo-diagrams',
  // These appear to be old test/demo posts that may not exist anymore
  // We'll consolidate them anyway in case the slugs match
};

let consolidated = 0;
let deleted = 0;
let totalViewsRecovered = 0;

console.log('Processing manual mappings...\n');

for (const [oldId, targetSlug] of Object.entries(manualMappings)) {
  const oldCounterKey = `views:post:${oldId}`;
  const oldHistoryKey = `views:history:post:${oldId}`;
  const newCounterKey = `views:post:${targetSlug}`;
  const newHistoryKey = `views:history:post:${targetSlug}`;

  // Consolidate counter
  const oldViews = parseInt((await redis.get(oldCounterKey)) || '0');
  if (oldViews > 0) {
    const currentViews = parseInt((await redis.get(newCounterKey)) || '0');
    const newTotal = currentViews + oldViews;

    console.log(`  ${oldId} -> ${targetSlug}`);
    console.log(`    Counter: ${oldViews} + ${currentViews} = ${newTotal}`);

    if (!isDryRun) {
      await redis.set(newCounterKey, newTotal);
      await redis.del(oldCounterKey);
    }
    consolidated++;
    totalViewsRecovered += oldViews;
  }

  // Consolidate history
  const events = await redis.zrange(oldHistoryKey, 0, -1, { withScores: true });
  if (events.length > 0) {
    const eventCount = events.length / 2;
    console.log(`    History: ${eventCount} events`);

    if (!isDryRun) {
      for (let i = 0; i < events.length; i += 2) {
        const member = events[i];
        const score = events[i + 1];
        await redis.zadd(newHistoryKey, { score, member });
      }
      await redis.del(oldHistoryKey);
    }
  }
}

// Delete truly orphaned keys (no mapping exists)
console.log('\nProcessing truly orphaned keys (will be deleted)...\n');

const orphanedIds = [
  'post-20251109-13d757f1',
  'post-20251111-0f8d0d08',
  'post-20251111-9632eff4',
  'post-20251218-asi2026',
  'post-20251218-ot10aa',
  'post-20251218-owasp-top10-agentic',
  'post-20251226-8581f290',
  'post-20260114-nodejs-security-cves',
  'project-dcyfr-labs-a1b2c3d4',
  'project-x64-e5f6g7h8',
];

for (const id of orphanedIds) {
  const counterKey = `views:post:${id}`;
  const historyKey = `views:history:post:${id}`;

  const views = parseInt((await redis.get(counterKey)) || '0');
  if (views > 0 || (await redis.exists(historyKey))) {
    console.log(`  ${id}: ${views} views (no mapping, will delete)`);

    if (!isDryRun) {
      await redis.del(counterKey);
      await redis.del(historyKey);
      deleted++;
    } else {
      deleted++;
    }
  }
}

console.log('\n' + '='.repeat(60));
console.log('\n📊 CLEANUP RESULTS:\n');

if (isDryRun) {
  console.log(`  Would consolidate: ${consolidated} mappable keys`);
  console.log(`  Would delete: ${deleted} truly orphaned keys`);
  console.log(`  Views to recover: ${totalViewsRecovered}`);
  console.log('\nRun without --dry-run to apply changes.');
} else {
  console.log(`  ✅ Consolidated: ${consolidated} mappable keys`);
  console.log(`  ✅ Deleted: ${deleted} truly orphaned keys`);
  console.log(`  ✅ Views recovered: ${totalViewsRecovered}`);
  console.log(`\n🎉 Cleanup complete!`);
}
