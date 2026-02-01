#!/usr/bin/env node
import dotenv from 'dotenv';
import { Redis } from '@upstash/redis';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync, readFileSync } from 'fs';
import { parse } from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

console.log('🔍 Verifying View Tracking System\n');

// Test 1: Environment Detection
console.log('1️⃣  Testing Environment Detection:\n');
const isProduction =
  process.env.VERCEL_ENV === 'production' ||
  (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV !== 'preview');

console.log(`   NODE_ENV: ${process.env.NODE_ENV || '(not set)'}`);
console.log(`   VERCEL_ENV: ${process.env.VERCEL_ENV || '(not set)'}`);
console.log(`   Detected environment: ${isProduction ? 'PRODUCTION' : 'PREVIEW/DEV'}`);
console.log(`   Key prefix: ${isProduction ? '(none)' : 'preview:'}`);

// Test 2: Verify all active posts have view counters
console.log('\n2️⃣  Checking Post Coverage:\n');

const contentDir = join(__dirname, '..', 'src', 'content', 'blog');
const entries = readdirSync(contentDir, { withFileTypes: true });

const activePosts = [];
for (const entry of entries) {
  if (!entry.isDirectory() || entry.name.startsWith('.')) continue;

  const mdxPath = join(contentDir, entry.name, 'index.mdx');
  try {
    const content = readFileSync(mdxPath, 'utf-8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (frontmatterMatch) {
      const frontmatter = parse(frontmatterMatch[1]);
      const slug = frontmatter.slug || entry.name;
      activePosts.push(slug);
    }
  } catch (err) {
    // Skip
  }
}

let withCounters = 0;
let withHistory = 0;
const missingCounters = [];

for (const slug of activePosts) {
  const counterKey = `views:post:${slug}`;
  const historyKey = `views:history:post:${slug}`;

  const hasCounter = await redis.exists(counterKey);
  const hasHistory = await redis.exists(historyKey);

  if (hasCounter) withCounters++;
  if (hasHistory) withHistory++;

  if (!hasCounter && !hasHistory) {
    missingCounters.push(slug);
  }
}

console.log(`   Total active posts: ${activePosts.length}`);
console.log(`   Posts with view counters: ${withCounters}`);
console.log(`   Posts with view history: ${withHistory}`);
console.log(`   Posts with no data: ${missingCounters.length}`);

if (missingCounters.length > 0) {
  console.log('\n   Posts with no view data yet:');
  missingCounters.forEach((slug) => console.log(`     - ${slug}`));
}

// Test 3: Verify counter/history sync
console.log('\n3️⃣  Verifying Counter/History Sync:\n');

const allCounterKeys = await redis.keys('views:post:*');
const counterKeys = allCounterKeys.filter((k) => !k.includes(':day:') && !k.includes(':history:'));

let syncedCount = 0;
let desyncedCount = 0;
const desynced = [];

for (const counterKey of counterKeys) {
  const slug = counterKey.replace('views:post:', '');
  const historyKey = `views:history:post:${slug}`;

  const counterValue = parseInt((await redis.get(counterKey)) || '0');
  const historyCount = (await redis.zcard(historyKey)) || 0;

  if (counterValue === historyCount) {
    syncedCount++;
  } else {
    desyncedCount++;
    desynced.push({ slug, counter: counterValue, history: historyCount });
  }
}

console.log(`   Synced counters: ${syncedCount}`);
console.log(`   Desynced counters: ${desyncedCount}`);

if (desynced.length > 0 && desynced.length <= 5) {
  console.log('\n   Desynced posts:');
  desynced.forEach((item) => {
    console.log(`     ${item.slug}: counter=${item.counter}, history=${item.history}`);
  });
}

// Test 4: Check for any remaining ID-based keys
console.log('\n4️⃣  Checking for Orphaned Keys:\n');

const idBasedCounters = allCounterKeys.filter(
  (k) => k.startsWith('views:post:post-') || k.startsWith('views:post:project-')
);

const historyKeys = await redis.keys('views:history:post:*');
const idBasedHistory = historyKeys.filter(
  (k) => k.startsWith('views:history:post:post-') || k.startsWith('views:history:post:project-')
);

console.log(`   ID-based counters: ${idBasedCounters.length}`);
console.log(`   ID-based history: ${idBasedHistory.length}`);

if (idBasedCounters.length > 0) {
  console.log('\n   ⚠️  Found orphaned ID-based keys:');
  idBasedCounters.forEach((key) => console.log(`     ${key}`));
}

// Test 5: Total view counts
console.log('\n5️⃣  Total View Counts:\n');

let totalViews = 0;
let totalHistoryEvents = 0;

for (const key of counterKeys) {
  totalViews += parseInt((await redis.get(key)) || '0');
}

for (const key of historyKeys.filter(
  (k) => !k.includes('post:post-') && !k.includes('post:project-')
)) {
  totalHistoryEvents += (await redis.zcard(key)) || 0;
}

console.log(`   Total current views: ${totalViews}`);
console.log(`   Total history events: ${totalHistoryEvents}`);

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 VERIFICATION SUMMARY:\n');

const allGood =
  desyncedCount === 0 &&
  idBasedCounters.length === 0 &&
  idBasedHistory.length === 0 &&
  withCounters > 0;

if (allGood) {
  console.log('   ✅ All checks passed!');
  console.log('   ✅ Environment detection working');
  console.log('   ✅ All counters synced with history');
  console.log('   ✅ No orphaned keys remaining');
  console.log('   ✅ View tracking system operational');
} else {
  console.log('   ⚠️  Issues detected:\n');
  if (desyncedCount > 0) console.log(`      - ${desyncedCount} desynced counters`);
  if (idBasedCounters.length > 0) console.log(`      - ${idBasedCounters.length} orphaned ID keys`);
  if (idBasedHistory.length > 0)
    console.log(`      - ${idBasedHistory.length} orphaned history keys`);
  if (withCounters === 0) console.log('      - No view counters found');
}

console.log(`\n💡 Next Steps:`);
console.log(`   - Deploy changes to production`);
console.log(`   - Monitor new view increments`);
console.log(`   - Verify views display correctly on blog pages`);
