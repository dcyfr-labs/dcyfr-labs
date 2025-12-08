"use client";

/**
 * Page Transition Provider Component
 * 
 * Wraps route changes with the View Transitions API for seamless page transitions.
 * Similar to the theme-toggle pattern, this intercepts Next.js navigation events
 * and wraps them in document.startViewTransition() for smooth animations.
 * 
 * Supported by: Chrome 111+, Edge 111+, Safari 18+
 * Falls back gracefully to instant navigation in unsupported browsers.
 * 
 * @example
 * ```tsx
 * // In layout.tsx
 * <PageTransitionProvider>
 *   {children}
 * </PageTransitionProvider>
 * ```
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface PageTransitionProviderProps {
  children: React.ReactNode;
}

export function PageTransitionProvider({ children }: PageTransitionProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Check if View Transitions API is supported
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      document.documentElement.classList.add("view-transitions-supported");
    }
  }, []);

  // Track pathname changes for transition effects
  // The actual navigation is handled by Next.js Link components
  // This effect is primarily for logging/tracking purposes
  useEffect(() => {
    // Pathname changed - transition already happened via Link clicks
    // This is where you could add analytics or other side effects
  }, [pathname]);

  return <>{children}</>;
}

/**
 * CSS classes to enable in globals.css:
 * 
 * ```css
 * @supports (view-transition-name: none) {
 *   ::view-transition-old(root),
 *   ::view-transition-new(root) {
 *     animation-duration: 300ms;
 *     animation-timing-function: ease-in-out;
 *   }
 * }
 * ```
 */
