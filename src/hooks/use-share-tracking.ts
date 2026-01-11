"use client";

import { useState, useRef } from "react";

/**
 * Client-side share tracking hook with anti-spam protection
 *
 * Features:
 * - Session-based tracking (stored in sessionStorage)
 * - Time-on-page validation (minimum 2 seconds)
 * - Rate limiting on client side (prevents rapid clicks)
 * - Graceful error handling
 * - Returns share count after successful tracking
 *
 * @param postId - Permanent post identifier
 * @returns Object with share function and tracking status
 */
export function useShareTracking(postId: string) {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareCount, setShareCount] = useState<number | null>(null);
  const pageLoadTimeRef = useRef<number>(Date.now());
  const lastShareTimeRef = useRef<number>(0);

  /**
   * Track a share action
   * Call this when user clicks a share button
   */
  const trackShare = async (): Promise<{
    success: boolean;
    message?: string;
    count?: number | null;
  }> => {
    // Client-side throttling (prevent rapid clicks)
    const now = Date.now();
    const timeSinceLastShare = now - lastShareTimeRef.current;
    if (timeSinceLastShare < 1000) {
      return { success: false, message: "Please wait before sharing again" };
    }

    setIsSharing(true);
    setError(null);

    try {
      // Get or create session ID
      let sessionId = sessionStorage.getItem("viewTrackingSessionId");
      if (!sessionId) {
        const { generateSessionId } = await import("@/lib/anti-spam-client");
        // Session IDs are for analytics tracking only, not security-sensitive operations.
        // lgtm[js/insecure-randomness]
        sessionId = generateSessionId();
        sessionStorage.setItem("viewTrackingSessionId", sessionId);
      }

      const timeOnPage = now - pageLoadTimeRef.current;

      const response = await fetch("/api/shares", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          sessionId,
          timeOnPage,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.recorded) {
          lastShareTimeRef.current = now;
          setShareCount(data.count);
          return { success: true, count: data.count };
        } else {
          // Duplicate or already recorded
          return {
            success: true,
            message: data.message || "Share already recorded",
            count: data.count,
          };
        }
      } else {
        const errorMessage = data.error || "Failed to track share";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (err) {
      console.error("Share tracking error:", err);
      const errorMessage = "Network error";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsSharing(false);
    }
  };

  return {
    trackShare,
    isSharing,
    error,
    shareCount,
  };
}
