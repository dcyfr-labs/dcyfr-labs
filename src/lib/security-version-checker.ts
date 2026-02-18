/**
 * Security Version Checker
 *
 * Utility to check if installed dependency versions are affected by security advisories.
 * Uses local package-lock.json parsing to avoid network calls and determine vulnerability.
 */

import fs from "fs";
import path from "path";

export interface PackageLockData {
  packages: Record<string, { version: string }>;
}

export interface VersionCheckResult {
  isVulnerable: boolean;
  installedVersion: string | null;
  reason: string;
}

/**
 * Parse the package-lock.json file and extract installed versions
 * @param lockfilePath - Path to package-lock.json (defaults to project root)
 * @returns Parsed package lock data with installed versions
 */
export function parsePackageLock(
  lockfilePath = "package-lock.json"
): PackageLockData | null {
  try {
    const resolvedPath = path.isAbsolute(lockfilePath)
      ? lockfilePath
      : path.join(process.cwd(), lockfilePath);

    const content = fs.readFileSync(resolvedPath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to parse package-lock.json:", error);
    return null;
  }
}

/**
 * Extract installed version for a specific package from lock data
 * @param lockData - Parsed package-lock.json data
 * @param packageName - Package name to look up
 * @returns The installed version string or null if not found
 */
export function getInstalledVersion(
  lockData: PackageLockData,
  packageName: string
): string | null {
  try {
    // Check root level packages first
    if (lockData.packages?.[packageName]) {
      return lockData.packages[packageName].version;
    }

    // Check node_modules nested packages
    if (lockData.packages?.[`node_modules/${packageName}`]) {
      return lockData.packages[`node_modules/${packageName}`].version;
    }

    return null;
  } catch (error) {
    console.error(`Error getting installed version for ${packageName}:`, error);
    return null;
  }
}

/**
 * Parse a semver version string into major.minor.patch components
 * @param version - Version string (e.g., "16.0.7", "1.2.3-rc.1")
 * @returns Object with major, minor, patch components or null if invalid
 */
export function parseVersion(
  version: string
): { major: number; minor: number; patch: number } | null {
  try {
    // Remove any prerelease or build metadata (e.g., "16.0.7-rc.1" -> "16.0.7")
    const cleanVersion = version.split("-")[0].split("+")[0];
    const parts = cleanVersion.split(".");

    if (parts.length < 2) return null;

    const major = parseInt(parts[0], 10);
    const minor = parseInt(parts[1], 10);
    const patch = parseInt(parts[2], 10) || 0;

    // Validate that we got valid numbers
    if (isNaN(major) || isNaN(minor)) return null;

    return { major, minor, patch };
  } catch {
    return null;
  }
}

/**
 * Compare two semantic versions
 * @returns -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parsed1 = parseVersion(v1);
  const parsed2 = parseVersion(v2);

  if (!parsed1 || !parsed2) return 0;

  if (parsed1.major !== parsed2.major) {
    return parsed1.major < parsed2.major ? -1 : 1;
  }
  if (parsed1.minor !== parsed2.minor) {
    return parsed1.minor < parsed2.minor ? -1 : 1;
  }
  if (parsed1.patch !== parsed2.patch) {
    return parsed1.patch < parsed2.patch ? -1 : 1;
  }

  return 0;
}

/**
 * Parse a single vulnerability condition into a range update.
 * Returns partial range for the given condition string.
 */
function parseRangeCondition(condition: string): Partial<VulnerabilityRange> {
  if (condition.startsWith("=")) {
    const version = condition.slice(1).trim();
    return { min: { version, inclusive: true }, max: { version, inclusive: true } };
  }
  if (condition.startsWith("<")) {
    const isInclusive = condition.startsWith("<=");
    const version = condition.slice(isInclusive ? 2 : 1).trim();
    return { max: { version, inclusive: isInclusive } };
  }
  if (condition.startsWith(">")) {
    const isInclusive = condition.startsWith(">=");
    const version = condition.slice(isInclusive ? 2 : 1).trim();
    return { min: { version, inclusive: isInclusive } };
  }
  return {};
}

/**
 * Parse vulnerability range from GHSA format
 * Examples: "< 16.0.7", ">= 16.0.0, < 16.0.7", "= 16.0.6"
 *
 * @param vulnerableRange - Range string from advisory
 * @returns Object describing the vulnerability range or null if unparseable
 */
export interface VulnerabilityRange {
  min?: { version: string; inclusive: boolean };
  max?: { version: string; inclusive: boolean };
}

export function parseVulnerabilityRange(
  vulnerableRange: string
): VulnerabilityRange | null {
  if (!vulnerableRange || typeof vulnerableRange !== "string") {
    return null;
  }

  const range: VulnerabilityRange = {};

  try {
    // Split by comma to handle multiple conditions
    const conditions = vulnerableRange.split(",").map((c) => c.trim());

    for (const condition of conditions) {
      Object.assign(range, parseRangeCondition(condition));
    }

    return Object.keys(range).length > 0 ? range : null;
  } catch {
    return null;
  }
}

/**
 * Check if an installed version falls within a vulnerability range
 * @param installedVersion - The version currently installed
 * @param vulnerableRange - The vulnerability range from advisory
 * @returns true if the installed version is vulnerable, false otherwise
 */
export function isVersionVulnerable(
  installedVersion: string,
  vulnerableRange: string | VulnerabilityRange
): boolean {
  // If range is empty/unknown, be conservative and mark as potentially vulnerable
  if (!vulnerableRange) {
    return true;
  }

  const range =
    typeof vulnerableRange === "string"
      ? parseVulnerabilityRange(vulnerableRange)
      : vulnerableRange;

  if (!range) {
    // If we can't parse the range, be conservative
    return true;
  }

  // Check minimum bound
  if (range.min) {
    const cmp = compareVersions(installedVersion, range.min.version);
    if (cmp < 0 || (cmp === 0 && !range.min.inclusive)) {
      return false; // Version is below minimum
    }
  }

  // Check maximum bound
  if (range.max) {
    const cmp = compareVersions(installedVersion, range.max.version);
    if (cmp > 0 || (cmp === 0 && !range.max.inclusive)) {
      return false; // Version is above maximum
    }
  }

  return true; // Version is within vulnerable range
}

/**
 * Check if an advisory affects our installed version
 * @param packageName - Package name from advisory
 * @param vulnerableRange - Vulnerability range from advisory
 * @param patchedVersion - First patched version from advisory
 * @param lockData - Parsed package-lock.json data
 * @returns Result object indicating vulnerability and reason
 */
export function checkAdvisoryImpact(
  packageName: string,
  vulnerableRange: string,
  patchedVersion: string,
  lockData: PackageLockData
): VersionCheckResult {
  const installedVersion = getInstalledVersion(lockData, packageName);

  // If we can't find the installed version, be conservative and alert
  if (!installedVersion) {
    return {
      isVulnerable: true,
      installedVersion: null,
      reason: "Could not determine installed version from package-lock.json",
    };
  }

  // If we can't parse the vulnerable range or patched version, be conservative
  if (!vulnerableRange && !patchedVersion) {
    return {
      isVulnerable: true,
      installedVersion,
      reason:
        "Advisory missing vulnerability range and patched version information",
    };
  }

  // Try using vulnerable range first
  if (vulnerableRange) {
    const vulnerable = isVersionVulnerable(installedVersion, vulnerableRange);
    if (!vulnerable) {
      return {
        isVulnerable: false,
        installedVersion,
        reason: `Installed version ${installedVersion} is outside vulnerable range: ${vulnerableRange}`,
      };
    }
  }

  // If vulnerable range says it's vulnerable, check if patched version is available
  if (patchedVersion && patchedVersion !== "Not available") {
    const isPatched = compareVersions(installedVersion, patchedVersion) >= 0;
    if (isPatched) {
      return {
        isVulnerable: false,
        installedVersion,
        reason: `Installed version ${installedVersion} is at or above patched version ${patchedVersion}`,
      };
    }
  }

  // If we got here and have a vulnerable range, the version is vulnerable
  if (vulnerableRange) {
    return {
      isVulnerable: true,
      installedVersion,
      reason: `Installed version ${installedVersion} is within vulnerable range: ${vulnerableRange}`,
    };
  }

  // Last resort: if we can't determine, be conservative
  return {
    isVulnerable: true,
    installedVersion,
    reason: "Could not fully evaluate advisory impact",
  };
}
