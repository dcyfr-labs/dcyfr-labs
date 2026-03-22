#!/usr/bin/env node

/**
 * Development Utilities
 * Quick development tasks and health checks
 */

import { spawn } from 'child_process';
import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import { parseArgs } from 'util';

const execAsync = promisify(exec);

const TASKS = {
  health: {
    description: 'Check development environment health',
    fn: checkDevHealth,
  },
  clean: {
    description: 'Clean build artifacts and caches',
    fn: cleanProject,
  },
  reset: {
    description: 'Reset development environment (clean + install)',
    fn: resetProject,
  },
  check: {
    description: 'Run pre-flight checks (lint, typecheck, tests, build)',
    fn: runPreflight,
  },
  perf: {
    description: 'Run performance benchmarks',
    fn: runPerfBenchmarks,
  },
  'test-watch': {
    description: 'Run tests in optimized watch mode',
    fn: runTestWatch,
  },
};

async function checkDevHealth() {
  console.log(chalk.blue('🔍 Checking development environment health...\n'));

  const checks = [
    { name: 'Node.js version', cmd: 'node --version' },
    { name: 'npm version', cmd: 'npm --version' },
    { name: 'TypeScript compilation', cmd: 'npx tsc --noEmit' },
    { name: 'ESLint status', cmd: 'npm run lint' },
    { name: 'Dependencies check', cmd: 'npm outdated' },
  ];

  for (const check of checks) {
    try {
      const { stdout } = await execAsync(check.cmd);
      console.log(chalk.green(`✅ ${check.name}:`), stdout.trim() || 'OK');
    } catch (error) {
      console.log(chalk.red(`❌ ${check.name}:`), error.message);
    }
  }
}

async function cleanProject() {
  console.log(chalk.blue('🧹 Cleaning project artifacts...\n'));

  const cleanCommands = [
    'rm -rf .next',
    'rm -rf coverage',
    'rm -rf node_modules/.cache',
    'rm -rf playwright-report',
    'rm -rf test-results',
  ];

  for (const cmd of cleanCommands) {
    try {
      await execAsync(cmd);
      console.log(chalk.green(`✅ Cleaned: ${cmd}`));
    } catch (error) {
      console.log(chalk.yellow(`⚠️  Skip: ${cmd} (${error.message})`));
    }
  }

  console.log(chalk.green('\n✨ Project cleaned successfully!'));
}

async function resetProject() {
  console.log(chalk.blue('🔄 Resetting development environment...\n'));

  await cleanProject();

  console.log(chalk.blue('\n📦 Reinstalling dependencies...'));
  try {
    await execAsync('npm ci');
    console.log(chalk.green('✅ Dependencies installed'));
  } catch (error) {
    console.log(chalk.red('❌ Failed to install dependencies:'), error.message);
    return;
  }

  console.log(chalk.green('\n✨ Development environment reset complete!'));
}

async function runPerfBenchmarks() {
  console.log(chalk.blue('⚡ Running performance benchmarks...\n'));

  const benchmarks = [
    { name: 'Build time', cmd: 'time npm run build' },
    { name: 'Test time', cmd: 'time npm run test:coverage' },
    { name: 'Dev startup', cmd: 'time timeout 5s npm run dev:fast || true' },
  ];

  for (const benchmark of benchmarks) {
    console.log(chalk.yellow(`🏃 ${benchmark.name}...`));
    try {
      const { stdout, stderr } = await execAsync(benchmark.cmd);
      console.log(chalk.green(`✅ ${benchmark.name} completed`));
      console.log(stderr || stdout); // time output goes to stderr
    } catch (error) {
      console.log(chalk.red(`❌ ${benchmark.name} failed:`, error.message));
    }
    console.log('---');
  }
}

async function runTestWatch() {
  console.log(chalk.blue('👀 Starting optimized test watch mode...\n'));

  // Start vitest in watch mode with optimized settings
  try {
    await execAsync('npm run test', { stdio: 'inherit' });
  } catch (error) {
    console.log(chalk.red('❌ Test watch failed:'), error.message);
  }
}

async function runPreflight() {
  // Parse arguments for check command
  const args = parseArgs({
    options: {
      fast: { type: 'boolean', default: false },
      fix: { type: 'boolean', default: false },
      verbose: { type: 'boolean', default: false },
    },
    allowPositionals: true,
  });

  const results = [];

  function logResult(name, passed, duration) {
    const icon = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    const durationText = duration ? ` (${duration}ms)` : '';
    console.log(chalk[color](`${icon} ${name}${durationText}`));
  }

  async function runCommand(command, cmdArgs = [], options = {}) {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const child = spawn(command, cmdArgs, {
        // NOSONAR - Administrative script, inputs from controlled sources
        stdio: args.values.verbose ? 'inherit' : 'pipe',
        shell: true,
        ...options,
      });

      let stdout = '';
      let stderr = '';

      if (!args.values.verbose) {
        child.stdout?.on('data', (data) => (stdout += data));
        child.stderr?.on('data', (data) => (stderr += data));
      }

      child.on('close', (code) => {
        const duration = Date.now() - startTime;
        const passed = code === 0;

        if (!passed && !args.values.verbose && (stdout || stderr)) {
          console.log(stdout);
          console.error(stderr);
        }

        resolve({ passed, duration, stdout, stderr });
      });
    });
  }

  async function runCheck(name, command, cmdArgs = [], options = {}) {
    console.log(chalk.cyan(`\n🔍 Running ${name}...`));

    const result = await runCommand(command, cmdArgs, options);

    results.push({ name, ...result });
    logResult(name, result.passed, result.duration);

    return result.passed;
  }

  const startTime = Date.now();

  console.log(chalk.bold(chalk.cyan('🚀 Developer Pre-flight Checks\n')));
  console.log(
    `Mode: ${args.values.fast ? 'Fast' : 'Full'} | Fix: ${args.values.fix ? 'Yes' : 'No'}`
  );

  // Step 1: PII Scan
  await runCheck('PII/PI Scan', 'npm', ['run', 'scan:pi']);

  // Step 2: Lint (with auto-fix if requested)
  if (args.values.fix) {
    await runCheck('ESLint (auto-fix)', 'npm', ['run', 'lint:fix']);
  } else {
    await runCheck('ESLint', 'npm', ['run', 'lint']);
  }

  // Step 3: TypeScript
  await runCheck('TypeScript', 'npm', ['run', 'typecheck']);

  // Step 4: Unit Tests
  if (!args.values.fast) {
    await runCheck('Unit Tests', 'npm', ['run', 'test:unit']);
  } else {
    console.log(chalk.yellow('\n⏩ Skipping unit tests (--fast mode)'));
  }

  // Step 5: Build
  await runCheck('Production Build', 'npm', ['run', 'build']);

  // Step 6: Bundle Size Check
  if (!args.values.fast) {
    await runCheck('Bundle Size Check', 'npm', ['run', 'perf:check']);
  }

  // Step 7: Design Token Validation
  try {
    await runCheck('Design Token Validation', 'node', [
      'scripts/validation/validate-design-tokens.mjs',
    ]);
  } catch {
    console.log(chalk.yellow('⚠️  Design token validation script not found, skipping'));
  }

  // Summary
  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n' + chalk.bold('📊 Summary'));
  console.log('─'.repeat(60));

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  results.forEach((r) => logResult(r.name, r.passed));

  console.log('\n' + '─'.repeat(60));
  const summaryColor = failed === 0 ? 'green' : 'red';
  console.log(chalk[summaryColor](`Total: ${passed}/${total} passed, ${failed} failed`));
  console.log(chalk.cyan(`Duration: ${totalTime}s`));

  if (failed === 0) {
    console.log('\n' + chalk.bold(chalk.green('🎉 All checks passed! Ready to push.')));
    process.exit(0);
  } else {
    console.log('\n' + chalk.bold(chalk.red('❌ Some checks failed. Fix issues before pushing.')));

    if (!args.values.fix) {
      console.log(chalk.yellow('\n💡 Tip: Run with --fix to auto-fix some issues:'));
      console.log(chalk.yellow('   npm run dev:check -- --fix'));
    }

    process.exit(1);
  }
}

async function main() {
  const task = process.argv[2];

  if (!task || !TASKS[task]) {
    console.log(chalk.cyan('🛠️  Development Utilities\n'));
    console.log('Available tasks:');
    for (const [key, value] of Object.entries(TASKS)) {
      console.log(`  ${chalk.green(key)}: ${value.description}`);
    }
    console.log(`\nUsage: node dev-utils.js <task>`);
    process.exit(1);
  }

  await TASKS[task].fn();
}

main().catch(console.error);
