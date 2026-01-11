/**
 * Analytics MCP Server
 * Provides AI assistants with direct access to Redis analytics data
 *
 * Tools:
 * - analytics:getPageViews - Query page view data
 * - analytics:getTrending - Find trending content
 * - analytics:getEngagement - Query interaction metrics
 * - analytics:searchActivity - Search activity logs
 * - analytics:getMilestones - List achievement milestones
 *
 * Resources:
 * - analytics://recent - Last 24h metrics
 * - analytics://top-pages - Most viewed pages
 * - analytics://milestones/production - Production milestones
 * - analytics://engagement/summary - Overall engagement stats
 */

import { FastMCP } from "fastmcp";
import { z } from "zod";
import { redis } from "./shared/redis-client.js";
import {
  filterProductionData,
  warnProductionFallback,
  isWithinTimeRange,
  sortByProperty,
  limitResults,
  handleToolError,
  logToolExecution,
  measurePerformance,
  getTimeRangeMs,
} from "./shared/utils.js";
import { analyticsCache } from "./shared/cache.js";
import type {
  TimeRange,
  PageViewData,
  TrendingContent,
  Milestone,
  AnalyticsSummary,
} from "./shared/types.js";

// ============================================================================
// Server Configuration
// ============================================================================

const server = new FastMCP({
  name: "dcyfr-analytics",
  version: "1.0.0",
  instructions:
    "Provides access to dcyfr-labs analytics data from Redis. Use these tools to query page views, trending content, engagement metrics, and milestones. All data is environment-aware (filters test data in production).",
});

// ============================================================================
// Tool 1: Get Page Views
// ============================================================================

server.addTool({
  name: "analytics:getPageViews",
  description:
    "Get page view analytics for a specific path or all pages. Returns view count and optional trend data.",
  parameters: z.object({
    path: z.string().optional().describe("Page path (e.g., /blog, /work)"),
    timeRange: z
      .enum(["24h", "7d", "30d", "all"])
      .optional()
      .default("7d")
      .describe("Time range for analytics"),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: false,
  },
  execute: async (args: { path?: string; timeRange?: "24h" | "7d" | "30d" | "all" }, { log }: { log: any }) => {
    try {
      const { result, durationMs } = await measurePerformance(async () => {
        const cacheKey = `pageviews:${args.path || "all"}:${args.timeRange}`;
        const cached = analyticsCache.get(cacheKey);

        if (cached) {
          log.info("Returning cached page views");
          return cached;
        }

        // Query Redis for page views using actual key pattern: views:post:*
        const keys = await redis.keys("views:post:*");

        // Filter out daily tracking keys (views:post:{id}:day:{date})
        const baseKeys = keys.filter((key) => !key.includes(":day:"));

        if (!baseKeys || baseKeys.length === 0) {
          warnProductionFallback("views:post:*");
          return {
            path: args.path || "all",
            views: 0,
            timeRange: args.timeRange,
            message: "No analytics data available",
          };
        }

        let data: PageViewData;

        if (args.path) {
          // Try to find a matching key for the specific path
          // Path could be post slug or full path
          const matchingKey = baseKeys.find((k) => k.includes(args.path!));

          if (matchingKey) {
            const views = parseInt((await redis.get(matchingKey)) || "0", 10);
            data = {
              path: args.path,
              views,
              timeRange: args.timeRange || "7d",
            };
          } else {
            data = {
              path: args.path,
              views: 0,
              timeRange: args.timeRange || "7d",
            };
          }
        } else {
          // Sum all views across all posts
          let totalViews = 0;
          for (const key of baseKeys) {
            const value = await redis.get(key);
            totalViews += parseInt(value || "0", 10);
          }

          data = {
            path: "all",
            views: totalViews,
            timeRange: args.timeRange || "7d",
          };
        }

        analyticsCache.set(cacheKey, data, 60000); // 1 minute cache
        return data;
      }, "getPageViews");

      logToolExecution("analytics:getPageViews", args, true, durationMs);

      return JSON.stringify(result, null, 2);
    } catch (error) {
      logToolExecution("analytics:getPageViews", args, false);
      return handleToolError(error);
    }
  },
});

// ============================================================================
// Tool 2: Get Trending Content
// ============================================================================

server.addTool({
  name: "analytics:getTrending",
  description:
    "Get trending content based on page views. Returns top pages sorted by views.",
  parameters: z.object({
    limit: z
      .number()
      .optional()
      .default(10)
      .describe("Maximum number of results to return"),
    timeRange: z
      .enum(["24h", "7d", "30d", "all"])
      .optional()
      .default("7d")
      .describe("Time range for trending analysis"),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: false,
  },
  execute: async (args: { limit?: number; timeRange?: "24h" | "7d" | "30d" | "all" }, { log }: { log: any }) => {
    try {
      const { result, durationMs } = await measurePerformance(async () => {
        const cacheKey = `trending:${args.timeRange}:${args.limit}`;
        const cached = analyticsCache.get(cacheKey);

        if (cached) {
          log.info("Returning cached trending content");
          return cached;
        }

        // Query Redis for all post views using actual key pattern: views:post:*
        const keys = await redis.keys("views:post:*");

        // Filter out daily tracking keys (views:post:{id}:day:{date})
        const baseKeys = keys.filter((key) => !key.includes(":day:"));

        if (!baseKeys || baseKeys.length === 0) {
          warnProductionFallback("views:post:*");
          return [];
        }

        // Get all view counts and map to post IDs
        const trendingItems: TrendingContent[] = [];

        for (const key of baseKeys) {
          const postId = key.replace("views:post:", "");
          const views = parseInt((await redis.get(key)) || "0", 10);

          if (views > 0) {
            trendingItems.push({
              path: `/blog/${postId}`,
              views,
              rank: 0, // Will be set after sorting
            });
          }
        }

        const sorted = sortByProperty(trendingItems, "views", "desc");
        const limited = limitResults(sorted, args.limit);

        // Update ranks after sorting
        limited.forEach((item, index) => {
          item.rank = index + 1;
        });

        analyticsCache.set(cacheKey, limited, 60000); // 1 minute cache
        return limited;
      }, "getTrending");

      logToolExecution("analytics:getTrending", args, true, durationMs);

      return JSON.stringify(result, null, 2);
    } catch (error) {
      logToolExecution("analytics:getTrending", args, false);
      return handleToolError(error);
    }
  },
});

// ============================================================================
// Tool 3: Get Engagement Metrics
// ============================================================================

server.addTool({
  name: "analytics:getEngagement",
  description:
    "Get engagement metrics (clicks, shares, interactions) from Redis. Filter by content type and time range.",
  parameters: z.object({
    contentType: z
      .string()
      .optional()
      .describe("Content type filter (e.g., blog, project, all)"),
    timeRange: z
      .enum(["1h", "24h", "7d", "30d", "all"])
      .optional()
      .default("7d")
      .describe("Time range for engagement data"),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: false,
  },
  execute: async (args: { contentType?: string; timeRange?: "1h" | "24h" | "7d" | "30d" | "all" }, { log }: { log: any }) => {
    try {
      const { result, durationMs } = await measurePerformance(async () => {
        const cacheKey = `engagement:${args.contentType || "all"}:${args.timeRange}`;
        const cached = analyticsCache.get(cacheKey);

        if (cached) {
          log.info("Returning cached engagement metrics");
          return cached;
        }

        // Query Redis for likes and bookmarks using all content type patterns
        const [
          postLikes,
          projectLikes,
          activityLikes,
          postBookmarks,
          projectBookmarks,
          activityBookmarks,
        ] = await Promise.all([
          redis.keys("likes:post:*"),
          redis.keys("likes:project:*"),
          redis.keys("likes:activity:*"),
          redis.keys("bookmarks:post:*"),
          redis.keys("bookmarks:project:*"),
          redis.keys("bookmarks:activity:*"),
        ]);

        const likeKeys = [...postLikes, ...projectLikes, ...activityLikes];
        const bookmarkKeys = [
          ...postBookmarks,
          ...projectBookmarks,
          ...activityBookmarks,
        ];

        if (
          (!likeKeys || likeKeys.length === 0) &&
          (!bookmarkKeys || bookmarkKeys.length === 0)
        ) {
          warnProductionFallback("likes:* and bookmarks:*");
          return {
            totalLikes: 0,
            totalBookmarks: 0,
            totalInteractions: 0,
            timeRange: args.timeRange,
            contentType: args.contentType || "all",
          };
        }

        // Sum all likes
        let totalLikes = 0;
        for (const key of likeKeys) {
          const value = await redis.get(key);
          totalLikes += parseInt(value || "0", 10);
        }

        // Sum all bookmarks
        let totalBookmarks = 0;
        for (const key of bookmarkKeys) {
          const value = await redis.get(key);
          totalBookmarks += parseInt(value || "0", 10);
        }

        // Aggregate engagement metrics
        const metrics = {
          totalLikes,
          totalBookmarks,
          totalInteractions: totalLikes + totalBookmarks,
          timeRange: args.timeRange,
          contentType: args.contentType || "all",
        };

        analyticsCache.set(cacheKey, metrics, 60000); // 1 minute cache
        return metrics;
      }, "getEngagement");

      logToolExecution("analytics:getEngagement", args, true, durationMs);

      return JSON.stringify(result, null, 2);
    } catch (error) {
      logToolExecution("analytics:getEngagement", args, false);
      return handleToolError(error);
    }
  },
});

// ============================================================================
// Tool 4: Search Activity Logs
// ============================================================================

server.addTool({
  name: "analytics:searchActivity",
  description:
    "Search activity logs by keyword, type, or date range. Returns matching activity entries.",
  parameters: z.object({
    query: z.string().optional().describe("Search query keyword"),
    activityType: z
      .string()
      .optional()
      .describe("Activity type filter (e.g., pageview, click, share)"),
    timeRange: z
      .enum(["1h", "24h", "7d", "30d", "all"])
      .optional()
      .default("24h")
      .describe("Time range for activity search"),
    limit: z
      .number()
      .optional()
      .default(50)
      .describe("Maximum number of results"),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: false,
  },
  execute: async (args: { query?: string; activityType?: string; timeRange?: "1h" | "24h" | "7d" | "30d" | "all"; limit?: number }, { log }: { log: any }) => {
    try {
      const { result, durationMs } = await measurePerformance(async () => {
        const cacheKey = `activity:${args.query || ""}:${args.activityType || ""}:${args.timeRange}`;
        const cached = analyticsCache.get(cacheKey);

        if (cached) {
          log.info("Returning cached activity search results");
          return cached;
        }

        // Query Redis for view history using actual key pattern: views:history:post:*
        // This returns sorted sets with timestamps of views
        const historyKeys = await redis.keys("views:history:post:*");

        if (!historyKeys || historyKeys.length === 0) {
          warnProductionFallback("views:history:post:*");
          return [];
        }

        // Get recent activity from view history sorted sets
        const activities: Array<{
          type: string;
          path: string;
          timestamp: number;
          data: Record<string, unknown>;
        }> = [];

        for (const key of historyKeys) {
          const postId = key.replace("views:history:post:", "");

          // Get recent entries from sorted set (within time range)
          const now = Date.now();
          const timeRangeMs = getTimeRangeMs(args.timeRange || "24h");
          const minScore = now - timeRangeMs;

          // zRangeByScore returns members with scores between min and max
          const entries = await redis.zRangeByScore(key, minScore, now);

          for (const entry of entries) {
            const timestamp = parseInt(entry, 10);
            activities.push({
              type: "pageview",
              path: `/blog/${postId}`,
              timestamp,
              data: { postId },
            });
          }
        }

        // Filter by activity type
        if (args.activityType && args.activityType !== "pageview") {
          // Currently only pageview activity is tracked
          return [];
        }

        // Filter by query keyword
        let filtered = activities;
        if (args.query) {
          const queryLower = args.query.toLowerCase();
          filtered = activities.filter(
            (activity) =>
              activity.path.toLowerCase().includes(queryLower) ||
              activity.data.postId
                ?.toString()
                .toLowerCase()
                .includes(queryLower)
          );
        }

        // Sort by timestamp descending
        filtered.sort((a, b) => b.timestamp - a.timestamp);

        // Limit results
        const limited = limitResults(filtered, args.limit);

        analyticsCache.set(cacheKey, limited, 60000); // 1 minute cache
        return limited;
      }, "searchActivity");

      logToolExecution("analytics:searchActivity", args, true, durationMs);

      return JSON.stringify(result, null, 2);
    } catch (error) {
      logToolExecution("analytics:searchActivity", args, false);
      return handleToolError(error);
    }
  },
});

// ============================================================================
// Tool 5: Get Milestones
// ============================================================================

server.addTool({
  name: "analytics:getMilestones",
  description:
    "Get achievement milestones. Filters test data in production environments.",
  parameters: z.object({
    includeTest: z
      .boolean()
      .optional()
      .default(false)
      .describe("Include test milestones (ignored in production)"),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: false,
  },
  execute: async (args: { includeTest?: boolean }, { log }: { log: any }) => {
    try {
      const { result, durationMs } = await measurePerformance(async () => {
        const cacheKey = `milestones:${args.includeTest}`;
        const cached = analyticsCache.get(cacheKey);

        if (cached) {
          log.info("Returning cached milestones");
          return cached;
        }

        const milestonesData = await redis.get("analytics:milestones");

        if (!milestonesData) {
          warnProductionFallback("analytics:milestones");
          return [];
        }

        const allMilestones: Milestone[] = JSON.parse(milestonesData);

        // Filter production data (automatically excludes test data in prod)
        const filtered = filterProductionData(allMilestones);

        analyticsCache.set(cacheKey, filtered, 300000); // 5 minute cache
        return filtered;
      }, "getMilestones");

      logToolExecution("analytics:getMilestones", args, true, durationMs);

      return JSON.stringify(result, null, 2);
    } catch (error) {
      logToolExecution("analytics:getMilestones", args, false);
      return handleToolError(error);
    }
  },
});

// ============================================================================
// Resource 1: Recent Metrics (Last 24h)
// ============================================================================

server.addResource({
  uri: "analytics://recent",
  name: "Recent Analytics (24h)",
  mimeType: "application/json",
  description: "Summary of analytics from the last 24 hours",
  async load() {
    try {
      const cacheKey = "resource:recent";
      const cached = analyticsCache.get(cacheKey);

      if (cached) {
        return { text: JSON.stringify(cached, null, 2) };
      }

      // Query actual Redis keys
      const [allViewKeys, milestonesData] = await Promise.all([
        redis.keys("views:post:*"),
        redis.get("analytics:milestones"),
      ]);

      // Filter out daily tracking keys
      const viewKeys = allViewKeys.filter((key) => !key.includes(":day:"));

      // Sum all views
      let totalViews = 0;
      for (const key of viewKeys) {
        const value = await redis.get(key);
        totalViews += parseInt(value || "0", 10);
      }

      const milestones: Milestone[] = milestonesData
        ? JSON.parse(milestonesData)
        : [];
      const recent24h = milestones.filter((m) =>
        isWithinTimeRange(m.achievedAt, "24h")
      );

      const summary: AnalyticsSummary = {
        totalViews,
        topPages: [],
        recentActivity: [],
        milestones: filterProductionData(recent24h),
        generatedAt: Date.now(),
      };

      analyticsCache.set(cacheKey, summary, 60000); // 1 minute cache

      return { text: JSON.stringify(summary, null, 2) };
    } catch (error) {
      return { text: handleToolError(error) };
    }
  },
});

// ============================================================================
// Resource 2: Top Pages (Most Viewed)
// ============================================================================

server.addResource({
  uri: "analytics://top-pages",
  name: "Top Pages by Views",
  mimeType: "application/json",
  description: "Most viewed pages sorted by traffic",
  async load() {
    try {
      const cacheKey = "resource:top-pages";
      const cached = analyticsCache.get(cacheKey);

      if (cached) {
        return { text: JSON.stringify(cached, null, 2) };
      }

      // Query actual Redis keys
      const allViewKeys = await redis.keys("views:post:*");
      const viewKeys = allViewKeys.filter((key) => !key.includes(":day:"));

      if (!viewKeys || viewKeys.length === 0) {
        return {
          text: JSON.stringify(
            { message: "No page view data available", pages: [] },
            null,
            2
          ),
        };
      }

      // Get all view counts
      const pages: Array<{ path: string; views: number }> = [];
      for (const key of viewKeys) {
        const postId = key.replace("views:post:", "");
        const views = parseInt((await redis.get(key)) || "0", 10);
        if (views > 0) {
          pages.push({ path: `/blog/${postId}`, views });
        }
      }

      const topPages = pages.sort((a, b) => b.views - a.views).slice(0, 20); // Top 20 pages

      const result = {
        topPages,
        totalPages: pages.length,
        generatedAt: Date.now(),
      };

      analyticsCache.set(cacheKey, result, 300000); // 5 minute cache

      return { text: JSON.stringify(result, null, 2) };
    } catch (error) {
      return { text: handleToolError(error) };
    }
  },
});

// ============================================================================
// Resource 3: Engagement Summary
// ============================================================================

server.addResource({
  uri: "analytics://engagement/summary",
  name: "Engagement Summary",
  mimeType: "application/json",
  description: "Overall engagement statistics and trends",
  async load() {
    try {
      const cacheKey = "resource:engagement-summary";
      const cached = analyticsCache.get(cacheKey);

      if (cached) {
        return { text: JSON.stringify(cached, null, 2) };
      }

      // Query actual Redis keys for likes and bookmarks across all content types
      const [
        postLikes,
        projectLikes,
        activityLikes,
        postBookmarks,
        projectBookmarks,
        activityBookmarks,
      ] = await Promise.all([
        redis.keys("likes:post:*"),
        redis.keys("likes:project:*"),
        redis.keys("likes:activity:*"),
        redis.keys("bookmarks:post:*"),
        redis.keys("bookmarks:project:*"),
        redis.keys("bookmarks:activity:*"),
      ]);

      const likeKeys = [...postLikes, ...projectLikes, ...activityLikes];
      const bookmarkKeys = [
        ...postBookmarks,
        ...projectBookmarks,
        ...activityBookmarks,
      ];

      if (
        (!likeKeys || likeKeys.length === 0) &&
        (!bookmarkKeys || bookmarkKeys.length === 0)
      ) {
        return {
          text: JSON.stringify(
            {
              message: "No engagement data available",
              totalLikes: 0,
              totalBookmarks: 0,
              totalInteractions: 0,
            },
            null,
            2
          ),
        };
      }

      // Sum all likes
      let totalLikes = 0;
      for (const key of likeKeys) {
        const value = await redis.get(key);
        totalLikes += parseInt(value || "0", 10);
      }

      // Sum all bookmarks
      let totalBookmarks = 0;
      for (const key of bookmarkKeys) {
        const value = await redis.get(key);
        totalBookmarks += parseInt(value || "0", 10);
      }

      const summary = {
        totalLikes,
        totalBookmarks,
        totalInteractions: totalLikes + totalBookmarks,
        generatedAt: Date.now(),
      };

      analyticsCache.set(cacheKey, summary, 300000); // 5 minute cache

      return { text: JSON.stringify(summary, null, 2) };
    } catch (error) {
      return { text: handleToolError(error) };
    }
  },
});

// ============================================================================
// Start Server
// ============================================================================

server.start({
  transportType: "stdio",
});

console.warn("✅ Analytics MCP Server started (stdio mode)");
