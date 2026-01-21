#!/usr/bin/env node

/**
 * Documentation Archive Cleanup Script
 *
 * Reviews archived files and suggests deletions based on retention policy:
 * - Operations Reports: Keep 1 year, then delete
 * - Phase Completion Reports: Keep indefinitely
 * - Deprecated Features: Keep 6 months after deprecation, then delete
 * - Superseded Docs: Keep 3 months after consolidation, then delete
 *
 * Usage:
 *   node scripts/docs-archive-cleanup.mjs           # Interactive mode
 *   node scripts/docs-archive-cleanup.mjs --auto    # Auto-delete (dangerous!)
 *   npm run docs:cleanup                            # Interactive mode
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const archiveDir = path.join(rootDir, 'docs', 'archive');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

// Retention policy (in days)
const RETENTION_POLICY = {
  operations: 365, // 1 year
  phases: Infinity, // Keep indefinitely
  deprecated: 180, // 6 months
  superseded: 90, // 3 months
};

// Categories and their patterns
const FILE_CATEGORIES = {
  operations: /operations|session|monthly|deployment/i,
  phases: /phase-\d|completion|milestone/i,
  deprecated: /deprecated|legacy|old-/i,
  superseded: /superseded|archived|consolidated/i,
};

// Analysis results
const stats = {
  totalFiles: 0,
  byCategory: {},
  deletionCandidates: [],
  kept: [],
};

/**
 * Get file age in days
 */
function getFileAgeDays(filePath) {
  const stat = fs.statSync(filePath);
  const now = Date.now();
  const mtime = stat.mtimeMs;
  return Math.floor((now - mtime) / (1000 * 60 * 60 * 24));
}

/**
 * Categorize file based on filename and path
 */
function categorizeFile(fileName, filePath) {
  for (const [category, pattern] of Object.entries(FILE_CATEGORIES)) {
    if (pattern.test(fileName) || pattern.test(filePath)) {
      return category;
    }
  }
  return 'other';
}

/**
 * Get all files in archive directory recursively
 */
function getArchiveFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getArchiveFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Analyze file for deletion eligibility
 */
function analyzeFile(filePath) {
  const fileName = path.basename(filePath);
  const relativePath = path.relative(archiveDir, filePath);
  const ageDays = getFileAgeDays(filePath);
  const category = categorizeFile(fileName, relativePath);
  const retentionDays = RETENTION_POLICY[category] || RETENTION_POLICY.superseded;
  const shouldDelete = ageDays > retentionDays;

  stats.totalFiles++;
  stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

  return {
    filePath,
    relativePath,
    fileName,
    ageDays,
    category,
    retentionDays,
    shouldDelete,
    size: fs.statSync(filePath).size,
  };
}

/**
 * Prompt user for confirmation
 */
async function promptConfirmation(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Format file size
 */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/**
 * Main cleanup function
 */
async function cleanupArchive() {
  const autoMode = process.argv.includes('--auto');

  console.log(`${colors.blue}${colors.bold}📦 Documentation Archive Cleanup${colors.reset}\n`);
  console.log(`${colors.dim}Scanning ${archiveDir}...${colors.reset}\n`);

  if (!fs.existsSync(archiveDir)) {
    console.log(`${colors.red}Archive directory not found: ${archiveDir}${colors.reset}`);
    process.exit(1);
  }

  // Get all files
  const files = getArchiveFiles(archiveDir);
  console.log(`Found ${files.length} archived files\n`);

  // Analyze each file
  const analyses = files.map(analyzeFile);
  const deletionCandidates = analyses.filter((a) => a.shouldDelete);
  const kept = analyses.filter((a) => !a.shouldDelete);

  // Report by category
  console.log(`${colors.blue}📊 Archive Summary by Category:${colors.reset}\n`);
  for (const [category, count] of Object.entries(stats.byCategory)) {
    const policy = RETENTION_POLICY[category];
    const policyStr = policy === Infinity ? 'Keep indefinitely' : `${policy} days`;
    console.log(`  ${category.padEnd(15)} ${count.toString().padStart(3)} files  (${policyStr})`);
  }
  console.log();

  // Show deletion candidates
  if (deletionCandidates.length === 0) {
    console.log(`${colors.green}✓ No files exceed retention policy${colors.reset}\n`);
    console.log(`${colors.dim}Next cleanup: ${getNextCleanupDate()}${colors.reset}`);
    process.exit(0);
  }

  console.log(
    `${colors.yellow}⚠️  Deletion Candidates (${deletionCandidates.length} files):${colors.reset}\n`
  );

  let totalSize = 0;
  deletionCandidates.forEach((file, index) => {
    totalSize += file.size;
    console.log(`${index + 1}. ${colors.yellow}${file.relativePath}${colors.reset}`);
    console.log(
      `   Category: ${file.category} | Age: ${file.ageDays} days (limit: ${file.retentionDays})`
    );
    console.log(`   Size: ${formatSize(file.size)}`);
    console.log();
  });

  console.log(`${colors.dim}Total size to reclaim: ${formatSize(totalSize)}${colors.reset}\n`);

  // Interactive deletion
  if (autoMode) {
    console.log(`${colors.red}🚨 AUTO MODE: Deleting all candidates...${colors.reset}\n`);
    deletionCandidates.forEach((file) => {
      fs.unlinkSync(file.filePath);
      console.log(`${colors.green}✓${colors.reset} Deleted ${file.relativePath}`);
    });
  } else {
    const confirmed = await promptConfirmation(
      `\n${colors.red}Delete all ${deletionCandidates.length} files?${colors.reset}`
    );

    if (confirmed) {
      console.log();
      deletionCandidates.forEach((file) => {
        fs.unlinkSync(file.filePath);
        console.log(`${colors.green}✓${colors.reset} Deleted ${file.relativePath}`);
      });
      console.log(`\n${colors.green}Cleanup complete!${colors.reset}`);
    } else {
      console.log(`\n${colors.yellow}Cleanup cancelled${colors.reset}`);
    }
  }

  // Show kept files
  console.log(`\n${colors.dim}Files kept (${kept.length}):${colors.reset}`);
  kept.forEach((file) => {
    const daysRemaining = file.retentionDays === Infinity ? '∞' : file.retentionDays - file.ageDays;
    console.log(
      `  ${file.relativePath.padEnd(50)} ${daysRemaining.toString().padStart(4)} days remaining`
    );
  });

  console.log(`\n${colors.dim}Next cleanup: ${getNextCleanupDate()}${colors.reset}\n`);
}

/**
 * Get next cleanup date (next quarter)
 */
function getNextCleanupDate() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  // Quarterly months: 2 (Mar), 5 (Jun), 8 (Sep), 11 (Dec)
  const quarters = [2, 5, 8, 11];
  const nextQuarter = quarters.find((q) => q > month) || quarters[0];
  const nextYear = nextQuarter < month ? year + 1 : year;

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${months[nextQuarter]} ${nextYear}`;
}

// Run cleanup
cleanupArchive().catch((error) => {
  console.error(`${colors.red}Error during cleanup:${colors.reset}`, error);
  process.exit(1);
});
