/**
 * DEV.to Analytics Integration
 *
 * Fetches engagement metrics from DEV.to API (free tier).
 * Rate limit: 10 requests/minute (sufficient for our needs).
 *
 * @see https://developers.forem.com/api/v1
 *
 * @example
 * ```typescript
 * const article = await fetchDevToArticle('dcyfr', 'my-article-slug');
 * const metrics = await fetchDevToMetrics('post-123', 'my-article-slug');
 * ```
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * DEV.to Article Response
 * @see https://developers.forem.com/api/v1#tag/articles/operation/getArticleById
 */
export interface DevToArticle {
  /** DEV.to article ID */
  id: number;
  /** Article title */
  title: string;
  /** Article slug (URL-friendly) */
  slug: string;
  /** Full article URL */
  url: string;
  /** Published timestamp */
  published_at: string;
  /** Page view count */
  page_views_count: number;
  /** Reactions count (hearts, unicorns, etc.) */
  public_reactions_count: number;
  /** Comments count */
  comments_count: number;
  /** Article tags */
  tag_list: string[];
  /** Reading time in minutes */
  reading_time_minutes?: number;
  /** Cover image URL */
  cover_image?: string;
  /** Article description/summary */
  description?: string;
}

/**
 * Processed DEV.to Metrics
 * Internal format for storage
 */
export interface DevToMetrics {
  /** Our internal post ID */
  postId: string;
  /** DEV.to article slug */
  devSlug: string;
  /** DEV.to article ID */
  devId: number;
  /** Page views */
  pageViews: number;
  /** Total reactions */
  reactions: number;
  /** Comments count */
  comments: number;
  /** When article was published on DEV */
  publishedAt: Date;
  /** Last time we fetched these metrics */
  lastFetchedAt: Date;
  /** Article URL on DEV.to */
  url: string;
}

/**
 * DEV.to API Error Response
 */
export interface DevToError {
  error: string;
  status: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** DEV.to API base URL */
const DEV_TO_API_BASE = 'https://dev.to/api';

/** Default DEV.to username */
const DEFAULT_USERNAME = 'dcyfr';

/** Rate limit buffer (requests per minute) */
const RATE_LIMIT = 10;

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Fetch a single DEV.to article by username and slug
 *
 * @param username - DEV.to username (default: 'dcyfr')
 * @param slug - Article slug
 * @returns Article data or null if not found
 *
 * @example
 * ```typescript
 * const article = await fetchDevToArticle('dcyfr', 'building-with-nextjs');
 * if (article) {
 *   console.log(`${article.title} has ${article.page_views_count} views`);
 * }
 * ```
 */
export async function fetchDevToArticle(
  username: string = DEFAULT_USERNAME,
  slug: string
): Promise<DevToArticle | null> {
  // Validate inputs to prevent SSRF - only allow alphanumeric, hyphens, underscores
  const safeUsernamePattern = /^[a-zA-Z0-9_-]+$/;
  const safeSlugPattern = /^[a-zA-Z0-9_-]+$/;
  
  if (!safeUsernamePattern.test(username)) {
    console.error('[DEV.to] Invalid username format');
    return null;
  }
  
  if (!safeSlugPattern.test(slug)) {
    console.error('[DEV.to] Invalid slug format');
    return null;
  }
  
  try {
    // lgtm[js/request-forgery] - URL is constructed from validated inputs (username/slug validated above)
    // using strict alphanumeric pattern. DEV_TO_API_BASE is a hardcoded constant.
    const response = await fetch(`${DEV_TO_API_BASE}/articles/${username}/${slug}`, {
      headers: {
        'Content-Type': 'application/json',
        // No API key needed for public article endpoints
      },
      next: {
        revalidate: 3600, // Cache for 1 hour
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Inputs already validated above, safe to log
        console.warn('[DEV.to] Article not found:', { username, slug });
        return null;
      }

      const error = await response.text();
      console.error('[DEV.to] API error:', { status: response.status, error });
      return null;
    }

    const data = await response.json();
    return data as DevToArticle;
  } catch (error) {
    console.error('[DEV.to] Fetch error:', error);
    return null;
  }
}

/**
 * Fetch DEV.to metrics for a blog post
 *
 * @param postId - Internal blog post ID
 * @param devSlug - DEV.to article slug
 * @param username - DEV.to username (default: 'dcyfr')
 * @returns Processed metrics or null if unavailable
 *
 * @example
 * ```typescript
 * const metrics = await fetchDevToMetrics(
 *   'post-123',
 *   'building-with-nextjs',
 *   'dcyfr'
 * );
 *
 * if (metrics) {
 *   console.log(`Views: ${metrics.pageViews}`);
 *   console.log(`Reactions: ${metrics.reactions}`);
 *   console.log(`Comments: ${metrics.comments}`);
 * }
 * ```
 */
export async function fetchDevToMetrics(
  postId: string,
  devSlug: string,
  username: string = DEFAULT_USERNAME
): Promise<DevToMetrics | null> {
  const article = await fetchDevToArticle(username, devSlug);
  if (!article) {
    return null;
  }

  return {
    postId,
    devSlug,
    devId: article.id,
    pageViews: article.page_views_count,
    reactions: article.public_reactions_count,
    comments: article.comments_count,
    publishedAt: new Date(article.published_at),
    lastFetchedAt: new Date(),
    url: article.url,
  };
}

/**
 * Fetch metrics for multiple articles in batch
 *
 * @param articles - Array of { postId, devSlug } pairs
 * @param username - DEV.to username (default: 'dcyfr')
 * @returns Array of metrics (nulls for failed fetches)
 *
 * @example
 * ```typescript
 * const results = await fetchDevToMetricsBatch([
 *   { postId: 'post-1', devSlug: 'article-1' },
 *   { postId: 'post-2', devSlug: 'article-2' },
 * ]);
 *
 * results.forEach(metrics => {
 *   if (metrics) {
 *     console.log(`${metrics.postId}: ${metrics.pageViews} views`);
 *   }
 * });
 * ```
 */
export async function fetchDevToMetricsBatch(
  articles: Array<{ postId: string; devSlug: string }>,
  username: string = DEFAULT_USERNAME
): Promise<Array<DevToMetrics | null>> {
  // Respect rate limit: process in batches of 10 per minute
  const batchSize = RATE_LIMIT;
  const results: Array<DevToMetrics | null> = [];

  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);

    // Fetch batch in parallel
    const batchResults = await Promise.all(
      batch.map(({ postId, devSlug }) =>
        fetchDevToMetrics(postId, devSlug, username)
      )
    );

    results.push(...batchResults);

    // Wait 60 seconds before next batch (rate limit)
    if (i + batchSize < articles.length) {
      console.warn(`[DEV.to] Rate limit wait: 60 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }

  return results;
}

/**
 * Get DEV.to article URL
 *
 * @param username - DEV.to username
 * @param slug - Article slug
 * @returns Full DEV.to article URL
 *
 * @example
 * ```typescript
 * const url = getDevToUrl('dcyfr', 'my-article');
 * // Returns: https://dev.to/dcyfr/my-article
 * ```
 */
export function getDevToUrl(username: string, slug: string): string {
  return `https://dev.to/${username}/${slug}`;
}

/**
 * Validate DEV.to slug format
 *
 * @param slug - Article slug to validate
 * @returns true if valid DEV.to slug
 *
 * @example
 * ```typescript
 * isValidDevSlug('my-article-123'); // true
 * isValidDevSlug('My Article!'); // false
 * ```
 */
export function isValidDevSlug(slug: string): boolean {
  // DEV.to slugs: lowercase, numbers, hyphens only
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 100;
}

/**
 * Extract engagement rate from metrics
 *
 * @param metrics - DEV.to metrics
 * @returns Engagement rate (reactions + comments / views)
 *
 * @example
 * ```typescript
 * const rate = getEngagementRate(metrics);
 * console.log(`Engagement: ${(rate * 100).toFixed(2)}%`);
 * ```
 */
export function getEngagementRate(metrics: DevToMetrics): number {
  if (metrics.pageViews === 0) {
    return 0;
  }

  const engagements = metrics.reactions + metrics.comments;
  return engagements / metrics.pageViews;
}

/**
 * Check if metrics are stale (need refetching)
 *
 * @param metrics - DEV.to metrics
 * @param maxAgeHours - Maximum age in hours (default: 6)
 * @returns true if metrics should be refetched
 *
 * @example
 * ```typescript
 * if (areMetricsStale(metrics)) {
 *   const fresh = await fetchDevToMetrics(postId, devSlug);
 * }
 * ```
 */
export function areMetricsStale(
  metrics: DevToMetrics,
  maxAgeHours: number = 6
): boolean {
  const now = Date.now();
  const lastFetched = metrics.lastFetchedAt.getTime();
  const ageHours = (now - lastFetched) / (1000 * 60 * 60);

  return ageHours >= maxAgeHours;
}
