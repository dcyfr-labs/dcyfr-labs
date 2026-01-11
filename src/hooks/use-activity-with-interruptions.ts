"use client";

import { useMemo } from "react";
import type { ActivityItem } from "@/lib/activity";
import type { FeedInterruptionProps } from '@/components/activity';

// ============================================================================
// TYPES
// ============================================================================

export type FeedItem =
  | { type: "activity"; item: ActivityItem }
  | { type: "interruption"; item: FeedInterruptionProps };

interface UseActivityWithInterruptionsOptions {
  /** Activity items */
  activities: ActivityItem[];
  /** Interruption configurations */
  interruptions: FeedInterruptionProps[];
  /** Insert interruption every N activity items */
  interval?: number;
  /** Start inserting after N items */
  startAfter?: number;
  /** Maximum interruptions to show */
  maxInterruptions?: number;
}

interface UseActivityWithInterruptionsReturn {
  /** Combined feed with activities and interruptions */
  feedItems: FeedItem[];
  /** Total activity count */
  activityCount: number;
  /** Total interruption count */
  interruptionCount: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_INTERVAL = 5; // Insert interruption every 5 activities
const DEFAULT_START_AFTER = 3; // Start after 3 activities
const DEFAULT_MAX_INTERRUPTIONS = 3;

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for injecting content interruptions into an activity feed
 *
 * Interleaves activity items with promotional content, quotes, or CTAs
 * at configurable intervals to increase engagement.
 *
 * @example
 * ```tsx
 * const interruptions: FeedInterruptionProps[] = [
 *   { type: "cta", title: "Explore Blog", ... },
 *   { type: "newsletter" },
 *   { type: "quote", quote: "...", source: "..." },
 * ];
 *
 * const { feedItems } = useActivityWithInterruptions({
 *   activities,
 *   interruptions,
 *   interval: 5,
 *   startAfter: 3,
 * });
 *
 * return feedItems.map((item, idx) =>
 *   item.type === "activity" ? (
 *     <ActivityItem key={idx} activity={item.item} />
 *   ) : (
 *     <FeedInterruption key={idx} {...item.item} />
 *   )
 * );
 * ```
 */
export function useActivityWithInterruptions({
  activities,
  interruptions,
  interval = DEFAULT_INTERVAL,
  startAfter = DEFAULT_START_AFTER,
  maxInterruptions = DEFAULT_MAX_INTERRUPTIONS,
}: UseActivityWithInterruptionsOptions): UseActivityWithInterruptionsReturn {
  const feedItems = useMemo(() => {
    if (activities.length === 0 || interruptions.length === 0) {
      return activities.map((item): FeedItem => ({ type: "activity", item }));
    }

    const result: FeedItem[] = [];
    let interruptionIndex = 0;
    let interruptionsInserted = 0;

    activities.forEach((activity, activityIndex) => {
      // Add the activity item
      result.push({ type: "activity", item: activity });

      // Check if we should insert an interruption after this item
      const itemPosition = activityIndex + 1; // 1-indexed position
      const shouldInsert =
        itemPosition >= startAfter &&
        (itemPosition - startAfter) % interval === 0 &&
        interruptionsInserted < maxInterruptions &&
        interruptionIndex < interruptions.length;

      if (shouldInsert) {
        result.push({
          type: "interruption",
          item: interruptions[interruptionIndex],
        });
        interruptionIndex = (interruptionIndex + 1) % interruptions.length;
        interruptionsInserted++;
      }
    });

    return result;
  }, [activities, interruptions, interval, startAfter, maxInterruptions]);

  const interruptionCount = feedItems.filter(
    (item) => item.type === "interruption"
  ).length;

  return {
    feedItems,
    activityCount: activities.length,
    interruptionCount,
  };
}

export default useActivityWithInterruptions;
