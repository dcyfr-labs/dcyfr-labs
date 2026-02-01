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

console.log('🔍 Analyzing View Counter vs History Mismatch\n');

const historyKeys = await redis.keys('views:history:post:*');

console.log(`Found ${historyKeys.length} history keys\n`);
console.log('Comparing counter values vs historical event counts:\n');

let totalCounterValue = 0;
let totalHistoryEvents = 0;
const mismatches = [];

for (const historyKey of historyKeys) {
  const postId = historyKey.replace('views:history:post:', '');
  const counterKey = `views:post:${postId}`;

  const counterValue = parseInt((await redis.get(counterKey)) || '0');
  const historyCount = await redis.zcard(historyKey);

  totalCounterValue += counterValue;
  totalHistoryEvents += historyCount;

  if (counterValue !== historyCount) {
    mismatches.push({
      postId,
      counter: counterValue,
      history: historyCount,
      diff: historyCount - counterValue,
    });
  }
}

console.log('='.repeat(60));
console.log('\n📊 TOTALS:\n');
console.log(`  Total from counters: ${totalCounterValue}`);
console.log(`  Total from history:  ${totalHistoryEvents}`);
console.log(`  Difference:          ${totalHistoryEvents - totalCounterValue}`);

if (mismatches.length > 0) {
  console.log(`\n⚠️  Found ${mismatches.length} posts with mismatched counts:\n`);

  mismatches.sort((a, b) => b.diff - a.diff);
  mismatches.forEach((item) => {
    console.log(`  ${item.postId}:`);
    console.log(`    Counter: ${item.counter}, History: ${item.history}, Missing: ${item.diff}`);
  });

  console.log('\n💡 DIAGNOSIS:');
  console.log('  The view counters (views:post:*) are out of sync with historical data.');
  console.log('  Historical tracking contains the actual view events.');
  console.log('  Counters may have been reset or not properly incremented.');

  console.log('\n🔧 RECOMMENDATION:');
  console.log('  Option 1: Sync counters from history (preserve historical data)');
  console.log('  Option 2: Keep current state (counters represent recent views only)');
} else {
  console.log('\n✅ All counters match their historical event counts!');
}
