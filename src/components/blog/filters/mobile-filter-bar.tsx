"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BlogFilters } from "./blog-filters";

interface MobileFilterBarProps {
  selectedCategory: string;
  selectedTags: string[];
  readingTime: string | null;
  categoryList: string[];
  categoryDisplayMap: Record<string, string>;
  tagList: string[];
  query: string;
  sortBy?: string;
  dateRange?: string;
  totalResults: number;
}

/**
 * MobileFilterBar Component
 * 
 * Compact, collapsible filter UI for mobile devices.
 * Shows active filter summary with expand/collapse toggle.
 * When expanded, reveals full BlogFilters component.
 * 
 * Features:
 * - Minimal footprint when collapsed (just summary bar)
 * - Shows active filter badges for quick removal
 * - Clear all button when filters are active
 * - Smooth expand/collapse animation
 */
export function MobileFilterBar({
  selectedCategory,
  selectedTags,
  readingTime,
  categoryList,
  categoryDisplayMap,
  tagList,
  query,
  sortBy = "newest",
  dateRange = "all",
  totalResults,
}: MobileFilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClearAll = () => {
    startTransition(() => {
      router.push("/blog", { scroll: false });
    });
  };

  // Calculate active filter count
  const activeFilters: Array<{ key: string; label: string; value: string }> = [];
  
  if (query) {
    activeFilters.push({ key: "q", label: `"${query}"`, value: query });
  }
  if (selectedCategory) {
    activeFilters.push({ 
      key: "category", 
      label: categoryDisplayMap[selectedCategory] || selectedCategory, 
      value: selectedCategory 
    });
  }
  selectedTags.forEach(tag => {
    activeFilters.push({ key: "tag", label: tag, value: tag });
  });
  if (readingTime) {
    const readingTimeLabels: Record<string, string> = {
      quick: "<5 min",
      medium: "5-15 min", 
      deep: ">15 min",
    };
    activeFilters.push({ 
      key: "readingTime", 
      label: readingTimeLabels[readingTime] || readingTime, 
      value: readingTime 
    });
  }
  if (sortBy && sortBy !== "newest") {
    const sortLabels: Record<string, string> = {
      popular: "Popular",
      oldest: "Oldest",
      archived: "Archived",
      drafts: "Drafts",
    };
    activeFilters.push({ 
      key: "sortBy", 
      label: sortLabels[sortBy] || sortBy, 
      value: sortBy 
    });
  }
  if (dateRange && dateRange !== "all") {
    const dateLabels: Record<string, string> = {
      "30d": "30 days",
      "90d": "90 days",
      year: "This year",
    };
    activeFilters.push({ 
      key: "dateRange", 
      label: dateLabels[dateRange] || dateRange, 
      value: dateRange 
    });
  }

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Collapsed summary bar */}
      <div className={cn("border-b", !isExpanded && "border-b-0")}>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "w-full flex items-center justify-between gap-3 p-3",
            "text-left hover:bg-muted/50 transition-colors"
          )}
          aria-expanded={isExpanded}
          aria-controls="mobile-filter-content"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm font-medium">
              {hasActiveFilters ? (
                <>Filters ({activeFilters.length})</>
              ) : (
                <>Filter & Search</>
              )}
            </span>
            <span className="text-xs text-muted-foreground">
              · {totalResults} post{totalResults !== 1 ? "s" : ""}
            </span>
          </div>
          
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        
        {hasActiveFilters && !isExpanded && (
          <div className="px-3 pb-3 flex justify-end">
            <button
              type="button"
              className={cn(
                "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-xs transition-all",
                "hover:bg-accent hover:text-accent-foreground active:bg-accent/80 dark:hover:bg-accent/60",
                "disabled:pointer-events-none disabled:opacity-50",
                "h-6 px-2"
              )}
              onClick={handleClearAll}
              disabled={isPending}
            >
              {isPending ? "..." : "Clear"}
            </button>
          </div>
        )}
      </div>
      {/* Active filter badges (collapsed view) */}
      {hasActiveFilters && !isExpanded && (
        <div className="px-3 pb-3 flex flex-wrap gap-1.5">
          {activeFilters.slice(0, 4).map((filter, index) => (
            <Badge
              key={`${filter.key}-${filter.value}-${index}`}
              variant="secondary"
              className="text-xs gap-1"
            >
              {filter.label}
            </Badge>
          ))}
          {activeFilters.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{activeFilters.length - 4} more
            </Badge>
          )}
        </div>
      )}

      {/* Expanded filter content */}
      <div
        id="mobile-filter-content"
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out",
          isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-4">
          <BlogFilters
            selectedCategory={selectedCategory}
            selectedTags={selectedTags}
            readingTime={readingTime}
            categoryList={categoryList}
            categoryDisplayMap={categoryDisplayMap}
            tagList={tagList}
            query={query}
            sortBy={sortBy}
            dateRange={dateRange}
          />
        </div>
      </div>
    </div>
  );
}
