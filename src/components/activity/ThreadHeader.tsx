/**
 * Thread Header Component
 *
 * Displays the primary activity in a thread with clean layout:
 * - Content (title, description, metadata) in full width
 * - Action buttons (like, share, bookmark) below
 *
 * @example
 * ```tsx
 * <ThreadHeader activity={blogPost} hasReplies={true} />
 * ```
 */

"use client";

import { createElement } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ThreadActions } from "./ThreadActions";
import { SEMANTIC_COLORS } from "@/lib/design-tokens";
import { getActivitySourceIcon } from "@/lib/activity";
import type { ActivityItem } from "@/lib/activity";
import { cn } from "@/lib/utils";
import {
  TYPOGRAPHY,
  SPACING,
  HOVER_EFFECTS,
  ANIMATION,
  ACTIVITY_IMAGE,
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

export interface ThreadHeaderProps {
  /** Primary activity in the thread */
  activity: ActivityItem;
  /** Whether this thread has replies */
  hasReplies?: boolean;
  /** Optional CSS class */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Primary activity in a thread (Threads-style layout)
 */
export function ThreadHeader({
  activity,
  hasReplies = false,
  className,
}: ThreadHeaderProps) {
  const verbColor = getVerbColor(activity.verb);

  // Get icon component reference
  const sourceIconComponent = getActivitySourceIcon(activity.source);

  return (
    <div className={cn("group/thread relative", className)}>
      {/* Content Layout (Full Width) */}
      <div className="w-full">
        {/* Header: Source + Verb Badges + Trending */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <Badge variant="default" className="gap-1.5 px-2 h-6">
            {createElement(sourceIconComponent, {
              className: "h-3.5 w-3.5",
              "aria-hidden": "true",
            })}
            <span className="capitalize">{activity.source}</span>
          </Badge>

          <Badge variant="outline" className={cn("px-2 h-6", verbColor)}>
            {activity.verb}
          </Badge>

          {/* Trending Badge (Weekly takes priority over Monthly) */}
          {activity.meta?.trendingStatus?.isWeeklyTrending && (
            <Badge
              variant="secondary"
              className={cn(
                "px-2 h-6 flex items-center gap-1",
                SEMANTIC_COLORS.status.warning
              )}
            >
              <Flame className="w-3 h-3" aria-hidden="true" />
              Trending this week
            </Badge>
          )}
          {!activity.meta?.trendingStatus?.isWeeklyTrending &&
            activity.meta?.trendingStatus?.isMonthlyTrending && (
              <Badge
                variant="secondary"
                className={cn(
                  "px-2 h-6 flex items-center gap-1",
                  SEMANTIC_COLORS.status.info
                )}
              >
                <TrendingUp className="w-3 h-3" aria-hidden="true" />
                Trending this month
              </Badge>
            )}
        </div>

        {/* Content: Title, Featured Image, Description, Metadata */}
        <div className={SPACING.activity.contentGap}>
          {/* Title */}
          <Link
            href={activity.href}
            className={cn(
              "block group/link",
              ANIMATION.transition.base,
              TYPOGRAPHY.activity.title,
              "hover:text-primary"
            )}
          >
            <span className={HOVER_EFFECTS.link}>{activity.title}</span>
          </Link>

          {/* Featured Image (if present) */}
          {activity.meta?.image && (
            <div
              className={cn(
                ACTIVITY_IMAGE.container,
                ACTIVITY_IMAGE.sizes.header
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
            <p className={TYPOGRAPHY.activity.description}>
              {activity.description}
            </p>
          )}

          {/* Metadata (tags, stats, etc.) */}
          {(activity.meta?.tags || activity.meta?.stats) && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Tags */}
              {activity.meta.tags &&
                activity.meta.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}

              {/* Stats */}
              {activity.meta.stats && (
                <div
                  className={cn(
                    TYPOGRAPHY.activity.metadata,
                    "flex items-center gap-2"
                  )}
                >
                  {activity.meta.stats.views !== undefined && (
                    <span>{activity.meta.stats.views} views</span>
                  )}
                  {activity.meta.stats.comments !== undefined && (
                    <span>{activity.meta.stats.comments} comments</span>
                  )}
                  {activity.meta.readingTime && (
                    <span>{activity.meta.readingTime}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons (now includes share button in footer) */}
        <div className="mt-4">
          <ThreadActions
            activityId={activity.id}
            timestamp={activity.timestamp}
            activity={{
              title: activity.title,
              description: activity.description,
              href: activity.href,
            }}
            showBookmarkCount
            showShareCount
          />
        </div>
      </div>

      {/* Thread Connector Line (if has replies) */}
      {hasReplies && (
        <div
          className="absolute left-8 top-16 bottom-0 w-px bg-border/50"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
