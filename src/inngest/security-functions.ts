import { inngest } from "./client";
import {
  parsePackageLock,
  checkAdvisoryImpact,
  type PackageLockData,
} from "@/lib/security-version-checker";

/**
 * Security Advisory event types
 */
export interface SecurityAdvisory {
  package: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  ghsaId: string;
  cveId?: string;
  cvssScore: number | string;
  summary: string;
  patchedVersion: string;
  vulnerableRange: string;
  url: string;
  publishedAt: string;
  affectsInstalledVersion?: boolean;
}

export interface SecurityAdvisoryDetectedEvent {
  name: "security/advisory.detected";
  data: {
    advisories: SecurityAdvisory[];
    detectedAt: string;
    source: "github-actions" | "inngest-scheduled" | "manual";
  };
}

// Packages to monitor - RSC packages get medium+ threshold
const MONITORED_PACKAGES = [
  "next",
  "react",
  "react-dom",
  "react-server-dom-webpack",
  "react-server-dom-turbopack",
  "react-server-dom-parcel",
];

const RSC_PACKAGES = new Set([
  "react-server-dom-webpack",
  "react-server-dom-turbopack",
  "react-server-dom-parcel",
]);

const SEVERITY_RANK: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Check if severity meets threshold for a package
 */
function meetsSeverityThreshold(
  severity: string,
  packageName: string
): boolean {
  const severityRank = SEVERITY_RANK[severity?.toLowerCase()] || 0;

  // RSC packages: alert on medium+
  if (RSC_PACKAGES.has(packageName)) {
    return severityRank >= SEVERITY_RANK.medium;
  }

  // Core packages: alert on high+
  return severityRank >= SEVERITY_RANK.high;
}

/**
 * Security Advisory Monitor - Background Job
 *
 * Runs hourly to check for new security advisories affecting
 * our core dependencies (React, Next.js, RSC packages).
 *
 * This provides a backup to the GitHub Actions workflow and
 * enables email notifications via Resend.
 *
 * @remarks
 * - Polls GHSA database for npm package advisories
 * - Stores seen advisory IDs to avoid duplicate alerts
 * - Sends email alerts for critical/high severity (medium+ for RSC)
 *
 * Created in response to CVE-2025-55182 which had a 13-hour detection gap.
 */
export const securityAdvisoryMonitor = inngest.createFunction(
  {
    id: "security-advisory-monitor",
    retries: 3,
  },
  // Run 3x daily (every 8 hours: 00:00, 08:00, 16:00 UTC) - supplements GitHub Actions workflow
  { cron: "0 0,8,16 * * *" },
  async ({ step }) => {
    // Step 1: Fetch advisories from GHSA
    const advisories = (await step.run("fetch-ghsa-advisories", async () => {
      console.warn(
        `[security-advisory-monitor] Starting GHSA fetch for ${MONITORED_PACKAGES.length} packages`
      );
      const results: SecurityAdvisory[] = [];

      for (const packageName of MONITORED_PACKAGES) {
        try {
          console.warn(
            `[security-advisory-monitor] Fetching advisories for: ${packageName}`
          );
          // Query GHSA API for npm advisories using a helper that implements
          // exponential backoff for transient (5xx/network) failures but
          // special-cases 422/4xx (don't aggressively retry which may be
          // treated as spam by the GHSA endpoint).
          const data = await fetchGhsaAdvisories(packageName);
          console.warn(
            `[security-advisory-monitor] Fetched ${data.length} total advisories for ${packageName}`
          );

          for (const adv of data) {
            // Only include recent advisories (last 7 days for hourly check)
            const publishedAt = new Date(adv.published_at);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            if (
              publishedAt >= sevenDaysAgo &&
              meetsSeverityThreshold(adv.severity, packageName)
            ) {
              results.push({
                package: packageName,
                severity: adv.severity?.toUpperCase() || "UNKNOWN",
                ghsaId: adv.ghsa_id,
                cveId: adv.cve_id,
                cvssScore: adv.cvss?.score || "N/A",
                summary: adv.summary,
                patchedVersion:
                  adv.vulnerabilities?.[0]?.first_patched_version ||
                  "Not available",
                vulnerableRange:
                  adv.vulnerabilities?.[0]?.vulnerable_version_range ||
                  "Unknown",
                url: adv.html_url,
                publishedAt: adv.published_at,
              });
              console.warn(
                `[security-advisory-monitor] Included advisory for ${packageName}: ${adv.ghsa_id} (${adv.severity})`
              );
            }
          }
        } catch (error) {
          console.error(
            `[security-advisory-monitor] Error fetching GHSA for ${packageName}:`,
            {
              error: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
            }
          );
        }

        // Small delay between package requests to avoid burst/spam triggers
        await sleep(250);
      }

      return results;
    })) as SecurityAdvisory[];

    // Step 2: Check for new advisories (not previously seen) and filter by installed version impact
    const newAdvisories = (await step.run("filter-new-advisories", async () => {
      // In production, this would check against a KV store or database
      // For now, we alert on all advisories from the last 24 hours
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const recentAdvisories = advisories.filter(
        (adv) => new Date(adv.publishedAt) >= oneDayAgo
      );

      // Load package-lock.json to check if advisories actually affect our installed versions
      const lockData = parsePackageLock();

      if (!lockData) {
        console.warn(
          "Could not parse package-lock.json - proceeding with caution, alerting on all advisories"
        );
        return recentAdvisories.map((adv) => ({
          ...adv,
          affectsInstalledVersion: true,
        }));
      }

      // Filter advisories to only those affecting our installed versions
      return recentAdvisories.filter((adv) => {
        const versionCheck = checkAdvisoryImpact(
          adv.package,
          adv.vulnerableRange,
          adv.patchedVersion,
          lockData
        );

        // Mark whether this advisory affects our installed version
        adv.affectsInstalledVersion = versionCheck.isVulnerable;

        if (!versionCheck.isVulnerable) {
          console.warn(
            `Filtered out advisory ${adv.ghsaId} for ${adv.package}: ` +
              `${versionCheck.reason}`
          );
        }

        return versionCheck.isVulnerable;
      });
    })) as SecurityAdvisory[];

    // Step 3: Send email alert if new advisories found
    if (newAdvisories.length > 0) {
      await step.run("send-email-alert", async () => {
        const resendApiKey = process.env.RESEND_API_KEY;
        const alertEmail =
          process.env.SECURITY_ALERT_EMAIL || process.env.CONTACT_EMAIL;

        if (!resendApiKey || !alertEmail) {
          console.warn(
            "RESEND_API_KEY or SECURITY_ALERT_EMAIL not configured - skipping email"
          );
          return { skipped: true };
        }

        const criticalCount = newAdvisories.filter(
          (a) => a.severity === "CRITICAL"
        ).length;
        const highCount = newAdvisories.filter(
          (a) => a.severity === "HIGH"
        ).length;

        const subject =
          criticalCount > 0
            ? `🚨 CRITICAL: ${newAdvisories.length} Security Advisories Detected`
            : `⚠️ Security Alert: ${newAdvisories.length} New Advisories`;

        const advisoryList = newAdvisories
          .map(
            (adv) =>
              `• ${adv.package} (${adv.severity}${adv.cveId ? ` - ${adv.cveId}` : ""})
  GHSA: ${adv.ghsaId}
  CVSS: ${adv.cvssScore}
  Vulnerable: ${adv.vulnerableRange}
  Patched: ${adv.patchedVersion}
  ${adv.summary}
  ${adv.url}`
          )
          .join("\n\n");

        const emailBody = `
Security Advisory Monitor - ${new Date().toISOString()}

${newAdvisories.length} new security advisor${newAdvisories.length === 1 ? "y" : "ies"} detected that AFFECT YOUR INSTALLED VERSIONS:
${criticalCount > 0 ? `\n🚨 ${criticalCount} CRITICAL` : ""}
${highCount > 0 ? `\n⚠️ ${highCount} HIGH` : ""}

${advisoryList}

---
Action Required:
1. Review the advisories above
2. Check if your current package versions are affected
3. Upgrade affected packages immediately
4. Deploy updated versions to production

Note: This alert was filtered to only include advisories that affect your currently installed dependency versions.
This alert was generated by the dcyfr-labs Security Advisory Monitor.
        `.trim();

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "security@dcyfr.ai",
            to: alertEmail,
            subject,
            text: emailBody,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Resend API error: ${error}`);
        }

        return {
          sent: true,
          to: alertEmail,
          advisoryCount: newAdvisories.length,
        };
      });

      // Step 4: Send event for downstream processing
      await step.sendEvent("emit-advisory-event", {
        name: "security/advisory.detected",
        data: {
          advisories: newAdvisories,
          detectedAt: new Date().toISOString(),
          source: "inngest-scheduled",
        },
      });
    }

    return {
      checkedAt: new Date().toISOString(),
      totalAdvisories: advisories.length,
      newAdvisories: newAdvisories.length,
      packages: MONITORED_PACKAGES,
    };
  }
);

// Helper: sleep for ms milliseconds
export function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Fetch GHSA advisories for a package with retry/backoff for transient errors.
 * - For 4xx (including 422) do not retry (these are treated as validation/spam responses)
 * - For 5xx and network errors retry with exponential backoff
 */
export async function fetchGhsaAdvisories(packageName: string) {
  // GitHub API requires multiple severity parameters, not comma-separated
  // Must be: severity=medium&severity=high&severity=critical
  const url = `https://api.github.com/advisories?ecosystem=npm&package=${packageName}&severity=medium&severity=high&severity=critical&per_page=10`;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      console.warn(
        `[fetchGhsaAdvisories] Attempting to fetch ${packageName} (attempt ${attempt + 1}/${maxRetries})`
      );
      const response = await fetch(url, { headers });

      if (response.ok) {
        const data = await response.json();
        console.warn(
          `[fetchGhsaAdvisories] Successfully fetched ${packageName}: ${Array.isArray(data) ? data.length : (data?.length ?? "?")} advisories`
        );
        return data;
      }

      // Read body for diagnostics
      const body = await response.text().catch(() => "<no-body>");
      const remaining =
        response.headers?.get?.("x-ratelimit-remaining") ?? "unknown";

      // Don't log raw response body to avoid PII scanner issues
      // Just log the status and rate limit info
      console.error(
        `[fetchGhsaAdvisories] GHSA API error for ${packageName}: ${response.status}`,
        {
          statusCode: response.status,
          remaining,
        }
      );

      // For client errors (including 422), don't retry - return empty result
      if (response.status >= 400 && response.status < 500) {
        console.warn(
          `[fetchGhsaAdvisories] Client error (${response.status}) for ${packageName} - not retrying, returning empty`
        );
        return [];
      }

      // Server errors: retry with backoff
      attempt++;
      const backoffMs = Math.min(100 * 2 ** attempt, 3000);
      console.warn(
        `[fetchGhsaAdvisories] Server error (${response.status}) for ${packageName} - retrying in ${backoffMs}ms`
      );
      await sleep(backoffMs);
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        // Re-throw the last error so caller can decide (Inngest step will catch)
        console.error(
          `Max retries reached for ${packageName} after ${attempt} attempts`,
          {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          }
        );
        throw error;
      }
      const backoffMs = Math.min(100 * 2 ** attempt, 3000);
      console.warn(
        `Network error fetching GHSA for ${packageName} (attempt ${attempt}/${maxRetries}), retrying in ${backoffMs}ms:`,
        {
          error: error instanceof Error ? error.message : String(error),
          type: error instanceof Error ? error.constructor.name : typeof error,
        }
      );
      await sleep(backoffMs);
    }
  }

  console.warn(
    `fetchGhsaAdvisories(${packageName}): Max retries exhausted, returning empty result`
  );
  return [];
}

/**
 * Security Advisory Handler - Event-Driven
 *
 * Processes security advisory detection events from any source
 * (GitHub Actions, scheduled job, manual trigger).
 *
 * This function can be extended to:
 * - Create GitHub issues
 * - Update dashboards
 * - Trigger automated remediation (Phase 2)
 */
export const securityAdvisoryHandler = inngest.createFunction(
  {
    id: "security-advisory-handler",
    retries: 2,
  },
  { event: "security/advisory.detected" },
  async ({ event, step }) => {
    const { advisories, source } = event.data;

    // Log the detection
    await step.run("log-detection", async () => {
      console.warn(`Security advisory detected from ${source}:`);
      console.warn(`- ${advisories.length} advisories`);
      advisories.forEach((adv: SecurityAdvisory) => {
        console.warn(`  - ${adv.package}: ${adv.severity} (${adv.ghsaId})`);
      });
    });

    // Future: Create GitHub issue, trigger auto-remediation, etc.
    // For now, the email alert is handled by the monitor function

    return {
      processed: true,
      advisoryCount: advisories.length,
      source,
    };
  }
);

/**
 * Daily Security Test Suite - Cron Job
 *
 * Runs automated security tests daily at 6:00 PM Mountain Time
 * to validate Sentry alerting and Axiom logging integration.
 *
 * Schedule: Daily at 6:00 PM MT (00:00 UTC next day during MST, 01:00 UTC during MDT)
 * Duration: December 12-20, 2025 (1 week validation period)
 *
 * Tests performed:
 * 1. Invalid API key attempts (triggers Sentry warning)
 * 2. Brute force simulation (15 attempts)
 * 3. Rate limit validation
 * 4. Successful access logging
 *
 * Expected outcomes:
 * - Sentry alerts triggered for brute force (>10 attempts)
 * - Axiom logs generated for all attempts
 * - Email notifications sent per alert configuration
 *
 * @remarks
 * This validates the security monitoring setup implemented in
 * December 2025 security audit. After validation period, this
 * can be disabled or reduced to weekly frequency.
 */
export const dailySecurityTest = inngest.createFunction(
  {
    id: "daily-security-test",
    retries: 1,
    cancelOn: [
      {
        // Auto-cancel after December 20, 2025
        event: "inngest/function.cancelled",
        if: "async.data.reason == 'schedule_ended'",
      },
    ],
  },
  // Run daily at 6:00 PM Mountain Time
  // MST (winter): 6 PM MST = 1 AM UTC next day (UTC-7)
  // MDT (summer): 6 PM MDT = 12 AM UTC next day (UTC-6)
  // Currently in MST, so 1 AM UTC
  { cron: "0 1 * * *" },
  async ({ step }) => {
    const now = new Date();
    const endDate = new Date("2025-12-20T23:59:59Z");

    // Auto-skip if past December 20, 2025
    if (now > endDate) {
      return {
        skipped: true,
        reason: "Validation period ended (Dec 20, 2025)",
        timestamp: now.toISOString(),
      };
    }

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    // Test 1: Invalid API key attempts
    const invalidKeyResults = await step.run(
      "test-invalid-api-keys",
      async () => {
        const results = [];

        for (let i = 1; i <= 3; i++) {
          try {
            const response = await fetch(`${baseUrl}/api/analytics`, {
              headers: {
                "x-internal-request": "true",
                Authorization: `Bearer inngest_test_invalid_${i}_${Date.now()}`,
              },
            });

            results.push({
              attempt: i,
              status: response.status,
              success: response.status === 401,
            });
          } catch (error) {
            results.push({
              attempt: i,
              error: error instanceof Error ? error.message : "Unknown error",
              success: false,
            });
          }
        }

        return results;
      }
    );

    // Test 2: Brute force simulation (15 attempts to trigger alert)
    const bruteForceResults = await step.run("test-brute-force", async () => {
      const results = [];

      for (let i = 1; i <= 15; i++) {
        try {
          const response = await fetch(`${baseUrl}/api/analytics`, {
            headers: {
              "x-internal-request": "true",
              Authorization: `Bearer brute_force_${i}_${Date.now()}`,
            },
          });

          results.push({
            attempt: i,
            status: response.status,
            success: response.status === 401,
          });

          // Small delay to avoid overwhelming the server
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          results.push({
            attempt: i,
            error: error instanceof Error ? error.message : "Unknown error",
            success: false,
          });
        }
      }

      return results;
    });

    // Test 3: Rate limit validation (rapid requests)
    const rateLimitResults = await step.run("test-rate-limits", async () => {
      const results = [];

      for (let i = 1; i <= 10; i++) {
        try {
          const response = await fetch(`${baseUrl}/api/analytics`, {
            headers: {
              "x-internal-request": "true",
              Authorization: `Bearer rate_test_${i}_${Date.now()}`,
            },
          });

          results.push({
            attempt: i,
            status: response.status,
            rateLimited: response.status === 429,
          });

          // No delay for rate limit testing
        } catch (error) {
          results.push({
            attempt: i,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return results;
    });

    // Test 4: Admin API Usage endpoint
    const adminApiResults = await step.run("test-admin-api", async () => {
      try {
        const response = await fetch(`${baseUrl}/api/admin/api-usage`, {
          headers: {
            "x-internal-request": "true",
            Authorization: `Bearer inngest_admin_test_${Date.now()}`,
          },
        });

        return {
          status: response.status,
          success: response.status === 401,
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        };
      }
    });

    // Calculate summary
    const summary = {
      timestamp: now.toISOString(),
      mountainTime: now.toLocaleString("en-US", { timeZone: "America/Denver" }),
      daysRemaining: Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      ),
      tests: {
        invalidKeys: {
          total: invalidKeyResults.length,
          successful: invalidKeyResults.filter((r) => r.success).length,
        },
        bruteForce: {
          total: bruteForceResults.length,
          successful: bruteForceResults.filter((r) => r.success).length,
          expectedSentryAlert:
            bruteForceResults.filter((r) => r.success).length >= 10,
        },
        rateLimits: {
          total: rateLimitResults.length,
          rateLimited: rateLimitResults.filter(
            (r) => "rateLimited" in r && r.rateLimited
          ).length,
        },
        adminApi: adminApiResults,
      },
      expectedOutcomes: {
        sentryEvents: invalidKeyResults.length + bruteForceResults.length + 1,
        sentryAlerts:
          bruteForceResults.filter((r) => r.success).length >= 10 ? 1 : 0,
        axiomLogs:
          invalidKeyResults.length +
          bruteForceResults.length +
          rateLimitResults.length +
          1,
      },
    };

    // Log summary for monitoring
    console.warn(
      "Daily Security Test Summary:",
      JSON.stringify(summary, null, 2)
    );

    return summary;
  }
);
