"use client";

import { Briefcase, FolderOpen, Tags, ArrowUpDown, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  useFilterParams,
  useFilterSearch,
  useActiveFilters,
  FilterSearchInput,
  FilterBadges,
  FilterClearButton,
  type FilterOption,
} from "@/components/common/filters";

export interface ProjectFiltersProps {
  selectedCategory: string;
  selectedTags: string[];
  selectedStatus: string;
  categoryList: string[];
  categoryDisplayMap: Record<string, string>;
  tagList: string[];
  statusList: string[];
  statusDisplayMap: Record<string, string>;
  query: string;
  sortBy?: string;
  totalResults?: number;
  hasActiveFilters?: boolean;
}

const SORT_OPTIONS: FilterOption[] = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popular" },
  { value: "oldest", label: "Oldest" },
  { value: "alpha", label: "A-Z" },
  { value: "archived", label: "Archived" },
];

/**
 * ProjectFilters Component
 *
 * Consolidated search and filter interface for projects with:
 * - Search input with debounce
 * - Status filter (active/in-progress/archived)
 * - Category filter (community/nonprofit/code/photography/startup)
 * - Sort by dropdown (newest, popular, etc.)
 * - Multi-select tag badges
 * - Clear all filters button
 *
 * @param selectedCategory - Currently selected category (lowercase)
 * @param selectedTags - Currently selected tags array
 * @param selectedStatus - Currently selected status filter
 * @param categoryList - Array of available categories (lowercase)
 * @param categoryDisplayMap - Map of lowercase category to display name
 * @param tagList - Array of available tags
 * @param statusList - Array of available statuses
 * @param statusDisplayMap - Map of status to display name
 * @param query - Current search query
 * @param sortBy - Current sort option (newest/popular/oldest/alpha/archived)
 * @param totalResults - Total number of filtered results (optional)
 * @param hasActiveFilters - Whether any filters are active (optional)
 */
export function ProjectFilters({
  selectedCategory,
  selectedTags,
  selectedStatus,
  categoryList,
  categoryDisplayMap,
  tagList,
  statusList,
  statusDisplayMap,
  query,
  sortBy = 'newest',
  totalResults,
  hasActiveFilters: hasActiveFiltersProp,
}: ProjectFiltersProps) {
  const { updateParam, toggleMultiParam, clearAll } = useFilterParams({ basePath: "/work" });
  const { searchValue, setSearchValue } = useFilterSearch({ query, basePath: "/work" });

  const { hasActive, count } = useActiveFilters({
    category: selectedCategory,
    tags: selectedTags,
    status: selectedStatus,
    query,
    sortBy,
  }, {
    sortBy: "newest",
  });

  // Use prop if provided, otherwise use computed value
  const hasActiveFilters = hasActiveFiltersProp !== undefined ? hasActiveFiltersProp : hasActive;

  // Category uses single-select with lowercase URL values
  const setCategory = (category: string) => updateParam("category", category, "");

  // Status uses single-select
  const setStatus = (status: string) => updateParam("status", status, "");

  // Tags use lowercase for URL matching
  const toggleTag = (tag: string) => toggleMultiParam("tag", tag.toLowerCase(), selectedTags);

  // Badge filter helper - click to toggle
  const renderFilterBadges = (
    options: FilterOption[],
    currentValue: string,
    defaultValue: string,
    paramName: string,
    icon: React.ReactNode,
    label: string
  ) => (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isSelected = currentValue === option.value;
          return (
            <Badge
              key={option.value}
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors select-none text-xs"
              onClick={() => updateParam(paramName, isSelected ? defaultValue : option.value, defaultValue)}
            >
              {option.label}
              {isSelected && <X className="ml-1 h-3 w-3" />}
            </Badge>
          );
        })}
      </div>
    </div>
  );

  // Convert status list to options
  const statusOptions: FilterOption[] = statusList.map(status => ({
    value: status,
    label: statusDisplayMap[status] || status,
  }));

  return (
    <div className="space-y-4">
      {/* Search Input - Full Width */}
      <div className="flex items-center gap-3">
        <FilterSearchInput
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Search projects..."
          aria-label="Search projects"
        />
        {totalResults !== undefined && (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {totalResults} {totalResults === 1 ? 'project' : 'projects'}
          </span>
        )}
      </div>

      {/* Filter Controls - Badge Style */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {renderFilterBadges(
          SORT_OPTIONS,
          sortBy,
          "newest",
          "sortBy",
          <ArrowUpDown className="h-4 w-4" />,
          "Sort"
        )}

        {statusOptions.length > 0 && renderFilterBadges(
          statusOptions,
          selectedStatus || "all",
          "all",
          "status",
          <Activity className="h-4 w-4" />,
          "Status"
        )}

        {/* Clear All Button */}
        <FilterClearButton
          onClear={clearAll}
          count={count}
          visible={hasActiveFilters}
        />
      </div>

      {/* Category Badges - Primary classification */}
      {categoryList.length > 0 && (
        <div className="space-y-2">
          <FilterBadges
            items={categoryList}
            selected={selectedCategory ? [selectedCategory] : []}
            onToggle={(cat) => setCategory(selectedCategory === cat ? "" : cat)}
            icon={FolderOpen}
            label="Categories"
            displayMap={categoryDisplayMap}
          />
        </div>
      )}

      {/* Tag Badges */}
      {tagList.length > 0 && (
        <div className="space-y-3">
          <FilterBadges
            items={tagList}
            selected={selectedTags}
            onToggle={toggleTag}
            icon={Tags}
            label="Tags"
            caseInsensitive
          />
        </div>
      )}
    </div>
  );
}
