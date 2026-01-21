#!/usr/bin/env node
/**
 * @file validate-changelog-format.mjs
 * @description Validate CHANGELOG.md follows Keep a Changelog + CalVer format
 * @usage npm run changelog:validate
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const changelogPath = resolve('./CHANGELOG.md');
const content = readFileSync(changelogPath, 'utf-8');
const lines = content.split('\n');

let errors = [];
let warnings = [];
let currentVersion = null;

// Validate header format
if (!content.includes('# Changelog')) {
  errors.push('Missing main "# Changelog" header');
}

if (!content.includes('Keep a Changelog')) {
  errors.push('Missing "Keep a Changelog" reference');
}

if (!content.includes('Calendar Versioning') && !content.includes('CalVer')) {
  errors.push('Missing Calendar Versioning reference');
}

// Check for version entries
const versionPattern = /^## \[(\d{4}\.\d{2}\.\d{2}(?:\.\d+)?)\]/;
const versions = [];

lines.forEach((line, index) => {
  const versionMatch = line.match(versionPattern);

  if (versionMatch) {
    const version = versionMatch[1];
    versions.push({ version, lineNum: index + 1, line });

    // Validate CalVer format: YYYY.MM.DD or YYYY.MM.DD.MICRO
    const parts = version.split('.');
    if (parts.length < 3 || parts.length > 4) {
      errors.push(`Invalid version format at line ${index + 1}: [${version}]`);
      errors.push(`  Expected: YYYY.MM.DD or YYYY.MM.DD.MICRO`);
    }

    // Validate year, month, day are numeric
    if (parts.length >= 3) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      const day = parseInt(parts[2]);

      if (year < 2000 || year > 2099) {
        errors.push(`Invalid year in version at line ${index + 1}: ${year}`);
      }
      if (month < 1 || month > 12) {
        errors.push(`Invalid month in version at line ${index + 1}: ${month}`);
      }
      if (day < 1 || day > 31) {
        errors.push(`Invalid day in version at line ${index + 1}: ${day}`);
      }
    }
  }
});

if (versions.length === 0) {
  errors.push('No version entries found in changelog');
}

// Check for breaking change marker
const hasBreakingMarker = content.includes('⚠️ BREAKING');
if (!hasBreakingMarker) {
  warnings.push('Consider using "⚠️ BREAKING" marker for breaking changes');
}

// Check for standard sections
const standardSections = ['Added', 'Changed', 'Removed', 'Fixed', 'Deprecated'];
const foundSections = [];

lines.forEach((line) => {
  standardSections.forEach((section) => {
    if (line === `### ${section}`) {
      foundSections.push(section);
    }
  });
});

if (foundSections.length === 0) {
  errors.push('No standard changelog sections found (Added, Changed, Removed, Fixed, Deprecated)');
}

// Check dates are in reverse chronological order
if (versions.length > 1) {
  for (let i = 0; i < versions.length - 1; i++) {
    const current = versions[i].version;
    const next = versions[i + 1].version;

    if (current < next) {
      errors.push(
        `Versions not in reverse chronological order:\n` +
          `  Line ${versions[i].lineNum}: [${current}] should come after [${next}]`
      );
    }
  }
}

// Print results
console.log(`\nChangelog Format Validation`);
console.log(`${'='.repeat(50)}\n`);

if (errors.length === 0 && warnings.length === 0) {
  console.log('Status: VALID');
  console.log(`Found ${versions.length} version entries`);
  console.log(`Sections used: ${foundSections.join(', ')}\n`);
  process.exit(0);
}

if (errors.length > 0) {
  console.log(`Errors (${errors.length}):`);
  errors.forEach((error) => {
    console.log(`  • ${error}`);
  });
  console.log();
}

if (warnings.length > 0) {
  console.log(`Warnings (${warnings.length}):`);
  warnings.forEach((warning) => {
    console.log(`  • ${warning}`);
  });
  console.log();
}

if (errors.length > 0) {
  console.log(`Reference: https://keepachangelog.com/en/1.1.0/`);
  console.log(`CalVer format: YYYY.MM.DD[.MICRO]\n`);
  process.exit(1);
}

process.exit(0);
