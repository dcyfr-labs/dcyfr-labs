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

console.log('🔄 Syncing View Counters from Historical Data\n');
if (isDryRun) {
  console.log('⚠️  DRY RUN MODE - No changes will be made\n');
}

const historyKeys = await redis.keys('views:history:post:*');
console.log(`Found ${historyKeys.length} historical tracking keys\n`);

let synced = 0;
let alreadyMatched = 0;
let totalViewsRestored = 0;

for (const historyKey of historyKeys) {
  const postId = historyKey.replace('views:history:post:', '');
  const counterKey = `views:post:${postId}`;

  const currentValue = parseInt((await redis.get(counterKey)) || '0');
  const historyCount = await redis.zcard(historyKey);

  if (currentValue !== historyCount) {
    const diff = historyCount - currentValue;
    console.log(`  ${postId}:`);
    console.log(`    Current: ${currentValue}, History: ${historyCount}, Restoring: +${diff}`);

    if (!isDryRun) {
      await redis.set(counterKey, historyCount);
      synced++;
      totalViewsRestored += diff;
    } else {
      synced++;
      totalViewsRestored += diff;
    }
  } else {
    alreadyMatched++;
  }
}

console.log('\n' + '='.repeat(60));
console.log('\n📊 SYNC RESULTS:\n');

if (isDryRun) {
  console.log(`  Would sync: ${synced} counters`);
  console.log(`  Already matched: ${alreadyMatched} counters`);
  console.log(`  Views to restore: ${totalViewsRestored}`);
  console.log('\nRun without --dry-run to apply changes.');
} else {
  console.log(`  ✅ Synced: ${synced} counters`);
  console.log(`  ✅ Already matched: ${alreadyMatched} counters`);
  console.log(`  ✅ Views restored: ${totalViewsRestored}`);
  console.log(`\n🎉 View counters successfully synced from historical data!`);
}
