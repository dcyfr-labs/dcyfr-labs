import type { Metadata } from 'next';
import { redis } from '@/lib/redis-client';
import { posts } from '@/data/posts';
import { projects } from '@/data/projects';
import { changelog } from '@/data/changelog';
import {
  transformPosts,
  transformProjects,
  transformChangelog,
  aggregateActivities,
} from '@/lib/activity';
import {
  transformPostsWithViews,
  transformMilestones,
  transformHighEngagementPosts,
  transformCommentMilestones,
  transformCredlyBadges,
  transformVercelAnalytics,
  transformGitHubTraffic,
  transformGoogleAnalytics,
  transformSearchConsole,
} from '@/lib/activity/server';
import type { ActivityItem } from '@/lib/activity';
import { ActivityEmbedClient } from './activity-embed-client';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'Activity Feed Embed',
  robots: {
    index: false, // Don't index embed pages
    follow: false,
  },
};

// Force dynamic rendering - don't attempt to prerender during build
// This page requires Redis and external APIs that aren't available at build time
export const dynamic = 'force-dynamic';

// Enable ISR for embed page - revalidate every 5 minutes (when rendered dynamically)
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

  // Fetch activities (cache-first strategy)
  let allActivities: ActivityItem[] = [];
  let error: string | null = null;

  try {
    // STEP 1: Try cache first (TEMPORARILY DISABLED FOR DEBUG - committed activity removal)
    // const redis = await getRedisClient();
    const cachedActivities: ActivityItem[] = []; // Always empty - cache disabled

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
        milestones,
        highEngagement,
        commentMilestones,
        credlyBadges,
        vercelAnalytics,
        githubTraffic,
        googleAnalytics,
        searchConsole,
      ] = await Promise.all([
        transformPostsWithViews(posts),
        transformMilestones(posts),
        transformHighEngagementPosts(posts),
        transformCommentMilestones(posts),
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
        ...milestones,
        ...highEngagement,
        ...commentMilestones,
        ...credlyBadges,
        ...vercelAnalytics,
        ...githubTraffic,
        ...googleAnalytics,
        ...searchConsole,
      ]);

      // Cache for future requests
      try {
        await redis.setEx(
          'activity:feed:all',
          300, // 5 minutes TTL
          JSON.stringify(allActivities)
        );
      } catch (writeError) {
        console.error('[Activity Embed] Cache write failed:', writeError);
      }
    }
  } catch (err) {
    console.error('[Activity Embed] Failed to load activities:', err);
    error = err instanceof Error ? err.message : 'Unknown error';
    allActivities = [];
  }

  // Serialize activities for client
  const serializedActivities = allActivities.map((activity) => ({
    ...activity,
    timestamp:
      activity.timestamp instanceof Date ? activity.timestamp.toISOString() : activity.timestamp,
  }));

  // Extract URL parameters for filtering
  const source = params.source as string | undefined;
  const timeRange = params.timeRange as string | undefined;
  const limit = params.limit ? parseInt(params.limit as string, 10) : undefined;

  return (
    <ActivityEmbedClient
      activities={serializedActivities}
      error={error}
      initialSource={source}
      initialTimeRange={timeRange}
      limit={limit}
    />
  );
}
