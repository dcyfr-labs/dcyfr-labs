#!/usr/bin/env node

/**
 * Security Audit Script
 * Aggregates security findings from multiple sources
 */

import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { getCodeQLAlerts, getOrCreateIssue } from "./github-api.mjs";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");

/**
 * Run npm audit and parse results
 * @returns {Promise<Object>} Audit results
 */
async function runNpmAudit() {
  console.log("🔍 Running npm audit...\n");

  try {
    const { stdout } = await execAsync("npm audit --json", {
      cwd: REPO_ROOT,
    });

    const audit = JSON.parse(stdout);

    const vulnerabilities = {
      critical: audit.metadata?.vulnerabilities?.critical || 0,
      high: audit.metadata?.vulnerabilities?.high || 0,
      moderate: audit.metadata?.vulnerabilities?.moderate || 0,
      low: audit.metadata?.vulnerabilities?.low || 0,
      info: audit.metadata?.vulnerabilities?.info || 0,
      total: audit.metadata?.vulnerabilities?.total || 0,
    };

    console.log(`   Critical: ${vulnerabilities.critical}`);
    console.log(`   High: ${vulnerabilities.high}`);
    console.log(`   Moderate: ${vulnerabilities.moderate}`);
    console.log(`   Low: ${vulnerabilities.low}`);
    console.log(`   Info: ${vulnerabilities.info}`);
    console.log(`   Total: ${vulnerabilities.total}\n`);

    return {
      vulnerabilities,
      advisories: audit.advisories || {},
    };
  } catch (error) {
    // npm audit exits with non-zero if vulnerabilities found
    if (error.stdout) {
      try {
        const audit = JSON.parse(error.stdout);
        const vulnerabilities = {
          critical: audit.metadata?.vulnerabilities?.critical || 0,
          high: audit.metadata?.vulnerabilities?.high || 0,
          moderate: audit.metadata?.vulnerabilities?.moderate || 0,
          low: audit.metadata?.vulnerabilities?.low || 0,
          info: audit.metadata?.vulnerabilities?.info || 0,
          total: audit.metadata?.vulnerabilities?.total || 0,
        };

        console.log(`   ⚠️  Vulnerabilities found:`);
        console.log(`   Critical: ${vulnerabilities.critical}`);
        console.log(`   High: ${vulnerabilities.high}`);
        console.log(`   Moderate: ${vulnerabilities.moderate}`);
        console.log(`   Low: ${vulnerabilities.low}\n`);

        return {
          vulnerabilities,
          advisories: audit.advisories || {},
        };
      } catch (parseError) {
        console.error("❌ Error parsing npm audit output:", parseError.message);
      }
    }

    console.warn("⚠️  npm audit failed:", error.message);
    return {
      vulnerabilities: {
        critical: 0,
        high: 0,
        moderate: 0,
        low: 0,
        info: 0,
        total: 0,
      },
      advisories: {},
    };
  }
}

/**
 * Check CodeQL findings
 * @returns {Promise<Object>} CodeQL summary
 */
async function checkCodeQL() {
  console.log("🔍 Checking CodeQL findings...\n");

  const alerts = await getCodeQLAlerts(30); // Last 30 days

  const bySeverity = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    warning: 0,
    note: 0,
  };

  for (const alert of alerts) {
    const severity = alert.rule?.security_severity_level || alert.rule?.severity || "note";
    bySeverity[severity] = (bySeverity[severity] || 0) + 1;
  }

  console.log(`   Total: ${alerts.length}`);
  console.log(`   Critical: ${bySeverity.critical}`);
  console.log(`   High: ${bySeverity.high}`);
  console.log(`   Medium: ${bySeverity.medium}`);
  console.log(`   Low: ${bySeverity.low}\n`);

  return {
    total: alerts.length,
    bySeverity,
    alerts: alerts.slice(0, 10), // Top 10 for Issue body
  };
}

/**
 * Check Dependabot PRs
 * @returns {Promise<Object>} Dependabot PR summary
 */
async function checkDependabotPRs() {
  console.log("🔍 Checking Dependabot PRs...\n");

  try {
    const { stdout } = await execAsync(
      'gh pr list --author "app/dependabot" --state open --json number,title,labels,url',
      { cwd: REPO_ROOT }
    );

    const prs = JSON.parse(stdout);

    const autoMergeable = prs.filter((pr) =>
      pr.labels.some((l) => l.name === "dependencies")
    );

    const requiresReview = prs.filter((pr) =>
      pr.labels.some((l) => l.name === "review-required")
    );

    console.log(`   Open PRs: ${prs.length}`);
    console.log(`   Auto-mergeable: ${autoMergeable.length}`);
    console.log(`   Requires review: ${requiresReview.length}\n`);

    return {
      total: prs.length,
      autoMergeable: autoMergeable.length,
      requiresReview: requiresReview.length,
      prs: prs.slice(0, 10), // Top 10
    };
  } catch (error) {
    console.warn("⚠️  Could not fetch Dependabot PRs (gh CLI required):", error.message);
    return {
      total: 0,
      autoMergeable: 0,
      requiresReview: 0,
      prs: [],
    };
  }
}

/**
 * Generate SBOM (Software Bill of Materials)
 * @returns {Promise<boolean>} Success status
 */
async function generateSBOM() {
  console.log("🔍 Generating SBOM...\n");

  try {
    await execAsync("npm sbom --sbom-format=cyclonedx --output-file=sbom.json", {
      cwd: REPO_ROOT,
    });

    console.log("   ✅ SBOM generated: sbom.json\n");
    return true;
  } catch (error) {
    console.warn("⚠️  SBOM generation failed (requires npm 9.7+):", error.message);
    console.log("   Skipping SBOM generation\n");
    return false;
  }
}

/**
 * Check license compliance
 * @returns {Promise<Object>} License summary
 */
async function checkLicenseCompliance() {
  console.log("🔍 Checking license compliance...\n");

  try {
    const { stdout } = await execAsync("npm ls --json --all", {
      cwd: REPO_ROOT,
    });

    const deps = JSON.parse(stdout);

    // TODO: Extract licenses from dependencies
    // For now, return placeholder
    console.log("   License check skipped (manual review required)\n");

    return {
      checked: false,
      message: "Manual license review recommended",
    };
  } catch (error) {
    console.warn("⚠️  License check failed:", error.message);
    return {
      checked: false,
      message: "License check unavailable",
    };
  }
}

/**
 * Build the CodeQL section of the issue body.
 */
function buildCodeQLSection(codeql) {
  let section = `### CodeQL Findings\n\n`;
  if (codeql.total === 0) {
    section += `✅ **No CodeQL findings in the last 30 days**\n\n`;
    return section;
  }
  section += `⚠️  **${codeql.total} findings** in the last 30 days:\n\n`;
  section += `- Critical: ${codeql.bySeverity.critical}\n`;
  section += `- High: ${codeql.bySeverity.high}\n`;
  section += `- Medium: ${codeql.bySeverity.medium}\n`;
  section += `- Low: ${codeql.bySeverity.low}\n\n`;
  if (codeql.alerts.length > 0) {
    section += `**Top Findings:**\n\n`;
    for (const alert of codeql.alerts.slice(0, 5)) {
      section += `- [${alert.rule?.id || "Unknown"}](${alert.html_url}): ${alert.rule?.description || "No description"}\n`;
    }
    section += `\n`;
  }
  return section;
}

/**
 * Build the NPM vulnerabilities section.
 */
function buildVulnSection(npm) {
  let section = `### Dependency Vulnerabilities\n\n`;
  if (npm.vulnerabilities.total === 0) {
    section += `✅ **No vulnerabilities found in dependencies**\n\n`;
    return section;
  }
  section += `⚠️  **${npm.vulnerabilities.total} vulnerabilities** found:\n\n`;
  section += `| Severity | Count |\n`;
  section += `|----------|-------|\n`;
  section += `| Critical | ${npm.vulnerabilities.critical} |\n`;
  section += `| High | ${npm.vulnerabilities.high} |\n`;
  section += `| Moderate | ${npm.vulnerabilities.moderate} |\n`;
  section += `| Low | ${npm.vulnerabilities.low} |\n`;
  section += `| Info | ${npm.vulnerabilities.info} |\n\n`;
  if (npm.vulnerabilities.critical > 0 || npm.vulnerabilities.high > 0) {
    section += `**⚠️  Action Required:** Address critical and high severity vulnerabilities immediately.\n\n`;
  }
  return section;
}

/**
 * Build the Dependabot PRs section.
 */
function buildDependabotSection(dependabot) {
  let section = `### Dependabot PRs\n\n`;
  section += `- **Open PRs:** ${dependabot.total}\n`;
  section += `- **Auto-mergeable:** ${dependabot.autoMergeable}\n`;
  section += `- **Requires Review:** ${dependabot.requiresReview}\n\n`;
  if (dependabot.prs.length > 0) {
    section += `**Recent PRs:**\n\n`;
    for (const pr of dependabot.prs) {
      section += `- [#${pr.number}](${pr.url}): ${pr.title}\n`;
    }
    section += `\n`;
  }
  return section;
}

/**
 * Build the action items list.
 */
function buildActionItems(codeql, npm, dependabot) {
  const items = [];
  if (codeql.bySeverity.critical > 0 || codeql.bySeverity.high > 0) {
    items.push("[ ] Review and fix high/critical CodeQL findings");
  }
  if (npm.vulnerabilities.critical > 0 || npm.vulnerabilities.high > 0) {
    items.push("[ ] Address critical/high dependency vulnerabilities");
  }
  if (dependabot.requiresReview > 0) {
    items.push(`[ ] Review ${dependabot.requiresReview} Dependabot PR(s) requiring manual review`);
  }
  if (dependabot.autoMergeable > 0) {
    items.push(`[ ] Approve/merge ${dependabot.autoMergeable} auto-mergeable Dependabot PR(s)`);
  }
  items.push("[ ] Review branch cleanup recommendations");
  items.push("[ ] Verify security headers configuration");
  return items;
}

/**
 * Format Issue body
 * @param {Object} data - All audit data
 * @returns {string} Markdown formatted Issue body
 */
function formatIssueBody(data) {
  const { npm, codeql, dependabot, license, branchSummary, month, year } = data;

  let body = `## Security Review - ${month} ${year}\n\n`;

  body += buildCodeQLSection(codeql);
  body += buildVulnSection(npm);
  body += buildDependabotSection(dependabot);

  if (branchSummary) {
    body += `### Branch Cleanup\n\n`;
    body += branchSummary;
    body += `\n`;
  }

  body += `### License Compliance\n\n`;
  body += `${license.message}\n\n`;

  body += `### Action Items\n\n`;
  const items = buildActionItems(codeql, npm, dependabot);
  for (const item of items) {
    body += `- ${item}\n`;
  }
  if (items.length === 0) {
    body += `- [x] All security checks passed! 🎉\n`;
  }

  body += `\n---\n\n`;
  body += `*Automated by \`monthly-security-review\` workflow • [View workflow runs](https://github.com/${process.env.GITHUB_REPOSITORY}/actions/workflows/monthly-security-review.yml)*\n`;

  return body;
}

/**
 * Main function
 */
async function main() {
  console.log("🔒 Security Audit\n");
  console.log("=" + "=".repeat(50) + "\n");

  // Run all checks in parallel
  const [npm, codeql, dependabot, sbomGenerated, license] = await Promise.all([
    runNpmAudit(),
    checkCodeQL(),
    checkDependabotPRs(),
    generateSBOM(),
    checkLicenseCompliance(),
  ]);

  // Load branch summary if available
  let branchSummary = null;
  if (process.env.BRANCH_SUMMARY) {
    branchSummary = process.env.BRANCH_SUMMARY;
  }

  // Generate Issue body
  const now = new Date();
  const month = now.toLocaleString("en-US", { month: "long" });
  const year = now.getFullYear();

  const issueBody = formatIssueBody({
    npm,
    codeql,
    dependabot,
    license,
    branchSummary,
    month,
    year,
  });

  console.log("📊 Security Summary:\n");
  console.log("CodeQL:", codeql.total, "findings");
  console.log("npm audit:", npm.vulnerabilities.total, "vulnerabilities");
  console.log("Dependabot:", dependabot.total, "open PRs");
  console.log("SBOM:", sbomGenerated ? "✅ Generated" : "⚠️  Skipped");
  console.log("");

  // Determine if we should create an Issue
  const shouldCreateIssue =
    codeql.bySeverity.critical > 0 ||
    codeql.bySeverity.high > 0 ||
    npm.vulnerabilities.critical > 0 ||
    npm.vulnerabilities.high > 0 ||
    dependabot.total > 5; // Create Issue if more than 5 open Dependabot PRs

  if (!shouldCreateIssue) {
    console.log("✅ No security concerns found. No Issue needed.\n");
    return;
  }

  console.log("⚠️  Security concerns found. Creating/updating Issue...\n");

  // Create or update Issue
  const issue = await getOrCreateIssue({
    label: "security",
    signature: `<!-- security-review-${year}-${now.getMonth() + 1} -->`,
    title: `Security Review - ${month} ${year}`,
    body: issueBody,
    labels: ["security", "automated", "monthly-review"],
    assignees: ["drew"],
    updateIfExists: true,
  });

  if (issue) {
    console.log(`✅ Issue created/updated: ${issue.html_url || issue.url || "#" + issue.number}\n`);
  }
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
