"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { ANIMATION } from "@/lib/design-tokens";

/**
 * Reading Progress Indicator Component
 * 
 * Circular progress indicator for blog post cards showing reading progress.
 * Displays as a ring that fills as the user progresses through the article.
 * 
 * @example
 * ```tsx
 * <ReadingProgressIndicator progress={45} size="md" />
 * ```
 */
export function ReadingProgressIndicator({
  progress,
  size = "md",
  showLabel = false,
}: {
  /** Progress percentage (0-100) */
  progress: number;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show percentage label */
  showLabel?: boolean;
}) {
  const isComplete = progress >= 95;

  // Size configurations
  const sizes = {
    sm: {
      container: "w-8 h-8",
      stroke: 2,
      icon: "w-4 h-4",
      text: "text-xs",
    },
    md: {
      container: "w-12 h-12",
      stroke: 3,
      icon: "w-6 h-6",
      text: "text-sm",
    },
    lg: {
      container: "w-16 h-16",
      stroke: 4,
      icon: "w-8 h-8",
      text: "text-base",
    },
  };

  const config = sizes[size];
  const radius = size === "sm" ? 14 : size === "md" ? 20 : 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  if (isComplete) {
    return (
      <div
        className={`${config.container} flex items-center justify-center`}
        aria-label="Article completed"
      >
        <CheckCircle2 className={`${config.icon} text-muted-foreground`} />
      </div>
    );
  }

  if (progress === 0) {
    return (
      <div
        className={`${config.container} flex items-center justify-center`}
        aria-label="Not started"
      >
        <Circle className={`${config.icon} text-muted-foreground/30`} />
      </div>
    );
  }

  return (
    <div
      className={`${config.container} relative flex items-center justify-center`}
      aria-label={`Reading progress: ${progress}%`}
    >
      {/* Background circle */}
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          className="text-muted-foreground/20"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`text-primary ${ANIMATION.transition.appearance}`}
        />
      </svg>

      {/* Progress label */}
      {showLabel && (
        <span className={`${config.text} font-medium text-foreground`}>
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
}
