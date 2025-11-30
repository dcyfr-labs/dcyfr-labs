"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Loading bar component that appears during route transitions.
 * Shows a progress bar at the top of the viewport with smooth CSS animation.
 * 
 * Uses pure CSS animations instead of framer-motion for better performance
 * and smaller bundle size (~20KB savings).
 */
export function LoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Loading state management
    setIsLoading(true);
    setIsExiting(false);
    
    const loadingTimeout = setTimeout(() => {
      setIsExiting(true);
      // Wait for exit animation to complete before hiding
      const exitTimeout = setTimeout(() => {
        setIsLoading(false);
        setIsExiting(false);
      }, 200);
      return () => clearTimeout(exitTimeout);
    }, 500);
    
    return () => clearTimeout(loadingTimeout);
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left transition-all duration-500 ease-in-out ${
        isExiting ? "opacity-0 scale-x-100" : "opacity-100 scale-x-100 animate-loading-bar"
      }`}
      style={{ transformOrigin: "0% 50%" }}
      role="progressbar"
      aria-label="Page loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={isExiting ? 100 : undefined}
    />
  );
}
