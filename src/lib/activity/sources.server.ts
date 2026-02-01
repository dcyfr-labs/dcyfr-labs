/**
 * Server-Only Activity Source Transformers
 *
 * This file contains async transformers that require Node.js APIs (Redis, etc.)
 * and can only be used in server components and API routes.
 *
 * ⚠️ DO NOT import this file in client components!
 * Use sources.ts for client-safe transformers.
 */

import type { Post } from '@/data/posts';
import type { ActivityItem, ActivitySource, ActivityVerb } from './types';
import type { CredlyBadge, CredlyBadgesResponse } from '@/types/credly';
import { getMultiplePostViews, getMultiplePostViewsInRange } from '@/lib/views.server';
import { getPostCommentsBulk } from '@/lib/comments';
import { getActivityReactionsBulk, mapGiscusReactionsToLikes } from '@/lib/giscus-reactions';
import { redis } from '@/mcp/shared/redis-client';
import { calculateTrendingStatus, type EngagementMetrics } from './trending';

// ============================================================================
// BLOG POST TRANSFORMER (WITH VIEW COUNTS)
// ============================================================================

/**
 * Transform blog posts into activity items with view counts and Giscus reactions
 * Server-only version with enriched data from Redis
 *
 * Now includes:
 * - View counts from Redis
 * - Comment counts from GitHub Discussions (Giscus)
 * - Reaction counts (likes) from Giscus
 */
export async function transformPostsWithViews(posts: Post[]): Promise<ActivityItem[]> {
  const publishedPosts = posts.filter((p) => !p.archived && !p.draft);
  const postIds = publishedPosts.map((p) => p.id);
  const slugs = publishedPosts.map((p) => p.slug);

  // Fetch data in parallel (view counts, comments, reactions)
  const [viewsMap, weeklyViewsMap, monthlyViewsMap, commentsMap, reactionsMap] = await Promise.all([
    // All-time view counts from Redis (for display)
    getMultiplePostViews(postIds).catch((error) => {
      console.error('[Activity] Failed to fetch view counts:', error);
      return new Map<string, number>();
    }),
    // Weekly view counts for trending calculation (past 7 days)
    getMultiplePostViewsInRange(postIds, 7).catch((error) => {
      console.error('[Activity] Failed to fetch weekly view counts:', error);
      return new Map<string, number>();
    }),
    // Monthly view counts for trending calculation (past 30 days)
    getMultiplePostViewsInRange(postIds, 30).catch((error) => {
      console.error('[Activity] Failed to fetch monthly view counts:', error);
      return new Map<string, number>();
    }),
    // Comment counts from Giscus (GitHub Discussions)
    getPostCommentsBulk(slugs).catch((error) => {
      console.error('[Activity] Failed to fetch comment counts:', error);
      return {} as Record<string, number>;
    }),
    // Reaction counts from Giscus (👍 = likes)
    getActivityReactionsBulk(
      publishedPosts.map((post) => ({
        activityId: `blog-${post.id}`,
        discussionPath: `/blog/${post.slug}`,
      }))
    ).catch((error) => {
      console.error('[Activity] Failed to fetch Giscus reactions:', error);
      return {} as Record<string, any>;
    }),
  ]);

  return publishedPosts.map((post) => {
    const views = viewsMap.get(post.id) || undefined;
    const weeklyViews = weeklyViewsMap.get(post.id) || 0;
    const monthlyViews = monthlyViewsMap.get(post.id) || 0;
    const comments = commentsMap[post.slug] || undefined;
    const reactions = reactionsMap[`blog-${post.id}`];
    const likes = reactions ? mapGiscusReactionsToLikes(reactions) : undefined;
    const verb = post.updatedAt ? ('updated' as const) : ('published' as const);

    // Calculate trending status using time-windowed views (past 7/30 days)
    // Comments/likes use all-time counts (most engagement happens within first weeks anyway)
    const weeklyMetrics: EngagementMetrics = {
      views: weeklyViews,
      likes: likes || 0,
      comments: comments || 0,
      readingCompletion: 0, // TODO: Implement reading completion tracking
      periodDays: 7,
    };

    const monthlyMetrics: EngagementMetrics = {
      views: monthlyViews,
      likes: likes || 0,
      comments: comments || 0,
      readingCompletion: 0,
      periodDays: 30,
    };

    const weeklyStatus = calculateTrendingStatus(weeklyMetrics);
    const monthlyStatus = calculateTrendingStatus(monthlyMetrics);

    return {
      id: `blog-${post.id}`,
      source: 'blog' as const,
      verb,
      title: post.title,
      description: post.summary,
      timestamp: new Date(post.updatedAt || post.publishedAt),
      href: `/blog/${post.slug}`,
      meta: {
        tags: post.tags.slice(0, 3),
        category: post.category,
        image: post.image
          ? {
              url: post.image.url,
              alt: post.image.alt || post.image.caption || post.title,
            }
          : undefined,
        readingTime: post.readingTime?.text,
        stats: {
          ...(views !== undefined && { views }),
          ...(comments !== undefined && { comments }),
          ...(likes !== undefined && { likes }),
        },
        // Store raw Giscus reactions for potential future use (analytics, breakdown)
        giscusReactions: reactions,
        // Add trending status
        trendingStatus: {
          isWeeklyTrending: weeklyStatus.isWeeklyTrending,
          isMonthlyTrending: monthlyStatus.isMonthlyTrending,
          engagementScore: Math.max(weeklyStatus.engagementScore, monthlyStatus.engagementScore),
        },
        // Keep backward compatibility
        trending: weeklyStatus.isWeeklyTrending || monthlyStatus.isMonthlyTrending,
      },
    };
  });
}

// TRENDING POSTS TRANSFORMER
// ============================================================================

interface TrendingPost {
  postId: string;
  totalViews: number;
  recentViews: number;
  score: number;
}

/**
 * Validate trending post data for consistency and quality
 * Returns validation result with warnings/errors for missing data
 *
 * Handles slug migration: trending data may reference old post slugs (stored as postId)
 * while posts now use new slugs. This function maps old slugs to current post IDs
 * by checking previousSlugs in post frontmatter.
 */
function validateTrendingData(
  trending: TrendingPost[],
  posts: Post[]
): { valid: TrendingPost[]; warnings: string[]; source: 'redis' | 'fallback' } {
  const warnings: string[] = [];

  // Build slug-to-post mapping including previous slugs for backward compatibility
  const postsBySlug = new Map<string, Post>();
  const postsByPreviousSlug = new Map<string, Post>();

  for (const post of posts) {
    postsBySlug.set(post.slug, post);
    postsBySlug.set(post.id, post); // Also map by current post ID

    // Map previous slugs to current post for slug migration support
    if (post.previousSlugs && Array.isArray(post.previousSlugs)) {
      for (const prevSlug of post.previousSlugs) {
        postsByPreviousSlug.set(prevSlug, post);
      }
    }
  }

  const validTrending = trending.filter((item) => {
    if (!item.postId) {
      warnings.push(`Trending item missing postId`);
      return false;
    }

    // Try to find post by current ID first, then by current slug, then by previous slug
    let post = postsBySlug.get(item.postId) || postsByPreviousSlug.get(item.postId);

    if (!post) {
      warnings.push(`Post ${item.postId} not found in posts data`);
      return false;
    }

    if (post.archived || post.draft) {
      warnings.push(`Post ${item.postId} is archived or draft`);
      return false;
    }

    // Check for data quality (should have either totalViews or recentViews)
    if (item.totalViews === undefined || item.recentViews === undefined) {
      warnings.push(`Trending item for ${item.postId} missing view counts`);
    }

    // Update postId to current post ID in case it was resolved via previous slug
    item.postId = post.id;

    return true;
  });

  if (validTrending.length === 0) {
    warnings.push('No valid trending posts found');
  }

  return {
    valid: validTrending,
    warnings,
    source: 'redis',
  };
}

/**
 * Transform trending posts into activity items
 * Fetches from Redis blog:trending key (updated hourly by Inngest)
 * Falls back to most recent posts if Redis is unavailable
 * Double validates trending data for consistency
 * Optionally filters by date range for trending posts in specific time periods
 */
export async function transformTrendingPosts(
  posts: Post[],
  limit?: number,
  options?: { after?: Date; before?: Date; description?: string }
): Promise<ActivityItem[]> {
  // Redis client imported from shared module
  let trending: TrendingPost[] | null = null;
  let trendingSource: 'redis' | 'fallback' = 'fallback';

  // Try to fetch from Redis first
  if (redis) {
    try {
      const trendingData = await redis.get('blog:trending');

      if (trendingData) {
        try {
          // Upstash auto-parses JSON, so trendingData may already be an array
          // Only parse if it's a string (backwards compatibility)
          const parsed = typeof trendingData === 'string' ? JSON.parse(trendingData) : trendingData;

          // Double validation: check if data is valid
          if (Array.isArray(parsed) && parsed.length > 0) {
            trending = parsed;
            trendingSource = 'redis';
            console.warn(
              `[Activity] Successfully fetched ${trending.length} trending posts from Redis`
            );
          } else {
            // This is expected when trending data hasn't been populated yet
            // (e.g., first deployment, or after Redis reset)
            console.warn('[Activity] Redis trending data not yet populated, using fallback');
          }
        } catch (parseError) {
          console.error('[Activity] Failed to parse trending data from Redis:', parseError);
        }
      } else {
        // This is expected when trending data hasn't been populated yet
        console.warn(
          '[Activity] No trending data in Redis yet (key: blog:trending), using fallback'
        );
      }

      // No quit() needed - Upstash uses HTTP REST API (stateless)
    } catch (error) {
      console.error('[Activity] Failed to fetch trending posts from Redis:', error);
      if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
        console.warn('[Activity] Redis connection refused - likely offline');
      }
    }
  } else {
    console.warn('[Activity] Redis client unavailable (REDIS_URL not configured), using fallback');
  }

  // Fallback: use most recent published posts if Redis is unavailable or invalid
  if (!trending) {
    const validPosts = posts.filter((p) => !p.archived && !p.draft);
    const sorted = validPosts.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    const limited = limit ? sorted.slice(0, limit) : sorted;

    trending = limited.map((post) => ({
      postId: post.id,
      totalViews: 0,
      recentViews: 0,
      score: 0,
    }));

    trendingSource = 'fallback';
    console.warn(
      `[Activity] Using fallback: ${trending.length} most recent posts (Redis unavailable)`
    );
  }

  // Double validation: validate the trending data
  const validation = validateTrendingData(trending, posts);

  // Only log warnings if they indicate actual data quality issues
  // Filter out informational warnings about missing view counts (expected for fallback data)
  const criticalWarnings = validation.warnings.filter((w) => !w.includes('missing view counts'));

  if (criticalWarnings.length > 0) {
    console.warn(
      `[Activity] Trending data validation warnings (${trendingSource}):`,
      criticalWarnings
    );
  }

  const trendingActivities: ActivityItem[] = [];

  const itemsToProcess = limit ? validation.valid.slice(0, limit) : validation.valid;
  for (const item of itemsToProcess) {
    const post = posts.find((p) => p.id === item.postId);
    if (!post || post.archived || post.draft) continue;

    // Filter by date range if provided
    const postDate = new Date(post.publishedAt);
    if (options?.after && postDate < options.after) continue;
    if (options?.before && postDate > options.before) continue;

    // Build description with view stats and time period
    let description: string;
    const timestamp = new Date(post.updatedAt || post.publishedAt);
    const trendingMonth = timestamp.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });

    if (options?.description) {
      // Custom description base - add view stats if available
      if (item.recentViews > 0) {
        description = `${options.description} with ${item.recentViews.toLocaleString()} views in the last 7 days`;
      } else {
        description = options.description;
      }
    } else {
      // Default description - always show the month for clarity
      description =
        item.recentViews > 0
          ? `Trending in ${trendingMonth} with ${item.recentViews.toLocaleString()} views in the last 7 days`
          : `Recently published in ${trendingMonth}`;
    }

    trendingActivities.push({
      id: `trending-${post.id}`,
      source: 'trending' as const,
      verb: 'updated' as const,
      title: post.title,
      description,
      timestamp,
      href: `/blog/${post.slug}`,
      meta: {
        tags: post.tags.slice(0, 3),
        category: post.category,
        image: post.image
          ? {
              url: post.image.url,
              alt: post.image.alt || post.image.caption || post.title,
            }
          : undefined,
        readingTime: post.readingTime?.text,
        stats: {
          views: item.totalViews,
        },
        trending: true,
      },
    });
  }

  return trendingActivities;
}

// ============================================================================
// MILESTONE TRANSFORMER
// ============================================================================

/**
 * Transform milestone achievements into activity items
 * Scans Redis blog:milestone:{postId}:{count} keys
 */
export async function transformMilestones(posts: Post[], limit?: number): Promise<ActivityItem[]> {
  // Redis client imported from shared module
  if (!redis) return [];

  try {
    // Scan for all milestone keys
    const keys: string[] = [];
    let cursor = '0';

    do {
      const [nextCursor, resultKeys] = await redis.scan(cursor, {
        match: 'blog:milestone:*',
        count: 100,
      });
      cursor = nextCursor;
      keys.push(...resultKeys);
    } while (cursor !== '0');

    // Fetch timestamps for all milestone keys
    const milestoneActivities: ActivityItem[] = [];

    for (const key of keys) {
      const timestamp = await redis.get(key);
      if (!timestamp) continue;

      // Parse key: blog:milestone:{postId}:{count}
      const match = key.match(/blog:milestone:([^:]+):(\d+)/);
      if (!match) continue;

      const [, postId, milestoneCount] = match;
      const post = posts.find((p) => p.id === postId);
      if (!post || post.archived || post.draft) continue;

      milestoneActivities.push({
        id: `milestone-${postId}-${milestoneCount}`,
        source: 'milestone' as const,
        verb: 'achieved' as const,
        title: `${post.title} reached ${parseInt(milestoneCount, 10).toLocaleString()} views`,
        description: post.summary,
        timestamp: new Date(timestamp as string),
        href: `/blog/${post.slug}`,
        meta: {
          tags: post.tags.slice(0, 3),
          category: post.category,
          image: post.image
            ? {
                url: post.image.url,
                alt: post.image.alt || post.image.caption || post.title,
              }
            : undefined,
          stats: {
            views: parseInt(milestoneCount, 10),
          },
          milestone: parseInt(milestoneCount, 10),
        },
      });
    }

    // No quit() needed - Upstash uses HTTP REST API (stateless)

    const sorted = milestoneActivities.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    return limit ? sorted.slice(0, limit) : sorted;
  } catch (error) {
    console.error('[Activity] Failed to fetch milestones:', error);
    return [];
  }
}

// ============================================================================
// HIGH ENGAGEMENT TRANSFORMER
// ============================================================================

/**
 * Calculate engagement rate for a post
 * Engagement = (shares + comments) / views
 */
function calculateEngagementRate(views: number, shares: number, comments: number): number {
  if (views === 0) return 0;
  return ((shares + comments) / views) * 100;
}

/**
 * Transform high-engagement posts into activity items
 * Identifies posts with >5% engagement rate
 */
export async function transformHighEngagementPosts(
  posts: Post[],
  threshold = 5, // 5% engagement threshold
  limit?: number
): Promise<ActivityItem[]> {
  const publishedPosts = posts.filter((p) => !p.archived && !p.draft);
  const postIds = publishedPosts.map((p) => p.id);
  const postSlugs = publishedPosts.map((p) => p.slug);

  try {
    // Fetch metrics in parallel
    const [viewsMap, commentsMap] = await Promise.all([
      getMultiplePostViews(postIds),
      getPostCommentsBulk(postSlugs),
    ]);

    // Calculate engagement for each post
    const engagementData = publishedPosts
      .map((post) => {
        const views = viewsMap.get(post.id) || 0;
        const comments = commentsMap[post.slug] || 0;
        const shares = 0; // TODO: Implement shares tracking

        const engagementRate = calculateEngagementRate(views, shares, comments);

        return {
          post,
          views,
          comments,
          shares,
          engagementRate,
        };
      })
      .filter((data) => data.engagementRate >= threshold && data.views >= 100) // Min 100 views
      .sort((a, b) => b.engagementRate - a.engagementRate);

    const limitedData = limit ? engagementData.slice(0, limit) : engagementData;

    return limitedData.map((data) => ({
      id: `engagement-${data.post.id}`,
      source: 'engagement' as const,
      verb: 'updated' as const,
      title: data.post.title,
      description: `High engagement: ${data.engagementRate.toFixed(1)}% engagement rate with ${data.comments} comments`,
      timestamp: new Date(data.post.updatedAt || data.post.publishedAt),
      href: `/blog/${data.post.slug}`,
      meta: {
        tags: data.post.tags.slice(0, 3),
        category: data.post.category,
        image: data.post.image
          ? {
              url: data.post.image.url,
              alt: data.post.image.alt || data.post.image.caption || data.post.title,
            }
          : undefined,
        readingTime: data.post.readingTime?.text,
        stats: {
          views: data.views,
          comments: data.comments,
        },
        engagement: data.engagementRate,
      },
    }));
  } catch (error) {
    console.error('[Activity] Failed to fetch high engagement posts:', error);
    return [];
  }
}

// ============================================================================
// COMMENT MILESTONE TRANSFORMER
// ============================================================================

const COMMENT_MILESTONES = [10, 50, 100, 250, 500] as const;

/**
 * Transform comment milestones into activity items
 * Identifies posts reaching comment thresholds (10, 50, 100, 250, 500)
 */
export async function transformCommentMilestones(
  posts: Post[],
  limit?: number
): Promise<ActivityItem[]> {
  const publishedPosts = posts.filter((p) => !p.archived && !p.draft);
  const postSlugs = publishedPosts.map((p) => p.slug);

  try {
    const commentsMap = await getPostCommentsBulk(postSlugs);

    const milestones = publishedPosts
      .map((post) => {
        const commentCount = commentsMap[post.slug] || 0;

        // Find the highest milestone reached
        const milestone = COMMENT_MILESTONES.filter((m) => commentCount >= m).pop();

        if (!milestone) return null;

        return {
          post,
          commentCount,
          milestone,
        };
      })
      .filter((data): data is NonNullable<typeof data> => data !== null)
      .sort((a, b) => b.milestone - a.milestone);

    const limitedMilestones = limit ? milestones.slice(0, limit) : milestones;

    return limitedMilestones.map((data) => ({
      id: `comment-milestone-${data.post.id}-${data.milestone}`,
      source: 'milestone' as const,
      verb: 'achieved' as const,
      title: `${data.post.title} reached ${data.milestone} comments`,
      description: data.post.summary,
      timestamp: new Date(data.post.updatedAt || data.post.publishedAt),
      href: `/blog/${data.post.slug}`,
      meta: {
        tags: data.post.tags.slice(0, 3),
        category: data.post.category,
        image: data.post.image
          ? {
              url: data.post.image.url,
              alt: data.post.image.alt || data.post.image.caption || data.post.title,
            }
          : undefined,
        stats: {
          comments: data.commentCount,
        },
        milestone: data.milestone,
      },
    }));
  } catch (error) {
    console.error('[Activity] Failed to fetch comment milestones:', error);
    return [];
  }
}

// ============================================================================
// GITHUB ACTIVITY TRANSFORMER
// ============================================================================

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
}

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  html_url: string;
}

/**
 * Transform webhook-based GitHub commits from Redis into activity items
 * These are commits received via webhook and stored by the /api/github/webhook endpoint
 */
export async function transformWebhookGitHubCommits(limit?: number): Promise<ActivityItem[]> {
  // Redis client imported from shared module
  if (!redis) return [];

  try {
    // Get the list of recent commit keys
    const commitKeys = await redis.lrange('github:commits:recent', 0, limit ? limit - 1 : 999);

    if (commitKeys.length === 0) {
      return [];
    }

    // Fetch all commit data in parallel
    const commitDataList = await Promise.all(commitKeys.map((key) => redis.get(key)));

    const activities: ActivityItem[] = [];

    for (const data of commitDataList) {
      if (!data) continue;
      try {
        const commit = JSON.parse(data as string);
        activities.push({
          id: commit.id,
          source: commit.source as ActivitySource,
          verb: commit.verb as ActivityVerb,
          title: commit.title,
          description: commit.description,
          timestamp: new Date(commit.timestamp),
          href: commit.href,
          meta: commit.meta,
        });
      } catch (error) {
        console.error('[Activity] Failed to parse commit data:', error);
      }
    }

    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // No quit() needed - Upstash uses HTTP REST API (stateless)
    return activities;
  } catch (error) {
    console.error('[Activity] Failed to fetch webhook GitHub commits:', error);
    return [];
  }
}

/**
 * Transform GitHub activity (commits, releases) into activity items
 * Fetches from dcyfr-labs organization
 */
export async function transformGitHubActivity(
  org = 'dcyfr',
  repos = ['dcyfr-labs'],
  limit?: number
): Promise<ActivityItem[]> {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.warn('[Activity] GITHUB_TOKEN not configured, GitHub activity unavailable');
    return [];
  }

  try {
    const activities: ActivityItem[] = [];

    for (const repo of repos) {
      // Fetch recent commits
      const commitsResponse = await fetch(
        `https://api.github.com/repos/${org}/${repo}/commits?per_page=5`,
        {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
          next: { revalidate: 300 }, // Cache for 5 minutes
        }
      );

      if (commitsResponse.ok) {
        const commits: GitHubCommit[] = await commitsResponse.json();

        activities.push(
          ...commits.map((commit) => ({
            id: `github-commit-${commit.sha}`,
            source: 'github' as const,
            verb: 'committed' as const,
            title: commit.commit.message.split('\n')[0], // First line only
            description: `Committed to ${repo}`,
            timestamp: new Date(commit.commit.author.date),
            href: commit.html_url,
            meta: {
              category: 'Commit',
            },
          }))
        );
      } else if (commitsResponse.status === 401) {
        console.error(
          '[Activity] GitHub API authentication failed (401) - check GITHUB_TOKEN validity'
        );
        return []; // Stop processing if auth fails
      } else {
        console.warn(`[Activity] Failed to fetch commits for ${repo}: ${commitsResponse.status}`);
      }

      // Fetch recent releases
      const releasesResponse = await fetch(
        `https://api.github.com/repos/${org}/${repo}/releases?per_page=5`,
        {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
          next: { revalidate: 300 }, // Cache for 5 minutes
        }
      );

      if (releasesResponse.ok) {
        const releases: GitHubRelease[] = await releasesResponse.json();

        activities.push(
          ...releases.map((release) => ({
            id: `github-release-${release.id}`,
            source: 'github' as const,
            verb: 'released' as const,
            title: release.name || release.tag_name,
            description: release.body?.split('\n')[0] || `Released ${release.tag_name}`,
            timestamp: new Date(release.published_at),
            href: release.html_url,
            meta: {
              category: 'Release',
              version: release.tag_name,
            },
          }))
        );
      } else if (releasesResponse.status === 401) {
        console.error(
          '[Activity] GitHub API authentication failed (401) - check GITHUB_TOKEN validity'
        );
        return []; // Stop processing if auth fails
      } else {
        console.warn(`[Activity] Failed to fetch releases for ${repo}: ${releasesResponse.status}`);
      }
    }

    const sorted = activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return limit ? sorted.slice(0, limit) : sorted;
  } catch (error) {
    console.error('[Activity] Failed to fetch GitHub activity:', error);
    return [];
  }
}

// ============================================================================
// VERCEL ANALYTICS TRANSFORMER
// ============================================================================

/**
 * Transform Vercel Analytics traffic milestones into activity items
 * Detects when traffic crosses significant thresholds
 */
export async function transformVercelAnalytics(limit?: number): Promise<ActivityItem[]> {
  // Redis client imported from shared module
  if (!redis) return [];

  try {
    // Fetch analytics milestones from Redis
    const milestonesKey = 'analytics:milestones';
    const milestonesData = await redis.get(milestonesKey);

    if (!milestonesData) {
      console.warn('[Activity] No Vercel Analytics milestones found in Redis');
      // No quit() needed - Upstash uses HTTP REST API (stateless)
      return [];
    }

    interface AnalyticsMilestone {
      type: 'monthly_visitors' | 'total_views' | 'unique_visitors';
      threshold: number;
      reached_at: string;
      value: number;
    }

    const milestones: AnalyticsMilestone[] = JSON.parse(milestonesData as string);
    const sorted = milestones.sort(
      (a, b) => new Date(b.reached_at).getTime() - new Date(a.reached_at).getTime()
    );

    const limited = limit ? sorted.slice(0, limit) : sorted;

    // No quit() needed - Upstash uses HTTP REST API (stateless)

    return limited.map((milestone) => {
      const typeLabels = {
        monthly_visitors: 'Monthly Visitors',
        total_views: 'Total Page Views',
        unique_visitors: 'Unique Visitors',
      };

      return {
        id: `analytics-${milestone.type}-${milestone.threshold}-${Date.parse(milestone.reached_at)}`,
        source: 'analytics' as const,
        verb: 'reached' as const,
        title: `${milestone.threshold.toLocaleString()} ${typeLabels[milestone.type]}`,
        description: `Site traffic reached ${milestone.value.toLocaleString()} ${typeLabels[milestone.type].toLowerCase()}`,
        timestamp: new Date(milestone.reached_at),
        href: '/activity',
        meta: {
          category: 'Traffic',
          stats: {
            views: milestone.value,
          },
        },
      };
    });
  } catch (error) {
    console.error('[Activity] transformVercelAnalytics error:', error);
    // No quit() needed - Upstash uses HTTP REST API (stateless)
    return [];
  }
}

// ============================================================================
// GITHUB TRAFFIC TRANSFORMER
// ============================================================================

/**
 * Transform GitHub repository traffic milestones into activity items
 * Tracks views, clones, and referrer achievements
 */
export async function transformGitHubTraffic(
  owner: string = 'dcyfr',
  repos: string[] = ['dcyfr-labs'],
  limit?: number
): Promise<ActivityItem[]> {
  // Redis client imported from shared module
  if (!redis) return [];

  try {
    // Fetch GitHub traffic milestones from Redis
    const milestonesKey = 'github:traffic:milestones';
    const milestonesData = await redis.get(milestonesKey);

    if (!milestonesData) {
      console.warn('[Activity] No GitHub traffic milestones found in Redis');
      // No quit() needed - Upstash uses HTTP REST API (stateless)
      return [];
    }

    interface GitHubTrafficMilestone {
      repo: string;
      type: 'views' | 'clones' | 'stars' | 'forks';
      threshold: number;
      reached_at: string;
      value: number;
    }

    const milestones: GitHubTrafficMilestone[] = JSON.parse(milestonesData as string);
    const sorted = milestones.sort(
      (a, b) => new Date(b.reached_at).getTime() - new Date(a.reached_at).getTime()
    );

    const limited = limit ? sorted.slice(0, limit) : sorted;

    // No quit() needed - Upstash uses HTTP REST API (stateless)

    return limited.map((milestone) => {
      const typeLabels = {
        views: 'Repository Views',
        clones: 'Repository Clones',
        stars: 'GitHub Stars',
        forks: 'Repository Forks',
      };

      const typeEmoji = {
        views: '👀',
        clones: '📥',
        stars: '⭐',
        forks: '🍴',
      };

      return {
        id: `github-traffic-${milestone.repo}-${milestone.type}-${milestone.threshold}`,
        source: 'github-traffic' as const,
        verb: 'reached' as const,
        title: `${typeEmoji[milestone.type]} ${milestone.threshold.toLocaleString()} ${typeLabels[milestone.type]}`,
        description: `${milestone.repo} reached ${milestone.value.toLocaleString()} ${milestone.type}`,
        timestamp: new Date(milestone.reached_at),
        href: `https://github.com/${owner}/${milestone.repo}`,
        meta: {
          category: 'Repository Growth',
          stats: {
            views: milestone.value,
          },
        },
      };
    });
  } catch (error) {
    console.error('[Activity] transformGitHubTraffic error:', error);
    // No quit() needed - Upstash uses HTTP REST API (stateless)
    return [];
  }
}

// ============================================================================
// GOOGLE ANALYTICS TRANSFORMER
// ============================================================================

/**
 * Transform Google Analytics milestones into activity items
 * Tracks monthly visitor achievements and engagement metrics
 */
// Google Analytics integration removed - not implemented
// If needed in future, implement OAuth 2.0 service account in analytics-integration.ts

export async function transformGoogleAnalytics(limit?: number): Promise<ActivityItem[]> {
  // Placeholder - Google Analytics not implemented
  return [];
}

// Legacy implementation (pre-February 2026) below - kept for reference
/*
async function transformGoogleAnalyticsLegacy(limit?: number): Promise<ActivityItem[]> {
  if (!redis) return [];
  try {
    const milestonesKey = 'google:analytics:milestones';
    const milestonesData = await redis.get(milestonesKey);
    if (!milestonesData) return [];
    interface GAMilestone {
      type: 'monthly_users' | 'session_duration' | 'pages_per_session' | 'bounce_rate';
      threshold: number;
      reached_at: string;
      value: number;
      month?: string;
    }
    const milestones: GAMilestone[] = JSON.parse(milestonesData as string);
    const sorted = milestones.sort(
      (a, b) => new Date(b.reached_at).getTime() - new Date(a.reached_at).getTime()
    );
    const limited = limit ? sorted.slice(0, limit) : sorted;
    return limited.map((milestone) => { ... });
  } catch (error) {
    console.error('[Activity] transformGoogleAnalytics error:', error);
    return [];
  }
}
*/

// ============================================================================
// SEARCH CONSOLE TRANSFORMER
// ============================================================================

/**
 * Transform Google Search Console achievements into activity items
 * Tracks SEO milestones like ranking improvements and impression growth
 */
export async function transformSearchConsole(limit?: number): Promise<ActivityItem[]> {
  // Redis client imported from shared module
  if (!redis) return [];

  try {
    // Fetch Search Console milestones from Redis
    const milestonesKey = 'search:console:milestones';
    const milestonesData = await redis.get(milestonesKey);

    if (!milestonesData) {
      console.warn('[Activity] No Search Console milestones found in Redis');
      // No quit() needed - Upstash uses HTTP REST API (stateless)
      return [];
    }

    interface SearchConsoleMilestone {
      type: 'impressions' | 'clicks' | 'ctr' | 'position' | 'top_keyword';
      threshold?: number;
      reached_at: string;
      value: number | string;
      query?: string;
      page?: string;
    }

    const milestones: SearchConsoleMilestone[] = JSON.parse(milestonesData as string);
    const sorted = milestones.sort(
      (a, b) => new Date(b.reached_at).getTime() - new Date(a.reached_at).getTime()
    );

    const limited = limit ? sorted.slice(0, limit) : sorted;

    // No quit() needed - Upstash uses HTTP REST API (stateless)

    return limited.map((milestone) => {
      let title: string;
      let description: string;

      switch (milestone.type) {
        case 'impressions':
          title = `${(milestone.value as number).toLocaleString()} Search Impressions`;
          description = `Site reached ${(milestone.value as number).toLocaleString()} total impressions in Google Search`;
          break;
        case 'clicks':
          title = `${(milestone.value as number).toLocaleString()} Search Clicks`;
          description = `Site reached ${(milestone.value as number).toLocaleString()} total clicks from Google Search`;
          break;
        case 'ctr':
          title = `${milestone.value}% Click-Through Rate`;
          description = `Search click-through rate improved to ${milestone.value}%`;
          break;
        case 'position':
          title = `Top ${milestone.value} Search Ranking`;
          description = milestone.query
            ? `Ranked position ${milestone.value} for "${milestone.query}"`
            : `Achieved top ${milestone.value} position in search results`;
          break;
        case 'top_keyword':
          title = `#1 Ranking: "${milestone.value}"`;
          description = `Achieved top position for "${milestone.value}" in Google Search`;
          break;
        default:
          title = `SEO Milestone Reached`;
          description = `Achieved ${milestone.value}`;
      }

      return {
        id: `search-console-${milestone.type}-${Date.parse(milestone.reached_at)}`,
        source: 'seo' as const,
        verb: 'achieved' as const,
        title,
        description,
        timestamp: new Date(milestone.reached_at),
        href: milestone.page || '/activity',
        meta: {
          category: 'SEO Performance',
          stats:
            typeof milestone.value === 'number'
              ? {
                  views: milestone.value,
                }
              : undefined,
        },
      };
    });
  } catch (error) {
    console.error('[Activity] transformSearchConsole error:', error);
    // No quit() needed - Upstash uses HTTP REST API (stateless)
    return [];
  }
}

// ============================================================================
// CREDLY BADGES TRANSFORMER
// ============================================================================

/**
 * Transform Credly badges into activity items
 * Fetches recent certifications and displays them in the activity feed
 */
export async function transformCredlyBadges(
  username: string = 'dcyfr',
  limit?: number
): Promise<ActivityItem[]> {
  try {
    const credlyUrl = `https://www.credly.com/users/${username}/badges.json`;
    const response = await fetch(credlyUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`[Activity] Credly API returned ${response.status}`);
      return [];
    }

    // ✅ FIX: Add error handling for malformed JSON responses
    let data: CredlyBadgesResponse;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error(`[Activity] Failed to parse Credly JSON response:`, jsonError);
      return [];
    }
    const badges = data.data || [];

    // Sort by issued_at descending
    const sortedBadges = badges.sort(
      (a, b) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime()
    );

    const limitedBadges = limit ? sortedBadges.slice(0, limit) : sortedBadges;

    return limitedBadges.map((badge) => {
      const issuerName =
        badge.issuer.entities.find((e) => e.primary)?.entity.name ||
        badge.issuer.entities[0]?.entity.name ||
        'Unknown Issuer';

      return {
        id: `certification-${badge.id}`,
        source: 'certification' as const,
        verb: 'earned' as const,
        title: badge.badge_template.name,
        description: `Issued by ${issuerName}`,
        timestamp: new Date(badge.issued_at),
        href: `https://www.credly.com/badges/${badge.id}`,
        meta: {
          image: {
            url: badge.image_url,
            alt: badge.badge_template.name,
          },
          category: issuerName,
        },
      };
    });
  } catch (error) {
    console.error('[Activity] transformCredlyBadges error:', error);
    return [];
  }
}
