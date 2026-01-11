"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpDown, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ANIMATION } from "@/lib/design-tokens";
import { useFilterParams } from "@/components/common";
import { useMobileFilterSheet } from "@/hooks/use-mobile-filter-sheet";

interface HorizontalFilterChipsProps {
  selectedCategory: string;
  sortBy: string;
  categoryList: string[];
  categoryDisplayMap: Record<string, string>;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popular" },
  { value: "oldest", label: "Oldest" },
] as const;

/**
 * HorizontalFilterChips Component
 * 
 * Single row of horizontally scrolling filter badges for mobile.
 * Provides quick access to common filters with sticky positioning.
 * 
 * Features:
 * - Horizontal scroll with momentum
 * - Selected state styling
 * - Sticky to top with shadow on scroll
 * - "More" button to open full filter sheet
 * - Optimized for touch interactions
 */
export function HorizontalFilterChips({
  selectedCategory,
  sortBy,
  categoryList,
  categoryDisplayMap,
}: HorizontalFilterChipsProps) {
  const { updateParam } = useFilterParams({ basePath: "/blog" });
  const { setIsOpen } = useMobileFilterSheet();
  const [isSticky, setIsSticky] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll position for sticky shadow effect
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 64); // 64px = header height
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCategoryClick = (category: string) => {
    updateParam("category", selectedCategory === category ? "" : category, "");
  };

  const handleSortClick = (sort: string) => {
    updateParam("sortBy", sort === "newest" ? "" : sort, "newest");
  };

  const handleMoreClick = () => {
    setIsOpen(true);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "sticky top-16 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        `border-b ${ANIMATION.transition.theme}`,
        isSticky && "shadow-sm"
      )}
    >
      <div className="overflow-x-auto overflow-y-hidden scrollbar-hide px-4 sm:px-8 md:px-8">
        <div className={cn("flex items-center gap-2 py-3 w-max")}>
          {/* Sort Chips */}
          <div className="flex items-center gap-1.5 pr-2 border-r">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            {SORT_OPTIONS.map((option) => {
              const isSelected = sortBy === option.value || (!sortBy && option.value === "newest");
              return (
                <Badge
                  key={option.value}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    `cursor-pointer ${ANIMATION.transition.theme} select-none text-xs whitespace-nowrap`,
                    isSelected
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => handleSortClick(option.value)}
                >
                  {option.label}
                </Badge>
              );
            })}
          </div>

          {/* Category Chips */}
          {categoryList.length > 0 && (
            <div className="flex items-center gap-1.5">
              {categoryList.slice(0, 6).map((category) => {
                const isSelected = selectedCategory === category;
                const displayName = categoryDisplayMap[category] || category;
                return (
                  <Badge
                    key={category}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      `cursor-pointer ${ANIMATION.transition.theme} select-none text-xs whitespace-nowrap`,
                      isSelected
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {displayName}
                  </Badge>
                );
              })}
            </div>
          )}

          {/* More Filters Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleMoreClick}
            className="ml-2 h-6 px-2 text-xs whitespace-nowrap shrink-0"
          >
            <SlidersHorizontal className="h-3 w-3 mr-1" />
            More
          </Button>
        </div>
      </div>
    </div>
  );
}
