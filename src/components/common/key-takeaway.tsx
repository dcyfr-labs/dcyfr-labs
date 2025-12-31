"use client";

import * as React from "react";
import { Lightbulb } from "lucide-react";
import { SEMANTIC_COLORS, BORDERS } from "@/lib/design-tokens";

/**
 * Key Takeaway Component for MDX
 *
 * Displays important insights and key takeaways in a highlighted banner format.
 * Optimized for blog content where key insights should stand out from regular text.
 *
 * Features:
 * - Prominent lightbulb icon to indicate insight
 * - Highlighted "Key Takeaway:" prefix
 * - Semantic color theming using design tokens
 * - Responsive padding and typography
 * - Accessible markup with proper roles
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Key takeaway content
 * @param {string} props.className - Additional CSS classes
 *
 * @example
 * ```mdx
 * <KeyTakeaway>
 *   If an agent's goals can be hijacked, it becomes a weapon turned against you---using its own legitimate access to cause harm.
 * </KeyTakeaway>
 * ```
 *
 * @example
 * ```mdx
 * <KeyTakeaway>
 *   Even legitimate, authorized tools become dangerous when agents use them incorrectly or under attacker influence.
 * </KeyTakeaway>
 * ```
 */

export interface KeyTakeawayProps {
  children: React.ReactNode;
  className?: string;
}

export function KeyTakeaway({ children, className = "" }: KeyTakeawayProps) {
  const colors = SEMANTIC_COLORS.alert.info;

  return (
    <div
      className={`${BORDERS.card} ${colors.border} ${colors.container} p-4 sm:p-5 my-6 ${className}`}
      role="note"
      aria-label="Key takeaway"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <Lightbulb
          className={`h-5 w-5 sm:h-6 sm:w-6 mt-0.5 shrink-0 ${colors.icon}`}
          aria-hidden="true"
        />
        <div
          className={`flex-1 text-sm sm:text-base leading-relaxed max-w-none ${colors.text}`}
        >
          <span className={`font-semibold ${colors.label}`}>Key Takeaway:</span>{" "}
          <span className="[&>p]:m-0 [&>p]:inline [&>strong]:font-semibold [&>em]:italic">
            {children}
          </span>
        </div>
      </div>
    </div>
  );
}

KeyTakeaway.displayName = "KeyTakeaway";
