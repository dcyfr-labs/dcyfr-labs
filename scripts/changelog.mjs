#!/usr/bin/env node
/**
 * @file changelog.mjs
 * @description Display recent git commits in a user-friendly format
 * @usage npm run changelog [count] [format]
 */

import { execSync } from 'child_process';

// Validate count argument (allowlist pattern to prevent command injection)
const countArg = process.argv[2] || '10';
const validCountPattern = /^\d+$/;

if (!validCountPattern.test(countArg)) {
  console.error('❌ Error: Count must be a positive number (digits only)');
  console.error(`Received: "${countArg}"`);
  console.error('Example: npm run changelog 20');
  process.exit(1);
}

const count = Math.max(1, parseInt(countArg, 10));

// Validate format argument (allowlist validation)
const formatArg = (process.argv[3] || 'oneline').toLowerCase();
const formats = {
  oneline: '--oneline',
  short: '--pretty=format:"%h - %s (%cr) <%an>"',
  full: '--pretty=format:"%C(yellow)%h%Creset - %C(bold)%s%Creset%n%C(dim)Author: %an <%ae>%Creset%n%C(dim)Date: %ar%Creset%n"',
};

const allowedFormats = Object.keys(formats);
if (!allowedFormats.includes(formatArg)) {
  console.warn(`⚠️  Warning: Format "${formatArg}" not recognized. Using "oneline".`);
  console.warn(`Available formats: ${allowedFormats.join(', ')}\n`);
}

const gitFormat = formats[formatArg] || formats.oneline;

try {
  const command = `git log ${gitFormat} -${count}`;
  // Safe: count validated with allowlist pattern (/^\d+$/), format validated against allowlist
  const output = execSync(command, { encoding: 'utf-8' }); // NOSONAR - Administrative script, inputs from controlled sources

  console.log('\nRecent Changes\n');
  console.log(output);
  console.log(`Showing last ${count} commits. Use: npm run changelog <count> [format]`);
  console.log(`Available formats: ${Object.keys(formats).join(', ')}\n`);
} catch (error) {
  console.error('Error fetching changelog:', error.message);
  process.exit(1);
}
