/**
 * Activity Reactions Hook
 *
 * React hook for managing user reactions (likes) to activities.
 * Provides optimistic UI updates with localStorage persistence.
 *
 * Features:
 * - Check if activity is liked
 * - Toggle like state
 * - Get reaction counts (simulated + real)
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
import type { ReactionType, ReactionCollection } from "@/lib/activity/reactions";
import {
  loadReactions,
  saveReactions,
  toggleReaction as toggleReactionUtil,
  isActivityLiked as isLikedUtil,
  getSimulatedReactionCount,
  getReactionStats,
} from "@/lib/activity/reactions";

// ============================================================================
// TYPES
// ============================================================================

export interface UseActivityReactionsReturn {
  /** Check if an activity is liked by the user */
  isLiked: (activityId: string, type?: ReactionType) => boolean;

  /** Toggle like state for an activity (optimistic update) */
  toggleLike: (activityId: string, type?: ReactionType) => void;

  /** Get simulated reaction count for display */
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
 */
export function useActivityReactions(): UseActivityReactionsReturn {
  // Initialize from loadReactions to avoid setState in effect
  const [reactions, setReactions] = useState<ReactionCollection>(() => {
    // Only run on client-side
    if (typeof window === 'undefined') {
      return {
        reactions: [],
        lastUpdated: new Date().toISOString(),
        version: 1,
      };
    }
    return loadReactions();
  });

  const [loading, setLoading] = useState(false);

  // Sync to localStorage whenever reactions change
  useEffect(() => {
    if (!loading && typeof window !== 'undefined') {
      saveReactions(reactions);
    }
  }, [reactions, loading]);

  /**
   * Check if an activity is liked
   */
  const isLiked = useCallback(
    (activityId: string, type: ReactionType = "like"): boolean => {
      if (typeof window === 'undefined') return false; // Suppress client-only data during SSR
      return isLikedUtil(activityId, reactions, type);
    },
    [reactions]
  );

  /**
   * Toggle like state with optimistic update
   */
  const toggleLike = useCallback(
    (activityId: string, type: ReactionType = "like"): void => {
      setReactions((current) => toggleReactionUtil(activityId, current, type));
    },
    []
  );

  /**
   * Get simulated reaction count
   */
  const getCount = useCallback(
    (activityId: string, type: ReactionType = "like"): number => {
      if (typeof window === 'undefined') return 0; // Suppress client-only data during SSR
      return getSimulatedReactionCount(activityId, reactions, type);
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
