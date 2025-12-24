"use client";

import { useRef, useMemo, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY, ANIMATION } from "@/lib/design-tokens";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { ActivityItem } from "./ActivityItem";
import { ActivitySkeleton } from "./ActivitySkeleton";
import {
  type ActivityItem as ActivityItemType,
  type ActivityVariant,
  type TimeGroup,
  groupActivitiesByTime,
  TIME_GROUP_LABELS,
} from "@/lib/activity";

// ============================================================================
// TYPES
// ============================================================================

interface VirtualActivityFeedProps {
  /** Activity items to display */
  items: ActivityItemType[];

  /** Display variant */
  variant?: ActivityVariant;

  /** Whether to show time group headers */
  showGroups?: boolean;

  /** Loading state */
  isLoading?: boolean;

  /** CSS class overrides */
  className?: string;

  /** Empty state message */
  emptyMessage?: string;

  /** Enable infinite scroll */
  enableInfiniteScroll?: boolean;

  /** Callback when reaching end for infinite scroll */
  onLoadMore?: () => void | Promise<void>;

  /** Loading more items */
  isLoadingMore?: boolean;

  /** Has more items to load */
  hasMore?: boolean;
}

type VirtualItem = {
  type: "header" | "activity";
  id: string;
  group?: TimeGroup;
  activity?: ActivityItemType;
  isLast?: boolean;
};

// ============================================================================
// CONSTANTS
// ============================================================================

const TIME_GROUP_ORDER: TimeGroup[] = [
  "today",
  "this-week",
  "this-month",
  "older",
];

const SCROLL_TO_TOP_THRESHOLD = 500; // Show button after scrolling 500px
const INFINITE_SCROLL_THRESHOLD = 0.9; // Load more at 90% scroll

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Virtual Scrolling Activity Feed
 *
 * High-performance activity feed that only renders visible items.
 * Handles 1000+ items efficiently with minimal memory footprint.
 *
 * Features:
 * - Virtual scrolling (only renders visible items)
 * - Variable item heights (auto-calculated)
 * - Time group headers (sticky)
 * - Scroll-to-top button
 * - Infinite scroll support
 * - Scroll position restoration
 *
 * @example
 * ```tsx
 * <VirtualActivityFeed
 *   items={activities}
 *   variant="timeline"
 *   showGroups
 *   enableInfiniteScroll
 *   onLoadMore={loadMoreActivities}
 * />
 * ```
 */
export function VirtualActivityFeed({
  items,
  variant = "timeline",
  showGroups = false,
  isLoading = false,
  className,
  emptyMessage = "No recent activity",
  enableInfiniteScroll = false,
  onLoadMore,
  isLoadingMore = false,
  hasMore = false,
}: VirtualActivityFeedProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const scrollingRef = useRef<boolean>(false);

  // Scroll position restoration
  useScrollRestoration("virtual-activity-feed", parentRef);

  // Prepare virtual items (flatten groups + activities)
  const virtualItems = useMemo(() => {
    if (items.length === 0) {
      return [];
    }
    
    if (!showGroups) {
      // Simple list without groups
      return items.map((activity, index): VirtualItem => ({
        type: "activity",
        id: activity.id,
        activity,
        isLast: index === items.length - 1,
      }));
    }

    // Grouped list with headers
    const groups = groupActivitiesByTime(items);
    const result: VirtualItem[] = [];

    TIME_GROUP_ORDER.forEach((group) => {
      const groupItems = groups.get(group);
      if (!groupItems?.length) return;

      // Add header
      result.push({
        type: "header",
        id: `header-${group}`,
        group,
      });

      // Add activities
      groupItems.forEach((activity, index) => {
        result.push({
          type: "activity",
          id: `${group}-${activity.id}`,
          group,
          activity,
          isLast: index === groupItems.length - 1,
        });
      });
    });

    return result;
  }, [items, showGroups]);

  // Estimate item size based on type
  const estimateSize = (index: number) => {
    const item = virtualItems[index];
    
    if (item.type === "header") {
      return 60; // Group header height
    }

    // Activity item height varies by type and variant
    if (variant === "compact") {
      return 60; // Compact items
    }

    if (variant === "minimal") {
      return 40; // Minimal items
    }

    // Standard/timeline variant - estimate by source
    const source = item.activity?.source;
    if (source === "blog") {
      return 250; // Blog posts have more content
    }
    if (source === "project") {
      return 200; // Projects are medium
    }
    return 150; // Default for milestones, etc.
  };

  // Virtual scrolling setup
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual API returns functions that cannot be memoized safely
  const virtualizer = useVirtualizer({
    count: virtualItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5, // Render 5 items above/below viewport
    measureElement:
      typeof window !== "undefined" && navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
  });

  const virtualRows = virtualizer.getVirtualItems();

  // Infinite scroll handler
  useEffect(() => {
    if (!enableInfiniteScroll || !hasMore || isLoadingMore || !onLoadMore) {
      return;
    }

    const [lastItem] = [...virtualRows].reverse();
    if (!lastItem) return;

    // Trigger load more when near bottom
    const scrollPercentage = lastItem.index / virtualItems.length;
    if (scrollPercentage >= INFINITE_SCROLL_THRESHOLD && !scrollingRef.current) {
      scrollingRef.current = true;
      Promise.resolve(onLoadMore()).finally(() => {
        scrollingRef.current = false;
      });
    }
  }, [virtualRows, virtualItems.length, enableInfiniteScroll, hasMore, isLoadingMore, onLoadMore]);

  // Scroll to top functionality
  const scrollToTop = () => {
    parentRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Show scroll-to-top button after threshold
  const showScrollToTop = (virtualizer.scrollOffset ?? 0) > SCROLL_TO_TOP_THRESHOLD;

  return (
    <div className={cn("relative", className)}>
      {/* Scrollable container */}
      <div
        ref={parentRef}
        className="overflow-auto max-h-[80vh]"
        style={{
          contain: "strict",
        }}
      >
        {virtualItems.length === 0 && !isLoading ? (
          <div className="flex items-center justify-center py-16 text-center">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualRows.map((virtualRow) => {
            const item = virtualItems[virtualRow.index];

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {item.type === "header" ? (
                  <div className="py-2 sticky top-0 bg-background/95 backdrop-blur z-10">
                    <h3
                      className={cn(
                        TYPOGRAPHY.h3.standard,
                        "text-muted-foreground uppercase tracking-wider"
                      )}
                    >
                      {TIME_GROUP_LABELS[item.group!]}
                    </h3>
                  </div>
                ) : (
                  <div className={variant === "timeline" ? "relative" : ""}>
                    <ActivityItem
                      activity={item.activity!}
                      variant={variant}
                      isLast={item.isLast}
                      showConnector={variant === "timeline"}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading more indicator */}
          {isLoadingMore && (
            <div className="py-8 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Loading more...
              </div>
            </div>
          )}
          </div>
        )}
      </div>

      {/* Scroll to top button */}
      {showScrollToTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className={cn(
            "fixed bottom-6 right-6 rounded-full shadow-lg z-50",
            ANIMATION.duration.normal,
            "animate-in fade-in slide-in-from-bottom-2"
          )}
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export default VirtualActivityFeed;
