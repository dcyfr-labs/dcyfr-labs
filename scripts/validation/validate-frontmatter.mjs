#!/usr/bin/env node

/**
 * Frontmatter Validation Script
 * Validates blog post frontmatter for required fields, SEO, and accessibility
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(REPO_ROOT, "src/content");

// Validation rules
const REQUIRED_FIELDS = ["title", "summary", "publishedAt", "tags"];
const OPTIONAL_FIELDS = ["updatedAt", "featured", "image", "imageAlt", "author", "draft"];
const MIN_TITLE_LENGTH = 10;
const MAX_TITLE_LENGTH = 70;
const MIN_SUMMARY_LENGTH = 50;
const MAX_SUMMARY_LENGTH = 160;
const MIN_TAGS = 1;
const MAX_TAGS = 5;

/**
 * Validate a single frontmatter object
 * @param {Object} frontmatter - Parsed frontmatter
 * @param {string} filePath - File path for error messages
 * @returns {Object} Validation result
 */
function validateFrontmatter(frontmatter, filePath) {
  const errors = [];
  const warnings = [];

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!frontmatter[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate title
  if (frontmatter.title) {
    const titleLength = frontmatter.title.length;
    if (titleLength < MIN_TITLE_LENGTH) {
      errors.push(`Title too short: ${titleLength} chars (min: ${MIN_TITLE_LENGTH})`);
    }
    if (titleLength > MAX_TITLE_LENGTH) {
      warnings.push(`Title too long: ${titleLength} chars (recommended max: ${MAX_TITLE_LENGTH})`);
    }
  }

  // Validate summary
  if (frontmatter.summary) {
    const summaryLength = frontmatter.summary.length;
    if (summaryLength < MIN_SUMMARY_LENGTH) {
      errors.push(`Summary too short: ${summaryLength} chars (min: ${MIN_SUMMARY_LENGTH})`);
    }
    if (summaryLength > MAX_SUMMARY_LENGTH) {
      warnings.push(`Summary too long: ${summaryLength} chars (recommended max: ${MAX_SUMMARY_LENGTH})`);
    }
  }

  // Validate publishedAt date
  if (frontmatter.publishedAt) {
    const publishDate = new Date(frontmatter.publishedAt);
    if (isNaN(publishDate.getTime())) {
      errors.push(`Invalid publishedAt date: ${frontmatter.publishedAt}`);
    } else if (publishDate > new Date()) {
      warnings.push(`publishedAt is in the future: ${frontmatter.publishedAt}`);
    }
  }

  // Validate updatedAt date
  if (frontmatter.updatedAt) {
    const updateDate = new Date(frontmatter.updatedAt);
    if (isNaN(updateDate.getTime())) {
      errors.push(`Invalid updatedAt date: ${frontmatter.updatedAt}`);
    }

    if (frontmatter.publishedAt) {
      const publishDate = new Date(frontmatter.publishedAt);
      if (updateDate < publishDate) {
        errors.push(`updatedAt (${frontmatter.updatedAt}) is before publishedAt (${frontmatter.publishedAt})`);
      }
    }
  }

  // Validate tags
  if (frontmatter.tags) {
    if (!Array.isArray(frontmatter.tags)) {
      errors.push(`Tags must be an array, got: ${typeof frontmatter.tags}`);
    } else {
      if (frontmatter.tags.length < MIN_TAGS) {
        errors.push(`Too few tags: ${frontmatter.tags.length} (min: ${MIN_TAGS})`);
      }
      if (frontmatter.tags.length > MAX_TAGS) {
        warnings.push(`Too many tags: ${frontmatter.tags.length} (recommended max: ${MAX_TAGS})`);
      }

      // Check for empty tags
      const emptyTags = frontmatter.tags.filter(tag => !tag || tag.trim() === "");
      if (emptyTags.length > 0) {
        errors.push(`Tags contain empty values: ${emptyTags.length} empty tag(s)`);
      }
    }
  }

  // Validate image accessibility
  // Support both top-level imageAlt and structured image.alt
  const hasImage = frontmatter.image || frontmatter.imageAlt;
  const hasAlt = frontmatter.imageAlt ||
                 (typeof frontmatter.image === 'object' && frontmatter.image?.alt) ||
                 (typeof frontmatter.image === 'string'); // String images don't need alt

  if (hasImage && !hasAlt) {
    errors.push(`Image present but missing alt text (accessibility requirement)`);
  }

  // Validate draft status
  if (frontmatter.draft === true) {
    warnings.push(`Post is marked as draft`);
  }

  return {
    filePath,
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Find all MDX files in content directory
 * @returns {Promise<string[]>} List of MDX file paths
 */
async function findMDXFiles() {
  const files = [];

  async function scanDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await scanDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
        files.push(fullPath);
      }
    }
  }

  try {
    await scanDir(CONTENT_DIR);
  } catch (error) {
    console.warn(`⚠️  Could not scan content directory: ${error.message}`);
  }

  return files;
}

/**
 * Validate a single MDX file
 * @param {string} filePath - Path to MDX file
 * @returns {Promise<Object>} Validation result
 */
async function validateFile(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const { data: frontmatter } = matter(content, {
      engines: {
        yaml: (s) => yaml.load(s, { schema: yaml.DEFAULT_SCHEMA })
      }
    });

    return validateFrontmatter(frontmatter, filePath);
  } catch (error) {
    return {
      filePath,
      valid: false,
      errors: [`Failed to parse file: ${error.message}`],
      warnings: [],
    };
  }
}

/**
 * Format validation results as markdown
 * @param {Array} results - Validation results
 * @returns {string} Markdown formatted summary
 */
function formatResults(results) {
  const totalFiles = results.length;
  const validFiles = results.filter(r => r.valid).length;
  const invalidFiles = results.filter(r => !r.valid).length;
  const filesWithWarnings = results.filter(r => r.warnings.length > 0).length;

  let markdown = `## Frontmatter Validation Results\n\n`;
  markdown += `- **Total Files:** ${totalFiles}\n`;
  markdown += `- **Valid:** ${validFiles} ✅\n`;
  markdown += `- **Invalid:** ${invalidFiles} ❌\n`;
  markdown += `- **Warnings:** ${filesWithWarnings} ⚠️\n\n`;

  if (invalidFiles > 0) {
    markdown += `### Errors\n\n`;
    for (const result of results.filter(r => !r.valid)) {
      const fileName = path.basename(result.filePath);
      markdown += `#### ${fileName}\n\n`;
      for (const error of result.errors) {
        markdown += `- ❌ ${error}\n`;
      }
      markdown += `\n`;
    }
  }

  if (filesWithWarnings > 0) {
    markdown += `### Warnings\n\n`;
    for (const result of results.filter(r => r.warnings.length > 0)) {
      const fileName = path.basename(result.filePath);
      markdown += `#### ${fileName}\n\n`;
      for (const warning of result.warnings) {
        markdown += `- ⚠️ ${warning}\n`;
      }
      markdown += `\n`;
    }
  }

  return markdown;
}

/**
 * Main validation function
 */
async function main() {
  console.log("📝 Validating blog post frontmatter...\n");

  // Find all MDX files
  const files = await findMDXFiles();

  if (files.length === 0) {
    console.log("⚠️  No MDX files found in content directory");
    console.log(`   Searched: ${CONTENT_DIR}\n`);
    return;
  }

  console.log(`Found ${files.length} MDX file(s)\n`);

  // Validate all files
  const results = await Promise.all(files.map(validateFile));

  // Count results
  const validFiles = results.filter(r => r.valid).length;
  const invalidFiles = results.filter(r => !r.valid).length;
  const filesWithWarnings = results.filter(r => r.warnings.length > 0).length;

  // Display results
  console.log("📊 Validation Summary:\n");
  console.log(`   Valid: ${validFiles} ✅`);
  console.log(`   Invalid: ${invalidFiles} ❌`);
  console.log(`   Warnings: ${filesWithWarnings} ⚠️\n`);

  // Show errors
  if (invalidFiles > 0) {
    console.log("❌ Errors:\n");
    for (const result of results.filter(r => !r.valid)) {
      const fileName = path.relative(REPO_ROOT, result.filePath);
      console.log(`   ${fileName}:`);
      for (const error of result.errors) {
        console.log(`   - ${error}`);
      }
      console.log("");
    }
  }

  // Show warnings
  if (filesWithWarnings > 0) {
    console.log("⚠️  Warnings:\n");
    for (const result of results.filter(r => r.warnings.length > 0)) {
      const fileName = path.relative(REPO_ROOT, result.filePath);
      console.log(`   ${fileName}:`);
      for (const warning of result.warnings) {
        console.log(`   - ${warning}`);
      }
      console.log("");
    }
  }

  // Output markdown summary for GitHub Actions
  if (process.env.GITHUB_STEP_SUMMARY) {
    const summary = formatResults(results);
    await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, summary);
  }

  // Exit with error code if validation failed
  if (invalidFiles > 0) {
    console.log("❌ Frontmatter validation failed\n");
    process.exit(1);
  } else {
    console.log("✅ All frontmatter is valid!\n");
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
