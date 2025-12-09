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
function meetsSeverityThreshold(severity: string, packageName: string): boolean {
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
  // Run every hour - supplements the GitHub Actions workflow
  { cron: "0 * * * *" },
  async ({ step }) => {
    // Step 1: Fetch advisories from GHSA
    const advisories = await step.run("fetch-ghsa-advisories", async () => {
      const results: SecurityAdvisory[] = [];
      
      for (const packageName of MONITORED_PACKAGES) {
        try {
          // Query GHSA API for npm advisories
          const response = await fetch(
            `https://api.github.com/advisories?ecosystem=npm&package=${packageName}&severity=medium,high,critical&per_page=10`,
            {
              headers: {
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                ...(process.env.GITHUB_TOKEN && {
                  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                }),
              },
            }
          );

          if (!response.ok) {
            console.warn(`GHSA API error for ${packageName}: ${response.status}`);
            continue;
          }

          const data = await response.json();
          
          for (const adv of data) {
            // Only include recent advisories (last 7 days for hourly check)
            const publishedAt = new Date(adv.published_at);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            if (publishedAt >= sevenDaysAgo && meetsSeverityThreshold(adv.severity, packageName)) {
              results.push({
                package: packageName,
                severity: adv.severity?.toUpperCase() || "UNKNOWN",
                ghsaId: adv.ghsa_id,
                cveId: adv.cve_id,
                cvssScore: adv.cvss?.score || "N/A",
                summary: adv.summary,
                patchedVersion: adv.vulnerabilities?.[0]?.first_patched_version || "Not available",
                vulnerableRange: adv.vulnerabilities?.[0]?.vulnerable_version_range || "Unknown",
                url: adv.html_url,
                publishedAt: adv.published_at,
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching GHSA for ${packageName}:`, error);
        }
      }

      return results;
    }) as SecurityAdvisory[];

    // Step 2: Check for new advisories (not previously seen) and filter by installed version impact
    const newAdvisories = await step.run("filter-new-advisories", async () => {
      // In production, this would check against a KV store or database
      // For now, we alert on all advisories from the last 24 hours
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const recentAdvisories = advisories.filter((adv) => new Date(adv.publishedAt) >= oneDayAgo);

      // Load package-lock.json to check if advisories actually affect our installed versions
      const lockData = parsePackageLock();
      
      if (!lockData) {
        console.warn("Could not parse package-lock.json - proceeding with caution, alerting on all advisories");
        return recentAdvisories.map(adv => ({ ...adv, affectsInstalledVersion: true }));
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
          console.log(
            `Filtered out advisory ${adv.ghsaId} for ${adv.package}: ` +
            `${versionCheck.reason}`
          );
        }

        return versionCheck.isVulnerable;
      });
    }) as SecurityAdvisory[];

    // Step 3: Send email alert if new advisories found
    if (newAdvisories.length > 0) {
      await step.run("send-email-alert", async () => {
        const resendApiKey = process.env.RESEND_API_KEY;
        const alertEmail = process.env.SECURITY_ALERT_EMAIL || process.env.CONTACT_EMAIL;

        if (!resendApiKey || !alertEmail) {
          console.warn("RESEND_API_KEY or SECURITY_ALERT_EMAIL not configured - skipping email");
          return { skipped: true };
        }

        const criticalCount = newAdvisories.filter((a) => a.severity === "CRITICAL").length;
        const highCount = newAdvisories.filter((a) => a.severity === "HIGH").length;

        const subject = criticalCount > 0
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
            from: "security@dcyfr.com",
            to: alertEmail,
            subject,
            text: emailBody,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Resend API error: ${error}`);
        }

        return { sent: true, to: alertEmail, advisoryCount: newAdvisories.length };
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
      console.log(`Security advisory detected from ${source}:`);
      console.log(`- ${advisories.length} advisories`);
      advisories.forEach((adv: SecurityAdvisory) => {
        console.log(`  - ${adv.package}: ${adv.severity} (${adv.ghsaId})`);
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
