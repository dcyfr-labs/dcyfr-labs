#!/usr/bin/env node
/**
 * Validate Post Categories
 *
 * This script validates that all blog posts use valid categories
 * defined in src/lib/post-categories.ts
 *
 * Run during build to catch invalid categories early.
 *
 * Usage:
 *   node scripts/validate-post-categories.mjs
 *   npm run validate:categories
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Read valid categories from post-categories.ts
function getValidCategories() {
  const categoriesFile = path.join(rootDir, "src/lib/post-categories.ts");
  const content = fs.readFileSync(categoriesFile, "utf-8");

  // Extract category IDs from CATEGORIES array
  const categoriesMatch = content.match(
    /const CATEGORIES = \[([\s\S]*?)\] as const;/
  );
  if (!categoriesMatch) {
    throw new Error("Could not find CATEGORIES array in post-categories.ts");
  }

  const categoriesArray = categoriesMatch[1];
  const categoryIds = [...categoriesArray.matchAll(/{ id: "([^"]+)"/g)].map(
    (m) => m[1]
  );

  return categoryIds;
}

// Find all MDX files in src/content/blog
function findBlogPosts(dir = path.join(rootDir, "src/content/blog")) {
  const posts = [];

  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.name.endsWith(".mdx")) {
        posts.push(fullPath);
      }
    }
  }

  traverse(dir);
  return posts;
}

// Extract category from MDX frontmatter
function extractCategory(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");

  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return null;
  }

  const frontmatter = frontmatterMatch[1];

  // Extract category field
  const categoryMatch = frontmatter.match(/category:\s*["']([^"']+)["']/);
  return categoryMatch ? categoryMatch[1] : null;
}

// Main validation
function validateCategories() {
  console.log("🔍 Validating post categories...\n");

  const validCategories = getValidCategories();
  console.log(`✅ Valid categories: ${validCategories.join(", ")}\n`);

  const blogPosts = findBlogPosts();
  console.log(`📚 Found ${blogPosts.length} blog posts\n`);

  const errors = [];
  const warnings = [];

  for (const postPath of blogPosts) {
    const relativePath = path.relative(rootDir, postPath);
    const category = extractCategory(postPath);

    if (!category) {
      warnings.push(`⚠️  ${relativePath}: No category defined`);
    } else if (!validCategories.includes(category)) {
      errors.push(`❌ ${relativePath}: Invalid category "${category}"`);
    }
  }

  // Print results
  if (warnings.length > 0) {
    console.log("Warnings:");
    warnings.forEach((w) => console.log(w));
    console.log("");
  }

  if (errors.length > 0) {
    console.log("Errors:");
    errors.forEach((e) => console.log(e));
    console.log("");
    console.log("❌ Validation failed!");
    console.log("");
    console.log("To fix:");
    console.log("1. Add missing categories to src/lib/post-categories.ts");
    console.log("2. Or update post frontmatter to use existing categories");
    console.log("");
    process.exit(1);
  }

  console.log("✅ All categories are valid!");
}

// Run validation
try {
  validateCategories();
} catch (error) {
  console.error("❌ Validation error:", error.message);
  process.exit(1);
}
