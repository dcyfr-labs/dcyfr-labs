#!/usr/bin/env node
/**
 * @file ci-status.mjs
 * @description Show status of recent GitHub Actions workflow runs
 * @usage npm run ci:status [workflow-name]
 */

import { execaSync } from 'execa';

const workflow = process.argv[2] || '';

try {
  console.log('\n🔄 GitHub Actions Status\n');

  // Check if gh CLI is available
  try {
    // FIX: CWE-78 - Use execa with array syntax to prevent command injection
    execaSync('gh', ['--version'], { stdio: 'ignore', shell: false });
  } catch {
    console.log('❌ GitHub CLI (gh) is not installed.');
    console.log('   Install: brew install gh (macOS) or https://cli.github.com/\n');
    process.exit(1);
  }

  // Get recent workflow runs
  // FIX: CWE-78 - Use execa with array syntax to prevent command injection
  let args;

  if (workflow) {
    // Validate workflow name to prevent command injection
    // Workflow filenames should be alphanumeric with dashes, underscores, and .yml/.yaml extension
    const validWorkflowPattern = /^[a-z0-9._-]+\.ya?ml$/i;

    if (!validWorkflowPattern.test(workflow)) {
      console.error(`❌ Invalid workflow name: ${workflow}`);
      console.error('Workflow names must be valid YAML filenames (e.g., test.yml)');
      process.exit(1);
    }

    args = ['run', 'list', `--workflow=${workflow}`, '--limit', '10'];
  } else {
    args = ['run', 'list', '--limit', '15'];
  }

  const { stdout: output } = execaSync('gh', args, {
    encoding: 'utf-8',
    shell: false,
  });
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
