#!/usr/bin/env node
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync, readFileSync } from 'fs';
import { parse } from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

console.log('📋 Active Post Slugs:\n');

// Get all actual post slugs from content directory
const contentDir = join(__dirname, '..', 'src', 'content', 'blog');
const entries = readdirSync(contentDir, { withFileTypes: true });

const posts = [];

for (const entry of entries) {
  if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'README.md') continue;

  const mdxPath = join(contentDir, entry.name, 'index.mdx');
  try {
    const content = readFileSync(mdxPath, 'utf-8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (frontmatterMatch) {
      const frontmatter = parse(frontmatterMatch[1]);
      const slug = frontmatter.slug || entry.name;
      const id = frontmatter.id || '(no ID)';
      const title = frontmatter.title || '(no title)';
      posts.push({ slug, id, title, directory: entry.name });
    }
  } catch (err) {
    console.log(`  ⚠️  Could not read: ${entry.name}`);
  }
}

console.log(`Found ${posts.length} posts:\n`);
posts.forEach((post) => {
  console.log(`Directory: ${post.directory}`);
  console.log(`  Slug: ${post.slug}`);
  console.log(`  ID: ${post.id}`);
  console.log(`  Title: ${post.title}`);
  console.log();
});
