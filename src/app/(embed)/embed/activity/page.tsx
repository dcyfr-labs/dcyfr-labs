import { headers } from "next/headers";
import type { Metadata } from "next";
import { createClient } from "redis";
import { SITE_URL } from "@/lib/site-config";
import { posts } from "@/data/posts";
import { projects } from "@/data/projects";
import { changelog } from "@/data/changelog";
import {
  transformPosts,
  transformProjects,
  transformChangelog,
  aggregateActivities,
} from "@/lib/activity";
import {
  transformPostsWithViews,
  transformTrendingPosts,
  transformMilestones,
  transformHighEngagementPosts,
  transformCommentMilestones,
  // transformGitHubActivity, (DISABLED)
  // transformWebhookGitHubCommits, (DISABLED)
  transformCredlyBadges,
  transformVercelAnalytics,
  transformGitHubTraffic,
  transformGoogleAnalytics,
  transformSearchConsole,
} from "@/lib/activity/server";
import type { ActivityItem } from "@/lib/activity";
import { ActivityEmbedClient } from "./activity-embed-client";
// ============================================================================
// REDIS CLIENT HELPER
// ============================================================================

async function getRedisClient() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return null;

  try {
    const client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 3) return new Error("Max retries exceeded");
          return Math.min(retries * 100, 3000);
        },
      },
    });

    if (!client.isOpen) {
      await client.connect();
    }

    return client;
  } catch (error) {
    console.error("[Activity Embed] Redis connection failed:", error);
    return null;
  }
}

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: "Activity Feed Embed",
  robots: {
    index: false, // Don't index embed pages
    follow: false,
  },
};

// Enable ISR for embed page - revalidate every 5 minutes
export const revalidate = 300;

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default async function ActivityEmbedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  // Get nonce from proxy for CSP
  const nonce = (await headers()).get("x-nonce") || "";

  // Fetch activities (cache-first strategy)
  let allActivities: ActivityItem[] = [];
  let error: string | null = null;

  try {
    // STEP 1: Try cache first (TEMPORARILY DISABLED FOR DEBUG - committed activity removal)
    // const redis = await getRedisClient();
    let cachedActivities: ActivityItem[] = []; // Always empty - cache disabled

    // if (redis) {
    //   try {
    //     const cached = await redis.get("activity:feed:all");
    //     if (cached) {
    //       cachedActivities = JSON.parse(cached);
    //       allActivities = cachedActivities;
    //     }
    //   } catch (cacheError) {
    //     console.error("[Activity Embed] Cache read failed:", cacheError);
    //   } finally {
    //     await redis.disconnect();
    //   }
    // }

    // STEP 2: If no cache, fetch from sources
    if (cachedActivities.length === 0) {
      const [
        postsWithViews,
        // trending - DISABLED: Now shown as badges on published events
        milestones,
        highEngagement,
        commentMilestones,
        // githubActivity, (DISABLED)
        // webhookCommits, (DISABLED)
        credlyBadges,
        vercelAnalytics,
        githubTraffic,
        googleAnalytics,
        searchConsole,
      ] = await Promise.all([
        transformPostsWithViews(posts),
        // transformTrendingPosts(posts), - DISABLED
        transformMilestones(posts),
        transformHighEngagementPosts(posts),
        transformCommentMilestones(posts),
        // transformGitHubActivity(), (DISABLED)
        // transformWebhookGitHubCommits(), (DISABLED)
        transformCredlyBadges(),
        transformVercelAnalytics(),
        transformGitHubTraffic(),
        transformGoogleAnalytics(),
        transformSearchConsole(),
      ]);

      const staticPosts = transformPosts(posts);
      const staticProjects = transformProjects([...projects]);
      const staticChangelog = transformChangelog(changelog);

      allActivities = aggregateActivities([
        ...staticPosts,
        ...staticProjects,
        ...staticChangelog,
        ...postsWithViews,
        // ...trending, - DISABLED: Now shown as badges
        ...milestones,
        ...highEngagement,
        ...commentMilestones,
        // ...githubActivity, (DISABLED)
        // ...webhookCommits, (DISABLED)
        ...credlyBadges,
        ...vercelAnalytics,
        ...githubTraffic,
        ...googleAnalytics,
        ...searchConsole,
      ]);

      // Cache for future requests
      const redisForWrite = await getRedisClient();
      if (redisForWrite) {
        try {
          await redisForWrite.setEx(
            "activity:feed:all",
            300, // 5 minutes TTL
            JSON.stringify(allActivities)
          );
        } catch (writeError) {
          console.error("[Activity Embed] Cache write failed:", writeError);
        } finally {
          await redisForWrite.disconnect();
        }
      }
    }
  } catch (err) {
    console.error("[Activity Embed] Failed to load activities:", err);
    error = err instanceof Error ? err.message : "Unknown error";
    allActivities = [];
  }

  // Serialize activities for client
  const serializedActivities = allActivities.map((activity) => ({
    ...activity,
    timestamp:
      activity.timestamp instanceof Date
        ? activity.timestamp.toISOString()
        : activity.timestamp,
  }));

  // Extract URL parameters for filtering
  const source = params.source as string | undefined;
  const timeRange = params.timeRange as string | undefined;
  const limit = params.limit ? parseInt(params.limit as string, 10) : undefined;

  return (
    <ActivityEmbedClient
      activities={serializedActivities}
      error={error}
      nonce={nonce}
      initialSource={source}
      initialTimeRange={timeRange}
      limit={limit}
    />
  );
}
