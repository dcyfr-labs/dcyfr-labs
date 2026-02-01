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

const isDryRun = process.argv.includes('--dry-run');

console.log('🔄 Consolidating ID-based Views to Slug-based Views\n');
if (isDryRun) {
  console.log('⚠️  DRY RUN MODE - No changes will be made\n');
}

// Build ID -> slug mapping
const contentDir = join(__dirname, '..', 'src', 'content', 'blog');
const entries = readdirSync(contentDir, { withFileTypes: true });

const idToSlug = {};
const slugs = new Set();

for (const entry of entries) {
  if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'README.md') continue;

  const mdxPath = join(contentDir, entry.name, 'index.mdx');
  try {
    const content = readFileSync(mdxPath, 'utf-8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (frontmatterMatch) {
      const frontmatter = parse(frontmatterMatch[1]);
      const slug = frontmatter.slug || entry.name;
      const id = frontmatter.id;

      if (id) {
        idToSlug[id] = slug;
        slugs.add(slug);
      }
    }
  } catch (err) {
    // Skip
  }
}

console.log(`Found ${Object.keys(idToSlug).length} ID->slug mappings\n`);

// Get all view keys
const allViewKeys = await redis.keys('views:*');
const idBasedCounters = allViewKeys.filter(
  (k) => k.startsWith('views:post:post-') && !k.includes(':day:') && !k.includes(':history:')
);
const idBasedHistory = allViewKeys.filter((k) => k.startsWith('views:history:post:post-'));

let consolidatedCounters = 0;
let consolidatedHistory = 0;
let totalViewsMoved = 0;
let totalEventsMoved = 0;

console.log('Processing view counters...\n');

for (const idKey of idBasedCounters) {
  const id = idKey.replace('views:post:', '');
  const targetSlug = idToSlug[id];

  if (targetSlug) {
    const slugKey = `views:post:${targetSlug}`;
    const idViews = parseInt((await redis.get(idKey)) || '0');
    const slugViews = parseInt((await redis.get(slugKey)) || '0');
    const newTotal = slugViews + idViews;

    console.log(`  ${id} -> ${targetSlug}`);
    console.log(`    ID views: ${idViews}, Slug views: ${slugViews}, New total: ${newTotal}`);

    if (!isDryRun && idViews > 0) {
      await redis.set(slugKey, newTotal);
      await redis.del(idKey);
      consolidatedCounters++;
      totalViewsMoved += idViews;
    } else if (isDryRun) {
      consolidatedCounters++;
      totalViewsMoved += idViews;
    }
  }
}

console.log('\nProcessing history keys...\n');

for (const idHistoryKey of idBasedHistory) {
  const id = idHistoryKey.replace('views:history:post:', '');
  const targetSlug = idToSlug[id];

  if (targetSlug) {
    const slugHistoryKey = `views:history:post:${targetSlug}`;
    const events = await redis.zrange(idHistoryKey, 0, -1, { withScores: true });
    const eventCount = events.length / 2; // Each entry is [member, score] pair

    console.log(`  ${id} -> ${targetSlug}`);
    console.log(`    Moving ${eventCount} history events`);

    if (!isDryRun && events.length > 0) {
      // Copy all events to slug-based history
      for (let i = 0; i < events.length; i += 2) {
        const member = events[i];
        const score = events[i + 1];
        await redis.zadd(slugHistoryKey, { score, member });
      }
      await redis.del(idHistoryKey);
      consolidatedHistory++;
      totalEventsMoved += eventCount;
    } else if (isDryRun) {
      consolidatedHistory++;
      totalEventsMoved += eventCount;
    }
  }
}

console.log('\n' + '='.repeat(60));
console.log('\n📊 CONSOLIDATION RESULTS:\n');

if (isDryRun) {
  console.log(`  Would consolidate: ${consolidatedCounters} view counters`);
  console.log(`  Would consolidate: ${consolidatedHistory} history keys`);
  console.log(`  Views to move: ${totalViewsMoved}`);
  console.log(`  Events to move: ${totalEventsMoved}`);
  console.log('\nRun without --dry-run to apply changes.');
} else {
  console.log(`  ✅ Consolidated: ${consolidatedCounters} view counters`);
  console.log(`  ✅ Consolidated: ${consolidatedHistory} history keys`);
  console.log(`  ✅ Views moved: ${totalViewsMoved}`);
  console.log(`  ✅ Events moved: ${totalEventsMoved}`);
  console.log(`\n🎉 Views successfully consolidated from IDs to slugs!`);
}
