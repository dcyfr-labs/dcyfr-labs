import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/inngest/client';
import { apiLogger } from '@/lib/logger';

/**
 * Manual GitHub data refresh endpoint
 *
 * Triggers an immediate refresh of GitHub contribution data by sending
 * an event to the Inngest manualRefreshGitHubData function.
 *
 * This is useful for:
 * - Post-deployment cache warming
 * - Manual cache refresh after GitHub profile updates
 * - Testing and debugging
 *
 * Security: Protected by bearer token or Vercel internal auth
 *
 * Usage:
 * - POST /api/github/refresh
 * - Header: Authorization: Bearer <GITHUB_REFRESH_TOKEN>
 * - Or: x-vercel-signature (for Vercel Deploy Hooks)
 * - Body: { "force": true } (optional)
 */
export async function POST(request: NextRequest) {
  // Simple token-based authentication
  // For production: Use proper auth or restrict to Vercel internal requests
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.GITHUB_REFRESH_TOKEN;

  // Allow requests from Vercel's internal network (deploy hooks)
  const isVercelInternal = request.headers.get('x-vercel-deployment-url') !== null;

  // Check authentication
  if (!isVercelInternal) {
    if (!expectedToken) {
      return NextResponse.json(
        {
          error: 'Refresh endpoint not configured',
          message: 'Set GITHUB_REFRESH_TOKEN environment variable to enable manual refresh',
        },
        { status: 503 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing authorization token' },
        { status: 401 }
      );
    }
  }

  try {
    const body = await request.json().catch(() => ({}));
    const force = body.force ?? true;

    // Send event to Inngest to trigger manual refresh
    await inngest.send({
      name: 'github/data.refresh',
      data: { force },
    });

    apiLogger.success('POST', '/api/github/refresh', undefined);

    return NextResponse.json({
      success: true,
      message: 'GitHub data refresh triggered',
      force,
      note: 'Cache will be updated within 1-2 minutes. Check Inngest dashboard for status.',
    });
  } catch (error) {
    apiLogger.error('POST', '/api/github/refresh', error as Error);

    return NextResponse.json(
      {
        error: 'Refresh failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler for status/health check
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/github/refresh',
    method: 'POST',
    authentication: 'Bearer token or Vercel internal',
    body: {
      force: 'boolean (optional, default: true)',
    },
    configured: !!process.env.GITHUB_REFRESH_TOKEN,
  });
}
