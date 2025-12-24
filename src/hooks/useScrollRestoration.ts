import { useEffect, useRef } from "react";

/**
 * Hook for restoring scroll position on navigation back
 *
 * Saves scroll position to sessionStorage and restores it when the component mounts.
 * Useful for maintaining scroll position when navigating between pages.
 *
 * @param key - Unique key for this scroll position in sessionStorage
 * @param scrollElement - Element to track scroll position for
 *
 * @example
 * ```tsx
 * const scrollRef = useRef<HTMLDivElement>(null);
 * useScrollRestoration('activity-feed', scrollRef);
 *
 * return <div ref={scrollRef}>...</div>;
 * ```
 */
export function useScrollRestoration(
  key: string,
  scrollElement: React.RefObject<HTMLElement | null>
) {
  const restoredRef = useRef(false);

  useEffect(() => {
    const element = scrollElement.current;
    if (!element) return;

    // Restore scroll position on mount
    if (!restoredRef.current) {
      const savedPosition = sessionStorage.getItem(`scroll-${key}`);
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          element.scrollTop = position;
        }, 0);
      }
      restoredRef.current = true;
    }

    // Save scroll position on scroll
    const handleScroll = () => {
      sessionStorage.setItem(`scroll-${key}`, element.scrollTop.toString());
    };

    element.addEventListener("scroll", handleScroll, { passive: true });

    // Clear scroll position on page unload (fresh navigation)
    const handleBeforeUnload = () => {
      sessionStorage.removeItem(`scroll-${key}`);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      element.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [key, scrollElement]);
}
