/**
 * React Hooks for Credly Data
 *
 * Provides React hooks with built-in caching, loading states, and error handling
 * for Credly API data. Uses the centralized caching utility for optimal performance.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { fetchCredlyBadgesCached } from "@/lib/credly-cache";
import type { CredlyBadge, CredlySkill } from "@/types/credly";

interface UseCredlyBadgesOptions {
  username?: string;
  limit?: number;
  enabled?: boolean; // Allow disabling the fetch
}

interface UseCredlyBadgesResult {
  badges: CredlyBadge[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface SkillWithCount {
  skill: CredlySkill;
  count: number;
  badges: string[]; // Badge names that include this skill
}

interface UseCredlySkillsResult {
  skills: SkillWithCount[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching Credly badges with caching
 */
/**
 * Check if cache entry exists (even if expired)
 */
function getCachedDataStale<T>(cacheKey: string): T | null {
  const entry = cache.get(cacheKey);
  return entry ? entry.data : null;
}

/**
 * Hook for fetching Credly badges with caching and stale-while-revalidate pattern
 */
export function useCredlyBadges({
  username = "dcyfr",
  limit,
  enabled = true,
}: UseCredlyBadgesOptions = {}): UseCredlyBadgesResult {
  const [badges, setBadges] = useState<CredlyBadge[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true); // Start with true to show loading
  const [error, setError] = useState<string | null>(null);

  // Use ref to prevent unnecessary re-fetches on parameter changes
  const paramsRef = useRef({ username, limit, enabled });
  const isMountedRef = useRef(true);

  const fetchBadges = useCallback(async () => {
    if (!enabled) return;

    try {
      const data = await fetchCredlyBadgesCached(username, limit);

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setBadges(data.badges || []);
        setTotalCount(data.total_count || 0);
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to load badges");
        // Keep stale data if available
        setBadges((prev) => (prev.length === 0 ? [] : prev));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [username, limit, enabled]);

  useEffect(() => {
    // Fetch badges on mount and when parameters change
    fetchBadges();
  }, [username, limit, enabled, fetchBadges]);

  useEffect(() => {
    // Cleanup function to mark component as unmounted
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    badges,
    totalCount,
    loading,
    error,
    refetch: fetchBadges,
  };
}

/**
 * Hook for fetching and aggregating skills from Credly badges
 */
export function useCredlySkills({
  username = "dcyfr",
  enabled = true,
}: Pick<
  UseCredlyBadgesOptions,
  "username" | "enabled"
> = {}): UseCredlySkillsResult {
  const [skills, setSkills] = useState<SkillWithCount[]>([]);
  const [loading, setLoading] = useState(true); // Start with true to show loading
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  const fetchAndAggregateSkills = useCallback(async () => {
    if (!enabled) return;

    try {
      // Fetch all badges (no limit for skills aggregation)
      const data = await fetchCredlyBadgesCached(username);
      const badges = data.badges || [];

      // Aggregate skills from all badges
      const skillMap = new Map<string, SkillWithCount>();

      badges.forEach((badge) => {
        const badgeSkills = badge.badge_template.skills || [];
        badgeSkills.forEach((skill) => {
          // Filter out overly long "skill names" that are actually descriptions
          // (Credly API sometimes returns full sentences as skill names)
          if (skill.name.length > 80) {
            return;
          }

          const existing = skillMap.get(skill.id);
          if (existing) {
            existing.count++;
            existing.badges.push(badge.badge_template.name);
          } else {
            skillMap.set(skill.id, {
              skill,
              count: 1,
              badges: [badge.badge_template.name],
            });
          }
        });
      });

      // Convert to array and sort by count (descending), then alphabetically
      const aggregatedSkills = Array.from(skillMap.values()).sort((a, b) => {
        // Primary sort: count descending
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        // Secondary sort: name ascending
        return a.skill.name.localeCompare(b.skill.name);
      });

      if (isMountedRef.current) {
        setSkills(aggregatedSkills);
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to load skills");
        // Keep stale data if available
        setSkills((prev) => (prev.length === 0 ? [] : prev));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [username, enabled]);

  useEffect(() => {
    fetchAndAggregateSkills();
  }, [fetchAndAggregateSkills]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    skills,
    loading,
    error,
    refetch: fetchAndAggregateSkills,
  };
}

/**
 * Hook for preloading Credly data (useful for page optimization)
 */
export function useCredlyPreload(username: string = "dcyfr"): {
  preload: () => Promise<void>;
  isPreloading: boolean;
} {
  const [isPreloading, setIsPreloading] = useState(false);

  const preload = useCallback(async () => {
    setIsPreloading(true);
    try {
      // Preload common data configurations
      await Promise.all([
        fetchCredlyBadgesCached(username), // All badges
        fetchCredlyBadgesCached(username, 10), // Top 10
        fetchCredlyBadgesCached(username, 3), // Top 3
      ]);
    } catch (error) {
      console.error("[Credly Preload] Failed:", error);
    } finally {
      setIsPreloading(false);
    }
  }, [username]);

  return {
    preload,
    isPreloading,
  };
}
