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
import { timingSafeEqual } from "crypto";
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
    console.error("[API Usage] Error during key validation:", error);
    return false;
  }
}

// ============================================================================
// SECURITY LOGGING
// ============================================================================

/**
 * Logs admin access attempts using structured JSON format for security monitoring
 *
 * Structured logging enables:
 * - Easier parsing and analysis by log aggregation tools (Axiom, Sentry)
 * - Automated alerting based on specific fields
 * - Security incident investigation and forensics
 * - Compliance audit trails
 *
 * @param request - The incoming request
 * @param status - "success" or "denied"
 * @param reason - Reason for denial (if applicable)
 */
function logAdminAccess(request: NextRequest, status: "success" | "denied", reason?: string) {
  const timestamp = new Date().toISOString();
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Structured JSON logging for security monitoring
  console.log(JSON.stringify({
    event: "admin_access",
    endpoint: "/api/admin/api-usage",
    method: "GET",
    result: status,
    reason: reason || undefined,
    timestamp,
    ip,
    userAgent,
    environment: process.env.NODE_ENV || "unknown",
    vercelEnv: process.env.VERCEL_ENV || undefined,
  }));
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
 * - Layer 1: API key authentication - requires ADMIN_API_KEY (timing-safe comparison)
 * - Layer 2: Environment check - disabled in production entirely
 * - Layer 3: Rate limiting - 1 request per minute per IP (strict admin limit)
 * - Layer 4: Audit logging - structured JSON logs for security monitoring
 */
export async function GET(request: NextRequest) {
  // Layer 0: Block external access for security
  const blockResponse = blockExternalAccess(request);
  if (blockResponse) return blockResponse;

  // Layer 1: Check authentication
  if (!isAuthenticated(request)) {
    logAdminAccess(request, "denied", "invalid or missing API key");
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Layer 2: Environment check - only allow in dev/preview
  if (process.env.NODE_ENV === "production") {
    logAdminAccess(request, "denied", "production environment blocked");
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
    logAdminAccess(request, "denied", "rate limit exceeded");
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

  // Layer 4: Log successful access
  logAdminAccess(request, "success");

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
