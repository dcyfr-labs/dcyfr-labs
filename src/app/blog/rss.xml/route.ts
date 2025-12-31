/**
 * Blog RSS 2.0 Feed (Legacy Redirect)
 *
 * Redirects to the unified feed endpoint with RSS format.
 * Old: /blog/rss.xml
 * New: /blog/feed?format=rss
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(
    new URL(
      "/blog/feed?format=rss",
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    ),
    301
  );
}
