"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Options for scroll animation configuration
 */
interface UseScrollAnimationOptions {
  /** Trigger animation when element is X% visible (0-1) */
  threshold?: number;
  /** Root margin for intersection observer (e.g., "0px 0px -100px 0px") */
  rootMargin?: string;
  /** Only animate once (default: true) */
  triggerOnce?: boolean;
}

/**
 * useScrollAnimation Hook
 *
 * Provides scroll-triggered visibility detection using IntersectionObserver API.
 * Returns state that can be used with CSS animation classes.
 * 
 * **Animation Philosophy:**
 * - CSS handles all animation timing and reduced-motion preferences
 * - This hook only provides viewport detection
 * - Simple, performant, no animation logic in JavaScript
 *
 * Features:
 * - IntersectionObserver-based visibility detection
 * - Configurable threshold and rootMargin
 * - Optional one-time or repeating detection
 * - Minimal re-renders (only on visibility change)
 *
 * @param {UseScrollAnimationOptions} options - Configuration
 * @param {number} [options.threshold=0.1] - Percentage of element visible to trigger (0-1)
 * @param {string} [options.rootMargin="0px"] - Margin around viewport for early/late triggering
 * @param {boolean} [options.triggerOnce=true] - Only trigger once, or repeat on scroll
 *
 * @returns {Object} Animation state and ref
 * @returns {React.RefObject} ref - Attach to element to observe
 * @returns {boolean} isVisible - Whether element is in viewport
 * @returns {boolean} hasAnimated - Whether visibility has triggered (for triggerOnce)
 * @returns {boolean} shouldAnimate - Same as isVisible (CSS handles reduced motion)
 *
 * @example
 * // With CSS animation classes
 * function PostCard() {
 *   const { ref, shouldAnimate } = useScrollAnimation();
 *   
 *   return (
 *     <div 
 *       ref={ref}
 *       className={cn(
 *         "reveal-hidden reveal-up transition-base",
 *         shouldAnimate && "reveal-visible"
 *       )}
 *     >
 *       Content
 *     </div>
 *   );
 * }
 *
 * @example
 * // With early trigger (for above-fold content)
 * const { ref, shouldAnimate } = useScrollAnimation({
 *   threshold: 0,
 *   rootMargin: "50px 0px",
 * });
 *
 * @performance
 * - Uses native IntersectionObserver (no polyfill needed)
 * - Minimal re-renders (only on visibility change)
 * - Automatic cleanup on unmount
 * - CSS handles animation performance
 *
 * @accessibility
 * - CSS @media (prefers-reduced-motion) handles reduced motion globally
 * - No JavaScript animation timing that could be overridden
 *
 * @browser_support
 * - Chrome 51+, Firefox 55+, Safari 12.1+, Edge 15+
 * - Graceful degradation: element visible by default if IntersectionObserver unavailable
 *
 * @see src/app/globals.css for animation CSS classes
 * @see src/lib/design-tokens.ts for ANIMATION constants
 */
export function useScrollAnimation({
  threshold = 0.1,
  rootMargin = "0px",
  triggerOnce = true,
}: UseScrollAnimationOptions = {}) {
  const ref = useRef<HTMLElement>(null);
  // Always start false to avoid hydration mismatch
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Set up IntersectionObserver
  useEffect(() => {
    const element = ref.current;
    
    // Fallback: show element immediately if IntersectionObserver unavailable
    // Use requestAnimationFrame to avoid synchronous setState in effect
    if (typeof IntersectionObserver === "undefined") {
      const frameId = requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return () => cancelAnimationFrame(frameId);
    }
    
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            setHasAnimated(true);
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return {
    ref,
    isVisible,
    hasAnimated,
    // CSS handles reduced motion, so shouldAnimate = isVisible
    shouldAnimate: isVisible,
  };
}
