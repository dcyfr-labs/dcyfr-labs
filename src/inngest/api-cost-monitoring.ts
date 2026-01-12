/**
 * API Cost Monitoring Inngest Functions
 *
 * Automated background jobs for monitoring API costs and sending alerts.
 *
 * Functions:
 * - monitorApiCosts: Daily check at 9am UTC
 * - monthlyApiCostReport: Monthly report on 1st at 10am UTC
 */

import { inngest } from './client';
import { NonRetriableError } from 'inngest';
import * as Sentry from '@sentry/nextjs';
import { Resend } from 'resend';
import {
  calculateMonthlyCost,
  generateCostRecommendations,
  predictLimitDate,
  PRICING,
  BUDGET,
} from '@/lib/api-cost-calculator';
import { getUsageSummary, getAllUsageStats } from '@/lib/api-usage-tracker';

// ============================================================================
// CONFIGURATION
// ============================================================================

const ALERT_THRESHOLDS = {
  warning: 0.7, // 70%
  critical: 0.9, // 90%
} as const;

const ALERT_EMAIL = process.env.ADMIN_EMAIL || 'hello@dcyfr.ai';

// ============================================================================
// DAILY COST MONITORING
// ============================================================================

/**
 * Monitor API costs daily and send alerts if thresholds exceeded
 *
 * Schedule: Daily at 9:00 AM UTC
 */
export const monitorApiCosts = inngest.createFunction(
  {
    id: 'monitor-api-costs',
    name: 'Monitor API Costs',
    retries: 3,
  },
  { cron: '0 9 * * *' }, // Daily at 9am UTC
  async ({ step }) => {
    // Get current month's cost data
    const monthlyCost = await step.run('calculate-monthly-cost', async () => {
      return await calculateMonthlyCost();
    });

    // Get usage summary
    const summary = await step.run('get-usage-summary', async () => {
      return await getUsageSummary();
    });

    // Generate recommendations
    const recommendations = await step.run('generate-recommendations', async () => {
      return await generateCostRecommendations();
    });

    // Check alert thresholds
    const alerts = await step.run('check-alert-thresholds', async () => {
      const alerts: Array<{
        level: 'warning' | 'critical';
        message: string;
        service?: string;
      }> = [];

      // Check overall budget
      if (monthlyCost.percentUsed >= ALERT_THRESHOLDS.critical * 100) {
        alerts.push({
          level: 'critical',
          message: `Total API cost at ${monthlyCost.percentUsed.toFixed(1)}% of budget ($${monthlyCost.totalCost.toFixed(2)}/$${monthlyCost.totalBudget})`,
        });
      } else if (monthlyCost.percentUsed >= ALERT_THRESHOLDS.warning * 100) {
        alerts.push({
          level: 'warning',
          message: `Total API cost at ${monthlyCost.percentUsed.toFixed(1)}% of budget ($${monthlyCost.totalCost.toFixed(2)}/$${monthlyCost.totalBudget})`,
        });
      }

      // Check individual services
      for (const { service, cost } of monthlyCost.services) {
        const serviceBudget = BUDGET[service as keyof typeof BUDGET];
        const percentUsed = serviceBudget > 0
          ? (cost.estimatedCost / serviceBudget) * 100
          : 0;

        if (percentUsed >= ALERT_THRESHOLDS.critical * 100) {
          alerts.push({
            level: 'critical',
            service,
            message: `${PRICING[service as keyof typeof PRICING].name}: $${cost.estimatedCost.toFixed(2)}/$${serviceBudget} (${percentUsed.toFixed(1)}%)`,
          });
        } else if (percentUsed >= ALERT_THRESHOLDS.warning * 100) {
          alerts.push({
            level: 'warning',
            service,
            message: `${PRICING[service as keyof typeof PRICING].name}: $${cost.estimatedCost.toFixed(2)}/$${serviceBudget} (${percentUsed.toFixed(1)}%)`,
          });
        }
      }

      return alerts;
    });

    // Send alerts to Sentry
    if (alerts.length > 0) {
      await step.run('send-sentry-alerts', async () => {
        for (const alert of alerts) {
          Sentry.captureMessage(`API Cost Alert: ${alert.message}`, {
            level: alert.level === 'critical' ? 'error' : 'warning',
            tags: {
              component: 'api-cost-monitoring',
              service: alert.service || 'all',
              alert_type: alert.level,
            },
            extra: {
              monthlyCost,
              summary,
              recommendations,
            },
          });
        }

        console.warn(`[API Cost Monitor] Sent ${alerts.length} alert(s) to Sentry`);
      });
    }

    // Send email if critical alerts
    const criticalAlerts = alerts.filter(a => a.level === 'critical');
    if (criticalAlerts.length > 0 && process.env.RESEND_API_KEY) {
      await step.run('send-email-alert', async () => {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const emailBody = `
<h2>🚨 Critical API Cost Alert</h2>

<p><strong>${criticalAlerts.length} critical alert(s) detected:</strong></p>

<ul>
${criticalAlerts.map(alert => `<li>${alert.message}</li>`).join('\n')}
</ul>

<h3>Current Status</h3>
<ul>
  <li><strong>Total Cost:</strong> $${monthlyCost.totalCost.toFixed(2)} / $${monthlyCost.totalBudget}</li>
  <li><strong>Budget Used:</strong> ${monthlyCost.percentUsed.toFixed(1)}%</li>
  <li><strong>Services Near Limit:</strong> ${summary.servicesNearLimit.length}</li>
  <li><strong>Services At Limit:</strong> ${summary.servicesAtLimit.length}</li>
</ul>

<h3>Recommendations</h3>
<ul>
${recommendations.map(rec => `<li>${rec}</li>`).join('\n')}
</ul>

<p><em>Sent by dcyfr-labs API Cost Monitor</em></p>
        `.trim();

        try {
          await resend.emails.send({
            from: 'DCYFR Labs <noreply@dcyfr.ai>',
            to: ALERT_EMAIL,
            subject: `🚨 Critical API Cost Alert - ${criticalAlerts.length} Alert(s)`,
            html: emailBody,
          });

          console.warn(`[API Cost Monitor] Sent critical alert email to ${ALERT_EMAIL}`);
        } catch (error) {
          console.error('[API Cost Monitor] Failed to send email:', error);
          // Don't throw - email is not critical
        }
      });
    }

    return {
      success: true,
      monthlyCost: {
        total: monthlyCost.totalCost,
        budget: monthlyCost.totalBudget,
        percentUsed: monthlyCost.percentUsed,
      },
      alerts: {
        total: alerts.length,
        critical: criticalAlerts.length,
        warning: alerts.filter(a => a.level === 'warning').length,
      },
      recommendations: recommendations.length,
    };
  }
);

// ============================================================================
// MONTHLY COST REPORT
// ============================================================================

/**
 * Generate and send monthly cost report
 *
 * Schedule: 1st of each month at 10:00 AM UTC
 */
export const monthlyApiCostReport = inngest.createFunction(
  {
    id: 'monthly-api-cost-report',
    name: 'Monthly API Cost Report',
    retries: 2,
  },
  { cron: '0 10 1 * *' }, // 1st of month at 10am UTC
  async ({ step }) => {
    // Get previous month's data
    const previousMonth = await step.run('get-previous-month', async () => {
      const now = new Date();
      const prevMonth = new Date(now);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      return prevMonth.toISOString().slice(0, 7); // YYYY-MM
    });

    // Calculate costs for previous month
    const monthlyCost = await step.run('calculate-previous-month-cost', async () => {
      return await calculateMonthlyCost(previousMonth);
    });

    // Generate detailed recommendations
    const recommendations = await step.run('generate-recommendations', async () => {
      return await generateCostRecommendations(previousMonth);
    });

    // Get predictions for current month
    const predictions = await step.run('generate-predictions', async () => {
      const services = Object.keys(PRICING) as Array<keyof typeof PRICING>;
      const results: Array<{
        service: string;
        prediction: Awaited<ReturnType<typeof predictLimitDate>>;
      }> = [];

      for (const service of services) {
        try {
          const prediction = await predictLimitDate(service, 'default', 7);
          if (prediction.daysUntilLimit !== null) {
            results.push({ service, prediction });
          }
        } catch (error) {
          console.warn(`[Monthly Report] Failed to predict for ${service}:`, error);
        }
      }

      return results;
    });

    // Send monthly report email
    if (process.env.RESEND_API_KEY) {
      await step.run('send-monthly-report-email', async () => {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const emailBody = `
<h2>📊 Monthly API Cost Report - ${previousMonth}</h2>

<h3>Summary</h3>
<ul>
  <li><strong>Total Cost:</strong> $${monthlyCost.totalCost.toFixed(2)}</li>
  <li><strong>Budget:</strong> $${monthlyCost.totalBudget}</li>
  <li><strong>Budget Used:</strong> ${monthlyCost.percentUsed.toFixed(1)}%</li>
  <li><strong>Status:</strong> ${monthlyCost.withinBudget ? '✅ Within Budget' : '❌ Over Budget'}</li>
</ul>

<h3>Service Breakdown</h3>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
  <thead>
    <tr>
      <th>Service</th>
      <th>Requests</th>
      <th>Cost</th>
      <th>Tier</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
${monthlyCost.services.map(({ service, usage, cost }) => `
    <tr>
      <td>${PRICING[service as keyof typeof PRICING].name}</td>
      <td>${usage.totalRequests.toLocaleString()}</td>
      <td>$${cost.estimatedCost.toFixed(2)}</td>
      <td>${cost.tier}</td>
      <td>${cost.withinBudget ? '✅' : '❌'}</td>
    </tr>
`).join('')}
  </tbody>
</table>

<h3>Predictions for Current Month</h3>
${predictions.length > 0 ? `
<ul>
${predictions.map(({ service, prediction }) => `
  <li><strong>${PRICING[service as keyof typeof PRICING].name}:</strong> 
    ${prediction.daysUntilLimit !== null 
      ? `${prediction.daysUntilLimit} days until limit (${prediction.confidence} confidence)`
      : 'No limit predicted'}
  </li>
`).join('\n')}
</ul>
` : '<p><em>No predictions available</em></p>'}

<h3>Recommendations</h3>
<ul>
${recommendations.map(rec => `<li>${rec}</li>`).join('\n')}
</ul>

<p><em>Sent by dcyfr-labs Monthly Cost Reporter</em></p>
        `.trim();

        try {
          await resend.emails.send({
            from: 'DCYFR Labs <noreply@dcyfr.ai>',
            to: ALERT_EMAIL,
            subject: `📊 Monthly API Cost Report - ${previousMonth}`,
            html: emailBody,
          });

          console.warn(`[Monthly Report] Sent report email to ${ALERT_EMAIL}`);
        } catch (error) {
          console.error('[Monthly Report] Failed to send email:', error);
          // Don't throw - continue execution
        }
      });
    }

    // Log to Sentry for tracking
    await step.run('log-to-sentry', async () => {
      Sentry.captureMessage(`Monthly API Cost Report: ${previousMonth}`, {
        level: 'info',
        tags: {
          component: 'api-cost-monitoring',
          month: previousMonth,
        },
        extra: {
          monthlyCost,
          recommendations,
          predictions: predictions.length,
        },
      });
    });

    return {
      success: true,
      month: previousMonth,
      totalCost: monthlyCost.totalCost,
      budget: monthlyCost.totalBudget,
      percentUsed: monthlyCost.percentUsed,
      servicesReported: monthlyCost.services.length,
      predictions: predictions.length,
    };
  }
);
