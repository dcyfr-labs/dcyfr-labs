/**
 * Credly Cache Functions
 *
 * Manages caching of Credly badge data to ensure fresh content
 * and optimal performance for badge displays across the site.
 *
 * Benefits:
 * - Proactive cache warming (fresh data always available)
 * - Reduced API calls during peak traffic
 * - Better user experience (faster page loads)
 * - Resilient to Credly API downtime
 */

import { inngest } from "./client";
import { preloadCredlyData } from "@/lib/credly-cache";

// ============================================================================
// REFRESH CREDLY CACHE
// ============================================================================

/**
 * Daily Credly Cache Refresh
 *
 * Pre-loads Credly badge data into cache to ensure fresh content
 * is always available. Runs daily at 6 AM UTC (early morning) to
 * refresh before peak traffic hours.
 *
 * Cron schedule: Daily at 6:00 AM UTC
 *
 * Benefits:
 * - Fresh badge data without user-facing delays
 * - Reduced load during peak traffic hours
 * - Proactive error detection for Credly API issues
 * - Better cache hit rates throughout the day
 *
 * Pre-loads:
 * - All badges for primary user
 * - Limited badge sets (3, 10 badges) for various displays
 * - Skills aggregation data
 */
export const refreshCredlyCache = inngest.createFunction(
  {
    id: "refresh-credly-cache",
    retries: 3, // More retries for external API dependency
  },
  { cron: "0 6 * * *" }, // Daily at 6:00 AM UTC
  async ({ step }) => {
    // Step 1: Refresh primary user badge cache
    await step.run("refresh-dcyfr-badges", async () => {
      console.log("[Credly Cache] Refreshing badge cache for dcyfr user...");
      
      try {
        // Pre-load all common badge configurations
        await preloadCredlyData("dcyfr");
        
        return {
          status: "success",
          message: "Credly cache refreshed successfully",
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error("[Credly Cache] Failed to refresh cache:", error);
        throw new Error(`Credly cache refresh failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    });

    // Step 2: Validate cache integrity
    const validation = await step.run("validate-cache", async () => {
      try {
        // Import cache functions for validation
        const { getCredlyCacheStats } = await import("@/lib/credly-cache");
        
        const stats = getCredlyCacheStats();
        console.log("[Credly Cache] Cache validation:", stats);
        
        if (stats.validEntries === 0) {
          throw new Error("No valid cache entries after refresh");
        }
        
        return {
          status: "validated",
          stats,
          message: `Cache validated: ${stats.validEntries} valid entries`,
        };
      } catch (error) {
        console.error("[Credly Cache] Cache validation failed:", error);
        // Don't throw here - cache refresh might have worked even if validation fails
        return {
          status: "validation_failed",
          error: error instanceof Error ? error.message : "Unknown validation error",
        };
      }
    });

    return {
      refreshStatus: "completed",
      validation,
      completedAt: new Date().toISOString(),
      message: "Daily Credly cache refresh completed successfully",
    };
  },
);

// ============================================================================
// EMERGENCY CACHE CLEAR
// ============================================================================

/**
 * Emergency Credly Cache Clear
 *
 * Manually triggered function to clear Credly cache in case of
 * corrupted or stale data. Can be triggered via Inngest dashboard
 * or programmatically when cache issues are detected.
 *
 * Event: "credly/cache.clear"
 *
 * Use cases:
 * - Corrupted cache data detected
 * - Manual cache invalidation needed
 * - Testing cache refresh mechanisms
 * - API structure changes require cache reset
 */
export const clearCredlyCache = inngest.createFunction(
  {
    id: "clear-credly-cache",
    retries: 1,
  },
  { event: "credly/cache.clear" },
  async ({ event, step }) => {
    const { reason = "manual", requestedBy = "system" } = event.data;
    
    await step.run("clear-cache", async () => {
      console.log(`[Credly Cache] Clearing cache - Reason: ${reason}, Requested by: ${requestedBy}`);
      
      try {
        const { clearCredlyCache } = await import("@/lib/credly-cache");
        clearCredlyCache();
        
        return {
          status: "success",
          message: "Credly cache cleared successfully",
          reason,
          requestedBy,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error("[Credly Cache] Failed to clear cache:", error);
        throw new Error(`Cache clear failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    });

    return {
      action: "cache_cleared",
      reason,
      requestedBy,
      timestamp: new Date().toISOString(),
    };
  },
);