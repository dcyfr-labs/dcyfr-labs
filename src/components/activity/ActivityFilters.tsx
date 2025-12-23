"use client";

import { useState, useEffect } from "react";
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
import { SEMANTIC_COLORS } from "@/lib/design-tokens";
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
} from "lucide-react";

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
  // Preset state
  const [presets, setPresets] = useState<ActivityFilterPreset[]>(() => loadPresets());
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");

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
  };

  const applyPreset = (preset: ActivityFilterPreset) => {
    onSourcesChange(preset.filters.sources);
    onTimeRangeChange(preset.filters.timeRange);
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

  const isAllSources = selectedSources.length === 0;
  const hasActiveFilters = !isAllSources || selectedTimeRange !== "all";
  const activeFilterCount = (isAllSources ? 0 : selectedSources.length) + (selectedTimeRange !== "all" ? 1 : 0);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Preset controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Preset dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Star className="h-4 w-4" />
              Presets
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Quick Apply</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {presets.filter((p) => p.isDefault).map((preset) => (
              <DropdownMenuItem
                key={preset.id}
                onClick={() => applyPreset(preset)}
              >
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                {preset.name}
              </DropdownMenuItem>
            ))}
            {presets.filter((p) => !p.isDefault).length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Your Presets</DropdownMenuLabel>
                {presets.filter((p) => !p.isDefault).map((preset) => (
                  <DropdownMenuItem
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                  >
                    {preset.name}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Save current filters */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSaveDialogOpen(true)}
          disabled={!hasActiveFilters}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Save Current
        </Button>

        {/* Manage presets */}
        <PresetManager presets={presets} onPresetsChange={setPresets} />
      </div>

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
