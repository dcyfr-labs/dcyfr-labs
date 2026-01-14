#!/usr/bin/env node

/**
 * Unified Health Check CLI
 * 
 * Single entry point for all health check tasks across the project.
 * Checks system health, services, and component readiness.
 * 
 * Usage:
 *   npm run health <command>
 *   npm run health all
 * 
 * Commands:
 *   redis      - Check Redis connection and usage
 *   mcp        - Check MCP servers status
 *   dev        - Check dev environment
 *   providers  - Check AI provider health
 *   all        - Run all health checks
 * 
 * Options:
 *   --clean    - Clean data while checking (for redis)
 *   --github   - GitHub-specific output (for redis)
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'all';
const options = args.slice(1);

const healthChecks = {
  redis: {
    script: 'redis-health-check.mjs',
    description: 'Check Redis connection, keys, and usage',
  },
  mcp: {
    script: 'ci/check-mcp-servers.mjs',
    description: 'Check MCP servers status and connectivity',
  },
  dev: {
    script: 'dev-utils.mjs',
    args: ['health'],
    description: 'Check dev environment setup',
  },
  providers: {
    script: '../.opencode/scripts/check-provider-health.sh',
    description: 'Check AI provider (OpenCode) health',
  },
};

const allChecks = Object.keys(healthChecks).sort();

function printHelp() {
  console.log('Unified Health Check CLI\n');
  console.log('Usage: npm run health [command] [options]\n');
  console.log('Commands:');
  allChecks.forEach((cmd) => {
    const info = healthChecks[cmd];
    console.log(`  ${cmd.padEnd(15)} - ${info.description}`);
  });
  console.log(`  ${'all'.padEnd(15)} - Run all health checks\n`);
  console.log('Options:');
  console.log('  --clean        - Clean data during check (redis only)');
  console.log('  --github       - GitHub-specific output (redis only)\n');
  console.log('Examples:');
  console.log('  npm run health redis');
  console.log('  npm run health redis --clean');
  console.log('  npm run health all\n');
}

function runHealthCheck(checkName) {
  const check = healthChecks[checkName];
  if (!check) {
    console.error(`❌ Unknown health check: ${checkName}`);
    printHelp();
    process.exit(1);
  }

  console.log(`\n🏥 Checking: ${check.description}`);
  console.log('─'.repeat(60));

  try {
    let cmd = `node "${path.join(__dirname, check.script)}"`;

    // Add arguments if specified
    if (check.args) {
      cmd += ` ${check.args.join(' ')}`;
    }

    // Pass through options for certain checks
    if (checkName === 'redis') {
      if (options.includes('--clean')) {
        cmd += ' --clean';
      }
      if (options.includes('--github')) {
        cmd += ' --github';
      }
    }

    execSync(cmd, { stdio: 'inherit' });
    console.log('─'.repeat(60));
    return false; // no errors
  } catch (error) {
    console.error(`\n❌ Health check failed: ${checkName}`);
    console.log('─'.repeat(60));
    return true; // has errors
  }
}

function runAllChecks() {
  console.log('🏥 Running all health checks...\n');
  let hasErrors = false;
  let passed = 0;
  let failed = 0;

  for (const checkName of allChecks) {
    if (runHealthCheck(checkName)) {
      failed++;
      hasErrors = true;
    } else {
      passed++;
    }
  }

  console.log(`\n📊 Health Check Summary:`);
  console.log(`  ✅ Passed: ${passed}`);
  if (failed > 0) {
    console.log(`  ❌ Failed: ${failed}\n`);
  }

  if (hasErrors) {
    process.exit(1);
  }
}

// Main logic
if (!command || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

if (command === 'all') {
  runAllChecks();
} else {
  const hasErrors = runHealthCheck(command);
  if (hasErrors) {
    process.exit(1);
  }
}
