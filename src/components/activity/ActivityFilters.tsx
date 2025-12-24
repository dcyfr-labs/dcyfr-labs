"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SEMANTIC_COLORS, TYPOGRAPHY, SPACING, CONTAINER_WIDTHS } from "@/lib/design-tokens";
import {
  type ActivitySource,
  ACTIVITY_SOURCE_COLORS,
  ACTIVITY_SOURCE_LABELS,
} from "@/lib/activity";
import {
  type ActivityFilterPreset,
  type TimeRangeFilter,
  loadPresets,
  savePresets,
  createPreset,
  markPresetUsed,
} from "@/lib/activity/presets";
import {
  loadSearchHistory,
  saveSearchToHistory,
  clearSearchHistory,
  type SearchHistoryItem,
} from "@/lib/activity/search";
import { PresetManager } from "./PresetManager";
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
  Save,
  ChevronDown,
  Star,
  X,
  Clock,
  Command,
  SlidersHorizontal,
} from "lucide-react";
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
  selectedTimeRange: TimeRangeFilter;

  /** Callback when time range changes */
  onTimeRangeChange: (range: TimeRangeFilter) => void;

  /** Current search query */
  searchQuery?: string;

  /** Callback when search query changes */
  onSearchChange?: (query: string) => void;

  /** Available sources to filter by */
  availableSources?: ActivitySource[];

  /** Total and filtered activity counts for results badge */
  totalCount?: number;
  filteredCount?: number;

  /** Callback when a preset is applied */
  onPresetApply?: (presetId: string, filters: { sources: ActivitySource[]; timeRange: TimeRangeFilter }) => void;

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
  searchQuery = "",
  onSearchChange,
  availableSources = ["blog", "project", "github", "changelog", "milestone", "trending", "engagement"],
  totalCount,
  filteredCount,
  onPresetApply,
  className,
}: ActivityFiltersProps) {
  // Preset state
  const [presets, setPresets] = useState<ActivityFilterPreset[]>(() => loadPresets());
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");

  // Search state
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>(
    () => typeof window !== "undefined" ? loadSearchHistory() : []
  );
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Collapsed state - filters collapsed by default
  const [filtersExpanded, setFiltersExpanded] = useState(false);

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

  // Save presets when they change
  useEffect(() => {
    if (presets.length > 0) {
      savePresets(presets);
    }
  }, [presets]);

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
    if (onSearchChange) {
      onSearchChange("");
    }
  };

  const applyPreset = (preset: ActivityFilterPreset) => {
    if (onPresetApply) {
      // Use custom preset handler if provided
      onPresetApply(preset.id, preset.filters);
    } else {
      // Fallback to direct filter setting
      onSourcesChange(preset.filters.sources);
      onTimeRangeChange(preset.filters.timeRange);
    }
    setPresets(markPresetUsed(presets, preset.id));
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) return;

    const newPreset = createPreset(
      newPresetName,
      selectedSources,
      selectedTimeRange
    );
    setPresets([...presets, newPreset]);
    setSaveDialogOpen(false);
    setNewPresetName("");
  };

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim() && filteredCount !== undefined) {
      saveSearchToHistory(searchQuery, filteredCount);
      setSearchHistory(loadSearchHistory());
      setShowSearchHistory(false);
    }
  };

  const applySearchFromHistory = (query: string) => {
    if (onSearchChange) {
      onSearchChange(query);
    }
    setShowSearchHistory(false);
  };

  const handleClearSearchHistory = () => {
    clearSearchHistory();
    setSearchHistory([]);
  };

  const isAllSources = selectedSources.length === 0;
  const hasActiveFilters = !isAllSources || selectedTimeRange !== "all" || searchQuery.length > 0;
  const activeFilterCount = 
    (isAllSources ? 0 : selectedSources.length) + 
    (selectedTimeRange !== "all" ? 1 : 0) + 
    (searchQuery.length > 0 ? 1 : 0);

  return (
    <div className={cn(SPACING.content, className)}>
      {/* Search input with history - Prominent, centered on larger screens */}
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
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearchSubmit();
              }}
              onFocus={() => setShowSearchHistory(searchHistory.length > 0)}
              className={cn(
                "pl-12 pr-24 h-12 rounded-full border-border/50 focus:border-border bg-background/50 backdrop-blur-sm text-base"
              )}
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-16 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors rounded-full p-1 hover:bg-muted/50"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded-md border bg-muted px-2 font-mono text-[11px] font-medium text-muted-foreground">
              <Command className="h-3 w-3" />K
            </kbd>
          </div>

          {/* Search history dropdown */}
          {showSearchHistory && searchHistory.length > 0 && (
            <div className={cn("absolute z-50 mt-2 w-full left-1/2 -translate-x-1/2 rounded-xl border bg-popover/95 backdrop-blur-sm p-2 shadow-xl", CONTAINER_WIDTHS.thread, SPACING.content)}>
              <div className="flex items-center justify-between px-3 py-2">
                <span className={cn(TYPOGRAPHY.label.xs, "text-muted-foreground flex items-center gap-1.5")}>
                  <Clock className="h-3.5 w-3.5" />
                  Recent Searches
                </span>
                <button
                  onClick={handleClearSearchHistory}
                  className={cn(TYPOGRAPHY.label.xs, "text-muted-foreground hover:text-foreground transition-colors")}
                >
                  Clear
                </button>
              </div>
              {searchHistory.slice(0, 10).map((item, index) => (
                <button
                  key={index}
                  onClick={() => applySearchFromHistory(item.query)}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-accent/50 transition-colors flex items-center justify-between group"
                >
                  <span className="truncate">{item.query}</span>
                  <span className={cn(TYPOGRAPHY.metadata, "ml-3 opacity-60 group-hover:opacity-100")}>
                    {item.resultCount} {item.resultCount === 1 ? "result" : "results"}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Search syntax hint - Simplified */}
          <p className={cn(TYPOGRAPHY.metadata, "text-center mt-4 mx-auto", CONTAINER_WIDTHS.thread, SPACING.content)}>
            Try:{" "}
            <code className="px-1.5 py-0.5 rounded-md bg-muted/50 text-foreground/80">tag:typescript</code>{" "}
            <code className="px-1.5 py-0.5 rounded-md bg-muted/50 text-foreground/80">source:blog</code>{" "}
            <code className="px-1.5 py-0.5 rounded-md bg-muted/50 text-foreground/80">-github</code>{" "}
            <code className="px-1.5 py-0.5 rounded-md bg-muted/50 text-foreground/80">&quot;exact phrase&quot;</code>
          </p>
        </div>
      )}

      {/* Compact filter controls - Centered */}
      <div className={cn("flex items-center justify-between gap-4 flex-wrap mx-auto", CONTAINER_WIDTHS.standard)}>
        {/* Left: Results count */}
        {totalCount !== undefined && filteredCount !== undefined && (
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{filteredCount}</span>
              {" of "}
              <span className="font-medium text-foreground">{totalCount}</span>
              {" "}
              {totalCount === 1 ? "activity" : "activities"}
            </p>
            {hasActiveFilters && (
              <Badge variant="secondary" className="rounded-full">
                {activeFilterCount}
              </Badge>
            )}
          </div>
        )}

        {/* Right: Quick controls */}
        <div className="flex items-center gap-2">
          {/* Toggle filters button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className="gap-1.5 rounded-full h-8"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="text-sm">{filtersExpanded ? "Hide" : "Show"} Filters</span>
            <ChevronDown className={cn(
              "h-3.5 w-3.5 transition-transform",
              filtersExpanded && "rotate-180"
            )} />
          </Button>
          {/* Preset dropdown - Simplified */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 rounded-full h-8">
                <Star className="h-3.5 w-3.5" />
                <span className="text-sm">Presets</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs">Quick Filters</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {presets.filter((p) => p.isDefault).map((preset) => (
                <DropdownMenuItem
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className="gap-2"
                >
                  {/* eslint-disable-next-line no-restricted-syntax */}
                  <Star className="h-3.5 w-3.5 text-yellow-500" />
                  <span className="text-sm">{preset.name}</span>
                </DropdownMenuItem>
              ))}
              {presets.filter((p) => !p.isDefault).length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs">Your Presets</DropdownMenuLabel>
                  {presets.filter((p) => !p.isDefault).map((preset) => (
                    <DropdownMenuItem
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                    >
                      <span className="text-sm">{preset.name}</span>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Save current */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSaveDialogOpen(true)}
              className="gap-1.5 rounded-full h-8"
            >
              <Save className="h-3.5 w-3.5" />
              <span className="text-sm">Save</span>
            </Button>
          )}

          {/* Manage presets */}
          <PresetManager presets={presets} onPresetsChange={setPresets} />

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="gap-1.5 rounded-full h-8"
            >
              <X className="h-3.5 w-3.5" />
              <span className="text-sm">Clear</span>
            </Button>
          )}
        </div>
      </div>

      {/* Collapsible filter sections */}
      {filtersExpanded && (
        <>
          {/* Source filters - Pill style, centered, scrollable on mobile */}
          <div className="flex justify-center">
            <div className="flex flex-wrap gap-1.5 justify-center max-w-4xl">
              {/* "All" toggle */}
              <Badge
                variant={isAllSources ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors rounded-full px-3 py-1.5",
                  isAllSources
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "hover:bg-muted/70 border-border/50"
                )}
                onClick={() => onSourcesChange([])}
              >
                <span className="text-sm">All</span>
              </Badge>

              {/* Source toggles */}
              {availableSources.map((source) => {
                const Icon = SOURCE_ICONS[source];
                const isSelected = selectedSources.includes(source);

                return (
                  <Badge
                    key={source}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-colors rounded-full px-3 py-1.5 gap-1.5",
                      isSelected
                        ? "bg-foreground text-background hover:bg-foreground/90"
                        : "hover:bg-muted/70 border-border/50"
                    )}
                    onClick={() => toggleSource(source)}
                  >
                    <Icon className="h-3 w-3" />
                    <span className="text-sm">{ACTIVITY_SOURCE_LABELS[source]}</span>
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Time range filter - Pill style, centered */}
          <div className="flex justify-center">
            <div className="flex flex-wrap gap-1.5 justify-center">
              {TIME_RANGES.map(({ value, label }) => (
                <Badge
                  key={value}
                  variant={selectedTimeRange === value ? "secondary" : "outline"}
                  className={cn(
                    "cursor-pointer transition-colors rounded-full px-3 py-1.5",
                    selectedTimeRange === value
                      ? "bg-secondary hover:bg-secondary/90"
                      : "hover:bg-muted/70 border-border/50"
                  )}
                  onClick={() => onTimeRangeChange(value)}
                >
                  <span className="text-sm">{label}</span>
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Save preset dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
            <DialogDescription>
              Save your current filter configuration for quick access later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSavePreset();
                }}
                placeholder="e.g., My Favorite Posts"
                autoFocus
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Current filters:</p>
              <ul className="space-y-1 text-xs">
                <li>
                  • Sources:{" "}
                  {selectedSources.length === 0
                    ? "All"
                    : selectedSources.join(", ")}
                </li>
                <li>• Time range: {selectedTimeRange}</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSavePreset} disabled={!newPresetName.trim()}>
              Save Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ActivityFilters;
