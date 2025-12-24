"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityItem as ActivityItemComponent } from "@/components/activity/ActivityItem";
import { FeedInterruption, type FeedInterruptionProps } from "@/components/activity";
import { useInfiniteActivity } from "@/hooks/use-infinite-activity";
import { useActivityWithInterruptions, type FeedItem } from "@/hooks/use-activity-with-interruptions";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { cn } from "@/lib/utils";
import { ANIMATION, TYPOGRAPHY } from "@/lib/design-tokens";
import type { ActivityItem } from "@/lib/activity";

// ============================================================================
// TYPES
// ============================================================================

interface InfiniteActivitySectionProps {
  /** All activity items */
  items: ActivityItem[];
  /** Initial number of items to show */
  initialCount?: number;
  /** Items to load per page */
  pageSize?: number;
  /** Max height for the scrollable container */
  maxHeight?: string;
  /** Content interruptions to intersperse */
  interruptions?: FeedInterruptionProps[];
  /** Insert interruption every N items */
  interruptionInterval?: number;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// DEFAULT INTERRUPTIONS
// ============================================================================

const DEFAULT_INTERRUPTIONS: FeedInterruptionProps[] = [
  {
    type: "cta",
    title: "Explore the Blog",
    description: "Discover in-depth articles on security, architecture, and modern development practices.",
    href: "/blog",
    buttonLabel: "Browse articles",
    theme: "cyan",
  },
  {
    type: "quote",
    quote: "Security is not a product, but a process. It's about layers, vigilance, and continuous improvement.",
    source: "Security Architecture Philosophy",
    theme: "lime",
  },
  {
    type: "newsletter",
    title: "Stay Updated",
    description: "Subscribe to the RSS feed for the latest posts and project updates.",
  },
];

// ============================================================================
// CONSTANTS
// ============================================================================

const SCROLL_TO_TOP_THRESHOLD = 300;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * InfiniteActivitySection
 *
 * Homepage section that displays an infinite-scrolling activity feed
 * with content interruptions interspersed between activities.
 *
 * Features:
 * - Infinite scroll with simulated loading
 * - Content interruptions (CTAs, quotes, newsletter prompts)
 * - Scroll position restoration
 * - Scroll-to-top button
 * - Timeline connector styling
 *
 * @example
 * ```tsx
 * <InfiniteActivitySection
 *   items={allActivities}
 *   initialCount={5}
 *   pageSize={5}
 *   maxHeight="50vh"
 *   interruptions={[
 *     { type: "cta", title: "...", ... },
 *     { type: "quote", quote: "...", ... },
 *   ]}
 * />
 * ```
 */
export function InfiniteActivitySection({
  items,
  initialCount = 10,
  pageSize = 5,
  maxHeight = "60vh",
  interruptions = DEFAULT_INTERRUPTIONS,
  interruptionInterval = 4,
  className,
}: InfiniteActivitySectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

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
    initialPageSize: initialCount,
    pageSize,
  });

  // Inject interruptions into the feed
  const { feedItems } = useActivityWithInterruptions({
    activities: visibleItems,
    interruptions,
    interval: interruptionInterval,
    startAfter: 3,
    maxInterruptions: 3,
  });

  // Scroll restoration
  useScrollRestoration("homepage-activity", scrollRef);

  // Scroll detection for "scroll to top" button
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollTop = scrollRef.current.scrollTop;
    const atBottom =
      scrollRef.current.scrollHeight - scrollRef.current.scrollTop <=
      scrollRef.current.clientHeight + 100;

    // Trigger load more when near bottom
    if (atBottom && hasMore && !isLoadingMore) {
      loadMore();
    }
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
        <span>
          Showing {visibleCount} of {totalCount} activities
        </span>
        {hasMore && (
          <span className={cn("animate-pulse", ANIMATION.duration.slow)}>
            Scroll for more
          </span>
        )}
      </div>

      {/* Scrollable feed container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ maxHeight }}
        className="overflow-auto rounded-lg"
      >
        <div className="relative">
          {/* Timeline connector line */}
          <div className="absolute left-4.75 top-4 bottom-4 w-px bg-border/50" />

          {/* Feed items with staggered entrance animations */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {feedItems.map((feedItem, index) => (
                <motion.div
                  key={feedItem.type === "activity" ? feedItem.item.id : `interruption-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min(index * 0.05, 0.3), // Cap delay at 0.3s
                    ease: "easeOut",
                  }}
                  layout
                  className="relative"
                >
                  {feedItem.type === "activity" ? (
                    <ActivityItemComponent
                      activity={feedItem.item}
                      variant="timeline"
                      showConnector
                      isLast={index === feedItems.length - 1}
                    />
                  ) : (
                    <div className="ml-10 md:ml-12">
                      <FeedInterruption
                        {...feedItem.item}
                        animationDelay={0} // Animation handled by parent motion.div
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Loading indicator with entrance animation */}
          <AnimatePresence>
            {isLoadingMore && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="py-6 text-center"
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
      </div>

      {/* End indicator */}
      {!hasMore && visibleCount > 0 && (
        <div className="text-center text-sm text-muted-foreground py-4 border-t border-border/50 mt-2">
          You&apos;ve reached the end of the activity feed
        </div>
      )}

      {/* Scroll to top button (fixed position within section) */}
      {scrollRef.current && scrollRef.current.scrollTop > SCROLL_TO_TOP_THRESHOLD && (
        <Button
          onClick={scrollToTop}
          size="icon"
          variant="secondary"
          className={cn(
            "absolute bottom-4 right-4 rounded-full shadow-lg z-10",
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

export default InfiniteActivitySection;
