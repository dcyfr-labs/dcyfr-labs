"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Search, ChevronDown, ChevronUp, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { useSidebarContext } from "@/components/blog-layout-wrapper";
import { useBlogKeyboard } from "@/components/blog-keyboard-provider";

interface BlogSidebarProps {
  selectedTags: string[];
  readingTime: string;
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
 * Provides search, view toggle, sorting, filtering, and tag selection.
 * Collapses to top section on mobile/tablet.
 */
export function BlogSidebar({
  selectedTags,
  readingTime,
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
  const { isCollapsed, setIsCollapsed } = useSidebarContext();
  const { searchInputRef } = useBlogKeyboard();
  const [expandedSections, setExpandedSections] = useState({
    filters: true,
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
    const currentTags = selectedTags;
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
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

  const clearAllFilters = () => {
    startTransition(() => {
      router.push("/blog", { scroll: false });
    });
    setSearchValue("");
  };

  const activeFilterCount = [
    query,
    selectedTags.length > 0 && "tags",
    readingTime && "readingTime",
    sortBy !== "newest" && "sort",
    dateRange !== "all" && "date",
  ].filter(Boolean).length;

  const toggleSection = (section: "filters" | "topics") => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <aside className="space-y-6">
      {/* Toggle button - temporarily disabled */}
      {/* <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={isCollapsed ? "w-10 h-10" : "w-full justify-start gap-2 text-muted-foreground hover:text-foreground h-10"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelRightOpen className="h-4 w-4" />
          ) : (
            <>
              <PanelRightClose className="h-4 w-4" />
              <span className="text-sm">Hide Filters</span>
            </>
          )}
        </Button>
      </div> */}

      {!isCollapsed && (
        <>
      {/* Search */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="search"
            placeholder="Search posts..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9 h-11"
          />
        </div>
        
        {/* Results count */}
        <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
          <span>
            {totalResults === totalPosts 
              ? `${totalResults} posts` 
              : `${totalResults} of ${totalPosts} posts`}
          </span>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-7 text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Sort & Time Filters */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection("filters")}
          className="flex items-center justify-between w-full text-sm font-medium"
        >
          <span>Sort & Filters</span>
          {expandedSections.filters ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        
        {expandedSections.filters && (
          <div className="space-y-3 pt-2">
            {/* Sort badges */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Sort by</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: "newest", label: "Newest" },
                  { value: "popular", label: "Popular" },
                  { value: "oldest", label: "Oldest" },
                  { value: "archived", label: "Archived" },
                  ...(process.env.NODE_ENV === "development" ? [{ value: "drafts", label: "Drafts" }] : []),
                ].map((option) => {
                  const isSelected = sortBy === option.value;
                  return (
                    <Badge
                      key={option.value}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors select-none text-xs"
                      onClick={() => updateParam("sortBy", option.value)}
                    >
                      {option.label}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Date range badges */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Date range</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: "all", label: "All time" },
                  { value: "30d", label: "30 days" },
                  { value: "90d", label: "90 days" },
                  { value: "year", label: "This year" },
                ].map((option) => {
                  const isSelected = dateRange === option.value;
                  return (
                    <Badge
                      key={option.value}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors select-none text-xs"
                      onClick={() => updateParam("dateRange", option.value)}
                    >
                      {option.label}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Reading time badges */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Reading time</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: "all", label: "All" },
                  { value: "quick", label: "≤5 min" },
                  { value: "medium", label: "5-15 min" },
                  { value: "deep", label: ">15 min" },
                ].map((option) => {
                  const isSelected = (readingTime || "all") === option.value;
                  return (
                    <Badge
                      key={option.value}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors select-none text-xs"
                      onClick={() => updateParam("readingTime", option.value)}
                    >
                      {option.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Topics (Tags) */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection("topics")}
          className="flex items-center justify-between w-full text-sm font-medium"
        >
          <span>Topics</span>
          {expandedSections.topics ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {expandedSections.topics && tagList.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {tagList.map(({ tag, count }) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <Badge
                  key={tag}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                  <span className="ml-1.5 text-xs opacity-70">({count})</span>
                </Badge>
              );
            })}
          </div>
        )}
      </div>
      </>
      )}
    </aside>
  );
}
