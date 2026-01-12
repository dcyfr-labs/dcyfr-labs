#!/usr/bin/env node
/**
 * Emoji Validation Script
 *
 * Prevents emojis in public-facing content.
 * Emojis are prohibited in blog posts, project descriptions, and public UI.
 * They are acceptable only in internal docs, code comments, console.log, and tests.
 *
 * Usage: node scripts/validate-emojis.mjs [--fix]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

// Emoji regex pattern - matches all emoji characters
// Based on Unicode emoji ranges
const emojiRegex =
  /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

// Files to check for emoji violations
const prohibitedFiles = [
  'src/content/blog/**/*.mdx',
  'src/content/projects/**/*.mdx',
];

// Files where emojis are allowed
const allowedFiles = [
  'docs/**/*',
  '.github/**/*',
  'scripts/**/*',
  'src/**/*.test.*',
  'src/**/*.spec.*',
  '**/*.comment',
];

// Emoji exceptions - some files in prohibited locations that can have emojis
const exceptions = [
  // Add any exceptions here if needed
];

// Emoji validation results
// @typedef {Object} ValidationResult
// @property {string} file
// @property {number} line
// @property {number} column
// @property {string} emoji
// @property {string} context

let violations = [];

/**
 * Check if a file path matches one of the allowed patterns
 * @param {string} filePath - The file path to check
 * @returns {boolean} True if file is in an allowed location
 */
function isFileAllowed(filePath) {
  // Check if file matches allowed patterns
  for (const pattern of allowedFiles) {
    if (matchesPattern(filePath, pattern)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a file path matches one of the prohibited patterns
 * @param {string} filePath - The file path to check
 * @returns {boolean} True if file is in a prohibited location
 */
function isFileProhibited(filePath) {
  // Check if file matches prohibited patterns
  for (const pattern of prohibitedFiles) {
    if (matchesPattern(filePath, pattern)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a file is an exception to the rules
 * @param {string} filePath - The file path to check
 * @returns {boolean} True if file is an exception
 */
function isException(filePath) {
  // Check if file is an exception
  for (const exception of exceptions) {
    if (matchesPattern(filePath, exception)) {
      return true;
    }
  }
  return false;
}

/**
 * Simple glob pattern matching
 * @param {string} filePath - The file path to check
 * @param {string} pattern - The glob pattern (e.g., "src/**&#47;*.mdx")
 * @returns {boolean} True if path matches pattern
 */
function matchesPattern(filePath, pattern) {
  const patternParts = pattern.split('*');
  let index = 0;

  for (let i = 0; i < patternParts.length; i++) {
    const part = patternParts[i];

    if (i === 0) {
      // First part must match at start
      if (!filePath.startsWith(part)) {
        return false;
      }
      index = part.length;
    } else if (i === patternParts.length - 1) {
      // Last part must match at end
      if (!filePath.endsWith(part)) {
        return false;
      }
    } else {
      // Middle parts must exist somewhere
      const nextIndex = filePath.indexOf(part, index);
      if (nextIndex === -1) {
        return false;
      }
      index = nextIndex + part.length;
    }
  }

  return true;
}

/**
 * Validate a single file for emoji violations
 * @param {string} filePath - The file path to validate
 */
function validateFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Only check prohibited files (not in allowed locations)
    if (!isFileProhibited(filePath) || isFileAllowed(filePath) || isException(filePath)) {
      return;
    }

    lines.forEach((line, lineNum) => {
      // Skip code blocks and comments in markdown
      if (line.trim().startsWith('```') || line.trim().startsWith('//') || line.trim().startsWith('/*')) {
        return;
      }

      let match;
      while ((match = emojiRegex.exec(line)) !== null) {
        violations.push({
          file: filePath,
          line: lineNum + 1,
          column: match.index + 1,
          emoji: match[0],
          context: line.trim().substring(0, 80),
        });
      }
    });
  } catch (error) {
    // Skip files that can't be read
  }
}

/**
 * Recursively walk directory and validate all markdown files
 * @param {string} dir - The directory to walk
 */
function walkDir(dir) {
  try {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      // Skip node_modules and hidden directories
      if (file.startsWith('.') && file !== '.github') {
        continue;
      }
      if (file === 'node_modules') {
        continue;
      }

      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.mdx') || file.endsWith('.md')) {
        validateFile(filePath);
      }
    }
  } catch (error) {
    // Skip directories that can't be read
  }
}

// Main execution
console.log('🔍 Validating emojis in public content...\n');

walkDir(root);

if (violations.length === 0) {
  console.log('✅ No emoji violations found in public content.');
  console.log('   Checked: src/content/blog/*.mdx, src/content/projects/*.mdx');
  process.exit(0);
} else {
  console.error(`❌ Found ${violations.length} emoji violation(s):\n`);

  violations.forEach((v) => {
    const relPath = path.relative(root, v.file);
    console.error(`  📍 ${relPath}:${v.line}:${v.column}`);
    console.error(`     Emoji: ${v.emoji}`);
    console.error(`     Context: "${v.context}"`);
    console.error(`     Fix: Replace with lucide-react icon or remove if decorative.\n`);
  });

  console.error(`\n📚 See: .github/agents/DCYFR.agent.md - "Never Use Emojis" section`);
  console.error('   Reference: CLAUDE.md - "Never Use Emojis in Public Content" section');
  process.exit(1);
}
