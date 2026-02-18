#!/usr/bin/env node

/**
 * Automated CalVer Version Bumper
 *
 * Automatically increments package.json version using Calendar Versioning (CalVer).
 * Format: YYYY.MM.DD[.MICRO]
 *
 * Logic:
 * 1. Get current date (YYYY.MM.DD)
 * 2. Check for existing git tags with same date
 * 3. If tags exist: Find highest MICRO, increment by 1
 * 4. If no tags: Use base version (YYYY.MM.DD)
 * 5. Update package.json and package-lock.json
 * 6. Output new version to stdout
 *
 * Usage:
 *   node scripts/release/bump-version.mjs
 *   node scripts/release/bump-version.mjs --dry-run
 *   node scripts/release/bump-version.mjs --force-micro
 *
 * Environment:
 *   DRY_RUN=true - Don't write files, just output version
 *
 * @see docs/operations/VERSIONING.md for CalVer specification
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run') || process.env.DRY_RUN === 'true';
const forceMicro = args.includes('--force-micro');

/**
 * Get current date in CalVer format (YYYY.MM.DD)
 */
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

/**
 * Get all git tags matching a pattern
 * @param {string} pattern - Tag pattern to match (e.g., "2026.02.01*")
 * @returns {string[]} Array of matching tags
 */
function getMatchingTags(pattern) {
  try {
    const output = execSync(`git tag -l "${pattern}"`, { // NOSONAR - Administrative script, inputs from controlled sources
      cwd: ROOT_DIR,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();

    if (!output) {
      return [];
    }

    return output.split('\n').filter(Boolean);
  } catch (error) {
    // If git command fails, return empty array
    if (error.status !== 0) {
      // FIX: Copilot suggestion - Include exit code in error message for debugging
      console.error(
        `⚠️  Warning: Failed to fetch git tags (exit code: ${error.status}):`,
        error.message
      );
      return [];
    }
    throw error;
  }
}

/**
 * Parse MICRO version from tag
 * @param {string} tag - Tag in format "YYYY.MM.DD" or "YYYY.MM.DD.MICRO"
 * @returns {number} MICRO version (0 if base version)
 */
function parseMicroVersion(tag) {
  const parts = tag.split('.');
  if (parts.length === 4) {
    const micro = parseInt(parts[3], 10);
    return isNaN(micro) ? 0 : micro;
  }
  return 0; // Base version has MICRO = 0
}

/**
 * Find highest MICRO version from tags
 * @param {string[]} tags - Array of tags
 * @returns {number} Highest MICRO version found
 */
function findHighestMicro(tags) {
  if (tags.length === 0) {
    return 0;
  }

  const microVersions = tags.map(parseMicroVersion);
  return Math.max(...microVersions);
}

/**
 * Calculate new version based on existing tags
 * @param {string} baseVersion - Base version (YYYY.MM.DD)
 * @param {boolean} forceMicro - Force MICRO increment even if no tags exist
 * @returns {string} New version string
 */
function calculateNewVersion(baseVersion, forceMicro = false) {
  // Check for existing tags with this date
  const existingTags = getMatchingTags(`${baseVersion}*`);

  console.error(`📅 Base version: ${baseVersion}`);
  console.error(
    `🔍 Found ${existingTags.length} existing tag(s): ${existingTags.join(', ') || 'none'}`
  );

  if (existingTags.length === 0 && !forceMicro) {
    // No existing tags - use base version
    console.error(`✅ Using base version (first deploy today)`);
    return baseVersion;
  }

  // Tags exist - find highest MICRO and increment
  const highestMicro = findHighestMicro(existingTags);
  const newMicro = highestMicro + 1;
  const newVersion = `${baseVersion}.${newMicro}`;

  console.error(`📦 Previous highest MICRO: ${highestMicro}`);
  console.error(`✅ New version: ${newVersion} (deploy #${newMicro + 1} today)`);

  return newVersion;
}

/**
 * Update package.json with new version
 * @param {string} newVersion - New version string
 */
function updatePackageJson(newVersion) {
  const packageJsonPath = join(ROOT_DIR, 'package.json');
  const packageLockPath = join(ROOT_DIR, 'package-lock.json');

  try {
    // Read and parse package.json
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const oldVersion = packageJson.version;

    // Update version
    packageJson.version = newVersion;

    if (isDryRun) {
      console.error(`🔍 [DRY RUN] Would update package.json: ${oldVersion} → ${newVersion}`);
    } else {
      // Write updated package.json
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
      console.error(`✅ Updated package.json: ${oldVersion} → ${newVersion}`);

      // Update package-lock.json if it exists
      try {
        const packageLock = JSON.parse(readFileSync(packageLockPath, 'utf-8'));
        packageLock.version = newVersion;

        // Update packages[""] version (root package in lockfile v2/v3)
        if (packageLock.packages && packageLock.packages['']) {
          packageLock.packages[''].version = newVersion;
        }

        writeFileSync(packageLockPath, JSON.stringify(packageLock, null, 2) + '\n', 'utf-8');
        console.error(`✅ Updated package-lock.json: ${oldVersion} → ${newVersion}`);
      } catch (lockError) {
        console.error(`⚠️  Warning: Could not update package-lock.json:`, lockError.message);
      }
    }
  } catch (error) {
    console.error(`❌ Error updating package.json:`, error.message);
    process.exit(1);
  }
}

/**
 * Validate CalVer format
 * @param {string} version - Version string to validate
 * @returns {boolean} True if valid CalVer format
 */
function validateCalVerFormat(version) {
  // Regex: YYYY.MM.DD or YYYY.MM.DD.MICRO
  const calverRegex = /^(20\d{2})\.(0[1-9]|1[0-2])\.(0[1-9]|[12]\d|3[01])(\.\d+)?$/;
  return calverRegex.test(version);
}

/**
 * Main execution
 */
function main() {
  console.error('🚀 CalVer Version Bumper');
  console.error('========================\n');

  // Get base version from current date
  const baseVersion = getCurrentDate();

  if (!validateCalVerFormat(baseVersion)) {
    console.error(`❌ Invalid CalVer format generated: ${baseVersion}`);
    process.exit(1);
  }

  // Calculate new version
  const newVersion = calculateNewVersion(baseVersion, forceMicro);

  if (!validateCalVerFormat(newVersion)) {
    console.error(`❌ Invalid CalVer format calculated: ${newVersion}`);
    process.exit(1);
  }

  // Update package.json (unless dry-run)
  updatePackageJson(newVersion);

  // Output new version to stdout (for GitHub Actions)
  console.log(newVersion);

  console.error(`\n✅ Version bump complete: ${newVersion}`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Export for testing
export {
  getCurrentDate,
  getMatchingTags,
  parseMicroVersion,
  findHighestMicro,
  calculateNewVersion,
  validateCalVerFormat,
};
