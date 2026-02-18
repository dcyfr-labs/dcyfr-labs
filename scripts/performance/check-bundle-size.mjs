#!/usr/bin/env node

/**
 * Bundle Size Monitor with Baseline Comparison
 *
 * Checks Next.js bundle sizes against:
 * 1. Defined budgets (performance-budgets.json)
 * 2. Historical baselines (performance-baselines.json) with configurable regression thresholds
 *
 * Run after build to validate bundle sizes before deployment.
 *
 * Usage:
 *   npm run build && node scripts/check-bundle-size.mjs
 *
 * Exit codes:
 *   0 - All checks passed
 *   1 - Budget or regression errors detected
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Project root directory (two levels up from scripts/performance)
const rootDir = join(__dirname, "..", "..");

// Load performance budgets
const budgetsPath = join(rootDir, "reports/performance/baselines/performance-budgets.json");
let budgets = null;
if (!existsSync(budgetsPath)) {
  console.warn("⚠️ performance-budgets.json not found - skipping strict budget checks. Create this file after initial production deploy to enforce budgets.");
  // Provide permissive defaults to avoid CI failures until budgets are established
  budgets = {
    budgets: {
      bundles: {
        firstLoadJS: { target: Number.POSITIVE_INFINITY, warning: Number.POSITIVE_INFINITY, error: Number.POSITIVE_INFINITY },
        pageBundle: { target: Number.POSITIVE_INFINITY, warning: Number.POSITIVE_INFINITY, error: Number.POSITIVE_INFINITY }
      }
    }
  };
} else {
  budgets = JSON.parse(readFileSync(budgetsPath, "utf8"));
}

// Load performance baselines (optional - may not exist yet)
const baselinesPath = join(rootDir, "reports/performance/baselines/performance-baselines.json");
let baselines = null;
if (existsSync(baselinesPath)) {
  baselines = JSON.parse(readFileSync(baselinesPath, "utf8"));
}

// Load Next.js build manifest
const buildManifestPath = join(
  rootDir,
  ".next/build-manifest.json"
);

if (!existsSync(buildManifestPath)) {
  console.error("❌ Build manifest not found. Run 'npm run build' first.");
  process.exit(1);
}

const buildManifest = JSON.parse(readFileSync(buildManifestPath, "utf8"));

/**
 * Get file size in KB
 */
function getFileSizeKB(filePath) {
  const fullPath = join(rootDir, ".next", filePath);
  if (!existsSync(fullPath)) {
    return 0;
  }
  const stats = readFileSync(fullPath);
  return Math.round((stats.length / 1024) * 100) / 100;
}

/**
 * Calculate total bundle size
 */
function calculateBundleSize() {
  let totalSize = 0;
  const bundles = [];

  // Get all page bundles
  for (const [page, files] of Object.entries(buildManifest.pages)) {
    let pageSize = 0;

    for (const file of files) {
      if (file.endsWith(".js")) {
        const size = getFileSizeKB(file);
        pageSize += size;
        totalSize += size;
      }
    }

    bundles.push({
      page,
      size: Math.round(pageSize * 100) / 100,
    });
  }

  return {
    total: Math.round(totalSize * 100) / 100,
    bundles: bundles.sort((a, b) => b.size - a.size),
  };
}

/**
 * Check if size exceeds budget
 */
function checkBudget(size, budget) {
  if (size <= budget.target) {
    return { status: "pass", emoji: "✅", level: "target" };
  } else if (size <= budget.warning) {
    return { status: "warning", emoji: "⚠️", level: "warning" };
  } else if (size <= budget.error) {
    return { status: "error", emoji: "❌", level: "error" };
  } else {
    return { status: "critical", emoji: "🚨", level: "critical" };
  }
}

/**
 * Check regression against baseline
 */
function checkRegression(current, baseline, thresholds) {
  if (!baseline || baseline === null) {
    return { status: "no-baseline", emoji: "ℹ️", change: null, level: "info" };
  }

  const changePercent = ((current - baseline) / baseline) * 100;
  
  if (changePercent <= 0) {
    return { status: "improved", emoji: "📉", change: changePercent, level: "good" };
  } else if (changePercent <= thresholds.warning) {
    return { status: "acceptable", emoji: "✅", change: changePercent, level: "pass" };
  } else if (changePercent <= thresholds.error) {
    return { status: "warning", emoji: "⚠️", change: changePercent, level: "warning" };
  } else {
    return { status: "regression", emoji: "🚨", change: changePercent, level: "error" };
  }
}

/**
 * Format percentage change for display
 */
function formatChange(change) {
  if (change === null) return "N/A";
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

/**
 * Main monitoring function
 */
/**
 * Accumulate error/warning flags from a budget check result.
 */
function applyCheck(check, flags) {
  if (check.status === "error" || check.status === "critical") {
    flags.hasErrors = true;
  } else if (check.status === "warning") {
    flags.hasWarnings = true;
  }
}

/**
 * Check first load JS against budget and optional baseline regression.
 */
function checkFirstLoadJS(result, flags, options) {
  const { budgets, baselineBundles, regressionThresholds } = options;
  const firstLoadBudget = budgets.budgets.bundles.firstLoadJS;
  const firstLoadCheck = checkBudget(result.total, firstLoadBudget);
  const firstLoadRegression = regressionThresholds
    ? checkRegression(result.total, baselineBundles?.firstLoadJS?.value, regressionThresholds)
    : null;

  console.log("\n📊 Total First Load JS");
  console.log(`${firstLoadCheck.emoji} Budget: ${result.total} kB / ${firstLoadBudget.target} kB (${firstLoadCheck.level})`);
  console.log(`   Target: ${firstLoadBudget.target} kB | Warning: ${firstLoadBudget.warning} kB | Error: ${firstLoadBudget.error} kB`);

  if (firstLoadRegression && firstLoadRegression.status !== "no-baseline") {
    console.log(`${firstLoadRegression.emoji} Baseline: ${baselineBundles?.firstLoadJS?.value} kB → ${result.total} kB (${formatChange(firstLoadRegression.change)})`);
    applyCheck(firstLoadRegression, flags);
  } else if (firstLoadRegression?.status === "no-baseline") {
    console.log(`ℹ️  No baseline established yet - run after first production deployment`);
  }
  applyCheck(firstLoadCheck, flags);
}

/**
 * Check individual page bundles (top 10).
 */
function checkPageBundles(result, flags, budgets) {
  console.log("\n📄 Page Bundles (Top 10)");
  console.log("-".repeat(70));
  const pageBudget = budgets.budgets.bundles.pageBundle;
  for (const bundle of result.bundles.slice(0, 10)) {
    const check = checkBudget(bundle.size, pageBudget);
    const sizeStr = `${bundle.size.toString().padStart(8)} kB`;
    console.log(`${check.emoji} ${bundle.page.padEnd(35)} ${sizeStr}`);
    applyCheck(check, flags);
  }
}

/**
 * Print baseline comparison section.
 */
function checkBaselineComparison(result, flags, baselineBundles, regressionThresholds) {
  console.log("\n📈 Baseline Comparison");
  console.log("-".repeat(70));
  const largestPageSize = result.bundles[0]?.size || 0;
  const largestPageRegression = checkRegression(largestPageSize, baselineBundles.largestPage?.value, regressionThresholds);
  if (largestPageRegression.status !== "no-baseline") {
    console.log(`${largestPageRegression.emoji} Largest Page: ${baselineBundles.largestPage?.value} kB → ${largestPageSize} kB (${formatChange(largestPageRegression.change)})`);
    applyCheck(largestPageRegression, flags);
  }
  console.log(`\nRegression Thresholds: <${regressionThresholds.warning}% = pass, ${regressionThresholds.warning}-${regressionThresholds.error}% = warning, >${regressionThresholds.error}% = error`);
}

function main() {
  console.log("\n📦 Bundle Size Monitor (Next.js 16 / Turbopack)\n");
  console.log("=" .repeat(70));

  const result = calculateBundleSize();
  const flags = { hasErrors: false, hasWarnings: false };

  const regressionThresholds = baselines?.regressionThresholds?.bundles;
  const baselineBundles = baselines?.baselines?.bundles;

  checkFirstLoadJS(result, flags, { budgets, baselines, baselineBundles, regressionThresholds });
  checkPageBundles(result, flags, budgets);

  if (baselines && baselineBundles) {
    checkBaselineComparison(result, flags, baselineBundles, regressionThresholds);
  }

  // Summary
  console.log("\n" + "=".repeat(70));

  if (flags.hasErrors) {
    console.log("\n❌ Bundle size check FAILED");
    console.log("   Some bundles exceed error thresholds or show critical regressions");
    console.log("   Review bundle sizes and optimize large bundles");
    console.log("\nActions:");
    console.log("   1. Run 'npm run perf:analyze' to visualize bundle composition");
    console.log("   2. Check for unexpected dependencies or large imports");
    console.log("   3. Consider code splitting or lazy loading for large routes");
    process.exit(1);
  } else if (flags.hasWarnings) {
    console.log("\n⚠️  Bundle size check PASSED with warnings");
    console.log("   Some bundles exceed target thresholds or show moderate regressions");
    console.log("   Consider optimization to stay within targets");
    console.log("\nRecommendation:");
    console.log("   Run 'npm run perf:analyze' to identify optimization opportunities");
    process.exit(0);
  } else {
    console.log("\n✅ Bundle size check PASSED");
    console.log("   All bundles within target thresholds and acceptable regression limits");
    process.exit(0);
  }
}

main();
