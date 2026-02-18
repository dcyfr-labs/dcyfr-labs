#!/usr/bin/env node
/**
 * Governance Compliance Validation Script
 *
 * Validates that the project adheres to governance policies:
 * - No sensitive files in public docs/
 * - No proprietary .claude/ files in git
 * - Required .gitignore patterns present
 * - VS Code workspace configuration exists
 *
 * Usage:
 *   npm run check:governance
 *   node scripts/validate-governance.mjs
 *
 * Exit codes:
 *   0 - All checks passed
 *   1 - Critical violations found
 *   2 - Warnings found (non-blocking)
 */

import { readdir, stat, readFile } from 'fs/promises';
import { join, relative } from 'path';
import { execSync } from 'child_process';

const PROJECT_ROOT = process.cwd();

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Results tracking
const results = {
  passed: 0,
  failed: 0,
  warningCount: 0,
  errors: [],
  warnings: [],
};

/**
 * Log helper functions
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
  results.passed++;
}

function error(message, details = null) {
  log(`❌ ${message}`, 'red');
  if (details) {
    console.log(`   ${details}`);
  }
  results.failed++;
  results.errors.push(message);
}

function warn(message, details = null) {
  log(`⚠️  ${message}`, 'yellow');
  if (details) {
    console.log(`   ${details}`);
  }
  results.warningCount++;
  results.warnings.push(message);
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

/**
 * Check 1: Validate documentation structure
 * Ensures sensitive files are in private/ subdirectories
 */
const SENSITIVE_KEYWORDS = ['FINDINGS', 'REPORT', 'AUDIT', 'ANALYSIS', 'METRICS', 'STATUS', 'SUMMARY'];
const ALLOWED_DOC_FILES = [
  'AGENTS.md',
  'DOCS_GOVERNANCE.md',
  'DOCUMENTATION_CONSOLIDATION_GUIDE.md',
  'INDEX.md',
  'README.md',
];

function isSensitiveDocFile(entryName) {
  return SENSITIVE_KEYWORDS.some(keyword => entryName.toUpperCase().includes(keyword))
    && !ALLOWED_DOC_FILES.includes(entryName);
}

async function scanSensitiveDocFiles(dir, sensitiveFiles) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = relative(PROJECT_ROOT, fullPath);
      if (relativePath.includes('/private/')) continue;
      if (entry.isDirectory()) {
        await scanSensitiveDocFiles(fullPath, sensitiveFiles);
      } else if (entry.isFile() && isSensitiveDocFile(entry.name)) {
        sensitiveFiles.push(relativePath);
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      warn(`Could not scan directory: ${dir}`);
    }
  }
}

async function validateDocStructure() {
  info('Checking documentation structure...');
  const sensitiveFiles = [];
  await scanSensitiveDocFiles(join(PROJECT_ROOT, 'docs'), sensitiveFiles);
  if (sensitiveFiles.length > 0) {
    error('Sensitive files found in public docs/', sensitiveFiles.join('\n   '));
    info('Move to appropriate docs/[category]/private/ folder');
    info('See: docs/governance/DOCS_GOVERNANCE.md');
  } else {
    success('No sensitive files in public docs');
  }
}

/**
 * Check 2: Validate AI configuration
 * Ensures proprietary files are not committed
 */
async function validateAIConfig() {
  info('Checking AI configuration...');

  try {
    // Check if .claude/ files are in git
    const claudeFiles = execSync('git ls-files .claude/', { encoding: 'utf8' }).trim(); // NOSONAR - Administrative script, inputs from controlled sources

    if (claudeFiles) {
      error(
        'Proprietary .claude/ files found in git',
        claudeFiles.split('\n').join('\n   ')
      );
      info('.claude/ should be gitignored (internal use only)');
      info('See: AGENTS.md section on public vs. proprietary files');
    } else {
      success('No .claude/ files in git (correctly gitignored)');
    }

    // Check if .opencode/node_modules/ is in git
    const opencodeNodeModules = execSync( // NOSONAR - Administrative script, inputs from controlled sources
      'git ls-files .opencode/node_modules/',
      { encoding: 'utf8' }
    ).trim();

    if (opencodeNodeModules) {
      error(
        'OpenCode dependencies found in git',
        '.opencode/node_modules/ should be gitignored'
      );
    } else {
      success('No .opencode/node_modules/ in git (correctly gitignored)');
    }

    // Check if session state files are in git
    const sessionStateFiles = execSync('git ls-files | grep "\\.session-state\\.json$"', { // NOSONAR - Administrative script, inputs from controlled sources
      encoding: 'utf8',
      shell: true,
    })
      .trim()
      .split('\n')
      .filter(Boolean);

    if (sessionStateFiles.length > 0) {
      error(
        'Session state files found in git',
        sessionStateFiles.join('\n   ')
      );
      info('Session state should be gitignored (local-only)');
    } else {
      success('No session state files in git (correctly gitignored)');
    }
  } catch (err) {
    if (err.status === 1) {
      // grep returned no matches - this is good!
      success('No problematic AI config files in git');
    } else {
      warn(`Could not validate AI config: ${err.message}`);
    }
  }
}

/**
 * Check 3: Validate .gitignore coverage
 * Ensures required patterns are present
 */
async function validateGitignoreCoverage() {
  info('Checking .gitignore coverage...');

  const requiredPatterns = [
    { pattern: /^\.claude\//m, description: '.claude/ directory' },
    { pattern: /^\.opencode\/node_modules\//m, description: '.opencode/node_modules/' },
    { pattern: /^\*\*\/private\/\*\*/m, description: '**/private/** subdirectories' },
    { pattern: /^\*\.session-state\.json/m, description: '*.session-state.json files' },
    { pattern: /^\.env\*/m, description: '.env* files' },
  ];

  try {
    const gitignoreContent = await readFile(join(PROJECT_ROOT, '.gitignore'), 'utf8');
    const missingPatterns = [];

    for (const { pattern, description } of requiredPatterns) {
      if (!pattern.test(gitignoreContent)) {
        missingPatterns.push(description);
      }
    }

    if (missingPatterns.length > 0) {
      error(
        'Missing required .gitignore patterns',
        missingPatterns.join('\n   ')
      );
    } else {
      success('.gitignore has all required patterns');
    }
  } catch (err) {
    error('.gitignore not found or could not be read');
  }
}

/**
 * Check 4: Validate VS Code workspace configuration
 * Ensures contributor experience files exist
 */
async function validateVSCodeConfig() {
  info('Checking VS Code workspace configuration...');

  const requiredFiles = [
    '.vscode/mcp.json',
    '.vscode/settings.json',
    '.vscode/extensions.json',
    '.vscode/design-tokens.code-snippets',
  ];

  const missingFiles = [];

  for (const file of requiredFiles) {
    try {
      await stat(join(PROJECT_ROOT, file));
    } catch (err) {
      if (err.code === 'ENOENT') {
        missingFiles.push(file);
      }
    }
  }

  if (missingFiles.length > 0) {
    warn(
      'Some VS Code workspace files are missing',
      missingFiles.join('\n   ')
    );
    info('These files improve contributor experience');
  } else {
    success('All VS Code workspace files present');
  }
}

/**
 * Check 5: Validate pre-commit hook installation
 * Ensures governance hook is installed
 */
async function validatePreCommitHook() {
  info('Checking pre-commit hook...');

  try {
    const hookPath = join(PROJECT_ROOT, '.git/hooks/pre-commit');
    const hookContent = await readFile(hookPath, 'utf8');

    if (hookContent.includes('Governance Compliance')) {
      success('Enhanced pre-commit hook installed');
    } else {
      warn('Pre-commit hook exists but may not have governance checks');
      info('Run: cp scripts/hooks/pre-commit-governance .git/hooks/pre-commit');
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      warn('Pre-commit hook not installed');
      info('Run: cp scripts/hooks/pre-commit-governance .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit');
    } else {
      warn(`Could not check pre-commit hook: ${err.message}`);
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('');
  log('========================================', 'blue');
  log('🔐 GOVERNANCE COMPLIANCE VALIDATION', 'blue');
  log('========================================', 'blue');
  console.log('');

  await validateDocStructure();
  console.log('');
  await validateAIConfig();
  console.log('');
  await validateGitignoreCoverage();
  console.log('');
  await validateVSCodeConfig();
  console.log('');
  await validatePreCommitHook();
  console.log('');

  // Print summary
  log('========================================', 'blue');
  log('📊 VALIDATION SUMMARY', 'blue');
  log('========================================', 'blue');
  console.log('');
  success(`${results.passed} checks passed`);

  if (results.failed > 0) {
    error(`${results.failed} checks failed`);
    console.log('');
    log('Errors found:', 'red');
    results.errors.forEach((err) => console.log(`  • ${err}`));
  }

  if (results.warnings.length > 0) {
    log(`⚠️  ${results.warnings.length} warnings`, 'yellow');
    console.log('');
    log('Warnings:', 'yellow');
    results.warnings.forEach((w) => console.log(`  • ${w}`));
  }

  console.log('');
  info('For governance policies, see:');
  info('  • AGENTS.md (Governance Compliance section)');
  info('  • docs/governance/DOCS_GOVERNANCE.md');
  console.log('');

  // Exit with appropriate code
  if (results.failed > 0) {
    process.exit(1);
  } else if (results.warnings.length > 0) {
    log('⚠️  Warnings found (non-blocking)', 'yellow');
    process.exit(0); // Warnings don't block
  } else {
    log('✅ All governance checks passed!', 'green');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal error during validation:', err);
  process.exit(1);
});
