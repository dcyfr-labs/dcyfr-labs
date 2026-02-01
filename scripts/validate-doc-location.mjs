#!/usr/bin/env node

/**
 * Documentation Location Validator
 *
 * Ensures no documentation files exist outside the docs/ directory
 * (except for root-level special files like README.md, CONTRIBUTING.md)
 *
 * Usage: node scripts/validate-doc-location.mjs
 */

import { readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// Allowed root-level documentation files
const ALLOWED_ROOT_DOCS = [
  'README.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'LICENSE.md',
  'CODE_OF_CONDUCT.md',
  'SECURITY.md',
  'SUPPORT.md',
  'AGENTS.md',
  'CLAUDE.md',
];

// Directories to skip
const SKIP_DIRS = [
  // Build outputs and dependencies
  'node_modules',
  '.next',
  'dist',
  'build',
  'coverage',

  // Git and VCS
  '.git',

  // Project documentation (checked separately)
  'docs',

  // Source code and tests (technical READMEs allowed)
  'e2e',
  'src',
  'tests',
  'scripts',

  // Public assets (no documentation)
  'public',

  // Configuration and tooling
  'certs',
  'codeql',
  '.vercel', // Vercel deployment config
  '.github', // GitHub workflows and templates
  '.vscode', // Editor config

  // AI tooling (private/internal)
  '.claude',
  '.opencode',
  '.agent',
  'skills', // External skills directory
];

// Allowed exceptions for specific directories that need READMEs
const ALLOWED_EXCEPTIONS = [
  'reports/README.md', // Versioned testing reports
  'reports/performance/baselines/README.md', // Performance budget configuration guide (technical)
  '.vercel/README.md', // Vercel config documentation (gitignored)
  'tests/README.md', // Test setup documentation (technical)
  'scripts/README.md', // Script documentation (technical)
  '.github/PULL_REQUEST_TEMPLATE.md', // GitHub template
  '.github/copilot-instructions.md', // AI instructions
  '.github/QUICK_REFERENCE_CI_CD.md', // CI/CD reference
  'certs/README.md', // Certificate documentation (technical)
];

// Colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

let violations = [];

/**
 * Get list of deleted files from git staging area
 */
function getDeletedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=D', {
      cwd: ROOT_DIR,
      encoding: 'utf8',
    });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    // If not in a git repo or no staged changes, return empty array
    return [];
  }
}

/**
 * Check if directory should be skipped
 */
function shouldSkipDir(dirName) {
  return SKIP_DIRS.includes(dirName) || dirName.startsWith('.');
}

/**
 * Find all markdown files in a directory (non-recursive for root)
 */
function findRootMarkdownFiles(dir) {
  const files = readdirSync(dir);
  const mdFiles = [];

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isFile() && file.endsWith('.md')) {
      mdFiles.push(file);
    }
  }

  return mdFiles;
}

/**
 * Recursively find markdown files in subdirectories
 */
function findMarkdownInSubdirs(dir, currentDepth = 0, maxDepth = 3, foundFiles = []) {
  if (currentDepth > maxDepth) return foundFiles;

  const items = readdirSync(dir);

  for (const item of items) {
    const itemPath = join(dir, item);

    try {
      const stat = statSync(itemPath);

      if (stat.isDirectory() && !shouldSkipDir(item)) {
        // Recursively check subdirectories
        findMarkdownInSubdirs(itemPath, currentDepth + 1, maxDepth, foundFiles);
      } else if (stat.isFile() && item.endsWith('.md')) {
        foundFiles.push(relative(ROOT_DIR, itemPath));
      }
    } catch (error) {
      // Skip files/dirs we can't read
    }
  }

  return foundFiles;
}

/**
 * Main validation
 */
function main() {
  console.log(`${colors.cyan}📁 Documentation Location Validation${colors.reset}\n`);

  // Get list of deleted files to exclude from validation
  const deletedFiles = getDeletedFiles();

  if (deletedFiles.length > 0) {
    console.log(
      `${colors.yellow}⏭️  Skipping ${deletedFiles.length} deleted file(s)${colors.reset}\n`
    );
  }

  // Check root-level markdown files
  const rootMdFiles = findRootMarkdownFiles(ROOT_DIR);

  for (const file of rootMdFiles) {
    // Skip if this file is being deleted
    if (deletedFiles.includes(file)) {
      continue;
    }

    if (!ALLOWED_ROOT_DOCS.includes(file)) {
      violations.push({
        file,
        message: 'Documentation file in root directory (should be in docs/)',
      });
    }
  }

  // Check for markdown files in non-docs directories
  const subsInRoot = readdirSync(ROOT_DIR).filter((item) => {
    const itemPath = join(ROOT_DIR, item);
    const stat = statSync(itemPath);
    return stat.isDirectory() && !shouldSkipDir(item);
  });

  for (const subdir of subsInRoot) {
    const subdirPath = join(ROOT_DIR, subdir);
    const mdFiles = findMarkdownInSubdirs(subdirPath);

    for (const file of mdFiles) {
      // Skip if this file is being deleted
      if (deletedFiles.includes(file)) {
        continue;
      }

      // Skip if this file is in the allowed exceptions list
      if (ALLOWED_EXCEPTIONS.includes(file)) {
        continue;
      }

      violations.push({
        file,
        message: `Documentation file outside docs/ (found in ${subdir}/)`,
      });
    }
  }

  // Print results
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  if (violations.length > 0) {
    console.log(
      `${colors.red}❌ Found ${violations.length} documentation file(s) in wrong location:${colors.reset}\n`
    );

    violations.forEach(({ file, message }) => {
      console.log(`${colors.red}❌ ${file}${colors.reset}`);
      console.log(`   ${message}\n`);
    });

    console.log(`${colors.yellow}Fix by moving files to docs/ directory:${colors.reset}`);
    console.log(`  mv <file> docs/<category>/<file>\n`);
    console.log(`See docs/governance/DOCS_GOVERNANCE.md for placement guidelines.\n`);

    process.exit(1);
  } else {
    console.log(`${colors.green}✅ All documentation files are properly located${colors.reset}\n`);
    process.exit(0);
  }
}

main();
