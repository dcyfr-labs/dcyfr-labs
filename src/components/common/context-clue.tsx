"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { SEMANTIC_COLORS, BORDERS } from "@/lib/design-tokens";

/**
 * Context Clue Component for MDX
 * 
 * Provides important background context and setup information for content.
 * Helps readers understand the broader context before diving into detailed content.
 * 
 * Features:
 * - Info icon to indicate contextual information
 * - Highlighted "Context:" prefix 
 * - Subtle styling to distinguish from main content
 * - Semantic color theming using design tokens
 * - Responsive padding and typography
 * - Accessible markup with proper roles
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Context content
 * @param {string} props.className - Additional CSS classes
 * 
 * @example
 * ```mdx
 * <ContextClue>
 *   As AI agents become more autonomous and capable of taking real-world actions, the security landscape is evolving rapidly.
 * </ContextClue>
 * ```
 * 
 * @example
 * ```mdx
 * <ContextClue>
 *   This analysis is based on data collected from over 1,000 production deployments across enterprise environments.
 * </ContextClue>
 * ```
 */

export interface ContextClueProps {
  children: React.ReactNode;
  className?: string;
}

export function ContextClue({ children, className = '' }: ContextClueProps) {
  // Use info alert colors but with lighter styling for context
  const baseColors = SEMANTIC_COLORS.alert.info;
  const colors = {
    ...baseColors,
    // Override container to be more subtle for context vs alerts
    container: "bg-primary/5 dark:bg-primary/10",
  };

  return (
    <div 
      className={`${BORDERS.card} ${colors.border} ${colors.container} p-4 sm:p-5 my-6 ${className}`}
      role="complementary"
      aria-label="Context information"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <Info className={`h-5 w-5 sm:h-6 sm:w-6 mt-0.5 shrink-0 ${colors.icon}`} aria-hidden="true" />
        <div className={`flex-1 text-sm sm:text-base leading-relaxed max-w-none ${colors.text}`}>
          <span className={`font-semibold ${colors.label}`}>Context:</span>{' '}
          <span className="[&>p]:m-0 [&>p]:inline [&>strong]:font-semibold [&>em]:italic">
            {children}
          </span>
        </div>
      </div>
    </div>
  );
}

ContextClue.displayName = "ContextClue";