/**
 * Server-Only Activity Source Transformers
 *
 * This file contains async transformers that require Node.js APIs (Redis, etc.)
 * and can only be used in server components and API routes.
 *
 * ⚠️ DO NOT import this file in client components!
 * Use sources.ts for client-safe transformers.
 */

import type { Post } from "@/data/posts";
import type { ActivityItem } from "./types";
import type { CredlyBadge, CredlyBadgesResponse } from "@/types/credly";
import { getMultiplePostViews } from "@/lib/views";
import { getPostCommentsBulk } from "@/lib/comments";
import { createClient } from "redis";

// ============================================================================
// REDIS CLIENT
// ============================================================================

const redisUrl = process.env.REDIS_URL;

async function getRedisClient() {
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
    console.error("[Activity] Redis connection failed:", error);
    return null;
  }
}

// ============================================================================
// BLOG POST TRANSFORMER (WITH VIEW COUNTS)
// ============================================================================

/**
 * Transform blog posts into activity items with view counts from Redis
 * Server-only version with enriched data
 */
export async function transformPostsWithViews(posts: Post[]): Promise<ActivityItem[]> {
  const publishedPosts = posts.filter((p) => !p.archived && !p.draft);
  const postIds = publishedPosts.map((p) => p.id);

  // Fetch view counts in bulk
  let viewsMap: Map<string, number>;
  try {
    viewsMap = await getMultiplePostViews(postIds);
  } catch (error) {
    console.error("[Activity] Failed to fetch view counts:", error);
    viewsMap = new Map();
  }

  return publishedPosts.map((post) => {
    const views = viewsMap.get(post.id) || undefined;
    const verb = post.updatedAt ? ("updated" as const) : ("published" as const);

    return {
      id: `blog-${post.id}`,
      source: "blog" as const,
      verb,
      title: post.title,
      description: post.summary,
      timestamp: new Date(post.updatedAt || post.publishedAt),
      href: `/blog/${post.slug}`,
      meta: {
        tags: post.tags.slice(0, 3),
        category: post.category,
        image: post.image
          ? { url: post.image.url, alt: post.image.alt || post.image.caption || post.title }
          : undefined,
        readingTime: post.readingTime?.text,
        stats: views ? { views } : undefined,
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
): { valid: TrendingPost[]; warnings: string[]; source: "redis" | "fallback" } {
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
    warnings.push("No valid trending posts found");
  }

  return {
    valid: validTrending,
    warnings,
    source: "redis",
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
  limit = 10,
  options?: { after?: Date; before?: Date; description?: string }
): Promise<ActivityItem[]> {
  const redis = await getRedisClient();
  let trending: TrendingPost[] | null = null;
  let trendingSource: "redis" | "fallback" = "fallback";

  // Try to fetch from Redis first
  if (redis) {
    try {
      const trendingData = await redis.get("blog:trending");

      if (trendingData) {
        try {
          const parsed = JSON.parse(trendingData);
          
          // Double validation: check if data is valid
          if (Array.isArray(parsed) && parsed.length > 0) {
            trending = parsed;
            trendingSource = "redis";
            console.log(`[Activity] Successfully fetched ${trending.length} trending posts from Redis`);
          } else {
            // This is expected when trending data hasn't been populated yet
            // (e.g., first deployment, or after Redis reset)
            console.log("[Activity] Redis trending data not yet populated, using fallback");
          }
        } catch (parseError) {
          console.error("[Activity] Failed to parse trending data from Redis:", parseError);
        }
      } else {
        // This is expected when trending data hasn't been populated yet
        console.log("[Activity] No trending data in Redis yet (key: blog:trending), using fallback");
      }

      await redis.quit();
    } catch (error) {
      console.error("[Activity] Failed to fetch trending posts from Redis:", error);
      if (error instanceof Error && error.message.includes("ECONNREFUSED")) {
        console.warn("[Activity] Redis connection refused - likely offline");
      }
    }
  } else {
    console.log("[Activity] Redis client unavailable (REDIS_URL not configured), using fallback");
  }

  // Fallback: use most recent published posts if Redis is unavailable or invalid
  if (!trending) {
    const validPosts = posts.filter((p) => !p.archived && !p.draft);
    const sorted = validPosts
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);

    trending = sorted.map((post) => ({
      postId: post.id,
      totalViews: 0,
      recentViews: 0,
      score: 0,
    }));

    trendingSource = "fallback";
    console.log(
      `[Activity] Using fallback: ${trending.length} most recent posts (Redis unavailable)`
    );
  }

  // Double validation: validate the trending data
  const validation = validateTrendingData(trending, posts);

  // Only log warnings if they indicate actual data quality issues
  // Filter out informational warnings about missing view counts (expected for fallback data)
  const criticalWarnings = validation.warnings.filter(
    (w) => !w.includes("missing view counts")
  );

  if (criticalWarnings.length > 0) {
    console.warn(
      `[Activity] Trending data validation warnings (${trendingSource}):`,
      criticalWarnings
    );
  }

  const trendingActivities: ActivityItem[] = [];

  for (const item of validation.valid.slice(0, limit)) {
    const post = posts.find((p) => p.id === item.postId);
    if (!post || post.archived || post.draft) continue;

    // Filter by date range if provided
    const postDate = new Date(post.publishedAt);
    if (options?.after && postDate < options.after) continue;
    if (options?.before && postDate > options.before) continue;

    // Build description with view stats
    let description: string;
    if (options?.description) {
      // Custom description base - add view stats if available
      if (item.recentViews > 0) {
        description = `${options.description} with ${item.recentViews.toLocaleString()} views in the last 7 days`;
      } else {
        description = options.description;
      }
    } else {
      // Default description
      description = item.recentViews > 0
        ? `Trending with ${item.recentViews.toLocaleString()} views in the last 7 days`
        : `Recently published`;
    }

    // Determine timestamp based on trending period
    // - Weekly trending: use start of this week
    // - Monthly trending: use start of this month
    // - All time: use current time (will appear in "Today")
    let timestamp: Date;
    const now = new Date();
    
    if (options?.after) {
      // Monthly trending - use start of month
      timestamp = options.after;
    } else if (options?.before) {
      // All time trending - use current time
      timestamp = now;
    } else {
      // Weekly trending - use start of this week (Monday)
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      timestamp = new Date(now.getFullYear(), now.getMonth(), diff);
    }

    trendingActivities.push({
      id: `trending-${post.id}-${Date.now()}`,
      source: "trending" as const,
      verb: "updated" as const,
      title: post.title,
      description,
      timestamp,
      href: `/blog/${post.slug}`,
      meta: {
        tags: post.tags.slice(0, 3),
        category: post.category,
        image: post.image
          ? { url: post.image.url, alt: post.image.alt || post.image.caption || post.title }
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
export async function transformMilestones(
  posts: Post[],
  limit = 10
): Promise<ActivityItem[]> {
  const redis = await getRedisClient();
  if (!redis) return [];

  try {
    // Scan for all milestone keys
    const keys: string[] = [];
    let cursor = "0";

    do {
      const result = await redis.scan(cursor, {
        MATCH: "blog:milestone:*",
        COUNT: 100,
      });
      cursor = result.cursor.toString();
      keys.push(...result.keys);
    } while (cursor !== "0");

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
        source: "milestone" as const,
        verb: "achieved" as const,
        title: `${post.title} reached ${parseInt(milestoneCount, 10).toLocaleString()} views`,
        description: post.summary,
        timestamp: new Date(timestamp),
        href: `/blog/${post.slug}`,
        meta: {
          tags: post.tags.slice(0, 3),
          category: post.category,
          image: post.image
            ? { url: post.image.url, alt: post.image.alt || post.image.caption || post.title }
            : undefined,
          stats: {
            views: parseInt(milestoneCount, 10),
          },
          milestone: parseInt(milestoneCount, 10),
        },
      });
    }

    await redis.quit();

    return milestoneActivities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  } catch (error) {
    console.error("[Activity] Failed to fetch milestones:", error);
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
function calculateEngagementRate(
  views: number,
  shares: number,
  comments: number
): number {
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
  limit = 10
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
      .sort((a, b) => b.engagementRate - a.engagementRate)
      .slice(0, limit);

    return engagementData.map((data) => ({
      id: `engagement-${data.post.id}-${Date.now()}`,
      source: "engagement" as const,
      verb: "updated" as const,
      title: data.post.title,
      description: `High engagement: ${data.engagementRate.toFixed(1)}% engagement rate with ${data.comments} comments`,
      timestamp: new Date(data.post.updatedAt || data.post.publishedAt),
      href: `/blog/${data.post.slug}`,
      meta: {
        tags: data.post.tags.slice(0, 3),
        category: data.post.category,
        image: data.post.image
          ? { url: data.post.image.url, alt: data.post.image.alt || data.post.image.caption || data.post.title }
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
    console.error("[Activity] Failed to fetch high engagement posts:", error);
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
  limit = 10
): Promise<ActivityItem[]> {
  const publishedPosts = posts.filter((p) => !p.archived && !p.draft);
  const postSlugs = publishedPosts.map((p) => p.slug);

  try {
    const commentsMap = await getPostCommentsBulk(postSlugs);

    const milestones = publishedPosts
      .map((post) => {
        const commentCount = commentsMap[post.slug] || 0;
        
        // Find the highest milestone reached
        const milestone = COMMENT_MILESTONES.filter(
          (m) => commentCount >= m
        ).pop();

        if (!milestone) return null;

        return {
          post,
          commentCount,
          milestone,
        };
      })
      .filter((data): data is NonNullable<typeof data> => data !== null)
      .sort((a, b) => b.milestone - a.milestone)
      .slice(0, limit);

    return milestones.map((data) => ({
      id: `comment-milestone-${data.post.id}-${data.milestone}`,
      source: "milestone" as const,
      verb: "achieved" as const,
      title: `${data.post.title} reached ${data.milestone} comments`,
      description: data.post.summary,
      timestamp: new Date(data.post.updatedAt || data.post.publishedAt),
      href: `/blog/${data.post.slug}`,
      meta: {
        tags: data.post.tags.slice(0, 3),
        category: data.post.category,
        image: data.post.image
          ? { url: data.post.image.url, alt: data.post.image.alt || data.post.image.caption || data.post.title }
          : undefined,
        stats: {
          comments: data.commentCount,
        },
        milestone: data.milestone,
      },
    }));
  } catch (error) {
    console.error("[Activity] Failed to fetch comment milestones:", error);
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
 * Transform GitHub activity (commits, releases) into activity items
 * Fetches from dcyfr-labs organization
 */
export async function transformGitHubActivity(
  org = "dcyfr",
  repos = ["dcyfr-labs"],
  limit = 10
): Promise<ActivityItem[]> {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.warn("[Activity] GITHUB_TOKEN not configured, GitHub activity unavailable");
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
            Accept: "application/vnd.github.v3+json",
          },
          next: { revalidate: 300 }, // Cache for 5 minutes
        }
      );

      if (commitsResponse.ok) {
        const commits: GitHubCommit[] = await commitsResponse.json();
        
        activities.push(
          ...commits.map((commit) => ({
            id: `github-commit-${commit.sha}`,
            source: "github" as const,
            verb: "committed" as const,
            title: commit.commit.message.split("\n")[0], // First line only
            description: `Committed to ${repo}`,
            timestamp: new Date(commit.commit.author.date),
            href: commit.html_url,
            meta: {
              category: "Commit",
            },
          }))
        );
      } else if (commitsResponse.status === 401) {
        console.error("[Activity] GitHub API authentication failed (401) - check GITHUB_TOKEN validity");
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
            Accept: "application/vnd.github.v3+json",
          },
          next: { revalidate: 300 }, // Cache for 5 minutes
        }
      );

      if (releasesResponse.ok) {
        const releases: GitHubRelease[] = await releasesResponse.json();
        
        activities.push(
          ...releases.map((release) => ({
            id: `github-release-${release.id}`,
            source: "github" as const,
            verb: "released" as const,
            title: release.name || release.tag_name,
            description: release.body?.split("\n")[0] || `Released ${release.tag_name}`,
            timestamp: new Date(release.published_at),
            href: release.html_url,
            meta: {
              category: "Release",
              version: release.tag_name,
            },
          }))
        );
      } else if (releasesResponse.status === 401) {
        console.error("[Activity] GitHub API authentication failed (401) - check GITHUB_TOKEN validity");
        return []; // Stop processing if auth fails
      } else {
        console.warn(`[Activity] Failed to fetch releases for ${repo}: ${releasesResponse.status}`);
      }
    }

    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  } catch (error) {
    console.error("[Activity] Failed to fetch GitHub activity:", error);
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
  username: string = "dcyfr",
  limit: number = 10
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

    const data: CredlyBadgesResponse = await response.json();
    const badges = data.data || [];

    // Sort by issued_at descending and limit
    const sortedBadges = badges
      .sort((a, b) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime())
      .slice(0, limit);

    return sortedBadges.map((badge) => {
      const issuerName = badge.issuer.entities.find(e => e.primary)?.entity.name || 
        badge.issuer.entities[0]?.entity.name || 
        "Unknown Issuer";

      return {
        id: `certification-${badge.id}`,
        source: "certification" as const,
        verb: "earned" as const,
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
    console.error("[Activity] transformCredlyBadges error:", error);
    return [];
  }
}
