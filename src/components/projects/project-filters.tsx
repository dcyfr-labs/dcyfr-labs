"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPACING } from "@/lib/design-tokens";
import {
  useFilterParams,
  useFilterSearch,
  useActiveFilters,
  FilterSearchInput,
  FilterClearButton,
} from "@/components/common/filters";
import { Button } from "@/components/ui/button";
import {
  ProjectSort,
  ProjectStatusFilter,
  ProjectTechFilter,
  ProjectTagFilter,
} from "./filters";

interface ProjectFiltersProps {
  selectedTags: string[];
  selectedTech: string[];
  status: string | null;
  tagList: string[];
  techList: string[];
  query: string;
  sortBy?: string;
  totalResults: number;
  hasActiveFilters: boolean;
}

/**
 * ProjectFilters Component
 *
 * Consolidated search and filter interface for projects with:
 * - Search input with debounce
 * - Sort by badges (Newest, Oldest, A-Z, Status)
 * - Status filter badges (Active, In Progress, Archived)
 * - Tech stack badges
 * - Tag badges
 * - Clear all filters button
 *
 * Modularized into separate components:
 * - ProjectSort: Sort by badges
 * - ProjectStatusFilter: Status filter badges
 * - ProjectTechFilter: Tech stack filter badges
 * - ProjectTagFilter: Tag filter badges
 */
export function ProjectFilters({
  selectedTags,
  selectedTech,
  status,
  tagList,
  techList,
  query,
  sortBy = 'newest',
  totalResults,
  hasActiveFilters,
}: ProjectFiltersProps) {
  const { updateParam, toggleMultiParam, clearAll } = useFilterParams({ basePath: "/projects" });
  const { searchValue, setSearchValue } = useFilterSearch({ query, basePath: "/projects" });

  const { hasActive, count } = useActiveFilters({
    status,
    tags: selectedTags,
    tech: selectedTech,
    query,
    sortBy,
  }, {
    sortBy: "newest",
    status: "",
  });

  // Status uses single-select
  const setStatus = (s: string) => updateParam("status", s, "");
  // Tags use lowercase for URL matching
  const toggleTag = (tag: string) => toggleMultiParam("tag", tag.toLowerCase(), selectedTags);
  // Tech uses multi-select
  const toggleTech = (tech: string) => toggleMultiParam("tech", tech, selectedTech);
  // Sort uses single-select
  const setSort = (sort: string) => updateParam("sortBy", sort, "newest");

  // Collapsible state - default collapsed
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={SPACING.subsection}>
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
        <div className={cn(SPACING.subsection, "animate-in fade-in slide-in-from-top-2 duration-200")}>
          <ProjectSort sortBy={sortBy} onSortChange={setSort} />
          <ProjectStatusFilter status={status} onStatusChange={setStatus} />
          <ProjectTechFilter
            techList={techList}
            selectedTech={selectedTech}
            onTechToggle={toggleTech}
          />
          <ProjectTagFilter
            tagList={tagList}
            selectedTags={selectedTags}
            onTagToggle={toggleTag}
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
