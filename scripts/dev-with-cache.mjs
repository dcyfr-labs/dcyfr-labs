#!/usr/bin/env node

/**
 * Development Server with Auto Cache Population
 *
 * Starts the Next.js dev server and automatically populates the cache
 * once the server is ready. This ensures GitHub Activity, Badges, and
 * Skills widgets work immediately in local development.
 *
 * Usage:
 *   npm run dev                          # standard start
 *   npm run dev:fresh                    # kill port 3000 first, then start
 *   npm run dev:verbose                  # start with verbose output
 *   PORT=3001 npm run dev                # use a custom port
 *   npm run dev -- --kill-port           # auto-kill port conflict
 *   npm run dev -- --verbose             # verbose startup info
 *   DEBUG_DEV=1 npm run dev             # verbose via env var
 */

import { spawn } from 'child_process';
import { parseArgs } from 'util';
import chalk from 'chalk';
import {
  isPortInUse,
  getPortPIDs,
  killPort,
  promptKillPort,
  waitForServerReady,
  getStartupInfo,
} from './port-utils.mjs';

const { values: flags } = parseArgs({
  options: {
    'kill-port': { type: 'boolean', default: false },
    'verbose':   { type: 'boolean', default: false },
  },
  allowPositionals: false,
  strict: false,
});

const VERBOSE = flags.verbose || process.env.DEBUG_DEV === '1';
const PORT = parseInt(process.env.PORT ?? '3000', 10);

async function populateCacheWithRetry(port, { verbose = false, maxAttempts = 3, retryDelayMs = 2000 } = {}) {
  console.log(chalk.blue('\n📦 Populating local cache...'));

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (verbose && attempt > 1) {
      console.log(chalk.dim(`  Cache population attempt ${attempt}/${maxAttempts}...`));
    }

    try {
      const response = await fetch(`http://localhost:${port}/api/dev/populate-cache`);

      if (!response.ok) {
        const text = await response.text();
        if (attempt < maxAttempts) {
          console.warn(chalk.yellow(`⚠️  Cache population failed (${response.status}), retrying...`));
          if (verbose) console.warn(chalk.dim(`   Response: ${text.slice(0, 200)}`));
          await new Promise((r) => setTimeout(r, retryDelayMs));
          continue;
        }
        console.warn(chalk.yellow(`⚠️  Cache population failed after ${maxAttempts} attempts: ${response.status}`));
        console.warn(chalk.yellow(`   Run manually: npm run populate:cache`));
        return;
      }

      const data = await response.json();
      console.log(chalk.green('✅ Cache populated successfully!'));
      console.log(chalk.dim('   - GitHub contributions: ') + (data.github ? chalk.green('✓') : chalk.red('✗')));
      console.log(chalk.dim('   - Credly badges: ') + (data.credly ? chalk.green('✓') : chalk.red('✗')));
      if (data.warning) console.warn(chalk.yellow(`   ⚠️  ${data.warning}`));
      if (verbose && data.details) {
        console.log(chalk.dim('   Details: ' + JSON.stringify(data.details, null, 2)));
      }
      return;
    } catch (error) {
      if (attempt < maxAttempts) {
        if (verbose) console.warn(chalk.dim(`  Cache fetch error (attempt ${attempt}): ${error.message}`));
        await new Promise((r) => setTimeout(r, retryDelayMs));
        continue;
      }
      console.warn(chalk.yellow('\n⚠️  Could not populate cache after all attempts.'));
      if (verbose) console.warn(chalk.yellow(`   Error: ${error.message}`));
      console.warn(chalk.yellow('   Run manually once server is ready: npm run populate:cache'));
    }
  }
}

async function handlePortConflict(port, flags, pids) {
  if (flags['kill-port']) {
    const pidDesc = pids.length > 0 ? `PID(s): ${pids.join(', ')}` : 'unknown PID';
    console.log(chalk.yellow(`Port ${port} is in use (${pidDesc}). Killing automatically...`));
    const result = await killPort(port);
    if (result.killed.length > 0) {
      console.log(chalk.green(`Killed PID(s): ${result.killed.join(', ')}`));
      await new Promise((r) => setTimeout(r, 300));
    } else if (pids.length > 0) {
      console.error(chalk.red(`Could not kill process(es) on port ${port}.`));
      if (result.errors.length > 0) console.error(result.errors.join('\n'));
      process.exit(1);
    }
  } else {
    const shouldKill = await promptKillPort(port, pids);
    if (!shouldKill) {
      if (!process.stdin.isTTY) {
        console.error(chalk.red(`\n❌ Port ${port} is in use and running non-interactively.`));
        console.error(chalk.yellow(`   Use: npm run dev:fresh  (auto-kills port first)`));
        console.error(chalk.yellow(`   Or:  PORT=3001 npm run dev  (use a different port)`));
      } else {
        console.log(chalk.yellow('\nExiting. Options:'));
        console.log(chalk.dim('  npm run dev:fresh       — auto-kill port then start'));
        console.log(chalk.dim('  PORT=3001 npm run dev   — use a different port'));
      }
      process.exit(0);
    }
    const result = await killPort(port);
    if (result.killed.length === 0 && pids.length > 0) {
      console.error(chalk.red('Failed to kill processes. Try running: npm run dev:fresh'));
      process.exit(1);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
}

async function main() {
  console.log(chalk.blue('🚀 Starting Next.js dev server with auto cache population...\n'));

  // --- Port conflict check ---
  const portInUse = await isPortInUse(PORT);
  if (portInUse) {
    const pids = await getPortPIDs(PORT);
    await handlePortConflict(PORT, flags, pids);
    console.log();
  }

  // --- Verbose startup banner ---
  if (VERBOSE) {
    console.log(chalk.blue('Startup info:'));
    console.log(getStartupInfo(PORT));
    console.log();
  }

  // --- Start the Next.js dev server ---
  const devServer = spawn('next', ['dev', '--turbopack'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: String(PORT) },
  });

  if (VERBOSE) {
    console.log(chalk.dim(`  Spawned next dev (PID: ${devServer.pid})`));
  }

  devServer.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(chalk.red(`\n❌ Dev server exited with code ${code}`));
      if (code === 1) {
        console.error(chalk.yellow('  Common causes: port still in use, missing .env.local, TypeScript errors'));
        console.error(chalk.yellow('  Tip: run DEBUG_DEV=1 npm run dev for verbose output'));
      }
    }
    process.exit(code || 0);
  });

  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\n⏸️  Shutting down dev server...'));
    devServer.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    devServer.kill('SIGTERM');
    process.exit(0);
  });

  // --- Wait for readiness, then populate cache ---
  (async () => {
    if (VERBOSE) console.log(chalk.dim('  Polling for server readiness...'));

    const ready = await waitForServerReady(PORT, {
      timeoutMs: 60000,
      intervalMs: 500,
      verbose: VERBOSE,
    });

    if (!ready) {
      console.warn(chalk.yellow('⚠️  Server did not become ready within 60s. Skipping cache population.'));
      console.warn(chalk.yellow('   Run manually: npm run populate:cache'));
      return;
    }

    await populateCacheWithRetry(PORT, { verbose: VERBOSE });
  })();
}

main().catch((err) => {
  console.error(chalk.red('Fatal error starting dev server:'), err.message);
  process.exit(1);
});
