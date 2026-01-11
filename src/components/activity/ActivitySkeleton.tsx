/**
 * Activity Feed Skeleton Loader
 *
 * Loading state for activity items with:
 * - Shimmer animation
 * - Responsive sizing matching actual content
 * - Multiple variants (compact, standard, timeline, minimal)
 * - Matches Medium/Substack content-focused layout
 *
 * @example
 * ```tsx
 * // Loading state for standard activity
 * <ActivitySkeleton variant="standard" />
 *
 * // Loading state for compact (homepage widget)
 * <ActivitySkeleton variant="compact" />
 * ```
 */

"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { SPACING } from "@/lib/design-tokens";
import type { ActivityVariant } from "@/lib/activity";

// ============================================================================
// TYPES
// ============================================================================

export interface ActivitySkeletonProps {
  /** Skeleton variant */
  variant?: ActivityVariant;
  /** Show featured image skeleton */
  showImage?: boolean;
  /** Optional CSS class */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Skeleton loader for activity feed items
/**
 * Skeleton loader for activity feed items
 */
export function ActivitySkeleton({
  variant = "standard",
  showImage = true,
  className,
}: ActivitySkeletonProps) {
  // Map variants to skeleton layouts
  const isCompact = variant === "compact";
  const isMinimal = variant === "minimal";
  const isFull = variant === "standard" || variant === "timeline";

  return (
    <div className={cn("relative", className)}>
      {/* Compact/Minimal Layout - single line */}
      {(isCompact || isMinimal) && (
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-4 w-16" />
        </div>
      )}

      {/* Full Layout - standard or timeline */}
      {isFull && (
        <div className="w-full">
          {/* Header: Badges */}
          <div className="flex items-center gap-2 mb-1.5">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>

          {/* Content with activity spacing */}
          <div className={SPACING.activity.contentGap}>
            {/* Title */}
            <Skeleton className="h-8 md:h-9 lg:h-10 w-3/4" />
            <Skeleton className="h-8 md:h-9 lg:h-10 w-1/2" />

            {/* Featured Image (16:9 aspect ratio) */}
            {showImage && (
              <Skeleton className="aspect-[16/9] h-64 md:h-80 lg:h-96 rounded-lg" />
            )}

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-11/12" />
              <Skeleton className="h-5 w-4/5" />
            </div>

            {/* Metadata (tags + stats) */}
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center gap-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-24 ml-auto" />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Multiple skeleton loaders for initial page load
 */
export function ActivitySkeletonGroup({ count = 3 }: { count?: number }) {
  return (
    <div className={SPACING.activity.threadGap}>
      {Array.from({ length: count }).map((_, i) => (
        <ActivitySkeleton
          key={i}
          variant="standard"
          showImage={i === 0} // Only first item shows image
        />
      ))}
    </div>
  );
}
