import { inngest } from "./client";
import { createClient } from "redis";
import { track } from "@vercel/analytics/server";

// Redis configuration
const redisUrl = process.env.REDIS_URL;
type RedisClient = ReturnType<typeof createClient>;

declare global {
  var __blogAnalyticsRedisClient: RedisClient | undefined;
}

async function getRedisClient(): Promise<RedisClient | null> {
  if (!redisUrl) return null;

  if (!globalThis.__blogAnalyticsRedisClient) {
    const client = createClient({ 
      url: redisUrl,
      socket: {
        connectTimeout: 10000,     // Increased to 10s (allow slow cold starts)
        reconnectStrategy: (retries) => {
          if (retries > 5) return new Error('Max retries exceeded');  // More attempts
          return Math.min(retries * 200, 5000); // Slower backoff
        },
      },
    });
    client.on("error", (error) => {
      console.error("Blog analytics Redis error:", error);
    });
    globalThis.__blogAnalyticsRedisClient = client;
  }

  const client = globalThis.__blogAnalyticsRedisClient;
  if (!client) return null;

  if (!client.isOpen) {
    await client.connect();
  }

  return client;
}

// Redis keys
const VIEW_KEY_PREFIX = "views:post:";
const TRENDING_KEY = "blog:trending";
const MILESTONE_KEY_PREFIX = "blog:milestone:";
const ANALYTICS_KEY_PREFIX = "blog:analytics:";

/**
 * Track blog post view
 * 
 * Triggered when a user views a blog post.
 * NOTE: The actual view count increment happens in /api/views via incrementPostViews().
 * This function handles secondary tracking:
 * - Daily view tracking for analytics
 * - Milestone detection
 * - Updating trending calculations
 */
export const trackPostView = inngest.createFunction(
  { id: "track-post-view" },
  { event: "blog/post.viewed" },
  async ({ event, step }) => {
    const { postId, slug, title } = event.data;
    const redis = await getRedisClient();

    if (!redis) {
      console.warn("Redis not configured, skipping view tracking");
      return { success: false, reason: "redis-not-configured" };
    }

    // Step 1: Process view tracking atomically
    // Combines: get views, track daily, check milestones - reduces execution time by 33%
    const totalViews = await step.run("process-view", async () => {
      try {
        // Get current view count (already incremented by /api/views)
        const views = await redis.get(`${VIEW_KEY_PREFIX}${postId}`);
        const count = parseInt(views || '0');
        console.warn(`Post view tracked: ${slug} (${count} total views)`);
        
        // Track in Vercel Analytics
        await track('blog_post_viewed', {
          postId,
          slug,
          title,
          totalViews: count,
        });
        
        // Track daily views (uses postId for consistency)
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        await redis.incr(`${VIEW_KEY_PREFIX}${postId}:day:${today}`);
        await redis.expire(`${VIEW_KEY_PREFIX}${postId}:day:${today}`, 90 * 24 * 60 * 60); // 90 days
        
        // Check for milestones
        const milestones = [100, 1000, 10000, 50000, 100000];
        for (const milestone of milestones) {
          if (count === milestone) {
            // Send milestone event
            await inngest.send({
              name: "blog/milestone.reached",
              data: {
                slug,
                title,
                milestone,
                totalViews: count,
                reachedAt: new Date().toISOString(),
              },
            });

            // Track that we've sent this milestone (uses postId)
            await redis.set(
              `${MILESTONE_KEY_PREFIX}${postId}:${milestone}`,
              new Date().toISOString()
            );

            console.warn(`🎉 Milestone reached: ${title} hit ${milestone} views!`);
          }
        }
        
        return count;
      } catch (error) {
        console.error("Failed to process view:", error);
        return 0;
      }
    });

    return {
      success: true,
      postId,
      slug,
      totalViews,
      timestamp: new Date().toISOString(),
    };
  },
);

/**
 * Handle milestone achievements
 * 
 * Triggered when a post reaches a view milestone.
 * Could send notifications, update badges, etc.
 */
export const handleMilestone = inngest.createFunction(
  { id: "handle-milestone" },
  { event: "blog/milestone.reached" },
  async ({ event, step }) => {
    const { slug, title, milestone, totalViews } = event.data;

    // Step 1: Log the milestone
    await step.run("log-milestone", async () => {
      console.warn(`
        🎉 MILESTONE ACHIEVED! 🎉
        Post: ${title}
        Slug: ${slug}
        Milestone: ${milestone.toLocaleString()} views
        Total: ${totalViews.toLocaleString()} views
      `);
      
      // Track in Vercel Analytics
      await track('blog_milestone_reached', {
        slug,
        title,
        milestone,
        totalViews,
      });
    });

    // Step 2: Send email notification to author (optional feature)
    await step.run("notify-author", async () => {
      // FUTURE ENHANCEMENT: Implement email notification for milestone achievements
      // This would require:
      // 1. Adding AUTHOR_EMAIL to environment variables
      // 2. Creating a reusable email template for milestones
      // 3. Implementing email send via Resend or similar service
      //
      // Example implementation:
      // await inngest.send({
      //   name: "contact/email.send",
      //   data: {
      //     to: process.env.AUTHOR_EMAIL,
      //     subject: `🎉 "${title}" reached ${milestone} views!`,
      //     html: renderMilestoneEmail({ title, slug, milestone, totalViews }),
      //   },
      // });
      
      console.warn(`Milestone notification: ${title} reached ${milestone} views (email integration not yet implemented)`);
    });

    return {
      success: true,
      milestone,
      notified: false, // Will be true once email integration is added
    };
  },
);

/**
 * Calculate trending posts
 * 
 * Runs hourly to identify posts with high recent activity.
 * Uses a simple algorithm: views in last 7 days / age of post.
 */
export const calculateTrending = inngest.createFunction(
  { 
    id: "calculate-trending",
    retries: 1,  // Fail fast on hourly jobs to prevent queue buildup
  },
  { cron: "0 * * * *" }, // Every hour
  async ({ step }) => {
    const redis = await getRedisClient();

    if (!redis) {
      return { success: false, reason: "redis-not-configured" };
    }

    // Step 1: Get all post view keys
    const posts = await step.run("fetch-post-data", async () => {
      try {
        const keys = await redis.keys(`${VIEW_KEY_PREFIX}*`);
        const postKeys = keys.filter(key => !key.includes(':day:'));
        
        const postsData = [];
        
        for (const key of postKeys) {
          const postId = key.replace(VIEW_KEY_PREFIX, '');
          const totalViews = parseInt(await redis.get(key) || '0');
          
          // Get views from last 7 days
          let recentViews = 0;
          const today = new Date();
          
          for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayViews = await redis.get(`${key}:day:${dateStr}`);
            recentViews += parseInt(dayViews || '0');
          }
          
          postsData.push({
            postId,
            totalViews,
            recentViews,
          });
        }
        
        return postsData;
      } catch (error) {
        console.error("Failed to fetch post data:", error);
        return [];
      }
    });

    // Step 2: Calculate trending scores
    const trending = await step.run("calculate-scores", async () => {
      return posts
        .filter(post => post.recentViews > 0)
        .map(post => ({
          ...post,
          // Simple trending score: recent views * (recent/total ratio)
          score: post.recentViews * (post.recentViews / (post.totalViews || 1)),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Top 10
    });

    // Step 3: Store trending list
    await step.run("store-trending", async () => {
      try {
        await redis.set(
          TRENDING_KEY,
          JSON.stringify(trending),
          { EX: 60 * 60 } // Cache for 1 hour
        );
        
        console.warn(`Updated trending posts: ${trending.length} posts`);
        
        // Track in Vercel Analytics
        await track('trending_posts_calculated', {
          trendingCount: trending.length,
          topPostId: trending[0]?.postId,
        });
      } catch (error) {
        console.error("Failed to store trending data:", error);
      }
    });

    return {
      success: true,
      trendingCount: trending.length,
      topPost: trending[0]?.postId,
      timestamp: new Date().toISOString(),
    };
  },
);

/**
 * Generate analytics summary
 * 
 * Runs daily/weekly/monthly to create analytics reports.
 * Could be extended to send email summaries, update dashboards, etc.
 */
export const generateAnalyticsSummary = inngest.createFunction(
  { 
    id: "generate-analytics-summary",
    retries: 1,
  },
  { event: "analytics/summary.generate" },
  async ({ event, step }) => {
    const { period, startDate, endDate } = event.data;
    const redis = await getRedisClient();

    if (!redis) {
      return { success: false, reason: "redis-not-configured" };
    }

    // Step 1: Collect post data
    const postsData = await step.run("collect-data", async () => {
      try {
        const keys = await redis.keys(`${VIEW_KEY_PREFIX}*`);
        const postKeys = keys.filter(key => !key.includes(':day:'));
        
        const data = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (const key of postKeys) {
          const slug = key.replace(VIEW_KEY_PREFIX, '');
          const totalViews = parseInt(await redis.get(key) || '0');
          
          // Calculate views in period
          let periodViews = 0;
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const dayViews = await redis.get(`${key}:day:${dateStr}`);
            periodViews += parseInt(dayViews || '0');
          }
          
          if (periodViews > 0) {
            data.push({
              slug,
              totalViews,
              periodViews,
            });
          }
        }
        
        return data.sort((a, b) => b.periodViews - a.periodViews);
      } catch (error) {
        console.error("Failed to collect analytics data:", error);
        return [];
      }
    });

    // Step 2: Generate summary
    const summary = await step.run("generate-summary", async () => {
      const totalViews = postsData.reduce((sum, post) => sum + post.periodViews, 0);
      
      return {
        period,
        startDate,
        endDate,
        totalViews,
        uniquePosts: postsData.length,
        topPosts: postsData.slice(0, 10).map(post => ({
          slug: post.slug,
          title: post.slug, // Would need to fetch actual title
          views: post.periodViews,
        })),
      };
    });

    // Step 3: Store summary
    await step.run("store-summary", async () => {
      try {
        const summaryKey = `${ANALYTICS_KEY_PREFIX}${period}:${startDate}`;
        await redis.set(
          summaryKey,
          JSON.stringify(summary),
          { EX: 90 * 24 * 60 * 60 } // Keep for 90 days
        );
        
        console.warn(`Analytics summary generated for ${period}:`, {
          totalViews: summary.totalViews,
          posts: summary.uniquePosts,
        });
        
        // Track in Vercel Analytics
        await track('analytics_summary_generated', {
          period,
          totalViews: summary.totalViews,
          uniquePosts: summary.uniquePosts,
          startDate,
          endDate,
        });
      } catch (error) {
        console.error("Failed to store analytics summary:", error);
      }
    });

    return {
      success: true,
      summary,
    };
  },
);

/**
 * Daily analytics summary (scheduled)
 * 
 * Runs daily at midnight UTC to generate yesterday's summary.
 */
export const dailyAnalyticsSummary = inngest.createFunction(
  { id: "daily-analytics-summary" },
  { cron: "0 0 * * *" }, // Daily at midnight UTC
  async ({ step }) => {
    await step.run("trigger-summary", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];
      
      await inngest.send({
        name: "analytics/summary.generate",
        data: {
          period: "daily",
          startDate: dateStr,
          endDate: dateStr,
        },
      });
      
      console.warn(`Daily analytics summary triggered for ${dateStr}`);
    });

    return { success: true, triggered: true };
  },
);

/**
 * Sync Vercel analytics into Redis for comparison and dashboard display.
 *
 * Runs daily at 02:00 UTC. Uses `VERCEL_ANALYTICS_ENDPOINT` and `VERCEL_TOKEN`
 * for a proxy endpoint (preferred) or a direct Vercel API endpoint if configured.
 */
export const syncVercelAnalytics = inngest.createFunction(
  { id: "sync-vercel-analytics" },
  { cron: "0 2 * * *" }, // Daily at 02:00 UTC
  async ({ step }) => {
    const redis = await getRedisClient();
    if (!redis) {
      console.warn("Redis not configured, skipping Vercel analytics sync");
      return { success: false, reason: "redis-not-configured" };
    }

    const { fetchVercelAnalytics } = await import("@/lib/vercel-analytics-api");

    await step.run("fetch-vercel-analytics", async () => {
      try {
        const result = await fetchVercelAnalytics(1);
        if (!result) {
          console.warn("No Vercel analytics available; ensure VERCEL_TOKEN and VERCEL_ANALYTICS_ENDPOINT are configured");
          return { success: false, reason: "no-vercel-data" };
        }

        const { topPages, topReferrers, topDevices, fetchedAt } = result;

        // Store standardized data in Redis with 24h TTL
        await redis.set("vercel:topPages:daily", JSON.stringify(topPages), { EX: 24 * 60 * 60 });
        await redis.set("vercel:topReferrers:daily", JSON.stringify(topReferrers), { EX: 24 * 60 * 60 });
        await redis.set("vercel:topDevices:daily", JSON.stringify(topDevices), { EX: 24 * 60 * 60 });
        await redis.set("vercel:metrics:lastSynced", fetchedAt, { EX: 24 * 60 * 60 });

        // Track that we fetched Vercel analytics - helpful for audit
        await track('vercel_analytics_synced', { fetchedAt, topPagesCount: topPages.length });

        console.warn(`Vercel analytics synced: ${topPages.length} pages, ${topReferrers.length} referrers, ${topDevices.length} devices`);
      } catch (error) {
        console.error("Failed to sync Vercel analytics:", error);
      }
    });

    return { success: true };
  }
);

