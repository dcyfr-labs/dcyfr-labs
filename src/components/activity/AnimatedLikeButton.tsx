/**
 * Animated Like Button Component
 *
 * Enhanced like button with:
 * - Pulse animation on click
 * - Count increment with scale animation
 * - Optimistic updates with rollback on error
 * - Medium/Substack-inspired subtle states
 *
 * @example
 * ```tsx
 * <AnimatedLikeButton
 *   activityId="post-123"
 *   initialCount={42}
 *   isLiked={false}
 *   onLike={async (id) => await apiToggleLike(id)}
 * />
 * ```
 */

"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ANIMATION, TYPOGRAPHY, SEMANTIC_COLORS } from "@/lib/design-tokens";

// ============================================================================
// TYPES
// ============================================================================

export interface AnimatedLikeButtonProps {
  /** Activity ID */
  activityId: string;
  /** Initial like count */
  initialCount?: number;
  /** Initial liked state */
  isLiked?: boolean;
  /** Callback when like is toggled (returns new state) */
  onLike?: (activityId: string, isLiked: boolean) => Promise<void>;
  /** Size variant */
  size?: "default" | "compact";
  /** Optional CSS class */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Like button with optimistic updates and animations
 */
export function AnimatedLikeButton({
  activityId,
  initialCount = 0,
  isLiked = false,
  onLike,
  size = "default",
  className,
}: AnimatedLikeButtonProps) {
  // Optimistic state
  const [liked, setLiked] = useState(isLiked);
  const [count, setCount] = useState(initialCount);
  const [isPulsing, setIsPulsing] = useState(false);
  const [isAnimatingCount, setIsAnimatingCount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with prop changes (for SSR/hydration)
  useEffect(() => {
    setLiked(isLiked);
    setCount(initialCount);
  }, [isLiked, initialCount]);

  const handleClick = async () => {
    if (isLoading) return;

    // Store previous state for rollback
    const previousLiked = liked;
    const previousCount = count;

    // Optimistic update
    const newLiked = !liked;
    setLiked(newLiked);
    setCount((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));

    // Trigger animations
    setIsPulsing(true);
    setIsAnimatingCount(true);

    // Reset animations after completion
    setTimeout(() => setIsPulsing(false), 300);
    setTimeout(() => setIsAnimatingCount(false), 300);

    // Call API if provided
    if (onLike) {
      setIsLoading(true);
      try {
        await onLike(activityId, newLiked);
      } catch (error) {
        // Rollback on error
        console.error("Failed to toggle like:", error);
        setLiked(previousLiked);
        setCount(previousCount);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const iconSize = size === "compact" ? "h-4 w-4" : "h-5 w-5";
  const textSize = size === "compact" ? TYPOGRAPHY.label.xs : TYPOGRAPHY.label.small;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isLoading}
      aria-label={liked ? "Unlike" : "Like"}
      className={cn(
        "group/like h-auto gap-1.5 px-2 py-1",
        ANIMATION.transition.base,
        ANIMATION.activity.like,
        "hover:bg-accent/50",
        className
      )}
    >
      {/* Heart Icon */}
      <Heart
        className={cn(
          iconSize,
          ANIMATION.transition.base,
          isPulsing && ANIMATION.activity.pulse,
          liked
            ? [SEMANTIC_COLORS.activity.action.liked, "fill-current"]
            : SEMANTIC_COLORS.activity.action.default,
          liked && "group-hover/like:scale-110"
        )}
        aria-hidden="true"
      />

      {/* Count (only show if > 0) */}
      {count > 0 && (
        <span
          className={cn(
            textSize,
            ANIMATION.transition.base,
            isAnimatingCount && ANIMATION.activity.countIncrement,
            liked
              ? SEMANTIC_COLORS.activity.action.liked
              : SEMANTIC_COLORS.activity.action.default
          )}
        >
          {count}
        </span>
      )}
    </Button>
  );
}
