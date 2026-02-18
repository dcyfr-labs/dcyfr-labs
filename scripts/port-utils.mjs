#!/usr/bin/env node

/**
 * Port Utilities
 *
 * Shared utilities for port conflict detection, process management,
 * and server readiness polling. Used by dev-with-cache.mjs and server.mjs.
 *
 * Can also be run directly as a CLI:
 *   node scripts/port-utils.mjs check [port]
 *   node scripts/port-utils.mjs kill [port]
 */

import net from 'net';
import { exec } from 'child_process';
import { promisify } from 'util';
import readline from 'readline';
import chalk from 'chalk';

const execAsync = promisify(exec);

/**
 * Check if a port is in use by attempting to bind to it.
 * Uses EADDRINUSE detection — more reliable than connect for conflict detection.
 */
export function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      resolve(err.code === 'EADDRINUSE');
    });
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port); // no host = Node default (::), same bind target as Next.js
  });
}

/**
 * Get PIDs of processes listening on the given port.
 * Uses lsof on macOS/Linux, netstat on Windows.
 * Returns [] if no processes found or if the tool is unavailable.
 */
export async function getPortPIDs(port) {
  try {
    if (process.platform === 'win32') {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const pids = new Set();
      for (const line of stdout.trim().split('\n')) {
        const parts = line.trim().split(/\s+/);
        const pidStr = parts[parts.length - 1];
        const pid = parseInt(pidStr, 10);
        if (!isNaN(pid) && pid > 0) pids.add(pid);
      }
      return [...pids];
    } else {
      // -sTCP:LISTEN restricts to listening processes only — avoids killing browser tabs
      const { stdout } = await execAsync(`lsof -ti:${port} -sTCP:LISTEN`);
      return stdout
        .trim()
        .split('\n')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n) && n > 0);
    }
  } catch {
    // lsof exits non-zero when no processes found — that's expected
    return [];
  }
}

/**
 * Kill all processes listening on the given port.
 * Sends SIGTERM first, waits 500ms, then SIGKILL any survivors.
 */
export async function killPort(port) {
  const pids = await getPortPIDs(port);
  const killed = [];
  const errors = [];

  for (const pid of pids) {
    try {
      process.kill(pid, 'SIGTERM');
      killed.push(pid);
    } catch (err) {
      errors.push(`PID ${pid}: ${err.message}`);
    }
  }

  if (killed.length > 0) {
    await new Promise((r) => setTimeout(r, 500));
    for (const pid of killed) {
      try {
        process.kill(pid, 0); // throws if process is gone
        process.kill(pid, 'SIGKILL'); // still alive — force kill
      } catch {
        // process already exited — expected and fine
      }
    }
  }

  return { killed, errors };
}

/**
 * Interactive readline prompt asking whether to kill the port.
 * Returns false immediately if stdin is not a TTY (CI/non-interactive safety).
 */
export async function promptKillPort(port, pids) {
  if (!process.stdin.isTTY) {
    return false;
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const pidDesc = pids.length > 0 ? `PID(s): ${pids.join(', ')}` : 'unknown PID';

  return new Promise((resolve) => {
    rl.question(
      chalk.yellow(`⚠️  Port ${port} is in use (${pidDesc}). Kill and continue? (y/N): `),
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      }
    );
  });
}

/**
 * Poll until the port accepts a TCP connection (server is ready).
 * Reuses the net.Socket connect pattern from scripts/utilities/run-with-dev.mjs.
 */
export async function waitForServerReady(port, { timeoutMs = 60000, intervalMs = 500, verbose = false } = {}) {
  const start = Date.now();
  let attempt = 0;

  while (Date.now() - start < timeoutMs) {
    attempt++;
    const open = await _isPortOpen(port);
    if (open) {
      if (verbose) console.log(chalk.dim(`  [port] Ready after ${attempt} poll(s) (${Date.now() - start}ms)`));
      return true;
    }
    if (verbose && attempt % 4 === 0) {
      const remaining = Math.round((timeoutMs - (Date.now() - start)) / 1000);
      console.log(chalk.dim(`  [port] Waiting for :${port} (${remaining}s left)...`));
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  return false;
}

/** TCP connect check — true if something is accepting connections on the port */
function _isPortOpen(port, host = '127.0.0.1', timeout = 1000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;
    socket.setTimeout(timeout);
    socket.once('connect', () => { done = true; socket.destroy(); resolve(true); });
    socket.once('timeout', () => { if (done) return; done = true; socket.destroy(); resolve(false); });
    socket.once('error', () => { if (done) return; done = true; resolve(false); });
    socket.connect(port, host);
  });
}

/**
 * Returns a formatted startup info string for verbose/debug output.
 */
export function getStartupInfo(port) {
  return [
    chalk.dim('  Node:     ') + process.version,
    chalk.dim('  PORT:     ') + port,
    chalk.dim('  NODE_ENV: ') + (process.env.NODE_ENV || 'development'),
    chalk.dim('  PID:      ') + process.pid,
    chalk.dim('  Platform: ') + process.platform,
  ].join('\n');
}

async function handleCheckCommand(port) {
  const inUse = await isPortInUse(port);
  if (inUse) {
    const pids = await getPortPIDs(port);
    const pidStr = pids.length > 0 ? ` (PID: ${pids.join(', ')})` : '';
    console.log(chalk.red(`PORT ${port} IN USE${pidStr}`));
  } else {
    console.log(chalk.green(`PORT ${port} FREE`));
  }
  process.exit(0);
}

async function handleKillCommand(port) {
  const inUse = await isPortInUse(port);
  if (!inUse) {
    console.log(chalk.dim(`Port ${port} is not in use.`));
    process.exit(0);
  }
  const pids = await getPortPIDs(port);
  console.log(chalk.yellow(`Killing process(es) on port ${port} (PID: ${pids.join(', ')})...`));
  const result = await killPort(port);
  if (result.killed.length > 0) {
    console.log(chalk.green(`Killed PID(s): ${result.killed.join(', ')}`));
  }
  if (result.errors.length > 0) {
    console.error(chalk.red('Errors:\n' + result.errors.join('\n')));
    process.exit(1);
  }
  process.exit(0);
}

// --- CLI interface (used by port:check and port:kill npm scripts) ---

async function cli() {
  const command = process.argv[2];
  const port = parseInt(process.argv[3] ?? process.env.PORT ?? '3000', 10);

  if (command === 'check') {
    await handleCheckCommand(port);
  } else if (command === 'kill') {
    await handleKillCommand(port);
  } else {
    console.log(chalk.cyan('Usage:'));
    console.log('  node scripts/port-utils.mjs check [port]  — check if port is in use');
    console.log('  node scripts/port-utils.mjs kill [port]   — kill process on port');
    console.log(`\nDefault port: ${port}`);
    process.exit(0);
  }
}

// Only run CLI when executed directly (not when imported as a module)
if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  cli().catch((err) => {
    console.error(chalk.red('Error:'), err.message);
    process.exit(1);
  });
}
