/**
 * Referral Tracking API Route
 *
 * POST /api/analytics/referral - Track a referral event
 * GET  /api/analytics/referral - Get referral counts for a post
 *
 * Stores referral data in Redis with 24-hour TTL for real-time tracking.
 * Data is aggregated daily by a cron job for long-term analytics.
 */

import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

// ============================================================================
// TYPES
// ============================================================================

interface ReferralPayload {
  postId: string;
  sessionId: string;
  platform: string;
  referrer: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
}

interface ReferralCounts {
  [platform: string]: number;
}

// ============================================================================
// POST - Track Referral Event
// ============================================================================

/**
 * Track a referral event
 *
 * @example
 * POST /api/analytics/referral
 * {
 *   "postId": "post-123",
 *   "sessionId": "session-abc",
 *   "platform": "twitter",
 *   "referrer": "https://twitter.com/post/123",
 *   "utmSource": "twitter",
 *   "utmCampaign": "product-launch"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ReferralPayload;
    const {
      postId,
      sessionId,
      platform,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent
    } = body;

    // Validate required fields
    if (!postId || !sessionId || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: postId, sessionId, platform' },
        { status: 400 }
      );
    }

    // Validate platform
    const validPlatforms = ['twitter', 'dev', 'linkedin', 'reddit', 'hackernews', 'github', 'other'];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}` },
        { status: 400 }
      );
    }

    // Create unique key for this referral event (prevents duplicates from same session)
    const eventKey = `referral:event:${postId}:${platform}:${sessionId}`;

    // Check if this session already tracked this referral
    const existing = await redis.get(eventKey);
    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Referral already tracked for this session',
      });
    }

    // Store referral event with 24-hour TTL
    const eventData = {
      timestamp: Date.now(),
      platform,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
    };

    await redis.set(eventKey, JSON.stringify(eventData), {
      EX: 86400, // 24 hours
    });

    // Increment referral counter for this post and platform
    const counterKey = `referral:count:${postId}:${platform}`;
    const count = await redis.incr(counterKey);

    // Set TTL on counter if this is the first increment
    if (count === 1) {
      await redis.expire(counterKey, 86400); // 24 hours
    }

    // Also increment total referrals for this post (across all platforms)
    const totalKey = `referral:total:${postId}`;
    await redis.incr(totalKey);
    await redis.expire(totalKey, 86400);

    return NextResponse.json({
      success: true,
      count,
      message: 'Referral tracked successfully',
    });
  } catch (error) {
    console.error('[API] Referral tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Get Referral Counts
// ============================================================================

/**
 * Get referral counts for a specific post
 *
 * @example
 * GET /api/analytics/referral?postId=post-123
 * {
 *   "postId": "post-123",
 *   "referrals": {
 *     "twitter": 42,
 *     "dev": 18,
 *     "linkedin": 15,
 *     "reddit": 8,
 *     "hackernews": 5,
 *     "github": 3,
 *     "other": 2
 *   },
 *   "total": 93
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: 'Missing required parameter: postId' },
        { status: 400 }
      );
    }

    // Get referral counts by platform
    const platforms = ['twitter', 'dev', 'linkedin', 'reddit', 'hackernews', 'github', 'other'];
    const counts: ReferralCounts = {};

    for (const platform of platforms) {
      const key = `referral:count:${postId}:${platform}`;
      const count = await redis.get(key);
      counts[platform] = count ? parseInt(count as string, 10) : 0;
    }

    // Get total referrals
    const totalKey = `referral:total:${postId}`;
    const total = await redis.get(totalKey);
    const totalCount = total ? parseInt(total as string, 10) : 0;

    return NextResponse.json({
      postId,
      referrals: counts,
      total: totalCount,
    });
  } catch (error) {
    console.error('[API] Get referral error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPTIONS - CORS Preflight
// ============================================================================

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
