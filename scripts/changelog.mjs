#!/usr/bin/env node
/**
 * @file changelog.mjs
 * @description Display recent git commits in a user-friendly format
 * @usage npm run changelog [count] [format]
 */

import { execSync } from 'child_process';

// Validate count argument
const countArg = process.argv[2] || '10';
const count = Math.max(1, parseInt(countArg));

if (isNaN(count)) {
  console.error('Error: Count must be a positive number');
  console.error(`Received: "${countArg}"`);
  process.exit(1);
}

// Validate format argument
const formatArg = (process.argv[3] || 'oneline').toLowerCase();
const formats = {
  oneline: '--oneline',
  short: '--pretty=format:"%h - %s (%cr) <%an>"',
  full: '--pretty=format:"%C(yellow)%h%Creset - %C(bold)%s%Creset%n%C(dim)Author: %an <%ae>%Creset%n%C(dim)Date: %ar%Creset%n"',
};

if (!formats[formatArg]) {
  console.warn(`Warning: Format "${formatArg}" not recognized. Using "oneline".`);
  console.warn(`Available formats: ${Object.keys(formats).join(', ')}\n`);
}

const gitFormat = formats[formatArg] || formats.oneline;

try {
  const command = `git log ${gitFormat} -${count}`;
  // lgtm [js/command-line-injection] - Count and format from npm script arguments, not user input
  const output = execSync(command, { encoding: 'utf-8' });

  console.log('\nRecent Changes\n');
  console.log(output);
  console.log(`Showing last ${count} commits. Use: npm run changelog <count> [format]`);
  console.log(`Available formats: ${Object.keys(formats).join(', ')}\n`);
} catch (error) {
  console.error('Error fetching changelog:', error.message);
  process.exit(1);
}
