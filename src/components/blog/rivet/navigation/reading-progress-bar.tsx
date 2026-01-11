"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ANIMATION } from "@/lib/design-tokens";

/**
 * ReadingProgressBar Component
 *
 * Visual progress indicator showing how far the user has scrolled through a post.
 * Fixed position bar that fills from left to right as user scrolls.
 *
 * @component
 * @example
 * ```tsx
 * <ReadingProgressBar /> // Default: top, primary color
 * <ReadingProgressBar position="bottom" color="secondary" showPercentage />
 * ```
 *
 * @implementation
 * - Uses scroll event listener with passive flag for performance
 * - Calculates progress as: (scrollTop / documentHeight) × 100
 * - Framer Motion for smooth width animation
 * - Fixed positioning at top or bottom of viewport
 * - Z-index 50 to appear above most content but below modals
 *
 * @accessibility
 * - Purely visual indicator (no interactive elements)
 * - Percentage text readable by screen readers
 * - High contrast colors from design tokens
 *
 * @performance
 * - Passive scroll listener (doesn't block scrolling)
 * - Cleanup on unmount prevents memory leaks
 * - Throttled updates via React state batching
 */

interface ReadingProgressBarProps {
  /** Progress color (default: primary) */
  color?: "primary" | "secondary" | "accent";
  /** Bar height in pixels (default: 4) */
  height?: number;
  /** Show percentage text (default: false) */
  showPercentage?: boolean;
  /** Position (default: "top") */
  position?: "top" | "bottom";
  /** Optional className */
  className?: string;
}

export function ReadingProgressBar({
  color = "primary",
  height = 4,
  showPercentage = false,
  position = "top",
  className,
}: ReadingProgressBarProps) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(Math.min(100, Math.max(0, scrollPercent)));
    };

    // Initial calculation
    updateProgress();

    // Listen for scroll events
    window.addEventListener("scroll", updateProgress, { passive: true });

    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  const colorClasses = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    accent: "bg-accent",
  };

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-50 bg-muted/20",
        position === "top" ? "top-0" : "bottom-0",
        className
      )}
      style={{ height: `${height}px` }}
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={cn("h-full", colorClasses[color])}
        style={{ width: `${progress}%` }}
        transition={{
          duration: 0.15,
          ease: "easeOut",
        }}
      />
      {showPercentage && (
        <div
          className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2",
            "text-xs font-medium tabular-nums",
            "bg-background/80 px-2 py-0.5 rounded backdrop-blur-sm"
          )}
        >
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
}
