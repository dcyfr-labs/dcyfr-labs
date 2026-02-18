import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import * as Sentry from '@sentry/nextjs';
import { blockExternalAccess } from '@/lib/api/api-security';
import {
  getMultiplePostViews,
  getMultiplePostViews24h,
  getMultiplePostViewsInRange,
} from '@/lib/views.server';
import { getPostSharesBulk, getPostShares24hBulk } from '@/lib/shares';
import { getPostCommentsBulk, getPostComments24hBulk } from '@/lib/comments';
import { posts } from '@/data/posts';
import { redis } from '@/mcp/shared/redis-client';
import { rateLimit, getClientIp, createRateLimitHeaders } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/error-handler';

/**
 * Security Configuration for Analytics API
 *
 * This endpoint provides sensitive analytics data and requires multi-layer protection:
 *
 * Layer 0: External Access Blocking (NEW)
 * - Uses blockExternalAccess() to block all external requests in production
 * - Returns 404 in production to avoid revealing endpoint existence
 * - Allows only internal/localhost requests in development
 *
 * Layer 1: API Key Authentication
 * - Requires ADMIN_API_KEY environment variable
 * - Key must be passed via Authorization header: "Bearer YOUR_KEY"
 * - Prevents unauthorized access even if endpoint is publicly exposed
 *
 * Layer 2: Environment Validation
 * - Checks VERCEL_ENV to prevent production exposure
 * - Allows: development, preview (with key), test
 * - Blocks: production environment entirely
 *
 * Layer 3: Rate Limiting
 * - 5 requests per minute per IP address
 * - Prevents abuse and excessive data access
 * - Uses Redis-backed rate limiting with in-memory fallback
 *
 * Layer 4: Audit Logging
 * - Logs all access attempts (success and failure)
 * - Includes timestamp, IP, user agent, endpoint params
 * - Enables security monitoring and incident response
 *
 * Configuration via environment variables:
 * - ADMIN_API_KEY: Required API key for authentication
 * - REDIS_URL: Optional Redis for rate limiting (fallback to memory)
 * - VERCEL_ENV: Auto-set by Vercel (development/preview/production)
 * - NODE_ENV: Standard Node environment (development/production)
 */

// Read REDIS_URL dynamically inside helper so tests can stub env vars later
// (Common gotcha: importing the module captures process.env at import time)

// Rate limit configuration based on environment
// Development/Preview: More generous for testing and development
// Production: Stricter limits (though production access is blocked entirely)
const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview';

const RATE_LIMIT_CONFIG = {
  limit: isDevelopment ? 60 : 10, // 60/min in dev, 10/min otherwise
  windowInSeconds: 60,
};

/**
 * Validates the API key from the Authorization header using timing-safe comparison
 *
 * Expected format: "Bearer YOUR_API_KEY"
 *
 * Uses timingSafeEqual() to prevent timing attacks that could reveal the API key
 * byte-by-byte through response time analysis.
 *
 * @param request - Incoming request with Authorization header
 * @returns true if valid key, false otherwise
 */
function validateApiKey(request: Request): boolean {
  const adminKey = process.env.ADMIN_API_KEY;

  // If no admin key is configured, deny all access
  if (!adminKey) {
    console.error('[Analytics API] ADMIN_API_KEY not configured - endpoint disabled');
    return false;
  }

  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return false;
  }

  // Support "Bearer TOKEN" format
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  // Use timing-safe comparison to prevent timing attacks
  try {
    const tokenBuf = Buffer.from(token, 'utf8');
    const keyBuf = Buffer.from(adminKey, 'utf8');

    // Ensure buffers are same length to prevent length-based timing
    if (tokenBuf.length !== keyBuf.length) {
      return false;
    }

    return timingSafeEqual(tokenBuf, keyBuf);
  } catch (error) {
    // If comparison fails (e.g., buffer creation error), deny access
    console.error('[Analytics API] Error during key validation:', error);
    return false;
  }
}

/**
 * Checks if the current environment allows analytics access
 *
 * - Development: Always allowed
 * - Preview/Test: Allowed with valid API key
 * - Production: BLOCKED (even with valid key)
 *
 * @returns true if environment is safe, false if blocked
 */
function isAllowedEnvironment(): boolean {
  const nodeEnv = process.env.NODE_ENV;
  const vercelEnv = process.env.VERCEL_ENV;

  // Block production entirely - analytics should never be exposed in production
  if (vercelEnv === 'production') {
    return false;
  }

  // Allow development and preview environments
  if (nodeEnv === 'development' || vercelEnv === 'preview' || nodeEnv === 'test') {
    return true;
  }

  // Default to blocking for safety
  return false;
}

/**
 * Logs analytics access attempts using structured JSON format for security monitoring
 *
 * Structured logging enables:
 * - Easier parsing and analysis by log aggregation tools (Axiom, Sentry)
 * - Automated alerting based on specific fields
 * - Security incident investigation and forensics
 * - Compliance audit trails
 *
 * Logs to both:
 * - Console (for Axiom/Vercel logs) - detailed analysis
 * - Sentry (for alerting) - security events only
 *
 * @param request - The incoming request
 * @param status - "success" or "denied"
 * @param reason - Reason for denial (if applicable)
 */
function logAccess(request: Request, status: 'success' | 'denied', reason?: string) {
  const url = new URL(request.url);
  const timestamp = new Date().toISOString();
  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const queryParams = url.searchParams.toString();

  const logData = {
    event: 'admin_access',
    endpoint: '/api/analytics',
    method: 'GET',
    result: status,
    reason: reason || undefined,
    timestamp,
    ip,
    userAgent,
    queryParams: queryParams || undefined,
    environment: process.env.NODE_ENV || 'unknown',
    vercelEnv: process.env.VERCEL_ENV || undefined,
  };

  // Structured JSON logging for Axiom/Vercel logs
  console.warn(JSON.stringify(logData));

  // Send security events to Sentry for alerting
  if (status === 'denied') {
    // Determine severity based on reason
    const level = reason?.includes('production') ? 'error' : 'warning';

    Sentry.captureMessage(`Admin access denied: ${reason || 'unknown'}`, {
      level,
      tags: {
        event_type: 'admin_access',
        endpoint: '/api/analytics',
        result: status,
        reason: reason || 'unknown',
        environment: process.env.NODE_ENV || 'unknown',
        vercel_env: process.env.VERCEL_ENV || 'unknown',
      },
      contexts: {
        admin_access: logData,
      },
      fingerprint: ['admin_access', '/api/analytics', status, reason || 'unknown'],
    });
  }

  // CRITICAL: Production access attempts should NEVER happen
  // Admin endpoints are blocked in production via blockExternalAccess()
  if (process.env.VERCEL_ENV === 'production') {
    Sentry.captureMessage(
      'CRITICAL: Admin endpoint accessed in production - possible security bypass!',
      {
        level: 'error',
        tags: {
          event_type: 'admin_access_production',
          endpoint: '/api/analytics',
          result: status,
          critical: 'true',
        },
        contexts: {
          admin_access: logData,
          security: {
            alert: 'Production admin access should be blocked by blockExternalAccess()',
            investigation_required: true,
          },
        },
        fingerprint: ['admin_access_production', '/api/analytics'],
      }
    );
  }
}

// Redis client removed - now using Upstash REST API singleton from @/mcp/shared/redis-client

// ---------------------------------------------------------------------------
// Private helpers to reduce cognitive complexity of GET handler
// ---------------------------------------------------------------------------

type PostWithViews = ReturnType<typeof buildPostsWithViews>[number];

function buildPostsWithViews(
  viewMap: Map<string, number>,
  views24hMap: Map<string, number>,
  viewsRangeMap: Map<string, number>,
  shareMap: Record<string, number>,
  shares24hMap: Record<string, number>,
  commentMap: Record<string, number>,
  comments24hMap: Record<string, number>
) {
  return posts
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      summary: post.summary,
      publishedAt: post.publishedAt,
      tags: post.tags,
      archived: post.archived ?? false,
      draft: post.draft ?? false,
      views: viewMap.get(post.id) || 0,
      views24h: views24hMap.get(post.id) || 0,
      viewsRange: viewsRangeMap.get(post.id) || 0,
      shares: shareMap[post.id] || 0,
      shares24h: shares24hMap[post.id] || 0,
      comments: commentMap[post.slug] || 0,
      comments24h: comments24hMap[post.slug] || 0,
      readingTime: post.readingTime,
    }))
    .sort((a, b) => b.views - a.views);
}

async function fetchTrendingFromRedis(postsWithViews: PostWithViews[]): Promise<PostWithViews[] | null> {
  try {
    const trendingData = await redis.get('blog:trending');
    if (typeof trendingData !== 'string') return null;
    const parsedTrending = JSON.parse(trendingData) as Array<{
      postId: string;
      totalViews: number;
      recentViews: number;
      score: number;
    }>;
    const enriched = parsedTrending
      .map((trending) => {
        const post = posts.find((p) => p.id === trending.postId);
        if (!post) return null;
        const fullPost = postsWithViews.find((p) => p.slug === post.slug);
        if (!fullPost) return null;
        return { ...fullPost, trendingScore: trending.score };
      })
      .filter((item): item is PostWithViews & { trendingScore: number } => item !== null);
    return enriched.length > 0 ? enriched : null;
  } catch (error) {
    console.error('Failed to fetch trending data:', error);
    return null;
  }
}

/** Parse the `?days=` query param; returns null for "all" and a validated number otherwise */
function parseDaysParam(daysParam: string | null): { days: number | null; error?: NextResponse } {
  if (daysParam === 'all' || daysParam === null) {
    return { days: daysParam === null ? 1 : null };
  }
  const parsedDays = parseInt(daysParam, 10);
  if (isNaN(parsedDays) || parsedDays < 1 || parsedDays > 365) {
    return {
      days: null,
      error: NextResponse.json(
        { error: 'Invalid days parameter', message: "Days must be a number between 1 and 365, or 'all'" },
        { status: 400 }
      ),
    };
  }
  return { days: parsedDays };
}

type PostSummaryEntry = {
  slug: string; title: string; views: number; views24h: number; viewsRange: number;
  shares: number; shares24h: number; comments: number; comments24h: number;
};

function toSummaryEntry(p: PostWithViews): PostSummaryEntry {
  return { slug: p.slug, title: p.title, views: p.views, views24h: p.views24h, viewsRange: p.viewsRange, shares: p.shares, shares24h: p.shares24h, comments: p.comments, comments24h: p.comments24h };
}

function buildAnalyticsSummary(postsWithViews: PostWithViews[]) {
  const total = (key: keyof PostWithViews) =>
    postsWithViews.reduce((sum, p) => sum + (p[key] as number), 0);

  const totalViews = total('views');
  const totalViews24h = total('views24h');
  const totalViewsRange = total('viewsRange');
  const totalShares = total('shares');
  const totalShares24h = total('shares24h');
  const totalComments = total('comments');
  const totalComments24h = total('comments24h');
  const n = postsWithViews.length;

  const avg = (v: number) => Math.round(n > 0 ? v / n : 0);

  const topPost = postsWithViews[0];
  const sorted = (key: keyof PostWithViews) => [...postsWithViews].sort((a, b) => (b[key] as number) - (a[key] as number))[0];

  return {
    totalPosts: n, totalViews, totalViews24h, totalViewsRange, totalShares, totalShares24h, totalComments, totalComments24h,
    averageViews: avg(totalViews), averageViews24h: avg(totalViews24h),
    averageViewsRange: avg(totalViewsRange), averageShares: avg(totalShares),
    averageShares24h: avg(totalShares24h), averageComments: avg(totalComments),
    averageComments24h: avg(totalComments24h),
    topPost: topPost ? toSummaryEntry(topPost) : null,
    topPost24h: toSummaryEntry(sorted('views24h')),
    topPostRange: toSummaryEntry(sorted('viewsRange')),
    mostSharedPost: toSummaryEntry(sorted('shares')),
    mostSharedPost24h: toSummaryEntry(sorted('shares24h')),
    mostCommentedPost: toSummaryEntry(sorted('comments')),
    mostCommentedPost24h: toSummaryEntry(sorted('comments24h')),
  };
}


async function fetchVercelDataFromRedis(): Promise<{
  vercelData: {
    topPages: unknown[];
    topReferrers: unknown[];
    topDevices: unknown[];
  } | null;
  vercelLastSynced: string | null;
}> {
  try {
    const [vPages, vReferrers, vDevices, vSynced] = await Promise.all([
      redis.get('vercel:topPages:daily'),
      redis.get('vercel:topReferrers:daily'),
      redis.get('vercel:topDevices:daily'),
      redis.get('vercel:metrics:lastSynced'),
    ]);
    return {
      vercelData: {
        topPages: vPages && typeof vPages === 'string' ? JSON.parse(vPages) : [],
        topReferrers: vReferrers && typeof vReferrers === 'string' ? JSON.parse(vReferrers) : [],
        topDevices: vDevices && typeof vDevices === 'string' ? JSON.parse(vDevices) : [],
      },
      vercelLastSynced: typeof vSynced === 'string' ? vSynced : null,
    };
  } catch (error) {
    console.error('Failed to fetch vercel analytics from redis:', error);
    return { vercelData: null, vercelLastSynced: null };
  }
}

export async function GET(request: NextRequest) {
  // Layer 0: Block external access for security
  const blockResponse = blockExternalAccess(request);
  if (blockResponse) return blockResponse;

  // Layer 1: Environment validation
  if (!isAllowedEnvironment()) {
    logAccess(request, 'denied', 'production environment blocked');
    return NextResponse.json(
      {
        error: 'Analytics not available in production',
        message: 'This endpoint is disabled in production for security reasons',
      },
      { status: 403 }
    );
  }

  // Layer 2: API key authentication
  if (!validateApiKey(request)) {
    logAccess(request, 'denied', 'invalid or missing API key');
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: 'Valid API key required. Use Authorization header with Bearer token.',
      },
      { status: 401 }
    );
  }

  // Layer 3: Rate limiting (5 requests per minute)
  const clientIp = getClientIp(request);
  const rateLimitResult = await rateLimit(clientIp, RATE_LIMIT_CONFIG);

  if (!rateLimitResult.success) {
    logAccess(request, 'denied', 'rate limit exceeded');
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: 'Maximum 5 requests per minute. Please try again later.',
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          ...createRateLimitHeaders(rateLimitResult),
          'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // Layer 4: Log successful access
  logAccess(request, 'success');

  try {
    // Get date range parameter from URL
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days');

    // Validate days parameter
    const { days, error: daysError } = parseDaysParam(daysParam);
    if (daysError) return daysError;

    // Get view counts for all posts using their stable post IDs
    const postIds = posts.map((p) => p.id);
    const viewMap = await getMultiplePostViews(postIds);
    const views24hMap = await getMultiplePostViews24h(postIds);
    const viewsRangeMap = await getMultiplePostViewsInRange(postIds, days);

    // Get share counts for all posts
    const shareMap = await getPostSharesBulk(postIds);
    const shares24hMap = await getPostShares24hBulk(postIds);

    // Get comment counts for all posts (by slug)
    const postSlugs = posts.map((p) => p.slug);
    const commentMap = await getPostCommentsBulk(postSlugs);
    const comments24hMap = await getPostComments24hBulk(postSlugs);

    // Combine with post data
    const postsWithViews = buildPostsWithViews(
      viewMap, views24hMap, viewsRangeMap,
      shareMap, shares24hMap, commentMap, comments24hMap
    );

    const summary = buildAnalyticsSummary(postsWithViews);
    const trendingPosts = postsWithViews.slice(0, 5);

    // Enrich trending data from Redis (falls back to top 5 by views)
    const trendingFromRedis = await fetchTrendingFromRedis(postsWithViews);

    // Fetch Vercel analytics sync data from Redis (optional)
    const { vercelData, vercelLastSynced } = await fetchVercelDataFromRedis();

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        dateRange: days === null ? 'all' : `${days}d`,
        summary,
        posts: postsWithViews,
        trending: trendingFromRedis || trendingPosts,
        vercel: vercelData,
        vercelLastSynced: vercelLastSynced,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          ...createRateLimitHeaders(rateLimitResult),
        },
      }
    );
  } catch (error) {
    const errorInfo = handleApiError(error, {
      route: '/api/analytics',
      method: 'GET',
    });

    // For connection errors, return minimal response
    if (errorInfo.isConnectionError) {
      return new Response(null, { status: errorInfo.statusCode });
    }

    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: errorInfo.statusCode }
    );
  }
}
