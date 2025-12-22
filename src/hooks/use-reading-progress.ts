"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "./use-local-storage";

/**
 * Reading progress data for a single article
 */
export interface ReadingProgress {
  /** Unique identifier for the article (slug or URL) */
  articleId: string;
  /** Progress percentage (0-100) */
  progress: number;
  /** Scroll position in pixels */
  scrollPosition: number;
  /** Total scrollable height */
  scrollHeight: number;
  /** Timestamp of last update */
  lastRead: number;
  /** Article title (for display) */
  title?: string;
  /** Estimated reading time in minutes */
  readingTime?: number;
}

/**
 * Reading progress data structure for localStorage
 */
export interface ReadingProgressData {
  [articleId: string]: ReadingProgress;
}

/**
 * Hook to track reading progress for articles
 * 
 * Automatically tracks scroll position, calculates progress percentage,
 * and persists data to localStorage. Useful for blog posts, documentation,
 * and long-form content.
 * 
 * Features:
 * - Automatic scroll tracking with throttling
 * - Progress percentage calculation
 * - localStorage persistence
 * - "Continue reading" suggestions
 * - Reading time estimation
 * 
 * @param articleId - Unique identifier for the article
 * @param options - Configuration options
 * @returns Reading progress state and actions
 * 
 * @example
 * ```tsx
 * const { progress, isComplete, restoreScrollPosition } = useReadingProgress('my-blog-post', {
 *   title: 'My Blog Post',
 *   readingTime: 5,
 *   threshold: 95, // Mark as complete at 95%
 * });
 * 
 * // Restore scroll position on mount
 * useEffect(() => {
 *   restoreScrollPosition();
 * }, [restoreScrollPosition]);
 * ```
 */
export function useReadingProgress(
  articleId: string,
  options: {
    /** Article title for display */
    title?: string;
    /** Estimated reading time in minutes */
    readingTime?: number;
    /** Completion threshold percentage (default: 90) */
    threshold?: number;
    /** Auto-restore scroll position on mount */
    autoRestore?: boolean;
    /** Throttle delay for scroll events in ms (default: 100) */
    throttleDelay?: number;
  } = {}
) {
  const {
    title,
    readingTime,
    threshold = 90,
    autoRestore = false,
    throttleDelay = 100,
  } = options;

  // Global reading progress storage
  const [progressData, setProgressData] = useLocalStorage<ReadingProgressData>(
    "reading-progress",
    {}
  );

  // Current scroll progress state
  const [progress, setProgress] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Calculate reading progress based on scroll position
  const calculateProgress = useCallback(() => {
    if (typeof window === "undefined") return;

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;

    // Calculate scrollable height (total height - viewport height)
    const scrollableHeight = documentHeight - windowHeight;

    if (scrollableHeight <= 0) {
      // Document is shorter than viewport, mark as 100%
      setProgress(100);
      setScrollPosition(0);
      setIsComplete(true);
      return;
    }

    // Calculate progress percentage
    const currentProgress = Math.min(
      Math.round((scrollTop / scrollableHeight) * 100),
      100
    );

    setProgress(currentProgress);
    setScrollPosition(scrollTop);
    setIsComplete(currentProgress >= threshold);

    // Update localStorage (debounced via useEffect)
    return {
      progress: currentProgress,
      scrollPosition: scrollTop,
      scrollHeight: documentHeight,
    };
  }, [threshold]);

  // Throttled scroll handler
  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId: NodeJS.Timeout;
    let lastUpdate = 0;

    const handleScroll = () => {
      const now = Date.now();

      // Throttle updates
      if (now - lastUpdate < throttleDelay) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(handleScroll, throttleDelay);
        return;
      }

      lastUpdate = now;

      const result = calculateProgress();

      if (result) {
        // Update global progress data
        setProgressData((prev) => ({
          ...prev,
          [articleId]: {
            articleId,
            progress: result.progress,
            scrollPosition: result.scrollPosition,
            scrollHeight: result.scrollHeight,
            lastRead: Date.now(),
            title,
            readingTime,
          },
        }));
      }
    };

    // Initial calculation
    calculateProgress();

    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [articleId, title, readingTime, throttleDelay, calculateProgress, setProgressData]);

  // Restore scroll position from saved progress
  const restoreScrollPosition = useCallback(() => {
    if (typeof window === "undefined") return;

    const saved = progressData[articleId];
    if (saved && saved.scrollPosition > 0) {
      // Restore scroll position
      window.scrollTo({
        top: saved.scrollPosition,
        behavior: "smooth",
      });

      // Update current state
      setProgress(saved.progress);
      setScrollPosition(saved.scrollPosition);
      setIsComplete(saved.progress >= threshold);
    }
  }, [articleId, progressData, threshold]);

  // Auto-restore on mount if enabled
  useEffect(() => {
    if (autoRestore) {
      restoreScrollPosition();
    }
  }, [autoRestore, restoreScrollPosition]);

  // Mark article as complete
  const markComplete = useCallback(() => {
    setProgressData((prev) => ({
      ...prev,
      [articleId]: {
        ...prev[articleId],
        articleId,
        progress: 100,
        scrollPosition: prev[articleId]?.scrollPosition || 0,
        scrollHeight: prev[articleId]?.scrollHeight || 0,
        lastRead: Date.now(),
        title,
        readingTime,
      },
    }));
    setIsComplete(true);
  }, [articleId, title, readingTime, setProgressData]);

  // Clear progress for this article
  const clearProgress = useCallback(() => {
    setProgressData((prev) => {
      const { [articleId]: _, ...rest } = prev;
      return rest;
    });
    setProgress(0);
    setScrollPosition(0);
    setIsComplete(false);
  }, [articleId, setProgressData]);

  return {
    /** Current progress percentage (0-100) */
    progress,
    /** Current scroll position in pixels */
    scrollPosition,
    /** Whether article is considered complete */
    isComplete,
    /** Saved progress data for this article */
    savedProgress: progressData[articleId],
    /** Restore scroll position from saved data */
    restoreScrollPosition,
    /** Mark article as complete */
    markComplete,
    /** Clear progress for this article */
    clearProgress,
  };
}

/**
 * Hook to get all saved reading progress (for "Continue Reading" features)
 * 
 * @param options - Configuration options
 * @returns Reading progress utilities
 * 
 * @example
 * ```tsx
 * const { inProgress, recent, clearAll } = useReadingProgressList({
 *   limit: 5,
 *   minProgress: 10,
 * });
 * 
 * // Show "Continue Reading" section
 * {inProgress.map(article => (
 *   <ContinueReadingCard key={article.articleId} {...article} />
 * ))}
 * ```
 */
export function useReadingProgressList(options: {
  /** Maximum number of results */
  limit?: number;
  /** Minimum progress percentage to include */
  minProgress?: number;
  /** Maximum progress percentage to include (excludes completed) */
  maxProgress?: number;
} = {}) {
  const { limit = 10, minProgress = 5, maxProgress = 95 } = options;

  const [progressData] = useLocalStorage<ReadingProgressData>("reading-progress", {});

  // Get articles in progress (not completed)
  const inProgress = Object.values(progressData)
    .filter(
      (item) =>
        item.progress >= minProgress &&
        item.progress <= maxProgress
    )
    .sort((a, b) => b.lastRead - a.lastRead)
    .slice(0, limit);

  // Get recently read articles
  const recent = Object.values(progressData)
    .sort((a, b) => b.lastRead - a.lastRead)
    .slice(0, limit);

  // Get completed articles
  const completed = Object.values(progressData)
    .filter((item) => item.progress > maxProgress)
    .sort((a, b) => b.lastRead - a.lastRead)
    .slice(0, limit);

  // Clear all progress data
  const [, setProgressData] = useLocalStorage<ReadingProgressData>("reading-progress", {});
  
  const clearAll = useCallback(() => {
    setProgressData({});
  }, [setProgressData]);

  return {
    /** Articles currently in progress */
    inProgress,
    /** Recently read articles */
    recent,
    /** Completed articles */
    completed,
    /** All progress data */
    all: Object.values(progressData),
    /** Total number of tracked articles */
    total: Object.keys(progressData).length,
    /** Clear all progress data */
    clearAll,
  };
}
