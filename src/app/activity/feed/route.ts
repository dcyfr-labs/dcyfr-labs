/**
 * Activity Feed (Unified)
 *
 * Comprehensive feed combining blog posts, projects, and changelog updates.
 * Available at:
 * - /activity/feed (Atom - default)
 * - /activity/feed?format=atom (Atom 1.0)
 * - /activity/feed?format=rss (RSS 2.0)
 * - /activity/feed?format=json (JSON Feed 1.1)
 *
 * Content is sanitized to remove accessibility and footnote attributes
 * that cause feed validation issues.
 *
 * Updates more frequently than other feeds (30 min revalidation) since
 * activity content changes more dynamically.
 *
 * @see src/lib/feeds.ts for feed generation logic
 */

import { NextRequest, NextResponse } from "next/server";
import { posts } from "@/data/posts";
import { projects } from "@/data/projects";
import { changelog } from "@/data/changelog";
import { buildActivityFeed } from "@/lib/feeds";
import type { FeedFormat } from "@/lib/feeds";

// Make this route dynamic to allow query parameter-based format selection
export const dynamic = "force-dynamic";

// Higher update frequency for activity feed (30 minutes)
export const revalidate = 1800;

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
    const feed = await buildActivityFeed(
      posts,
      projects,
      changelog,
      format,
      50
    );

    return new NextResponse(feed, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error generating activity feed:", error);
    return new NextResponse("Error generating feed", { status: 500 });
  }
}
