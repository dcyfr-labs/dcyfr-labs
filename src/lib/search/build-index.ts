/**
 * Search Index Generator
 *
 * Generates a JSON search index from blog posts and static projects at build time.
 * Index is written to public/search-index.json for client-side consumption.
 *
 * Run: `node --loader ts-node/esm src/lib/search/build-index.ts`
 * Or add to package.json: `"build:search": "tsx src/lib/search/build-index.ts"`
 */

import { posts } from '@/data/posts';
import { visibleProjects } from '@/data/projects';
import type { SearchIndex, SearchablePost, SearchableProject } from './fuse-config';
import fs from 'fs';
import path from 'path';

/**
 * Extract plain text content from MDX (remove frontmatter, JSX, etc.)
 */
function extractPlainText(content: string): string {
  // Remove frontmatter
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');

  // Remove JSX/MDX components
  const withoutJsx = withoutFrontmatter
    .replace(/<[^>]+>/g, ' ') // Remove HTML/JSX tags
    .replace(/\{[^}]+\}/g, ' ') // Remove JSX expressions
    .replace(/import .* from .*/g, '') // Remove imports
    .replace(/export .*/g, ''); // Remove exports

  // Remove markdown syntax
  const plainText = withoutJsx
    .replace(/```[\s\S]*?```/g, ' ') // Remove code blocks
    .replace(/`[^`]+`/g, ' ') // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
    .replace(/[#*_~]/g, '') // Remove markdown symbols
    .replace(/\n+/g, ' ') // Convert newlines to spaces
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();

  return plainText;
}

/**
 * Generate search index from blog posts and projects
 */
function generateSearchIndex(): SearchIndex {
  const searchablePosts: SearchablePost[] = posts
    // Include archived posts in search results
    .map((post) => {
      // Extract plain text from body content
      const plainContent = extractPlainText(post.body || '');

      // Take first 500 characters as excerpt for search
      const contentExcerpt = plainContent.slice(0, 500);

      return {
        id: post.id,
        title: post.title,
        summary: post.summary,
        content: contentExcerpt,
        tags: post.tags,
        series: post.series?.name || null,
        publishedAt: post.publishedAt,
        readingTime: post.readingTime.minutes,
        url: `/blog/${post.slug}`,
      };
    });

  // Static projects (automated GitHub projects are dynamic — fetched at request time)
  const searchableProjects: SearchableProject[] = visibleProjects.map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    category: p.category ?? '',
    tech: p.tech ?? [],
    tags: p.tags ?? [],
    status: p.status,
    url: `/work/${p.slug}`,
  }));

  // Extract unique tags and series
  const allTags = new Set<string>();
  const allSeries = new Set<string>();

  searchablePosts.forEach((post) => {
    post.tags.forEach((tag) => allTags.add(tag));
    if (post.series) allSeries.add(post.series);
  });

  return {
    posts: searchablePosts,
    projects: searchableProjects,
    tags: Array.from(allTags).sort((a, b) => a.localeCompare(b)),
    series: Array.from(allSeries).sort((a, b) => a.localeCompare(b)),
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Main execution
 */
function main() {
  console.warn('[SearchIndex] Generating search index...');

  const index = generateSearchIndex();

  // Write to public directory
  const publicDir = path.join(process.cwd(), 'public');
  const outputPath = path.join(publicDir, 'search-index.json');

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write index
  fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));

  // Log stats
  const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(2);

  console.warn(`[SearchIndex] ✅ Generated search index:`);
  console.warn(`  - Posts: ${index.posts.length}`);
  console.warn(`  - Projects: ${index.projects.length}`);
  console.warn(`  - Tags: ${index.tags.length}`);
  console.warn(`  - Series: ${index.series.length}`);
  console.warn(`  - Size: ${sizeKB} KB`);
  console.warn(`  - Output: ${outputPath}`);
}

// Run if called directly
if (require.main === module) {
  main();
}

export { generateSearchIndex };
