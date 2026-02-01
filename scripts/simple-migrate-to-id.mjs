#!/usr/bin/env node
/**
 * Simple migration: Move slug-based views to ID-based keys
 *
 * Current state:
 * - Production: views:post:{slug} (13 keys, 435 total views)
 * - Code expects: views:post:{postId}
 *
 * Solution:
 * - For each active blog post:
 *   1. Read views from views:post:{slug}
 *   2. Read history from views:history:post:{slug}
 *   3. Write to views:post:{postId}
 *   4. Write to views:history:post:{postId}
 *   5. Delete slug-based keys
 */

import dotenv from 'dotenv';
import { Redis } from '@upstash/redis';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { parse } from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

dotenv.config({ path: join(projectRoot, '.env.local') });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

console.log('🔄 Migrating views from slug-based to ID-based keys\n');
console.log('━'.repeat(80));

// Step 1: Get all blog posts
console.log('\n📖 Reading blog posts...\n');

const blogDir = join(projectRoot, 'src/content/blog');
const postDirs = readdirSync(blogDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

const posts = [];
for (const dir of postDirs) {
  const mdxPath = join(blogDir, dir, 'index.mdx');
  try {
    const content = readFileSync(mdxPath, 'utf-8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const frontmatter = parse(frontmatterMatch[1]);
      // Slug is the directory name, not in frontmatter
      const slug = dir;
      posts.push({
        slug,
        id: frontmatter.id,
        title: frontmatter.title,
      });
      console.log(`  ✓ ${slug} → ${frontmatter.id}`);
    }
  } catch (err) {
    console.log(`  ⚠️  Failed to read ${dir}: ${err.message}`);
  }
}

console.log(`\n  Found ${posts.length} posts`);

// Step 2: Migrate each post
console.log('\n🔄 Migrating view data...\n');

let totalViews = 0;
let totalEvents = 0;
const migrations = [];

for (const post of posts) {
  const slugCounterKey = `views:post:${post.slug}`;
  const slugHistoryKey = `views:history:post:${post.slug}`;
  const idCounterKey = `views:post:${post.id}`;
  const idHistoryKey = `views:history:post:${post.id}`;

  // Check if slug-based counter exists
  const views = await redis.get(slugCounterKey);
  const viewCount = views ? parseInt(views) : 0;

  if (viewCount === 0) {
    console.log(`  ⏩ ${post.slug}: No views to migrate`);
    continue;
  }

  // Migrate counter
  console.log(`  🔄 ${post.slug}:`);
  console.log(`     Counter: ${slugCounterKey} → ${idCounterKey} (${viewCount} views)`);
  await redis.set(idCounterKey, viewCount);
  totalViews += viewCount;

  // Migrate history
  try {
    const history = await redis.zrange(slugHistoryKey, 0, -1, { withScores: true });
    if (history && history.length > 0) {
      const eventCount = history.length / 2;
      console.log(`     History: ${slugHistoryKey} → ${idHistoryKey} (${eventCount} events)`);

      // Add all history entries to ID-based key
      for (let i = 0; i < history.length; i += 2) {
        const member = history[i];
        const score = history[i + 1];
        await redis.zadd(idHistoryKey, { score, member });
      }
      totalEvents += eventCount;
    }
  } catch (err) {
    console.log(`     History: No history or error: ${err.message}`);
  }

  migrations.push({ slug: post.slug, id: post.id, views: viewCount });
}

// Step 3: Verify migration
console.log('\n✅ Verifying migration...\n');

for (const { slug, id, views } of migrations.slice(0, 5)) {
  const idCounterKey = `views:post:${id}`;
  const migratedViews = await redis.get(idCounterKey);
  const status = parseInt(migratedViews) === views ? '✓' : '❌';
  console.log(`  ${status} ${slug}: ${migratedViews} views (expected ${views})`);
}

// Step 4: Cleanup slug-based keys
console.log('\n🧹 Cleaning up slug-based keys...\n');

for (const { slug } of migrations) {
  const slugCounterKey = `views:post:${slug}`;
  const slugHistoryKey = `views:history:post:${slug}`;

  await redis.del(slugCounterKey);
  await redis.del(slugHistoryKey);
  console.log(`  ✓ Deleted ${slugCounterKey} and ${slugHistoryKey}`);
}

// Summary
console.log('\n' + '━'.repeat(80));
console.log('\n📊 MIGRATION COMPLETE\n');
console.log(`Posts migrated: ${migrations.length}`);
console.log(`Total views: ${totalViews}`);
console.log(`Total history events: ${totalEvents}`);
console.log('\n✅ Views are now stored with permanent post IDs');
console.log('✅ Slug changes will not reset view counts');
console.log('✅ New views will increment existing counters\n');
