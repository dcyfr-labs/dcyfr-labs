"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { SPACING } from "@/lib/design-tokens";
import { useBlogKeyboard } from "@/components/blog/blog-keyboard-provider";
import { SidebarSearch } from "./sidebar-search";
import { SidebarFilters } from "./sidebar-filters";
import { SidebarCategories } from "./sidebar-categories";
import { SidebarTopics } from "./sidebar-topics";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BlogSidebarProps {
  selectedCategory: string;
  selectedTags: string[];
  readingTime: string;
  categoryList: string[];
  categoryDisplayMap: Record<string, string>;
  tagList: Array<{ tag: string; count: number }>;
  query: string;
  sortBy: string;
  dateRange: string;
  totalResults: number;
  totalPosts: number;
}

/**
 * Blog Sidebar Component
 * 
 * Sticky sidebar for blog filtering and navigation on desktop screens.
 * Provides search, view toggle, sorting, filtering, category and tag selection.
 * Collapses to top section on mobile/tablet.
 * 
 * Modularized into separate components:
 * - SidebarSearch: Search input with results count
 * - SidebarFilters: Sort, date range, reading time filters
 * - SidebarCategories: Category filter badges
 * - SidebarTopics: Tag filter badges with counts
 */
export function BlogSidebar({
  selectedCategory,
  selectedTags,
  readingTime,
  categoryList,
  categoryDisplayMap,
  tagList,
  query,
  sortBy,
  dateRange,
  totalResults,
  totalPosts,
}: BlogSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(query);
  const { searchInputRef } = useBlogKeyboard();
  const [expandedSections, setExpandedSections] = useState({
    filters: true,
    categories: true,
    topics: true,
  });

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (!value || value === "" || value === "all" || value === "newest") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    // Reset to page 1 when filters change
    if (key !== "page") {
      params.delete("page");
    }
    
    startTransition(() => {
      router.push(`/blog?${params.toString()}`, { scroll: false });
    });
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== query) {
        updateParam("q", searchValue);
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, query]);

  const toggleTag = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const lowerTag = tag.toLowerCase();
    const currentTags = selectedTags;
    const newTags = currentTags.includes(lowerTag)
      ? currentTags.filter(t => t !== lowerTag)
      : [...currentTags, lowerTag];
    
    if (newTags.length === 0) {
      params.delete("tag");
    } else {
      params.set("tag", newTags.join(","));
    }
    
    params.delete("page");
    
    startTransition(() => {
      router.push(`/blog?${params.toString()}`, { scroll: false });
    });
  };

  const setCategory = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (!category || category === selectedCategory) {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    
    params.delete("page");
    
    startTransition(() => {
      router.push(`/blog?${params.toString()}`, { scroll: false });
    });
  };

  const clearAllFilters = () => {
    startTransition(() => {
      router.push("/blog", { scroll: false });
    });
    setSearchValue("");
  };

  const activeFilterCount = [
    query,
    selectedCategory && "category",
    selectedTags.length > 0 && "tags",
    readingTime && "readingTime",
    sortBy !== "newest" && "sort",
    dateRange !== "all" && "date",
  ].filter(Boolean).length;

  const toggleSection = (section: "filters" | "categories" | "topics") => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <aside className={cn(SPACING.subsection, "flex flex-col")}>
      <SidebarSearch
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchInputRef={searchInputRef}
            totalResults={totalResults}
            totalPosts={totalPosts}
            activeFilterCount={activeFilterCount}
            onClearAll={clearAllFilters}
            isPending={isPending}
          />

          <SidebarFilters
            sortBy={sortBy}
            dateRange={dateRange}
            readingTime={readingTime}
            isExpanded={expandedSections.filters}
            onToggle={() => toggleSection("filters")}
            onSortChange={(value) => updateParam("sortBy", value)}
            onDateRangeChange={(value) => updateParam("dateRange", value)}
            onReadingTimeChange={(value) => updateParam("readingTime", value)}
          />

          <SidebarCategories
            categoryList={categoryList}
            categoryDisplayMap={categoryDisplayMap}
            selectedCategory={selectedCategory}
            isExpanded={expandedSections.categories}
            onToggle={() => toggleSection("categories")}
            onCategorySelect={setCategory}
          />

      <SidebarTopics
        tagList={tagList}
        selectedTags={selectedTags}
        isExpanded={expandedSections.topics}
        onToggle={() => toggleSection("topics")}
        onTagToggle={toggleTag}
      />
    </aside>
  );
}
