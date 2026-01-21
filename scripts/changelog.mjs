#!/usr/bin/env node
/**
 * @file changelog.mjs
 * @description Display recent git commits in a user-friendly format
 * @usage npm run changelog [count]
 */

import { execSync } from 'child_process';

const count = process.argv[2] || '10';
const format = process.argv[3] || 'oneline';

const formats = {
  oneline: '--oneline',
  short: '--pretty=format:"%h - %s (%cr) <%an>"',
  full: '--pretty=format:"%C(yellow)%h%Creset - %C(bold)%s%Creset%n%C(dim)Author: %an <%ae>%Creset%n%C(dim)Date: %ar%Creset%n"',
};

const gitFormat = formats[format] || formats.oneline;

try {
  const command = `git log ${gitFormat} -${count}`;
  // lgtm [js/command-line-injection] - Count and format from npm script arguments, not user input
  const output = execSync(command, { encoding: 'utf-8' });
  
  console.log('\n📝 Recent Changes\n');
  console.log(output);
  console.log(`\n💡 Showing last ${count} commits. Use: npm run changelog <count> [format]`);
  console.log('   Formats: oneline (default), short, full\n');
} catch (error) {
  console.error('❌ Error fetching changelog:', error.message);
  process.exit(1);
}
