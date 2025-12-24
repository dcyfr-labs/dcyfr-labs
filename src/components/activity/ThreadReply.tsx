/**
 * Thread Reply Component
 *
 * Displays a nested reply/update activity in a thread.
 * Compact variant of ThreadHeader for secondary activities.
 *
 * Features:
 * - Smaller avatar (or no avatar)
 * - Compact title + badge
 * - Minimal metadata
 * - Connects to thread line
 *
 * @example
 * ```tsx
 * <ThreadReply activity={milestone} isLast={false} />
 * ```
 */

"use client";

import { createElement } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ThreadActions } from "./ThreadActions";
import { getActivitySourceIcon } from "@/lib/activity/types";
import type { ActivityItem } from "@/lib/activity/types";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY, ANIMATION, NEON_COLORS } from "@/lib/design-tokens";

// ============================================================================
// TYPES & HELPERS
// ============================================================================

/**
 * Maps activity verb to neon color badge class
 */
function getVerbColor(verb: ActivityItem["verb"]): string {
  const colorMap: Record<ActivityItem["verb"], string> = {
    published: NEON_COLORS.lime.badge,
    updated: NEON_COLORS.cyan.badge,
    launched: NEON_COLORS.purple.badge,
    released: NEON_COLORS.orange.badge,
    committed: NEON_COLORS.slate.badge,
    achieved: NEON_COLORS.yellow.badge,
    earned: NEON_COLORS.blue.badge,
    reached: NEON_COLORS.lime.badge,
  };

  return colorMap[verb] || NEON_COLORS.lime.badge;
}

export interface ThreadReplyProps {
  /** Reply activity */
  activity: ActivityItem;
  /** Primary activity in the thread (to check for duplicates) */
  primaryActivity?: ActivityItem;
  /** Whether this is the last reply in the thread */
  isLast?: boolean;
  /** Optional CSS class */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Reply/update activity in a thread (compact variant)
 */
export function ThreadReply({
  activity,
  primaryActivity,
  isLast = false,
  className,
}: ThreadReplyProps) {
  const verbColor = getVerbColor(activity.verb);

  // Get icon component reference
  const sourceIconComponent = getActivitySourceIcon(activity.source);
  
  // Hide verb badge if it's the same as primary to reduce duplication
  const showVerbBadge = !primaryActivity || activity.verb !== primaryActivity.verb;

  return (
    <div className={cn("group/reply relative", className)}>
      {/* Layout: Small Icon + Content */}
      <div className="flex gap-4">
        {/* Icon Column (Aligned with Avatar) */}
        <div className="shrink-0 flex items-center justify-center">
          {/* Small Connector Dot */}
          <div
            className={cn(
              "h-3 w-3 rounded-full border-2 border-border bg-muted",
              "group-hover/reply:border-primary",
              ANIMATION.transition.fast
            )}
            aria-hidden="true"
          />
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0 pb-8">
          {/* Header: Source + Verb Badges (Compact) */}
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="secondary"
              className="gap-1 px-1.5 h-5 text-xs"
            >
              {createElement(sourceIconComponent, { className: "h-3 w-3", "aria-hidden": "true" })}
              <span className="capitalize">{activity.source}</span>
            </Badge>

            {showVerbBadge && (
              <Badge
                variant="outline"
                className={cn("px-1.5 h-5 text-xs", verbColor)}
              >
                {activity.verb}
              </Badge>
            )}
          </div>

          {/* Title (Compact) */}
          <Link
            href={activity.href}
            className={cn(
              "block group/link",
              ANIMATION.transition.base,
              TYPOGRAPHY.body,
              "font-medium hover:text-primary line-clamp-2"
            )}
          >
            {activity.title}
          </Link>

          {/* Metadata (Minimal) */}
          {activity.meta && (
            <div className="mt-1.5">
              {/* Milestone Badge */}
              {activity.meta.milestone && (
                <Badge variant="secondary" className="text-xs">
                  {activity.meta.milestone.toLocaleString()}
                </Badge>
              )}

              {/* Trending Badge */}
              {activity.meta.trending && (
                <Badge variant="secondary" className="text-xs">
                  🔥 Trending
                </Badge>
              )}

              {/* Engagement Badge */}
              {activity.meta.engagement && (
                <Badge variant="secondary" className="text-xs">
                  {activity.meta.engagement}% engagement
                </Badge>
              )}
            </div>
          )}

          {/* Actions (Compact) */}
          <div className="mt-2">
            <ThreadActions
              activityId={activity.id}
              activityHref={activity.href}
              activityTitle={activity.title}
              activityDescription={activity.description}
              timestamp={activity.timestamp}
              size="compact"
              hideTimestamp
            />
          </div>
        </div>
      </div>

      {/* Thread Connector Line (continues unless last) */}
      {!isLast && (
        <div
          className="absolute left-8 top-6 bottom-0 w-px bg-border/50"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
