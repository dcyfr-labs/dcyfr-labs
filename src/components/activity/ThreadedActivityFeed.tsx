/**
 * Threaded Activity Feed Component
 *
 * Main container for displaying activities in a Threads-inspired layout.
 * Converts flat activity list into threaded conversations.
 *
 * Features:
 * - Auto-threading of related activities
 * - Single-column, max-w-2xl container
 * - Empty state handling
 * - Dividers between threads
 *
 * @example
 * ```tsx
 * <ThreadedActivityFeed
 *   activities={activities}
 *   emptyMessage="No activities to display"
 * />
 * ```
 */

"use client";

import { useMemo } from "react";
import { Eye, Lock, Zap } from "lucide-react";
import { ThreadedActivityGroup } from "./ThreadedActivityGroup";
import { Alert } from "@/components/common/alert";
import { groupActivitiesIntoThreads } from "@/lib/activity/threading";
import type { ActivityItem } from "@/lib/activity/types";
import { cn } from "@/lib/utils";
import { CONTAINER_WIDTHS, SPACING } from "@/lib/design-tokens";

// ============================================================================
// TYPES
// ============================================================================

export interface ThreadedActivityFeedProps {
  /** Activities to display (must be sorted by timestamp DESC) */
  activities: ActivityItem[];
  /** Empty state message */
  emptyMessage?: string;
  /** Optional CSS class */
  className?: string;
  /** Max activities to show (pagination) */
  limit?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Threaded activity feed container
 */
export function ThreadedActivityFeed({
  activities,
  emptyMessage = "No activities to display",
  className,
  limit,
}: ThreadedActivityFeedProps) {
  // Group activities into threads (memoized for performance)
  const threads = useMemo(() => {
    const limitedActivities = limit ? activities.slice(0, limit) : activities;
    return groupActivitiesIntoThreads(limitedActivities);
  }, [activities, limit]);

  // Empty state
  if (threads.length === 0) {
    return (
      <div className={cn(CONTAINER_WIDTHS.thread, "mx-auto", className)}>
        <Alert type="info">{emptyMessage}</Alert>
      </div>
    );
  }

  return (
    <div className={cn(CONTAINER_WIDTHS.thread, "mx-auto", className)}>
      <div className={SPACING.subsection}>
        {/* Render Threads */}
        {threads.map((thread, index) => (
          <div key={thread.id}>
            <ThreadedActivityGroup thread={thread} />

            {/* Divider between threads (except last) */}
            {index < threads.length - 1 && (
              <div
                className="my-12 border-t border-border/50"
                aria-hidden="true"
              />
            )}
          </div>
        ))}

        {/* End of Timeline Easter Egg
        <div className="mt-16 pt-12 border-t border-border/50 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span className="text-sm">observer.detected</span>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground/60">
              [achievement_locked: explorer_001]
            </p>
            <p className="text-xs text-muted-foreground/50 flex items-center justify-center gap-2">
              <Zap className="h-3 w-3" />
              collecting artifacts...
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
}
