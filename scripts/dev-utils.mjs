#!/usr/bin/env node

/**
 * Development Utilities
 * Quick development tasks and health checks
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execAsync = promisify(exec);

const TASKS = {
  'health': {
    description: 'Check development environment health',
    fn: checkDevHealth
  },
  'clean': {
    description: 'Clean build artifacts and caches',
    fn: cleanProject
  },
  'reset': {
    description: 'Reset development environment (clean + install)',
    fn: resetProject
  },
  'perf': {
    description: 'Run performance benchmarks',
    fn: runPerfBenchmarks
  },
  'test-watch': {
    description: 'Run tests in optimized watch mode',
    fn: runTestWatch
  }
};

async function checkDevHealth() {
  console.log(chalk.blue('🔍 Checking development environment health...\n'));
  
  const checks = [
    { name: 'Node.js version', cmd: 'node --version' },
    { name: 'npm version', cmd: 'npm --version' },
    { name: 'TypeScript compilation', cmd: 'npx tsc --noEmit' },
    { name: 'ESLint status', cmd: 'npm run lint' },
    { name: 'Dependencies check', cmd: 'npm outdated' }
  ];

  for (const check of checks) {
    try {
      const { stdout, stderr } = await execAsync(check.cmd);
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
    'rm -rf test-results'
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
    { name: 'Dev startup', cmd: 'time timeout 5s npm run dev:fast || true' }
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