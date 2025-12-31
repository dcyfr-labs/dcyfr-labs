/**
 * View Count Display Component (Server Component)
 *
 * Fetches and displays view count for a blog post.
 * Designed to be wrapped in Suspense for progressive reveal.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<ViewCountSkeleton />}>
 *   <ViewCountDisplay postId={post.id} />
 * </Suspense>
 * ```
 */

import { getPostViews } from "@/lib/views.server";

interface ViewCountDisplayProps {
  postId: string;
}

export async function ViewCountDisplay({ postId }: ViewCountDisplayProps) {
  const viewCount = await getPostViews(postId);

  if (typeof viewCount !== "number") return null;

  return (
    <>
      <span aria-hidden="true">·</span>
      <span>
        {viewCount.toLocaleString()} {viewCount === 1 ? "view" : "views"}
      </span>
    </>
  );
}

/**
 * Skeleton fallback for view count
 */
export function ViewCountSkeleton() {
  return (
    <>
      <span aria-hidden="true">·</span>
      <span className="inline-block w-16 h-4 bg-muted rounded animate-pulse" />
    </>
  );
}
