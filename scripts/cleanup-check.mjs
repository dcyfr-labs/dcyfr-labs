#!/usr/bin/env node
/**
 * Project Cleanup Health Check
 *
 * Detects common cleanup opportunities:
 * - Duplicate configurations
 * - Nested private/private directories
 * - Large uncommitted files
 * - Orphaned build artifacts
 * - Scattered governance files
 *
 * Usage: npm run cleanup:check
 */

import { readdir, stat, readFile } from "fs/promises";
import { join, relative } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

// Color codes for terminal output
const colors = {
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

const issues = {
  critical: [],
  warnings: [],
  info: [],
};

/**
 * Check for duplicate configuration files
 */
async function checkDuplicateConfigs() {
  console.log("\n📋 Checking for duplicate configurations...");

  const configs = [
    { name: "MCP", files: [".mcp.json", ".vscode/mcp.json"] },
    { name: "TypeScript", files: ["tsconfig.json", "tsconfig.base.json"] },
    {
      name: "ESLint",
      files: [
        ".eslintrc",
        ".eslintrc.js",
        ".eslintrc.json",
        "eslint.config.js",
      ],
    },
    {
      name: "Prettier",
      files: [".prettierrc", ".prettierrc.js", ".prettierrc.json"],
    },
  ];

  for (const config of configs) {
    const existing = [];
    for (const file of config.files) {
      try {
        await stat(join(ROOT, file));
        existing.push(file);
      } catch {
        // File doesn't exist, skip
      }
    }

    if (existing.length > 1) {
      issues.warnings.push(
        `Multiple ${config.name} configs found: ${existing.join(", ")}`
      );
    } else if (existing.length === 1) {
      issues.info.push(`${config.name}: ${existing[0]} (OK)`);
    }
  }
}

/**
 * Check for nested private/private directories
 */
async function checkNestedPrivate() {
  console.log("\n🔒 Checking for nested private directories...");

  async function findNestedPrivate(dir, depth = 0) {
    if (depth > 10) return; // Prevent infinite recursion

    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (entry.name === "node_modules" || entry.name === ".git") continue;

        const fullPath = join(dir, entry.name);
        const relativePath = relative(ROOT, fullPath);

        // Check if this is a private/*/private pattern
        if (relativePath.includes("/private/") && entry.name === "private") {
          issues.critical.push(`Nested private directory: ${relativePath}`);
        }

        // Recurse
        await findNestedPrivate(fullPath, depth + 1);
      }
    } catch (err) {
      // Skip inaccessible directories
    }
  }

  await findNestedPrivate(join(ROOT, "docs"));
}

/**
 * Check for orphaned test directories
 */
async function checkOrphanedDirs() {
  console.log("\n🗑️  Checking for orphaned directories...");

  const suspects = [
    "test",
    "tests-old",
    "temp",
    "tmp",
    ".temp",
    "backup",
    "old",
  ];

  for (const dir of suspects) {
    try {
      const stats = await stat(join(ROOT, dir));
      if (stats.isDirectory()) {
        issues.warnings.push(`Potentially orphaned directory: ${dir}/`);
      }
    } catch {
      // Directory doesn't exist, which is good
    }
  }
}

/**
 * Check for large uncommitted files
 */
async function checkLargeFiles() {
  console.log("\n📦 Checking for large files in build outputs...");

  const buildDirs = [
    "reports",
    "playwright-report",
    "coverage",
    ".lighthouseci",
  ];

  let totalSize = 0;
  let fileCount = 0;

  for (const dir of buildDirs) {
    try {
      const dirPath = join(ROOT, dir);
      const size = await getDirSize(dirPath);
      if (size > 0) {
        const sizeMB = (size / 1024 / 1024).toFixed(2);
        totalSize += size;
        fileCount++;

        if (size > 50 * 1024 * 1024) {
          // > 50MB
          issues.warnings.push(`Large build directory: ${dir}/ (${sizeMB} MB)`);
        } else {
          issues.info.push(`Build directory: ${dir}/ (${sizeMB} MB)`);
        }
      }
    } catch {
      // Directory doesn't exist
    }
  }

  if (totalSize > 0) {
    const totalMB = (totalSize / 1024 / 1024).toFixed(2);
    console.log(
      `  Total build artifacts: ${totalMB} MB across ${fileCount} directories`
    );
  }
}

/**
 * Get directory size recursively
 */
async function getDirSize(dir) {
  let size = 0;

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        size += await getDirSize(fullPath);
      } else {
        const stats = await stat(fullPath);
        size += stats.size;
      }
    }
  } catch {
    // Skip inaccessible directories
  }

  return size;
}

/**
 * Check governance file locations
 */
async function checkGovernance() {
  console.log("\n📚 Checking governance documentation...");

  const expected = [
    "docs/governance/DOCS_GOVERNANCE.md",
    "docs/governance/data-governance-policy.md",
    "docs/governance/AGENT-SECURITY-GOVERNANCE.md",
  ];

  const unexpected = [
    "docs/DOCS_GOVERNANCE.md",
    "docs/optimization/data-governance-policy.md",
    "docs/design/private/security/AGENT-SECURITY-GOVERNANCE.md",
  ];

  for (const file of expected) {
    try {
      await stat(join(ROOT, file));
      issues.info.push(`Governance file in correct location: ${file}`);
    } catch {
      issues.critical.push(`Missing governance file: ${file}`);
    }
  }

  for (const file of unexpected) {
    try {
      await stat(join(ROOT, file));
      issues.warnings.push(`Governance file in old location: ${file}`);
    } catch {
      // Good - file has been moved
    }
  }
}

/**
 * Check git hooks setup
 */
async function checkGitHooks() {
  console.log("\n🪝 Checking git hooks setup...");

  try {
    const huskyExists = await stat(join(ROOT, ".husky"));
    if (huskyExists.isDirectory()) {
      issues.info.push("Husky git hooks: Active");
    }
  } catch {
    issues.warnings.push("Husky not installed or configured");
  }

  try {
    const oldHooks = await stat(join(ROOT, ".githooks"));
    if (oldHooks.isDirectory()) {
      issues.warnings.push(
        "Legacy .githooks directory still exists (should use Husky)"
      );
    }
  } catch {
    // Good - legacy hooks removed
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(
    `${colors.blue}╔════════════════════════════════════════╗${colors.reset}`
  );
  console.log(
    `${colors.blue}║   Project Cleanup Health Check         ║${colors.reset}`
  );
  console.log(
    `${colors.blue}╚════════════════════════════════════════╝${colors.reset}`
  );

  await checkDuplicateConfigs();
  await checkNestedPrivate();
  await checkOrphanedDirs();
  await checkLargeFiles();
  await checkGovernance();
  await checkGitHooks();

  // Print summary
  console.log("\n" + "═".repeat(50));
  console.log(`${colors.blue}📊 CLEANUP HEALTH SUMMARY${colors.reset}`);
  console.log("═".repeat(50));

  if (issues.critical.length > 0) {
    console.log(
      `\n${colors.red}❌ CRITICAL ISSUES (${issues.critical.length}):${colors.reset}`
    );
    issues.critical.forEach((issue) =>
      console.log(`   ${colors.red}•${colors.reset} ${issue}`)
    );
  }

  if (issues.warnings.length > 0) {
    console.log(
      `\n${colors.yellow}⚠️  WARNINGS (${issues.warnings.length}):${colors.reset}`
    );
    issues.warnings.forEach((issue) =>
      console.log(`   ${colors.yellow}•${colors.reset} ${issue}`)
    );
  }

  if (issues.info.length > 0) {
    console.log(
      `\n${colors.green}✅ OK (${issues.info.length}):${colors.reset}`
    );
    issues.info.forEach((issue) =>
      console.log(`   ${colors.green}•${colors.reset} ${issue}`)
    );
  }

  console.log("\n" + "═".repeat(50));

  if (issues.critical.length === 0 && issues.warnings.length === 0) {
    console.log(
      `${colors.green}✨ No cleanup issues detected!${colors.reset}\n`
    );
    process.exit(0);
  } else if (issues.critical.length > 0) {
    console.log(
      `${colors.red}⚠️  Action required: ${issues.critical.length} critical issue(s) found${colors.reset}\n`
    );
    process.exit(1);
  } else {
    console.log(
      `${colors.yellow}ℹ️  Consider addressing ${issues.warnings.length} warning(s)${colors.reset}\n`
    );
    process.exit(0);
  }
}

main().catch((err) => {
  console.error(
    `${colors.red}Error running cleanup check:${colors.reset}`,
    err
  );
  process.exit(1);
});
