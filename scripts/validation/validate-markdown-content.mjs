#!/usr/bin/env node

/**
 * Markdown Content Linter
 * 
 * Validates blog posts against markdown standards:
 * - Horizontal line count and placement
 * - Frontmatter completeness
 * - Heading hierarchy
 * - File naming conventions
 * 
 * Usage: node scripts/validate-markdown-content.mjs
 * Exit codes: 0 (all pass), 1 (validation errors)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogDir = path.join(__dirname, "../src/content/blog");

// ANSI colors for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  dim: "\x1b[2m",
};

const rules = {
  maxHorizontalLines: 6,
  minHorizontalLines: 1,
  maxHeadingDepth: 4,
  requiredFrontmatterFields: [
    "title",
    "summary",
    "publishedAt",
    "category",
    "tags",
  ],
};

/**
 * Parse YAML frontmatter from markdown content
 * @returns {Object} { frontmatter: Map, content: string }
 */
function parseFrontmatter(content) {
  const lines = content.split("\n");
  if (lines[0] !== "---") {
    return { frontmatter: null, content };
  }

  let endIndex = 1;
  while (endIndex < lines.length && lines[endIndex] !== "---") {
    endIndex++;
  }

  const frontmatterLines = lines.slice(1, endIndex);
  const bodyLines = lines.slice(endIndex + 1);

  const frontmatter = new Map();
  let currentKey = null;

  for (const line of frontmatterLines) {
    if (line.startsWith("  ") || line.startsWith("\t")) {
      // Continuation of previous value (nested structure)
      continue;
    }

    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      frontmatter.set(key, value);
      currentKey = key;
    }
  }

  return {
    frontmatter,
    content: bodyLines.join("\n"),
  };
}

/**
 * Count horizontal lines in content
 * Excludes frontmatter boundaries
 */
function countHorizontalLines(content) {
  const lines = content.split("\n");
  let count = 0;
  let lineNumbers = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Match horizontal rule: 3+ dashes, asterisks, or underscores
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line)) {
      count++;
      lineNumbers.push(i + 1);
    }
  }

  return { count, lineNumbers };
}

/**
 * Check heading hierarchy
 */
function checkHeadingHierarchy(content) {
  const lines = content.split("\n");
  const issues = [];
  let currentLevel = 0;
  let headingCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(#+)\s/);

    if (match) {
      headingCount++;
      const level = match[1].length;

      // Check for single h1 (markdown convention)
      if (level === 1 && headingCount > 1) {
        issues.push({
          line: i + 1,
          level: "warn",
          message: "Multiple h1 headings found (use one per post)",
        });
      }

      // Check for excessive nesting
      if (level > rules.maxHeadingDepth) {
        issues.push({
          line: i + 1,
          level: "warn",
          message: `Heading depth ${level} exceeds recommended max of ${rules.maxHeadingDepth}`,
        });
      }

      // Check for improper hierarchy jumps
      if (level > currentLevel + 1) {
        issues.push({
          line: i + 1,
          level: "warn",
          message: `Heading hierarchy jump: h${currentLevel} → h${level} (skipped levels)`,
        });
      }

      currentLevel = level;
    }
  }

  return issues;
}

/**
 * Validate a single blog post
 */
function validatePost(filePath) {
  const fileName = path.basename(filePath);
  const content = fs.readFileSync(filePath, "utf-8");

  const issues = [];

  // Parse frontmatter
  const { frontmatter, content: bodyContent } = parseFrontmatter(content);

  if (!frontmatter) {
    issues.push({
      level: "error",
      message: "Missing YAML frontmatter",
    });
    return issues;
  }

  // Check required frontmatter fields
  for (const field of rules.requiredFrontmatterFields) {
    if (!frontmatter.has(field)) {
      issues.push({
        level: "error",
        message: `Missing frontmatter field: ${field}`,
      });
    }
  }

  // Check horizontal lines
  const { count: hrCount, lineNumbers: hrLines } =
    countHorizontalLines(bodyContent);

  if (hrCount > rules.maxHorizontalLines) {
    issues.push({
      level: "error",
      message: `Too many horizontal lines: ${hrCount} (max: ${rules.maxHorizontalLines}) at lines ${hrLines.join(", ")}`,
    });
  }

  if (hrCount < rules.minHorizontalLines && bodyContent.trim().length > 500) {
    // Only warn for longer posts
    issues.push({
      level: "warn",
      message: `Few horizontal lines: ${hrCount} (recommended: ${rules.minHorizontalLines}-${rules.maxHorizontalLines})`,
    });
  }

  // Check heading hierarchy
  const headingIssues = checkHeadingHierarchy(bodyContent);
  issues.push(...headingIssues);

  // Note: h0 → h2 jump is expected (MDX content starts at h2, h1 is set via title in frontmatter)
  // Filter out the h0 jump warning as it's a false positive
  const filteredIssues = issues.filter(
    (issue) => !issue.message.includes("h0 → h2")
  );

  // Check file naming convention (kebab-case)
  if (!/^[a-z0-9-]+\.mdx?$/.test(fileName)) {
    filteredIssues.push({
      level: "warn",
      message: `File name should be kebab-case: ${fileName}`,
    });
  }

  // Add frontmatter and summary to issues for context
  return {
    fileName,
    title: frontmatter.get("title") || "Unknown",
    issues: filteredIssues,
  };
}

/**
 * Main validation runner
 */
function main() {
  console.log(`${colors.blue}Validating markdown content...${colors.reset}\n`);

  if (!fs.existsSync(blogDir)) {
    console.error(`${colors.red}Blog directory not found: ${blogDir}${colors.reset}`);
    process.exit(1);
  }

  let files = fs
    .readdirSync(blogDir)
    .filter((f) => f.endsWith(".mdx"))
    // Skip demo files - they intentionally showcase all markdown features
    .filter((f) => !f.startsWith("demo-"))
    .map((f) => path.join(blogDir, f));

  let totalErrors = 0;
  let totalWarnings = 0;

  const results = files
    .map((filePath) => validatePost(filePath))
    .sort((a, b) => a.fileName.localeCompare(b.fileName));

  for (const result of results) {
    if (result.issues && result.issues.length > 0) {
      console.log(
        `${colors.yellow}${result.fileName}${colors.reset} (${result.title})`
      );

      for (const issue of result.issues) {
        const prefix =
          issue.level === "error"
            ? `${colors.red}✖ ERROR${colors.reset}`
            : `${colors.yellow}⚠ WARN${colors.reset}`;

        const lineInfo = issue.line ? ` [line ${issue.line}]` : "";
        console.log(`  ${prefix}: ${issue.message}${lineInfo}`);

        if (issue.level === "error") totalErrors++;
        if (issue.level === "warn") totalWarnings++;
      }

      console.log();
    }
  }

  // Summary
  console.log(`${colors.dim}─────────────────────────────────────${colors.reset}`);

  const passCount = results.filter((r) => !r.issues || r.issues.length === 0)
    .length;
  const totalCount = results.length;

  if (totalErrors === 0 && totalWarnings === 0) {
    console.log(
      `${colors.green}✓ All ${totalCount} posts pass validation${colors.reset}`
    );
    process.exit(0);
  }

  console.log(
    `${colors.green}${passCount}/${totalCount}${colors.reset} posts pass | ${colors.red}${totalErrors} errors${colors.reset}, ${colors.yellow}${totalWarnings} warnings${colors.reset}`
  );

  if (totalErrors > 0) {
    console.log(`\n${colors.red}Fix errors before committing.${colors.reset}`);
    process.exit(1);
  }

  process.exit(0);
}

main();
