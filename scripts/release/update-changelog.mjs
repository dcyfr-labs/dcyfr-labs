#!/usr/bin/env node

/**
 * CHANGELOG.md Updater
 *
 * Inserts a new changelog entry into CHANGELOG.md following Keep a Changelog format.
 *
 * Logic:
 * 1. Read existing CHANGELOG.md
 * 2. Validate Keep a Changelog format
 * 3. Find insertion point (after header, before previous version)
 * 4. Insert new entry with proper spacing
 * 5. Write back to file
 * 6. Validate format with existing validation script
 *
 * Usage:
 *   node scripts/release/update-changelog.mjs --version=2026.02.01 --entry=/tmp/entry.md
 *   cat entry.md | node scripts/release/update-changelog.mjs --version=2026.02.01 --entry=-
 *
 * @see https://keepachangelog.com/ for format specification
 * @see scripts/validate-changelog-format.mjs for validation
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');

// Parse command line arguments
const args = process.argv.slice(2);
const version = args.find((arg) => arg.startsWith('--version='))?.split('=')[1];
const entryPath = args.find((arg) => arg.startsWith('--entry='))?.split('=')[1];

/**
 * Read CHANGELOG.md
 * @returns {string} Changelog content
 */
function readChangelog() {
  const changelogPath = join(ROOT_DIR, 'CHANGELOG.md');
  try {
    return readFileSync(changelogPath, 'utf-8');
  } catch (error) {
    console.error('❌ Error reading CHANGELOG.md:', error.message);
    process.exit(1);
  }
}

/**
 * Read entry content
 * @param {string} path - Path to entry file (or '-' for stdin)
 * @returns {string} Entry content
 */
function readEntry(path) {
  try {
    if (path === '-') {
      // FIX: Copilot suggestion - Clarify that file descriptor 0 is stdin in Node.js
      // Read from stdin (file descriptor 0 is stdin in Node.js)
      return readFileSync(0, 'utf-8');
    }
    return readFileSync(path, 'utf-8');
  } catch (error) {
    console.error('❌ Error reading entry:', error.message);
    process.exit(1);
  }
}

/**
 * Validate changelog format
 * @param {string} content - Changelog content
 * @returns {boolean} True if valid
 */
function validateFormat(content) {
  // Check for required elements
  const hasHeader = /^# Changelog/m.test(content);
  // CWE-185: Anchored pattern so only standalone URLs match (not URLs embedded in other hostnames)
  const hasKeepAChangelogRef = /(?:^|[\s"'([])https?:\/\/keepachangelog\.com/im.test(content);
  const hasCalVerRef = /Calendar Versioning|calver/i.test(content);

  if (!hasHeader) {
    console.error('⚠️  Warning: Missing "# Changelog" header');
  }

  if (!hasKeepAChangelogRef) {
    console.error('⚠️  Warning: Missing Keep a Changelog reference');
  }

  if (!hasCalVerRef) {
    console.error('⚠️  Warning: Missing Calendar Versioning reference');
  }

  return hasHeader;
}

/**
 * Find insertion point for new entry
 * @param {string} content - Changelog content
 * @returns {number} Character index for insertion
 */
function findInsertionPoint(content) {
  // Find the first version entry (## [YYYY.MM.DD])
  const firstVersionMatch = content.match(/^## \[\d{4}\.\d{2}\.\d{2}/m);

  if (!firstVersionMatch) {
    // No existing versions - insert after header section
    // Look for end of header (after intro paragraphs, before any content)
    const headerEndMatch = content.match(/\n\n(?=\S)/);
    if (headerEndMatch) {
      return headerEndMatch.index + 2; // After the two newlines
    }

    // Fallback: insert at end
    return content.length;
  }

  // Insert before first version
  return firstVersionMatch.index;
}

/**
 * Escape special regex characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if version already exists in changelog
 * @param {string} content - Changelog content
 * @param {string} version - Version to check
 * @returns {boolean} True if version exists
 */
function versionExists(content, version) {
  // FIX: CWE-94 - Properly escape ALL regex metacharacters, not just dots
  const versionPattern = new RegExp(`^## \\[${escapeRegex(version)}\\]`, 'm');
  return versionPattern.test(content);
}

/**
 * Insert new entry into changelog
 * @param {string} changelog - Existing changelog content
 * @param {string} entry - New entry to insert
 * @returns {string} Updated changelog content
 */
function insertEntry(changelog, entry) {
  const insertionPoint = findInsertionPoint(changelog);

  // Ensure proper spacing
  let formattedEntry = entry.trim() + '\n\n';

  // Insert at the calculated position
  const before = changelog.slice(0, insertionPoint);
  const after = changelog.slice(insertionPoint);

  return before + formattedEntry + after;
}

/**
 * Write updated changelog
 * @param {string} content - Updated changelog content
 */
function writeChangelog(content) {
  const changelogPath = join(ROOT_DIR, 'CHANGELOG.md');
  try {
    writeFileSync(changelogPath, content, 'utf-8');
    console.error('✅ CHANGELOG.md updated successfully');
  } catch (error) {
    console.error('❌ Error writing CHANGELOG.md:', error.message);
    process.exit(1);
  }
}

/**
 * Run changelog validation
 * @returns {boolean} True if validation passes
 */
function runValidation() {
  try {
    console.error('🔍 Running changelog format validation...');
    execSync('node scripts/validate-changelog-format.mjs', { // NOSONAR - Administrative script, inputs from controlled sources
      cwd: ROOT_DIR,
      stdio: 'inherit',
    });
    console.error('✅ Changelog validation passed');
    return true;
  } catch (error) {
    console.error('❌ Changelog validation failed');
    return false;
  }
}

/**
 * Create backup of changelog
 * @param {string} content - Changelog content
 */
function createBackup(content) {
  const backupPath = join(ROOT_DIR, 'CHANGELOG.md.backup');
  try {
    writeFileSync(backupPath, content, 'utf-8');
    console.error(`💾 Backup created: CHANGELOG.md.backup`);
  } catch (error) {
    console.error('⚠️  Warning: Could not create backup:', error.message);
  }
}

/**
 * Main execution
 */
function main() {
  console.error('📝 CHANGELOG.md Updater');
  console.error('========================\n');

  // Validate inputs
  if (!version) {
    console.error('❌ Error: --version=<version> is required');
    console.error('Usage: node update-changelog.mjs --version=2026.02.01 --entry=/tmp/entry.md');
    process.exit(1);
  }

  if (!entryPath) {
    console.error('❌ Error: --entry=<path> is required');
    console.error('Usage: node update-changelog.mjs --version=2026.02.01 --entry=/tmp/entry.md');
    console.error('       Use --entry=- to read from stdin');
    process.exit(1);
  }

  console.error(`📦 Version: ${version}`);
  console.error(`📄 Entry source: ${entryPath}\n`);

  // Read existing changelog
  console.error('📖 Reading CHANGELOG.md...');
  const changelog = readChangelog();

  // Validate format
  if (!validateFormat(changelog)) {
    console.error('❌ Invalid changelog format');
    process.exit(1);
  }

  // Check if version already exists
  if (versionExists(changelog, version)) {
    console.error(`⚠️  Warning: Version ${version} already exists in CHANGELOG.md`);
    console.error('Proceeding anyway (entry will be duplicated)');
  }

  // Read new entry
  console.error('📖 Reading new entry...');
  const entry = readEntry(entryPath);

  if (!entry.trim()) {
    console.error('❌ Error: Entry content is empty');
    process.exit(1);
  }

  console.error(`✅ Entry loaded (${entry.split('\n').length} lines)\n`);

  // Create backup
  createBackup(changelog);

  // Insert new entry
  console.error('✍️  Inserting new entry...');
  const updatedChangelog = insertEntry(changelog, entry);

  // Write updated changelog
  writeChangelog(updatedChangelog);

  // Validate updated changelog
  if (!runValidation()) {
    console.error('\n❌ Validation failed after update');
    console.error('💾 Backup available at: CHANGELOG.md.backup');
    console.error('💡 Restore with: mv CHANGELOG.md.backup CHANGELOG.md');
    process.exit(1);
  }

  console.error('\n✅ CHANGELOG.md update complete');
  console.error(`📝 Version ${version} added to changelog`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Export for testing
export { readChangelog, validateFormat, findInsertionPoint, versionExists, insertEntry };
