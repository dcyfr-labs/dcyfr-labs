"use client";

import {
  Clock,
  TrendingUp,
  Calendar,
  FolderOpen,
  Tags,
  ArrowUpDown,
} from "lucide-react";
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
} from "@/components/common";

interface BlogFiltersProps {
  selectedCategory: string;
  selectedTags: string[];
  readingTime: string | null;
  categoryList: string[];
  categoryDisplayMap: Record<string, string>;
  tagList: string[];
  query: string;
  sortBy?: string;
  dateRange?: string;
}

const READING_TIME_OPTIONS: FilterOption[] = [
  { value: "quick", label: "<5 min" },
  { value: "medium", label: "5-15 min" },
  { value: "deep", label: ">15 min" },
];

const SORT_OPTIONS: FilterOption[] = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popular" },
  { value: "oldest", label: "Oldest" },
  { value: "archived", label: "Archived" },
  ...(process.env.NODE_ENV === "development"
    ? [{ value: "drafts", label: "Drafts" }]
    : []),
];

const DATE_RANGE_OPTIONS: FilterOption[] = [
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "year", label: "This year" },
];

/**
 * BlogFilters Component
 *
 * Consolidated search and filter interface with:
 * - Search input with debounce
 * - Category filter (primary classification)
 * - Reading time dropdown
 * - Sort by dropdown (newest, popular, etc.)
 * - Date range filter
 * - Multi-select tag badges
 * - Clear all filters button
 *
 * @param selectedCategory - Currently selected category (lowercase)
 * @param selectedTags - Currently selected tags array
 * @param readingTime - Currently selected reading time filter (quick/medium/deep)
 * @param categoryList - Array of available categories (lowercase)
 * @param categoryDisplayMap - Map of lowercase category to display name
 * @param tagList - Array of available tags
 * @param query - Current search query
 * @param sortBy - Current sort option (newest/popular)
 * @param dateRange - Current date range filter (30d/90d/year/all)
 */
export function BlogFilters({
  selectedCategory,
  selectedTags,
  readingTime,
  categoryList,
  categoryDisplayMap,
  tagList,
  query,
  sortBy = "newest",
  dateRange = "all",
}: BlogFiltersProps) {
  const { updateParam, toggleMultiParam, clearAll } = useFilterParams({
    basePath: "/blog",
  });
  const { searchValue, setSearchValue } = useFilterSearch({
    query,
    basePath: "/blog",
  });

  const { hasActive, count } = useActiveFilters(
    {
      category: selectedCategory,
      tags: selectedTags,
      readingTime,
      query,
      sortBy,
      dateRange,
    },
    {
      sortBy: "newest",
      dateRange: "all",
    }
  );

  // Category uses single-select with lowercase URL values
  const setCategory = (category: string) =>
    updateParam("category", category, "");
  // Tags use lowercase for URL matching
  const toggleTag = (tag: string) =>
    toggleMultiParam("tag", tag.toLowerCase(), selectedTags);

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
              onClick={() =>
                updateParam(
                  paramName,
                  isSelected ? defaultValue : option.value,
                  defaultValue
                )
              }
            >
              {option.label}
              {isSelected && <X className="ml-1 h-3 w-3" />}
            </Badge>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search Input - Full Width */}
      <FilterSearchInput
        value={searchValue}
        onChange={setSearchValue}
        placeholder="Search posts..."
        aria-label="Search blog posts"
      />

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

        {renderFilterBadges(
          DATE_RANGE_OPTIONS,
          dateRange,
          "all",
          "dateRange",
          <Calendar className="h-4 w-4" />,
          "Date"
        )}

        {renderFilterBadges(
          READING_TIME_OPTIONS,
          readingTime || "all",
          "all",
          "readingTime",
          <Clock className="h-4 w-4" />,
          "Read"
        )}

        {/* Clear All Button */}
        <FilterClearButton
          onClear={clearAll}
          count={count}
          visible={hasActive}
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
