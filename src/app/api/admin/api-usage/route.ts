/**
 * API Usage Monitoring Endpoint
 *
 * Provides real-time visibility into API usage, costs, and limits.
 * Protected by admin API key authentication.
 *
 * GET /api/admin/api-usage
 * Authorization: Bearer ADMIN_API_KEY
 */

import { NextRequest, NextResponse } from "next/server";
import { blockExternalAccess } from "@/lib/api-security";
import { rateLimit, getClientIp, createRateLimitHeaders } from "@/lib/rate-limit";
import {
  getAllUsageStats,
  getUsageSummary,
  getApiHealthStatus,
  API_LIMITS,
  RATE_LIMITS,
} from "@/lib/api-guardrails";

// ============================================================================
// AUTHENTICATION
// ============================================================================

function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey) {
    console.warn(
      "[API Usage] ADMIN_API_KEY not configured - endpoint disabled"
    );
    return false;
  }

  if (!authHeader) {
    return false;
  }

  const token = authHeader.replace("Bearer ", "");
  return token === adminKey;
}

// ============================================================================
// API ROUTE
// ============================================================================

/**
 * GET /api/admin/api-usage
 *
 * Returns comprehensive API usage statistics and health status
 *
 * Security layers:
 * - Layer 0: blockExternalAccess() - blocks all external requests in production
 * - Layer 1: API key authentication - requires ADMIN_API_KEY
 * - Layer 2: Environment check - disabled in production entirely
 * - Layer 3: Rate limiting - 1 request per minute per IP (strict admin limit)
 */
export async function GET(request: NextRequest) {
  // Layer 0: Block external access for security
  const blockResponse = blockExternalAccess(request);
  if (blockResponse) return blockResponse;

  // Layer 1: Check authentication
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Layer 2: Environment check - only allow in dev/preview
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        error: "Forbidden",
        message: "API usage endpoint is disabled in production for security",
      },
      { status: 403 }
    );
  }

  // Layer 3: Rate limiting - strict limit for admin endpoints (1 req/min)
  const clientIp = getClientIp(request);
  const rateLimitResult = await rateLimit(clientIp, {
    limit: 1,
    windowInSeconds: 60,
  });

  if (!rateLimitResult.success) {
    const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        message: "Admin endpoint limited to 1 request per minute",
        retryAfter,
      },
      {
        status: 429,
        headers: {
          ...createRateLimitHeaders(rateLimitResult),
          "Retry-After": retryAfter.toString(),
        },
      }
    );
  }

  try {
    const stats = getAllUsageStats();
    const summary = getUsageSummary();
    const health = getApiHealthStatus();

    const response = {
      timestamp: new Date().toISOString(),
      health,
      summary: {
        totalServices: summary.totalServices,
        totalCost: `$${summary.totalCost.toFixed(2)}`,
        servicesNearLimit: summary.servicesNearLimit,
        servicesAtLimit: summary.servicesAtLimit,
      },
      limits: {
        monthly: API_LIMITS,
        perRequest: RATE_LIMITS,
      },
      usage: stats.map((stat) => ({
        service: stat.service,
        endpoint: stat.endpoint,
        count: stat.count,
        limit: stat.limit,
        percentUsed: `${stat.percentUsed.toFixed(1)}%`,
        estimatedCost: stat.estimatedCost
          ? `$${stat.estimatedCost.toFixed(4)}`
          : undefined,
        lastReset: stat.lastReset,
      })),
      recommendations: generateRecommendations(stats, summary),
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[API Usage] Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch API usage statistics" },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Generate recommendations based on usage patterns
 */
function generateRecommendations(
  stats: ReturnType<typeof getAllUsageStats>,
  summary: ReturnType<typeof getUsageSummary>
): string[] {
  const recommendations: string[] = [];

  // Check for services near limit
  if (summary.servicesNearLimit.length > 0) {
    recommendations.push(
      `⚠️  ${summary.servicesNearLimit.length} service(s) near limit: ${summary.servicesNearLimit.join(", ")}`
    );
  }

  // Check for high costs
  if (summary.totalCost > 30) {
    recommendations.push(
      `💰 Total monthly cost approaching $50 budget ($${summary.totalCost.toFixed(2)})`
    );
  }

  // Check for Perplexity usage
  const perplexityStats = stats.find((s) => s.service === "perplexity");
  if (perplexityStats && perplexityStats.count > 500) {
    recommendations.push(
      `🤖 High Perplexity usage detected (${perplexityStats.count} requests) - consider caching`
    );
  }

  // Check for email usage
  const resendStats = stats.find((s) => s.service === "resend");
  if (resendStats && resendStats.percentUsed > 80) {
    recommendations.push(
      `📧 Email usage near free tier limit - consider upgrade or rate limiting`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push("✅ All services operating within healthy limits");
  }

  return recommendations;
}
