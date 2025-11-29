"use client";

import { TrendingUp, Tags, Activity, FolderOpen } from "lucide-react";
import {
  useFilterParams,
  useFilterSearch,
  useActiveFilters,
  FilterSearchInput,
  FilterSelect,
  FilterBadges,
  FilterClearButton,
  type FilterOption,
} from "@/components/common/filters";

interface ProjectFiltersProps {
  selectedCategory: string;
  selectedTags: string[];
  status: string | null;
  categoryList: string[];
  categoryDisplayMap: Record<string, string>;
  tagList: string[];
  query: string;
  sortBy?: string;
  totalResults: number;
  hasActiveFilters: boolean;
}

const STATUS_OPTIONS: FilterOption[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "in-progress", label: "In Progress" },
  { value: "archived", label: "Archived" },
];

const SORT_OPTIONS: FilterOption[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "alpha", label: "Alphabetical" },
  { value: "status", label: "By status" },
];

/**
 * ProjectFilters Component
 *
 * Consolidated search and filter interface for projects with:
 * - Search input with debounce
 * - Category filter (primary classification)
 * - Tag multi-select (includes technologies)
 * - Status filter (active/in-progress/archived)
 * - Sort by dropdown (newest, oldest, A-Z)
 * - Clear all filters button
 *
 * @param selectedCategory - Currently selected category (lowercase)
 * @param selectedTags - Currently selected tags (lowercase for matching)
 * @param status - Currently selected status filter (active/in-progress/archived/all)
 * @param categoryList - Array of available categories (lowercase)
 * @param categoryDisplayMap - Map of lowercase category to display name
 * @param tagList - Array of available tags (proper casing)
 * @param query - Current search query
 * @param sortBy - Current sort option (newest/oldest/alpha)
 */
export function ProjectFilters({
  selectedCategory,
  selectedTags,
  status,
  categoryList,
  categoryDisplayMap,
  tagList,
  query,
  sortBy = 'newest',
  totalResults,
  hasActiveFilters,
}: ProjectFiltersProps) {
  const { updateParam, toggleMultiParam, clearAll } = useFilterParams({ basePath: "/portfolio" });
  const { searchValue, setSearchValue } = useFilterSearch({ query, basePath: "/portfolio" });

  const { hasActive, count } = useActiveFilters({
    category: selectedCategory,
    tags: selectedTags,
    status,
    query,
    sortBy,
  }, {
    sortBy: "newest",
  });

  // Category uses single-select with lowercase URL values
  const setCategory = (category: string) => updateParam("category", category, "");
  // Tags use lowercase for URL matching
  const toggleTag = (tag: string) => toggleMultiParam("tag", tag.toLowerCase(), selectedTags);

  return (
    <div className="space-y-6">
      {/* Search Input - Full Width */}
      <FilterSearchInput
        value={searchValue}
        onChange={setSearchValue}
        placeholder="Search projects..."
        aria-label="Search projects"
      />

      {/* Filter Controls - Separate Row */}
      {/* Status and Sort filters temporarily disabled
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex flex-wrap gap-3">
          <FilterSelect
            icon={Activity}
            value={status || "all"}
            onChange={(value) => updateParam("status", value, "all")}
            options={STATUS_OPTIONS}
            placeholder="Status"
            className="flex-1 min-w-[130px]"
          />

          <FilterSelect
            icon={TrendingUp}
            value={sortBy}
            onChange={(value) => updateParam("sortBy", value, "newest")}
            options={SORT_OPTIONS}
            placeholder="Sort by"
            className="flex-1 min-w-[130px]"
          />
        </div>
      </div>
      */}

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

      {/* Tag Badges - Secondary classification */}
      {tagList.length > 0 && (
        <div className="space-y-2">
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

      {/* Results count with Clear button */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-sm text-muted-foreground">
          {totalResults === 0 && hasActiveFilters ? (
            "No projects match your filters"
          ) : totalResults === 0 ? (
            "No projects found"
          ) : (
            <>
              Showing {totalResults} {totalResults === 1 ? "project" : "projects"}
              {hasActiveFilters && " (filtered)"}
            </>
          )}
        </p>
        <FilterClearButton
          onClear={clearAll}
          count={count}
          visible={hasActive}
        />
      </div>
    </div>
  );
}
