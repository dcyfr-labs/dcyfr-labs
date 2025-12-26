import type { Metadata } from "next";
import { posts } from "@/data/posts";
import { PageLayout } from "@/components/layouts";
import { createPageMetadata } from "@/lib/metadata";
import { CONTAINER_WIDTHS } from "@/lib/design-tokens";
import { LikesClient } from "./likes-client";

export const metadata: Metadata = createPageMetadata({
  title: "Likes",
  description: "Content you've liked and engaged with",
  path: "/likes",
});

/**
 * Likes Page (Server Component)
 *
 * Fetches all posts server-side and passes to client component.
 * Client component handles localStorage like filtering.
 */
export default function LikesPage() {
  return (
    <PageLayout>
      <div className={`mx-auto ${CONTAINER_WIDTHS.standard}`}>
        <LikesClient posts={posts} />
      </div>
    </PageLayout>
  );
}
