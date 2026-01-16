#!/usr/bin/env node
/**
 * Frontmatter Validation Script
 *
 * Validates all blog post frontmatter against the Zod schema.
 * Run during build to catch schema violations early.
 *
 * Usage:
 *   node scripts/validate-frontmatter.mjs
 *   npm run validate:frontmatter
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import from TypeScript file (works with tsx)
const { validateFrontmatter } = await import("../src/schemas/frontmatter.ts");

const BLOG_DIR = path.join(__dirname, "../src/content/blog");
const EXCLUDED_DIRS = ["private", "assets"];

// Configure gray-matter to use yaml.load instead of deprecated safeLoad
const matterOptions = {
  engines: {
    yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }),
  },
};

/**
 * Get all MDX files recursively
 */
function getMdxFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip excluded directories
        if (EXCLUDED_DIRS.includes(item)) {
          continue;
        }
        traverse(fullPath);
      } else if (item.endsWith(".mdx")) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

/**
 * Validate a single MDX file
 */
function validateFile(filepath) {
  const content = fs.readFileSync(filepath, "utf-8");
  const { data } = matter(content, matterOptions);
  const relativePath = path.relative(process.cwd(), filepath);

  try {
    validateFrontmatter(data, relativePath);
    return { success: true, filepath: relativePath };
  } catch (error) {
    return {
      success: false,
      filepath: relativePath,
      error: error.message,
    };
  }
}

/**
 * Main validation function
 */
async function main() {
  console.log("🔍 Validating blog post frontmatter...\n");

  const files = getMdxFiles(BLOG_DIR);
  console.log(`📚 Found ${files.length} blog posts\n`);

  const results = files.map(validateFile);
  const failures = results.filter((r) => !r.success);
  const successes = results.filter((r) => r.success);

  if (failures.length > 0) {
    console.error("❌ Validation failed for the following posts:\n");
    failures.forEach(({ filepath, error }) => {
      console.error(`\n📄 ${filepath}`);
      console.error(error);
    });

    console.error(`\n\n❌ ${failures.length} post(s) failed validation`);
    console.log(`✅ ${successes.length} post(s) passed validation\n`);
    process.exit(1);
  }

  console.log(`✅ All ${successes.length} posts passed validation!\n`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
