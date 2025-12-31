/**
 * Hottest Post Calculator Component (Server Component)
 *
 * Calculates which post has the most views across all posts.
 * Designed to be wrapped in Suspense for progressive reveal.
 * Returns the slug of the hottest post or null.
 *
 * @example
 * ```tsx
 * <Suspense fallback={null}>
 *   <HottestPostCalculator posts={posts} />
 * </Suspense>
 * ```
 */

import { getMultiplePostViews } from "@/lib/views.server";
import type { Post } from "@/data/posts";

interface HottestPostCalculatorProps {
  posts: Post[];
  onResult: (hottestSlug: string | null) => void;
}

export async function HottestPostCalculator({
  posts,
}: HottestPostCalculatorProps) {
  // Use post IDs for view lookups, then map back to slugs
  const postIdToSlug = new Map(posts.map((p) => [p.id, p.slug]));
  const viewMap = await getMultiplePostViews(posts.map((p) => p.id));

  let hottestSlug: string | null = null;
  let maxViews = 0;

  viewMap.forEach((views, postId) => {
    if (views > maxViews) {
      maxViews = views;
      hottestSlug = postIdToSlug.get(postId) ?? null;
    }
  });

  // This component doesn't render anything - it's used for data fetching only
  // The parent component should use the result via a wrapper pattern
  return null;
}

/**
 * Hook-style wrapper for getting hottest post slug
 * Use this in the parent component to get the result
 */
export async function getHottestPostSlug(
  posts: Post[]
): Promise<string | null> {
  const postIdToSlug = new Map(posts.map((p) => [p.id, p.slug]));
  const viewMap = await getMultiplePostViews(posts.map((p) => p.id));

  let hottestSlug: string | null = null;
  let maxViews = 0;

  viewMap.forEach((views, postId) => {
    if (views > maxViews) {
      maxViews = views;
      hottestSlug = postIdToSlug.get(postId) ?? null;
    }
  });

  return hottestSlug;
}
