import { NextRequest, NextResponse } from 'next/server';
import { updateAllAnalyticsMilestones } from '@/lib/analytics-integration';
import { inngest } from '@/inngest/client';

/**
 * API Route: Update Analytics Milestones
 *
 * Endpoint: POST /api/analytics/update-milestones
 *
 * Purpose:
 * - Manually trigger analytics data refresh
 * - Queue background job for data fetching
 * - Return immediate response (async processing)
 *
 * Authentication:
 * - Requires valid auth or cron secret
 * - Production: Check CRON_SECRET header
 * - Development: Allow all requests
 *
 * Usage:
 * ```bash
 * # Manual trigger (dev)
 * curl -X POST http://localhost:3000/api/analytics/update-milestones
 *
 * # Manual trigger (production with secret)
 * curl -X POST https://www.dcyfr.dev/api/analytics/update-milestones \
 *   -H "Authorization: Bearer $CRON_SECRET"
 * ```
 */

export async function POST(request: NextRequest) {
  const isProduction =
    process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

  // Authentication check (production only)
  if (isProduction) {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
    }

    const providedSecret = authHeader?.replace('Bearer ', '');

    if (providedSecret !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    // Queue background job for analytics update
    await inngest.send({
      name: 'analytics/milestones.update',
      data: {
        triggered_by: 'manual_api_call',
        triggered_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Analytics update queued',
      queued_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Failed to queue analytics update:', error);
    return NextResponse.json(
      {
        error: 'Failed to queue analytics update',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler for health check
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/analytics/update-milestones',
    method: 'POST',
    description: 'Trigger analytics milestones update',
    authentication: process.env.NODE_ENV === 'production' ? 'required' : 'optional',
  });
}
