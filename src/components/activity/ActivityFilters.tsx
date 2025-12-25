"use client";

import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY, SPACING, CONTAINER_WIDTHS } from "@/lib/design-tokens";
import { type ActivitySource } from "@/lib/activity";
import { Search } from "lucide-react";
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
 * Simplified Activity Filters - Search only
 *
 * Minimal search bar for the activity feed.
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
    <div className={cn(SPACING.content, className)}>
      {/* Search input - Prominent, centered */}
      {onSearchChange && (
        <div className="relative">
          <div className={cn("relative mx-auto", CONTAINER_WIDTHS.thread, SPACING.content)}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <Logo width={20} height={20} className="text-muted-foreground" />
            </div>
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search timeline..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={cn(
                "pl-12 pr-4 h-12 rounded-full border-border/50 focus:border-border bg-background/50 backdrop-blur-sm text-base"
              )}
            />
          </div>

          {/* Search syntax hint */}
          <p className={cn(TYPOGRAPHY.metadata, "text-center mt-4 mx-auto", CONTAINER_WIDTHS.thread, SPACING.content)}>
            Try:{" "}
            <code className="px-1.5 py-0.5 rounded-md bg-muted/50 text-foreground/80">tag:typescript</code>{" "}
            <code className="px-1.5 py-0.5 rounded-md bg-muted/50 text-foreground/80">source:blog</code>{" "}
            <code className="px-1.5 py-0.5 rounded-md bg-muted/50 text-foreground/80">-github</code>
          </p>
        </div>
      )}

      {/* Results count - Simplified */}
      {totalCount !== undefined && filteredCount !== undefined && (
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
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
