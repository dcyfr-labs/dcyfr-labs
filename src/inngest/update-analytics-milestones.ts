import { inngest } from "./client";
import { updateAllAnalyticsMilestones } from "@/lib/analytics-integration";

/**
 * Inngest Function: Update Analytics Milestones
 *
 * Purpose:
 * - Fetch real analytics data from configured sources
 * - Update Redis with latest milestones
 * - Run on a schedule (daily at 2 AM UTC)
 * - Can also be triggered manually via API
 *
 * Triggers:
 * 1. Cron schedule: "0 2 * * *" (daily at 2 AM UTC)
 * 2. Manual event: "analytics/milestones.update"
 *
 * Sources Updated:
 * - Vercel Analytics (if VERCEL_TOKEN configured)
 * - GitHub Traffic (if GITHUB_TOKEN configured)
 * - Google Analytics (placeholder - not implemented)
 * - Search Console (placeholder - not implemented)
 *
 * Graceful Degradation:
 * - If a source is not configured, it's skipped
 * - If a source fails, others continue
 * - Logs warnings for failed sources
 * - Never fails the entire job
 */

export const updateAnalyticsMilestones = inngest.createFunction(
  {
    id: "update-analytics-milestones",
    name: "Update Analytics Milestones",
    retries: 2,
  },
  [
    // Scheduled trigger: Daily at 2 AM UTC
    { cron: "0 2 * * *" },
    // Manual trigger via API
    { event: "analytics/milestones.update" },
  ],
  async ({ event, step }) => {
    const triggeredBy = event.data?.triggered_by || "cron_schedule";

    // Log start
    await step.run("log-start", async () => {
      console.warn(`📊 Analytics update started (triggered by: ${triggeredBy})`);
      return { triggered_by: triggeredBy, started_at: new Date().toISOString() };
    });

    // Update all analytics sources
    const result = await step.run("update-analytics", async () => {
      return await updateAllAnalyticsMilestones();
    });

    // Log completion
    await step.run("log-completion", async () => {
      if (result.success) {
        console.warn(`✅ Analytics update complete: ${result.updated.join(", ")}`);
      } else {
        console.warn(
          `⚠️  Analytics update completed with errors:`,
          `Updated: [${result.updated.join(", ")}]`,
          `Failed: [${result.failed.join(", ")}]`
        );
      }

      return {
        completed_at: new Date().toISOString(),
        ...result,
      };
    });

    return {
      success: result.success,
      updated: result.updated,
      failed: result.failed,
      triggered_by: triggeredBy,
    };
  }
);
