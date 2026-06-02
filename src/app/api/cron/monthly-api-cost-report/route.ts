import { NextResponse } from 'next/server';
import { validateCronRequest } from '@/lib/cron-auth';
import * as Sentry from '@sentry/nextjs';
import { Resend } from 'resend';
import {
  calculateMonthlyCost,
  generateCostRecommendations,
  predictLimitDate,
  formatServiceHeadroom,
  hasRecordedUsage,
  PRICING,
} from '@/lib/api/api-cost-calculator';

/** Schedule: 1st of each month at 10:00 AM UTC — migrated from Inngest monthlyApiCostReport */
export async function GET(request: Request) {
  if (!validateCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ALERT_EMAIL = process.env.ADMIN_EMAIL || 'hello@dcyfr.ai';

  try {
    const now = new Date();
    const prevMonth = new Date(now);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const previousMonth = prevMonth.toISOString().slice(0, 7); // YYYY-MM

    const monthlyCost = await calculateMonthlyCost(previousMonth);
    const recommendations = await generateCostRecommendations(previousMonth);

    const services = Object.keys(PRICING) as Array<keyof typeof PRICING>;
    const predictions: Array<{
      service: string;
      prediction: Awaited<ReturnType<typeof predictLimitDate>>;
    }> = [];

    for (const service of services) {
      try {
        const prediction = await predictLimitDate(service, 'default', 7);
        if (prediction.daysUntilLimit !== null) {
          predictions.push({ service, prediction });
        }
      } catch (error) {
        console.warn(`[cron/monthly-api-cost-report] Failed to predict for ${service}:`, error);
      }
    }

    const usageRecorded = hasRecordedUsage(monthlyCost);

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      // These reports monitor FREE-TIER HEADROOM (how close each piece of
      // free infra is to its no-cost limit), not paid spend — every service
      // tracked here is intentionally on a free tier. Real paid-LLM spend is
      // reported separately, out of band.
      const headroomTable = `
<h3>Free-Tier Headroom</h3>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
  <thead>
    <tr><th>Service</th><th>Requests</th><th>Free-tier limit</th><th>% of limit</th><th>Tier</th></tr>
  </thead>
  <tbody>
${monthlyCost.services
  .map(({ service, usage, cost }) => {
    const hr = formatServiceHeadroom(service as keyof typeof PRICING, usage);
    const pct = hr.percentOfLimit === null ? '—' : `${hr.percentOfLimit.toFixed(1)}%`;
    return `
    <tr>
      <td>${hr.name}</td>
      <td>${hr.requests.toLocaleString()}</td>
      <td>${hr.limitLabel}</td>
      <td>${pct}</td>
      <td>${cost.tier}</td>
    </tr>`;
  })
  .join('')}
  </tbody>
</table>`;

      const emptyState = `
<p><strong>No API usage was recorded this period.</strong></p>
<p>Usage tracking begins once <code>recordApiCall</code> is wired into call sites
(emails, GitHub fetches). If you expected activity in ${previousMonth}, confirm the
instrumented paths ran and that Redis (Upstash) was reachable.</p>`;

      const emailBody = `
<h2>Monthly API Cost Report - ${previousMonth}</h2>
<p><em>Free-tier headroom monitor — all tracked services run on free tiers;
this report tracks how close each is to its no-cost limit. Paid spend is
reported separately.</em></p>
<h3>Summary</h3>
<ul>
  <li><strong>Total estimated cost:</strong> $${monthlyCost.totalCost.toFixed(2)} (free tier)</li>
  <li><strong>Services with recorded usage:</strong> ${monthlyCost.services.length}</li>
</ul>
${usageRecorded ? headroomTable : emptyState}
<h3>Predictions for Current Month</h3>
${
  predictions.length > 0
    ? `<ul>${predictions
        .map(
          ({ service, prediction }) =>
            `<li><strong>${PRICING[service as keyof typeof PRICING].name}:</strong> ${prediction.daysUntilLimit !== null ? `${prediction.daysUntilLimit} days until free-tier limit (${prediction.confidence} confidence)` : 'No limit predicted'}</li>`
        )
        .join('\n')}</ul>`
    : '<p><em>No predictions available</em></p>'
}
<h3>Recommendations</h3>
<ul>${recommendations.map((rec) => `<li>${rec}</li>`).join('\n')}</ul>
<p><em>Sent by dcyfr-labs Monthly Cost Reporter</em></p>
      `.trim();

      try {
        await resend.emails.send({
          from: 'DCYFR Labs <noreply@dcyfr.ai>',
          to: ALERT_EMAIL,
          subject: `Monthly API Cost Report - ${previousMonth}`,
          html: emailBody,
        });
        console.warn(`[cron/monthly-api-cost-report] Sent report email to ${ALERT_EMAIL}`);
      } catch (error) {
        console.error('[cron/monthly-api-cost-report] Failed to send email:', error);
      }
    }

    Sentry.captureMessage(`Monthly API Cost Report: ${previousMonth}`, {
      level: 'info',
      tags: { component: 'api-cost-monitoring', month: previousMonth },
      extra: { monthlyCost, recommendations, predictions: predictions.length, usageRecorded },
    });

    return NextResponse.json({
      success: true,
      month: previousMonth,
      totalCost: monthlyCost.totalCost,
      budget: monthlyCost.totalBudget,
      percentUsed: monthlyCost.percentUsed,
      usageRecorded,
      servicesReported: monthlyCost.services.length,
      predictions: predictions.length,
    });
  } catch (error) {
    console.error('[cron/monthly-api-cost-report] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
