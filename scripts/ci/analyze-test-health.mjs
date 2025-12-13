#!/usr/bin/env node

/**
 * Test Health Analysis Script
 * Analyzes test results, coverage, and generates health reports
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { batchEnrich, formatEnrichmentSection } from "./sentry-enricher.mjs";
import { getOrCreateIssue } from "./github-api.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, "..");
const COVERAGE_DIR = path.join(REPO_ROOT, "coverage");
const TEST_RESULTS_FILE = process.env.TEST_RESULTS_FILE || path.join(REPO_ROOT, "test-results.json");
const BASELINE_FILE = process.env.BASELINE_FILE || null;

// Thresholds
const PASS_RATE_THRESHOLD = 95; // Minimum acceptable pass rate
const COVERAGE_REGRESSION_THRESHOLD = 2; // Max acceptable coverage decrease (%)
const SLOW_TEST_THRESHOLD = 1000; // Tests slower than 1s (ms)

/**
 * Parse Vitest JSON output to extract test results
 * @param {string} filePath - Path to test results JSON
 * @returns {Promise<Object>} Parsed test results
 */
async function parseTestResults(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const results = JSON.parse(content);

    const totalTests = results.numTotalTests || 0;
    const passedTests = results.numPassedTests || 0;
    const failedTests = results.numFailedTests || 0;
    const skippedTests = results.numPendingTests || 0;
    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    const testFiles = results.testResults || [];
    const failures = [];
    const slowTests = [];

    for (const file of testFiles) {
      for (const test of file.assertionResults || []) {
        if (test.status === "failed") {
          failures.push({
            testFile: file.name,
            testName: test.title,
            errorMessage: test.failureMessages?.[0] || "Unknown error",
            errorType: extractErrorType(test.failureMessages?.[0]),
            duration: test.duration || 0,
          });
        }

        if (test.duration && test.duration > SLOW_TEST_THRESHOLD) {
          slowTests.push({
            testFile: file.name,
            testName: test.title,
            duration: test.duration,
          });
        }
      }
    }

    return {
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      passRate,
      failures,
      slowTests,
    };
  } catch (error) {
    console.error(`❌ Error parsing test results from ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Extract error type from error message
 * @param {string} errorMessage - Full error message
 * @returns {string} Error type (e.g., "TypeError", "Error")
 */
function extractErrorType(errorMessage) {
  if (!errorMessage) return "Error";

  const match = errorMessage.match(/^(\w+Error):/);
  return match ? match[1] : "Error";
}

/**
 * Parse coverage summary from lcov.info
 * @returns {Promise<Object>} Coverage summary
 */
async function parseCoverage() {
  try {
    const summaryFile = path.join(COVERAGE_DIR, "coverage-summary.json");
    const content = await fs.readFile(summaryFile, "utf-8");
    const summary = JSON.parse(content);

    const total = summary.total || {};
    const lines = total.lines?.pct || 0;
    const statements = total.statements?.pct || 0;
    const functions = total.functions?.pct || 0;
    const branches = total.branches?.pct || 0;

    const average = (lines + statements + functions + branches) / 4;

    return {
      lines,
      statements,
      functions,
      branches,
      average,
    };
  } catch (error) {
    console.warn("⚠️  Could not parse coverage data:", error.message);
    return null;
  }
}

/**
 * Compare current results to baseline
 * @param {Object} current - Current test results
 * @param {string} baselineFile - Path to baseline JSON file
 * @returns {Promise<Object>} Comparison results
 */
async function compareToBaseline(current, baselineFile) {
  if (!baselineFile) {
    return {
      passRateDelta: 0,
      coverageDelta: 0,
      newFailures: current.failures.length,
      isRegression: false,
    };
  }

  try {
    const content = await fs.readFile(baselineFile, "utf-8");
    const baseline = JSON.parse(content);

    const passRateDelta = current.passRate - (baseline.passRate || 0);
    const coverageDelta = current.coverage
      ? current.coverage.average - (baseline.coverage?.average || 0)
      : 0;

    const isRegression =
      passRateDelta < -5 || // Pass rate dropped >5%
      coverageDelta < -COVERAGE_REGRESSION_THRESHOLD ||
      current.passRate < PASS_RATE_THRESHOLD;

    return {
      passRateDelta,
      coverageDelta,
      newFailures: current.failures.length - (baseline.failures?.length || 0),
      isRegression,
    };
  } catch (error) {
    console.warn("⚠️  Could not compare to baseline:", error.message);
    return {
      passRateDelta: 0,
      coverageDelta: 0,
      newFailures: current.failures.length,
      isRegression: false,
    };
  }
}

/**
 * Detect flaky tests from historical data
 * @param {Array} failures - Current failures
 * @returns {Promise<Array>} Flaky test names
 */
async function detectFlakyTests(failures) {
  // TODO: Implement flaky test detection using Redis or GitHub artifacts
  // For now, return empty array
  return [];
}

/**
 * Format test results as markdown table
 * @param {Array} failures - Test failures
 * @returns {string} Markdown table
 */
function formatFailureTable(failures) {
  if (failures.length === 0) {
    return "_No test failures. All tests passing! 🎉_";
  }

  let table = "| Test | File | Error | Duration |\n";
  table += "|------|------|-------|----------|\n";

  for (const failure of failures) {
    const testName = failure.testName.length > 50
      ? failure.testName.slice(0, 47) + "..."
      : failure.testName;
    const fileName = path.basename(failure.testFile);
    const errorMsg = failure.errorMessage.split("\n")[0].slice(0, 60) + "...";
    const duration = `${failure.duration}ms`;

    table += `| ${testName} | \`${fileName}\` | ${errorMsg} | ${duration} |\n`;
  }

  return table;
}

/**
 * Format slow tests as markdown list
 * @param {Array} slowTests - Slow test objects
 * @returns {string} Markdown formatted list
 */
function formatSlowTests(slowTests) {
  if (slowTests.length === 0) {
    return "_No slow tests detected._";
  }

  // Sort by duration (slowest first)
  const sorted = [...slowTests].sort((a, b) => b.duration - a.duration);

  let list = "";
  for (const test of sorted.slice(0, 10)) {
    // Top 10
    const fileName = path.basename(test.testFile);
    list += `- **${test.testName}** (\`${fileName}\`) - ${test.duration}ms\n`;
  }

  return list;
}

/**
 * Generate Issue body markdown
 * @param {Object} data - Analysis data
 * @returns {string} Complete Issue body
 */
function generateIssueBody(data) {
  const {
    date,
    passRate,
    totalTests,
    passedTests,
    failedTests,
    coverage,
    coverageDelta,
    passRateDelta,
    failures,
    slowTests,
    flakyTests,
    sentryEnrichment,
  } = data;

  const passRateEmoji = passRate >= PASS_RATE_THRESHOLD ? "✅" : "⚠️";
  const coverageEmoji = coverageDelta >= 0 ? "📈" : "📉";
  const deltaSign = passRateDelta >= 0 ? "+" : "";

  let body = `## Test Health Summary - Week of ${date}\n\n`;

  body += `### Key Metrics\n\n`;
  body += `- ${passRateEmoji} **Pass Rate:** ${passRate.toFixed(1)}% (${deltaSign}${passRateDelta.toFixed(1)}%, target: ≥${PASS_RATE_THRESHOLD}%)\n`;
  body += `- **Tests:** ${passedTests}/${totalTests} passing, ${failedTests} failing\n`;

  if (coverage) {
    body += `- ${coverageEmoji} **Coverage:** ${coverage.average.toFixed(1)}% (Δ ${coverageDelta >= 0 ? "+" : ""}${coverageDelta.toFixed(1)}%)\n`;
    body += `  - Lines: ${coverage.lines.toFixed(1)}%\n`;
    body += `  - Statements: ${coverage.statements.toFixed(1)}%\n`;
    body += `  - Functions: ${coverage.functions.toFixed(1)}%\n`;
    body += `  - Branches: ${coverage.branches.toFixed(1)}%\n`;
  }

  body += `- **Flaky Tests:** ${flakyTests.length}\n`;
  body += `- **Slow Tests:** ${slowTests.length} (>${SLOW_TEST_THRESHOLD}ms)\n\n`;

  if (failures.length > 0) {
    body += `### Test Failures\n\n`;
    body += formatFailureTable(failures);
    body += `\n\n`;
  }

  if (slowTests.length > 0) {
    body += `### Slow Tests (Top 10)\n\n`;
    body += formatSlowTests(slowTests);
    body += `\n\n`;
  }

  if (sentryEnrichment) {
    body += `### Related Sentry Errors\n\n`;
    body += sentryEnrichment;
    body += `\n\n`;
  }

  body += `### Action Items\n\n`;
  if (failedTests > 0) {
    body += `- [ ] Fix ${failedTests} failing test(s)\n`;
  }
  if (flakyTests.length > 0) {
    body += `- [ ] Investigate ${flakyTests.length} flaky test(s)\n`;
  }
  if (coverageDelta < -COVERAGE_REGRESSION_THRESHOLD) {
    body += `- [ ] Review coverage regression (${coverageDelta.toFixed(1)}%)\n`;
  }
  if (slowTests.length > 10) {
    body += `- [ ] Optimize slow tests (${slowTests.length} tests >${SLOW_TEST_THRESHOLD}ms)\n`;
  }

  if (failedTests === 0 && flakyTests.length === 0 && coverageDelta >= 0) {
    body += `- [x] All tests passing, coverage stable! 🎉\n`;
  }

  body += `\n---\n\n`;
  body += `*Automated by \`weekly-test-health\` workflow • [View workflow runs](https://github.com/${process.env.GITHUB_REPOSITORY}/actions/workflows/weekly-test-health.yml)*\n`;

  return body;
}

/**
 * Main analysis function
 */
async function main() {
  console.log("🔍 Analyzing test health...\n");

  // Parse test results
  const testResults = await parseTestResults(TEST_RESULTS_FILE);
  if (!testResults) {
    console.error("❌ Failed to parse test results. Exiting.");
    process.exit(1);
  }

  console.log(`✅ Parsed test results: ${testResults.passedTests}/${testResults.totalTests} passing (${testResults.passRate.toFixed(1)}%)`);

  // Parse coverage
  const coverage = await parseCoverage();
  if (coverage) {
    console.log(`✅ Parsed coverage: ${coverage.average.toFixed(1)}% average`);
  }

  // Compare to baseline
  const comparison = await compareToBaseline(
    { ...testResults, coverage },
    BASELINE_FILE
  );

  console.log(`📊 Comparison: Pass rate ${comparison.passRateDelta >= 0 ? "+" : ""}${comparison.passRateDelta.toFixed(1)}%, Coverage ${comparison.coverageDelta >= 0 ? "+" : ""}${comparison.coverageDelta.toFixed(1)}%`);

  // Detect flaky tests
  const flakyTests = await detectFlakyTests(testResults.failures);

  // Enrich with Sentry data
  let sentryEnrichment = "";
  if (testResults.failures.length > 0 && testResults.failures.length <= 10) {
    console.log("\n🔍 Enriching failures with Sentry data...");
    const enrichments = await batchEnrich(testResults.failures);
    sentryEnrichment = formatEnrichmentSection(enrichments);
  } else if (testResults.failures.length > 10) {
    sentryEnrichment = `_Too many failures (${testResults.failures.length}) to enrich with Sentry data. Fix critical failures first._`;
  }

  // Generate Issue body
  const issueBody = generateIssueBody({
    date: new Date().toISOString().split("T")[0],
    passRate: testResults.passRate,
    totalTests: testResults.totalTests,
    passedTests: testResults.passedTests,
    failedTests: testResults.failedTests,
    coverage,
    coverageDelta: comparison.coverageDelta,
    passRateDelta: comparison.passRateDelta,
    failures: testResults.failures,
    slowTests: testResults.slowTests,
    flakyTests,
    sentryEnrichment,
  });

  // Determine if we should create an Issue
  const shouldCreateIssue =
    comparison.isRegression ||
    testResults.failedTests > 0 ||
    testResults.passRate < PASS_RATE_THRESHOLD;

  if (!shouldCreateIssue) {
    console.log("\n✅ Test health is good! No Issue needed.");
    console.log("\nSummary:");
    console.log(`- Pass rate: ${testResults.passRate.toFixed(1)}% (≥${PASS_RATE_THRESHOLD}%)`);
    console.log(`- Coverage: ${coverage?.average.toFixed(1) || "N/A"}%`);
    console.log(`- All metrics stable ✅`);
    return;
  }

  console.log("\n⚠️  Test health requires attention. Creating/updating Issue...\n");

  // Create or update Issue
  const issue = await getOrCreateIssue({
    label: "test-health",
    signature: `<!-- test-health-${new Date().toISOString().slice(0, 7)} -->`,
    title: `Test Health Report - ${new Date().toISOString().split("T")[0]}`,
    body: issueBody,
    labels: ["test-health", "automated"],
    assignees: ["drew"],
    updateIfExists: true,
  });

  if (issue) {
    console.log(`\n✅ Issue created/updated: ${issue.html_url || issue.url || "#" + issue.number}`);
  }

  // Write current results as new baseline
  const baselineData = {
    date: new Date().toISOString(),
    passRate: testResults.passRate,
    coverage,
    failures: testResults.failures,
    slowTests: testResults.slowTests,
  };

  const baselineOutput = path.join(REPO_ROOT, "test-baseline.json");
  await fs.writeFile(baselineOutput, JSON.stringify(baselineData, null, 2));
  console.log(`\n📝 Wrote new baseline to ${baselineOutput}`);
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
