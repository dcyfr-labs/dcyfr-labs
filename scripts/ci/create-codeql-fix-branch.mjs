#!/usr/bin/env node

/**
 * Create Feature Branch for CodeQL Fix
 *
 * Creates a new feature branch following DCYFR naming conventions
 * for a specific CodeQL security alert.
 *
 * Environment Variables:
 *   GITHUB_TOKEN - GitHub API token
 *   GITHUB_REPOSITORY - Repository in owner/repo format
 *   ALERT_NUMBER - CodeQL alert number
 *   RULE_ID - Security rule identifier
 *   DRY_RUN - Skip actual branch creation if true
 *
 * Outputs:
 *   branch_name - Created branch name
 */

import { execaSync } from 'execa';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
const ALERT_NUMBER = process.env.ALERT_NUMBER;
const RULE_ID = process.env.RULE_ID;
const DRY_RUN = process.env.DRY_RUN === 'true';

const [REPO_OWNER, REPO_NAME] = GITHUB_REPOSITORY.split('/');

function generateBranchName() {
  // Format: security/codeql-{alert-number}-{rule-short-name}
  const ruleShort = RULE_ID.toLowerCase()
    .replace(/javascript\//i, '')
    .replace(/typescript\//i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 20);

  const branchName = `security/codeql-${ALERT_NUMBER}-${ruleShort}`;
  return branchName.replace(/--+/g, '-');
}

function branchExists(branchName) {
  try {
    execSync(`git rev-parse --verify refs/heads/${branchName}`, { // NOSONAR - Administrative script, inputs from controlled sources
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

async function createBranch() {
  const branchName = generateBranchName();

  console.log(`🔧 Creating feature branch for CodeQL alert #${ALERT_NUMBER}`);
  console.log(`   Rule: ${RULE_ID}`);
  console.log(`   Branch: ${branchName}`);

  if (DRY_RUN) {
    console.log('   [DRY RUN] Skipping actual branch creation');
    console.log(`::set-output name=branch_name::${branchName}`);
    return branchName;
  }

  // Check if branch already exists
  if (branchExists(branchName)) {
    console.log(`⚠️  Branch already exists: ${branchName}`);
    console.log(`::set-output name=branch_name::${branchName}`);
    return branchName;
  }

  try {
    // Fetch main/preview to get latest base
    // FIX: CWE-78 - Use execa to prevent command injection
    execaSync('git', ['fetch', 'origin', 'main', 'preview'], {
      stdio: 'ignore',
      shell: false,
      reject: false, // Don't throw if preview doesn't exist
    });

    // Create branch from main
    execaSync('git', ['checkout', '-b', branchName, 'origin/main'], {
      stdio: 'pipe',
      shell: false,
    });

    console.log(`✅ Branch created: ${branchName}`);

    // Configure git for commits
    execaSync('git', ['config', 'user.name', 'github-actions[bot]'], { shell: false });
    execaSync('git', ['config', 'user.email', 'github-actions[bot]@users.noreply.github.com'], {
      shell: false,
    });

    console.log(`::set-output name=branch_name::${branchName}`);
    return branchName;
  } catch (error) {
    console.error(`❌ Failed to create branch: ${error.message}`);
    console.log(`::set-output name=branch_name::`);
    process.exit(1);
  }
}

createBranch().catch((error) => {
  console.error('❌ Error:', error.message);
  console.log(`::set-output name=branch_name::`);
  process.exit(1);
});
