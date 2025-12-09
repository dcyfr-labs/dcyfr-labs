"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ANIMATION, TYPOGRAPHY } from "@/lib/design-tokens";
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
  // Using a mobile bottom sheet instead of inline expand/collapse
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClearAll = () => {
    startTransition(() => {
      // Close sheet if open, then clear all filters by navigating back to base blog path
      setIsOpen(false);
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
      {/* Use Sheet as a mobile bottom sheet instead of inline expansion */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <div className={cn("border-b")}> 
          <SheetTrigger asChild>
            <button
              type="button"
              className={cn(
                "w-full flex items-center justify-between gap-3 p-3",
                "text-left hover:bg-muted/50 transition-colors"
              )}
              aria-label="Open filter sheet"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className={TYPOGRAPHY.label.small}>
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
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </button>
          </SheetTrigger>

          {hasActiveFilters && (
            <div className="px-3 pb-3 flex justify-end">
              <button
                type="button"
                className={cn(
                  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-xs transition-base",
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
        {hasActiveFilters && (
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

        <SheetContent side="bottom" className="max-h-[80vh] overflow-auto p-4">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle>Filters</SheetTitle>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    disabled={isPending}
                  >
                    {isPending ? "..." : "Clear"}
                  </Button>
                )}
                <SheetClose asChild>
                  <Button variant="ghost" size="sm" aria-label="Close filters">
                    Close
                  </Button>
                </SheetClose>
              </div>
            </div>
          </SheetHeader>

          <div className="pt-2">
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

          <SheetFooter>
            {/* Footer actions if needed in the future */}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
