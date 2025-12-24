/**
 * Threaded Activity Group Component
 *
 * Wraps a primary activity with its replies into a thread group.
 * Handles expand/collapse of replies when there are many.
 *
 * Features:
 * - Renders ThreadHeader for primary activity
 * - Renders ThreadReply for each reply
 * - Collapse button for 5+ replies
 * - Thread connector line
 *
 * @example
 * ```tsx
 * <ThreadedActivityGroup thread={blogPostThread} />
 * ```
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ThreadHeader } from "./ThreadHeader";
import { ThreadReply } from "./ThreadReply";
import { getCollapsedSummary } from "@/lib/activity/threading";
import type { ActivityThread } from "@/lib/activity/threading";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY, SPACING, ANIMATION } from "@/lib/design-tokens";

// ============================================================================
// TYPES
// ============================================================================

export interface ThreadedActivityGroupProps {
  /** Thread to render (primary + replies) */
  thread: ActivityThread;
  /** Optional CSS class */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Thread group with primary activity + replies
 */
export function ThreadedActivityGroup({
  thread,
  className,
}: ThreadedActivityGroupProps) {
  const [showAllReplies, setShowAllReplies] = useState(false);

  const hasReplies = thread.replies.length > 0;
  const hasCollapsedReplies = thread.collapsedCount > 0;

  // Determine which replies to show
  const visibleReplies = showAllReplies
    ? thread.replies
    : thread.replies.slice(0, 3); // Show first 3 by default

  return (
    <div className={cn("relative", className)}>
      {/* Primary Activity */}
      <ThreadHeader
        activity={thread.primary}
        hasReplies={hasReplies}
      />

      {/* Replies */}
      {hasReplies && (
        <div className={cn("relative mt-6", SPACING.compact)}>
          {/* Render Visible Replies */}
          {visibleReplies.map((reply, index) => (
            <ThreadReply
              key={reply.id}
              activity={reply}
              primaryActivity={thread.primary}
              isLast={
                index === visibleReplies.length - 1 &&
                (!hasCollapsedReplies || showAllReplies)
              }
            />
          ))}

          {/* Show More Button (if collapsed replies exist) */}
          {hasCollapsedReplies && !showAllReplies && (
            <div className="flex gap-4 pb-4">
              {/* Spacer to align with content */}
              <div className="shrink-0 w-8" />

              {/* Expand Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllReplies(true)}
                className={cn(
                  "gap-2 text-muted-foreground hover:text-foreground",
                  ANIMATION.transition.base
                )}
              >
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
                <span className={TYPOGRAPHY.label.small}>
                  {getCollapsedSummary(
                    thread.collapsedCount,
                    thread.primary.source
                  )}
                </span>
              </Button>
            </div>
          )}

          {/* Collapse Button (if expanded) */}
          {hasCollapsedReplies && showAllReplies && (
            <div className="flex gap-4 pb-4">
              {/* Spacer */}
              <div className="shrink-0 w-8" />

              {/* Collapse Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllReplies(false)}
                className={cn(
                  "gap-2 text-muted-foreground hover:text-foreground",
                  ANIMATION.transition.base
                )}
              >
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
                <span className={TYPOGRAPHY.label.small}>Show less</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
