#!/usr/bin/env node

/**
 * Unified Session Management CLI
 *
 * Single entry point for session state management across all AI agents.
 * Handles saving, restoring, recovering, and tracking session state.
 *
 * Usage:
 *   npm run session <command> [options]
 *
 * Commands:
 *   save <agent> <task>      - Save session state for an agent
 *   restore <agent>          - Restore session state from saved state
 *   recover                  - Recover last known session
 *   handoff                  - Initiate handoff to another agent
 *   track [report|last|clear] - Track and manage session metrics
 *
 * Agents: claude, opencode, copilot
 */

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Session state file locations
const sessionFiles = {
  claude: '.claude/.session-state.json',
  opencode: '.opencode/.session-state.json',
  copilot: '.github/copilot-session-state.json',
};

function printHelp() {
  console.log('Unified Session Management CLI\n');
  console.log('Usage: npm run session <command> [options]\n');
  console.log('Commands:');
  console.log('  save <agent> <task>     - Save session state');
  console.log('  restore <agent>         - Restore session state');
  console.log('  recover                 - Recover last session');
  console.log('  handoff [--from A --to B] - Handoff between agents');
  console.log('  track [report|last|clear] - Manage session tracking\n');
  console.log('Examples:');
  console.log('  npm run session save claude "Implementing feature X"');
  console.log('  npm run session restore opencode');
  console.log('  npm run session track report\n');
}

function saveSession(agent, taskDescription, phase = 'in-progress', timeRemaining = 'unknown') {
  if (!sessionFiles[agent]) {
    console.error(`❌ Unknown agent: ${agent}`);
    console.error(`Valid agents: ${Object.keys(sessionFiles).join(', ')}`);
    process.exit(1);
  }

  console.log(`💾 Saving session state for ${agent}...`);

  try {
    // Try to use the shell script first for compatibility
    const scriptPath = path.join(__dirname, 'save-session-state.sh');
    const result = spawnSync('bash', [scriptPath, agent, taskDescription, phase, timeRemaining], {
      stdio: ['inherit', 'pipe', 'pipe'],  // Buffer stdio - prevents hangs
      maxBuffer: 5 * 1024 * 1024,         // 5MB for session state
      shell: false,
    });
    if (result.error) throw result.error;
    if (result.status !== 0 && result.status !== null)
      throw new Error(`Script exited with code ${result.status}`);
    console.log('✅ Session saved');
  } catch (error) {
    console.error(`❌ Failed to save session: ${error.message}`);
    process.exit(1);
  }
}

function restoreSession(agent) {
  if (!sessionFiles[agent]) {
    console.error(`❌ Unknown agent: ${agent}`);
    process.exit(1);
  }

  console.log(`📂 Restoring session state for ${agent}...`);

  try {
    const scriptPath = path.join(__dirname, 'restore-session-state.sh');
    const result = spawnSync('bash', [scriptPath, agent], {
      stdio: 'inherit',
      shell: false,
    });
    if (result.error) throw result.error;
    if (result.status !== 0 && result.status !== null)
      throw new Error(`Script exited with code ${result.status}`);
    console.log('✅ Session restored');
  } catch (error) {
    console.error(`❌ Failed to restore session: ${error.message}`);
    process.exit(1);
  }
}

function recoverSession() {
  console.log('🔄 Recovering last known session...');

  try {
    const scriptPath = path.join(__dirname, 'session-recovery.sh');
    const result = spawnSync('bash', [scriptPath], {
      stdio: 'inherit',
      shell: false,
    });
    if (result.error) throw result.error;
    if (result.status !== 0 && result.status !== null)
      throw new Error(`Script exited with code ${result.status}`);
    console.log('✅ Session recovered');
  } catch (error) {
    console.error(`❌ Failed to recover session: ${error.message}`);
    process.exit(1);
  }
}

function handoffSession(fromAgent = 'claude', toAgent = 'opencode') {
  console.log(`🔀 Initiating handoff from ${fromAgent} to ${toAgent}...`);

  try {
    // Try the OpenCode-specific handoff script
    const scriptPath = path.join(__dirname, '../.opencode/scripts/session-handoff.sh');
    if (fs.existsSync(scriptPath)) {
      const result = spawnSync('bash', [scriptPath], {
        stdio: 'inherit',
        shell: false,
        env: { ...process.env, FROM_AGENT: fromAgent, TO_AGENT: toAgent },
      });
      if (result.error) throw result.error;
      if (result.status !== 0 && result.status !== null)
        throw new Error(`Script exited with code ${result.status}`);
    } else {
      // Fallback: save from one, restore to other
      saveSession(fromAgent, 'Handoff in progress', 'handoff');
      restoreSession(toAgent);
    }
    console.log('✅ Handoff complete');
  } catch (error) {
    console.error(`❌ Failed to complete handoff: ${error.message}`);
    process.exit(1);
  }
}

function trackSession(subcommand = 'report') {
  console.log(`📊 Session tracking: ${subcommand}`);

  try {
    const scriptPath = path.join(__dirname, '../.opencode/scripts/track-session.mjs');
    if (fs.existsSync(scriptPath)) {
      const result = spawnSync('node', [scriptPath, subcommand], {
        stdio: 'inherit',
        shell: false,
      });
      if (result.error) throw result.error;
      if (result.status !== 0 && result.status !== null)
        throw new Error(`Script exited with code ${result.status}`);
    } else {
      console.warn('⚠️  Session tracking not available');
    }
  } catch (error) {
    console.error(`❌ Failed to track session: ${error.message}`);
    process.exit(1);
  }
}

// Main logic
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

switch (command) {
  case 'save':
    if (!args[1] || !args[2]) {
      console.error('Usage: npm run session save <agent> <task> [phase] [time-remaining]');
      process.exit(1);
    }
    saveSession(args[1], args[2], args[3], args[4]);
    break;

  case 'restore':
    if (!args[1]) {
      console.error('Usage: npm run session restore <agent>');
      process.exit(1);
    }
    restoreSession(args[1]);
    break;

  case 'recover':
    recoverSession();
    break;

  case 'handoff':
    const fromIdx = args.indexOf('--from');
    const toIdx = args.indexOf('--to');
    const from = fromIdx !== -1 ? args[fromIdx + 1] : 'claude';
    const to = toIdx !== -1 ? args[toIdx + 1] : 'opencode';
    handoffSession(from, to);
    break;

  case 'track':
    trackSession(args[1] || 'report');
    break;

  default:
    console.error(`❌ Unknown command: ${command}`);
    printHelp();
    process.exit(1);
}
