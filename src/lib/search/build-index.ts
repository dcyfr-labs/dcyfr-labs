/**
 * Search Index Generator
 *
 * Generates a JSON search index from blog posts at build time.
 * Index is written to public/search-index.json for client-side consumption.
 *
 * Run: `node --loader ts-node/esm src/lib/search/build-index.ts`
 * Or add to package.json: `"build:search": "tsx src/lib/search/build-index.ts"`
 */

import { posts } from "@/data/posts";
import type { SearchIndex, SearchablePost } from "./fuse-config";
import fs from "fs";
import path from "path";

/**
 * Extract plain text content from MDX (remove frontmatter, JSX, etc.)
 */
function extractPlainText(content: string): string {
  // Remove frontmatter
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, "");

  // Remove JSX/MDX components
  const withoutJsx = withoutFrontmatter
    .replace(/<[^>]+>/g, " ") // Remove HTML/JSX tags
    .replace(/\{[^}]+\}/g, " ") // Remove JSX expressions
    .replace(/import .* from .*/g, "") // Remove imports
    .replace(/export .*/g, ""); // Remove exports

  // Remove markdown syntax
  const plainText = withoutJsx
    .replace(/```[\s\S]*?```/g, " ") // Remove code blocks
    .replace(/`[^`]+`/g, " ") // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Convert links to text
    .replace(/[#*_~]/g, "") // Remove markdown symbols
    .replace(/\n+/g, " ") // Convert newlines to spaces
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim();

  return plainText;
}

/**
 * Generate search index from blog posts
 */
function generateSearchIndex(): SearchIndex {
  const searchablePosts: SearchablePost[] = posts
    .filter((post) => !post.archived) // Exclude archived posts
    .map((post) => {
      // Extract plain text from body content
      const plainContent = extractPlainText(post.body || "");

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
        url: `/blog/${post.id}`,
      };
    });

  // Extract unique tags and series
  const allTags = new Set<string>();
  const allSeries = new Set<string>();

  searchablePosts.forEach((post) => {
    post.tags.forEach((tag) => allTags.add(tag));
    if (post.series) allSeries.add(post.series);
  });

  return {
    posts: searchablePosts,
    tags: Array.from(allTags).sort(),
    series: Array.from(allSeries).sort(),
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Main execution
 */
function main() {
  console.log("[SearchIndex] Generating search index...");

  const index = generateSearchIndex();

  // Write to public directory
  const publicDir = path.join(process.cwd(), "public");
  const outputPath = path.join(publicDir, "search-index.json");

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write index
  fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));

  // Log stats
  const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(2);

  console.log(`[SearchIndex] ✅ Generated search index:`);
  console.log(`  - Posts: ${index.posts.length}`);
  console.log(`  - Tags: ${index.tags.length}`);
  console.log(`  - Series: ${index.series.length}`);
  console.log(`  - Size: ${sizeKB} KB`);
  console.log(`  - Output: ${outputPath}`);
}

// Run if called directly
if (require.main === module) {
  main();
}

export { generateSearchIndex };
