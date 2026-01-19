#!/usr/bin/env node
/**
 * @file ci-status.mjs
 * @description Show status of recent GitHub Actions workflow runs
 * @usage npm run ci:status [workflow-name]
 */

import { execSync } from 'child_process';

const workflow = process.argv[2] || '';

try {
  console.log('\n🔄 GitHub Actions Status\n');

  // Check if gh CLI is available
  try {
    execSync('gh --version', { stdio: 'ignore' });
  } catch {
    console.log('❌ GitHub CLI (gh) is not installed.');
    console.log('   Install: brew install gh (macOS) or https://cli.github.com/\n');
    process.exit(1);
  }

  // Get recent workflow runs
  const command = workflow
    ? `gh run list --workflow="${workflow}" --limit 10`
    : 'gh run list --limit 15';

  const output = execSync(command, { encoding: 'utf-8' });
  console.log(output);

  console.log('\n💡 Commands:');
  console.log('   View specific workflow: npm run ci:status <workflow-name>');
  console.log('   Watch workflow: gh run watch');
  console.log('   View logs: gh run view <run-id> --log\n');
} catch (error) {
  console.error('❌ Error fetching CI status:', error.message);
  console.log('\n💡 Make sure you are authenticated: gh auth login\n');
  process.exit(1);
}
