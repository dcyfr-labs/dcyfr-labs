"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { SPACING } from "@/lib/design-tokens";
import { useBlogKeyboard } from '@/components/blog';
import { SidebarFilters } from "./sidebar-filters";
import { SidebarCategories } from "./sidebar-categories";
import { SidebarTopics } from "./sidebar-topics";
import { SidebarAuthors } from "./sidebar-authors";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BlogSidebarProps {
  selectedCategory: string;
  selectedTags: string[];
  readingTime: string;
  categoryList: string[];
  categoryDisplayMap: Record<string, string>;
  tagList: Array<{ tag: string; count: number }>;
  authors: Array<{ id: string; name: string; avatarImagePath?: string }>;
  selectedAuthor: string;
  query: string;
  sortBy: string;
  dateRange: string;
  totalResults: number;
  totalPosts: number;
}

export type { BlogSidebarProps };

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
  authors,
  selectedAuthor,
  query,
  sortBy,
  dateRange,
  totalResults,
  totalPosts,
}: BlogSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { searchInputRef } = useBlogKeyboard();
  const [expandedSections, setExpandedSections] = useState({
    filters: true,
    categories: true,
    topics: true,
    authors: true,
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

  const setAuthor = (authorId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (!authorId || authorId === selectedAuthor) {
      params.delete("author");
    } else {
      params.set("author", authorId);
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
  };

  const activeFilterCount = [
    selectedCategory && "category",
    selectedTags.length > 0 && "tags",
    readingTime && "readingTime",
    sortBy !== "newest" && "sort",
    dateRange !== "all" && "date",
    selectedAuthor && "author",
  ].filter(Boolean).length;

  const toggleSection = (section: "filters" | "categories" | "topics" | "authors") => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <aside className={cn("flex flex-col", SPACING.subsection)}>
      {/* Search Section */}
      <SidebarAuthors
        authors={authors}
        selectedAuthor={selectedAuthor}
        isExpanded={expandedSections.authors}
        onToggle={() => toggleSection("authors")}
        onAuthorSelect={setAuthor}
      />

      <div className="border-t border-border/50" />

      {/* Filters Section */}
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

      <div className="border-t border-border/50" />

      {/* Categories Section */}
      <SidebarCategories
        categoryList={categoryList}
        categoryDisplayMap={categoryDisplayMap}
        selectedCategory={selectedCategory}
        isExpanded={expandedSections.categories}
        onToggle={() => toggleSection("categories")}
        onCategorySelect={setCategory}
      />

      <div className="border-t border-border/50" />

      {/* Topics Section */}
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
