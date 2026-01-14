#!/usr/bin/env node

/**
 * Unified MCP Server Management CLI
 * 
 * Single entry point for all MCP (Model Context Protocol) server operations.
 * Manage, check, and validate MCP servers across the project.
 * 
 * Usage:
 *   npm run mcp <command>
 * 
 * Commands:
 *   check      - Check MCP server connectivity and status
 *   health     - Generate detailed MCP health report
 *   validate   - Validate critical MCP configurations
 * 
 * Note: Use mcp:analytics, mcp:tokens, mcp:content, mcp:scholar to run servers
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const commands = {
  check: {
    script: 'ci/check-mcp-servers.mjs',
    description: 'Check MCP server connectivity and status',
  },
  health: {
    script: 'ci/generate-mcp-health-report.mjs',
    description: 'Generate detailed MCP health report',
  },
  validate: {
    script: 'ci/validate-critical-mcps.mjs',
    description: 'Validate critical MCP configurations',
  },
};

function printHelp() {
  console.log('Unified MCP Server Management CLI\n');
  console.log('Usage: npm run mcp <command>\n');
  console.log('Commands:');
  console.log('  check      - Check MCP server connectivity');
  console.log('  health     - Generate health report');
  console.log('  validate   - Validate configurations\n');
  console.log('To run MCP servers:');
  console.log('  npm run mcp:analytics  - Run analytics MCP server');
  console.log('  npm run mcp:tokens     - Run design tokens MCP server');
  console.log('  npm run mcp:content    - Run content MCP server');
  console.log('  npm run mcp:scholar    - Run semantic scholar MCP server\n');
  console.log('Examples:');
  console.log('  npm run mcp check');
  console.log('  npm run mcp health');
  console.log('  npm run mcp validate\n');
}

function runCommand(command) {
  const info = commands[command];
  if (!info) {
    console.error(`❌ Unknown command: ${command}`);
    printHelp();
    process.exit(1);
  }

  console.log(`🚀 ${info.description}\n`);

  try {
    const fullPath = path.join(__dirname, info.script);
    execSync(`node "${fullPath}"`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`\n❌ Command failed: ${command}`);
    process.exit(1);
  }
}

// Main logic
const command = process.argv[2];

if (!command || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

runCommand(command);
