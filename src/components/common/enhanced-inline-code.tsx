"use client";

import React from "react";
import { SHADOWS, ANIMATION } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface EnhancedInlineCodeProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  variant?: "default" | "accent" | "muted";
}

/**
 * Enhanced inline code component that matches the new code block styling.
 * Features:
 * - Subtle border and shadow matching the design system
 * - Enhanced typography for better readability
 * - Multiple variants for different contexts
 * - Proper contrast and accessibility
 */
export function EnhancedInlineCode({
  children,
  variant = "default",
  className,
  ...props
}: EnhancedInlineCodeProps) {
  const variantStyles = {
    default: [
      "bg-primary/10 text-primary border-primary/20",
      "hover:bg-primary/15 hover:border-primary/30",
    ],
    accent: [
      "bg-accent/20 text-accent-foreground border-accent/30",
      "hover:bg-accent/30 hover:border-accent/40",
    ],
    muted: [
      "bg-muted text-muted-foreground border-border",
      "hover:bg-muted/80 hover:border-border-hover",
    ],
  };

  return (
    <code
      {...props}
      className={cn(
        // Base styles
        "inline-flex items-center",
        "px-2 py-0.5",
        "text-[0.875em] font-mono font-semibold",
        "rounded-md border",

        // Enhanced styling to match code blocks
        SHADOWS.tier3.combined,
        ANIMATION.transition.theme,

        // Variant-specific styles
        variantStyles[variant],

        // Hover enhancement
        "transition-all duration-200",

        className
      )}
    >
      {children}
    </code>
  );
}

/**
 * Helper function to detect if inline code represents a specific type
 */
export function getInlineCodeVariant(
  content: string
): EnhancedInlineCodeProps["variant"] {
  const text = content.toString().toLowerCase();

  // File paths and commands
  if (
    text.includes("/") ||
    text.includes(".") ||
    text.startsWith("npm") ||
    text.startsWith("git")
  ) {
    return "muted";
  }

  // CSS classes or properties
  if (
    text.includes("class") ||
    text.includes("css") ||
    text.includes("-") ||
    text.includes(":")
  ) {
    return "accent";
  }

  return "default";
}
