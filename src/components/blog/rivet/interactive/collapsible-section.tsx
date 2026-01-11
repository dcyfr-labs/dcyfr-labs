"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  SPACING,
  SPACING_VALUES,
  TYPOGRAPHY,
  SEMANTIC_COLORS,
  ANIMATION,
} from "@/lib/design-tokens";

/**
 * CollapsibleSection - Expandable content with LocalStorage persistence
 *
 * Features:
 * - Expand/collapse animation
 * - LocalStorage state persistence
 * - Keyboard accessible (Enter, Space)
 * - Theme-aware styling
 * - WCAG AA compliant
 *
 * @example
 * ```tsx
 * <CollapsibleSection
 *   id="advanced-techniques"
 *   title="Advanced Techniques"
 *   defaultExpanded={false}
 * >
 *   <p>Your content here...</p>
 * </CollapsibleSection>
 * ```
 */

interface CollapsibleSectionProps {
  /** Unique ID for LocalStorage persistence */
  id: string;
  /** Section title/heading */
  title: string;
  /** Children content to show when expanded */
  children: React.ReactNode;
  /** Default expanded state (before LocalStorage check) */
  defaultExpanded?: boolean;
  /** Optional className for custom styling */
  className?: string;
}

const STORAGE_KEY = "dcyfr-collapsible-sections";

export function CollapsibleSection({
  id,
  title,
  children,
  defaultExpanded = false,
  className,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isMounted, setIsMounted] = useState(false);

  // Mark as mounted on initial render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load saved state from localStorage
  useEffect(() => {
    if (!isMounted) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const savedStates = JSON.parse(saved) as Record<string, boolean>;
        if (typeof savedStates[id] !== "undefined") {
          setIsExpanded(savedStates[id]);
        }
      }
    } catch (error) {
      console.warn("Failed to load collapsible section state:", error);
    }
    // Only run once after mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  // Save state to localStorage when changed
  useEffect(() => {
    if (!isMounted) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const savedStates = saved
        ? (JSON.parse(saved) as Record<string, boolean>)
        : {};
      savedStates[id] = isExpanded;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedStates));
    } catch (error) {
      console.warn("Failed to save collapsible section state:", error);
    }
  }, [isExpanded, id, isMounted]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <section
      className={cn(
        "rounded-lg border border-border",
        "bg-card shadow-sm hover:shadow-md",
        "overflow-hidden",
        ANIMATION.transition.base,
        `my-${SPACING_VALUES.md}`,
        className
      )}
    >
      {/* Header/Toggle Button */}
      <button
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isExpanded}
        aria-controls={`collapsible-content-${id}`}
        className={cn(
          "w-full flex items-center justify-between gap-4",
          "p-4 sm:p-5",
          "text-left",
          "bg-card",
          "hover:bg-muted/30",
          SEMANTIC_COLORS.interactive.focus,
          ANIMATION.transition.colors
        )}
      >
        <h3
          className={cn(
            TYPOGRAPHY.h3.standard,
            "text-card-foreground",
            "font-semibold"
          )}
        >
          {title}
        </h3>

        {/* Chevron Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0",
            "text-muted-foreground",
            ANIMATION.transition.movement,
            isExpanded && "rotate-180"
          )}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Content */}
      <div
        id={`collapsible-content-${id}`}
        role="region"
        aria-labelledby={`collapsible-header-${id}`}
        className={cn(
          "overflow-hidden",
          ANIMATION.transition.appearance,
          isExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div
          className={`p-4 sm:p-5 pt-0 ${SPACING.content} text-card-foreground`}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
