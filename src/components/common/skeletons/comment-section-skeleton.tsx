/**
 * Comment Section Skeleton
 *
 * Loading skeleton for Giscus comments section.
 * Provides placeholder while comments load asynchronously.
 */

import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonHeading, SkeletonAvatar } from "@/components/ui/skeleton-primitives";
import { SPACING } from "@/lib/design-tokens";

export interface CommentSectionSkeletonProps {
  /** Number of comment placeholders */
  commentCount?: number;
  /** Additional classes */
  className?: string;
}

/**
 * Skeleton for comment sections (Giscus)
 * Shows realistic comment thread structure
 */
export function CommentSectionSkeleton({
  commentCount = 3,
  className,
}: CommentSectionSkeletonProps) {
  return (
    <div className={className}>
      {/* Section header */}
      <div className="mb-6">
        <SkeletonHeading level="h3" width="w-48" />
      </div>

      {/* Comment input area */}
      <div className="mb-8 p-4 rounded-lg border">
        <div className="flex gap-3">
          <SkeletonAvatar size="md" />
          <div className="flex-1">
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className={SPACING.content}>
        {[...Array(commentCount)].map((_, i) => (
          <div key={i} className="flex gap-3">
            {/* Avatar */}
            <SkeletonAvatar size="md" />

            {/* Comment content */}
            <div className="flex-1">
              {/* Author and timestamp */}
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>

              {/* Comment text */}
              <div className="space-y-2 mb-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
