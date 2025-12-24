/**
 * Thread Actions Component
 *
 * Displays inline engagement actions for activity threads:
 * - Like button with count
 * - Share button
 * - Bookmark button
 * - Timestamp
 *
 * Threads-inspired minimal UI with hover states.
 *
 * @example
 * ```tsx
 * <ThreadActions
 *   activityId="post-123"
 *   activityHref="/blog/my-post"
 *   activityTitle="My Blog Post"
 *   timestamp={new Date()}
 * />
 * ```
 */

"use client";

import { Heart, Share2, Bookmark } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useActivityReactions } from "@/hooks/use-activity-reactions";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { ANIMATION, TYPOGRAPHY, SEMANTIC_COLORS } from "@/lib/design-tokens";

// ============================================================================
// TYPES
// ============================================================================

export interface ThreadActionsProps {
  /** Activity ID */
  activityId: string;
  /** Activity URL (for sharing) */
  activityHref: string;
  /** Activity title (for sharing) */
  activityTitle: string;
  /** Activity description (for sharing) */
  activityDescription?: string;
  /** Activity timestamp */
  timestamp: Date;
  /** Optional CSS class */
  className?: string;
  /** Size variant */
  size?: "default" | "compact";
  /** Show share button (for opening share menu) */
  onShareClick?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Thread action buttons (like, share, bookmark) + timestamp
 */
export function ThreadActions({
  activityId,
  activityHref,
  activityTitle,
  activityDescription,
  timestamp,
  className,
  size = "default",
  onShareClick,
}: ThreadActionsProps) {
  const { isLiked, toggleLike, getCount } = useActivityReactions();
  const { isBookmarked, toggle: toggleBookmark } = useBookmarks();

  const liked = isLiked(activityId);
  const bookmarked = isBookmarked(activityId);
  const likeCount = getCount(activityId);

  const isCompact = size === "compact";

  return (
    <div
      className={cn(
        "flex items-center gap-4",
        isCompact ? "gap-3" : "gap-4",
        className
      )}
    >
      {/* Like Button */}
      <ActionButton
        icon={Heart}
        label={likeCount > 0 ? String(likeCount) : undefined}
        active={liked}
        onClick={() => toggleLike(activityId)}
        ariaLabel={liked ? "Unlike" : "Like"}
        size={size}
        activeColor={SEMANTIC_COLORS.alert.critical.icon}
      />

      {/* Share Button */}
      <ActionButton
        icon={Share2}
        onClick={onShareClick}
        ariaLabel="Share"
        size={size}
      />

      {/* Bookmark Button */}
      <ActionButton
        icon={Bookmark}
        active={bookmarked}
        onClick={() => toggleBookmark(activityId)}
        ariaLabel={bookmarked ? "Remove bookmark" : "Bookmark"}
        size={size}
        activeColor={SEMANTIC_COLORS.alert.warning.icon}
      />

      {/* Timestamp */}
      <time
        dateTime={timestamp.toISOString()}
        className={cn(
          TYPOGRAPHY.metadata,
          "text-muted-foreground ml-auto"
        )}
        title={timestamp.toLocaleString()}
      >
        {formatDistanceToNow(timestamp, { addSuffix: true })}
      </time>
    </div>
  );
}

// ============================================================================
// ACTION BUTTON SUB-COMPONENT
// ============================================================================

interface ActionButtonProps {
  icon: React.ElementType;
  label?: string;
  active?: boolean;
  onClick?: () => void;
  ariaLabel: string;
  size: "default" | "compact";
  activeColor?: string;
}

function ActionButton({
  icon: Icon,
  label,
  active = false,
  onClick,
  ariaLabel,
  size,
  activeColor = "text-primary",
}: ActionButtonProps) {
  const iconSize = size === "compact" ? "h-4 w-4" : "h-5 w-5";
  const textSize = size === "compact" ? TYPOGRAPHY.label.xs : TYPOGRAPHY.label.small;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "group/action h-auto gap-1.5 px-2 py-1",
        ANIMATION.transition.base,
        "hover:bg-accent/50"
      )}
    >
      <Icon
        className={cn(
          iconSize,
          ANIMATION.transition.base,
          active ? [activeColor, "fill-current"] : "text-muted-foreground",
          active && "group-hover/action:scale-110"
        )}
        aria-hidden="true"
      />
      {label && (
        <span
          className={cn(
            textSize,
            active ? activeColor : "text-muted-foreground"
          )}
        >
          {label}
        </span>
      )}
    </Button>
  );
}
