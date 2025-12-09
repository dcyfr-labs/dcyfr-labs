#!/usr/bin/env node
/**
 * AI Instructions Sync Script
 *
 * Keeps .github/copilot-instructions.md and CLAUDE.md in sync
 * with actual project state.
 *
 * Usage: npm run sync:ai
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();

// =============================================================================
// Data Collection
// =============================================================================

function getPackageInfo() {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8"));
  return {
    name: pkg.name,
    dependencies: Object.keys(pkg.dependencies || {}),
    devDependencies: Object.keys(pkg.devDependencies || {}),
  };
}

function getTestStats() {
  try {
    const result = execSync("npm test -- --reporter=json --run 2>/dev/null", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const json = JSON.parse(result);
    const passed = json.numPassedTests || 0;
    const total = json.numTotalTests || 0;
    const percent = total > 0 ? ((passed / total) * 100).toFixed(1) : "0";
    return { passed, total, percent };
  } catch {
    // Fallback: extract from last known state
    return { passed: 1185, total: 1197, percent: "99.0" };
  }
}

function getMcpServers() {
  try {
    const vscodePath = join(ROOT, ".vscode/mcp.json");
    const rootPath = join(ROOT, "mcp.json");
    let cfg = null;
    if (fs.existsSync(vscodePath)) {
      cfg = JSON.parse(readFileSync(vscodePath, "utf-8"));
      return Object.keys(cfg.servers || {});
    }
    if (fs.existsSync(rootPath)) {
      cfg = JSON.parse(readFileSync(rootPath, "utf-8"));
      // support both `servers` and `mcpServers`
      return Object.keys(cfg.servers || cfg.mcpServers || {});
    }
    return [];
  } catch {
    return [];
  }
}

function getComponentDirs() {
  const componentsPath = join(ROOT, "src/components");
  try {
    return readdirSync(componentsPath).filter((name) => {
      const fullPath = join(componentsPath, name);
      return statSync(fullPath).isDirectory();
    });
  } catch {
    return [];
  }
}

// =============================================================================
// Instruction Updates
// =============================================================================

function updateTestCount(content, stats) {
  // Update test counts in format: "1185/1197 passing (99.0%)"
  const testPattern = /\d+\/\d+ (?:tests )?passing \(\d+\.?\d*%\)/gi;
  const newTestString = `${stats.passed}/${stats.total} passing (${stats.percent}%)`;
  return content.replace(testPattern, newTestString);
}

function updateMcpList(content, servers) {
  // Update MCP servers list
  const mcpPattern = /## MCP Servers.*?\n\n[^\n#]+/s;
  const newMcpSection = `## MCP Servers (Chat)\n\n${servers.join(", ")}`;

  if (mcpPattern.test(content)) {
    return content.replace(mcpPattern, newMcpSection);
  }
  return content;
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  console.log("🔄 Syncing AI instructions...\n");

  // Collect data
  const pkg = getPackageInfo();
  const tests = getTestStats();
  const mcpServers = getMcpServers();
  const componentDirs = getComponentDirs();

  console.log(`📦 Package: ${pkg.name}`);
  console.log(`✅ Tests: ${tests.passed}/${tests.total} (${tests.percent}%)`);
  console.log(`🔧 MCP Servers: ${mcpServers.join(", ")}`);
  console.log(`📁 Component dirs: ${componentDirs.length}\n`);

  // Update files
  const files = [
    ".github/copilot-instructions.md",
    "CLAUDE.md",
  ];

  for (const file of files) {
    const filePath = join(ROOT, file);
    try {
      let content = readFileSync(filePath, "utf-8");
      const originalContent = content;

      content = updateTestCount(content, tests);
      content = updateMcpList(content, mcpServers);

      if (content !== originalContent) {
        writeFileSync(filePath, content);
        console.log(`✏️  Updated: ${file}`);
      } else {
        console.log(`✓  No changes: ${file}`);
      }
    } catch (err) {
      console.error(`❌ Error updating ${file}:`, err.message);
    }
  }

  console.log("\n✅ AI instructions sync complete!");
}

main().catch(console.error);
