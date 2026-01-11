"use client";

import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  SPACING,
  TYPOGRAPHY,
  SEMANTIC_COLORS,
  ANIMATION,
} from "@/lib/design-tokens";

/**
 * GlossaryTooltip - Interactive tooltip for technical terms
 *
 * Features:
 * - Hover/click activation
 * - Keyboard navigation (Tab, Escape)
 * - LocalStorage for visited state
 * - Theme-aware styling
 * - WCAG AA accessible
 *
 * @example
 * ```tsx
 * <GlossaryTooltip term="Prompt Injection" definition="A technique where attackers...">
 *   prompt injection
 * </GlossaryTooltip>
 * ```
 */

interface GlossaryTooltipProps {
  /** Technical term being defined */
  term: string;
  /** Definition/explanation of the term */
  definition: string;
  /** Text to display (defaults to term) */
  children?: React.ReactNode;
  /** Optional className for custom styling */
  className?: string;
}

const STORAGE_KEY = "dcyfr-glossary-visited";

export function GlossaryTooltip({
  term,
  definition,
  children,
  className,
}: GlossaryTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Load visited state from localStorage using lazy initialization
  const [isVisited, setIsVisited] = useState(() => {
    try {
      const visited = localStorage.getItem(STORAGE_KEY);
      if (visited) {
        const visitedTerms = JSON.parse(visited) as string[];
        return visitedTerms.includes(term);
      }
    } catch (error) {
      console.warn("Failed to load visited glossary terms:", error);
    }
    return false;
  });

  const [position, setPosition] = useState<"top" | "bottom">("bottom");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Calculate tooltip position based on viewport (using useLayoutEffect for synchronous layout reads)
  useLayoutEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // If not enough space below (300px for tooltip), show above
      const newPosition = spaceBelow < 300 && spaceAbove > 300 ? "top" : "bottom";
      // eslint-disable-next-line react-hooks/set-state-in-effect -- useLayoutEffect with setState is appropriate for layout measurements per React docs
      setPosition(newPosition);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        triggerRef.current &&
        tooltipRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    // Mark as visited when opening
    if (newIsOpen && !isVisited) {
      try {
        const visited = localStorage.getItem(STORAGE_KEY);
        const visitedTerms = visited ? (JSON.parse(visited) as string[]) : [];
        if (!visitedTerms.includes(term)) {
          visitedTerms.push(term);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(visitedTerms));
          setIsVisited(true);
        }
      } catch (error) {
        console.warn("Failed to save visited glossary term:", error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <span className={cn("relative inline-block", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-describedby={
          isOpen ? `tooltip-${term.replace(/\s+/g, "-")}` : undefined
        }
        className={cn(
          "inline-flex items-center gap-1",
          "text-primary dark:text-primary",
          "underline decoration-primary/40 decoration-dotted underline-offset-4",
          "hover:decoration-primary/70 hover:decoration-2",
          SEMANTIC_COLORS.interactive.focus,
          ANIMATION.transition.colors,
          "cursor-help"
        )}
      >
        {children || term}
        {/* Visual indicator for unvisited terms */}
        {!isVisited && (
          <span
            className={cn(
              "inline-block w-1.5 h-1.5 rounded-full",
              "bg-primary dark:bg-primary",
              "animate-pulse"
            )}
            aria-hidden="true"
          />
        )}
      </button>

      {/* Tooltip Content */}
      {isOpen && (
        <div
          ref={tooltipRef}
          id={`tooltip-${term.replace(/\s+/g, "-")}`}
          role="tooltip"
          className={cn(
            "absolute z-50 w-80 max-w-[calc(100vw-2rem)]",
            position === "top" ? "bottom-full mb-2" : "top-full mt-2",
            "left-1/2 -translate-x-1/2",
            "p-4 rounded-lg",
            "bg-popover dark:bg-popover",
            "border border-border dark:border-border",
            "shadow-lg dark:shadow-2xl",
            ANIMATION.transition.appearance,
            "animate-in fade-in-0 zoom-in-95 duration-200"
          )}
        >
          {/* Arrow */}
          <div
            className={cn(
              "absolute left-1/2 -translate-x-1/2 w-3 h-3",
              position === "top" ? "bottom-[-6px]" : "top-[-6px]",
              "rotate-45",
              "bg-popover dark:bg-popover",
              "border-r border-b border-border dark:border-border"
            )}
            aria-hidden="true"
          />

          {/* Content */}
          <div className="relative space-y-2">
            <h4
              className={cn(
                TYPOGRAPHY.h4.mdx,
                "text-popover-foreground dark:text-popover-foreground",
                "font-semibold"
              )}
            >
              {term}
            </h4>
            <p
              className={cn(
                TYPOGRAPHY.body.small,
                "text-popover-foreground/80 dark:text-popover-foreground/80",
                "leading-relaxed"
              )}
            >
              {definition}
            </p>
          </div>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className={cn(
              "absolute top-2 right-2",
              "w-6 h-6 rounded-md",
              "flex items-center justify-center",
              "text-popover-foreground/60 hover:text-popover-foreground",
              "hover:bg-popover-foreground/10",
              SEMANTIC_COLORS.interactive.focus,
              ANIMATION.transition.colors,
              "md:hidden"
            )}
            aria-label="Close tooltip"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </span>
  );
}
