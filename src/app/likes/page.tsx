import type { Metadata } from "next";
import { posts } from "@/data/posts";
import { PageLayout } from "@/components/layouts";
import { createPageMetadata } from "@/lib/metadata";
import { CONTAINER_WIDTHS } from "@/lib/design-tokens";
import { LikesClient } from "./likes-client";
import { getBasicActivities } from "@/lib/activity/helpers.server";

// Force dynamic rendering - don't attempt to prerender during build
// This page requires database/Redis access for activities
export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: "Likes",
  description: "Content you've liked and engaged with",
  path: "/likes",
});

/**
 * Likes Page (Server Component)
 *
 * Fetches all posts and activities server-side and passes to client component.
 * Client component handles localStorage like filtering.
 * Supports liking both blog posts AND all activity types (GitHub, projects, etc.)
 */
export default async function LikesPage() {
  // Get all activities (includes blog posts, projects, GitHub activity, etc.)
  const activities = await getBasicActivities();

  return (
    <PageLayout>
      <div className={`mx-auto ${CONTAINER_WIDTHS.standard}`}>
        <LikesClient posts={posts} activities={activities} />
      </div>
    </PageLayout>
  );
}
