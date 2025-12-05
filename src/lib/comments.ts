/**
 * Comments Analytics Utilities
 * 
 * Fetches comment counts from GitHub Discussions (Giscus) for blog posts.
 * Uses GitHub GraphQL API to query discussion comments by post slug.
 * Implements Redis caching to optimize performance and reduce API calls.
 * 
 * @module lib/comments
 */

import siteConfig from "@/lib/site-config";
import { createClient } from "redis";

const CACHE_TTL = 900; // 15 minutes
const CACHE_PREFIX = "comments:";

interface DiscussionNode {
  title: string;
  comments: {
    totalCount: number;
  };
  createdAt: string;
}

interface DiscussionResponse {
  data?: {
    repository?: {
      discussions?: {
        nodes: DiscussionNode[];
      };
    };
  };
}

/**
 * Get Redis client with error handling
 */
async function getRedisClient() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return null;

  try {
    const client = createClient({ 
      url: redisUrl,
      socket: {
        connectTimeout: 5000,      // 5s connection timeout
        reconnectStrategy: (retries) => {
          if (retries > 3) return new Error('Max retries exceeded');
          return Math.min(retries * 100, 3000); // Exponential backoff, max 3s
        },
      },
    });
    if (!client.isOpen) {
      await client.connect();
    }
    return client;
  } catch (error) {
    console.error("[Comments] Redis connection failed:", error);
    return null;
  }
}

/**
 * Get cached comment count from Redis
 */
async function getCachedCommentCount(slug: string): Promise<number | null> {
  const redis = await getRedisClient();
  if (!redis) return null;

  try {
    const cached = await redis.get(`${CACHE_PREFIX}${slug}`);
    await redis.quit();
    return cached ? parseInt(cached, 10) : null;
  } catch (error) {
    console.error(`[Comments] Cache read failed for ${slug}:`, error);
    return null;
  }
}

/**
 * Set cached comment count in Redis
 */
async function setCachedCommentCount(slug: string, count: number): Promise<void> {
  const redis = await getRedisClient();
  if (!redis) return;

  try {
    await redis.setEx(`${CACHE_PREFIX}${slug}`, CACHE_TTL, count.toString());
    await redis.quit();
  } catch (error) {
    console.error(`[Comments] Cache write failed for ${slug}:`, error);
  }
}

/**
 * Fetches comment count for a single post from GitHub Discussions
 * Uses Redis caching to minimize API calls
 * 
 * @param slug - Post slug used as discussion title/mapping
 * @returns Comment count (0 if not found or error)
 */
async function getPostCommentCount(slug: string): Promise<number> {
  if (!siteConfig.services.giscus.enabled || !siteConfig.services.giscus.repo) {
    return 0;
  }

  // Check cache first
  const cached = await getCachedCommentCount(slug);
  if (cached !== null) {
    return cached;
  }

  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.warn("[Comments] GITHUB_TOKEN not configured, comment counts unavailable");
    return 0;
  }

  const [owner, repo] = siteConfig.services.giscus.repo.split("/");

  try {
    const query = `
      query GetDiscussionComments($owner: String!, $repo: String!, $searchQuery: String!) {
        repository(owner: $owner, name: $repo) {
          discussions(first: 1, categoryId: "${siteConfig.services.giscus.categoryId}", orderBy: {field: CREATED_AT, direction: DESC}) {
            nodes {
              title
              comments {
                totalCount
              }
              createdAt
            }
          }
        }
      }
    `;

    // Giscus maps blog posts to discussions by pathname or title
    // Using pathname mapping: /blog/{slug}
    const searchPath = `/blog/${slug}`;

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
          searchQuery: searchPath,
        },
      }),
    });

    if (!response.ok) {
      console.error(`[Comments] GitHub API error: ${response.status}`);
      return 0;
    }

    const data: DiscussionResponse = await response.json();
    const discussions = data.data?.repository?.discussions?.nodes || [];
    
    // Find discussion matching the post slug in title
    const discussion = discussions.find((d) => d.title.includes(slug));
    const count = discussion?.comments.totalCount || 0;
    
    // Cache the result
    await setCachedCommentCount(slug, count);
    
    return count;
  } catch (error) {
    console.error(`[Comments] Failed to fetch comment count for ${slug}:`, error);
    return 0;
  }
}

/**
 * Fetches comment counts for multiple posts in bulk
 * 
 * Optimized with Redis caching:
 * 1. Checks cache for all slugs first
 * 2. Only fetches uncached slugs from GitHub API
 * 3. Caches newly fetched results
 * 
 * @param slugs - Array of post slugs
 * @returns Map of slug to comment count
 */
export async function getPostCommentsBulk(
  slugs: string[]
): Promise<Record<string, number>> {
  const results: Record<string, number> = {};
  const uncachedSlugs: string[] = [];

  // Check cache for all slugs first
  for (const slug of slugs) {
    const cached = await getCachedCommentCount(slug);
    if (cached !== null) {
      results[slug] = cached;
    } else {
      uncachedSlugs.push(slug);
    }
  }

  // Fetch uncached slugs in parallel batches
  if (uncachedSlugs.length > 0) {
    const BATCH_SIZE = 5; // Reduced for better rate limiting
    for (let i = 0; i < uncachedSlugs.length; i += BATCH_SIZE) {
      const batch = uncachedSlugs.slice(i, i + BATCH_SIZE);
      const counts = await Promise.all(
        batch.map(async (slug) => {
          const count = await getPostCommentCount(slug);
          return { slug, count };
        })
      );

      counts.forEach(({ slug, count }) => {
        results[slug] = count;
      });
    }
  }

  return results;
}

/**
 * Fetches comment counts for the last 24 hours
 * 
 * Note: This is a simplified implementation that returns 0 for all posts
 * since GitHub Discussions API doesn't provide time-based comment filtering.
 * A full implementation would require:
 * 1. Fetching all comments for each discussion
 * 2. Filtering by createdAt timestamp
 * 3. Caching results in Redis
 * 
 * @param slugs - Array of post slugs
 * @returns Map of slug to 24h comment count (currently returns 0)
 */
export async function getPostComments24hBulk(
  slugs: string[]
): Promise<Record<string, number>> {
  // Simplified: return 0 for all posts
  // TODO: Implement actual 24h filtering if needed
  return slugs.reduce(
    (acc, slug) => {
      acc[slug] = 0;
      return acc;
    },
    {} as Record<string, number>
  );
}
