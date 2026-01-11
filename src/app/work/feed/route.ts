/**
 * Work Feed (Unified)
 *
 * Provides a feed of all work items (projects, creative works) in multiple formats.
 * Available at:
 * - /work/feed (Atom - default)
 * - /work/feed?format=atom (Atom 1.0)
 * - /work/feed?format=rss (RSS 2.0)
 * - /work/feed?format=json (JSON Feed 1.1)
 *
 * @see src/lib/feeds.ts for feed generation logic
 */

import { NextRequest, NextResponse } from "next/server";
import { projects } from "@/data/projects";
import { buildProjectsFeed } from "@/lib/feeds";
import type { FeedFormat } from "@/lib/feeds";

// Make this route dynamic to allow query parameter-based format selection
export const dynamic = "force-dynamic";

// Lower update frequency for work feed (6 hours)
export const revalidate = 21600;

export async function GET(request: NextRequest) {
  try {
    // Get format from query parameter (default: atom)
    const { searchParams } = new URL(request.url);
    const formatParam = searchParams.get("format")?.toLowerCase();

    // Validate and determine format
    let format: FeedFormat = "atom"; // Default to Atom
    let contentType = "application/atom+xml; charset=utf-8";

    if (formatParam === "rss") {
      format = "rss";
      contentType = "application/rss+xml; charset=utf-8";
    } else if (formatParam === "json") {
      format = "json";
      contentType = "application/feed+json; charset=utf-8";
    }

    // Generate feed in requested format
    const feed = await buildProjectsFeed(projects, format, 20, "/work");

    return new NextResponse(feed, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error generating work feed:", error);
    return new NextResponse("Error generating feed", { status: 500 });
  }
}
