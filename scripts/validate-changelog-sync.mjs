#!/usr/bin/env node
/**
 * @file validate-changelog-sync.mjs
 * @description Check if CHANGELOG.md is kept up-to-date with recent commits
 * @usage npm run changelog:check [--strict] [--days=7]
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const daysArg = args.find((a) => a.startsWith('--days='))?.split('=')[1] || '7';
const days = parseInt(daysArg) || 7;

// Get the latest changelog date
function getLatestChangelogDate() {
  const changelogPath = resolve('./CHANGELOG.md');
  const content = readFileSync(changelogPath, 'utf-8');

  // Extract first date in format [YYYY.MM.DD]
  const match = content.match(/\[(\d{4}\.\d{2}\.\d{2})\]/);
  if (!match) {
    console.error('Error: No changelog date found in CHANGELOG.md');
    process.exit(1);
  }

  const [, dateStr] = match;
  const [year, month, day] = dateStr.split('.');
  return new Date(`${year}-${month}-${day}`);
}

// Get the date of the most recent git commit
function getLatestCommitDate() {
  try {
    const output = execSync('git log -1 --format=%aI', { encoding: 'utf-8' }); // NOSONAR - Administrative script, inputs from controlled sources
    return new Date(output.trim());
  } catch (error) {
    console.error('Error: Could not retrieve latest commit date');
    process.exit(1);
  }
}

// Calculate days between two dates
function daysBetween(date1, date2) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((date2 - date1) / msPerDay);
}

// Format date for display
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

try {
  const changelogDate = getLatestChangelogDate();
  const commitDate = getLatestCommitDate();
  const daysSinceUpdate = daysBetween(changelogDate, commitDate);

  console.log(`\nChangelog Sync Check`);
  console.log(`${'='.repeat(50)}`);
  console.log(`Latest changelog entry: [${formatDate(changelogDate)}]`);
  console.log(`Latest commit date:     ${commitDate.toISOString().split('T')[0]}`);
  console.log(`Days since update:      ${daysSinceUpdate}`);
  console.log(`Threshold:              ${days} days\n`);

  if (daysSinceUpdate > days) {
    const message = `Changelog is ${daysSinceUpdate} days out of date (threshold: ${days} days)`;

    if (strict) {
      console.error(`Error: ${message}`);
      console.error(`Update CHANGELOG.md with recent changes and run:\n`);
      console.error(`  npm run changelog 20         # View recent commits`);
      console.error(`  $EDITOR CHANGELOG.md         # Update manually\n`);
      process.exit(1);
    } else {
      console.warn(`Warning: ${message}`);
      console.warn(`Recommendation: Update CHANGELOG.md with recent changes\n`);
      console.log(`Tip: Use 'npm run changelog 20' to view recent commits\n`);
      process.exit(0);
    }
  } else {
    console.log(`Status: Changelog is current (${daysSinceUpdate} days)\n`);
    process.exit(0);
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
