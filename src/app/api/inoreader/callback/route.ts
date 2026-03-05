/**
 * Inoreader OAuth 2.0 Callback Handler
 *
 * Handles the redirect from Inoreader consent page after user authorization.
 * Exchanges authorization code for access/refresh tokens and stores them securely.
 *
 * Route: /api/inoreader/callback
 */

import { type NextRequest, NextResponse } from "next/server";
import { InoreaderClient } from "@/lib/inoreader-client";
import { redis } from "@/lib/redis";

const INOREADER_CLIENT_ID = process.env.INOREADER_CLIENT_ID;
const INOREADER_CLIENT_SECRET = process.env.INOREADER_CLIENT_SECRET;
const INOREADER_REDIRECT_URI =
  process.env.INOREADER_REDIRECT_URI ||
  "http://localhost:3000/api/inoreader/callback";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Check environment configuration
    if (!INOREADER_CLIENT_ID || !INOREADER_CLIENT_SECRET) {
      return NextResponse.json(
        {
          error: "Inoreader integration not configured",
          details: "Missing INOREADER_CLIENT_ID or INOREADER_CLIENT_SECRET",
        },
        { status: 503 }
      );
    }

    // Get authorization code and state from query parameters
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      return NextResponse.json(
        { error: "Missing authorization code" },
        { status: 400 }
      );
    }

    // CSRF protection: validate `state` against the value stored in the httpOnly cookie
    // set by feeds-auth.tsx before redirecting to Inoreader's consent page.
    const storedState = request.cookies.get("inoreader_oauth_state")?.value;

    if (!state) {
      return NextResponse.json(
        { error: "Missing state parameter. Possible CSRF attempt." },
        { status: 400 }
      );
    }

    if (!storedState) {
      return NextResponse.json(
        {
          error:
            "OAuth state cookie not found. Please initiate the login flow again.",
        },
        { status: 400 }
      );
    }

    if (state !== storedState) {
      console.warn("[Inoreader OAuth] State mismatch — possible CSRF attack", {
        state: state.slice(0, 8),
      });
      return NextResponse.json(
        { error: "State parameter mismatch. Request rejected." },
        { status: 403 }
      );
    }

    // Exchange authorization code for tokens
    const client = new InoreaderClient(
      INOREADER_CLIENT_ID,
      INOREADER_CLIENT_SECRET
    );
    const tokenData = await client.exchangeCodeForTokens(
      code,
      INOREADER_REDIRECT_URI
    );

    // Store tokens in Redis (or database in production)
    if (redis) {
      const tokens = client.getTokens();
      await redis.set(
        "inoreader:tokens",
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

      console.warn("✅ Inoreader tokens stored successfully");
    } else {
      console.warn("⚠️ Redis not configured - tokens not persisted");
    }

    // Redirect to dev news page with success message.
    // Clear the one-time OAuth state cookie.
    const successRedirect = NextResponse.redirect(
      new URL("/dev/news?auth=success", request.nextUrl.origin)
    );
    successRedirect.cookies.delete("inoreader_oauth_state");
    return successRedirect;
  } catch (error) {
    console.error("❌ Inoreader OAuth callback error:", error);

    return NextResponse.redirect(
      new URL(
        `/dev/news?auth=error&message=${encodeURIComponent(
          error instanceof Error ? error.message : "Unknown error"
        )}`,
        request.nextUrl.origin
      )
    );
  }
}
