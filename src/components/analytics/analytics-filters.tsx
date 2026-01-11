/**
 * Analytics Filters Component
 *
 * Consolidated analytics settings and filters including:
 * - Date range selection
 * - Publication cohorts
 * - Performance tier filtering
 * - Tag selection with AND/OR logic
 * - Search functionality
 * - Draft/Archived toggles
 * - Export options
 * - Refresh controls
 * - Filter presets
 */

"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Filter,
  X,
  Calendar,
  TrendingUp,
  Tag as TagIcon,
  Bookmark,
  ChevronDown,
  Sparkles,
  Download,
  RefreshCw,
  Search,
  FileText,
  Archive as ArchiveIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY } from "@/lib/design-tokens";
import {
  PublicationCohort,
  PUBLICATION_COHORT_LABELS,
  PerformanceTierFilter,
  PERFORMANCE_TIER_LABELS,
  TagFilterMode,
  FilterPreset,
  DEFAULT_FILTER_PRESETS,
  DateRange,
  DATE_RANGE_LABELS,
} from "@/types/analytics";

interface AnalyticsFiltersProps {
  /** Date range for analytics */
  dateRange: DateRange;
  /** Callback when date range changes */
  onDateRangeChange: (range: DateRange) => void;

  /** Selected publication cohort */
  publicationCohort: PublicationCohort;
  /** Callback when publication cohort changes */
  onPublicationCohortChange: (cohort: PublicationCohort) => void;

  /** Selected performance tier */
  performanceTier: PerformanceTierFilter;
  /** Callback when performance tier changes */
  onPerformanceTierChange: (tier: PerformanceTierFilter) => void;

  /** Tag filter mode (AND/OR) */
  tagFilterMode: TagFilterMode;
  /** Callback when tag filter mode changes */
  onTagFilterModeChange: (mode: TagFilterMode) => void;

  /** Selected tags */
  selectedTags: string[];
  /** Callback when tags change */
  onTagsChange: (tags: string[]) => void;

  /** Available tags */
  availableTags: string[];

  /** Search query */
  searchQuery: string;
  /** Callback when search query changes */
  onSearchQueryChange: (query: string) => void;

  /** Hide drafts flag */
  hideDrafts: boolean;
  /** Callback when hide drafts changes */
  onHideDraftsChange: (hide: boolean) => void;

  /** Hide archived flag */
  hideArchived: boolean;
  /** Callback when hide archived changes */
  onHideArchivedChange: (hide: boolean) => void;

  /** Export CSV callback */
  onExportCSV?: () => void;

  /** Export JSON callback */
  onExportJSON?: () => void;

  /** Refresh callback */
  onRefresh?: () => void;

  /** Is refreshing flag */
  isRefreshing?: boolean;

  /** Auto-refresh enabled */
  autoRefresh: boolean;
  /** Callback when auto-refresh changes */
  onAutoRefreshChange: (enabled: boolean) => void;

  /** Last updated timestamp */
  lastUpdated?: Date;

  /** Show compact view (for toolbar) */
  compact?: boolean;

  /** Callback when preset is applied */
  onPresetApply?: (preset: FilterPreset) => void;

  /** Callback to clear all filters */
  onClearAll?: () => void;

  /** Result count info */
  resultCount?: { shown: number; total: number };
}

export function AnalyticsFilters({
  dateRange,
  onDateRangeChange,
  publicationCohort,
  onPublicationCohortChange,
  performanceTier,
  onPerformanceTierChange,
  tagFilterMode,
  onTagFilterModeChange,
  selectedTags,
  onTagsChange,
  availableTags,
  searchQuery,
  onSearchQueryChange,
  hideDrafts,
  onHideDraftsChange,
  hideArchived,
  onHideArchivedChange,
  onExportCSV,
  onExportJSON,
  onRefresh,
  isRefreshing = false,
  autoRefresh,
  onAutoRefreshChange,
  lastUpdated,
  compact = false,
  onPresetApply,
  onClearAll,
  resultCount,
}: AnalyticsFiltersProps) {
  const hasActiveFilters =
    publicationCohort !== "all" ||
    performanceTier !== "all" ||
    selectedTags.length > 0 ||
    searchQuery.trim() !== "" ||
    hideDrafts ||
    hideArchived;

  const activeFilterCount =
    (publicationCohort !== "all" ? 1 : 0) +
    (performanceTier !== "all" ? 1 : 0) +
    (selectedTags.length > 0 ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0) +
    (hideDrafts ? 1 : 0) +
    (hideArchived ? 1 : 0);

  const handlePresetClick = (preset: FilterPreset) => {
    if (preset.filters.publicationCohort) {
      onPublicationCohortChange(preset.filters.publicationCohort);
    }
    if (preset.filters.performanceTier) {
      onPerformanceTierChange(preset.filters.performanceTier);
    }
    if (preset.filters.tags) {
      onTagsChange(preset.filters.tags);
    }
    if (preset.filters.tagMode) {
      onTagFilterModeChange(preset.filters.tagMode);
    }

    onPresetApply?.(preset);
  };

  const handleClearAll = () => {
    onPublicationCohortChange("all");
    onPerformanceTierChange("all");
    onTagsChange([]);
    onClearAll?.();
  };

  if (compact) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Row 1: Main controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Presets */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Presets
                    <ChevronDown className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuLabel>Filter Presets</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {DEFAULT_FILTER_PRESETS.map((preset) => (
                    <DropdownMenuItem
                      key={preset.id}
                      onClick={() => handlePresetClick(preset)}
                    >
                      <div className="space-y-0.5">
                        <div className="font-medium text-sm">{preset.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {preset.description}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Date Range */}
              <Select
                value={dateRange}
                onValueChange={(value) => onDateRangeChange(value as DateRange)}
              >
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(DATE_RANGE_LABELS) as [DateRange, string][]
                  ).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="text-xs">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Performance Tier */}
              <Select
                value={performanceTier}
                onValueChange={(value) =>
                  onPerformanceTierChange(value as PerformanceTierFilter)
                }
              >
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(PERFORMANCE_TIER_LABELS) as [
                      PerformanceTierFilter,
                      string,
                    ][]
                  ).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="text-xs">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Tags */}
              {availableTags.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <TagIcon className="h-3.5 w-3.5 mr-1.5" />
                      Tags{" "}
                      {selectedTags.length > 0 && `(${selectedTags.length})`}
                      <ChevronDown className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-56 max-h-[300px] overflow-y-auto"
                  >
                    <DropdownMenuLabel className="text-xs">
                      Filter by tags
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {availableTags.map((tag) => (
                      <DropdownMenuCheckboxItem
                        key={tag}
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={(checked) => {
                          onTagsChange(
                            checked
                              ? [...selectedTags, tag]
                              : selectedTags.filter((t) => t !== tag)
                          );
                        }}
                        className="text-xs"
                      >
                        {tag}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Tag Mode */}
              {selectedTags.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() =>
                    onTagFilterModeChange(
                      tagFilterMode === "AND" ? "OR" : "AND"
                    )
                  }
                >
                  <TagIcon className="h-3.5 w-3.5 mr-1.5" />
                  {tagFilterMode}
                </Button>
              )}

              <div className="h-4 w-px bg-border" />

              {/* Export */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Export
                    <ChevronDown className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel className="text-xs">
                    Export format
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onExportCSV}
                    className="text-xs cursor-pointer"
                  >
                    <Download className="h-3 w-3 mr-2" />
                    Download CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onExportJSON}
                    className="text-xs cursor-pointer"
                  >
                    <Download className="h-3 w-3 mr-2" />
                    Download JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Refresh */}
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs rounded border border-border hover:bg-muted transition-theme disabled:opacity-50 h-8"
                title="Refresh data"
              >
                <RefreshCw
                  className={cn("h-3 w-3", isRefreshing && "animate-spin")}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {/* Auto-refresh */}
              <label
                className="inline-flex items-center text-xs gap-1.5 cursor-pointer"
                title="Auto-refresh every 30 seconds"
              >
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => onAutoRefreshChange(e.target.checked)}
                  className="h-3 w-3 rounded border-muted bg-background cursor-pointer"
                />
                <span className="font-medium">Auto (30s)</span>
              </label>

              {lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>

            {/* Row 2: Search and visibility toggles */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  className="h-8 text-xs pl-8"
                />
              </div>

              {/* Post Selection Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Filter className="h-3.5 w-3.5 mr-1.5" />
                    {!hideDrafts && !hideArchived
                      ? "All Posts"
                      : hideDrafts && hideArchived
                        ? "Published Only"
                        : hideDrafts
                          ? "Hide Drafts"
                          : "Hide Archived"}
                    <ChevronDown className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel className="text-xs">
                    Post Selection
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={hideDrafts}
                    onCheckedChange={onHideDraftsChange}
                    className="text-xs"
                  >
                    <FileText className="h-3 w-3 mr-2" />
                    Hide Drafts
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={hideArchived}
                    onCheckedChange={onHideArchivedChange}
                    className="text-xs"
                  >
                    <ArchiveIcon className="h-3 w-3 mr-2" />
                    Hide Archived
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Active Filter Indicator */}
              {hasActiveFilters && (
                <>
                  <Badge variant="secondary" className="h-8 px-2">
                    <Filter className="h-3 w-3 mr-1" />
                    {activeFilterCount} active
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="h-8 text-xs"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Clear All
                  </Button>
                </>
              )}
            </div>

            {/* Row 3: Result count */}
            {resultCount && (
              <div className="text-xs text-muted-foreground">
                Showing {resultCount.shown} of {resultCount.total} posts
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full card view (not compact)
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Advanced Filters</CardTitle>
            <CardDescription className="text-xs">
              Filter posts by publication date, performance, and tags
            </CardDescription>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              <X className="h-4 w-4 mr-1.5" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Presets */}
        <div className="space-y-2">
          <label className={TYPOGRAPHY.label.xs}>Quick Filters</label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_FILTER_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                size="sm"
                onClick={() => handlePresetClick(preset)}
                className="text-xs"
              >
                <Bookmark className="h-3 w-3 mr-1.5" />
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Publication Cohort */}
          <div className="space-y-2">
            <label className={TYPOGRAPHY.label.xs}>Publication Date</label>
            <Select
              value={publicationCohort}
              onValueChange={(value) =>
                onPublicationCohortChange(value as PublicationCohort)
              }
            >
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PUBLICATION_COHORT_LABELS).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value} className="text-xs">
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Performance Tier */}
          <div className="space-y-2">
            <label className={TYPOGRAPHY.label.xs}>Performance Tier</label>
            <Select
              value={performanceTier}
              onValueChange={(value) =>
                onPerformanceTierChange(value as PerformanceTierFilter)
              }
            >
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PERFORMANCE_TIER_LABELS).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value} className="text-xs">
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tag Filter Mode */}
        {selectedTags.length > 1 && (
          <div className="space-y-2">
            <label className={TYPOGRAPHY.label.xs}>Tag Match Mode</label>
            <div className="flex gap-2">
              <Button
                variant={tagFilterMode === "AND" ? "default" : "outline"}
                size="sm"
                onClick={() => onTagFilterModeChange("AND")}
                className="text-xs flex-1"
              >
                AND (All tags)
              </Button>
              <Button
                variant={tagFilterMode === "OR" ? "default" : "outline"}
                size="sm"
                onClick={() => onTagFilterModeChange("OR")}
                className="text-xs flex-1"
              >
                OR (Any tag)
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {tagFilterMode === "AND"
                ? "Posts must have ALL selected tags"
                : "Posts must have AT LEAST ONE selected tag"}
            </p>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-2 border-t">
            {}
            <p className="text-xs font-medium mb-2">Active Filters:</p>
            <div className="flex flex-wrap gap-2">
              {publicationCohort !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {PUBLICATION_COHORT_LABELS[publicationCohort]}
                </Badge>
              )}
              {performanceTier !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {PERFORMANCE_TIER_LABELS[performanceTier]}
                </Badge>
              )}
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <TagIcon className="h-3 w-3 mr-1" />
                  {selectedTags.length} tag{selectedTags.length > 1 ? "s" : ""}{" "}
                  ({tagFilterMode})
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
