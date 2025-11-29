"use client";

import { useState } from "react";
import { Tags, FolderOpen, ArrowDownUp, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import {
  useFilterParams,
  useFilterSearch,
  useActiveFilters,
  FilterSearchInput,
  FilterBadges,
  FilterClearButton,
} from "@/components/common/filters";
import { Button } from "@/components/ui/button";

interface ProjectFiltersProps {
  selectedCategory: string;
  selectedTags: string[];
  categoryList: string[];
  categoryDisplayMap: Record<string, string>;
  tagList: string[];
  query: string;
  sortBy?: string;
  totalResults: number;
  hasActiveFilters: boolean;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "archived", label: "Archived" },
];

/**
 * ProjectFilters Component
 *
 * Consolidated search and filter interface for projects with:
 * - Search input with debounce
 * - Sort by badges (Newest, Oldest, Archived)
 * - Category badges (primary classification)
 * - Tag badges (secondary classification)
 * - Clear all filters button
 *
 * @param selectedCategory - Currently selected category (lowercase)
 * @param selectedTags - Currently selected tags (lowercase for matching)
 * @param categoryList - Array of available categories (lowercase)
 * @param categoryDisplayMap - Map of lowercase category to display name
 * @param tagList - Array of available tags (proper casing)
 * @param query - Current search query
 * @param sortBy - Current sort option (newest/oldest/archived)
 */
export function ProjectFilters({
  selectedCategory,
  selectedTags,
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
    query,
    sortBy,
  }, {
    sortBy: "newest",
  });

  // Category uses single-select with lowercase URL values
  const setCategory = (category: string) => updateParam("category", category, "");
  // Tags use lowercase for URL matching
  const toggleTag = (tag: string) => toggleMultiParam("tag", tag.toLowerCase(), selectedTags);
  // Sort uses single-select
  const setSort = (sort: string) => updateParam("sortBy", sort, "newest");

  // Collapsible state - default collapsed
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-6">
      {/* Search Input - Full Width */}
      <FilterSearchInput
        value={searchValue}
        onChange={setSearchValue}
        placeholder="Search projects..."
        aria-label="Search projects"
      />

      {/* Collapsible Filter Toggle */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
        <SlidersHorizontal className="h-4 w-4" />
        <span>Filters</span>
        {count > 0 && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {count}
          </span>
        )}
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
        </Button>
      </div>

      {/* Collapsible Filters Section */}
      {isExpanded && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Sort By Badges */}
          <FilterBadges
            items={SORT_OPTIONS.map(o => o.value)}
            selected={[sortBy]}
            onToggle={(sort) => setSort(sort === sortBy && sort !== "newest" ? "newest" : sort)}
            icon={ArrowDownUp}
            label="Sort by"
            displayMap={Object.fromEntries(SORT_OPTIONS.map(o => [o.value, o.label]))}
          />

          {/* Category Badges - Primary classification */}
          {categoryList.length > 0 && (
            <FilterBadges
              items={categoryList}
              selected={selectedCategory ? [selectedCategory] : []}
              onToggle={(cat) => setCategory(selectedCategory === cat ? "" : cat)}
              icon={FolderOpen}
              label="Categories"
              displayMap={categoryDisplayMap}
            />
          )}

          {/* Tag Badges - Secondary classification */}
          {tagList.length > 0 && (
            <FilterBadges
              items={tagList}
              selected={selectedTags}
              onToggle={toggleTag}
              icon={Tags}
              label="Tags"
              caseInsensitive
            />
          )}
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
