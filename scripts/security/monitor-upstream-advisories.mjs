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
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");

// Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const FORCE_ALERT = process.env.FORCE_ALERT === "true";
const SEVERITY_THRESHOLD = process.env.SEVERITY_THRESHOLD || "high";
const DEBUG = process.env.DEBUG === "true";

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
 * Get installed package versions from package-lock.json
 * Returns a map of package name -> installed version
 */
function getInstalledPackages() {
  const installedVersions = new Map();
  
  try {
    const lockfilePath = join(PROJECT_ROOT, "package-lock.json");
    if (!existsSync(lockfilePath)) {
      console.warn("⚠️  No package-lock.json found, cannot verify installed versions");
      return installedVersions;
    }
    
    const lockfile = JSON.parse(readFileSync(lockfilePath, "utf-8"));
    
    // Check lockfile version 3 format (packages)
    if (lockfile.packages) {
      for (const [path, pkg] of Object.entries(lockfile.packages)) {
        // Direct dependencies are in packages[""] or packages["node_modules/pkg"]
        if (path === "" && pkg.dependencies) {
          // Root package.json dependencies
          continue;
        }
        
        // Extract package name from path like "node_modules/next" or "node_modules/@scope/pkg"
        const match = path.match(/^node_modules\/(.+)$/);
        if (match && pkg.version) {
          const pkgName = match[1];
          // Only track top-level (direct or hoisted) packages
          if (!pkgName.includes("node_modules/")) {
            installedVersions.set(pkgName, pkg.version);
          }
        }
      }
    }
    
    // Fallback to lockfile version 2 format (dependencies)
    if (installedVersions.size === 0 && lockfile.dependencies) {
      for (const [name, info] of Object.entries(lockfile.dependencies)) {
        if (info.version) {
          installedVersions.set(name, info.version);
        }
      }
    }
  } catch (error) {
    console.warn("⚠️  Error reading package-lock.json:", error.message);
  }
  
  return installedVersions;
}

/**
 * Get production dependencies from package.json
 * Returns a set of package names that are direct dependencies
 */
function getProductionDependencies() {
  const productionDeps = new Set();
  
  try {
    const packageJsonPath = join(PROJECT_ROOT, "package.json");
    if (!existsSync(packageJsonPath)) {
      console.warn("⚠️  No package.json found, cannot verify production dependencies");
      return productionDeps;
    }
    
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    
    // Add dependencies (production)
    if (packageJson.dependencies) {
      for (const name of Object.keys(packageJson.dependencies)) {
        productionDeps.add(name);
      }
    }
    
    // Add devDependencies only if they're in our MONITORED_PACKAGES list
    // (some dev tools like @next/bundle-analyzer might have security relevance)
    if (packageJson.devDependencies) {
      for (const name of Object.keys(packageJson.devDependencies)) {
        if (MONITORED_PACKAGES.includes(name)) {
          productionDeps.add(name);
        }
      }
    }
  } catch (error) {
    console.warn("⚠️  Error reading package.json:", error.message);
  }
  
  return productionDeps;
}

/**
 * Parse a semver version string into components
 * @param {string} version - Version string like "16.0.10" or "19.2.1"
 * @returns {{ major: number, minor: number, patch: number, prerelease: string[] } | null}
 */
function parseVersion(version) {
  if (!version) return null;
  
  // Clean the version string
  const cleaned = version.replace(/^[v=]/, "").trim();
  
  // Match semver pattern: major.minor.patch with optional prerelease
  const match = cleaned.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) return null;
  
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] ? match[4].split(".") : [],
  };
}

/**
 * Compare two versions: returns -1 if a < b, 0 if equal, 1 if a > b
 */
function compareVersions(a, b) {
  const vA = parseVersion(a);
  const vB = parseVersion(b);
  
  if (!vA || !vB) return 0;
  
  // Compare major.minor.patch
  if (vA.major !== vB.major) return vA.major < vB.major ? -1 : 1;
  if (vA.minor !== vB.minor) return vA.minor < vB.minor ? -1 : 1;
  if (vA.patch !== vB.patch) return vA.patch < vB.patch ? -1 : 1;
  
  // Prerelease versions are less than release versions
  if (vA.prerelease.length && !vB.prerelease.length) return -1;
  if (!vA.prerelease.length && vB.prerelease.length) return 1;
  
  return 0;
}

/**
 * Check if a version is within a vulnerable range
 * Handles ranges like:
 * - ">= 13.3.0, < 14.2.34"
 * - "< 19.0.2"
 * - ">= 19.0.0, < 19.0.2"
 * 
 * @param {string} installedVersion - The installed version (e.g., "16.0.10")
 * @param {string} vulnerableRange - The vulnerable range (e.g., ">= 13.3.0, < 14.2.34")
 * @returns {boolean} - True if the installed version is vulnerable
 */
function isVersionVulnerable(installedVersion, vulnerableRange) {
  if (!installedVersion || !vulnerableRange || vulnerableRange === "Unknown") {
    // Can't determine - assume vulnerable to be safe
    return true;
  }
  
  const installed = parseVersion(installedVersion);
  if (!installed) return true;
  
  // Parse the vulnerability range - split by comma for compound ranges
  const conditions = vulnerableRange.split(",").map(c => c.trim());
  
  for (const condition of conditions) {
    // Parse operator and version from conditions like ">= 13.3.0" or "< 14.2.34"
    const match = condition.match(/^([<>=!]+)\s*(.+)$/);
    if (!match) continue;
    
    const [, operator, targetVersion] = match;
    const comparison = compareVersions(installedVersion, targetVersion);
    
    // Check if condition is NOT satisfied (meaning version is NOT vulnerable)
    switch (operator) {
      case "<":
        if (comparison >= 0) return false; // installed >= target, so not < target
        break;
      case "<=":
        if (comparison > 0) return false; // installed > target, so not <= target
        break;
      case ">":
        if (comparison <= 0) return false; // installed <= target, so not > target
        break;
      case ">=":
        if (comparison < 0) return false; // installed < target, so not >= target
        break;
      case "=":
      case "==":
        if (comparison !== 0) return false;
        break;
    }
  }
  
  // All conditions satisfied - version is vulnerable
  return true;
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
 * IMPORTANT: Validates that advisories actually affect the requested package
 * Uses multiple validation strategies to prevent false positives
 */
async function fetchAdvisoriesForPackage(packageName) {
  const advisories = [];
  const skippedAdvisories = [];
  
  try {
    console.log(`   Checking GHSA for ${packageName}...`);
    
    // Use the global advisories API with explicit package filter
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
      return { advisories: [], skipped: [] };
    }

    const data = await response.json();
    console.log(`   Found ${data.length} total results for ${packageName}`);
    
    for (const adv of data) {
      // CRITICAL: Validate that the advisory actually affects this package
      // The GitHub API sometimes returns unrelated advisories, so we validate multiple ways:
      
      // Strategy 1: Check vulnerabilities array (most reliable)
      let foundInVulnerabilities = false;
      let vulnerabilityInfo = null;
      
      if (Array.isArray(adv.vulnerabilities)) {
        const vulnInfo = adv.vulnerabilities.find(v => 
          v.package?.name === packageName
        );
        if (vulnInfo) {
          foundInVulnerabilities = true;
          vulnerabilityInfo = vulnInfo;
        }
      }
      
      // Strategy 2: Check affected_packages array (fallback)
      let foundInAffectedPackages = false;
      if (!foundInVulnerabilities && Array.isArray(adv.affected_packages)) {
        const affectedInfo = adv.affected_packages.find(pkg => 
          pkg.package?.name === packageName
        );
        if (affectedInfo) {
          foundInAffectedPackages = true;
          vulnerabilityInfo = affectedInfo;
        }
      }
      
      // Strategy 3: Cross-check with package_slug if present
      let packageSlugMatches = true;
      if (adv.package_slug) {
        // GitHub sometimes uses different package naming
        // Only filter out if package_slug clearly doesn't match
        const slugParts = adv.package_slug.split('/');
        const actualPackage = slugParts[slugParts.length - 1] || '';
        packageSlugMatches = actualPackage === packageName || 
                            actualPackage.includes(packageName);
      }
      
      // If not found in vulnerabilities/affected_packages, skip
      if (!foundInVulnerabilities && !foundInAffectedPackages) {
        // Advisory does not affect the requested package - skip it
        const affectedPackage = adv.vulnerabilities?.[0]?.package?.name || 
                                adv.affected_packages?.[0]?.package?.name || 
                                adv.package_slug || 
                                "unknown";
        skippedAdvisories.push({
          id: adv.ghsa_id,
          cveId: adv.cve_id,
          actualPackage: affectedPackage,
          queriedPackage: packageName,
          reason: 'not_in_vulnerabilities_or_affected_packages'
        });
        if (DEBUG) {
          console.log(`   ⏭️  ${adv.ghsa_id} (${adv.cve_id}) - not attributed to ${packageName}`);
        }
        continue;
      }
      
      // Additional package name validation
      if (!packageSlugMatches && !foundInVulnerabilities) {
        skippedAdvisories.push({
          id: adv.ghsa_id,
          cveId: adv.cve_id,
          actualPackage: adv.package_slug || 'unknown',
          queriedPackage: packageName,
          reason: 'package_slug_mismatch'
        });
        if (DEBUG) {
          console.log(`   ⏭️  ${adv.ghsa_id} - package_slug mismatch: ${adv.package_slug}`);
        }
        continue;
      }
      
      // Only include recent advisories (last 30 days)
      const publishedAt = new Date(adv.published_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (publishedAt >= thirtyDaysAgo) {
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
          vulnerableRange: vulnerabilityInfo?.vulnerable_version_range || "Unknown",
          patchedVersion: vulnerabilityInfo?.first_patched_version?.identifier || "Not yet available",
        });
      }
    }
  } catch (error) {
    console.warn(`   ⚠️  Error fetching GHSA for ${packageName}:`, error.message);
  }

  return { advisories, skipped: skippedAdvisories };
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

  // Get installed package versions for validation
  const installedPackages = getInstalledPackages();
  const productionDependencies = getProductionDependencies();
  
  console.log("📦 Installed monitored packages:");
  for (const pkg of MONITORED_PACKAGES) {
    const version = installedPackages.get(pkg);
    const isProduction = productionDependencies.has(pkg);
    if (version) {
      if (isProduction) {
        console.log(`   - ${pkg}@${version} ✅ (production dependency)`);
      } else {
        console.log(`   - ${pkg}@${version} ⚠️  (transitive only - will skip)`);
      }
    } else {
      console.log(`   - ${pkg}: not installed (will skip)`);
    }
  }
  console.log("");

  const state = loadState();
  const seenIds = new Set(state.seenAdvisories);
  const newAdvisories = [];

  // Fetch advisories for all monitored packages
  const allSkipped = [];
  
  for (const packageName of MONITORED_PACKAGES) {
    // Skip packages that aren't installed or aren't production dependencies
    const installedVersion = installedPackages.get(packageName);
    const isProductionDep = productionDependencies.has(packageName);
    
    if (!installedVersion) {
      console.log(`   ⏭️  Skipping ${packageName}: not installed in project`);
      continue;
    }
    
    if (!isProductionDep) {
      console.log(`   ⏭️  Skipping ${packageName}: transitive dependency only (not in package.json)`);
      continue;
    }
    
    const { advisories, skipped } = await fetchAdvisoriesForPackage(packageName);
    allSkipped.push(...skipped);

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
      
      // Check if installed version is actually vulnerable
      const vulnerable = isVersionVulnerable(installedVersion, advisory.vulnerableRange);
      if (!vulnerable) {
        console.log(`   ✅ Not vulnerable: ${id} - ${packageName}@${installedVersion} not in range "${advisory.vulnerableRange}"`);
        allSkipped.push({
          id: advisory.id,
          cveId: advisory.cveId,
          actualPackage: packageName,
          queriedPackage: packageName,
          reason: `version_not_vulnerable: ${installedVersion} not in ${advisory.vulnerableRange}`
        });
        continue;
      }

      console.log(`   🚨 NEW: ${id} - ${packageName}@${installedVersion} (${advisory.severity}) - vulnerable to ${advisory.vulnerableRange}`);
      newAdvisories.push(formatAdvisory(advisory));
      seenIds.add(id);
    }
  }

  // Log diagnostic info about skipped advisories (misattributions prevented)
  if (allSkipped.length > 0) {
    console.log(`\n✅ Filtered out ${allSkipped.length} misattributed advisories:`);
    for (const skipped of allSkipped) {
      console.log(`   - ${skipped.id} (${skipped.cveId}): affects ${skipped.actualPackage}, not ${skipped.queriedPackage}`);
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
