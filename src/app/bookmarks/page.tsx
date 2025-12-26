import type { Metadata } from "next";
import { posts } from "@/data/posts";
import { PageLayout } from "@/components/layouts";
import { createPageMetadata } from "@/lib/metadata";
import { CONTAINER_WIDTHS } from "@/lib/design-tokens";
import { BookmarksClient } from "./bookmarks-client";
import { getBasicActivities } from "@/lib/activity/helpers.server";

export const metadata: Metadata = createPageMetadata({
  title: "Bookmarks",
  description: "Your saved content for later reading",
  path: "/bookmarks",
});

/**
 * Bookmarks Page (Server Component)
 *
 * Fetches all posts and activities server-side and passes to client component.
 * Client component handles localStorage bookmark filtering.
 * Supports bookmarking both blog posts AND all activity types (GitHub, projects, etc.)
 */
export default async function BookmarksPage() {
  // Get all activities (includes blog posts, projects, GitHub activity, etc.)
  const activities = await getBasicActivities();

  return (
    <PageLayout>
      <div className={`mx-auto ${CONTAINER_WIDTHS.standard}`}>
        <BookmarksClient posts={posts} activities={activities} />
      </div>
    </PageLayout>
  );
}

