/**
 * Inoreader OAuth 2.0 Callback Handler
 *
 * Handles the redirect from Inoreader consent page after user authorization.
 * Exchanges authorization code for access/refresh tokens and stores them securely.
 *
 * Route: /api/inoreader/callback
 */

import { type NextRequest, NextResponse } from 'next/server';
import { InoreaderClient } from '@/lib/inoreader-client';
import { redis } from '@/lib/redis';

const INOREADER_CLIENT_ID = process.env.INOREADER_CLIENT_ID;
const INOREADER_CLIENT_SECRET = process.env.INOREADER_CLIENT_SECRET;
const INOREADER_REDIRECT_URI =
  process.env.INOREADER_REDIRECT_URI || 'http://localhost:3000/api/inoreader/callback';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check environment configuration
    if (!INOREADER_CLIENT_ID || !INOREADER_CLIENT_SECRET) {
      return NextResponse.json(
        {
          error: 'Inoreader integration not configured',
          details: 'Missing INOREADER_CLIENT_ID or INOREADER_CLIENT_SECRET',
        },
        { status: 503 }
      );
    }

    // Get authorization code and state from query parameters
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
    }

    // CSRF protection: Verify state parameter
    // In production, compare with stored session state
    if (state) {
      // TODO: Implement session-based CSRF validation
      // Sanitize state parameter to prevent log injection
      const sanitizedState = state.replace(/[\r\n]/g, '');
      console.warn('OAuth state parameter:', sanitizedState);
    }

    // Exchange authorization code for tokens
    const client = new InoreaderClient(INOREADER_CLIENT_ID, INOREADER_CLIENT_SECRET);
    const tokenData = await client.exchangeCodeForTokens(code, INOREADER_REDIRECT_URI);

    // Store tokens in Redis (or database in production)
    if (redis) {
      const tokens = client.getTokens();
      await redis.set(
        'inoreader:tokens',
        JSON.stringify({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          scope: tokenData.scope,
          updatedAt: Date.now(),
        }),
        {
          EX: 60 * 60 * 24 * 30, // 30 days TTL
        }
      );

      console.warn('✅ Inoreader tokens stored successfully');
    } else {
      console.warn('⚠️ Redis not configured - tokens not persisted');
    }

    // Redirect to dev news page with success message
    return NextResponse.redirect(new URL('/dev/news?auth=success', request.nextUrl.origin));
  } catch (error) {
    console.error('❌ Inoreader OAuth callback error:', error);

    return NextResponse.redirect(
      new URL(
        `/dev/news?auth=error&message=${encodeURIComponent(
          error instanceof Error ? error.message : 'Unknown error'
        )}`,
        request.nextUrl.origin
      )
    );
  }
}
