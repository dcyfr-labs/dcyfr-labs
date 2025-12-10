import type { Metadata } from "next";
import { headers } from "next/headers";
import { createPageMetadata, getJsonLdScriptProps } from "@/lib/metadata";
import { SITE_URL, AUTHOR_NAME } from "@/lib/site-config";
import { CONTAINER_WIDTHS, CONTAINER_PADDING, CONTAINER_VERTICAL_PADDING } from "@/lib/design-tokens";
import { PageHero } from "@/components/layouts/page-hero";
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
  transformGitHubActivity,
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
  "Real-time timeline of blog posts, project updates, trending content, milestones, and GitHub activity.";

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/activity",
});

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
    // STEP 1: Try cache first
    const redis = await getRedisClient();
    if (redis) {
      try {
        const cached = await redis.get("activity:feed:all");
        if (cached) {
          allActivities = JSON.parse(cached);
          loadSource = "cache";
          console.log(
            `[Activity Page] ✅ Loaded from cache: ${allActivities.length} items`
          );
        } else {
          console.log("[Activity Page] ⚠️ Cache miss, fetching directly");
        }
        await redis.quit();
      } catch (cacheError) {
        console.error("[Activity Page] Cache read error:", cacheError);
        // Continue to direct fetch on cache error
      }
    }

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
      
      // Trending posts from this week (limit 1)
      transformTrendingPosts(posts, 1)
        .then((items) => activities.push(...items))
        .catch((err) => console.error("[Activity Page] Trending posts (this week) fetch failed:", err)),
      
      // Trending posts from this month (limit 1, after month start)
      transformTrendingPosts(posts, 1, {
        after: monthStart,
        description: "Trending this month",
      })
        .then((items) => activities.push(...items))
        .catch((err) => console.error("[Activity Page] Trending posts (this month) fetch failed:", err)),
      
      // All time trending posts (limit 1, before this month)
      transformTrendingPosts(posts, 1, {
        before: monthStart,
        description: "All time trending",
      })
        .then((items) => activities.push(...items))
        .catch((err) => console.error("[Activity Page] Trending posts (all time) fetch failed:", err)),
      
      // Milestones
      transformMilestones(posts, 20)
        .then((items) => activities.push(...items))
        .catch((err) => console.error("[Activity Page] Milestones fetch failed:", err)),
      
      // High engagement posts
      transformHighEngagementPosts(posts, 5, 10)
        .then((items) => activities.push(...items))
        .catch((err) => console.error("[Activity Page] High engagement posts fetch failed:", err)),
      
      // Comment milestones
      transformCommentMilestones(posts, 10)
        .then((items) => activities.push(...items))
        .catch((err) => console.error("[Activity Page] Comment milestones fetch failed:", err)),
      
      // GitHub activity
      transformGitHubActivity("dcyfr", ["dcyfr-labs"], 15)
        .then((items) => activities.push(...items))
        .catch((err) => console.error("[Activity Page] GitHub activity fetch failed:", err)),
    ]);

    // Aggregate and sort (limit to 100 for page)
    allActivities = aggregateActivities(activities, { limit: 100 });
    loadSource = "direct";
    
    console.log(
      `[Activity Page] ✅ Direct fetch complete: ${allActivities.length} items`
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

      {/* Header */}
      <div id="activity-header">
        <PageHero
          title={pageTitle}
          description={pageDescription}
          variant="homepage"
        />
      </div>

      <div
        className={`container ${CONTAINER_WIDTHS.standard} mx-auto ${CONTAINER_PADDING} pb-8`}
      >

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 mb-8">
            <p className="text-sm text-destructive">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
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
