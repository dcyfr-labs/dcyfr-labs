"use client";

import * as React from "react";
import { Lightbulb } from "lucide-react";
import { Alert } from "./alert";

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
  return (
    <Alert type="info" icon={Lightbulb} role="note" className={className}>
      {children}
    </Alert>
  );
}

KeyTakeaway.displayName = "KeyTakeaway";
