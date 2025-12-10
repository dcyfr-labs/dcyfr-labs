/**
 * BlogListSkeleton
 *
 * Loading skeleton for blog post list with different layout support
 * Displays placeholder content while post list and view counts are loading
 *
 * Sizes match actual PostList layout to prevent Cumulative Layout Shift (CLS)
 */

import { CONTAINER_PADDING, SPACING } from "@/lib/design-tokens";

interface BlogListSkeletonProps {
  /** Layout mode - determines skeleton structure */
  layout?: "grid" | "list" | "magazine" | "compact" | "grouped";
  /** Number of skeleton items to show */
  itemCount?: number;
}

/**
 * Skeleton placeholder for a single blog post item
 * Supports different layout modes
 */
function PostItemSkeleton({
  layout = "grid",
}: {
  layout: "grid" | "list" | "magazine" | "compact";
}) {
  if (layout === "list") {
    return (
      <div className="py-4 border-b border-gray-200 dark:border-gray-800 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-3" />
        <div className="flex gap-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
      </div>
    );
  }

  if (layout === "magazine") {
    return (
      <article className="animate-pulse">
        <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
      </article>
    );
  }

  if (layout === "compact") {
    return (
      <div className="py-3 border-b border-gray-200 dark:border-gray-800 animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-1" />
        <div className="flex gap-2 text-sm">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
        </div>
      </div>
    );
  }

  // Default: grid layout
  return (
    <article className="animate-pulse">
      <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-3" />
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
      <div className="flex gap-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
      </div>
    </article>
  );
}

/**
 * Full blog list skeleton with multiple items
 * Shows loading state while post data and view counts are being fetched
 */
export function BlogListSkeleton({
  layout = "grid",
  itemCount = 3,
}: BlogListSkeletonProps) {
  return (
    <div id="blog-posts" className={`px-2 sm:px-4 lg:px-8 w-full`}>
      {/* Mobile filters skeleton (below lg breakpoint) */}
      <div className="lg:hidden mb-6">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Post list skeleton - grid layout */}
      {layout === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: itemCount }).map((_, i) => (
            <PostItemSkeleton key={i} layout="grid" />
          ))}
        </div>
      )}

      {/* Post list skeleton - list layout */}
      {layout === "list" && (
        <div className="space-y-0">
          {Array.from({ length: itemCount }).map((_, i) => (
            <PostItemSkeleton key={i} layout="list" />
          ))}
        </div>
      )}

      {/* Post list skeleton - magazine layout */}
      {layout === "magazine" && (
        <div className="space-y-8">
          {Array.from({ length: Math.min(itemCount, 2) }).map((_, i) => (
            <PostItemSkeleton key={i} layout="magazine" />
          ))}
        </div>
      )}

      {/* Post list skeleton - compact layout */}
      {layout === "compact" && (
        <div className="space-y-0">
          {Array.from({ length: itemCount + 3 }).map((_, i) => (
            <PostItemSkeleton key={i} layout="compact" />
          ))}
        </div>
      )}

      {/* Post list skeleton - grouped layout */}
      {layout === "grouped" && (
        <div className={SPACING.subsection}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border-b pb-4 last:border-b-0">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4 animate-pulse" />
              <div className={SPACING.content}>
                {Array.from({ length: 4 }).map((_, j) => (
                  <PostItemSkeleton key={j} layout="compact" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination skeleton */}
      <div className="mt-8">
        <div className="flex justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
