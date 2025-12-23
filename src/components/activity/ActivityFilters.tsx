"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  type ActivitySource,
  ACTIVITY_SOURCE_COLORS,
  ACTIVITY_SOURCE_LABELS,
} from "@/lib/activity";
import {
  FileText,
  FolderKanban,
  GitCommit,
  Sparkles,
  Trophy,
  TrendingUp,
  Flame,
  Award,
  BarChart3,
  Activity,
  Search,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

type TimeRangeFilter = "today" | "week" | "month" | "year" | "all";

interface ActivityFiltersProps {
  /** Currently selected sources (empty = all) */
  selectedSources: ActivitySource[];

  /** Callback when sources change */
  onSourcesChange: (sources: ActivitySource[]) => void;

  /** Currently selected time range */
  selectedTimeRange: TimeRangeFilter;

  /** Callback when time range changes */
  onTimeRangeChange: (range: TimeRangeFilter) => void;

  /** Available sources to filter by */
  availableSources?: ActivitySource[];

  /** Total and filtered activity counts for results badge */
  totalCount?: number;
  filteredCount?: number;

  /** CSS class overrides */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SOURCE_ICONS: Record<ActivitySource, typeof FileText> = {
  blog: FileText,
  project: FolderKanban,
  github: GitCommit,
  changelog: Sparkles,
  milestone: Trophy,
  trending: TrendingUp,
  engagement: Flame,
  certification: Award,
  analytics: BarChart3,
  "github-traffic": Activity,
  seo: Search,
};

const TIME_RANGES: { value: TimeRangeFilter; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Time" },
];

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Filter bar for the activity feed
 *
 * Allows filtering by content source and time range.
 * Inspired by social media filter patterns.
 *
 * @example
 * ```tsx
 * const [sources, setSources] = useState<ActivitySource[]>([]);
 * const [timeRange, setTimeRange] = useState<TimeRangeFilter>("all");
 *
 * <ActivityFilters
 *   selectedSources={sources}
 *   onSourcesChange={setSources}
 *   selectedTimeRange={timeRange}
 *   onTimeRangeChange={setTimeRange}
 * />
 * ```
 */
export function ActivityFilters({
  selectedSources,
  onSourcesChange,
  selectedTimeRange,
  onTimeRangeChange,
  availableSources = ["blog", "project", "github", "changelog", "milestone", "trending", "engagement"],
  totalCount,
  filteredCount,
  className,
}: ActivityFiltersProps) {
  const toggleSource = (source: ActivitySource) => {
    if (selectedSources.includes(source)) {
      onSourcesChange(selectedSources.filter((s) => s !== source));
    } else {
      onSourcesChange([...selectedSources, source]);
    }
  };

  const clearAllFilters = () => {
    onSourcesChange([]);
    onTimeRangeChange("all");
  };

  const isAllSources = selectedSources.length === 0;
  const hasActiveFilters = !isAllSources || selectedTimeRange !== "all";
  const activeFilterCount = (isAllSources ? 0 : selectedSources.length) + (selectedTimeRange !== "all" ? 1 : 0);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Results count and clear filters */}
      <div className="flex items-center justify-between gap-4">
        {totalCount !== undefined && filteredCount !== undefined && (
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredCount}</span> of{" "}
            <span className="font-medium text-foreground">{totalCount}</span> activities
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"}
              </Badge>
            )}
          </p>
        )}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-muted-foreground hover:text-foreground transition-theme underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Source filters */}
      <div className="flex flex-wrap gap-2">
        {/* "All" toggle */}
        <Badge
          variant={isAllSources ? "default" : "outline"}
          className={cn(
            "cursor-pointer transition-base",
            isAllSources
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent"
          )}
          onClick={() => onSourcesChange([])}
        >
          All
        </Badge>

        {/* Source toggles */}
        {availableSources.map((source) => {
          const Icon = SOURCE_ICONS[source];
          const isSelected = selectedSources.includes(source);
          const colors = ACTIVITY_SOURCE_COLORS[source];

          return (
            <Badge
              key={source}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-theme gap-1",
                !isSelected && "hover:bg-accent text-muted-foreground"
              )}
              onClick={() => toggleSource(source)}
            >
              <Icon className="h-3 w-3" />
              {ACTIVITY_SOURCE_LABELS[source]}
            </Badge>
          );
        })}
      </div>

      {/* Time range filter */}
      <div className="flex flex-wrap gap-2">
        {TIME_RANGES.map(({ value, label }) => (
          <Badge
            key={value}
            variant={selectedTimeRange === value ? "secondary" : "outline"}
            className={cn(
              "cursor-pointer transition-theme",
              selectedTimeRange === value
                ? "bg-secondary"
                : "hover:bg-accent text-muted-foreground"
            )}
            onClick={() => onTimeRangeChange(value)}
          >
            {label}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export default ActivityFilters;
