# Security Monitoring & Vulnerability Management

This document outlines the security practices and automated monitoring systems for dcyfr-labs.

## Overview

The project implements a multi-layered approach to security monitoring:

1. **GitHub Security Advisories** - GitHub's native vulnerability scanning
2. **npm audit** - Local dependency vulnerability checking
3. **Inngest Background Monitor** - Proactive upstream advisory monitoring
4. **Custom Version Checking** - Filters false positives by comparing installed versions

## Automated Monitoring Systems

### 1. npm audit (CI/CD)

**File:** `.github/workflows/security-audit.yml`

Runs `npm audit` to scan installed dependencies for known vulnerabilities.

**When it runs:**
- On push to `main`, `preview`, `develop` (when package files change)
- On pull requests (when package files change)
- Daily at 2 AM UTC (automated schedule)
- Manual trigger available

**Policy:**
- **CRITICAL**: Always fails the build ❌
- **HIGH**: Fails the build (unless allowlisted) ❌
- **MODERATE**: Warnings only (visible in logs) ⚠️
- **LOW**: Informational only ℹ️

**Local Usage:**
```bash
# Check for vulnerabilities
npm audit

# Check with specific severity
npm audit --audit-level=moderate

# Fix automatically (use with caution)
npm audit fix

# Fix only in production dependencies
npm audit fix --production
```

### 2. Security Advisory Monitor (Inngest)

**File:** `src/inngest/security-functions.ts`

Runs every hour to check GitHub's GHSA database for new advisories affecting our core packages.

**Monitored packages:**
- Core: `next`, `react`, `react-dom`
- RSC: `react-server-dom-webpack`, `react-server-dom-turbopack`, `react-server-dom-parcel`

**Severity thresholds:**
- Core packages: `high` and `critical` only
- RSC packages: `medium`, `high`, and `critical`

**Enhanced Filtering (NEW):**
The monitor now includes version checking to reduce false positives:
- Parses `package-lock.json` to get installed versions
- Compares advisory vulnerability ranges against installed versions
- Only alerts if the installed version is actually vulnerable
- Conservative fallback: if parsing fails, assumes potentially vulnerable

**Example:**
- Advisory: "next < 16.0.7 is vulnerable"
- Installed: next 16.0.7
- Result: ✅ No alert (version is patched)

### 3. GitHub Security Advisories

GitHub automatically detects known vulnerabilities through its dependency graph.

**Location:** Settings → Security & Analysis → Dependabot alerts

## Version Checking Logic

**File:** `src/lib/security-version-checker.ts`

The version checker implements semantic versioning comparison to evaluate if installed versions are affected by advisories.

### Key Functions

#### `parsePackageLock(path)`
Reads and parses `package-lock.json` to extract installed versions.

#### `checkAdvisoryImpact(packageName, vulnerableRange, patchedVersion, lockData)`
Determines if an advisory affects the installed version.

**Return object:**
```typescript
{
  isVulnerable: boolean;      // true if installed version is vulnerable
  installedVersion: string;   // installed version or null
  reason: string;             // explanation of the decision
}
```

**Logic:**
1. Find installed version from package-lock.json
2. Parse vulnerability range (e.g., `">= 16.0.0, < 16.0.7"`)
3. Compare installed version against range
4. If outside range, not vulnerable ✅
5. If inside range, check if patched version is available
6. If installed >= patched version, not vulnerable ✅
7. Otherwise, vulnerable ⚠️

### Supported Version Formats

**Vulnerability ranges:**
- `< 16.0.7` - Less than
- `<= 16.0.6` - Less than or equal
- `> 1.0.0` - Greater than
- `>= 1.0.0` - Greater than or equal
- `= 16.0.6` - Exact match
- `>= 16.0.0, < 16.0.7` - Compound range

**Version comparison:**
- Semantic versioning: `16.0.7`, `1.2.3`
- With prerelease: `16.0.7-rc.1` (prerelease tag stripped)
- With build metadata: `16.0.7+build.1` (metadata stripped)

## Handling False Positives

When an advisory is published but doesn't affect your installed versions:

### Why it happens:
- Advisory may apply to older versions you don't use
- Advisory may apply to prerelease versions only
- Advisory was for a specific code path you don't trigger

### What the system does:
- Version checker automatically filters these out
- Logs the reason: "Installed version X is outside vulnerable range Y"
- Only alerts on advisories affecting installed versions

### Manual investigation:
```bash
# Check npm audit output for details
npm audit

# See specific advisory details
npm audit --json | jq '.vulnerabilities'

# Check your installed versions
npm list <package-name>

# Check package-lock.json
grep -A 2 '"<package-name>"' package-lock.json
```

## Test Coverage

**File:** `src/__tests__/lib/security-version-checker.test.ts`

Comprehensive test suite covering:
- Version parsing and comparison
- Vulnerability range parsing
- Version vulnerability checking
- Real-world scenarios (CVE-2025-55182 false positive)
- Edge cases and error handling

Run tests:
```bash
npm run test src/__tests__/lib/security-version-checker.test.ts
```

## Alerts & Notifications

### Email Alerts (Inngest Monitor)
Triggered when advisories affecting installed versions are detected.

**Email includes:**
- GHSA ID and CVE (if available)
- CVSS score
- Vulnerability details
- Patched version
- Link to advisory
- Installed version information

### GitHub Issues
Automatically created when advisories are detected.

**Issue includes:**
- Advisory summary
- Affected packages
- Severity level
- Action items

### CI/CD Failures
Build fails on unpatched high/critical vulnerabilities (npm audit).

## Escalation Procedures

### Critical vulnerability found:
1. Receive email alert
2. Check installed version in `package-lock.json`
3. If vulnerable:
   - Create emergency patch PR
   - Run tests locally
   - Merge to main immediately
   - Deploy to production
4. If not vulnerable:
   - Close alert as false positive

### High severity vulnerability:
1. Review in next sprint planning
2. Schedule upgrade in next release
3. Monitor for workarounds

### Moderate/Low:
1. Track in backlog
2. Include in regular dependency updates

## Configuration

### Customizing thresholds:
Edit `.github/workflows/security-audit.yml`:
```yaml
- name: Run npm audit
  run: npm audit --audit-level=moderate  # Change 'moderate' to desired level
```

### Customizing monitored packages:
Edit `src/inngest/security-functions.ts`:
```typescript
const MONITORED_PACKAGES = [
  "next",
  "react",
  // Add more as needed
];
```

### Customizing severity thresholds:
Edit `src/inngest/security-functions.ts`:
```typescript
const SEVERITY_RANK: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};
```

## Best Practices

1. **Keep dependencies updated** - Regularly run `npm update` in safe batches
2. **Use lock files** - Always commit `package-lock.json`
3. **Review before upgrading** - Check changelogs for breaking changes
4. **Test thoroughly** - Run full test suite after major upgrades
5. **Monitor advisories** - Subscribe to alerts and investigate promptly
6. **Use audit allowlist** - For known-safe advisories that can't be fixed yet

## Troubleshooting

### False positive alerts
The version checker should filter these automatically. If not:
- Check `package-lock.json` for correct installed version
- Verify advisory vulnerability range parsing
- File an issue with advisory details

### npm audit showing vulnerabilities after npm ci
- Clear npm cache: `npm cache clean --force`
- Update lock file: `npm install`
- Check for transitive dependencies that are outdated

### Monitor not running
- Check Inngest dashboard: https://app.inngest.com
- Verify GITHUB_TOKEN is set with correct permissions
- Check for rate limiting (GitHub API)

## References

- **GitHub GHSA:** https://github.com/advisories
- **npm audit docs:** https://docs.npmjs.com/cli/v10/commands/npm-audit
- **Semantic Versioning:** https://semver.org
- **Inngest Docs:** https://docs.inngest.com

## Recent Changes

### December 8, 2025
- ✅ Added version checking to security monitor (reduce false positives)
- ✅ Created `security-version-checker.ts` utility
- ✅ Created comprehensive test suite
- ✅ Created `.github/workflows/security-audit.yml` for npm audit CI
- ✅ Issue #103: Closed (repository using patched versions)
- ✅ Issue #109: Implemented root cause fix (version checking)
