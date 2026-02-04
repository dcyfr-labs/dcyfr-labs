#!/usr/bin/env node

/**
 * Unified AI Tooling CLI
 *
 * Single entry point for all AI provider management commands.
 * Consolidates costs, fallback management, and telemetry tracking.
 *
 * Usage:
 *   npm run ai <command> [options]
 *
 * Command Groups:
 *
 *   AI Costs:
 *     costs              - View current AI costs
 *     costs view         - View cost summary
 *     costs export:json  - Export costs as JSON
 *     costs export:csv   - Export costs as CSV
 *     costs archive      - Archive and reset cost tracking
 *
 *   Provider Fallback:
 *     fallback:init      - Initialize fallback system
 *     fallback:status    - Check fallback status
 *     fallback:health    - Check provider health
 *     fallback:trigger   - Trigger manual fallback
 *     fallback:return    - Return to primary provider
 *
 *   Telemetry:
 *     telemetry:stats    - View agent statistics
 *     telemetry:compare  - Compare agent performance
 *     telemetry:handoffs - View agent handoff metrics
 *     telemetry:export   - Export telemetry data
 */

import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const commands = {
  // AI Costs
  costs: {
    scripts: ['unified-ai-costs.mjs'],
    description: 'View AI cost summary',
    args: [],
  },
  'costs:view': {
    scripts: ['unified-ai-costs.mjs'],
    description: 'View cost summary',
    args: ['view'],
  },
  'costs:export:json': {
    scripts: ['unified-ai-costs.mjs'],
    description: 'Export costs as JSON',
    args: ['export:json'],
  },
  'costs:export:csv': {
    scripts: ['unified-ai-costs.mjs'],
    description: 'Export costs as CSV',
    args: ['export:csv'],
  },
  'costs:archive': {
    scripts: ['archive-ai-costs.mjs'],
    description: 'Archive and reset cost tracking',
    args: [],
  },

  // Provider Fallback
  'fallback:init': {
    scripts: ['provider-fallback-cli.ts'],
    description: 'Initialize fallback system',
    args: ['init'],
    isTsx: true,
  },
  'fallback:status': {
    scripts: ['provider-fallback-cli.ts'],
    description: 'Check fallback status',
    args: ['status'],
    isTsx: true,
  },
  'fallback:health': {
    scripts: ['provider-fallback-cli.ts'],
    description: 'Check provider health',
    args: ['health'],
    isTsx: true,
  },
  'fallback:trigger': {
    scripts: ['provider-fallback-cli.ts'],
    description: 'Trigger manual fallback',
    args: ['fallback'],
    isTsx: true,
  },
  'fallback:return': {
    scripts: ['provider-fallback-cli.ts'],
    description: 'Return to primary provider',
    args: ['return'],
    isTsx: true,
  },

  // Telemetry
  'telemetry:stats': {
    scripts: ['telemetry-cli.ts'],
    description: 'View agent statistics',
    args: ['stats'],
    isTsx: true,
  },
  'telemetry:compare': {
    scripts: ['telemetry-cli.ts'],
    description: 'Compare agent performance',
    args: ['compare'],
    isTsx: true,
  },
  'telemetry:handoffs': {
    scripts: ['telemetry-cli.ts'],
    description: 'View agent handoff metrics',
    args: ['handoffs'],
    isTsx: true,
  },
  'telemetry:export': {
    scripts: ['telemetry-cli.ts'],
    description: 'Export telemetry data',
    args: ['export'],
    isTsx: true,
  },
};

const categories = {
  costs: 'AI Cost Tracking',
  fallback: 'Provider Fallback System',
  telemetry: 'Agent Telemetry & Analytics',
};

function printHelp() {
  console.log('Unified AI Tooling CLI\n');
  console.log('Usage: npm run ai <command> [options]\n');

  console.log('AI Cost Tracking:');
  console.log('  costs              - View cost summary');
  console.log('  costs view         - View detailed costs');
  console.log('  costs export:json  - Export as JSON');
  console.log('  costs export:csv   - Export as CSV');
  console.log('  costs archive      - Archive costs\n');

  console.log('Provider Fallback System:');
  console.log('  fallback:init      - Initialize system');
  console.log('  fallback:status    - Check status');
  console.log('  fallback:health    - Check provider health');
  console.log('  fallback:trigger   - Trigger fallback');
  console.log('  fallback:return    - Return to primary\n');

  console.log('Agent Telemetry:');
  console.log('  telemetry:stats    - View agent statistics');
  console.log('  telemetry:compare  - Compare agents');
  console.log('  telemetry:handoffs - View handoff metrics');
  console.log('  telemetry:export   - Export data\n');

  console.log('Examples:');
  console.log('  npm run ai costs');
  console.log('  npm run ai costs export:json');
  console.log('  npm run ai fallback:status');
  console.log('  npm run ai telemetry:stats\n');
}

function runCommand(command, extraArgs = []) {
  const info = commands[command];
  if (!info) {
    console.error(`❌ Unknown command: ${command}`);
    printHelp();
    process.exit(1);
  }

  console.log(`🚀 ${info.description}\n`);

  try {
    for (const script of info.scripts) {
      const fullPath = path.join(__dirname, script);
      const args = [...(info.args || []), ...extraArgs];

      const runner = info.isTsx ? 'tsx' : 'node';
      const result = spawnSync(runner, [fullPath, ...args], {
        stdio: ['inherit', 'pipe', 'pipe'],  // Buffer stdout/stderr - prevents heredoc hangs
        maxBuffer: 10 * 1024 * 1024,        // 10MB limit for large agent output
        shell: false,
      });

      if (result.error) {
        throw result.error;
      }
      if (result.status !== 0 && result.status !== null) {
        throw new Error(`Command exited with code ${result.status}`);
      }
    }
  } catch (error) {
    console.error(`\n❌ Command failed: ${command}`);
    process.exit(1);
  }
}

// Main logic
const args = process.argv.slice(2);
const command = args[0];
const extraArgs = args.slice(1);

if (!command || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

runCommand(command, extraArgs);
