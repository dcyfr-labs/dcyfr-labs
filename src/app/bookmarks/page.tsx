import type { Metadata } from "next";
import { posts } from "@/data/posts";
import { PageLayout } from "@/components/layouts";
import { createPageMetadata } from "@/lib/metadata";
import { CONTAINER_WIDTHS } from "@/lib/design-tokens";
import { BookmarksClient } from "./bookmarks-client";

export const metadata: Metadata = createPageMetadata({
  title: "Bookmarks",
  description: "Your saved content for later reading",
  path: "/bookmarks",
});

/**
 * Bookmarks Page (Server Component)
 * 
 * Fetches all posts server-side and passes to client component.
 * Client component handles localStorage bookmark filtering.
 */
export default function BookmarksPage() {
  return (
    <PageLayout>
      <div className={`mx-auto ${CONTAINER_WIDTHS.standard}`}>
        <BookmarksClient posts={posts} />
      </div>
    </PageLayout>
  );
}

