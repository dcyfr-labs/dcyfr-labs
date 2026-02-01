#!/usr/bin/env node

/**
 * Check All GitHub Code Scanning Alerts
 *
 * Uses GitHub CLI to query Code Scanning API for all open security alerts.
 * Requires: gh CLI authenticated with repo access
 *
 * Usage:
 *   node scripts/security/check-all-alerts.mjs
 *   npm run security:check-alerts
 *
 * Exit Codes:
 *   0 - No open alerts
 *   1 - Open alerts exist OR error occurred
 */

import { execSync } from "child_process";

const owner = "dcyfr";
const repo = "dcyfr-labs";

console.log(`\n🔍 Checking security alerts for ${owner}/${repo}...\n`);

try {
  // Query GitHub Code Scanning API
  const alertsJson = execSync(
    `gh api repos/${owner}/${repo}/code-scanning/alerts?state=open`,
    { encoding: "utf-8" }
  );

  const alerts = JSON.parse(alertsJson);

  console.log(`📊 Open Security Alerts: ${alerts.length}\n`);

  if (alerts.length === 0) {
    console.log("✅ No open security alerts! Repository is clean.\n");
    process.exit(0);
  }

  // Display each alert
  alerts.forEach((alert, index) => {
    const location = alert.most_recent_instance?.location;
    const path = location?.path || "unknown";
    const startLine = location?.start_line || "?";
    const endLine = location?.end_line || "?";

    console.log(`Alert #${alert.number}`);
    console.log(`  Rule:     ${alert.rule.id}`);
    console.log(`  Severity: ${alert.rule.severity}`);
    console.log(`  State:    ${alert.state}`);
    console.log(`  Location: ${path}:${startLine}-${endLine}`);
    console.log(`  Message:  ${alert.rule.description}`);
    console.log(`  URL:      ${alert.html_url}`);

    if (index < alerts.length - 1) {
      console.log("");
    }
  });

  console.log(`\n⚠️  ${alerts.length} open alert(s) require attention\n`);
  process.exit(1);
} catch (error) {
  if (error.message.includes("HTTP 403")) {
    console.error("❌ Error: GitHub CLI lacks permissions");
    console.error("   Required: Repository access with security_events:read");
    console.error("   Run: gh auth login");
  } else if (error.message.includes("HTTP 404")) {
    console.error("❌ Error: Repository not found or no code scanning enabled");
  } else {
    console.error("❌ Error checking alerts:", error.message);
  }

  process.exit(1);
}
