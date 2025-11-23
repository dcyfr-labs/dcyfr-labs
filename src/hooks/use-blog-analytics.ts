/**
 * Blog Post Analytics Hook
 * 
 * Tracks user engagement metrics for blog posts including:
 * - Time spent on page
 * - Scroll depth
 * - Reading completion
 * 
 * Automatically tracks completion when user:
 * - Spends at least 30 seconds on page
 * - Scrolls at least 80% of content
 * 
 * Privacy-focused:
 * - Only tracks aggregate metrics
 * - No personal data collection
 * - Respects Do Not Track
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { trackBlogCompleted, trackScrollMilestone } from "@/lib/analytics";

interface UseBlogAnalyticsProps {
  slug: string;
  enabled?: boolean;
}

export function useBlogAnalytics({ slug, enabled = true }: UseBlogAnalyticsProps) {
  const [hasTrackedCompletion, setHasTrackedCompletion] = useState(false);
  const [trackedMilestones, setTrackedMilestones] = useState<Set<25 | 50 | 75 | 90>>(new Set());
  const startTimeRef = useRef<number>(0);
  const maxScrollDepthRef = useRef<number>(0);
  const visibilityTimeRef = useRef<number>(0);
  const lastVisibilityChangeRef = useRef<number>(0);
  const trackedMilestonesRef = useRef<Set<25 | 50 | 75 | 90>>(new Set());
  const hasTrackedCompletionRef = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    // Initialize time values on mount
    if (startTimeRef.current === 0) {
      startTimeRef.current = Date.now();
      lastVisibilityChangeRef.current = Date.now();
    }

    // Reset on slug change
    startTimeRef.current = Date.now();
    maxScrollDepthRef.current = 0;
    visibilityTimeRef.current = 0;
    lastVisibilityChangeRef.current = Date.now();
    hasTrackedCompletionRef.current = false;
    trackedMilestonesRef.current = new Set();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset state on slug change
    setHasTrackedCompletion(false);
    setTrackedMilestones(new Set());

    // Calculate scroll depth
    const calculateScrollDepth = (): number => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      const scrollableHeight = documentHeight - windowHeight;
      if (scrollableHeight <= 0) return 100;
      
      return Math.min(100, Math.round((scrollTop / scrollableHeight) * 100));
    };

    // Get current time on page in seconds
    const getTimeOnPage = (): number => {
      const now = Date.now();
      const elapsedTime = now - startTimeRef.current;
      const visibleTime = document.hidden
        ? visibilityTimeRef.current
        : visibilityTimeRef.current + (now - lastVisibilityChangeRef.current);
      return Math.round((elapsedTime - (elapsedTime - visibleTime)) / 1000);
    };

    // Check and track scroll milestones
    const checkMilestones = () => {
      const currentDepth = maxScrollDepthRef.current;
      const timeOnPage = getTimeOnPage();
      const milestones: Array<25 | 50 | 75 | 90> = [25, 50, 75, 90];

      for (const milestone of milestones) {
        if (currentDepth >= milestone && !trackedMilestonesRef.current.has(milestone)) {
          trackScrollMilestone(slug, milestone, timeOnPage);
          trackedMilestonesRef.current.add(milestone);
          setTrackedMilestones(new Set(trackedMilestonesRef.current));
        }
      }
    };

    // Update max scroll depth
    const updateScrollDepth = () => {
      const currentDepth = calculateScrollDepth();
      if (currentDepth > maxScrollDepthRef.current) {
        maxScrollDepthRef.current = currentDepth;
        checkMilestones();
      }
      checkCompletion();
    };

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page became hidden, add elapsed time to visibility counter
        const elapsed = Date.now() - lastVisibilityChangeRef.current;
        visibilityTimeRef.current += elapsed;
      } else {
        // Page became visible, reset timer
        lastVisibilityChangeRef.current = Date.now();
      }
    };

    // Check if completion criteria met
    const checkCompletion = () => {
      if (hasTrackedCompletionRef.current) return;

      const totalTimeSpent = getTimeOnPage();
      const scrollDepth = maxScrollDepthRef.current;

      // Track completion if user has spent 30+ seconds and scrolled 80%+
      if (totalTimeSpent >= 30 && scrollDepth >= 80) {
        trackBlogCompleted(slug, totalTimeSpent, scrollDepth);
        hasTrackedCompletionRef.current = true;
        setHasTrackedCompletion(true);
      }
    };

    // Set up event listeners
    const scrollHandler = () => {
      updateScrollDepth();
    };

    const beforeUnloadHandler = () => {
      // Track on page exit if criteria met
      checkCompletion();
    };

    window.addEventListener("scroll", scrollHandler, { passive: true });
    window.addEventListener("beforeunload", beforeUnloadHandler);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial scroll depth calculation
    updateScrollDepth();

    // Periodic check (every 10 seconds)
    const interval = setInterval(checkCompletion, 10000);

    return () => {
      window.removeEventListener("scroll", scrollHandler);
      window.removeEventListener("beforeunload", beforeUnloadHandler);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
    // Only re-run effect when slug or enabled changes
    // hasTrackedCompletion and trackedMilestones are intentionally excluded
    // to prevent infinite loops (they're updated inside the effect)
  }, [slug, enabled]);

  return {
    hasTrackedCompletion,
    trackedMilestones: Array.from(trackedMilestones),
  };
}
