#!/usr/bin/env node

/**
 * Upstream Security Advisory Monitor
 * 
 * Proactively monitors GitHub Security Advisories for React/Next.js ecosystem
 * to detect vulnerabilities before they propagate to npm audit/Dependabot.
 * 
 * Created in response to CVE-2025-55182 which had a 13-hour detection gap.
 * 
 * @see https://github.com/facebook/react/security/advisories
 * @see https://github.com/vercel/next.js/security/advisories
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const FORCE_ALERT = process.env.FORCE_ALERT === "true";
const SEVERITY_THRESHOLD = process.env.SEVERITY_THRESHOLD || "high";

// State file to track seen advisories (stored in .github/security-state.json)
const STATE_FILE = join(__dirname, "..", ".github", "security-state.json");

// Packages to monitor for security advisories
const MONITORED_PACKAGES = [
  "next",
  "react", 
  "react-dom",
  "react-server-dom-webpack",
  "react-server-dom-turbopack",
  "react-server-dom-parcel",
];

// RSC packages get lower severity threshold (medium+)
const RSC_PACKAGES = new Set([
  "react-server-dom-webpack",
  "react-server-dom-turbopack",
  "react-server-dom-parcel",
]);

// Severity rankings
const SEVERITY_RANK = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Load previously seen advisory IDs
 */
function loadState() {
  try {
    if (existsSync(STATE_FILE)) {
      return JSON.parse(readFileSync(STATE_FILE, "utf-8"));
    }
  } catch (error) {
    console.warn("⚠️  Could not load state file:", error.message);
  }
  return { seenAdvisories: [], lastCheck: null };
}

/**
 * Save state with seen advisory IDs
 */
function saveState(state) {
  try {
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    console.warn("⚠️  Could not save state file:", error.message);
  }
}

/**
 * Check if severity meets threshold for a package
 */
function meetsSeverityThreshold(severity, packageName) {
  const severityRank = SEVERITY_RANK[severity?.toLowerCase()] || 0;
  
  // RSC packages: alert on medium+
  if (RSC_PACKAGES.has(packageName)) {
    return severityRank >= SEVERITY_RANK.medium;
  }
  
  // Core packages: alert on high+ (or user-specified threshold)
  const thresholdRank = SEVERITY_RANK[SEVERITY_THRESHOLD] || SEVERITY_RANK.high;
  return severityRank >= thresholdRank;
}

/**
 * Fetch security advisories from the global GHSA database
 */
async function fetchAdvisoriesForPackage(packageName) {
  const advisories = [];
  
  try {
    console.log(`   Checking GHSA for ${packageName}...`);
    
    // Use the global advisories API
    const response = await fetch(
      `https://api.github.com/advisories?ecosystem=npm&package=${packageName}&per_page=20`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          ...(GITHUB_TOKEN && { Authorization: `Bearer ${GITHUB_TOKEN}` }),
        },
      }
    );

    if (!response.ok) {
      console.warn(`   ⚠️  GHSA API error for ${packageName}: ${response.status}`);
      return [];
    }

    const data = await response.json();
    console.log(`   Found ${data.length} total advisories for ${packageName}`);
    
    for (const adv of data) {
      // Only include recent advisories (last 30 days)
      const publishedAt = new Date(adv.published_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (publishedAt >= thirtyDaysAgo) {
        const vulnInfo = adv.vulnerabilities?.find(v => v.package?.name === packageName);
        
        advisories.push({
          id: adv.ghsa_id,
          package: packageName,
          severity: adv.severity,
          summary: adv.summary,
          description: adv.description,
          cvssScore: adv.cvss?.score || "N/A",
          cveId: adv.cve_id,
          publishedAt: adv.published_at,
          url: adv.html_url,
          vulnerableRange: vulnInfo?.vulnerable_version_range || "Unknown",
          patchedVersion: vulnInfo?.first_patched_version?.identifier || "Not yet available",
        });
      }
    }
  } catch (error) {
    console.warn(`   ⚠️  Error fetching GHSA for ${packageName}:`, error.message);
  }

  return advisories;
}

/**
 * Format advisory for output
 */
function formatAdvisory(adv) {
  const severity = (adv.severity || "unknown").toUpperCase();
  
  return {
    ...adv,
    severity,
    formatted: `- **${adv.package}** (${severity}${adv.cveId ? ` - ${adv.cveId}` : ""})
  - GHSA: [${adv.id}](${adv.url})
  - CVSS: ${adv.cvssScore}
  - Vulnerable: ${adv.vulnerableRange}
  - Patched: ${adv.patchedVersion}
  - ${adv.summary}`,
  };
}

/**
 * Main monitoring function
 */
async function main() {
  console.log("🔍 Security Advisory Monitor");
  console.log("============================");
  console.log(`Severity threshold: ${SEVERITY_THRESHOLD} (RSC packages: medium+)`);
  console.log(`Force alert: ${FORCE_ALERT}`);
  console.log("");

  const state = loadState();
  const seenIds = new Set(state.seenAdvisories);
  const newAdvisories = [];

  // Fetch advisories for all monitored packages
  for (const packageName of MONITORED_PACKAGES) {
    const advisories = await fetchAdvisoriesForPackage(packageName);

    for (const advisory of advisories) {
      const id = advisory.id;

      // Skip if already seen (unless force alert)
      if (seenIds.has(id) && !FORCE_ALERT) {
        console.log(`   ⏭️  Already seen: ${id}`);
        continue;
      }

      // Check severity threshold
      if (!meetsSeverityThreshold(advisory.severity, packageName)) {
        console.log(`   ⏭️  Below threshold: ${id} (${advisory.severity})`);
        continue;
      }

      console.log(`   🚨 NEW: ${id} - ${packageName} (${advisory.severity})`);
      newAdvisories.push(formatAdvisory(advisory));
      seenIds.add(id);
    }
  }

  // Update state
  state.seenAdvisories = Array.from(seenIds);
  state.lastCheck = new Date().toISOString();
  saveState(state);

  // Output for GitHub Actions
  const hasNewAdvisories = newAdvisories.length > 0;
  const advisoryCount = newAdvisories.length;
  const advisorySummary = newAdvisories.map((a) => a.formatted).join("\n\n");

  // Set outputs for GitHub Actions
  if (process.env.GITHUB_OUTPUT) {
    const outputFile = process.env.GITHUB_OUTPUT;
    const appendOutput = (key, value) => {
      // Handle multiline values
      if (value.includes("\n")) {
        writeFileSync(outputFile, `${key}<<EOF\n${value}\nEOF\n`, { flag: "a" });
      } else {
        writeFileSync(outputFile, `${key}=${value}\n`, { flag: "a" });
      }
    };

    appendOutput("has_new_advisories", hasNewAdvisories.toString());
    appendOutput("advisory_count", advisoryCount.toString());
    appendOutput("advisory_summary", advisorySummary || "No new advisories");
  }

  // Console output
  console.log("\n" + "=".repeat(50));
  if (hasNewAdvisories) {
    console.log(`\n🚨 ${advisoryCount} NEW SECURITY ADVISOR${advisoryCount === 1 ? "Y" : "IES"} DETECTED!\n`);
    console.log(advisorySummary);
  } else {
    console.log("\n✅ No new security advisories detected.");
  }
  console.log(`\nLast check: ${state.lastCheck}`);

  return { hasNewAdvisories, advisoryCount, advisorySummary };
}

// Run
main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
