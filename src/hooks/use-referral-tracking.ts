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

"use client";

import { useEffect, useState } from "react";
import {
  detectReferralSource,
  trackReferral,
  shouldTrackReferral,
  type ReferralSource,
} from "@/lib/analytics";
import { useSession } from "@/hooks/use-session";

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
          throw new Error("Session ID not available");
        }

        // Detect or use custom source
        const detectedSource =
          customSource !== undefined ? customSource : detectReferralSource();

        setSource(detectedSource);

        // Track the referral
        const result = await trackReferral(postId, sessionId, detectedSource);

        if (result.success) {
          setTracked(true);
          onSuccess?.();
        } else {
          const errorMessage = result.error || "Unknown error";
          setError(errorMessage);
          onError?.(errorMessage);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Network error";
        setError(errorMessage);
        onError?.(errorMessage);
        console.error("[Referral Tracking] Error:", err);
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
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch referral counts";
        setError(errorMessage);
        console.error("[Referral Counts] Error:", err);
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
