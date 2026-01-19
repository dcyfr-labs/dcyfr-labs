#!/usr/bin/env node

/**
 * Comment Density Analyzer
 *
 * Analyzes comment-to-code ratio in files to prevent excessive AI-generated comments.
 * AI assistants often over-comment code, reducing readability and maintainability.
 *
 * Inspired by oh-my-opencode's comment checker pattern.
 *
 * What counts as valid comments (not flagged):
 * - JSDoc blocks (/** ... * /)
 * - BDD test descriptions (describe, it, test blocks)
 * - Directives (@ts-ignore, @ts-expect-error, eslint-disable)
 * - TODO/FIXME/HACK markers
 * - License headers
 * - Type annotations in comments
 *
 * Exit codes:
 * - 0: Comment density acceptable
 * - 1: Comment density too high (>30% by default)
 *
 * Usage:
 *   node scripts/check-comment-density.mjs <file>
 *   node scripts/check-comment-density.mjs <file> --threshold=20
 *   node scripts/check-comment-density.mjs <file> --json
 *   node scripts/check-comment-density.mjs <file> --fix  # Remove excessive comments
 *
 * @see docs/ai/claude-code-enhancements.md
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { extname, basename } from 'path';

// =============================================================================
// Configuration
// =============================================================================

const DEFAULT_THRESHOLD = 30; // 30% comment ratio triggers warning

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

// Patterns for valid/acceptable comments
const VALID_COMMENT_PATTERNS = [
  // JSDoc
  /^\s*\/\*\*/,
  /^\s*\*\s*@/,
  /^\s*\*\s*$/,
  /^\s*\*\//,
  // Directives
  /^\s*\/\/\s*@ts-(ignore|expect-error|nocheck|check)/,
  /^\s*\/\/\s*eslint-disable/,
  /^\s*\/\/\s*prettier-ignore/,
  /^\s*\/\/\s*istanbul ignore/,
  /^\s*\/\/\s*vitest-environment/,
  /^\s*\/\*\s*eslint/,
  // TODOs (we want these)
  /^\s*\/\/\s*(TODO|FIXME|HACK|NOTE|XXX|BUG|OPTIMIZE)[\s:]/i,
  // License headers
  /^\s*\/\/\s*(Copyright|License|SPDX|MIT|Apache)/i,
  /^\s*\/\*[\s\*]*(Copyright|License|SPDX)/i,
  // Type annotations
  /^\s*\/\/\s*type:/i,
  /^\s*\/\*\*?\s*@type/,
  // File/module documentation (first comment block)
  /^\s*\/\*\*[\s\S]*?@(module|file|description|see|author)/,
  // Section separators (common in this codebase)
  /^\s*\/\/\s*={10,}/,
  /^\s*\/\/\s*-{10,}/,
];

// Patterns for BDD test blocks (these are code, not comments)
const BDD_PATTERNS = [
  /^\s*(describe|it|test|beforeEach|afterEach|beforeAll|afterAll)\s*\(/,
  /^\s*(expect|assert|should)\s*\(/,
];

// =============================================================================
// Analysis Functions
// =============================================================================

/**
 * Determine if a line is a valid/acceptable comment
 */
function isValidComment(line, lineIndex, lines, isFirstCommentBlock) {
  // Check if it matches valid patterns
  for (const pattern of VALID_COMMENT_PATTERNS) {
    if (pattern.test(line)) {
      return true;
    }
  }

  // First comment block (file header) is always valid
  if (isFirstCommentBlock && lineIndex < 30) {
    return true;
  }

  return false;
}

/**
 * Check if a line is part of a BDD test description
 */
function isBDDContext(line, lines, lineIndex) {
  // Check current line for BDD patterns
  for (const pattern of BDD_PATTERNS) {
    if (pattern.test(line)) {
      return true;
    }
  }

  // Check if we're inside a describe/it block (look at surrounding context)
  const contextRange = 5;
  const startIdx = Math.max(0, lineIndex - contextRange);
  const endIdx = Math.min(lines.length, lineIndex + contextRange);

  for (let i = startIdx; i < endIdx; i++) {
    if (/^\s*(describe|it|test)\s*\(/.test(lines[i])) {
      return true;
    }
  }

  return false;
}

/**
 * Analyze a file's comment density
 */
function analyzeFile(filePath, threshold = DEFAULT_THRESHOLD) {
  if (!existsSync(filePath)) {
    return {
      error: `File not found: ${filePath}`,
      status: 'error',
    };
  }

  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const ext = extname(filePath).toLowerCase();
  const isTestFile =
    basename(filePath).includes('.test.') ||
    basename(filePath).includes('.spec.') ||
    filePath.includes('__tests__');

  // Results
  const result = {
    file: filePath,
    totalLines: lines.length,
    codeLines: 0,
    commentLines: 0,
    validCommentLines: 0,
    excessiveCommentLines: 0,
    blankLines: 0,
    commentRatio: 0,
    excessiveRatio: 0,
    status: 'ok',
    excessiveComments: [],
    suggestions: [],
  };

  let inMultilineComment = false;
  let isFirstCommentBlock = true;
  let firstNonCommentSeen = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Track blank lines
    if (trimmedLine === '') {
      result.blankLines++;
      continue;
    }

    // Track multiline comments
    if (trimmedLine.startsWith('/*') && !trimmedLine.includes('*/')) {
      inMultilineComment = true;
    }

    const isCommentLine =
      inMultilineComment ||
      trimmedLine.startsWith('//') ||
      trimmedLine.startsWith('/*') ||
      trimmedLine.startsWith('*');

    if (trimmedLine.includes('*/')) {
      inMultilineComment = false;
    }

    if (isCommentLine) {
      result.commentLines++;

      // Determine if it's a valid comment
      const isValid = isValidComment(line, i, lines, isFirstCommentBlock && !firstNonCommentSeen);

      // For test files, also check BDD context
      const isBDD = isTestFile && isBDDContext(line, lines, i);

      if (isValid || isBDD) {
        result.validCommentLines++;
      } else {
        result.excessiveCommentLines++;
        result.excessiveComments.push({
          line: i + 1,
          content: trimmedLine.substring(0, 80) + (trimmedLine.length > 80 ? '...' : ''),
        });
      }
    } else {
      result.codeLines++;
      firstNonCommentSeen = true;
      isFirstCommentBlock = false;
    }
  }

  // Calculate ratios
  const totalMeaningfulLines = result.codeLines + result.commentLines;
  if (totalMeaningfulLines > 0) {
    result.commentRatio = Math.round((result.commentLines / totalMeaningfulLines) * 100);
    result.excessiveRatio = Math.round(
      (result.excessiveCommentLines / totalMeaningfulLines) * 100
    );
  }

  // Determine status
  if (result.excessiveRatio > threshold) {
    result.status = 'excessive';
    result.suggestions.push(
      `Consider removing ${result.excessiveCommentLines} excessive comment(s)`,
      'AI-generated code often has too many explanatory comments',
      'Good code should be self-documenting where possible'
    );
  } else if (result.commentRatio > 50) {
    result.status = 'warning';
    result.suggestions.push(
      'High overall comment ratio detected',
      'Review if all comments add value'
    );
  }

  return result;
}

/**
 * Remove excessive comments from a file (--fix mode)
 */
function removeExcessiveComments(filePath, result) {
  if (result.excessiveComments.length === 0) {
    return { modified: false, linesRemoved: 0 };
  }

  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const linesToRemove = new Set(result.excessiveComments.map((c) => c.line - 1));

  const newLines = lines.filter((_, index) => !linesToRemove.has(index));

  writeFileSync(filePath, newLines.join('\n'));

  return {
    modified: true,
    linesRemoved: linesToRemove.size,
  };
}

// =============================================================================
// Output Formatters
// =============================================================================

function formatResult(result, verbose = false) {
  if (result.error) {
    return `${COLORS.red}Error: ${result.error}${COLORS.reset}`;
  }

  const lines = [];
  const statusIcon =
    result.status === 'excessive'
      ? `${COLORS.red}⚠️`
      : result.status === 'warning'
        ? `${COLORS.yellow}⚠️`
        : `${COLORS.green}✅`;

  lines.push(`${statusIcon} ${result.file}${COLORS.reset}`);
  lines.push(
    `   Lines: ${result.totalLines} total | ${result.codeLines} code | ${result.commentLines} comments | ${result.blankLines} blank`
  );
  lines.push(
    `   Ratio: ${result.commentRatio}% total comments | ${COLORS.yellow}${result.excessiveRatio}% excessive${COLORS.reset}`
  );

  if (result.status !== 'ok' || verbose) {
    if (result.validCommentLines > 0) {
      lines.push(
        `   ${COLORS.green}Valid: ${result.validCommentLines} (JSDoc, directives, TODOs)${COLORS.reset}`
      );
    }
    if (result.excessiveCommentLines > 0) {
      lines.push(
        `   ${COLORS.red}Excessive: ${result.excessiveCommentLines}${COLORS.reset}`
      );
    }
  }

  if (verbose && result.excessiveComments.length > 0) {
    lines.push(`\n   ${COLORS.dim}Excessive comments:${COLORS.reset}`);
    for (const comment of result.excessiveComments.slice(0, 10)) {
      lines.push(`   ${COLORS.dim}L${comment.line}: ${comment.content}${COLORS.reset}`);
    }
    if (result.excessiveComments.length > 10) {
      lines.push(
        `   ${COLORS.dim}... and ${result.excessiveComments.length - 10} more${COLORS.reset}`
      );
    }
  }

  if (result.suggestions.length > 0) {
    lines.push(`\n   ${COLORS.cyan}Suggestions:${COLORS.reset}`);
    for (const suggestion of result.suggestions) {
      lines.push(`   - ${suggestion}`);
    }
  }

  return lines.join('\n');
}

// =============================================================================
// Main Execution
// =============================================================================

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const filePath = args.find((a) => !a.startsWith('--'));
  const isJson = args.includes('--json');
  const isFix = args.includes('--fix');
  const isVerbose = args.includes('--verbose') || args.includes('-v');
  const thresholdArg = args.find((a) => a.startsWith('--threshold='));
  const threshold = thresholdArg
    ? parseInt(thresholdArg.split('=')[1], 10)
    : DEFAULT_THRESHOLD;

  if (!filePath) {
    console.log(`${COLORS.bright}Comment Density Analyzer${COLORS.reset}`);
    console.log('');
    console.log('Usage: node scripts/check-comment-density.mjs <file> [options]');
    console.log('');
    console.log('Options:');
    console.log('  --threshold=N  Set threshold percentage (default: 30)');
    console.log('  --json         Output as JSON');
    console.log('  --fix          Remove excessive comments');
    console.log('  --verbose, -v  Show detailed analysis');
    console.log('');
    console.log('Example:');
    console.log('  node scripts/check-comment-density.mjs src/components/Button.tsx');
    process.exit(0);
  }

  // Analyze file
  const result = analyzeFile(filePath, threshold);

  // Fix mode
  if (isFix && result.status !== 'error') {
    const fixResult = removeExcessiveComments(filePath, result);
    if (fixResult.modified) {
      result.fixed = true;
      result.linesRemoved = fixResult.linesRemoved;
    }
  }

  // Output
  if (isJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(formatResult(result, isVerbose));
  }

  // Exit code
  if (result.error) {
    process.exit(2);
  }
  if (result.status === 'excessive') {
    process.exit(1);
  }
  process.exit(0);
}

main().catch((error) => {
  console.error(`${COLORS.red}Error: ${error.message}${COLORS.reset}`);
  process.exit(2);
});
