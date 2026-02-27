/**
 * DEV.to Analytics API Route
 *
 * POST /api/social-analytics/dev-to - Fetch and cache DEV.to metrics
 * GET  /api/social-analytics/dev-to - Retrieve cached metrics
 *
 * Integrates with DEV.to API to fetch article engagement metrics.
 * Caches results in Redis/KV to minimize API calls and respect rate limits.
 */

import { NextRequest, NextResponse } from 'next/server';
import { blockExternalAccess } from '@/lib/api/api-security';
import { redis } from '@/lib/redis';
import { fetchDevToMetrics, type DevToMetrics } from '@/lib/social-analytics';
import { validateRequestBody, validateQueryParams } from '@/lib/validation/middleware';
import { devToAnalyticsSchema } from '@/lib/validation/schemas';
import { z } from 'zod';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Cache TTL for DEV metrics (6 hours) */
const CACHE_TTL = 21600;

// ============================================================================
// POST - Fetch and Cache Metrics
// ============================================================================

/**
 * Fetch DEV.to metrics and cache them
 *
 * @example
 * POST /api/social-analytics/dev-to
 * {
 *   "postId": "post-123",
 *   "devSlug": "building-with-nextjs",
 *   "username": "dcyfr"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "metrics": {
 *     "postId": "post-123",
 *     "devSlug": "building-with-nextjs",
 *     "devId": 12345,
 *     "pageViews": 1523,
 *     "reactions": 42,
 *     "comments": 8,
 *     "publishedAt": "2025-01-01T00:00:00.000Z",
 *     "lastFetchedAt": "2026-01-08T12:00:00.000Z",
 *     "url": "https://dev.to/dcyfr/building-with-nextjs"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  const blockResponse = blockExternalAccess(request);
  if (blockResponse) return blockResponse;

  const validated = await validateRequestBody(request, devToAnalyticsSchema);
  if ('error' in validated) return validated.error;

  const { postId, devSlug, username, forceRefresh } = validated.data;

  try {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cacheKey = `dev-metrics:${postId}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        try {
          const metrics = JSON.parse(cached as string) as DevToMetrics;
          return NextResponse.json({
            success: true,
            metrics,
            cached: true,
          });
        } catch {
          // Invalid cache, continue to fetch
        }
      }
    }

    // Fetch from DEV.to API
    const metrics = await fetchDevToMetrics(postId, devSlug, username);

    if (!metrics) {
      return NextResponse.json(
        {
          error: 'Failed to fetch DEV.to metrics',
          details: 'Article not found or API error',
        },
        { status: 404 }
      );
    }

    // Cache the metrics
    const cacheKey = `dev-metrics:${postId}`;
    await redis.set(
      cacheKey,
      JSON.stringify({
        ...metrics,
        lastFetchedAt: new Date().toISOString(),
      }),
      { EX: CACHE_TTL }
    );

    return NextResponse.json({
      success: true,
      metrics,
      cached: false,
    });
  } catch (error) {
    console.error('[API] DEV.to metrics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// GET - Retrieve Cached Metrics
// ============================================================================

/**
 * Get cached DEV.to metrics for a post
 *
 * @example
 * GET /api/social-analytics/dev-to?postId=post-123
 *
 * Response:
 * {
 *   "success": true,
 *   "metrics": { ... },
 *   "stale": false
 * }
 */
export async function GET(request: NextRequest) {
  const blockResponse = blockExternalAccess(request);
  if (blockResponse) return blockResponse;

  const getSchema = z.object({ postId: z.string().min(1, 'postId is required').max(200) });
  const validated = validateQueryParams(request, getSchema);
  if ('error' in validated) return validated.error;

  const { postId } = validated.data;

  try {
    // Get from cache
    const cacheKey = `dev-metrics:${postId}`;
    const cached = await redis.get(cacheKey);

    if (!cached) {
      return NextResponse.json({ error: 'Metrics not found in cache' }, { status: 404 });
    }

    try {
      const metrics = JSON.parse(cached as string) as DevToMetrics;

      // Check if metrics are stale (> 6 hours old)
      const lastFetched = new Date(metrics.lastFetchedAt);
      const now = new Date();
      const ageHours = (now.getTime() - lastFetched.getTime()) / (1000 * 60 * 60);
      const isStale = ageHours >= 6;

      return NextResponse.json({
        success: true,
        metrics,
        stale: isStale,
      });
    } catch {
      return NextResponse.json({ error: 'Invalid cached data' }, { status: 500 });
    }
  } catch (error) {
    console.error('[API] Get DEV.to metrics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// DELETE - Clear Cache
// ============================================================================

/**
 * Clear cached metrics for a post
 *
 * @example
 * DELETE /api/social-analytics/dev-to?postId=post-123
 */
export async function DELETE(request: NextRequest) {
  const blockResponse = blockExternalAccess(request);
  if (blockResponse) return blockResponse;

  const deleteSchema = z.object({ postId: z.string().min(1, 'postId is required').max(200) });
  const validated = validateQueryParams(request, deleteSchema);
  if ('error' in validated) return validated.error;

  const { postId } = validated.data;

  try {
    const cacheKey = `dev-metrics:${postId}`;
    await redis.del(cacheKey);

    return NextResponse.json({
      success: true,
      message: 'Cache cleared',
    });
  } catch (error) {
    console.error('[API] Delete DEV.to cache error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
