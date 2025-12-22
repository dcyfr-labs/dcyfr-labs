"use client";

import { APP_TOKENS } from "@/lib/design-tokens";

/**
 * Reading Progress Bar Component
 * 
 * Fixed progress bar at the top of the viewport showing reading progress.
 * Animates smoothly as user scrolls through content.
 * 
 * @example
 * ```tsx
 * <ReadingProgressBar progress={75} />
 * ```
 */
export function ReadingProgressBar({ progress }: { progress: number }) {
  return (
    <div
      className={`fixed top-0 left-0 right-0 h-1 bg-muted/30 ${APP_TOKENS.Z_INDEX.sticky}`}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div
        className={`h-full bg-primary transition-all ${APP_TOKENS.ANIMATIONS.optimisticUpdate}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
