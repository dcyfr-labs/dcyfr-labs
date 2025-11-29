"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Search, ChevronDown, ChevronUp, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { useSidebarContext } from "@/components/blog/blog-layout-wrapper";
import { useBlogKeyboard } from "@/components/blog/blog-keyboard-provider";

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
  const { isCollapsed, setIsCollapsed } = useSidebarContext();
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
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Sort by</label>
              <Select value={sortBy} onValueChange={(val) => updateParam("sortBy", val)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="popular">Most popular</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Date range</label>
              <Select value={dateRange} onValueChange={(val) => updateParam("dateRange", val)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="year">This year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Reading time</label>
              <Select value={readingTime || "all"} onValueChange={(val) => updateParam("readingTime", val)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All lengths</SelectItem>
                  <SelectItem value="quick">Quick read (≤5 min)</SelectItem>
                  <SelectItem value="medium">Medium (5-15 min)</SelectItem>
                  <SelectItem value="deep">Deep dive (&gt;15 min)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Categories */}
      {categoryList.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => toggleSection("categories")}
            className="flex items-center justify-between w-full text-sm font-medium"
          >
            <span>Categories</span>
            {expandedSections.categories ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedSections.categories && (
            <div className="flex flex-wrap gap-2 pt-2">
              {categoryList.map((category) => {
                const isSelected = selectedCategory === category;
                const displayName = categoryDisplayMap[category] || category;
                return (
                  <Badge
                    key={category}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => setCategory(category)}
                  >
                    {displayName}
                    {isSelected && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      )}

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
              const isSelected = selectedTags.some(t => t.toLowerCase() === tag.toLowerCase());
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
