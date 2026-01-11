"use client";

import { useRef, useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ThreadedActivityFeed } from "@/components/activity";
import { useInfiniteActivity } from "@/hooks/use-infinite-activity";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/lib/activity";
import { SPACING } from "@/lib/design-tokens";

// ============================================================================
// TYPES
// ============================================================================

interface InfiniteActivitySectionProps {
  /** All activity items */
  items?: ActivityItem[];
  /** Total count of all activities (before limiting) */
  totalActivities?: number;
  /** Initial number of items to show */
  initialCount?: number;
  /** Items to load per page */
  pageSize?: number;
  /** Show progress indicator */
  showProgress?: boolean;
  /** Show CTA to full activity page after N items */
  maxItemsBeforeCTA?: number;
  /** CTA text */
  ctaText?: string;
  /** CTA href */
  ctaHref?: string;
  /** Additional class names */
  className?: string;
  /** Loading state - renders skeleton version */
  loading?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SCROLL_TO_TOP_THRESHOLD = 300;
const SCROLL_HINT_HIDE_DELAY = 5000; // Hide scroll hint after 5s

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * InfiniteActivitySection
 *
 * Homepage section that displays activity feed with dynamic page-flow loading
 * using the Threads-inspired threaded activity layout.
 *
 * As the user scrolls down the page, more items load automatically using
 * Intersection Observer API.
 *
 * **Loading State:**
 * Pass `loading={true}` to render skeleton version that matches the real component structure.
 * This ensures loading states never drift from the actual component layout.
 *
 * Features:
 * - Dynamic loading as user scrolls (no constrained container)
 * - Threaded conversation-style grouping
 * - Intersection Observer for optimal performance
 * - Smooth animations for new items
 * - Like, share, and bookmark interactions
 *
 * @example
 * ```tsx
 * <InfiniteActivitySection
 *   items={allActivities}
 *   initialCount={12}
 *   pageSize={8}
 * />
 * ```
 *
 * @example
 * // Show loading skeleton
 * <InfiniteActivitySection loading initialCount={10} />
 */
export function InfiniteActivitySection({
  items = [],
  totalActivities,
  initialCount = 10,
  pageSize = 5,
  showProgress = true,
  maxItemsBeforeCTA = 20,
  ctaText = "View full activity timeline",
  ctaHref = "/activity",
  className,
  loading = false,
}: InfiniteActivitySectionProps) {
  const loadTriggerRef = useRef<HTMLDivElement>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Infinite scroll pagination (call hooks before returns)
  const {
    visibleItems,
    hasMore,
    isLoadingMore,
    loadMore,
    totalCount,
    visibleCount,
  } = useInfiniteActivity({
    items,
    totalActivities,
    initialPageSize: initialCount,
    pageSize,
  });

  // Check if we should show CTA instead of loading more
  const shouldShowCTA = visibleCount >= maxItemsBeforeCTA && hasMore;

  // Intersection Observer for lazy loading when element comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Load more when the trigger element is visible and we're not already loading
          if (entry.isIntersecting && hasMore && !isLoadingMore) {
            loadMore();
            setHasLoadedOnce(true);
          }
        });
      },
      {
        // Trigger loading when element is 200px from bottom of viewport
        rootMargin: "200px",
        threshold: 0,
      }
    );

    const currentRef = loadTriggerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore, loadMore]);

  // Loading state - skeleton version matching real component structure
  if (loading) {
    return (
      <div className={cn("relative w-full", className)}>
        {/* Progress indicator skeleton */}
        {showProgress && (
          <div className="mb-12 text-xs text-muted-foreground -mt-8">
            <Skeleton className="h-4 w-48" />
          </div>
        )}

        {/* Timeline wrapper with activity skeletons */}
        <div className="relative space-y-4">
          {[...Array(initialCount)].map((_, index) => (
            <div
              key={index}
              className="flex gap-4"
              style={{
                animationDelay: `${index * 50}ms`, // Stagger effect
              }}
            >
              {/* Avatar skeleton */}
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />

              {/* Content skeleton */}
              <div className="flex-1 space-y-2">
                {/* Header (name + time) */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>

                {/* Content */}
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />

                {/* Actions */}
                <div className="flex items-center gap-4 pt-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      {/* Progress indicator */}
      {showProgress && (
        <div className="mb-12 text-xs text-muted-foreground -mt-8">
          <span className="font-medium">
            Showing <span className="text-foreground">{visibleCount}</span> of{" "}
            <span className="text-foreground">{totalCount}</span> activities
          </span>
        </div>
      )}

      {/* Timeline wrapper */}
      <div className="relative">
        {/* Threaded Activity Feed */}
        <ThreadedActivityFeed activities={visibleItems} className="" />

        {/* Loading indicator with entrance animation */}
        {isLoadingMore && !shouldShowCTA && (
          <div className="py-4 text-center animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Loading more...
            </div>
          </div>
        )}
      </div>

      {/* Load trigger point for Intersection Observer */}
      {!shouldShowCTA && hasMore && (
        <div
          ref={loadTriggerRef}
          className="h-2 pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* CTA to full activity page */}
      {shouldShowCTA && (
        <div className="text-center pt-8 pb-24 md:pb-8 border-t border-border/50 mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-sm text-muted-foreground mb-3">
            Viewing {visibleCount} of {totalCount} activities
          </p>
          <Button asChild variant="default" size="default">
            <Link href={ctaHref} className="gap-2">
              {ctaText}
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      {/* End indicator */}
      {!hasMore && visibleCount > 0 && !shouldShowCTA && (
        <div className="text-center text-sm text-muted-foreground pt-8 pb-24 md:pb-8 border-t border-border/50 mt-8 animate-in fade-in duration-300">
          <p className="mb-3">You&apos;ve reached the end of recent activity</p>
          <Button asChild variant="outline" size="sm">
            <Link href={ctaHref} className="gap-2">
              View all activity
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export default InfiniteActivitySection;
