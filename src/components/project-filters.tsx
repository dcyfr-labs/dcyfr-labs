"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, ArrowDownUp, FolderOpen, Tags } from "lucide-react";

interface ProjectFiltersProps {
  selectedCategory?: string;
  selectedTags: string[];
  categoryList: string[];
  categoryDisplayMap: Record<string, string>;
  tagList: string[];
  query: string;
  sortBy?: string;
  totalResults?: number;
  hasActiveFilters?: boolean;
}

/**
 * ProjectFilters Component
 * 
 * Consolidated search and filter interface for projects with:
 * - Search input with debounce
 * - Sort by badges (Newest, Oldest, Archived)
 * - Category badge multi-select
 * - Tag badge multi-select
 * 
 * @param selectedCategory - Currently selected category filter
 * @param selectedTags - Currently selected tag filters
 * @param categoryList - Array of available categories
 * @param categoryDisplayMap - Map of category values to display names
 * @param tagList - Array of available tags
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
  sortBy = 'newest' 
}: ProjectFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(query);
  const [, startTransition] = useTransition();

  // Sync search value with query prop
  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  // Debounced search - update URL after 250ms of no typing
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const normalized = searchValue.trim();
      if (normalized === query.trim()) return;
      
      const params = new URLSearchParams(searchParams.toString());
      if (normalized) {
        params.set("q", normalized);
      } else {
        params.delete("q");
      }
      params.delete("page");
      
      startTransition(() => {
        router.push(`/portfolio?${params.toString()}`, { scroll: false });
      });
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [searchValue, query, searchParams, router]);

  /**
   * Updates sort order
   */
  const updateSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "newest") {
      params.set("sortBy", value);
    } else {
      params.delete("sortBy");
    }
    params.delete("page");
    router.push(`/portfolio?${params.toString()}`);
  };

  /**
   * Toggle category selection
   */
  const toggleCategory = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (selectedCategory === category) {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    params.delete("page");
    
    router.push(`/portfolio?${params.toString()}`);
  };

  /**
   * Toggle tag selection
   */
  const toggleTag = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    let newTags: string[];
    if (selectedTags.includes(tag)) {
      newTags = selectedTags.filter((t) => t !== tag);
    } else {
      newTags = [...selectedTags, tag];
    }
    
    if (newTags.length > 0) {
      params.set("tag", newTags.join(","));
    } else {
      params.delete("tag");
    }
    params.delete("page");
    
    router.push(`/portfolio?${params.toString()}`);
  };

  /**
   * Clear all filters
   */
  const clearAllFilters = () => {
    router.push("/portfolio");
  };

  const _hasActiveFilters = !!selectedCategory || selectedTags.length > 0 || query || (sortBy && sortBy !== 'newest');

  return (
    <div className="space-y-6">
      {/* Search Input - Full Width */}
      <div className="w-full">
        <Input
          type="search"
          placeholder="Search projects..."
          aria-label="Search projects"
          autoComplete="off"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full h-11"
        />
      </div>
      
      {/* Sort By Badges */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Sort by</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
            { value: "archived", label: "Archived" },
          ].map((option) => {
            const isSelected = sortBy === option.value;
            return (
              <Badge
                key={option.value}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors select-none"
                onClick={() => updateSort(option.value)}
              >
                {option.label}
                {isSelected && option.value !== "newest" && (
                  <X className="ml-1 h-3 w-3" onClick={(e) => { e.stopPropagation(); updateSort("newest"); }} />
                )}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Categories Badges */}
      {categoryList.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Categories</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categoryList.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <Badge
                  key={category}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors select-none"
                  onClick={() => toggleCategory(category)}
                >
                  {categoryDisplayMap[category] || category}
                  {isSelected && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Tags Badges */}
      {tagList.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tags className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tagList.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <Badge
                  key={tag}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors select-none"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                  {isSelected && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}