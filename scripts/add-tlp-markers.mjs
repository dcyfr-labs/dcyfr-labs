#!/usr/bin/env node

/**
 * Bulk TLP Marker Addition Script
 *
 * Automatically adds TLP:CLEAR markers to public documentation files
 * that are missing classification markers.
 *
 * Usage: node scripts/add-tlp-markers.mjs [--dry-run]
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

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

// TLP marker to add
const TLP_CLEAR_MARKER = '{/* TLP:CLEAR */}\n\n';

// Parse command line arguments
const isDryRun = process.argv.includes('--dry-run');

// Directories to skip
const SKIP_DIRS = ['node_modules', '.git', '.next', 'dist', 'build', 'coverage'];

// Track results
let processed = 0;
let skipped = 0;
let errors = [];

/**
 * Check if file already has TLP marker
 */
function hasTLPMarker(content) {
  const first50Lines = content.split('\n').slice(0, 50).join('\n');
  return /\{\/\*\s*TLP:(CLEAR|AMBER).*?\*\/\}|TLP:(CLEAR|AMBER)/i.test(first50Lines);
}

/**
 * Check if file is in private directory
 */
function isInPrivateDir(filePath) {
  return filePath.includes('/private/');
}

/**
 * Check if directory should be skipped
 */
function shouldSkipDir(dirPath) {
  const parts = dirPath.split('/');
  return SKIP_DIRS.some((skip) => parts.includes(skip));
}

/**
 * Add TLP:CLEAR marker to file
 */
function addTLPMarker(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');

    // Skip if already has marker
    if (hasTLPMarker(content)) {
      skipped++;
      return { success: true, reason: 'already-marked' };
    }

    // Skip private files (they should have TLP:AMBER)
    if (isInPrivateDir(filePath)) {
      skipped++;
      return { success: true, reason: 'private-file' };
    }

    // Add marker at the beginning
    const newContent = TLP_CLEAR_MARKER + content;

    if (!isDryRun) {
      writeFileSync(filePath, newContent, 'utf-8');
    }

    processed++;
    return { success: true, reason: 'added' };
  } catch (error) {
    errors.push({ filePath, error: error.message });
    return { success: false, reason: error.message };
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
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

/**
 * Main function
 */
function main() {
  console.log(`${colors.cyan}📝 Bulk TLP Marker Addition${colors.reset}\n`);

  if (isDryRun) {
    console.log(`${colors.yellow}🔍 DRY RUN MODE - No files will be modified${colors.reset}\n`);
  }

  // Find all markdown files in docs/
  const docsFiles = findMarkdownFiles(DOCS_DIR);

  console.log(`Found ${docsFiles.length} markdown files in docs/\n`);
  console.log(`${colors.cyan}Processing files...${colors.reset}\n`);

  // Process each file
  const results = {
    added: [],
    alreadyMarked: [],
    privateFiles: [],
    errors: [],
  };

  for (const filePath of docsFiles) {
    const relativePath = relative(ROOT_DIR, filePath);
    const result = addTLPMarker(filePath);

    if (result.success) {
      if (result.reason === 'added') {
        results.added.push(relativePath);
        console.log(`${colors.green}✅ Added marker: ${relativePath}${colors.reset}`);
      } else if (result.reason === 'already-marked') {
        results.alreadyMarked.push(relativePath);
      } else if (result.reason === 'private-file') {
        results.privateFiles.push(relativePath);
      }
    } else {
      results.errors.push({ path: relativePath, error: result.reason });
      console.log(`${colors.red}❌ Error: ${relativePath} - ${result.reason}${colors.reset}`);
    }
  }

  // Print summary
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  console.log(`${colors.green}✅ Markers added: ${results.added.length}${colors.reset}`);
  console.log(`${colors.blue}ℹ️  Already marked: ${results.alreadyMarked.length}${colors.reset}`);
  console.log(
    `${colors.yellow}⏭️  Skipped (private): ${results.privateFiles.length}${colors.reset}`
  );
  console.log(`${colors.red}❌ Errors: ${results.errors.length}${colors.reset}\n`);

  if (results.errors.length > 0) {
    console.log(`${colors.red}Errors encountered:${colors.reset}\n`);
    results.errors.forEach(({ path, error }) => {
      console.log(`${colors.red}  ❌ ${path}: ${error}${colors.reset}`);
    });
    console.log('');
  }

  if (isDryRun) {
    console.log(
      `${colors.yellow}DRY RUN COMPLETE - Run without --dry-run to apply changes${colors.reset}\n`
    );
  } else {
    console.log(`${colors.green}✅ TLP markers successfully added${colors.reset}\n`);

    if (results.added.length > 0) {
      console.log(`${colors.cyan}Next steps:${colors.reset}`);
      console.log(`1. Run validation: npm run check:docs`);
      console.log(`2. Review changes: git diff docs/`);
      console.log(
        `3. Commit changes: git add docs/ && git commit -m "docs: add TLP:CLEAR markers"\n`
      );
    }
  }

  process.exit(results.errors.length > 0 ? 1 : 0);
}

main();
