'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ANIMATION, Z_INDEX } from '@/lib/design-tokens';

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
    setIsLoading(true);
    setIsExiting(false);

    let exitTimeout: NodeJS.Timeout | null = null;
    const loadingTimeout = setTimeout(() => {
      setIsExiting(true);
      // Wait for exit animation to complete before hiding
      exitTimeout = setTimeout(() => {
        setIsLoading(false);
        setIsExiting(false);
      }, 200);
    }, 500);

    return () => {
      clearTimeout(loadingTimeout);
      if (exitTimeout) {
        clearTimeout(exitTimeout);
      }
    };
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return (
    <div
      className={cn(
        `fixed top-0 left-0 right-0 h-1 bg-primary ${Z_INDEX.dropdown} origin-left transition-movement ease-in-out`,
        ANIMATION.duration.slow,
        isLoading ? 'opacity-100' : 'opacity-0',
        isExiting ? 'opacity-0 scale-x-100' : 'opacity-100 scale-x-100 animate-loading-bar'
      )}
      style={{ transformOrigin: '0% 50%' }}
      role="progressbar"
      aria-label="Page loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={isExiting ? 100 : undefined}
    />
  );
}
