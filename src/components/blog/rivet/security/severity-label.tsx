import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ANIMATION } from "@/lib/design-tokens";

/**
 * SeverityLabel - Color-coded security severity badge
 *
 * Displays vulnerability severity levels with standardized color coding:
 * - CRITICAL: Red (highest severity)
 * - HIGH: Orange
 * - MEDIUM: Yellow
 * - LOW: Blue
 * - INFO: Gray (informational)
 *
 * Features:
 * - Consistent color scheme across light/dark modes
 * - Accessible contrast ratios (WCAG AA)
 * - Semantic HTML with proper ARIA labels
 * - Smooth theme transitions
 *
 * @example
 * ```tsx
 * <SeverityLabel severity="critical" />
 * <SeverityLabel severity="high" count={3} />
 * <SeverityLabel severity="medium" count={4} />
 * ```
 */

export type SeverityLevel = "critical" | "high" | "medium" | "low" | "info";

interface SeverityLabelProps {
  /** Severity level */
  severity: SeverityLevel;
  /** Optional count to display (e.g., "3 HIGH") */
  count?: number;
  /** Optional className for custom styling */
  className?: string;
}

/**
 * Color variants for each severity level
 * Uses Tailwind classes for consistent theming
 */
const severityStyles: Record<
  SeverityLevel,
  {
    bg: string;
    text: string;
    border: string;
    label: string;
  }
> = {
  critical: {
    bg: "bg-red-600 dark:bg-red-900",
    text: "text-red-50 dark:text-red-100",
    border: "border-red-700 dark:border-red-800",
    label: "CRITICAL",
  },
  high: {
    bg: "bg-orange-600 dark:bg-orange-800",
    text: "text-orange-50 dark:text-orange-100",
    border: "border-orange-700 dark:border-orange-900",
    label: "HIGH",
  },
  medium: {
    bg: "bg-yellow-600 dark:bg-yellow-700",
    text: "text-yellow-50 dark:text-yellow-100",
    border: "border-yellow-700 dark:border-yellow-800",
    label: "MEDIUM",
  },
  low: {
    bg: "bg-blue-600 dark:bg-blue-700",
    text: "text-blue-50 dark:text-blue-100",
    border: "border-blue-700 dark:border-blue-800",
    label: "LOW",
  },
  info: {
    bg: "bg-gray-600 dark:bg-gray-700",
    text: "text-gray-50 dark:text-gray-100",
    border: "border-gray-700 dark:border-gray-800",
    label: "INFO",
  },
};

export function SeverityLabel({
  severity,
  count,
  className,
}: SeverityLabelProps) {
  const styles = severityStyles[severity];
  const displayText = count !== undefined ? `${count} ${styles.label}` : styles.label;

  return (
    <Badge
      className={cn(
        styles.bg,
        styles.text,
        styles.border,
        "font-semibold uppercase tracking-wide",
        ANIMATION.transition.theme,
        className
      )}
      aria-label={`Severity: ${styles.label}${count ? `, Count: ${count}` : ""}`}
    >
      {displayText}
    </Badge>
  );
}
