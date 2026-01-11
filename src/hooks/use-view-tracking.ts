"use client";

import { useEffect, useRef, useState } from "react";
import { generateSessionId } from "@/lib/anti-spam-client";

/**
 * Client-side view tracking hook with anti-spam protection
 *
 * Features:
 * - Session-based tracking (stored in sessionStorage)
 * - Visibility API integration (only tracks visible pages)
 * - Time-on-page validation (minimum 5 seconds)
 * - Automatic submission when thresholds met
 * - Handles page visibility changes
 * - Graceful error handling
 *
 * @param postId - Permanent post identifier
 * @param enabled - Whether tracking is enabled (default: true)
 * @returns Object with tracking status and manual trigger function
 */
export function useViewTracking(postId: string, enabled = true) {
  const [tracked, setTracked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startTimeRef = useRef<number>(0);
  const hasTrackedRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const visibilityTimeRef = useRef<number>(0);
  const lastVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    // Initialize start time on mount
    if (startTimeRef.current === 0) {
      startTimeRef.current = Date.now();
    }

    if (!enabled || hasTrackedRef.current) {
      return;
    }

    // Get or create session ID
    let sessionId = sessionStorage.getItem("viewTrackingSessionId");
    if (!sessionId) {
      // Session IDs are for analytics tracking only, not security-sensitive operations.
      // lgtm[js/insecure-randomness]
      sessionId = generateSessionId();
      sessionStorage.setItem("viewTrackingSessionId", sessionId);
    }

    // Track time spent with page visible
    const trackVisibilityTime = () => {
      const now = Date.now();
      if (!document.hidden && lastVisibleRef.current) {
        visibilityTimeRef.current += now - startTimeRef.current;
      }
      startTimeRef.current = now;
      lastVisibleRef.current = !document.hidden;
    };

    // Submit view tracking
    const submitView = async () => {
      // Prevent multiple simultaneous submissions
      if (hasTrackedRef.current || isSubmittingRef.current) return;

      isSubmittingRef.current = true;

      const timeOnPage =
        Date.now() - startTimeRef.current + visibilityTimeRef.current;
      const isVisible = !document.hidden;

      try {
        const response = await fetch("/api/views", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postId,
            sessionId,
            timeOnPage,
            isVisible,
          }),
        });

        // Handle blocked API endpoints gracefully (404 from security lockdown)
        if (response.status === 404) {
          // API endpoint is blocked - fail silently in development
          if (process.env.NODE_ENV === "development") {
            // console.warn("View tracking API is blocked in development");
            isSubmittingRef.current = false;
            return;
          }
        }

        // Check if response is JSON before parsing
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          // Only log errors if it's not a blocked API (404)
          if (response.status !== 404) {
            console.error("API returned non-JSON response:", response.status);
            setError("API error");
          }
          isSubmittingRef.current = false;
          return;
        }

        const data = await response.json();

        if (response.ok) {
          if (data.recorded) {
            setTracked(true);
            hasTrackedRef.current = true;
          }
        } else {
          // Don't show errors to user for rate limiting or duplicates
          if (
            response.status !== 429 &&
            !data.message?.includes("already recorded")
          ) {
            setError(data.error || "Failed to track view");
          }
          // Still mark as tracked if it's a duplicate or rate limit
          if (
            response.status === 429 ||
            data.message?.includes("already recorded")
          ) {
            hasTrackedRef.current = true;
          }
        }
      } catch (err) {
        console.error("View tracking error:", err);
        setError("Network error");
      } finally {
        isSubmittingRef.current = false;
      }
    };

    // Check if we should submit (after 5 seconds of visible time)
    const checkAndSubmit = () => {
      trackVisibilityTime();

      // Only submit if page has been visible for at least 5 seconds
      if (visibilityTimeRef.current >= 5000 && !document.hidden) {
        submitView();
      }
    };

    // Set up visibility change handler
    const handleVisibilityChange = () => {
      trackVisibilityTime();

      // If page becomes visible again and we haven't tracked yet, check if we should
      if (!document.hidden && !hasTrackedRef.current) {
        checkAndSubmit();
      }
    };

    // Check every second if we've met the threshold
    const intervalId = setInterval(checkAndSubmit, 1000);

    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Track visibility time on unmount (user leaving page)
    const handleBeforeUnload = () => {
      trackVisibilityTime();
      // If user spent enough time, try to submit
      // Note: This may not always work due to browser restrictions on fetch during unload
      if (visibilityTimeRef.current >= 5000 && !hasTrackedRef.current) {
        // Use sendBeacon for better reliability during unload
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            "/api/views",
            JSON.stringify({
              postId,
              sessionId,
              timeOnPage: visibilityTimeRef.current,
              isVisible: true,
            })
          );
          hasTrackedRef.current = true;
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [postId, enabled]);

  // Manual trigger function (for testing or special cases)
  const triggerView = async () => {
    if (hasTrackedRef.current)
      return { success: false, message: "Already tracked" };

    const sessionId =
      sessionStorage.getItem("viewTrackingSessionId") || generateSessionId();
    const timeOnPage =
      Date.now() - startTimeRef.current + visibilityTimeRef.current;

    try {
      const response = await fetch("/api/views", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          sessionId,
          timeOnPage,
          isVisible: !document.hidden,
        }),
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("API returned non-JSON response:", response.status);
        return { success: false, message: "API error" };
      }

      const data = await response.json();

      if (response.ok && data.recorded) {
        setTracked(true);
        hasTrackedRef.current = true;
        return { success: true };
      }

      return { success: false, message: data.error || data.message };
    } catch {
      return { success: false, message: "Network error" };
    }
  };

  return {
    tracked,
    error,
    triggerView,
  };
}
