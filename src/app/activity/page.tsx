import type { Metadata } from "next";
import { headers } from "next/headers";
import { createPageMetadata, getJsonLdScriptProps } from "@/lib/metadata";
import { SITE_URL, AUTHOR_NAME } from "@/lib/site-config";
import { CONTAINER_WIDTHS, CONTAINER_PADDING, TYPOGRAPHY, SPACING } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { ActivityPageClient } from "./activity-client";
import { posts } from "@/data/posts";
import { projects } from "@/data/projects";
import { changelog } from "@/data/changelog";
import {
  transformPosts,
  transformProjects,
  transformChangelog,
  aggregateActivities,
} from "@/lib/activity/sources";
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
} from "@/lib/activity/sources.server";
import type { ActivityItem } from "@/lib/activity/types";
import { createClient } from "redis";

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
    console.error("[Activity Page] Redis connection failed:", error);
    return null;
  }
}

const pageTitle = "Activity";
const pageDescription =
  "Timeline of blog posts, project updates, trending content, milestones, and GitHub activity.";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: pageTitle,
    description: pageDescription,
    path: "/activity",
  }),
  alternates: {
    types: {
      "application/rss+xml": [
        {
          url: `${SITE_URL}/activity/rss.xml`,
          title: `${AUTHOR_NAME}'s Activity Feed`,
        },
      ],
    },
  },
};

// Enable ISR for activity page - revalidate every 5 minutes
export const revalidate = 300;

export default async function ActivityPage() {
  // Get nonce from proxy for CSP
  const nonce = (await headers()).get("x-nonce") || "";

  // Fetch activities (cache-first strategy)
  let allActivities: ActivityItem[] = [];
  let error: string | null = null;
  let loadSource: "cache" | "direct" = "direct";

  try {
    // STEP 1: Try cache first (TEMPORARILY DISABLED FOR DEBUG - committed activity removal)
    // const redis = await getRedisClient();
    // if (redis) {
    //   try {
    //     const cached = await redis.get("activity:feed:all");
    //     if (cached) {
    //       allActivities = JSON.parse(cached);
    //       loadSource = "cache";
    //       console.log(
    //         `[Activity Page] ✅ Loaded from cache: ${allActivities.length} items`
    //       );
    //     } else {
    //       console.log("[Activity Page] ⚠️ Cache miss, fetching directly");
    //     }
    //     await redis.quit();
    //   } catch (cacheError) {
    //     console.error("[Activity Page] Cache read error:", cacheError);
    //     // Continue to direct fetch on cache error
    //   }
    // }

    // STEP 2: Fallback to direct fetch if cache miss
    if (allActivities.length === 0) {
      console.log("[Activity Page] Fetching activities directly...");

      // Calculate time boundaries for trending posts
      const now = new Date();
      
      // Start of current month
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Gather activity from all sources in parallel
      const activities: ActivityItem[] = [];
    
    await Promise.all([
      // Blog posts with views
      transformPostsWithViews(posts)
        .then((items) => activities.push(...items))
        .catch((err) => console.error("[Activity Page] Blog posts fetch failed:", err)),
      
      // Projects
      Promise.resolve(transformProjects([...projects]))
        .then((items) => activities.push(...items))
        .catch((err) => console.error("[Activity Page] Projects fetch failed:", err)),
      
      // Changelog
      Promise.resolve(transformChangelog(changelog))
        .then((items) => activities.push(...items))
        .catch((err) => console.error("[Activity Page] Changelog fetch failed:", err)),
      
      // Trending posts - DISABLED: Now shown as badges on published events
      // transformTrendingPosts(posts)
      //   .then((items) => activities.push(...items))
      //   .catch((err) => console.error("[Activity Page] Trending posts fetch failed:", err)),

      // Milestones - all
      transformMilestones(posts)
        .then((items) => activities.push(...items))
        .catch((err) => console.error("[Activity Page] Milestones fetch failed:", err)),
      
      // High engagement posts - all
      transformHighEngagementPosts(posts)
        .then((items) => activities.push(...items))
        .catch((err) => console.error("[Activity Page] High engagement posts fetch failed:", err)),
      
      // Comment milestones - all
      transformCommentMilestones(posts)
        .then((items) => activities.push(...items))
        .catch((err) => console.error("[Activity Page] Comment milestones fetch failed:", err)),
      
      // GitHub activity - all (DISABLED)
      // transformGitHubActivity("dcyfr", ["dcyfr-labs"])
      //   .then((items) => activities.push(...items))
      //   .catch((err) => console.error("[Activity Page] GitHub activity fetch failed:", err)),
      
      // Webhook GitHub commits - real-time from Redis (DISABLED)
      // transformWebhookGitHubCommits()
      //   .then((items) => activities.push(...items))
      //   .catch((err) => console.error("[Activity Page] Webhook GitHub commits fetch failed:", err)),
      
      // Credly badges - all
      transformCredlyBadges("dcyfr")
        .then((items) => activities.push(...items))
        .catch((err) => console.error("[Activity Page] Credly badges fetch failed:", err)),
      
      // Vercel Analytics milestones - all
      transformVercelAnalytics()
        .then((items) => activities.push(...items))
        .catch((err) => console.error("[Activity Page] Vercel Analytics fetch failed:", err)),
      
      // GitHub Traffic milestones - all
      transformGitHubTraffic()
        .then((items) => activities.push(...items))
        .catch((err) => console.error("[Activity Page] GitHub Traffic fetch failed:", err)),
      
      // Google Analytics milestones - all
      transformGoogleAnalytics()
        .then((items) => activities.push(...items))
        .catch((err) => console.error("[Activity Page] Google Analytics fetch failed:", err)),
      
      // Search Console achievements - all
      transformSearchConsole()
        .then((items) => activities.push(...items))
        .catch((err) => console.error("[Activity Page] Search Console fetch failed:", err)),
    ]);

    // Sort by timestamp (no filtering, no aggregation - unified timeline)
    allActivities = activities.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    loadSource = "direct";
    
    // DEBUG: Log all sources of activities
    const sourceCounts: Record<string, number> = {};
    activities.forEach((a) => {
      sourceCounts[a.source] = (sourceCounts[a.source] || 0) + 1;
    });
    console.log(
      `[Activity Page] ✅ Direct fetch complete: ${allActivities.length} items. Sources:`,
      sourceCounts
    );
    }
  } catch (err) {
    error = "Failed to load activities";
    console.error("[Activity Page] Error:", err);
  }

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/activity`,
    url: `${SITE_URL}/activity`,
    name: pageTitle,
    description: pageDescription,
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
    },
    inLanguage: "en-US",
  };

  // Serialize activities for client component
  const serializedActivities = allActivities.map((activity) => ({
    ...activity,
    timestamp:
      typeof activity.timestamp === "string"
        ? activity.timestamp
        : activity.timestamp?.toISOString?.() || new Date().toISOString(),
  }));

  return (
    <>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />

      {/* Minimal Hero - Threads-like centered design */}
      <div className={cn("border-b py-16 md:py-20")}>
        <div className={`${CONTAINER_WIDTHS.thread} mx-auto ${CONTAINER_PADDING} text-center`}>
          <div className="flex flex-col items-center gap-4">
            <h1 className={cn(TYPOGRAPHY.h1.standard, "text-balance")}>
              {pageTitle}
            </h1>
            <p className={cn(TYPOGRAPHY.body, "text-muted-foreground text-balance")}>
              {pageDescription}
            </p>
            <a
              href="/activity/rss.xml"
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-full border border-border/50 hover:border-border hover:bg-muted/30",
                TYPOGRAPHY.label.small
              )}
              title="Subscribe to RSS feed"
              aria-label="Subscribe to activity feed via RSS"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path d="M3.429 2.571v18.857h18.857V2.571H3.429zm16.071 16.072H5.214V4.357H19.5v14.286zM8.25 14.893a2.036 2.036 0 1 1 0 4.071 2.036 2.036 0 0 1 0-4.071zm0 0M6.321 6.536v2.25c5.625 0 10.179 4.554 10.179 10.178h2.25c0-6.857-5.571-12.428-12.429-12.428zm0 4.5v2.25a5.679 5.679 0 0 1 5.679 5.678h2.25A7.929 7.929 0 0 0 6.321 11.036z"/>
              </svg>
              RSS Feed
            </a>
          </div>
        </div>
      </div>

      <div
        className={`${CONTAINER_WIDTHS.standard} mx-auto ${CONTAINER_PADDING} py-12 md:py-16`}
      >

        {/* Error State */}
        {error && (
          <div className={cn("rounded-xl border border-destructive/50 bg-destructive/10 p-4", SPACING.content)}>
            <p className={cn(TYPOGRAPHY.body, "text-destructive")}>{error}</p>
            <p className={cn(TYPOGRAPHY.metadata, "text-muted-foreground mt-2")}>
              Activities may be temporarily unavailable. Please try again later.
            </p>
          </div>
        )}

        {/* Activity Feed */}
        <div id="activity-feed">
          <ActivityPageClient activities={serializedActivities} />
        </div>
      </div>
    </>
  );
}
