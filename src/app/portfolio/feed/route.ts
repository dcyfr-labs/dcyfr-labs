/**
 * Projects Feed (Atom 1.0)
 * 
 * Provides a feed of projects only.
 * Available at: /projects/feed
 * 
 * @see src/lib/feeds.ts for feed generation logic
 */

import { NextResponse } from "next/server";
import { projects } from "@/data/projects";
import { buildProjectsFeed } from "@/lib/feeds";

export const revalidate = 3600; // 1 hour

export async function GET() {
  try {
    const xml = await buildProjectsFeed(projects, "atom", 20);
    
    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/atom+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error generating projects feed:", error);
    return new NextResponse("Error generating feed", { status: 500 });
  }
}
