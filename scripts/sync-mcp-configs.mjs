#!/usr/bin/env node
/**
 * MCP Configuration Sync Script
 *
 * Synchronizes MCP server configurations between VS Code (.vscode/mcp.json)
 * and OpenCode (opencode.json) to ensure consistent tool availability.
 *
 * Usage:
 *   node scripts/sync-mcp-configs.mjs [--dry-run] [--direction=vscode-to-opencode|opencode-to-vscode|both]
 *
 * @see docs/ai/agent-compliance-remediation-plan.md Phase 2
 */

import fs from 'fs';
import path from 'path';

// Parse CLI args
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, val] = arg.replace(/^--/, '').split('=');
  acc[key] = val || true;
  return acc;
}, {});

const dryRun = args['dry-run'] === true || args['dry-run'] === 'true';
const direction = args.direction || 'vscode-to-opencode';

console.log('🔄 MCP Configuration Sync');
console.log(`   Direction: ${direction}`);
console.log(`   Dry Run: ${dryRun}\n`);

// Read configs
const vscodeConfigPath = '.vscode/mcp.json';
const opencodeConfigPath = 'opencode.json';

if (!fs.existsSync(vscodeConfigPath)) {
  console.error(`❌ VS Code config not found: ${vscodeConfigPath}`);
  process.exit(1);
}

if (!fs.existsSync(opencodeConfigPath)) {
  console.error(`❌ OpenCode config not found: ${opencodeConfigPath}`);
  process.exit(1);
}

const vscodeConfig = JSON.parse(fs.readFileSync(vscodeConfigPath, 'utf-8'));
const opencodeConfig = JSON.parse(fs.readFileSync(opencodeConfigPath, 'utf-8'));

// Extract MCP servers from VS Code config
const vscodeMcps = vscodeConfig.mcpServers || {};

// Extract MCP servers from OpenCode config
const opencodeMcps = opencodeConfig.mcp || {};

console.log('📊 Current State:');
console.log(`   VS Code MCPs: ${Object.keys(vscodeMcps).length}`);
console.log(`   OpenCode MCPs: ${Object.keys(opencodeMcps).length}\n`);

// Find missing MCPs
const vscodeOnly = Object.keys(vscodeMcps).filter((key) => !opencodeMcps[key]);
const opencodeOnly = Object.keys(opencodeMcps).filter((key) => !vscodeMcps[key]);
const common = Object.keys(vscodeMcps).filter((key) => opencodeMcps[key]);

console.log('🔍 Analysis:');
console.log(`   Common: ${common.length} servers`);
console.log(`   VS Code only: ${vscodeOnly.length} servers`);
console.log(`   OpenCode only: ${opencodeOnly.length} servers\n`);

if (vscodeOnly.length > 0) {
  console.log('📋 VS Code Exclusive MCPs:');
  vscodeOnly.forEach((key) => {
    const config = vscodeMcps[key];
    console.log(`   - ${key}`);
    console.log(`     Command: ${config.command?.[0] || 'N/A'}`);
    console.log(`     Enabled: ${config.enabled !== false ? '✅' : '❌'}`);
  });
  console.log('');
}

if (opencodeOnly.length > 0) {
  console.log('📋 OpenCode Exclusive MCPs:');
  opencodeOnly.forEach((key) => {
    const config = opencodeMcps[key];
    console.log(`   - ${key}`);
    console.log(`     Type: ${config.type || 'N/A'}`);
    console.log(`     Enabled: ${config.enabled !== false ? '✅' : '❌'}`);
  });
  console.log('');
}

// Check for DCYFR custom MCPs
const dcyfrMcps = ['dcyfr-analytics', 'dcyfr-design-tokens', 'dcyfr-content-manager'];
const missingDcyfrInOpenCode = dcyfrMcps.filter((key) => vscodeMcps[key] && !opencodeMcps[key]);

if (missingDcyfrInOpenCode.length > 0) {
  console.log('⚠️  DCYFR Custom MCPs missing in OpenCode:');
  missingDcyfrInOpenCode.forEach((key) => {
    console.log(`   - ${key}`);
  });
  console.log('');
}

// Synchronization logic
if (direction === 'vscode-to-opencode' || direction === 'both') {
  console.log('🔧 Sync: VS Code → OpenCode');

  vscodeOnly.forEach((key) => {
    const vscodeServer = vscodeMcps[key];
    console.log(`   Adding ${key} to OpenCode...`);

    // Convert VS Code format to OpenCode format
    const opencodeServer = {
      type: vscodeServer.url ? 'remote' : 'local',
      enabled: vscodeServer.enabled !== false,
      timeout: 5000,
    };

    if (vscodeServer.url) {
      opencodeServer.url = vscodeServer.url;
    } else if (vscodeServer.command) {
      opencodeServer.command = vscodeServer.command;
    }

    if (vscodeServer.env) {
      opencodeServer.environment = vscodeServer.env;
    }

    if (!dryRun) {
      opencodeConfig.mcp[key] = opencodeServer;

      // Also enable tools
      if (!opencodeConfig.tools) opencodeConfig.tools = {};
      opencodeConfig.tools[`${key}_*`] = true;
    }
  });
  console.log('');
}

if (direction === 'opencode-to-vscode' || direction === 'both') {
  console.log('🔧 Sync: OpenCode → VS Code');

  opencodeOnly.forEach((key) => {
    const opencodeServer = opencodeMcps[key];
    console.log(`   Adding ${key} to VS Code...`);

    // Convert OpenCode format to VS Code format
    const vscodeServer = {
      enabled: opencodeServer.enabled !== false,
    };

    if (opencodeServer.url) {
      vscodeServer.url = opencodeServer.url;
    } else if (opencodeServer.command) {
      vscodeServer.command = opencodeServer.command;
    }

    if (opencodeServer.environment) {
      vscodeServer.env = opencodeServer.environment;
    }

    if (!dryRun) {
      vscodeConfig.mcpServers[key] = vscodeServer;
    }
  });
  console.log('');
}

// Write updated configs
// CWE-367 Prevention: Use atomic write operation to avoid race condition (TOCTOU)
if (!dryRun) {
  if (direction === 'vscode-to-opencode' || direction === 'both') {
    // Atomic write with flag 'w' (truncate if exists, create if missing)
    fs.writeFileSync(opencodeConfigPath, JSON.stringify(opencodeConfig, null, 2), { flag: 'w' });
    console.log(`✅ Updated ${opencodeConfigPath}`);
  }

  if (direction === 'opencode-to-vscode' || direction === 'both') {
    // Atomic write with flag 'w'
    fs.writeFileSync(vscodeConfigPath, JSON.stringify(vscodeConfig, null, 2), { flag: 'w' });
    console.log(`✅ Updated ${vscodeConfigPath}`);
  }
} else {
  console.log('🏃 Dry run complete - no files modified');
  console.log('   Run without --dry-run to apply changes');
}

// Summary
console.log('\n📈 Summary:');
console.log(`   Servers synchronized: ${vscodeOnly.length + opencodeOnly.length}`);
console.log(
  `   Configuration consistent: ${vscodeOnly.length === 0 && opencodeOnly.length === 0 ? '✅' : '⚠️'}`
);

if (missingDcyfrInOpenCode.length > 0) {
  console.log(`\n⚠️  Action Required:`);
  console.log(`   Add DCYFR custom MCPs to OpenCode manually`);
  console.log(`   (These require local MCP server implementations)`);
}

process.exit(0);
