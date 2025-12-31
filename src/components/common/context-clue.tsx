"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { Alert } from "./alert";

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

export function ContextClue({ children, className = "" }: ContextClueProps) {
  return (
    <Alert
      type="info"
      icon={Info}
      role="complementary"
      containerOverride="bg-primary/5 dark:bg-primary/10"
      className={className}
    >
      {children}
    </Alert>
  );
}

ContextClue.displayName = "ContextClue";
