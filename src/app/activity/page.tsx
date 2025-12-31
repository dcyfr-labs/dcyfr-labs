import type { Metadata } from "next";
import { headers } from "next/headers";
import { createPageMetadata, getJsonLdScriptProps } from "@/lib/metadata";
import { SITE_URL, AUTHOR_NAME } from "@/lib/site-config";
import {
  CONTAINER_WIDTHS,
  CONTAINER_PADDING,
  TYPOGRAPHY,
  SPACING,
} from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { ActivityPageClient } from "./activity-client";
import { PageLayout, ArchiveHero } from "@/components/layouts";
import { FeedDropdown } from "@/components/blog/client";
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
  "Timeline of blog posts, project updates, trending content, and milestones.";

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

  try {
    // STEP 1: Try cache first (TEMPORARILY DISABLED FOR DEBUG - committed activity removal)
    // const redis = await getRedisClient();
    // if (redis) {
    //   try {
    //     const cached = await redis.get("activity:feed:all");
    //     if (cached) {
    //       allActivities = JSON.parse(cached);
    //       loadSource = "cache";
    //       console.warn(
    //         `[Activity Page] ✅ Loaded from cache: ${allActivities.length} items`
    //       );
    //     } else {
    //       console.warn("[Activity Page] ⚠️ Cache miss, fetching directly");
    //     }
    //     await redis.quit();
    //   } catch (cacheError) {
    //     console.error("[Activity Page] Cache read error:", cacheError);
    //     // Continue to direct fetch on cache error
    //   }
    // }

    // STEP 2: Fallback to direct fetch if cache miss
    if (allActivities.length === 0) {
      console.warn("[Activity Page] Fetching activities directly...");

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
          .catch((err) =>
            console.error("[Activity Page] Blog posts fetch failed:", err)
          ),

        // Projects
        Promise.resolve(transformProjects([...projects]))
          .then((items) => activities.push(...items))
          .catch((err) =>
            console.error("[Activity Page] Projects fetch failed:", err)
          ),

        // Changelog
        Promise.resolve(transformChangelog(changelog))
          .then((items) => activities.push(...items))
          .catch((err) =>
            console.error("[Activity Page] Changelog fetch failed:", err)
          ),

        // Trending posts - DISABLED: Now shown as badges on published events
        // transformTrendingPosts(posts)
        //   .then((items) => activities.push(...items))
        //   .catch((err) => console.error("[Activity Page] Trending posts fetch failed:", err)),

        // Milestones - all
        transformMilestones(posts)
          .then((items) => activities.push(...items))
          .catch((err) =>
            console.error("[Activity Page] Milestones fetch failed:", err)
          ),

        // High engagement posts - all
        transformHighEngagementPosts(posts)
          .then((items) => activities.push(...items))
          .catch((err) =>
            console.error(
              "[Activity Page] High engagement posts fetch failed:",
              err
            )
          ),

        // Comment milestones - all
        transformCommentMilestones(posts)
          .then((items) => activities.push(...items))
          .catch((err) =>
            console.error(
              "[Activity Page] Comment milestones fetch failed:",
              err
            )
          ),

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
          .catch((err) =>
            console.error("[Activity Page] Credly badges fetch failed:", err)
          ),

        // Vercel Analytics milestones - all
        transformVercelAnalytics()
          .then((items) => activities.push(...items))
          .catch((err) =>
            console.error("[Activity Page] Vercel Analytics fetch failed:", err)
          ),

        // GitHub Traffic milestones - all
        transformGitHubTraffic()
          .then((items) => activities.push(...items))
          .catch((err) =>
            console.error("[Activity Page] GitHub Traffic fetch failed:", err)
          ),

        // Google Analytics milestones - all
        transformGoogleAnalytics()
          .then((items) => activities.push(...items))
          .catch((err) =>
            console.error("[Activity Page] Google Analytics fetch failed:", err)
          ),

        // Search Console achievements - all
        transformSearchConsole()
          .then((items) => activities.push(...items))
          .catch((err) =>
            console.error("[Activity Page] Search Console fetch failed:", err)
          ),
      ]);

      // Sort by timestamp (no filtering, no aggregation - unified timeline)
      allActivities = activities.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );

      // DEBUG: Log all sources of activities
      const sourceCounts: Record<string, number> = {};
      activities.forEach((a) => {
        sourceCounts[a.source] = (sourceCounts[a.source] || 0) + 1;
      });
      console.warn(
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

  // Calculate stats for hero
  const activityCount = allActivities.length;
  const lastUpdated =
    allActivities.length > 0
      ? new Date(allActivities[0].timestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null;

  // Feed dropdown for hero
  const feedAction = <FeedDropdown feedType="activity" />;

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />

      {/* Hero Section */}
      <ArchiveHero
        variant="medium"
        title={pageTitle}
        description={pageDescription}
        stats={
          lastUpdated
            ? `${activityCount} ${activityCount === 1 ? "activity" : "activities"} • Last updated ${lastUpdated}`
            : `${activityCount} ${activityCount === 1 ? "activity" : "activities"}`
        }
        actions={feedAction}
        align="center"
      />

      {/* Error State - Shown above content if needed */}
      {error && (
        <div
          className={`${CONTAINER_WIDTHS.standard} mx-auto ${CONTAINER_PADDING} py-8`}
        >
          <div
            className={cn(
              "rounded-xl border border-destructive/50 bg-destructive/10 p-4",
              SPACING.content
            )}
          >
            <p className={cn(TYPOGRAPHY.body, "text-destructive")}>{error}</p>
            <p
              className={cn(TYPOGRAPHY.metadata, "text-muted-foreground mt-2")}
            >
              Activities may be temporarily unavailable. Please try again later.
            </p>
          </div>
        </div>
      )}

      {/* Search & Timeline Section */}
      <ActivityPageClient activities={serializedActivities} />
    </PageLayout>
  );
}
