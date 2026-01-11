/**
 * Archive Filters Component
 *
 * Reusable filter controls for archive pages with search, tags, and custom dropdowns.
 * Manages URL state for shareable filtered views.
 *
 * @example
 * ```tsx
 * <ArchiveFilters
 *   searchPlaceholder="Search posts..."
 *   availableTags={['react', 'nextjs', 'typescript']}
 *   activeTag={searchParams.tag}
 *   searchQuery={searchParams.search}
 * />
 * ```
 */

"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPACING } from "@/lib/design-tokens";
import { useCallback, useTransition } from "react";

export interface ArchiveFiltersProps {
  /** Placeholder text for search input */
  searchPlaceholder?: string;

  /** Available tags to display */
  availableTags?: string[];

  /** Currently active tag */
  activeTag?: string;

  /** Current search query */
  searchQuery?: string;

  /** Show tag filters */
  showTags?: boolean;

  /** Show search */
  showSearch?: boolean;

  /** Custom className */
  className?: string;

  /** Callback when filters change (optional, for analytics) */
  onFilterChange?: (filters: { search?: string; tag?: string }) => void;
}

export function ArchiveFilters({
  searchPlaceholder = "Search...",
  availableTags = [],
  activeTag,
  searchQuery = "",
  showTags = true,
  showSearch = true,
  className,
  onFilterChange,
}: ArchiveFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  /**
   * Update URL search params while preserving other params
   */
  const updateSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Apply updates
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Reset to page 1 when filters change
      if ("search" in updates || "tag" in updates) {
        params.delete("page");
      }

      // Update URL
      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      startTransition(() => {
        router.push(newUrl, { scroll: false });
      });

      // Call callback if provided
      if (onFilterChange) {
        onFilterChange({
          search: params.get("search") || undefined,
          tag: params.get("tag") || undefined,
        });
      }
    },
    [pathname, router, searchParams, onFilterChange]
  );

  /**
   * Handle search input
   */
  const handleSearch = useCallback(
    (value: string) => {
      updateSearchParams({ search: value || null });
    },
    [updateSearchParams]
  );

  /**
   * Handle tag selection
   */
  const handleTagClick = useCallback(
    (tag: string) => {
      const newTag = tag === activeTag ? null : tag;
      updateSearchParams({ tag: newTag });
    },
    [activeTag, updateSearchParams]
  );

  /**
   * Clear all filters
   */
  const handleClearAll = useCallback(() => {
    updateSearchParams({ search: null, tag: null });
  }, [updateSearchParams]);

  const hasActiveFilters = !!(searchQuery || activeTag);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Clear */}
      <div className={`flex flex-col sm:flex-row gap-${SPACING.md}`}>
        {showSearch && (
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              defaultValue={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
              disabled={isPending}
              aria-label="Search"
            />
          </div>
        )}

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="default"
            onClick={handleClearAll}
            disabled={isPending}
            className="sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Tags */}
      {showTags && availableTags.length > 0 && (
        <div className={`flex flex-wrap gap-${SPACING.sm}`}>
          <span className="text-sm text-muted-foreground self-center">
            Filter by tag:
          </span>
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              disabled={isPending}
              className={cn(
                // Badge base styles

                "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                // Cursor and hover
                "cursor-pointer hover:opacity-80",
                // Variant styles
                tag === activeTag
                  ? "border-transparent bg-primary text-primary-foreground shadow"
                  : "border-border bg-background text-foreground",
                // Disabled state
                isPending && "opacity-50 cursor-not-allowed"
              )}
              aria-label={`Filter by ${tag}`}
              aria-pressed={tag === activeTag}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div
          className={`flex flex-wrap gap-${SPACING.sm} items-center text-sm text-muted-foreground`}
        >
          <span>Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary">Search: {searchQuery}</Badge>
          )}
          {activeTag && <Badge variant="secondary">Tag: {activeTag}</Badge>}
        </div>
      )}
    </div>
  );
}
