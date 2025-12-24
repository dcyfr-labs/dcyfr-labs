/**
 * Activity Reactions System
 *
 * Manages user reactions (likes) to activities with localStorage persistence.
 * Similar architecture to the bookmarks system but focused on engagement interactions.
 *
 * Features:
 * - Like/unlike activities
 * - localStorage persistence
 * - Simulated reaction counts
 * - Type-safe API
 *
 * @example
 * ```ts
 * const reactions = loadReactions();
 * const liked = isActivityLiked('activity-123', reactions);
 * const newReactions = toggleReaction('activity-123', reactions);
 * saveReactions(newReactions);
 * ```
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Supported reaction types
 * Currently only 'like' but extensible for future reaction types (love, celebrate, etc.)
 */
export type ReactionType = "like";

/**
 * Individual reaction record
 */
export interface ActivityReaction {
  /** Activity ID that was reacted to */
  activityId: string;
  /** Type of reaction */
  type: ReactionType;
  /** When the reaction was added */
  timestamp: string; // ISO 8601 string for JSON serialization
}

/**
 * Complete collection of all reactions
 */
export interface ReactionCollection {
  /** Array of all reactions */
  reactions: ActivityReaction[];
  /** Last update timestamp */
  lastUpdated: string; // ISO 8601
  /** Schema version for future migrations */
  version: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** localStorage key for reactions */
const STORAGE_KEY = "activity:reactions";

/** Current schema version */
const SCHEMA_VERSION = 1;

/** Maximum reactions to store (prevent unbounded growth) */
const MAX_REACTIONS = 1000;

// ============================================================================
// CORE REACTIONS API
// ============================================================================

/**
 * Loads reactions from localStorage
 * Returns empty collection if none exist or if data is corrupt
 */
export function loadReactions(): ReactionCollection {
  if (typeof window === "undefined") {
    return createEmptyCollection();
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return createEmptyCollection();
    }

    const parsed = JSON.parse(stored) as ReactionCollection;

    // Validate schema
    if (!isValidCollection(parsed)) {
      console.warn("[Reactions] Invalid data structure, resetting");
      return createEmptyCollection();
    }

    // Schema migration if needed
    if (parsed.version < SCHEMA_VERSION) {
      return migrateSchema(parsed);
    }

    return parsed;
  } catch (error) {
    console.error("[Reactions] Failed to load:", error);
    return createEmptyCollection();
  }
}

/**
 * Saves reactions to localStorage
 * Handles quota exceeded errors gracefully
 */
export function saveReactions(collection: ReactionCollection): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    // Trim if exceeding max size
    if (collection.reactions.length > MAX_REACTIONS) {
      collection.reactions = collection.reactions.slice(-MAX_REACTIONS);
    }

    const serialized = JSON.stringify(collection);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    // Likely quota exceeded
    console.error("[Reactions] Failed to save:", error);

    // Try to save with reduced dataset
    try {
      const reduced: ReactionCollection = {
        ...collection,
        reactions: collection.reactions.slice(-500), // Keep most recent 500
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reduced));
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Toggles a reaction for an activity
 * If liked, removes it. If not liked, adds it.
 *
 * @param activityId - ID of the activity to toggle
 * @param currentCollection - Current reaction state
 * @returns Updated reaction collection
 */
export function toggleReaction(
  activityId: string,
  currentCollection: ReactionCollection,
  type: ReactionType = "like"
): ReactionCollection {
  const isCurrentlyLiked = isActivityLiked(activityId, currentCollection, type);

  const updatedReactions = isCurrentlyLiked
    ? // Remove reaction
      currentCollection.reactions.filter(
        (r) => !(r.activityId === activityId && r.type === type)
      )
    : // Add reaction
      [
        ...currentCollection.reactions,
        {
          activityId,
          type,
          timestamp: new Date().toISOString(),
        },
      ];

  return {
    ...currentCollection,
    reactions: updatedReactions,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Checks if an activity has been liked
 */
export function isActivityLiked(
  activityId: string,
  collection: ReactionCollection,
  type: ReactionType = "like"
): boolean {
  return collection.reactions.some(
    (r) => r.activityId === activityId && r.type === type
  );
}

/**
 * Gets all reactions for a specific activity
 */
export function getActivityReactions(
  activityId: string,
  collection: ReactionCollection
): ActivityReaction[] {
  return collection.reactions.filter((r) => r.activityId === activityId);
}

/**
 * Counts reactions for a specific activity and type
 */
export function countActivityReactions(
  activityId: string,
  collection: ReactionCollection,
  type?: ReactionType
): number {
  const reactions = getActivityReactions(activityId, collection);

  if (type) {
    return reactions.filter((r) => r.type === type).length;
  }

  return reactions.length;
}

/**
 * Gets all activity IDs that have reactions
 */
export function getReactedActivityIds(
  collection: ReactionCollection,
  type?: ReactionType
): string[] {
  const reactions = type
    ? collection.reactions.filter((r) => r.type === type)
    : collection.reactions;

  return Array.from(new Set(reactions.map((r) => r.activityId)));
}

/**
 * Clears all reactions
 * Use with caution - this is irreversible
 */
export function clearAllReactions(): ReactionCollection {
  const empty = createEmptyCollection();
  saveReactions(empty);
  return empty;
}

// ============================================================================
// SIMULATED REACTION COUNTS
// ============================================================================

/**
 * Gets a simulated reaction count for display purposes
 * Combines actual user reaction + a base simulated count
 *
 * This creates the illusion of engagement while remaining honest
 * (the user's own reactions are real, the baseline is simulated)
 *
 * @param activityId - Activity ID
 * @param collection - Reaction collection
 * @param type - Reaction type
 * @returns Simulated total count for display
 */
export function getSimulatedReactionCount(
  activityId: string,
  collection: ReactionCollection,
  type: ReactionType = "like"
): number {
  const userReacted = isActivityLiked(activityId, collection, type);
  const baseCount = generateBaseCount(activityId);

  return userReacted ? baseCount + 1 : baseCount;
}

/**
 * Generates a consistent pseudo-random base count for an activity
 * Uses activity ID as seed for deterministic results
 */
function generateBaseCount(activityId: string): number {
  // Simple hash function to convert ID to number
  let hash = 0;
  for (let i = 0; i < activityId.length; i++) {
    const char = activityId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Ensure positive number in range 0-50
  const normalized = Math.abs(hash) % 51;

  return normalized;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates an empty reaction collection
 */
function createEmptyCollection(): ReactionCollection {
  return {
    reactions: [],
    lastUpdated: new Date().toISOString(),
    version: SCHEMA_VERSION,
  };
}

/**
 * Validates that a parsed object is a valid ReactionCollection
 */
function isValidCollection(obj: unknown): obj is ReactionCollection {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  const coll = obj as Partial<ReactionCollection>;

  return (
    Array.isArray(coll.reactions) &&
    typeof coll.lastUpdated === "string" &&
    typeof coll.version === "number"
  );
}

/**
 * Migrates old schema versions to current version
 * (Currently no migrations needed, placeholder for future)
 */
function migrateSchema(old: ReactionCollection): ReactionCollection {
  // Future: Handle schema migrations here
  return {
    ...old,
    version: SCHEMA_VERSION,
    lastUpdated: new Date().toISOString(),
  };
}

// ============================================================================
// DEBUG UTILITIES
// ============================================================================

/**
 * Gets statistics about reaction collection
 * Useful for debugging and analytics
 */
export function getReactionStats(
  collection: ReactionCollection
): {
  total: number;
  byType: Record<ReactionType, number>;
  uniqueActivities: number;
  oldestReaction: string | null;
  newestReaction: string | null;
} {
  const byType: Record<ReactionType, number> = {
    like: 0,
  };

  collection.reactions.forEach((r) => {
    byType[r.type] = (byType[r.type] || 0) + 1;
  });

  const timestamps = collection.reactions
    .map((r) => r.timestamp)
    .sort();

  return {
    total: collection.reactions.length,
    byType,
    uniqueActivities: getReactedActivityIds(collection).length,
    oldestReaction: timestamps[0] || null,
    newestReaction: timestamps[timestamps.length - 1] || null,
  };
}
