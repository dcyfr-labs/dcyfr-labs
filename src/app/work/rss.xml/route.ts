/**
 * Work RSS 2.0 Feed (Legacy Redirect)
 *
 * Redirects to the unified feed endpoint with RSS format.
 * Old: /work/rss.xml
 * New: /work/feed?format=rss
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(
    new URL(
      "/work/feed?format=rss",
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    ),
    301
  );
}
