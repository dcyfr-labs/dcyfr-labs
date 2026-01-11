/**
 * Giscus Reactions Integration
 *
 * Fetches reaction counts from GitHub Discussions (Giscus) for activity items.
 * Extends existing comments infrastructure with reaction data.
 * Uses GraphQL API and Redis caching (15-min TTL).
 *
 * Features:
 * - Fetch reaction counts (👍 THUMBS_UP, ❤️ HEART, 🎉 HOORAY, etc.)
 * - Redis caching to minimize API calls
 * - Bulk fetching for efficiency
 * - Read-only sync (activity feed displays Giscus data)
 *
 * @module lib/giscus-reactions
 */

import siteConfig from "@/lib/site-config";
import { createClient } from "redis";

// ============================================================================
// CONSTANTS
// ============================================================================

const CACHE_TTL = 900; // 15 minutes (matches comments.ts)
const CACHE_PREFIX = "giscus:reactions:";

// GitHub Discussions reaction types
export type ReactionType =
  | "THUMBS_UP" // 👍
  | "THUMBS_DOWN" // 👎
  | "LAUGH" // 😄
  | "HOORAY" // 🎉
  | "CONFUSED" // 😕
  | "HEART" // ❤️
  | "ROCKET" // 🚀
  | "EYES"; // 👀

// ============================================================================
// TYPES
// ============================================================================

/**
 * Reaction counts for a single discussion
 */
export interface GiscusReactions {
  /** Thumbs up count (used as "likes" in activity feed) */
  thumbsUp: number;
  /** Heart count */
  heart: number;
  /** Total reactions across all types */
  total: number;
  /** Individual reaction counts by type */
  breakdown: Partial<Record<ReactionType, number>>;
}

interface ReactionGroup {
  content: ReactionType;
  reactors: {
    totalCount: number;
  };
}

interface DiscussionNode {
  title: string;
  url: string;
  reactions: {
    totalCount: number;
  };
  reactionGroups: ReactionGroup[];
}

interface DiscussionResponse {
  data?: {
    repository?: {
      discussions?: {
        nodes: DiscussionNode[];
      };
    };
  };
  errors?: Array<{ message: string }>;
}

// ============================================================================
// REDIS CLIENT
// ============================================================================

/**
 * Get Redis client with error handling (reuses pattern from comments.ts)
 */
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
    console.error("[GiscusReactions] Redis connection failed:", error);
    return null;
  }
}

/**
 * Get cached reactions from Redis
 */
async function getCachedReactions(
  activityId: string
): Promise<GiscusReactions | null> {
  const redis = await getRedisClient();
  if (!redis) return null;

  try {
    const cached = await redis.get(`${CACHE_PREFIX}${activityId}`);
    await redis.quit();
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error(
      `[GiscusReactions] Cache read failed for ${activityId}:`,
      error
    );
    return null;
  }
}

/**
 * Set cached reactions in Redis
 */
async function setCachedReactions(
  activityId: string,
  reactions: GiscusReactions
): Promise<void> {
  const redis = await getRedisClient();
  if (!redis) return;

  try {
    await redis.setEx(
      `${CACHE_PREFIX}${activityId}`,
      CACHE_TTL,
      JSON.stringify(reactions)
    );
    await redis.quit();
  } catch (error) {
    console.error(
      `[GiscusReactions] Cache write failed for ${activityId}:`,
      error
    );
  }
}

// ============================================================================
// GISCUS GRAPHQL CLIENT
// ============================================================================

/**
 * Fetch reactions for a single activity from GitHub Discussions
 *
 * @param activityId - Activity ID (e.g., "blog-nextjs-testing", "project-dcyfr-labs")
 * @param discussionPath - Giscus mapping path (e.g., "/blog/nextjs-testing")
 * @returns Reaction counts (0 if not found or error)
 */
export async function getActivityReactions(
  activityId: string,
  discussionPath: string
): Promise<GiscusReactions> {
  // Default empty reactions
  const emptyReactions: GiscusReactions = {
    thumbsUp: 0,
    heart: 0,
    total: 0,
    breakdown: {},
  };

  // Check if Giscus is fully configured (all required fields)
  if (
    !siteConfig.services.giscus.enabled ||
    !siteConfig.services.giscus.repo ||
    !siteConfig.services.giscus.categoryId
  ) {
    // Silently return empty reactions if Giscus is not configured
    // (This is expected in development/preview environments)
    return emptyReactions;
  }

  // Check cache first
  const cached = await getCachedReactions(activityId);
  if (cached !== null) {
    return cached;
  }

  // Verify GitHub token
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    // Silently return empty reactions if token is missing
    // (This is expected in development without .env.local)
    return emptyReactions;
  }

  const [owner, repo] = siteConfig.services.giscus.repo.split("/");
  if (!owner || !repo) {
    console.warn(
      "[GiscusReactions] Invalid repo format, expected 'owner/repo'"
    );
    return emptyReactions;
  }

  try {
    // GraphQL query to fetch discussion with reactions
    const query = `
      query GetDiscussionReactions($owner: String!, $repo: String!, $categoryId: String!) {
        repository(owner: $owner, name: $repo) {
          discussions(first: 10, categoryId: $categoryId, orderBy: {field: CREATED_AT, direction: DESC}) {
            nodes {
              title
              url
              reactions {
                totalCount
              }
              reactionGroups {
                content
                reactors {
                  totalCount
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${githubToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          owner,
          repo,
          categoryId: siteConfig.services.giscus.categoryId,
        },
      }),
    });

    if (!response.ok) {
      console.error(`[GiscusReactions] GitHub API error: ${response.status}`);
      return emptyReactions;
    }

    const data: DiscussionResponse = await response.json();

    // Check for GraphQL errors
    if (data.errors) {
      // Silently cache and return empty reactions on GraphQL errors
      // Common causes: Invalid categoryId, repo without Discussions enabled, or permission issues
      await setCachedReactions(activityId, emptyReactions);
      return emptyReactions;
    }

    const discussions = data.data?.repository?.discussions?.nodes || [];

    // Find discussion matching the activity (by path in title or URL)
    const discussion = discussions.find(
      (d) => d.title.includes(discussionPath) || d.url.includes(discussionPath)
    );

    if (!discussion) {
      // No discussion found, cache empty result
      await setCachedReactions(activityId, emptyReactions);
      return emptyReactions;
    }

    // Parse reaction groups
    const breakdown: Partial<Record<ReactionType, number>> = {};
    discussion.reactionGroups.forEach((group) => {
      breakdown[group.content] = group.reactors.totalCount;
    });

    const reactions: GiscusReactions = {
      thumbsUp: breakdown.THUMBS_UP || 0,
      heart: breakdown.HEART || 0,
      total: discussion.reactions.totalCount,
      breakdown,
    };

    // Cache the result
    await setCachedReactions(activityId, reactions);

    return reactions;
  } catch (error) {
    // Silently cache and return empty reactions on network/fetch errors
    // This prevents repeated failed API calls
    await setCachedReactions(activityId, emptyReactions);
    return emptyReactions;
  }
}

/**
 * Fetch reactions for multiple activities in bulk
 *
 * Optimized with Redis caching:
 * 1. Checks cache for all activity IDs first
 * 2. Only fetches uncached items from GitHub API
 * 3. Caches newly fetched results
 *
 * @param items - Array of { activityId, discussionPath }
 * @returns Map of activityId to reaction counts
 */
export async function getActivityReactionsBulk(
  items: Array<{ activityId: string; discussionPath: string }>
): Promise<Record<string, GiscusReactions>> {
  const results: Record<string, GiscusReactions> = {};
  const uncachedItems: Array<{ activityId: string; discussionPath: string }> =
    [];

  // Check cache for all items first
  for (const item of items) {
    const cached = await getCachedReactions(item.activityId);
    if (cached !== null) {
      results[item.activityId] = cached;
    } else {
      uncachedItems.push(item);
    }
  }

  // Fetch uncached items in parallel batches
  if (uncachedItems.length > 0) {
    const BATCH_SIZE = 5; // Match comments.ts rate limiting
    for (let i = 0; i < uncachedItems.length; i += BATCH_SIZE) {
      const batch = uncachedItems.slice(i, i + BATCH_SIZE);
      const reactions = await Promise.all(
        batch.map(async (item) => {
          const data = await getActivityReactions(
            item.activityId,
            item.discussionPath
          );
          return { activityId: item.activityId, reactions: data };
        })
      );

      reactions.forEach(({ activityId, reactions }) => {
        results[activityId] = reactions;
      });
    }
  }

  return results;
}

/**
 * Convert Giscus thumbsUp reactions to activity feed like count
 *
 * This is the bridge between Giscus and the activity feed.
 * We use THUMBS_UP (👍) as the primary "like" reaction.
 *
 * @param reactions - Giscus reaction data
 * @returns Like count for activity feed
 */
export function mapGiscusReactionsToLikes(reactions: GiscusReactions): number {
  return reactions.thumbsUp;
}
