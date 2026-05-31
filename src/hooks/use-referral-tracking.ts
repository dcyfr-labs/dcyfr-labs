/**
 * Referral Tracking Hook
 *
 * React hook for tracking referrals on page load.
 * Automatically detects referral sources and tracks them with anti-spam protection.
 *
 * @example
 * ```typescript
 * function BlogPost({ postId }) {
 *   useReferralTracking(postId);
 *   return <div>...</div>;
 * }
 * ```
 */

'use client';

import { useEffect, useState } from 'react';
import {
  detectReferralSource,
  trackReferral,
  shouldTrackReferral,
  type ReferralSource,
} from '@/lib/analytics';
import { useSession } from '@/hooks/use-session';
import { aggregateReferralCounts, type PostReferralData } from '@/lib/analytics/referral-aggregate';

// ============================================================================
// TYPES
// ============================================================================

export interface UseReferralTrackingOptions {
  /** Enable or disable tracking (default: true) */
  enabled?: boolean;
  /** Custom referral source (overrides auto-detection) */
  source?: ReferralSource | null;
  /** Callback when tracking succeeds */
  onSuccess?: () => void;
  /** Callback when tracking fails */
  onError?: (error: string) => void;
}

export interface UseReferralTrackingReturn {
  /** Whether tracking has been attempted */
  tracked: boolean;
  /** Whether tracking is in progress */
  tracking: boolean;
  /** The detected referral source */
  source: ReferralSource | null;
  /** Any error that occurred */
  error: string | null;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Track referrals automatically on component mount
 *
 * @param postId - The blog post ID to track referrals for
 * @param options - Optional configuration
 * @returns Tracking state and detected source
 *
 * @example
 * ```typescript
 * // Basic usage
 * useReferralTracking('post-123');
 *
 * // With callbacks
 * useReferralTracking('post-123', {
 *   onSuccess: () => console.log('Tracked!'),
 *   onError: (error) => console.error(error),
 * });
 *
 * // Conditional tracking
 * useReferralTracking('post-123', {
 *   enabled: userConsent,
 * });
 * ```
 */
export function useReferralTracking(
  postId: string,
  options: UseReferralTrackingOptions = {}
): UseReferralTrackingReturn {
  const { enabled = true, source: customSource, onSuccess, onError } = options;

  const { sessionId, isLoading: sessionLoading } = useSession();

  const [tracked, setTracked] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [source, setSource] = useState<ReferralSource | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't track if disabled or already tracked
    if (!enabled || tracked || tracking || sessionLoading) {
      return;
    }

    // Wait for session ID
    if (!sessionId) {
      return;
    }

    // Check if tracking is allowed (privacy settings)
    if (!shouldTrackReferral()) {
      setTracked(true);
      return;
    }

    async function track() {
      setTracking(true);
      setError(null);

      try {
        // Ensure we have a valid session ID
        if (!sessionId) {
          throw new Error('Session ID not available');
        }

        // Detect or use custom source
        const detectedSource = customSource !== undefined ? customSource : detectReferralSource();

        setSource(detectedSource);

        // Track the referral
        const result = await trackReferral(postId, sessionId, detectedSource);

        if (result.success) {
          setTracked(true);
          onSuccess?.();
        } else {
          const errorMessage = result.error || 'Unknown error';
          setError(errorMessage);
          onError?.(errorMessage);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Network error';
        setError(errorMessage);
        onError?.(errorMessage);
        console.error('[Referral Tracking] Error:', err);
      } finally {
        setTracking(false);
      }
    }

    track();
  }, [
    postId,
    sessionId,
    sessionLoading,
    enabled,
    tracked,
    tracking,
    customSource,
    onSuccess,
    onError,
  ]);

  return {
    tracked,
    tracking,
    source,
    error,
  };
}

/**
 * Get referral counts for a post
 *
 * @param postId - The blog post ID
 * @returns Referral counts by platform
 *
 * @example
 * ```typescript
 * function PostStats({ postId }) {
 *   const { data, loading, error } = useReferralCounts(postId);
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return (
 *     <div>
 *       Total referrals: {data?.total}
 *       Twitter: {data?.referrals.twitter}
 *       DEV: {data?.referrals.dev}
 *     </div>
 *   );
 * }
 * ```
 */
export function useReferralCounts(postId: string) {
  const [data, setData] = useState<{
    postId: string;
    referrals: Record<string, number>;
    total: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) {
      setLoading(false);
      return;
    }

    async function fetchCounts() {
      try {
        const response = await fetch(
          `/api/analytics/referral?postId=${encodeURIComponent(postId)}`
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch referral counts';
        setError(errorMessage);
        console.error('[Referral Counts] Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
  }, [postId]);

  return {
    data,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
    },
  };
}

// ============================================================================
// AGGREGATE REFERRAL COUNTS (multi-post)
// ============================================================================

export interface UseAggregateReferralCountsReturn {
  /** Aggregated referral counts across the requested posts (null until loaded). */
  data: PostReferralData | null;
  /** Whether the aggregate fetch is in progress. */
  loading: boolean;
  /** Error message if any per-post fetch failed. */
  error: string | null;
}

/**
 * Fetch and aggregate referral counts across many posts.
 *
 * Calls `GET /api/analytics/referral` once per post id (in parallel) and sums
 * the results per platform via {@link aggregateReferralCounts}. Refetches only
 * when the *set* of post ids changes (ids are joined into a stable key), so it
 * is safe to pass a freshly-mapped array on every render.
 *
 * @param postIds - Stable post IDs (post-YYYYMMDD-XXXXXXXX) to aggregate.
 *
 * @example
 * ```tsx
 * const { data, loading } = useAggregateReferralCounts(posts.map((p) => p.id));
 * ```
 */
export function useAggregateReferralCounts(postIds: string[]): UseAggregateReferralCountsReturn {
  const [data, setData] = useState<PostReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stable primitive key so the effect only re-runs when the set of ids
  // changes — not on every render (posts.map(...) is a new array each time).
  const key = postIds.filter(Boolean).join(',');

  useEffect(() => {
    const ids = key ? key.split(',') : [];

    if (ids.length === 0) {
      setData({ referrals: {}, total: 0 });
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function fetchAll() {
      try {
        const results = await Promise.all(
          ids.map(async (id) => {
            const response = await fetch(
              `/api/analytics/referral?postId=${encodeURIComponent(id)}`
            );
            if (!response.ok) {
              throw new Error(`API error: ${response.status}`);
            }
            return (await response.json()) as PostReferralData;
          })
        );

        if (cancelled) return;
        setData(aggregateReferralCounts(results));
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch referral counts');
        console.error('[Aggregate Referral Counts] Error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();

    return () => {
      cancelled = true;
    };
    // `key` encodes the id set; intentionally the only dependency.
  }, [key]);

  return { data, loading, error };
}
