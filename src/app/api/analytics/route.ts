import { NextResponse } from "next/server";
import { getMultiplePostViews, getMultiplePostViews24h, getMultiplePostViewsInRange } from "@/lib/views";
import { getPostSharesBulk, getPostShares24hBulk } from "@/lib/shares";
import { getPostCommentsBulk, getPostComments24hBulk } from "@/lib/comments";
import { posts } from "@/data/posts";
import { createClient } from "redis";
import { rateLimit, getClientIp, createRateLimitHeaders } from "@/lib/rate-limit";
import { handleApiError } from "@/lib/error-handler";

/**
 * Security Configuration for Analytics API
 * 
 * This endpoint provides sensitive analytics data and requires multi-layer protection:
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

const redisUrl = process.env.REDIS_URL;

// Rate limit configuration based on environment
// Development/Preview: More generous for testing and development
// Production: Stricter limits (though production access is blocked entirely)
const isDevelopment = process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview";

const RATE_LIMIT_CONFIG = {
  limit: isDevelopment ? 60 : 10,  // 60/min in dev, 10/min otherwise
  windowInSeconds: 60,
};

/**
 * Validates the API key from the Authorization header
 * 
 * Expected format: "Bearer YOUR_API_KEY"
 * 
 * @param request - Incoming request with Authorization header
 * @returns true if valid key, false otherwise
 */
function validateApiKey(request: Request): boolean {
  const adminKey = process.env.ADMIN_API_KEY;
  
  // If no admin key is configured, deny all access
  if (!adminKey) {
    console.error("[Analytics API] ADMIN_API_KEY not configured - endpoint disabled");
    return false;
  }

  const authHeader = request.headers.get("Authorization");
  
  if (!authHeader) {
    return false;
  }

  // Support "Bearer TOKEN" format
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  return token === adminKey;
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
  if (vercelEnv === "production") {
    return false;
  }

  // Allow development and preview environments
  if (nodeEnv === "development" || vercelEnv === "preview" || nodeEnv === "test") {
    return true;
  }

  // Default to blocking for safety
  return false;
}

/**
 * Logs analytics access attempts for security monitoring
 * 
 * @param request - The incoming request
 * @param status - "success" or "denied"
 * @param reason - Reason for denial (if applicable)
 */
function logAccess(request: Request, status: "success" | "denied", reason?: string) {
  const url = new URL(request.url);
  const timestamp = new Date().toISOString();
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "unknown";
  const queryParams = url.searchParams.toString();

  console.log(
    `[Analytics API] ${status.toUpperCase()} - ${timestamp} - IP: ${ip} - ${userAgent} - ${
      queryParams ? `?${queryParams}` : "no params"
    }${reason ? ` - ${reason}` : ""}`
  );
}

async function getRedisClient() {
  if (!redisUrl) return null;

  try {
    const client = createClient({ url: redisUrl });
    if (!client.isOpen) {
      await client.connect();
    }
    return client;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  // Layer 1: Environment validation
  if (!isAllowedEnvironment()) {
    logAccess(request, "denied", "production environment blocked");
    return NextResponse.json(
      { 
        error: "Analytics not available in production",
        message: "This endpoint is disabled in production for security reasons"
      },
      { status: 403 }
    );
  }

  // Layer 2: API key authentication
  if (!validateApiKey(request)) {
    logAccess(request, "denied", "invalid or missing API key");
    return NextResponse.json(
      { 
        error: "Unauthorized",
        message: "Valid API key required. Use Authorization header with Bearer token."
      },
      { status: 401 }
    );
  }

  // Layer 3: Rate limiting (5 requests per minute)
  const clientIp = getClientIp(request);
  const rateLimitResult = await rateLimit(clientIp, RATE_LIMIT_CONFIG);

  if (!rateLimitResult.success) {
    logAccess(request, "denied", "rate limit exceeded");
    return NextResponse.json(
      { 
        error: "Rate limit exceeded",
        message: "Maximum 5 requests per minute. Please try again later.",
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
      },
      { 
        status: 429,
        headers: {
          ...createRateLimitHeaders(rateLimitResult),
          "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // Layer 4: Log successful access
  logAccess(request, "success");

  try {
    // Get date range parameter from URL
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get("days");
    const days = daysParam === "all" ? null : (daysParam ? parseInt(daysParam, 10) : 1);

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
    const postsWithViews = posts
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

    // Calculate statistics
    const totalViews = postsWithViews.reduce((sum, post) => sum + post.views, 0);
    const totalViews24h = postsWithViews.reduce((sum, post) => sum + post.views24h, 0);
    const totalViewsRange = postsWithViews.reduce((sum, post) => sum + post.viewsRange, 0);
    const totalShares = postsWithViews.reduce((sum, post) => sum + post.shares, 0);
    const totalShares24h = postsWithViews.reduce((sum, post) => sum + post.shares24h, 0);
    const totalComments = postsWithViews.reduce((sum, post) => sum + post.comments, 0);
    const totalComments24h = postsWithViews.reduce((sum, post) => sum + post.comments24h, 0);
    
    const averageViews =
      postsWithViews.length > 0 ? totalViews / postsWithViews.length : 0;
    const averageViews24h =
      postsWithViews.length > 0 ? totalViews24h / postsWithViews.length : 0;
    const averageViewsRange =
      postsWithViews.length > 0 ? totalViewsRange / postsWithViews.length : 0;
    const averageShares =
      postsWithViews.length > 0 ? totalShares / postsWithViews.length : 0;
    const averageShares24h =
      postsWithViews.length > 0 ? totalShares24h / postsWithViews.length : 0;
    const averageComments =
      postsWithViews.length > 0 ? totalComments / postsWithViews.length : 0;
    const averageComments24h =
      postsWithViews.length > 0 ? totalComments24h / postsWithViews.length : 0;
    
    const topPost = postsWithViews[0];
    
    // Get top posts in last 24 hours
    const topPost24h = [...postsWithViews].sort((a, b) => b.views24h - a.views24h)[0];
    
    // Get top posts in selected range
    const topPostRange = [...postsWithViews].sort((a, b) => b.viewsRange - a.viewsRange)[0];
    
    // Get most shared posts
    const mostSharedPost = [...postsWithViews].sort((a, b) => b.shares - a.shares)[0];
    const mostSharedPost24h = [...postsWithViews].sort((a, b) => b.shares24h - a.shares24h)[0];
    
    // Get most commented posts
    const mostCommentedPost = [...postsWithViews].sort((a, b) => b.comments - a.comments)[0];
    const mostCommentedPost24h = [...postsWithViews].sort((a, b) => b.comments24h - a.comments24h)[0];
    
    const trendingPosts = postsWithViews.slice(0, 5);
    
    // Get trending data from Redis if available
    let trendingFromRedis = null;
    const redis = await getRedisClient();
    if (redis) {
      try {
        const trendingData = await redis.get("blog:trending");
        if (trendingData) {
          const parsedTrending = JSON.parse(trendingData);
          // Enrich trending data with full post information
          // Redis trending contains: postId, totalViews, recentViews, score
          // We need to merge with posts to get slug and then match with postsWithViews
          trendingFromRedis = parsedTrending
            .map((trending: { postId: string; totalViews: number; recentViews: number; score: number }) => {
              // Find the post by its postId, then match by slug with postsWithViews
              const post = posts.find(p => p.id === trending.postId);
              if (post) {
                const fullPost = postsWithViews.find(p => p.slug === post.slug);
                if (fullPost) {
                  return {
                    ...fullPost,
                    // Override views24h with recentViews from trending for more accurate recent data
                    trendingScore: trending.score,
                  };
                }
              }
              return null;
            })
            .filter(Boolean);
        }
        await redis.quit();
      } catch (error) {
        console.error("Failed to fetch trending data:", error);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      dateRange: days === null ? "all" : `${days}d`,
      summary: {
        totalPosts: postsWithViews.length,
        totalViews,
        totalViews24h,
        totalViewsRange,
        totalShares,
        totalShares24h,
        totalComments,
        totalComments24h,
        averageViews: Math.round(averageViews),
        averageViews24h: Math.round(averageViews24h),
        averageViewsRange: Math.round(averageViewsRange),
        averageShares: Math.round(averageShares),
        averageShares24h: Math.round(averageShares24h),
        averageComments: Math.round(averageComments),
        averageComments24h: Math.round(averageComments24h),
        topPost: topPost
          ? {
              slug: topPost.slug,
              title: topPost.title,
              views: topPost.views,
              views24h: topPost.views24h,
              viewsRange: topPost.viewsRange,
              shares: topPost.shares,
              shares24h: topPost.shares24h,
              comments: topPost.comments,
              comments24h: topPost.comments24h,
            }
          : null,
        topPost24h: topPost24h
          ? {
              slug: topPost24h.slug,
              title: topPost24h.title,
              views: topPost24h.views,
              views24h: topPost24h.views24h,
              viewsRange: topPost24h.viewsRange,
              shares: topPost24h.shares,
              shares24h: topPost24h.shares24h,
              comments: topPost24h.comments,
              comments24h: topPost24h.comments24h,
            }
          : null,
        topPostRange: topPostRange
          ? {
              slug: topPostRange.slug,
              title: topPostRange.title,
              views: topPostRange.views,
              views24h: topPostRange.views24h,
              viewsRange: topPostRange.viewsRange,
              shares: topPostRange.shares,
              shares24h: topPostRange.shares24h,
              comments: topPostRange.comments,
              comments24h: topPostRange.comments24h,
            }
          : null,
        mostSharedPost: mostSharedPost
          ? {
              slug: mostSharedPost.slug,
              title: mostSharedPost.title,
              views: mostSharedPost.views,
              shares: mostSharedPost.shares,
              shares24h: mostSharedPost.shares24h,
              comments: mostSharedPost.comments,
              comments24h: mostSharedPost.comments24h,
            }
          : null,
        mostSharedPost24h: mostSharedPost24h
          ? {
              slug: mostSharedPost24h.slug,
              title: mostSharedPost24h.title,
              views: mostSharedPost24h.views,
              shares: mostSharedPost24h.shares,
              shares24h: mostSharedPost24h.shares24h,
              comments: mostSharedPost24h.comments,
              comments24h: mostSharedPost24h.comments24h,
            }
          : null,
        mostCommentedPost: mostCommentedPost
          ? {
              slug: mostCommentedPost.slug,
              title: mostCommentedPost.title,
              views: mostCommentedPost.views,
              shares: mostCommentedPost.shares,
              shares24h: mostCommentedPost.shares24h,
              comments: mostCommentedPost.comments,
              comments24h: mostCommentedPost.comments24h,
            }
          : null,
        mostCommentedPost24h: mostCommentedPost24h
          ? {
              slug: mostCommentedPost24h.slug,
              title: mostCommentedPost24h.title,
              views: mostCommentedPost24h.views,
              shares: mostCommentedPost24h.shares,
              shares24h: mostCommentedPost24h.shares24h,
              comments: mostCommentedPost24h.comments,
              comments24h: mostCommentedPost24h.comments24h,
            }
          : null,
      },
      posts: postsWithViews,
      trending: trendingFromRedis || trendingPosts,
    });
  } catch (error) {
    const errorInfo = handleApiError(error, {
      route: "/api/analytics",
      method: "GET",
    });

    // For connection errors, return minimal response
    if (errorInfo.isConnectionError) {
      return new Response(null, { status: errorInfo.statusCode });
    }

    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: errorInfo.statusCode }
    );
  }
}
