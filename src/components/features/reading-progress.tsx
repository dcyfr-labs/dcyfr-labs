'use client';

import { useEffect, useRef } from 'react';
import { Z_INDEX } from '@/lib/design-tokens';

/**
 * Reading progress indicator that shows how far the user has scrolled through the page.
 * Displays a fixed progress bar at the top of the viewport.
 * Uses requestAnimationFrame for smooth, jank-free animations.
 */
export function ReadingProgress() {
  const progressRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const updateProgress = () => {
      if (!progressRef.current) return;

      // Calculate scroll progress
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      // Calculate percentage (0-100)
      const totalScrollable = documentHeight - windowHeight;
      const scrollPercentage = totalScrollable > 0 ? (scrollTop / totalScrollable) * 100 : 0;

      const clampedProgress = Math.min(100, Math.max(0, scrollPercentage));

      // Update transform instead of width for better performance
      // scaleX is GPU-accelerated and doesn't trigger layout recalculation
      progressRef.current.style.transform = `scaleX(${clampedProgress / 100})`;
      progressRef.current.setAttribute('aria-valuenow', Math.round(clampedProgress).toString());
    };

    const scheduleUpdate = () => {
      // Cancel any pending animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      // Schedule update for next frame
      rafRef.current = requestAnimationFrame(updateProgress);
    };

    // Initial calculation
    updateProgress();

    // Update on scroll with passive listener for better performance
    window.addEventListener('scroll', scheduleUpdate, { passive: true });

    // Update on resize in case content height changes
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={progressRef}
      className={`fixed top-0 left-0 right-0 ${Z_INDEX.dropdown} h-1 bg-gradient-to-r from-primary via-primary/80 to-primary pointer-events-none origin-left`}
      style={{
        transform: 'scaleX(0)',
        willChange: 'transform',
      }}
      role="progressbar"
      aria-valuenow={0}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    />
  );
}
