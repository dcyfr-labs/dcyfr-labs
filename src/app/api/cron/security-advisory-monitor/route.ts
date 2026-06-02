import { NextResponse } from 'next/server';
import { validateCronRequest } from '@/lib/cron-auth';
import {
  fetchGhsaAdvisories,
  MONITORED_PACKAGES,
  meetsSeverityThreshold,
  sleep,
  type SecurityAdvisory,
} from '@/inngest/security-functions';
import { parsePackageLock, checkAdvisoryImpact } from '@/lib/security-version-checker';
import { recordApiCall } from '@/lib/api';

/** Schedule: 3x daily (0:00, 8:00, 16:00 UTC) — migrated from Inngest securityAdvisoryMonitor */
export async function GET(request: Request) {
  if (!validateCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Step 1: Fetch advisories from GHSA
    console.warn(
      `[cron/security-advisory-monitor] Fetching advisories for ${MONITORED_PACKAGES.length} packages`
    );
    const advisories: SecurityAdvisory[] = [];

    for (const packageName of MONITORED_PACKAGES) {
      try {
        const data = await fetchGhsaAdvisories(packageName);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        for (const adv of data) {
          const publishedAt = new Date(adv.published_at);
          if (publishedAt >= sevenDaysAgo && meetsSeverityThreshold(adv.severity, packageName)) {
            advisories.push({
              package: packageName,
              severity: adv.severity?.toUpperCase() || 'UNKNOWN',
              ghsaId: adv.ghsa_id,
              cveId: adv.cve_id,
              cvssScore: adv.cvss?.score || 'N/A',
              summary: adv.summary,
              patchedVersion: adv.patched_version || 'N/A',
              vulnerableRange: adv.vulnerable_range || 'N/A',
              url: adv.url || '',
              publishedAt: adv.published_at,
            } as SecurityAdvisory);
          }
        }
      } catch (error) {
        console.error(
          `[cron/security-advisory-monitor] Error fetching GHSA for ${packageName}:`,
          error
        );
      }
      await sleep(250);
    }

    // Step 2: Filter for new advisories affecting installed versions
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const recentAdvisories = advisories.filter((adv) => new Date(adv.publishedAt) >= oneDayAgo);

    const lockData = parsePackageLock();
    const newAdvisories = lockData
      ? recentAdvisories.filter((adv) => {
          const check = checkAdvisoryImpact(
            adv.package,
            adv.vulnerableRange,
            adv.patchedVersion,
            lockData
          );
          adv.affectsInstalledVersion = check.isVulnerable;
          return check.isVulnerable;
        })
      : recentAdvisories.map((adv) => ({ ...adv, affectsInstalledVersion: true }));

    // Step 3: Send email alert if new advisories found
    if (newAdvisories.length > 0) {
      const resendApiKey = process.env.RESEND_API_KEY;
      const alertEmail = process.env.SECURITY_ALERT_EMAIL || process.env.CONTACT_EMAIL;

      if (resendApiKey && alertEmail) {
        const criticalCount = newAdvisories.filter((a) => a.severity === 'CRITICAL').length;
        const subject =
          criticalCount > 0
            ? `🚨 CRITICAL: ${newAdvisories.length} Security Advisories Detected`
            : `⚠️ Security Alert: ${newAdvisories.length} New Advisories`;

        const advisoryList = newAdvisories
          .map(
            (adv) =>
              `• ${adv.package} (${adv.severity}${adv.cveId ? ` - ${adv.cveId}` : ''})\n` +
              `  GHSA: ${adv.ghsaId}\n  CVSS: ${adv.cvssScore}\n  ${adv.summary}\n  ${adv.url}`
          )
          .join('\n\n');

        const emailBody =
          `Security Advisory Monitor - ${new Date().toISOString()}\n\n${newAdvisories.length} new security advisories detected:\n\n${advisoryList}`.trim();

        try {
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'security@dcyfr.ai',
              to: alertEmail,
              subject,
              text: emailBody,
            }),
          });

          if (emailResponse.ok) {
            // Record successful Resend send for free-tier headroom tracking.
            await recordApiCall('resend', 'security-advisory.alert');
          }
        } catch (emailError) {
          console.error('[cron/security-advisory-monitor] Email send failed:', emailError);
        }
      }
    }

    return NextResponse.json({
      checkedAt: new Date().toISOString(),
      totalAdvisories: advisories.length,
      newAdvisories: newAdvisories.length,
      packages: MONITORED_PACKAGES,
    });
  } catch (error) {
    console.error('[cron/security-advisory-monitor] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
