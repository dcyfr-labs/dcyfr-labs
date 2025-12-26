/**
 * Site JSON Feed (JSON Feed 1.1)
 * 
 * Alternative format for /feed (which defaults to RSS).
 * Available at: /feed.json
 * 
 * @see src/lib/feeds.ts for feed generation logic
 */

import { NextResponse } from "next/server";
import { posts } from "@/data/posts";
import { projects } from "@/data/projects";
import { buildCombinedFeed } from "@/lib/feeds";

export const revalidate = 3600; // 1 hour

export async function GET() {
  try {
    const json = await buildCombinedFeed(posts, projects, "json", 20);
    
    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/feed+json; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "X-Feed-Format": "JSON Feed 1.1",
      },
    });
  } catch (error) {
    console.error("Error generating JSON feed:", error);
    return new NextResponse("Error generating feed", { status: 500 });
  }
}
