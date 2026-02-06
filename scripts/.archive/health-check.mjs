#!/usr/bin/env node

/**
 * Comprehensive Project Health Check Script
 *
 * Runs all quality gates and generates a health report:
 * - Git status and branch info
 * - TypeScript compilation
 * - ESLint validation
 * - Test suite execution
 * - Build validation
 * - Security audit
 * - Documentation structure
 * - Temporary file detection
 */

import { execSync } from 'child_process';
import { existsSync, statSync } from 'fs';
import { join } from 'path';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const EMOJIS = {
  success: '✅',
  warning: '⚠️',
  error: '❌',
  info: 'ℹ️',
  rocket: '🚀',
  wrench: '🔧',
  magnifier: '🔍',
  chart: '📊',
};

class HealthChecker {
  constructor() {
    this.results = {
      git: { status: 'pending', details: '' },
      typescript: { status: 'pending', details: '' },
      eslint: { status: 'pending', details: '' },
      tests: { status: 'pending', details: '' },
      build: { status: 'pending', details: '' },
      security: { status: 'pending', details: '' },
      docs: { status: 'pending', details: '' },
      cleanup: { status: 'pending', details: '' },
    };
    this.startTime = Date.now();
  }

  log(emoji, color, message) {
    console.log(`${emoji} ${color}${message}${COLORS.reset}`);
  }

  header(message) {
    console.log(`\n${COLORS.bright}${COLORS.cyan}${message}${COLORS.reset}`);
    console.log(`${'='.repeat(60)}\n`);
  }

  async run() {
    this.header(`${EMOJIS.rocket} DCYFR Labs - Comprehensive Health Check`);

    await this.checkGit();
    await this.checkTypeScript();
    await this.checkESLint();
    await this.checkTests();
    await this.checkBuild();
    await this.checkSecurity();
    await this.checkDocumentation();
    await this.checkCleanup();

    this.printSummary();
  }

  exec(command, options = {}) {
    try {
      return execSync(command, {
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options,
      });
    } catch (error) {
      if (options.ignoreError) {
        return error.stdout || '';
      }
      throw error;
    }
  }

  async checkGit() {
    this.header(`${EMOJIS.magnifier} Git Status`);

    try {
      const branch = this.exec('git branch --show-current', { silent: true }).trim();
      const status = this.exec('git status --short', { silent: true });
      const recentCommits = this.exec('git log --oneline -5', { silent: true });

      this.log(EMOJIS.info, COLORS.blue, `Current branch: ${branch}`);

      if (status.trim()) {
        this.log(EMOJIS.warning, COLORS.yellow, 'Uncommitted changes detected');
        console.log(status);
        this.results.git = { status: 'warning', details: 'Uncommitted changes' };
      } else {
        this.log(EMOJIS.success, COLORS.green, 'Working directory clean');
        this.results.git = { status: 'success', details: 'Clean working directory' };
      }

      console.log('\nRecent commits:');
      console.log(recentCommits);
    } catch (error) {
      this.log(EMOJIS.error, COLORS.red, `Git check failed: ${error.message}`);
      this.results.git = { status: 'error', details: error.message };
    }
  }

  async checkTypeScript() {
    this.header(`${EMOJIS.wrench} TypeScript Compilation`);

    try {
      this.exec('npm run typecheck');
      this.log(EMOJIS.success, COLORS.green, 'TypeScript compilation successful');
      this.results.typescript = { status: 'success', details: '0 errors' };
    } catch (error) {
      this.log(EMOJIS.error, COLORS.red, 'TypeScript compilation failed');
      this.results.typescript = { status: 'error', details: 'Compilation errors detected' };
    }
  }

  async checkESLint() {
    this.header(`${EMOJIS.wrench} ESLint Validation`);

    try {
      this.exec('npm run lint');
      this.log(EMOJIS.success, COLORS.green, 'ESLint validation passed');
      this.results.eslint = { status: 'success', details: '0 errors' };
    } catch (error) {
      this.log(EMOJIS.error, COLORS.red, 'ESLint validation failed');
      this.results.eslint = { status: 'error', details: 'Linting errors detected' };
    }
  }

  async checkTests() {
    this.header(`${EMOJIS.chart} Test Suite Execution`);

    try {
      const output = this.exec('npm run test:run', { silent: true, ignoreError: true });

      // Parse test results
      const passedMatch = output.match(/(\d+) passed/);
      const failedMatch = output.match(/(\d+) failed/);
      const skippedMatch = output.match(/(\d+) skipped/);

      const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
      const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
      const skipped = skippedMatch ? parseInt(skippedMatch[1]) : 0;
      const total = passed + failed + skipped;
      const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

      if (failed === 0) {
        this.log(EMOJIS.success, COLORS.green, `All tests passed (${passed}/${total})`);
        this.results.tests = { status: 'success', details: `${passed}/${total} tests passed` };
      } else if (passRate >= 99.0) {
        this.log(EMOJIS.warning, COLORS.yellow, `${failed} tests failing (${passRate}% pass rate)`);
        this.results.tests = { status: 'warning', details: `${failed} failing, ${passRate}% pass rate` };
      } else {
        this.log(EMOJIS.error, COLORS.red, `${failed} tests failing (${passRate}% pass rate)`);
        this.results.tests = { status: 'error', details: `${failed} failing, ${passRate}% pass rate` };
      }

      console.log(`\nTest Summary:`);
      console.log(`  Passed:  ${passed}`);
      console.log(`  Failed:  ${failed}`);
      console.log(`  Skipped: ${skipped}`);
      console.log(`  Total:   ${total}`);
      console.log(`  Pass Rate: ${passRate}%`);
    } catch (error) {
      this.log(EMOJIS.error, COLORS.red, 'Test execution failed');
      this.results.tests = { status: 'error', details: error.message };
    }
  }

  async checkBuild() {
    this.header(`${EMOJIS.wrench} Build Validation`);

    try {
      console.log('Building project (this may take a minute)...\n');
      this.exec('npm run build');
      this.log(EMOJIS.success, COLORS.green, 'Production build successful');
      this.results.build = { status: 'success', details: 'Build completed' };
    } catch (error) {
      this.log(EMOJIS.error, COLORS.red, 'Production build failed');
      this.results.build = { status: 'error', details: 'Build errors detected' };
    }
  }

  async checkSecurity() {
    this.header(`${EMOJIS.magnifier} Security Audit`);

    try {
      const output = this.exec('npm audit --audit-level=high', { silent: true, ignoreError: true });

      if (output.includes('found 0 vulnerabilities')) {
        this.log(EMOJIS.success, COLORS.green, 'No security vulnerabilities detected');
        this.results.security = { status: 'success', details: '0 vulnerabilities' };
      } else {
        const vulnMatch = output.match(/(\d+) vulnerabilities/);
        const count = vulnMatch ? vulnMatch[1] : 'unknown';
        this.log(EMOJIS.warning, COLORS.yellow, `${count} vulnerabilities found`);
        this.results.security = { status: 'warning', details: `${count} vulnerabilities` };
        console.log('\nRun `npm audit` for details');
      }
    } catch (error) {
      this.log(EMOJIS.error, COLORS.red, 'Security audit failed');
      this.results.security = { status: 'error', details: error.message };
    }
  }

  async checkDocumentation() {
    this.header(`${EMOJIS.magnifier} Documentation Structure`);

    const issues = [];

    // Check for root-level analysis/temp docs that should be in /docs
    const rootAnalysisDocs = [
      'FEED_REFACTORING_SUMMARY.md',
      'SECURITY_ANALYSIS_TEST_ENDPOINTS.md',
      'DEBUG_TRENDING.md',
      'FIX_GUIDE_FAILING_TESTS.md',
      'PREVIEW_BRANCH_TEST_ANALYSIS.md',
      'PREVIEW_BRANCH_TEST_SUMMARY.md',
      'TEST_ANALYSIS_INDEX.md',
      'TEST_FAILURES_SUMMARY.md',
      'TEST_FAILURE_ANALYSIS_PREVIEW.md',
      'mobile-design-token-updates.md',
      'week2-implementation-summary.md',
    ];

    const foundDocs = rootAnalysisDocs.filter(doc => existsSync(doc));
    if (foundDocs.length > 0) {
      issues.push(`${foundDocs.length} analysis docs in root (should be in /docs)`);
      this.log(EMOJIS.warning, COLORS.yellow, `Found ${foundDocs.length} root-level analysis docs:`);
      foundDocs.forEach(doc => console.log(`  - ${doc}`));
    }

    // Check for private docs in wrong location
    const rootPrivateDocs = this.exec('find docs/private -type f -name "*.md" 2>/dev/null', {
      silent: true,
      ignoreError: true
    }).trim().split('\n').filter(Boolean);

    if (rootPrivateDocs.length > 0) {
      issues.push(`${rootPrivateDocs.length} docs in /docs/private (should be categorized)`);
      this.log(EMOJIS.warning, COLORS.yellow, `Found ${rootPrivateDocs.length} docs in /docs/private:`);
      rootPrivateDocs.forEach(doc => console.log(`  - ${doc}`));
    }

    if (issues.length === 0) {
      this.log(EMOJIS.success, COLORS.green, 'Documentation structure looks good');
      this.results.docs = { status: 'success', details: 'Well organized' };
    } else {
      this.results.docs = { status: 'warning', details: issues.join(', ') };
    }
  }

  async checkCleanup() {
    this.header(`${EMOJIS.magnifier} Temporary Files Detection`);

    const issues = [];

    // Find .DS_Store files
    const dsStoreFiles = this.exec('find . -name ".DS_Store" -type f 2>/dev/null', {
      silent: true,
      ignoreError: true
    }).trim().split('\n').filter(Boolean);

    if (dsStoreFiles.length > 0) {
      issues.push(`${dsStoreFiles.length} .DS_Store files`);
      this.log(EMOJIS.warning, COLORS.yellow, `Found ${dsStoreFiles.length} .DS_Store files`);
      console.log('  Run: find . -name ".DS_Store" -type f -delete');
    }

    // Check for backup/temp files
    const tempFiles = this.exec(
      'git ls-files --others --exclude-standard | grep -E "\\.(tmp|bak|backup|old)$" 2>/dev/null',
      { silent: true, ignoreError: true }
    ).trim().split('\n').filter(Boolean);

    if (tempFiles.length > 0) {
      issues.push(`${tempFiles.length} temp files`);
      this.log(EMOJIS.warning, COLORS.yellow, `Found ${tempFiles.length} temporary files:`);
      tempFiles.forEach(file => console.log(`  - ${file}`));
    }

    if (issues.length === 0) {
      this.log(EMOJIS.success, COLORS.green, 'No temporary files detected');
      this.results.cleanup = { status: 'success', details: 'Clean' };
    } else {
      this.results.cleanup = { status: 'warning', details: issues.join(', ') };
    }
  }

  printSummary() {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);

    this.header(`${EMOJIS.chart} Health Check Summary`);

    const categories = Object.keys(this.results);
    const successes = categories.filter(cat => this.results[cat].status === 'success').length;
    const warnings = categories.filter(cat => this.results[cat].status === 'warning').length;
    const errors = categories.filter(cat => this.results[cat].status === 'error').length;

    console.log(`${COLORS.bright}Overall Status:${COLORS.reset}`);
    categories.forEach(category => {
      const result = this.results[category];
      let emoji, color;

      switch (result.status) {
        case 'success':
          emoji = EMOJIS.success;
          color = COLORS.green;
          break;
        case 'warning':
          emoji = EMOJIS.warning;
          color = COLORS.yellow;
          break;
        case 'error':
          emoji = EMOJIS.error;
          color = COLORS.red;
          break;
        default:
          emoji = EMOJIS.info;
          color = COLORS.blue;
      }

      console.log(`  ${emoji} ${color}${category.padEnd(15)}${COLORS.reset} ${result.details}`);
    });

    console.log(`\n${COLORS.bright}Summary:${COLORS.reset}`);
    console.log(`  ${EMOJIS.success} Passed:   ${successes}/${categories.length}`);
    console.log(`  ${EMOJIS.warning} Warnings: ${warnings}/${categories.length}`);
    console.log(`  ${EMOJIS.error} Failed:   ${errors}/${categories.length}`);
    console.log(`\n  ⏱️  Completed in ${elapsed}s`);

    if (errors > 0) {
      console.log(`\n${EMOJIS.error} ${COLORS.red}${COLORS.bright}HEALTH CHECK FAILED${COLORS.reset}`);
      process.exit(1);
    } else if (warnings > 0) {
      console.log(`\n${EMOJIS.warning} ${COLORS.yellow}${COLORS.bright}HEALTH CHECK PASSED WITH WARNINGS${COLORS.reset}`);
    } else {
      console.log(`\n${EMOJIS.success} ${COLORS.green}${COLORS.bright}ALL HEALTH CHECKS PASSED${COLORS.reset}`);
    }
  }
}

// Run health check
const checker = new HealthChecker();
checker.run().catch(error => {
  console.error(`${EMOJIS.error} ${COLORS.red}Health check failed: ${error.message}${COLORS.reset}`);
  process.exit(1);
});
