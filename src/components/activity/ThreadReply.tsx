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
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ThreadActions } from "./ThreadActions";
import { getActivitySourceIcon } from "@/lib/activity";
import type { ActivityItem } from "@/lib/activity";
import { cn } from "@/lib/utils";
import {
  TYPOGRAPHY,
  ANIMATION,
  ACTIVITY_IMAGE,
  SPACING,
  SEMANTIC_COLORS,
} from "@/lib/design-tokens";
import { Flame, TrendingUp } from "lucide-react";

// ============================================================================
// TYPES & HELPERS
// ============================================================================

/**
 * Maps activity verb to semantic color badge class
 */
function getVerbColor(verb: ActivityItem["verb"]): string {
  const colorMap: Record<ActivityItem["verb"], string> = {
    published: SEMANTIC_COLORS.status.neutral,
    updated: SEMANTIC_COLORS.status.neutral,
    launched: SEMANTIC_COLORS.status.neutral,
    released: SEMANTIC_COLORS.status.neutral,
    committed: SEMANTIC_COLORS.status.neutral,
    achieved: SEMANTIC_COLORS.status.neutral,
    earned: SEMANTIC_COLORS.status.neutral,
    reached: SEMANTIC_COLORS.status.neutral,
  };

  return colorMap[verb] || SEMANTIC_COLORS.status.neutral;
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
  const showVerbBadge =
    !primaryActivity || activity.verb !== primaryActivity.verb;

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
          {/* Header: Source + Verb Badges + Trending (Compact) */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="secondary" className="gap-1 px-1.5 h-5 text-xs">
              {createElement(sourceIconComponent, {
                className: "h-3 w-3",
                "aria-hidden": "true",
              })}
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

            {/* Trending Badge (Compact) - Weekly takes priority */}
            {activity.meta?.trendingStatus?.isWeeklyTrending && (
              <Badge
                variant="secondary"
                className={cn(
                  "px-1.5 h-5 text-xs flex items-center gap-0.5",
                  SEMANTIC_COLORS.accent.orange.badge
                )}
              >
                <Flame className="w-3 h-3" aria-hidden="true" />
                Week
              </Badge>
            )}
            {!activity.meta?.trendingStatus?.isWeeklyTrending &&
              activity.meta?.trendingStatus?.isMonthlyTrending && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "px-1.5 h-5 text-xs flex items-center gap-0.5",
                    SEMANTIC_COLORS.status.info
                  )}
                >
                  <TrendingUp className="w-3 h-3" aria-hidden="true" />
                  Month
                </Badge>
              )}
          </div>

          {/* Content: Title, Image, Description, Metadata */}
          <div className={SPACING.activity.contentGap}>
            {/* Title */}
            <Link
              href={activity.href}
              className={cn(
                "block group/link",
                ANIMATION.transition.base,
                TYPOGRAPHY.activity.replyTitle,
                "hover:text-primary"
              )}
            >
              {activity.title}
            </Link>

            {/* Featured Image (if present, smaller for replies) */}
            {activity.meta?.image && (
              <div
                className={cn(
                  ACTIVITY_IMAGE.container,
                  ACTIVITY_IMAGE.sizes.reply
                )}
              >
                <Image
                  src={activity.meta.image.url}
                  alt={activity.meta.image.alt || activity.title}
                  fill
                  className={ACTIVITY_IMAGE.image}
                />
              </div>
            )}

            {/* Description (if present) */}
            {activity.description && (
              <p className={TYPOGRAPHY.activity.replyDescription}>
                {activity.description}
              </p>
            )}

            {/* Metadata (Minimal) */}
            {activity.meta && (
              <div className="flex flex-wrap items-center gap-2">
                {/* Milestone Badge */}
                {activity.meta.milestone && (
                  <Badge variant="secondary" className="text-xs">
                    {activity.meta.milestone.toLocaleString()}
                  </Badge>
                )}

                {/* Trending Badge */}
                {activity.meta.trending && (
                  <Badge
                    variant="secondary"
                    className="text-xs flex items-center gap-1"
                  >
                    <Flame className="w-3 h-3" aria-hidden="true" />
                    Trending
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
          </div>

          {/* Actions (Compact - now includes share button) */}
          <div className="mt-2">
            <ThreadActions
              activityId={activity.id}
              timestamp={activity.timestamp}
              activity={{
                title: activity.title,
                description: activity.description,
                href: activity.href,
              }}
              size="compact"
              hideTimestamp
              showBookmarkCount
              showShareCount
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
