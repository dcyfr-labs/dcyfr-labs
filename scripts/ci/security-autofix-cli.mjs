#!/usr/bin/env node

/**
 * CodeQL Autofix Quick Commands
 *
 * Provides CLI shortcuts for common CodeQL autofix operations.
 *
 * Usage:
 *   npm run security:autofix                    # Show help
 *   npm run security:autofix:trigger            # Run workflow manually
 *   npm run security:autofix:trigger:dry-run    # Preview changes
 *   npm run security:autofix:trigger:critical   # Fix only critical alerts
 *   npm run security:autofix:fix -- 2           # Fix specific alert #2
 *   npm run security:autofix:status             # Check workflow status
 *   npm run security:autofix:prs                # List generated PRs
 */

import { execSync } from 'child_process';

const WORKFLOW_NAME = 'codeql-autofix.yml';
const REPO = 'dcyfr/dcyfr-labs';

const commands = {
  help: () => {
    console.log(`
🔒 GitHub Copilot CodeQL Autofix Commands

USAGE:
  npm run security:autofix:<command> [options]

COMMANDS:

  trigger             Manually trigger the autofix workflow
  trigger:dry-run     Preview changes without creating branches/PRs
  trigger:critical    Fix only critical severity alerts
  fix <alert-number>  Fix a specific alert (e.g., npm run security:autofix:fix -- 2)
  status              Check workflow execution status
  prs                 List all generated fix PRs
  help                Show this help message

EXAMPLES:

  # View available fixes (dry run first)
  npm run security:autofix:trigger:dry-run

  # Auto-fix all high severity alerts
  npm run security:autofix:trigger

  # Fix critical alerts only
  npm run security:autofix:trigger:critical

  # Fix specific alert
  npm run security:autofix:fix -- 5

  # Check PR status
  npm run security:autofix:prs

DOCUMENTATION:
  See: docs/features/github-copilot-autofix.md
`);
  },

  trigger: () => {
    console.log('🚀 Triggering CodeQL Autofix workflow...\n');
    try {
      execSync(`gh workflow run ${WORKFLOW_NAME} --ref main -f severity=high -f dry_run=false`, {
        stdio: 'inherit',
      });
      console.log('\n✅ Workflow triggered! Monitor at:');
      console.log(`   https://github.com/${REPO}/actions/workflows/${WORKFLOW_NAME}`);
    } catch (error) {
      console.error('❌ Failed to trigger workflow:', error.message);
      process.exit(1);
    }
  },

  'trigger:dry-run': () => {
    console.log('🔍 Running CodeQL Autofix in dry-run mode (preview only)...\n');
    try {
      execSync(`gh workflow run ${WORKFLOW_NAME} --ref main -f severity=high -f dry_run=true`, {
        stdio: 'inherit',
      });
      console.log('\n✅ Workflow triggered in dry-run mode! View results at:');
      console.log(`   https://github.com/${REPO}/actions/workflows/${WORKFLOW_NAME}`);
    } catch (error) {
      console.error('❌ Failed to trigger workflow:', error.message);
      process.exit(1);
    }
  },

  'trigger:critical': () => {
    console.log('🔴 Triggering CodeQL Autofix for CRITICAL severity only...\n');
    try {
      execSync(
        `gh workflow run ${WORKFLOW_NAME} --ref main -f severity=critical -f dry_run=false`,
        { stdio: 'inherit' }
      );
      console.log('\n✅ Workflow triggered! Monitor at:');
      console.log(`   https://github.com/${REPO}/actions/workflows/${WORKFLOW_NAME}`);
    } catch (error) {
      console.error('❌ Failed to trigger workflow:', error.message);
      process.exit(1);
    }
  },

  fix: (alertNumber) => {
    if (!alertNumber) {
      console.error('❌ Please specify an alert number: npm run security:autofix:fix -- 2');
      process.exit(1);
    }
    console.log(`🔧 Fixing CodeQL alert #${alertNumber}...\n`);
    try {
      execSync(
        `gh workflow run ${WORKFLOW_NAME} --ref main -f alert_number=${alertNumber} -f dry_run=false`,
        { stdio: 'inherit' }
      );
      console.log('\n✅ Workflow triggered! Monitor at:');
      console.log(`   https://github.com/${REPO}/actions/workflows/${WORKFLOW_NAME}`);
    } catch (error) {
      console.error('❌ Failed to trigger workflow:', error.message);
      process.exit(1);
    }
  },

  status: () => {
    console.log('📊 Checking CodeQL Autofix workflow status...\n');
    try {
      execSync(`gh run list --workflow=${WORKFLOW_NAME} --limit=5`, { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Failed to fetch status:', error.message);
      process.exit(1);
    }
  },

  prs: () => {
    console.log('📋 Generated CodeQL Fix PRs:\n');
    try {
      execSync(`gh pr list --label codeql-fix --json number,title,state,updatedAt`, {
        stdio: 'inherit',
      });
    } catch (error) {
      console.error('❌ Failed to list PRs:', error.message);
      process.exit(1);
    }
  },
};

const command = process.argv[2] || 'help';
const args = process.argv.slice(3);

if (command in commands) {
  const fn = commands[command];
  fn(...args);
} else {
  console.error(`❌ Unknown command: ${command}\n`);
  commands.help();
  process.exit(1);
}
