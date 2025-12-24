/**
 * Thread Header Component
 *
 * Displays the primary activity in a thread with Threads-inspired layout:
 * - Avatar on left
 * - Content (title, description, metadata) on right
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
import { ProfileAvatar } from "@/components/common/profile-avatar";
import { Badge } from "@/components/ui/badge";
import { ThreadActions } from "./ThreadActions";
import { ThreadShareButton } from "./ThreadShareButton";
import { getActivitySourceIcon } from "@/lib/activity/types";
import type { ActivityItem } from "@/lib/activity/types";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY, SPACING, HOVER_EFFECTS, ANIMATION, NEON_COLORS } from "@/lib/design-tokens";
import { useState } from "react";

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
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const verbColor = getVerbColor(activity.verb);

  // Get icon component reference
  const sourceIconComponent = getActivitySourceIcon(activity.source);

  return (
    <div className={cn("group/thread relative", className)}>
      {/* Avatar + Content Layout */}
      <div className="flex gap-4">
        {/* Avatar Column (Fixed) */}
        <div className="shrink-0">
          <Link
            href="/about/drew"
            className={cn("block", ANIMATION.transition.base)}
          >
            <ProfileAvatar
              userProfile="dcyfr"
              size="sm"
              className={cn(
                HOVER_EFFECTS.cardSubtle,
                "ring-2 ring-border ring-offset-2 ring-offset-background"
              )}
            />
          </Link>
        </div>

        {/* Content Column (Flexible) */}
        <div className="flex-1 min-w-0">
          {/* Header: Source + Verb Badges */}
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="default" className="gap-1.5 px-2 h-6">
              {createElement(sourceIconComponent, { className: "h-3.5 w-3.5", "aria-hidden": "true" })}
              <span className="capitalize">{activity.source}</span>
            </Badge>

            <Badge variant="outline" className={cn("px-2 h-6", verbColor)}>
              {activity.verb}
            </Badge>
          </div>

          {/* Title */}
          <Link
            href={activity.href}
            className={cn(
              "block group/link",
              ANIMATION.transition.base,
              TYPOGRAPHY.h3.standard,
              "hover:text-primary"
            )}
          >
            <span className={HOVER_EFFECTS.link}>{activity.title}</span>
          </Link>

          {/* Description (if present) */}
          {activity.description && (
            <p
              className={cn(
                TYPOGRAPHY.body,
                "text-muted-foreground mt-2 line-clamp-3"
              )}
            >
              {activity.description}
            </p>
          )}

          {/* Metadata (tags, stats, etc.) */}
          {(activity.meta?.tags || activity.meta?.stats) && (
            <div className={cn("flex flex-wrap items-center gap-2 mt-3")}>
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
                    TYPOGRAPHY.metadata,
                    "text-muted-foreground flex items-center gap-2"
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

          {/* Action Buttons */}
          <div className="mt-4">
            <ThreadActions
              activityId={activity.id}
              activityHref={activity.href}
              activityTitle={activity.title}
              activityDescription={activity.description}
              timestamp={activity.timestamp}
              onShareClick={() => setShareMenuOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Share Button (Positioned Absolutely on Desktop) */}
      <div className="hidden md:block absolute top-0 right-0">
        <ThreadShareButton
          activity={{
            id: activity.id,
            title: activity.title,
            description: activity.description,
            href: activity.href,
          }}
          variant="ghost"
          size="sm"
        />
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
