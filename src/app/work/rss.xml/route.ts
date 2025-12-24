/**
 * Work RSS 2.0 Feed
 * 
 * Provides an RSS 2.0 feed of portfolio projects.
 * Available at: /work/rss.xml
 */

import { NextResponse } from "next/server";
import { projects } from "@/data/projects";
import { buildProjectsFeed } from "@/lib/feeds";

// Lower update frequency for work feed (6 hours)
export const revalidate = 21600;

export async function GET() {
  try {
    const xml = await buildProjectsFeed(projects, "rss", 20, "/work");
    
    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error generating work RSS feed:", error);
    return new NextResponse("Error generating feed", { status: 500 });
  }
}
