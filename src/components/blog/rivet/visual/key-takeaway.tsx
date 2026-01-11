"use client";

import * as React from "react";
import {
  Lightbulb,
  Shield,
  AlertTriangle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SPACING, BORDERS, TYPOGRAPHY } from "@/lib/design-tokens";

/**
 * KeyTakeaway Component
 *
 * Highlighted callout box for key insights, security notes, warnings, or tips.
 * Visually distinct with left border accent and contextual icons.
 *
 * @component
 * @example
 * ```tsx
 * <KeyTakeaway variant="insight" title="Key Insight">
 *   This is an important concept to understand.
 * </KeyTakeaway>
 *
 * <KeyTakeaway variant="security">
 *   Always validate user input before processing.
 * </KeyTakeaway>
 * ```
 *
 * @variants
 * - insight: General important information (💡 Lightbulb, blue)
 * - security: Security-related guidance (🛡️ Shield, green)
 * - warning: Cautions and potential issues (⚠️ AlertTriangle, amber)
 * - tip: Helpful suggestions (✨ Sparkles, purple)
 *
 * @implementation
 * - Left border: 4px solid with variant-specific color
 * - Icon: Lucide React icon matching variant theme
 * - Background: Subtle tint matching variant color
 * - Typography: Design tokens for consistent sizing
 * - Spacing: Design tokens for padding and gaps
 *
 * @accessibility
 * - Semantic HTML with role="note" for importance
 * - Optional title in <strong> for screen reader emphasis
 * - High contrast colors from design tokens
 * - Icon is decorative (aria-hidden="true")
 *
 * @performance
 * - No client-side state or effects
 * - Icons tree-shaken via Lucide React
 */

type KeyTakeawayVariant = "insight" | "security" | "warning" | "tip";

interface KeyTakeawayProps {
  /** Visual variant (default: "insight") */
  variant?: KeyTakeawayVariant;
  /** Optional title (bold text above content) */
  title?: string;
  /** Content to display */
  children: React.ReactNode;
  /** Optional className */
  className?: string;
}

interface VariantConfig {
  icon: LucideIcon;
  borderColor: string;
  bgColor: string;
  iconColor: string;
  label: string;
}

const variantConfig: Record<KeyTakeawayVariant, VariantConfig> = {
  insight: {
    icon: Lightbulb,
    borderColor: "border-info",
    bgColor: "bg-info-subtle",
    iconColor: "text-info",
    label: "Key Insight",
  },
  security: {
    icon: Shield,
    borderColor: "border-success",
    bgColor: "bg-success-subtle",
    iconColor: "text-success",
    label: "Security Note",
  },
  warning: {
    icon: AlertTriangle,
    borderColor: "border-warning",
    bgColor: "bg-warning-subtle",
    iconColor: "text-warning",
    label: "Warning",
  },
  tip: {
    icon: Sparkles,
    borderColor: "border-semantic-purple",
    bgColor: "bg-semantic-purple/10",
    iconColor: "text-semantic-purple",
    label: "Pro Tip",
  },
};

export function KeyTakeaway({
  variant = "insight",
  title,
  children,
  className,
}: KeyTakeawayProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      role="note"
      aria-label={title || config.label}
      className={cn(
        "relative rounded-md border-l-4",
        config.borderColor,
        config.bgColor,
        "p-4",
        "my-6",
        className
      )}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <Icon
          className={cn("h-5 w-5 flex-shrink-0 mt-0.5", config.iconColor)}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <strong
              className={cn(
                "block mb-2",
                TYPOGRAPHY.label.small,
                config.iconColor
              )}
            >
              {title}
            </strong>
          )}
          <div className={cn("prose prose-sm dark:prose-invert max-w-none")}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
