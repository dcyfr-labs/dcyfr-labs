"use client";

import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY, SPACING, CONTAINER_WIDTHS, CONTAINER_PADDING } from "@/lib/design-tokens";
import { type ActivitySource } from "@/lib/activity";
import { Logo } from "@/components/common/logo";

// ============================================================================
// TYPES
// ============================================================================

interface ActivityFiltersProps {
  /** Currently selected sources (empty = all) */
  selectedSources: ActivitySource[];

  /** Callback when sources change */
  onSourcesChange: (sources: ActivitySource[]) => void;

  /** Currently selected time range */
  selectedTimeRange: "today" | "week" | "month" | "year" | "all";

  /** Callback when time range changes */
  onTimeRangeChange: (range: "today" | "week" | "month" | "year" | "all") => void;

  /** Current search query */
  searchQuery?: string;

  /** Callback when search query changes */
  onSearchChange?: (query: string) => void;

  /** Available sources to filter by */
  availableSources?: ActivitySource[];

  /** Total and filtered activity counts for results badge */
  totalCount?: number;
  filteredCount?: number;

  /** CSS class overrides */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Activity Search & Results
 *
 * Renders search bar with syntax hints and results counter.
 * Search is prominent and easy to access.
 */
export function ActivityFilters({
  searchQuery = "",
  onSearchChange,
  totalCount,
  filteredCount,
  className,
}: ActivityFiltersProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd/Ctrl + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  return (
    <div className={className}>
      {/* Search input - Prominent, centered */}
      {onSearchChange && (
        <div className={cn("relative pt-12 pb-8 md:pt-16 md:pb-10", CONTAINER_PADDING)}>
          <div className={cn("relative mx-auto", CONTAINER_WIDTHS.thread, SPACING.content)}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <Logo width={18} height={18} className="text-muted-foreground" />
            </div>
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search timeline..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={cn(
                "pl-11 pr-4 h-10 rounded-full border-border/50 focus:border-border bg-background/50 backdrop-blur-sm text-sm"
              )}
            />
          </div>

          {/* Search syntax hint */}
          <p className={cn(TYPOGRAPHY.metadata, "text-center mt-2 mx-auto text-xs", CONTAINER_WIDTHS.thread, SPACING.content)}>
            Try:{" "}
            <code className="px-1 py-0.5 rounded bg-muted/50 text-foreground/70 text-xs">tag:typescript</code>{" "}
            <code className="px-1 py-0.5 rounded bg-muted/50 text-foreground/70 text-xs">source:blog</code>{" "}
            <code className="px-1 py-0.5 rounded bg-muted/50 text-foreground/70 text-xs">-github</code>
          </p>
        </div>
      )}

      {/* Results count - Simplified */}
      {totalCount !== undefined && filteredCount !== undefined && (
        <div className="text-center py-4 px-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{filteredCount}</span>
            {" of "}
            <span className="font-medium text-foreground">{totalCount}</span>
            {" "}
            {totalCount === 1 ? "activity" : "activities"}
          </p>
        </div>
      )}
    </div>
  );
}

export default ActivityFilters;
