"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThreadedActivityFeed } from "@/components/activity/ThreadedActivityFeed";
import { useInfiniteActivity } from "@/hooks/use-infinite-activity";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/lib/activity";
import { SPACING } from "@/lib/design-tokens";

// ============================================================================
// TYPES
// ============================================================================

interface InfiniteActivitySectionProps {
  /** All activity items */
  items: ActivityItem[];
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
 */
export function InfiniteActivitySection({
  items,
  totalActivities,
  initialCount = 10,
  pageSize = 5,
  showProgress = true,
  maxItemsBeforeCTA = 20,
  ctaText = "View full activity timeline",
  ctaHref = "/activity",
  className,
}: InfiniteActivitySectionProps) {
  const loadTriggerRef = useRef<HTMLDivElement>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Infinite scroll pagination
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

  return (
    <div className={cn("relative w-full", className)}>
      {/* Progress indicator */}
      {showProgress && (
        <div className="mb-12 text-xs text-muted-foreground">
          <span className="font-medium">
            Showing <span className="text-foreground">{visibleCount}</span> of{" "}
            <span className="text-foreground">{totalCount}</span> activities
          </span>
        </div>
      )}

      {/* Timeline wrapper */}
      <div className="relative">
        {/* Threaded Activity Feed */}
        <ThreadedActivityFeed
          activities={visibleItems}
          className="mb-8"
        />

        {/* Loading indicator with entrance animation */}
        <AnimatePresence>
          {isLoadingMore && !shouldShowCTA && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="py-4 text-center"
            >
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                />
                Loading more...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center py-8 border-t border-border/50 mt-8"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Viewing {visibleCount} of {totalCount} activities
          </p>
          <Button asChild variant="default" size="default">
            <Link href={ctaHref} className="gap-2">
              {ctaText}
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      )}

      {/* End indicator */}
      {!hasMore && visibleCount > 0 && !shouldShowCTA && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-muted-foreground py-8 border-t border-border/50 mt-8"
        >
          <p className="mb-3">You&apos;ve reached the end of recent activity</p>
          <Button asChild variant="outline" size="sm">
            <Link href={ctaHref} className="gap-2">
              View all activity
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </motion.div>
      )}
    </div>
  );
}

export default InfiniteActivitySection;
