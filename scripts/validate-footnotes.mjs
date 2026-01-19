#!/usr/bin/env node
/**
 * Footnote Validation Script
 *
 * Validates footnote references and definitions in blog posts.
 * Detects missing definitions, unused definitions, and broken references.
 *
 * Usage:
 *   node scripts/validate-footnotes.mjs
 *   npm run validate:footnotes
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, "../src/content/blog");
const EXCLUDED_DIRS = ["private", "assets"];

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
        if (EXCLUDED_DIRS.includes(item)) continue;
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
 * Extract footnote references and definitions from content
 */
function analyzeFootnotes(content) {
  // Match footnote references: [^ref-name]
  const referencePattern = /\[\^([a-zA-Z0-9_-]+)\]/g;
  const references = new Set();
  let match;

  while ((match = referencePattern.exec(content)) !== null) {
    references.add(match[1]);
  }

  // Match footnote definitions: [^ref-name]: Definition text
  const definitionPattern = /^\[\^([a-zA-Z0-9_-]+)\]:\s*(.+)$/gm;
  const definitions = new Map();

  while ((match = definitionPattern.exec(content)) !== null) {
    definitions.set(match[1], match[2].trim());
  }

  return { references, definitions };
}

/**
 * Validate footnotes in a single file
 */
function validateFile(filepath) {
  const content = fs.readFileSync(filepath, "utf-8");
  const relativePath = path.relative(process.cwd(), filepath);

  const { references, definitions } = analyzeFootnotes(content);

  const issues = [];

  // Check for references without definitions
  for (const ref of references) {
    if (!definitions.has(ref)) {
      issues.push({
        type: "missing-definition",
        reference: ref,
        message: `Footnote reference [^${ref}] has no definition`,
      });
    }
  }

  // Check for definitions without references
  for (const [defKey] of definitions) {
    if (!references.has(defKey)) {
      issues.push({
        type: "unused-definition",
        reference: defKey,
        message: `Footnote definition [^${defKey}] is never referenced`,
      });
    }
  }

  return {
    filepath: relativePath,
    referenceCount: references.size,
    definitionCount: definitions.size,
    issues,
  };
}

/**
 * Main validation function
 */
async function main() {
  console.log("🔍 Validating footnotes in blog posts...\n");

  const files = getMdxFiles(BLOG_DIR);
  console.log(`📚 Found ${files.length} blog posts\n`);

  const results = files.map(validateFile);
  const withIssues = results.filter((r) => r.issues.length > 0);
  const withFootnotes = results.filter(
    (r) => r.referenceCount > 0 || r.definitionCount > 0
  );
  const clean = results.filter(
    (r) => (r.referenceCount > 0 || r.definitionCount > 0) && r.issues.length === 0
  );

  if (withIssues.length > 0) {
    console.log("❌ Footnote validation issues:\n");

    withIssues.forEach(({ filepath, referenceCount, definitionCount, issues }) => {
      console.log(`📄 ${filepath}`);
      console.log(`   References: ${referenceCount}, Definitions: ${definitionCount}`);
      issues.forEach(({ type, reference, message }) => {
        const icon = type === "missing-definition" ? "❌" : "⚠️ ";
        console.log(`   ${icon} ${message}`);
      });
      console.log();
    });
  }

  console.log("📊 Summary:");
  console.log(`   ✅ ${clean.length} posts with valid footnotes`);
  console.log(`   ❌ ${withIssues.length} posts with footnote issues`);
  console.log(
    `   📝 ${withFootnotes.length} posts use footnotes (${results.length - withFootnotes.length} without)\n`
  );

  if (withIssues.length > 0) {
    console.error("❌ Footnote validation failed\n");
    process.exit(1);
  }

  console.log("✅ All footnotes are valid!\n");
  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
