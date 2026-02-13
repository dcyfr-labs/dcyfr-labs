#!/usr/bin/env node

/**
 * Validate package.json version follows CalVer format and is not stale
 *
 * Usage:
 *   npm run version:check        # Check version format and staleness
 *   npm run version:check:strict # Fail on staleness warnings
 */

import fs from 'fs';
import { parseArgs } from 'util';

const { values } = parseArgs({
  options: {
    strict: { type: 'boolean', default: false },
    help: { type: 'boolean', default: false }
  },
  allowPositionals: true
});

if (values.help) {
  console.log(`
Version Validation Tool

Validates that package.json version follows CalVer format (YYYY.MM.DD)
and checks for staleness.

Usage:
  npm run version:check              # Check with warnings
  npm run version:check:strict       # Check with strict mode (fail on staleness)

CalVer Format: YYYY.MM.DD or YYYY.MM.DD.N
Staleness Threshold: 7 days (warning), 14 days (error in strict mode)
`);
  process.exit(0);
}

// Read package.json
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const version = pkg.version;

let hasErrors = false;
let hasWarnings = false;

console.log(`\n📦 Validating version: ${version}`);

// 1. Validate CalVer format
console.log('\n🔍 Checking format...');

const calverPattern = /^(\d{4})\.(\d{2})\.(\d{2})(?:\.(\d+))?$/;
const match = version.match(calverPattern);

if (!match) {
  console.error(`❌ Version "${version}" does not match CalVer format`);
  console.error(`   Expected: YYYY.MM.DD or YYYY.MM.DD.N (e.g., 2026.02.12 or 2026.02.12.1)`);
  hasErrors = true;
} else {
  console.log(`✅ Format valid: ${match[1]}.${match[2]}.${match[3]}${match[4] ? '.' + match[4] : ''}`);

  // Validate date components
  const year = parseInt(match[1]);
  const month = parseInt(match[2]);
  const day = parseInt(match[3]);

  if (month < 1 || month > 12) {
    console.error(`❌ Invalid month: ${month} (must be 01-12)`);
    hasErrors = true;
  } else if (day < 1 || day > 31) {
    console.error(`❌ Invalid day: ${day} (must be 01-31)`);
    hasErrors = true;
  } else if (year < 2020 || year > 2030) {
    console.warn(`⚠️  Unusual year: ${year} (expected 2020-2030)`);
    hasWarnings = true;
  }
}

// 2. Check staleness
console.log('\n📅 Checking staleness...');

if (match) {
  const [, yearStr, monthStr, dayStr] = match;
  const versionDate = new Date(`${yearStr}-${monthStr}-${dayStr}`);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time for accurate day comparison

  const diffMs = today - versionDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  console.log(`   Version date: ${versionDate.toDateString()}`);
  console.log(`   Current date: ${today.toDateString()}`);
  console.log(`   Age: ${diffDays} days`);

  if (diffDays > 0) {
    if (diffDays <= 7) {
      console.log(`✅ Version age acceptable: ${diffDays} days (≤7 days)`);
    } else if (diffDays <= 14) {
      console.warn(`⚠️  Version getting stale: ${diffDays} days old`);
      console.warn(`   Consider updating to $(date -u +%Y.%m.%d)`);
      hasWarnings = true;

      if (values.strict) {
        console.error(`❌ Staleness error in strict mode: ${diffDays} days > 7 day threshold`);
        hasErrors = true;
      }
    } else {
      console.error(`❌ Version very stale: ${diffDays} days old (>14 days)`);
      console.error(`   Please update to $(date -u +%Y.%m.%d)`);
      hasErrors = true;
    }
  } else if (diffDays < 0) {
    console.error(`❌ Version is in the future: ${Math.abs(diffDays)} days`);
    hasErrors = true;
  } else {
    console.log(`✅ Version is current (today)`);
  }
}

// 3. Summary
console.log('\n📊 Summary:');

if (hasErrors) {
  console.error(`❌ Validation failed with ${hasErrors ? 'errors' : '0 errors'}`);

  if (match && match[1] && match[2] && match[3]) {
    const suggestedVersion = new Date().toISOString().split('T')[0].replace(/-/g, '.');
    console.log(`\n💡 Suggested fix:`);
    console.log(`   npm version ${suggestedVersion} --no-git-tag-version`);
    console.log(`   # Then: git add package.json && git commit -m "chore: version ${suggestedVersion}"`);
  }

  process.exit(1);
} else if (hasWarnings && !values.strict) {
  console.warn(`⚠️  Validation passed with warnings`);
  console.log(`   Use --strict to treat warnings as errors`);
} else {
  console.log(`✅ Validation passed`);
}

console.log(`\n🤖 Auto-update: .github/workflows/auto-calver.yml handles this automatically on merge to main\n`);
