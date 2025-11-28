"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock, X, TrendingUp, Calendar } from "lucide-react";

interface BlogFiltersProps {
  selectedTags: string[];
  readingTime: string | null;
  tagList: string[];
  query: string;
  sortBy?: string;
  dateRange?: string;
}

/**
 * BlogFilters Component
 * 
 * Consolidated search and filter interface with:
 * - Search input with debounce
 * - Reading time dropdown
 * - Sort by dropdown (newest, popular, etc.)
 * - Date range filter
 * - Multi-select tag badges
 * - Clear all filters button
 * 
 * @param selectedTags - Currently selected tags array
 * @param readingTime - Currently selected reading time filter (quick/medium/deep)
 * @param tagList - Array of available tags
 * @param query - Current search query
 * @param sortBy - Current sort option (newest/popular)
 * @param dateRange - Current date range filter (30d/90d/year/all)
 */
export function BlogFilters({ selectedTags, readingTime, tagList, query, sortBy = 'newest', dateRange = 'all' }: BlogFiltersProps) {
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
        router.push(`/blog?${params.toString()}`, { scroll: false });
      });
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [searchValue, query, searchParams, router]);

  /**
   * Updates reading time filter
   */
  const updateReadingTime = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value && value !== "all") {
      params.set("readingTime", value);
    } else {
      params.delete("readingTime");
    }
    params.delete("page");
    
    router.push(`/blog?${params.toString()}`);
  };

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
    router.push(`/blog?${params.toString()}`);
  };

  /**
   * Updates date range filter
   */
  const updateDateRange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set("dateRange", value);
    } else {
      params.delete("dateRange");
    }
    params.delete("page");
    router.push(`/blog?${params.toString()}`);
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
    
    router.push(`/blog?${params.toString()}`);
  };

  /**
   * Clear all filters
   */
  const clearAllFilters = () => {
    router.push("/blog");
  };

  const hasActiveFilters = selectedTags.length > 0 || readingTime || query || (sortBy && sortBy !== 'newest') || (dateRange && dateRange !== 'all');
  const filterCount = selectedTags.length + (readingTime ? 1 : 0) + (query ? 1 : 0) + (sortBy && sortBy !== 'newest' ? 1 : 0) + (dateRange && dateRange !== 'all' ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Search Input - Full Width */}
      <div className="w-full">
        <Input
          type="search"
          placeholder="Search posts..."
          aria-label="Search blog posts"
          autoComplete="off"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full h-11"
        />
      </div>
      
      {/* Filter Controls - Separate Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[140px]">
            <Select
              value={readingTime || "all"}
              onValueChange={updateReadingTime}
            >
              <SelectTrigger className="h-10 w-full">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Reading time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All reading times</SelectItem>
                <SelectItem value="quick">Quick (&lt;5 min)</SelectItem>
                <SelectItem value="medium">Medium (5-15 min)</SelectItem>
                <SelectItem value="deep">Deep (&gt;15 min)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[130px]">
            <Select value={sortBy} onValueChange={updateSort}>
              <SelectTrigger className="h-10 w-full">
                <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="popular">Most popular</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[130px]">
            <Select value={dateRange} onValueChange={updateDateRange}>
              <SelectTrigger className="h-10 w-full">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Clear All Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-10 px-4 whitespace-nowrap shrink-0"
          >
            Clear all
            {filterCount > 0 && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {filterCount}
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Tag Badges */}
      <div className="space-y-3">
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
    </div>
  );
}
