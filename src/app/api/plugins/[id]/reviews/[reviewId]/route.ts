/**
 * Plugin Review Moderation API — PATCH & DELETE /api/plugins/[id]/reviews/[reviewId]
 *
 * PATCH: Moderate a review (flag, approve, or remove).
 *        Requires admin API key via Bearer token.
 *        Body: { action: 'flag'|'approve'|'remove', reason?: string }
 *
 * DELETE: Remove a review (user self-removal or admin).
 *         Requires either matching userId in body OR admin API key.
 *
 * Security:
 *   - Admin actions require ADMIN_API_KEY bearer token
 *   - Rate limited: 30 moderation actions per minute per IP
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit, getClientIp, createRateLimitHeaders } from '@/lib/rate-limit';
import { getReviewStore } from '@/lib/plugins/review-store';
import { handleApiError } from '@/lib/error-handler';

export const runtime = 'nodejs';

const MOD_RATE_LIMIT = { limit: 30, windowInSeconds: 60 };

const ModerationSchema = z.object({
  action: z.enum(['flag', 'approve', 'remove']),
  reason: z
    .enum(['spam', 'inappropriate', 'fake', 'other'])
    .optional()
    .describe('Required when action is flag'),
  userId: z.string().min(1).max(128).optional().describe('Required when action is flag'),
});

type ModerationActionInput = {
  action: 'flag' | 'approve' | 'remove';
  reviewId: string;
  reason?: 'spam' | 'inappropriate' | 'fake' | 'other';
  userId?: string;
  isAdmin: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyModerationAction(store: any, input: ModerationActionInput): NextResponse {
  const { action, reviewId, reason, userId, isAdmin } = input;

  if (action === 'flag') {
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required when flagging a review.' },
        { status: 400 }
      );
    }
    const review = store.flagReview({ reviewId, reportedBy: userId, reason: reason ?? 'other' });
    return NextResponse.json({ review });
  }

  if (!isAdmin) {
    return NextResponse.json(
      { error: `Admin authorization required to ${action} reviews.` },
      { status: 403 }
    );
  }

  const review =
    action === 'approve' ? store.approveReview(reviewId) : store.removeReview(reviewId);
  return NextResponse.json({ review });
}

function isAdminRequest(request: NextRequest): boolean {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) return false;
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  return authHeader.slice(7) === adminKey;
}

// ── PATCH ───────────────────────────────────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  try {
    const { id: pluginId, reviewId } = await params;

    if (!pluginId?.trim() || !reviewId?.trim()) {
      return NextResponse.json({ error: 'Plugin ID and Review ID are required.' }, { status: 400 });
    }

    // Rate limiting
    const ip = getClientIp(request);
    const rateLimitResult = await rateLimit(ip, MOD_RATE_LIMIT);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded.' },
        { status: 429, headers: createRateLimitHeaders(rateLimitResult) }
      );
    }

    // Parse and validate body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const parsed = ModerationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body.', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { action, reason, userId } = parsed.data;
    const isAdmin = isAdminRequest(request);

    const store = await getReviewStore();
    const review = store.getReview(reviewId);

    if (!review) {
      return NextResponse.json({ error: 'Review not found.' }, { status: 404 });
    }

    // Verify review belongs to plugin
    if (review.pluginId !== pluginId) {
      return NextResponse.json({ error: 'Review not found for this plugin.' }, { status: 404 });
    }

    return applyModerationAction(store, { action, reviewId, reason, userId, isAdmin });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as { code: string }).code === 'REVIEW_NOT_FOUND'
    ) {
      return NextResponse.json({ error: 'Review not found.' }, { status: 404 });
    }
    const errInfo = handleApiError(error, {
      route: 'PATCH /api/plugins/[id]/reviews/[reviewId]',
    });
    return NextResponse.json({ error: errInfo.message }, { status: errInfo.statusCode });
  }
}
