import { NextResponse } from 'next/server';
import { validateCronRequest } from '@/lib/cron-auth';
import * as Sentry from '@sentry/nextjs';
import { Resend } from 'resend';
import {
  calculateMonthlyCost,
  generateCostRecommendations,
  formatServiceHeadroom,
  hasRecordedUsage,
  PRICING,
} from '@/lib/api/api-cost-calculator';
import { getUsageSummary } from '@/lib/api/api-usage-tracker';

/**
 * Schedule: Daily at 9:00 AM UTC — migrated from Inngest monitorApiCosts.
 *
 * This monitor is a FREE-TIER HEADROOM watchdog: every service it tracks runs
 * on a free tier, so the meaningful signal is "how close are we to a no-cost
 * limit", not paid dollars. Alerts fire on percent-of-free-tier-limit, not on
 * a budget (which is intentionally $0). Real paid-LLM spend is reported
 * separately, out of band.
 */
export async function GET(request: Request) {
  if (!validateCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ALERT_THRESHOLDS = { warning: 0.7, critical: 0.9 } as const;
  const ALERT_EMAIL = process.env.ADMIN_EMAIL || 'hello@dcyfr.ai';

  try {
    const monthlyCost = await calculateMonthlyCost();
    const summary = await getUsageSummary();
    const recommendations = await generateCostRecommendations();
    const usageRecorded = hasRecordedUsage(monthlyCost);

    const alerts: Array<{ level: 'warning' | 'critical'; message: string; service?: string }> = [];

    // Per-service free-tier headroom alerts. Services on unlimited free tiers
    // (percentOfLimit === null) are skipped — there is no ceiling to approach.
    for (const { service, usage } of monthlyCost.services) {
      const hr = formatServiceHeadroom(service as keyof typeof PRICING, usage);
      if (hr.percentOfLimit === null) continue;

      const pct = hr.percentOfLimit;
      if (pct >= ALERT_THRESHOLDS.critical * 100) {
        alerts.push({
          level: 'critical',
          service,
          message: `${hr.name}: ${hr.requests.toLocaleString()}/${hr.limitLabel} free-tier requests (${pct.toFixed(1)}%)`,
        });
      } else if (pct >= ALERT_THRESHOLDS.warning * 100) {
        alerts.push({
          level: 'warning',
          service,
          message: `${hr.name}: ${hr.requests.toLocaleString()}/${hr.limitLabel} free-tier requests (${pct.toFixed(1)}%)`,
        });
      }
    }

    if (alerts.length > 0) {
      for (const alert of alerts) {
        Sentry.captureMessage(`API Free-Tier Headroom Alert: ${alert.message}`, {
          level: alert.level === 'critical' ? 'error' : 'warning',
          tags: {
            component: 'api-cost-monitoring',
            service: alert.service || 'all',
            alert_type: alert.level,
          },
          extra: { monthlyCost, summary, recommendations, usageRecorded },
        });
      }
      console.warn(`[cron/monitor-api-costs] Sent ${alerts.length} alert(s) to Sentry`);
    }

    const criticalAlerts = alerts.filter((a) => a.level === 'critical');
    if (criticalAlerts.length > 0 && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const emailBody = `
<h2>Critical Free-Tier Headroom Alert</h2>
<p><em>One or more free-tier services are within ${(ALERT_THRESHOLDS.critical * 100).toFixed(0)}% of
their no-cost limit. These services run on free tiers (no paid spend); this is a
headroom warning, not a billing alert.</em></p>
<p><strong>${criticalAlerts.length} critical alert(s) detected:</strong></p>
<ul>${criticalAlerts.map((alert) => `<li>${alert.message}</li>`).join('\n')}</ul>
<h3>Current Status</h3>
<ul>
  <li><strong>Total estimated cost:</strong> $${monthlyCost.totalCost.toFixed(2)} (free tier)</li>
  <li><strong>Services with recorded usage:</strong> ${monthlyCost.services.length}</li>
</ul>
<h3>Recommendations</h3>
<ul>${recommendations.map((rec) => `<li>${rec}</li>`).join('\n')}</ul>
<p><em>Sent by dcyfr-labs API Free-Tier Monitor</em></p>
      `.trim();

      try {
        await resend.emails.send({
          from: 'DCYFR Labs <noreply@dcyfr.ai>',
          to: ALERT_EMAIL,
          subject: `Critical Free-Tier Headroom Alert - ${criticalAlerts.length} Alert(s)`,
          html: emailBody,
        });
        console.warn(`[cron/monitor-api-costs] Sent critical alert email to ${ALERT_EMAIL}`);
      } catch (error) {
        console.error('[cron/monitor-api-costs] Failed to send email:', error);
      }
    }

    return NextResponse.json({
      success: true,
      monthlyCost: {
        total: monthlyCost.totalCost,
        budget: monthlyCost.totalBudget,
        percentUsed: monthlyCost.percentUsed,
      },
      usageRecorded,
      alerts: {
        total: alerts.length,
        critical: criticalAlerts.length,
        warning: alerts.filter((a) => a.level === 'warning').length,
      },
      recommendations: recommendations.length,
    });
  } catch (error) {
    console.error('[cron/monitor-api-costs] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
