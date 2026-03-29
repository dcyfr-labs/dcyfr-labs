/**
 * Bookmark API Endpoint
 *
 * POST /api/engagement/bookmark
 * Increments or decrements global bookmark count in Redis
 *
 * Request body:
 * {
 *   "slug": "my-post",
 *   "contentType": "post" | "project" | "activity",
 *   "action": "bookmark" | "unbookmark"
 * }
 *
 * Security:
 * - Rate limiting: 30 requests per minute per IP
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  incrementBookmarks,
  decrementBookmarks,
  getBookmarks,
  checkIpDeduplication,
  type ContentType,
} from '@/lib/engagement-analytics';
import { rateLimit, getClientIp, createRateLimitHeaders } from '@/lib/rate-limit';
import { createServerLogger } from '@/lib/axiom/server-logger';
import { maskIp } from '@/lib/security';

const logger = createServerLogger();

interface BookmarkRequestBody {
  slug: string;
  contentType: ContentType;
  action: 'bookmark' | 'unbookmark';
}

function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

export async function POST(request: NextRequest) {
  // Rate limiting: 30 requests per minute per IP
  const clientIp = getClientIp(request);
  const rateLimitResult = await rateLimit(`engagement:bookmark:${clientIp}`, {
    limit: 30,
    windowInSeconds: 60,
  });

  if (!rateLimitResult.success) {
    const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
    return NextResponse.json(
      { error: 'Rate limit exceeded', retryAfter },
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
    const body = (await request.json()) as BookmarkRequestBody;
    const { slug, contentType, action } = body;

    // Validate input
    if (!slug || !contentType || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, contentType, action' },
        { status: 400 }
      );
    }

    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only' },
        { status: 400 }
      );
    }

    if (!['post', 'project', 'activity'].includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid contentType. Must be post, project, or activity' },
        { status: 400 }
      );
    }

    if (!['bookmark', 'unbookmark'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be bookmark or unbookmark' },
        { status: 400 }
      );
    }

    // Perform action
    let newCount: number | null;
    if (action === 'bookmark') {
      const dedupSlug = `${contentType}:${slug}`;
      let alreadyActioned = false;
      try {
        alreadyActioned = await checkIpDeduplication('bookmark', dedupSlug, clientIp, 86400);
      } catch (error) {
        console.warn(
          '[API] Bookmark deduplication unavailable, applying fail-open behavior',
          error
        );
      }

      if (alreadyActioned) {
        const currentCount = await getBookmarks(contentType, slug);

        logger.info('engagement.already_actioned', {
          endpoint: '/api/engagement/bookmark',
          action: 'bookmark',
          contentType,
          slug,
          ip_masked: maskIp(clientIp),
        });

        return NextResponse.json({
          success: true,
          alreadyActioned: true,
          action: 'already_actioned',
          count: currentCount ?? 0,
        });
      }

      newCount = await incrementBookmarks(contentType, slug);
    } else {
      newCount = await decrementBookmarks(contentType, slug);
    }

    // Handle Redis unavailable
    if (newCount === null) {
      return NextResponse.json({ error: 'Analytics unavailable', count: 0 }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      count: newCount,
      action,
    });
  } catch (error) {
    console.error('[API] Bookmark endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Get bookmark count for content
 *
 * GET /api/engagement/bookmark?slug=my-post&contentType=post
 */
export async function GET(request: NextRequest) {
  // Rate limiting: 60 requests per minute per IP (higher for reads)
  const clientIp = getClientIp(request);
  const rateLimitResult = await rateLimit(`engagement:bookmark:get:${clientIp}`, {
    limit: 60,
    windowInSeconds: 60,
  });

  if (!rateLimitResult.success) {
    const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
    return NextResponse.json(
      { error: 'Rate limit exceeded', retryAfter },
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
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const contentType = searchParams.get('contentType') as ContentType;

    if (!slug || !contentType) {
      return NextResponse.json(
        { error: 'Missing required query params: slug, contentType' },
        { status: 400 }
      );
    }

    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only' },
        { status: 400 }
      );
    }

    const count = await getBookmarks(contentType, slug);

    if (count === null) {
      return NextResponse.json({ error: 'Analytics unavailable', count: 0 }, { status: 503 });
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error('[API] Bookmark GET endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
