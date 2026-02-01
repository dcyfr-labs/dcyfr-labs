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

console.log('📊 Historical View Data Analysis\n');

// Check base view counters
const baseKeys = await redis.keys('views:post:*');
const baseViewKeys = baseKeys.filter((k) => !k.includes(':day:'));

let currentTotal = 0;
for (const key of baseViewKeys) {
  const value = await redis.get(key);
  currentTotal += parseInt(value || '0');
}

console.log('Current View Counters:');
console.log(`  Posts with views: ${baseViewKeys.length}`);
console.log(`  Total current views: ${currentTotal}`);

// Check view history (ZSETs contain historical data)
const historyKeys = await redis.keys('views:history:post:*');
let historicalTotal = 0;
const historyData = [];

console.log(`\nView History Keys: ${historyKeys.length}`);

for (const key of historyKeys) {
  const count = await redis.zcard(key);
  const postId = key.replace('views:history:post:', '');
  historicalTotal += count;
  if (count > 0) {
    historyData.push({ postId, events: count });
  }
}

console.log(`Total historical view events: ${historicalTotal}\n`);

// Show posts with most historical events
historyData.sort((a, b) => b.events - a.events);
console.log('Top posts by historical view events:\n');
historyData.slice(0, 10).forEach((item, i) => {
  console.log(`  ${i + 1}. ${item.postId}: ${item.events} events`);
});

// Check analytics keys
const analyticsKeys = await redis.keys('blog:analytics:*');
console.log(`\nBlog Analytics Keys: ${analyticsKeys.length}`);

console.log('\n' + '='.repeat(60));
console.log('\n📊 SUMMARY:\n');
console.log(`  Current view counters: ${currentTotal} views (${baseViewKeys.length} posts)`);
console.log(`  Historical tracking: ${historicalTotal} view events (${historyKeys.length} posts)`);
console.log(`  Analytics keys: ${analyticsKeys.length}`);

console.log('\n💡 NOTE:');
console.log('  If you expected hundreds of views, they may have been:');
console.log('  1. Stored in a different Redis database (preview/dev)');
console.log('  2. Counted from the historical events (ZSET keys)');
console.log('  3. Never persisted (only shown in Vercel Analytics)');
console.log('  4. Lost during a previous migration or cleanup');
