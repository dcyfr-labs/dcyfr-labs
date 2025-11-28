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
import { X, TrendingUp, Code2, Tags, Activity } from "lucide-react";

interface ProjectFiltersProps {
  selectedTags: string[];
  selectedTech: string[];
  status: string | null;
  tagList: string[];
  techList: string[];
  query: string;
  sortBy?: string;
}

/**
 * ProjectFilters Component
 * 
 * Consolidated search and filter interface for projects with:
 * - Search input with debounce
 * - Tech stack multi-select
 * - Category/tag multi-select
 * - Status filter (active/in-progress/archived)
 * - Sort by dropdown (newest, oldest, A-Z)
 * - Clear all filters button
 * 
 * @param selectedTags - Currently selected category tags
 * @param selectedTech - Currently selected tech stack filters
 * @param status - Currently selected status filter (active/in-progress/archived/all)
 * @param tagList - Array of available category tags
 * @param techList - Array of available technologies
 * @param query - Current search query
 * @param sortBy - Current sort option (newest/oldest/alpha)
 */
export function ProjectFilters({ 
  selectedTags, 
  selectedTech, 
  status, 
  tagList, 
  techList, 
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
        router.push(`/projects?${params.toString()}`, { scroll: false });
      });
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [searchValue, query, searchParams, router]);

  /**
   * Updates status filter
   */
  const updateStatus = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value && value !== "all") {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    params.delete("page");
    
    router.push(`/projects?${params.toString()}`);
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
    router.push(`/projects?${params.toString()}`);
  };

  /**
   * Toggle category tag selection
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
    
    router.push(`/projects?${params.toString()}`);
  };

  /**
   * Toggle tech stack selection
   */
  const toggleTech = (tech: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    let newTech: string[];
    if (selectedTech.includes(tech)) {
      newTech = selectedTech.filter((t) => t !== tech);
    } else {
      newTech = [...selectedTech, tech];
    }
    
    if (newTech.length > 0) {
      params.set("tech", newTech.join(","));
    } else {
      params.delete("tech");
    }
    params.delete("page");
    
    router.push(`/projects?${params.toString()}`);
  };

  /**
   * Clear all filters
   */
  const clearAllFilters = () => {
    router.push("/projects");
  };

  const hasActiveFilters = selectedTags.length > 0 || selectedTech.length > 0 || status || query || (sortBy && sortBy !== 'newest');
  const filterCount = selectedTags.length + selectedTech.length + (status ? 1 : 0) + (query ? 1 : 0) + (sortBy && sortBy !== 'newest' ? 1 : 0);

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
      
      {/* Filter Controls - Separate Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[130px]">
            <Select
              value={status || "all"}
              onValueChange={updateStatus}
            >
              <SelectTrigger className="h-10 w-full">
                <Activity className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
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
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="alpha">Alphabetical</SelectItem>
                <SelectItem value="status">By status</SelectItem>
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

      {/* Tech Stack Badges */}
      {techList.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-muted-foreground" />
            {/* Label text, not a semantic heading */}
            {/* eslint-disable-next-line no-restricted-syntax */}
            <span className="text-sm font-medium text-muted-foreground">Tech Stack</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {techList.map((tech) => {
              const isSelected = selectedTech.includes(tech);
              return (
                <Badge
                  key={tech}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors select-none"
                  onClick={() => toggleTech(tech)}
                >
                  {tech}
                  {isSelected && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Tag Badges */}
      {tagList.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tags className="h-4 w-4 text-muted-foreground" />
            {/* Label text, not a semantic heading */}
            {/* eslint-disable-next-line no-restricted-syntax */}
            <span className="text-sm font-medium text-muted-foreground">Categories</span>
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
