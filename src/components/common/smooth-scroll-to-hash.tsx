"use client";

import * as React from "react";
import { SCROLL_BEHAVIOR } from "@/lib/design-tokens";

/**
 * SmoothScrollToHash Component
 * 
 * Handles smooth scrolling to hash anchors on page load and navigation.
 * Enhances anchor link behavior from external sources with:
 * - Smooth scroll animation with header offset
 * - Highlight animation on target heading
 * - Triggers TOC active state update via custom event
 * 
 * @component
 * @example
 * // Add to layout or page component
 * <SmoothScrollToHash />
 */
export function SmoothScrollToHash() {
  React.useEffect(() => {
    // Track pending timeouts for cleanup
    const pendingTimeouts = new Set<NodeJS.Timeout>();
    
    // Scroll to element with animation
    const scrollToElement = (element: HTMLElement) => {
      const top = element.getBoundingClientRect().top + window.scrollY - SCROLL_BEHAVIOR.offset.standard;
      
      window.scrollTo({
        top,
        behavior: SCROLL_BEHAVIOR.behavior.smooth,
      });

      // Add highlight animation to heading
      element.classList.add("animate-highlight");
      const highlightTimeout = setTimeout(() => {
        element.classList.remove("animate-highlight");
        pendingTimeouts.delete(highlightTimeout);
      }, 2000);
      pendingTimeouts.add(highlightTimeout);

      // Dispatch custom event to notify TOC of hash navigation
      window.dispatchEvent(new CustomEvent("toc:hash-navigation", {
        detail: { id: element.id }
      }));
    };

    // Handle initial hash on page load
    const handleHashOnLoad = () => {
      const hash = window.location.hash;
      if (!hash) return;

      const elementId = hash.slice(1);
      let element = document.getElementById(elementId);
      
      if (!element) {
        // Element not found immediately, try again after a delay
        // This handles async content loading or hydration delays
        const retryTimeout = setTimeout(() => {
          element = document.getElementById(elementId);
          if (element) {
            scrollToElement(element);
          }
          pendingTimeouts.delete(retryTimeout);
        }, 300);
        pendingTimeouts.add(retryTimeout);
        return;
      }

      scrollToElement(element);
    };

    // Handle hash changes during navigation
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash) return;

      const elementId = hash.slice(1);
      const element = document.getElementById(elementId);
      if (element) {
        scrollToElement(element);
      }
    };

    // Use requestIdleCallback for better performance, fallback to setTimeout
    let idleCallbackId: number | null = null;
    let initialTimeout: NodeJS.Timeout | null = null;
    
    if ('requestIdleCallback' in window) {
      idleCallbackId = requestIdleCallback(() => handleHashOnLoad());
    } else {
      initialTimeout = setTimeout(() => handleHashOnLoad(), 100);
      pendingTimeouts.add(initialTimeout);
    }

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      // Cancel pending requestIdleCallback if it exists
      if (idleCallbackId !== null) {
        cancelIdleCallback(idleCallbackId);
      }
      // Clear all pending timeouts
      pendingTimeouts.forEach(timeout => clearTimeout(timeout));
      pendingTimeouts.clear();
      if (initialTimeout !== null) {
        clearTimeout(initialTimeout);
      }
    };
  }, []);

  return null;
}
