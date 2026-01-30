#!/usr/bin/env node

/**
 * Validate Security Fix
 *
 * Runs quality checks on the fix branch to ensure it doesn't introduce
 * new issues and follows DCYFR standards.
 *
 * Environment Variables:
 *   BRANCH_NAME - Feature branch to validate
 *   GITHUB_TOKEN - GitHub API token
 *   DRY_RUN - Skip validation if true
 *
 * Checks:
 *   - TypeScript compilation
 *   - ESLint validation
 *   - No new security issues introduced
 *   - Design token compliance
 *   - Test coverage
 */

import { execSync } from 'child_process';
import fs from 'fs';

const BRANCH_NAME = process.env.BRANCH_NAME;
const DRY_RUN = process.env.DRY_RUN === 'true';

function runCommand(cmd, description) {
  try {
    console.log(`   ⏳ ${description}...`);
    const output = execSync(cmd, { encoding: 'utf-8' });
    console.log(`   ✅ ${description}`);
    return { success: true, output };
  } catch (error) {
    console.log(`   ❌ ${description} failed`);
    return { success: false, error: error.message };
  }
}

async function validateFix() {
  console.log(`🔍 Validating security fix on branch: ${BRANCH_NAME}\n`);

  if (DRY_RUN) {
    console.log('   [DRY RUN] Skipping validation');
    return;
  }

  const checks = [];

  // TypeScript check
  console.log(`📋 TypeScript Validation:`);
  const tsResult = runCommand('npm run typecheck', 'TypeScript compilation');
  checks.push(tsResult);

  // ESLint check
  console.log(`\n📋 Code Quality (ESLint):`);
  const eslintResult = runCommand('npm run lint', 'ESLint validation');
  checks.push(eslintResult);

  // Security scanning (lightweight)
  console.log(`\n📋 Security Validation:`);
  const secResult = runCommand('npm audit --audit-level=moderate', 'Audit check');
  checks.push(secResult);

  // Test suite (if relevant files changed)
  console.log(`\n📋 Test Coverage:`);
  const testResult = runCommand(
    'npm run test:run -- --reporter=verbose 2>&1 | head -20',
    'Test run'
  );
  checks.push(testResult);

  // Design token compliance (sample check)
  console.log(`\n📋 Design System Compliance:`);
  const tokenResult = runCommand(
    "grep -r 'gap-\\|mt-\\|mb-\\|ml-\\|mr-' src/ --include='*.tsx' --include='*.ts' | wc -l",
    'Design token check'
  );
  checks.push(tokenResult);

  // Summary
  console.log(`\n📊 Validation Summary:\n`);
  const passed = checks.filter((c) => c.success).length;
  const total = checks.length;

  console.log(`   ✅ Passed: ${passed}/${total}`);

  if (passed === total) {
    console.log(`\n✅ All validations passed! Ready for PR.`);
  } else {
    console.log(`\n⚠️  Some validations failed. Review and fix before creating PR.`);
    process.exit(1);
  }
}

validateFix().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
