/**
 * MCP Health Check API Endpoint
 *
 * Provides health monitoring for MCP (Model Context Protocol) servers.
 * Accepts health check results from CI and returns current status/metrics.
 *
 * POST /api/mcp/health - Store health check results from CI
 * GET /api/mcp/health - Retrieve current status and metrics
 *
 * Security:
 * - POST requires ADMIN_API_KEY authentication
 * - GET restricted to development environment or requires API key
 * - Rate limiting: 10 requests per minute
 */

import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import * as Sentry from '@sentry/nextjs';
import { blockExternalAccess } from '@/lib/api-security';
import { rateLimit, getClientIp, createRateLimitHeaders } from '@/lib/rate-limit';
import {
  storeHealthReport,
  getLatestHealthReport,
  getAllUptimeMetrics,
  getRecentIncidents,
  getAlertHistory,
  isRedisAvailable,
  type McpHealthReport,
} from '@/lib/mcp-health-tracker';

// ============================================================================
// TYPES
// ============================================================================

interface PostRequestBody {
  timestamp: string;
  servers: Array<{
    name: string;
    status: 'ok' | 'degraded' | 'down';
    responseTimeMs: number;
    error?: string;
    authUsed?: boolean;
    timestamp: string;
  }>;
  summary: {
    total: number;
    ok: number;
    degraded: number;
    down: number;
  };
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Validates the API key from the Authorization header using timing-safe comparison
 *
 * Expected format: "Bearer YOUR_API_KEY"
 */
function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey) {
    console.warn('[MCP Health API] ADMIN_API_KEY not configured - endpoint disabled');
    return false;
  }

  if (!authHeader) {
    return false;
  }

  const token = authHeader.replace('Bearer ', '');

  // Use timing-safe comparison to prevent timing attacks
  try {
    const tokenBuf = Buffer.from(token, 'utf8');
    const keyBuf = Buffer.from(adminKey, 'utf8');

    if (tokenBuf.length !== keyBuf.length) {
      return false;
    }

    return timingSafeEqual(tokenBuf, keyBuf);
  } catch (error) {
    console.error('[MCP Health API] Error during key validation:', error);
    return false;
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validates incoming health report data
 */
function validateHealthReport(data: any): data is PostRequestBody {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Check required fields
  if (!data.timestamp || !Array.isArray(data.servers) || !data.summary) {
    return false;
  }

  // Validate timestamp format
  if (isNaN(Date.parse(data.timestamp))) {
    return false;
  }

  // Validate servers array
  for (const server of data.servers) {
    if (!server.name || !server.status || typeof server.responseTimeMs !== 'number') {
      return false;
    }
    if (!['ok', 'degraded', 'down'].includes(server.status)) {
      return false;
    }
  }

  // Validate summary
  const { total, ok, degraded, down } = data.summary;
  if (
    typeof total !== 'number' ||
    typeof ok !== 'number' ||
    typeof degraded !== 'number' ||
    typeof down !== 'number'
  ) {
    return false;
  }

  return true;
}

// ============================================================================
// POST HANDLER - Store Health Report
// ============================================================================

/**
 * POST /api/mcp/health
 *
 * Accepts health check results from CI and stores them in Redis.
 *
 * Security layers:
 * - Layer 0: blockExternalAccess() - blocks all external requests in production
 * - Layer 1: API key authentication - requires ADMIN_API_KEY
 * - Layer 2: Rate limiting - 10 requests per minute
 * - Layer 3: Input validation - validates health report schema
 */
export async function POST(request: NextRequest) {
  // Layer 0: Block external access
  const blockResponse = blockExternalAccess(request);
  if (blockResponse) return blockResponse;

  // Layer 1: Check authentication
  if (!isAuthenticated(request)) {
    Sentry.captureMessage('MCP Health API: Unauthorized POST attempt', {
      level: 'warning',
      tags: {
        endpoint: '/api/mcp/health',
        method: 'POST',
      },
      extra: {
        ip: getClientIp(request),
        userAgent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Layer 2: Rate limiting
  const clientIp = getClientIp(request);
  const rateLimitResult = await rateLimit(clientIp, {
    limit: 10,
    windowInSeconds: 60,
  });

  if (!rateLimitResult.success) {
    const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          ...createRateLimitHeaders(rateLimitResult),
          'Retry-After': retryAfter.toString(),
        },
      }
    );
  }

  // Layer 3: Validate request body
  try {
    const body = await request.json();

    if (!validateHealthReport(body)) {
      return NextResponse.json({ error: 'Invalid health report format' }, { status: 400 });
    }

    // Check Redis availability
    const redisAvailable = await isRedisAvailable();
    if (!redisAvailable) {
      console.error('[MCP Health API] Redis unavailable');
      return NextResponse.json({ error: 'Storage service unavailable' }, { status: 503 });
    }

    // Store health report
    const healthReport: McpHealthReport = body as McpHealthReport;
    await storeHealthReport(healthReport);

    console.warn(
      `[MCP Health API] Stored health report: ${healthReport.summary.ok}/${healthReport.summary.total} servers healthy`
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Health report stored successfully',
        timestamp: healthReport.timestamp,
        summary: healthReport.summary,
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('[MCP Health API] Error processing POST request:', error);
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/mcp/health',
        method: 'POST',
      },
    });

    return NextResponse.json({ error: 'Failed to process health report' }, { status: 500 });
  }
}

// ============================================================================
// GET HANDLER - Retrieve Health Status
// ============================================================================

/**
 * GET /api/mcp/health
 *
 * Returns current MCP server health status and metrics.
 *
 * Security:
 * - Development environment only (no auth required)
 * - Rate limiting: 10 requests per minute
 *
 * Response includes:
 * - Latest health report
 * - 7-day uptime metrics per server
 * - Recent incidents (last 7 days)
 * - Alert history (last 7 days)
 */
export async function GET(request: NextRequest) {
  // Block external access
  const blockResponse = blockExternalAccess(request);
  if (blockResponse) return blockResponse;

  // Environment check - only allow in dev/preview
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: 'MCP health endpoint is disabled in production for security',
      },
      { status: 403 }
    );
  }

  // Rate limiting
  const clientIp = getClientIp(request);
  const rateLimitResult = await rateLimit(clientIp, {
    limit: 10,
    windowInSeconds: 60,
  });

  if (!rateLimitResult.success) {
    const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          ...createRateLimitHeaders(rateLimitResult),
          'Retry-After': retryAfter.toString(),
        },
      }
    );
  }

  try {
    // Check Redis availability
    const redisAvailable = await isRedisAvailable();
    if (!redisAvailable) {
      console.warn('[MCP Health API] Redis unavailable - returning unavailable status');
      return NextResponse.json(
        {
          status: 'unavailable',
          message: 'Health data storage is currently unavailable',
          timestamp: new Date().toISOString(),
        },
        {
          status: 503,
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Fetch health data
    const latestReport = await getLatestHealthReport();
    const uptimeMetrics = await getAllUptimeMetrics(7);
    const recentIncidents = await getRecentIncidents(7, 20);
    const alertHistory = await getAlertHistory(7);

    // If no data available yet
    if (!latestReport) {
      return NextResponse.json(
        {
          status: 'no_data',
          message: 'No health check data available yet',
          timestamp: new Date().toISOString(),
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Build response
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      latest: latestReport,
      uptime: uptimeMetrics,
      incidents: {
        recent: recentIncidents,
        count: recentIncidents.length,
      },
      alerts: {
        recent: alertHistory,
        count: alertHistory.length,
      },
      metadata: {
        retentionDays: 7,
        lastCheck: latestReport.timestamp,
        serversMonitored: latestReport.servers.length,
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[MCP Health API] Error processing GET request:', error);
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/mcp/health',
        method: 'GET',
      },
    });

    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to retrieve health data',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
