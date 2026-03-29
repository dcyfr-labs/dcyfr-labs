/**
 * Plugin Reviews API — POST & GET /api/plugins/[id]/reviews
 *
 * POST: Submit a new rating and review for a plugin.
 *       One review per user per plugin is enforced.
 *       Requires authenticated session.
 *       Body: { displayName, rating: 1-5, comment? }
 *
 * GET:  Retrieve paginated reviews for a plugin.
 *       Query: ?page=1&pageSize=10&sortBy=createdAt&sortOrder=desc
 *
 * Security:
 *   - Rate limited: 10 POST submissions per minute per IP
 *   - Input validated with Zod
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit, getClientIp, createRateLimitHeaders } from '@/lib/rate-limit';
import { getReviewStore } from '@/lib/plugins/review-store';
import { handleApiError } from '@/lib/error-handler';
import { withAuth, getRequestUser, type AuthenticatedRequest } from '@/lib/auth-middleware';

export const runtime = 'nodejs';

const POST_RATE_LIMIT = { limit: 3, windowInSeconds: 60 };
const GET_RATE_LIMIT = { limit: 60, windowInSeconds: 60 };

const CreateReviewSchema = z.object({
  displayName: z
    .string()
    .min(1)
    .max(64)
    .transform((v) => v.trim()),
  rating: z.number().int().min(1).max(5) as z.ZodType<1 | 2 | 3 | 4 | 5>,
  comment: z.string().max(2000).optional(),
});

// ── POST ────────────────────────────────────────────────────────────────────

export const POST = withAuth(
  async function postPluginReview(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    if (process.env.PLUGINS_ENABLED !== 'true' && process.env.NODE_ENV !== 'test') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    try {
      const { id: pluginId } = await params;

      if (!pluginId?.trim()) {
        return NextResponse.json({ error: 'Plugin ID is required.' }, { status: 400 });
      }

      const user = getRequestUser(request as AuthenticatedRequest);
      if (!user?.id) {
        return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
      }

      // Rate limiting
      const ip = getClientIp(request);
      const rateLimitResult = await rateLimit(`plugins:reviews:${ip}`, POST_RATE_LIMIT);
      if (!rateLimitResult.success) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Try again later.' },
          { status: 429, headers: createRateLimitHeaders(rateLimitResult) }
        );
      }

      // Parse and validate request body
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
      }

      const parsed = CreateReviewSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid request body.', issues: parsed.error.issues },
          { status: 400 }
        );
      }

      const store = await getReviewStore();
      const review = store.createReview({
        pluginId,
        userId: user.id,
        displayName: parsed.data.displayName,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      });

      return NextResponse.json(
        {
          review,
          stats: store.getRatingStats(pluginId),
        },
        { status: 201 }
      );
    } catch (error: unknown) {
      // Handle duplicate review
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code: string }).code === 'DUPLICATE_REVIEW'
      ) {
        return NextResponse.json(
          { error: 'You have already submitted a review for this plugin.' },
          { status: 409 }
        );
      }
      const errInfo = handleApiError(error, { route: 'POST /api/plugins/[id]/reviews' });
      return NextResponse.json({ error: errInfo.message }, { status: errInfo.statusCode });
    }
  },
  {
    requireAuth: true,
  }
);

// ── GET ─────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.PLUGINS_ENABLED !== 'true' && process.env.NODE_ENV !== 'test') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  try {
    const { id: pluginId } = await params;

    if (!pluginId?.trim()) {
      return NextResponse.json({ error: 'Plugin ID is required.' }, { status: 400 });
    }

    // Rate limiting
    const ip = getClientIp(request);
    const rateLimitResult = await rateLimit(ip, GET_RATE_LIMIT);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded.' },
        { status: 429, headers: createRateLimitHeaders(rateLimitResult) }
      );
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number.parseInt(searchParams.get('pageSize') ?? '10', 10) || 10)
    );
    const sortByRaw = searchParams.get('sortBy') ?? 'createdAt';
    const sortBy =
      sortByRaw === 'rating' || sortByRaw === 'helpfulVotes' || sortByRaw === 'createdAt'
        ? sortByRaw
        : 'createdAt';
    const sortOrderRaw = searchParams.get('sortOrder') ?? 'desc';
    const sortOrder = sortOrderRaw === 'asc' ? 'asc' : 'desc';

    const store = await getReviewStore();
    const reviewPage = store.getReviews(pluginId, { page, pageSize, sortBy, sortOrder });
    const stats = store.getRatingStats(pluginId);

    return NextResponse.json({
      ...reviewPage,
      stats,
    });
  } catch (error: unknown) {
    const errInfo = handleApiError(error, { route: 'GET /api/plugins/[id]/reviews' });
    return NextResponse.json({ error: errInfo.message }, { status: errInfo.statusCode });
  }
}
