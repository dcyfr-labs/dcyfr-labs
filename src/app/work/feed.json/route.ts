/**
 * Work Feed - JSON Format (Legacy Redirect)
 *
 * Redirects to the unified feed endpoint with JSON format.
 * Old: /work/feed.json
 * New: /work/feed?format=json
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(
    new URL(
      "/work/feed?format=json",
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    ),
    301
  );
}
