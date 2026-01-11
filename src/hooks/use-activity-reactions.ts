/**
 * Activity Reactions Hook
 *
 * React hook for managing user reactions (likes) to activities.
 * Provides optimistic UI updates with localStorage persistence.
 *
 * Features:
 * - Check if activity is liked
 * - Toggle like state
 * - Get reaction counts (real user interactions only)
 * - Automatic localStorage sync
 *
 * @example
 * ```tsx
 * function ActivityCard({ activity }) {
 *   const { isLiked, toggleLike, getCount } = useActivityReactions();
 *
 *   return (
 *     <button onClick={() => toggleLike(activity.id)}>
 *       {isLiked(activity.id) ? '❤️' : '🤍'} {getCount(activity.id)}
 *     </button>
 *   );
 * }
 * ```
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import type { ReactionType, ReactionCollection } from "@/lib/activity";
import {
  loadReactions,
  saveReactions,
  toggleReaction as toggleReactionUtil,
  isActivityLiked as isLikedUtil,
  getSimulatedReactionCount,
  getReactionStats,
} from "@/lib/activity";

// ============================================================================
// TYPES
// ============================================================================

export interface UseActivityReactionsReturn {
  /** Check if an activity is liked by the user */
  isLiked: (activityId: string, type?: ReactionType) => boolean;

  /** Toggle like state for an activity (optimistic update) */
  toggleLike: (
    activityId: string,
    type?: ReactionType,
    contentTypeOverride?: "post" | "project" | "activity"
  ) => void;

  /** Get real reaction count (0 if not reacted, 1 if reacted by user) */
  getCount: (activityId: string, type?: ReactionType) => number;

  /** Get all reacted activity IDs */
  getLikedIds: (type?: ReactionType) => string[];

  /** Current reaction collection */
  reactions: ReactionCollection;

  /** Loading state (initial load from localStorage) */
  loading: boolean;

  /** Get statistics about reactions */
  stats: ReturnType<typeof getReactionStats>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for managing activity reactions
 * @param defaultContentType - Default content type for Redis sync (post, project, or activity)
 */
export function useActivityReactions(
  defaultContentType: "post" | "project" | "activity" = "activity"
): UseActivityReactionsReturn {
  // Initialize from loadReactions to avoid setState in effect
  const [reactions, setReactions] = useState<ReactionCollection>(() => {
    // Only run on client-side
    if (typeof window === "undefined") {
      console.warn(
        "[useActivityReactions] SSR context, returning empty collection"
      );
      return {
        reactions: [],
        lastUpdated: new Date().toISOString(),
        version: 1,
      };
    }
    console.warn(
      "[useActivityReactions] Initializing hook, loading reactions from storage"
    );
    const loaded = loadReactions();
    console.warn(
      "[useActivityReactions] Hook initialized with",
      `${loaded.reactions.length} reactions`
    );
    return loaded;
  });

  const [loading, setLoading] = useState(false);

  // Sync to localStorage whenever reactions change
  useEffect(() => {
    if (!loading && typeof window !== "undefined") {
      console.warn(
        "[useActivityReactions] useEffect: Syncing reactions to localStorage, count:",
        `${reactions.reactions.length}`
      );
      saveReactions(reactions);
    }
  }, [reactions, loading]);

  /**
   * Check if an activity is liked
   */
  const isLiked = useCallback(
    (activityId: string, type: ReactionType = "like"): boolean => {
      if (typeof window === "undefined") return false; // Suppress client-only data during SSR
      const liked = isLikedUtil(activityId, reactions, type);
      console.warn("[useActivityReactions] isLiked() check:", {
        activityId,
        type,
        result: liked,
      });
      return liked;
    },
    [reactions]
  );

  /**
   * Toggle like state with optimistic update and Redis sync
   */
  const toggleLike = useCallback(
    (
      activityId: string,
      type: ReactionType = "like",
      contentTypeOverride?: "post" | "project" | "activity"
    ): void => {
      console.warn("[useActivityReactions] toggleLike() called:", {
        activityId,
        type,
        currentReactionsCount: reactions.reactions.length,
      });

      // Optimistic localStorage update
      const wasLiked = isLikedUtil(activityId, reactions, type);
      console.warn(
        "[useActivityReactions] toggleLike() before state update:",
        `wasLiked=${wasLiked}`
      );

      setReactions((current) => {
        const updated = toggleReactionUtil(activityId, current, type);
        console.warn("[useActivityReactions] toggleLike() state updated:", {
          beforeCount: current.reactions.length,
          afterCount: updated.reactions.length,
          action: wasLiked ? "removed" : "added",
        });
        return updated;
      });

      // Sync with Redis analytics (fire and forget)
      // Use contentTypeOverride if provided, otherwise use defaultContentType
      const contentType = contentTypeOverride || defaultContentType;
      const action = wasLiked ? "unlike" : "like";

      console.warn("[useActivityReactions] Syncing with Redis:", {
        slug: activityId,
        contentType,
        action,
      });

      fetch("/api/engagement/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: activityId,
          contentType,
          action,
        }),
      })
        .then(() => {
          console.warn(
            "[useActivityReactions] Successfully synced like to Redis:",
            { slug: activityId, action }
          );
        })
        .catch((error) => {
          console.error(
            "[useActivityReactions] Failed to sync like to Redis:",
            { slug: activityId, action, error }
          );
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "[useActivityReactions] Redis sync error details:",
              error
            );
          }
        });
    },
    [reactions, defaultContentType]
  );

  /**
   * Get real reaction count (user's actual interaction)
   */
  const getCount = useCallback(
    (activityId: string, type: ReactionType = "like"): number => {
      if (typeof window === "undefined") return 0; // Suppress client-only data during SSR
      const count = getSimulatedReactionCount(activityId, reactions, type);
      console.warn("[useActivityReactions] getCount():", {
        activityId,
        type,
        count,
      });
      return count;
    },
    [reactions]
  );

  /**
   * Get all liked activity IDs
   */
  const getLikedIds = useCallback(
    (type?: ReactionType): string[] => {
      const ids = reactions.reactions
        .filter((r) => !type || r.type === type)
        .map((r) => r.activityId);

      return Array.from(new Set(ids));
    },
    [reactions]
  );

  /**
   * Get reaction statistics
   */
  const stats = useCallback(() => {
    return getReactionStats(reactions);
  }, [reactions])();

  return {
    isLiked,
    toggleLike,
    getCount,
    getLikedIds,
    reactions,
    loading,
    stats,
  };
}
