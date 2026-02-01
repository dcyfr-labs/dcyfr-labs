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

console.log('🔧 Final Cleanup & Sync\n');

// Fix the remaining orphaned key
const orphanedId = 'post-20260114-b4f5e2c2';
const correctSlug = 'nodejs-vulnerabilities-january-2026';

console.log('1️⃣  Consolidating remaining orphaned key:\n');

const oldCounter = `views:post:${orphanedId}`;
const oldHistory = `views:history:post:${orphanedId}`;
const newCounter = `views:post:${correctSlug}`;
const newHistory = `views:history:post:${correctSlug}`;

const oldViews = parseInt((await redis.get(oldCounter)) || '0');
const currentViews = parseInt((await redis.get(newCounter)) || '0');

console.log(`   ${orphanedId} -> ${correctSlug}`);
console.log(`   Old views: ${oldViews}, Current views: ${currentViews}`);

if (oldViews > 0) {
  const newTotal = currentViews + oldViews;
  console.log(`   Setting new total: ${newTotal}`);
  await redis.set(newCounter, newTotal);
  await redis.del(oldCounter);
}

// Merge history
const events = await redis.zrange(oldHistory, 0, -1, { withScores: true });
if (events.length > 0) {
  console.log(`   Merging ${events.length / 2} history events`);
  for (let i = 0; i < events.length; i += 2) {
    await redis.zadd(newHistory, { score: events[i + 1], member: events[i] });
  }
  await redis.del(oldHistory);
}

// Sync counters from history for desynced posts
console.log('\n2️⃣  Syncing desynced counters from history:\n');

const desyncedPosts = [
  'cve-2025-55182-react2shell',
  'hardening-developer-portfolio',
  'passing-comptia-security-plus',
  'shipping-developer-portfolio',
];

for (const slug of desyncedPosts) {
  const counterKey = `views:post:${slug}`;
  const historyKey = `views:history:post:${slug}`;

  const currentCount = parseInt((await redis.get(counterKey)) || '0');
  const historyCount = await redis.zcard(historyKey);

  if (currentCount !== historyCount) {
    console.log(`   ${slug}: ${currentCount} -> ${historyCount}`);
    await redis.set(counterKey, historyCount);
  }
}

console.log('\n✅ Cleanup complete!\n');

// Run final verification
console.log('3️⃣  Final Verification:\n');

const allCounters = await redis.keys('views:post:*');
const activeCounters = allCounters.filter(
  (k) =>
    !k.includes(':day:') &&
    !k.includes(':history:') &&
    !k.includes('post:post-') &&
    !k.includes('post:project-')
);

const orphanedCounters = allCounters.filter(
  (k) =>
    !k.includes(':day:') &&
    !k.includes(':history:') &&
    (k.includes('post:post-') || k.includes('post:project-'))
);

let totalViews = 0;
for (const key of activeCounters) {
  totalViews += parseInt((await redis.get(key)) || '0');
}

console.log(`   Active counters: ${activeCounters.length}`);
console.log(`   Orphaned counters: ${orphanedCounters.length}`);
console.log(`   Total views: ${totalViews}`);

if (orphanedCounters.length === 0) {
  console.log('\n🎉 All orphaned keys cleaned up!');
  console.log('🎉 All counters synced with history!');
  console.log('🎉 View tracking system fully operational!');
}
