#!/usr/bin/env node
/**
 * MDX Component Usage Validator
 *
 * Validates MDX component usage across all blog posts.
 * Reports missing or excessive component usage based on content standards.
 *
 * Usage:
 *   node scripts/validate-mdx-components.mjs
 *   npm run validate:components
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import { visit } from "unist-util-visit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, "../src/content/blog");
const EXCLUDED_DIRS = ["private", "assets"];

/**
 * Component usage recommendations
 */
const COMPONENT_RULES = {
  SectionShare: {
    min: 1,
    max: 3,
    message: "Posts should have 1-3 SectionShare components for optimal engagement",
  },
  GlossaryTooltip: {
    min: 5,
    max: 20,
    message: "Technical posts should have 5-10 GlossaryTooltip components",
  },
  CollapsibleSection: {
    min: 0,
    max: 10,
    message:
      "Avoid excessive CollapsibleSection usage (max 10) - don't hide core content",
  },
};

const MIN_WORD_COUNT = 300;

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
 * Count words in AST
 */
function countWords(tree) {
  let wordCount = 0;
  visit(tree, "text", (node) => {
    const words = node.value.trim().split(/\s+/);
    wordCount += words.length;
  });
  return wordCount;
}

/**
 * Count component usage in AST
 */
function countComponents(tree) {
  const counts = {};

  visit(tree, "mdxJsxFlowElement", (node) => {
    if (node.name) {
      counts[node.name] = (counts[node.name] || 0) + 1;
    }
  });

  visit(tree, "mdxJsxTextElement", (node) => {
    if (node.name) {
      counts[node.name] = (counts[node.name] || 0) + 1;
    }
  });

  return counts;
}

/**
 * Validate a single MDX file
 */
async function validateFile(filepath) {
  const content = fs.readFileSync(filepath, "utf-8");
  const relativePath = path.relative(process.cwd(), filepath);

  try {
    const processor = unified().use(remarkParse).use(remarkMdx);
    const tree = processor.parse(content);

    const wordCount = countWords(tree);
    const componentCounts = countComponents(tree);

    const warnings = [];

    // Skip short posts
    if (wordCount < MIN_WORD_COUNT) {
      return { filepath: relativePath, skipped: true, reason: "Too short" };
    }

    // Check component rules
    for (const [componentName, rule] of Object.entries(COMPONENT_RULES)) {
      const count = componentCounts[componentName] || 0;

      if (count < rule.min) {
        warnings.push(
          `${componentName}: Found ${count}, expected at least ${rule.min}. ${rule.message}`
        );
      }

      if (count > rule.max) {
        warnings.push(
          `${componentName}: Found ${count}, expected maximum ${rule.max}. ${rule.message}`
        );
      }
    }

    return {
      filepath: relativePath,
      wordCount,
      componentCounts,
      warnings,
    };
  } catch (error) {
    return {
      filepath: relativePath,
      skipped: true,
      reason: `Parse error: ${error.message}`,
      error: true,
    };
  }
}

/**
 * Main validation function
 */
async function main() {
  console.log("🔍 Validating MDX component usage...\n");

  const files = getMdxFiles(BLOG_DIR);
  console.log(`📚 Found ${files.length} blog posts\n`);

  const results = await Promise.all(files.map(validateFile));
  const withWarnings = results.filter(
    (r) => !r.skipped && r.warnings && r.warnings.length > 0
  );
  const skipped = results.filter((r) => r.skipped && !r.error);
  const errors = results.filter((r) => r.error);
  const passing = results.filter(
    (r) => !r.skipped && !r.error && (!r.warnings || r.warnings.length === 0)
  );

  if (errors.length > 0) {
    console.log("❌ Parse errors (skipping validation):\n");
    errors.forEach(({ filepath, reason }) => {
      console.log(`   📄 ${filepath}: ${reason}`);
    });
    console.log();
  }

  if (withWarnings.length > 0) {
    console.log("⚠️  Component usage warnings:\n");
    withWarnings.forEach(({ filepath, wordCount, componentCounts, warnings }) => {
      console.log(`📄 ${filepath} (${wordCount} words)`);
      console.log(
        `   Components: ${Object.entries(componentCounts)
          .map(([name, count]) => `${name}(${count})`)
          .join(", ") || "none"}`
      );
      warnings.forEach((warning) => {
        console.log(`   ⚠️  ${warning}`);
      });
      console.log();
    });
  }

  console.log("\n📊 Summary:");
  console.log(`   ✅ ${passing.length} posts passing`);
  console.log(`   ⚠️  ${withWarnings.length} posts with warnings`);
  console.log(`   ❌ ${errors.length} posts with parse errors`);
  console.log(`   ⏭️  ${skipped.length} posts skipped (under ${MIN_WORD_COUNT} words)\n`);

  // Exit with warning code if there are issues (but don't fail build)
  if (withWarnings.length > 0) {
    console.log(
      "ℹ️  Component warnings are recommendations, not hard errors. Review and update as appropriate.\n"
    );
    process.exit(0); // Exit successfully (warnings only)
  }

  console.log("✅ All posts meet component usage guidelines!\n");
  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
