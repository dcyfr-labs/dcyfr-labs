import { cn } from "@/lib/utils";
import { Flame, TrendingUp, Star, Rocket } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

export type TrendingBadgeVariant = "hot" | "rising" | "top" | "accelerating";

interface TrendingBadgeProps {
  /** Badge variant determining appearance and icon */
  variant: TrendingBadgeVariant;
  /** Optional additional class names */
  className?: string;
  /** Optional aria-label for accessibility */
  ariaLabel?: string;
}

// ============================================================================
// BADGE CONFIGURATION
// ============================================================================

const BADGE_CONFIG = {
  hot: {
    icon: Flame,
    label: "Hot",
    color: "bg-error-subtle text-error border-error-light",
    description: "Rapid growth this week",
  },
  rising: {
    icon: TrendingUp,
    label: "Rising",
    color: "bg-info-subtle text-info border-info-light",
    description: "Steady growth this month",
  },
  top: {
    icon: Star,
    label: "Top",
    color: "bg-muted text-foreground border-border",
    description: "Highest in category",
  },
  accelerating: {
    icon: Rocket,
    label: "Accelerating",
    color:
      "bg-semantic-purple/10 text-semantic-purple border-semantic-purple/20",
    description: "Growth rate increasing",
  },
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * TrendingBadge Component
 *
 * Visual indicator for trending momentum and growth velocity.
 * Shows badge with icon + label to highlight trending status.
 *
 * Badge Types:
 * - Flame Hot: Rapid recent growth (>50% in 7 days)
 * - TrendingUp Rising: Steady growth (>20% in 30 days)
 * - Star Top: All-time highest in category
 * - Rocket Accelerating: Growth rate increasing week-over-week
 *
 * @example
 * ```tsx
 * <TrendingBadge variant="hot" />
 * <TrendingBadge variant="rising" ariaLabel="Rising in popularity" />
 * ```
 */
export function TrendingBadge({
  variant,
  className,
  ariaLabel,
}: TrendingBadgeProps) {
  const config = BADGE_CONFIG[variant];
  const IconComponent = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        config.color,
        className
      )}
      aria-label={ariaLabel || config.description}
      role="status"
    >
      <IconComponent className="w-3 h-3" aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
