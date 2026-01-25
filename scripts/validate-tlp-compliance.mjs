#!/usr/bin/env node

/**
 * TLP Compliance Validation Script
 *
 * Validates that all documentation files:
 * 1. Are located in docs/ directory
 * 2. Have proper TLP classification markers
 * 3. Operational files are in private/ subdirectories
 *
 * Usage: node scripts/validate-tlp-compliance.mjs
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const DOCS_DIR = join(ROOT_DIR, 'docs');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// TLP marker patterns (supports both MDX {/* */} and HTML <!-- --> comments)
const TLP_MARKERS = {
  CLEAR: /(?:\{\/\*\s*TLP:CLEAR\s*\*\/\}|<!--\s*TLP:CLEAR\s*-->|TLP:CLEAR)/i,
  AMBER: /(?:\{\/\*\s*TLP:AMBER.*?\*\/\}|<!--\s*TLP:AMBER.*?-->|TLP:AMBER)/i,
};

// Operational filename patterns that should be in private/
const OPERATIONAL_PATTERNS = [
  /-status\.md$/,
  /-summary\.md$/,
  /-report\.md$/,
  /-validation\.md$/,
  /-audit\.md$/,
  /-findings\.md$/,
  /-complete\.md$/,
  /-metrics\.md$/,
  /-analysis\.md$/,
  /COMPLETE\.md$/,
  /STATUS\.md$/,
  /SUMMARY\.md$/,
  /REPORT\.md$/,
  /VALIDATION\.md$/,
  /AUDIT\.md$/,
  /FINDINGS\.md$/,
  /METRICS\.md$/,
  /ANALYSIS\.md$/,
];

// Directories to skip
const SKIP_DIRS = ['node_modules', '.git', '.next', 'dist', 'build', 'coverage'];

// Files to skip validation
const SKIP_FILES = [
  'CHANGELOG.md',
  'LICENSE.md',
  'CODE_OF_CONDUCT.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'SUPPORT.md',
];

let errors = [];
let warnings = [];
let passed = 0;

/**
 * Check if a file should be skipped
 */
function shouldSkipFile(filename) {
  return SKIP_FILES.includes(filename);
}

/**
 * Check if directory should be skipped
 */
function shouldSkipDir(dirPath) {
  const parts = dirPath.split('/');
  return SKIP_DIRS.some((skip) => parts.includes(skip));
}

/**
 * Check if filename matches operational pattern
 */
function isOperationalFile(filename) {
  return OPERATIONAL_PATTERNS.some((pattern) => pattern.test(filename));
}

/**
 * Check if file is in a private directory
 */
function isInPrivateDir(filePath) {
  return filePath.includes('/private/');
}

/**
 * Read first 10 lines of file to check for TLP marker
 */
function checkTLPMarker(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').slice(0, 10).join('\n');

    if (TLP_MARKERS.CLEAR.test(lines)) {
      return 'CLEAR';
    }
    if (TLP_MARKERS.AMBER.test(lines)) {
      return 'AMBER';
    }
    return null;
  } catch (error) {
    errors.push(`Failed to read ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Check for operational content indicators
 */
function hasOperationalContent(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const first500 = content.slice(0, 2000);

    const indicators = [
      /Status:\s*✅.*COMPLETE/i,
      /Status:\s*COMPLETE/i,
      /Implementation Complete/i,
      /Generated:\s*\d{4}-\d{2}-\d{2}/,
      /Overall\s+Score:\s*\d+\/\d+/i,  // More specific: "Overall Score: X/Y"
      /Validation Score:/i,
      /Performance Metrics Summary/i,
      /Success Metrics:/i,
    ];

    return indicators.some((pattern) => pattern.test(first500));
  } catch (error) {
    return false;
  }
}

/**
 * Recursively find all markdown files
 */
function findMarkdownFiles(dir, fileList = []) {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);

    if (shouldSkipDir(filePath)) {
      continue;
    }

    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      findMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md') && !shouldSkipFile(file)) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

/**
 * Validate a single markdown file
 */
function validateFile(filePath) {
  const relativePath = relative(ROOT_DIR, filePath);
  const filename = filePath.split('/').pop();
  const isInDocs = relativePath.startsWith('docs/');
  const isPrivate = isInPrivateDir(relativePath);
  const isOperational = isOperationalFile(filename);
  const hasOperationalIndicators = hasOperationalContent(filePath);
  const tlpMarker = checkTLPMarker(filePath);

  // Skip root-level allowed files
  if (SKIP_FILES.includes(filename) && !relativePath.includes('/')) {
    passed++;
    return;
  }

  // Rule 1: All markdown docs should be in docs/
  if (!isInDocs && !relativePath.startsWith('.github/') && !SKIP_FILES.includes(filename)) {
    errors.push(
      `${colors.red}❌ ${relativePath}${colors.reset} - Documentation file outside docs/ directory`
    );
    return;
  }

  // Skip private files (they should have TLP:AMBER but we don't enforce)
  if (isPrivate) {
    if (tlpMarker === 'AMBER' || tlpMarker === null) {
      passed++;
      return;
    }
    if (tlpMarker === 'CLEAR') {
      warnings.push(
        `${colors.yellow}⚠️  ${relativePath}${colors.reset} - Private file marked as TLP:CLEAR (should be TLP:AMBER)`
      );
      return;
    }
  }

  // Rule 2: Public docs must have TLP:CLEAR marker
  if (isInDocs && !isPrivate && !tlpMarker) {
    errors.push(
      `${colors.red}❌ ${relativePath}${colors.reset} - Missing TLP classification marker`
    );
    return;
  }

  // Rule 3: Operational files should be in private/
  if (isInDocs && !isPrivate && (isOperational || hasOperationalIndicators)) {
    errors.push(
      `${colors.red}❌ ${relativePath}${colors.reset} - Operational file in public docs (should be in private/)`
    );
    return;
  }

  // Rule 4: Public docs should be TLP:CLEAR
  if (isInDocs && !isPrivate && tlpMarker === 'AMBER') {
    errors.push(
      `${colors.red}❌ ${relativePath}${colors.reset} - Public doc marked as TLP:AMBER (should be in private/ or marked TLP:CLEAR)`
    );
    return;
  }

  passed++;
}

/**
 * Main validation function
 */
function main() {
  console.log(`${colors.cyan}🔍 TLP Compliance Validation${colors.reset}\n`);

  // Find all markdown files in docs/
  const docsFiles = findMarkdownFiles(DOCS_DIR);

  // Root-level files are allowed and don't need TLP validation
  // (They're covered by validate-doc-location.mjs)

  const allFiles = docsFiles;

  console.log(`Found ${allFiles.length} markdown files to validate\n`);

  // Validate each file
  for (const file of allFiles) {
    validateFile(file);
  }

  // Print results
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  if (warnings.length > 0) {
    console.log(`${colors.yellow}⚠️  Warnings (${warnings.length}):${colors.reset}\n`);
    warnings.forEach((w) => console.log(w));
    console.log('');
  }

  if (errors.length > 0) {
    console.log(`${colors.red}❌ Errors (${errors.length}):${colors.reset}\n`);
    errors.forEach((e) => console.log(e));
    console.log('');
  }

  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Warnings: ${warnings.length}${colors.reset}`);
  console.log(`${colors.red}❌ Errors: ${errors.length}${colors.reset}\n`);

  if (errors.length > 0) {
    console.log(`${colors.red}❌ TLP compliance check FAILED${colors.reset}\n`);
    console.log(`Fix errors by:`);
    console.log(`1. Add TLP:CLEAR marker to public docs:`);
    console.log(`   - HTML comment: <!-- TLP:CLEAR --> (recommended for .md files)`);
    console.log(`   - MDX comment: {/* TLP:CLEAR */} (for .mdx files)`);
    console.log(`2. Move operational files to docs/*/private/ directories`);
    console.log(`3. Move docs outside docs/ to appropriate location\n`);
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log(`${colors.yellow}⚠️  TLP compliance check PASSED with warnings${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.green}✅ TLP compliance check PASSED${colors.reset}\n`);
    process.exit(0);
  }
}

main();
