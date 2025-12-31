/**
 * Activity Feed - JSON Format (Legacy Redirect)
 *
 * Redirects to the unified feed endpoint with JSON format.
 * Old: /activity/feed.json
 * New: /activity/feed?format=json
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(
    new URL(
      "/activity/feed?format=json",
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    ),
    301
  );
}
