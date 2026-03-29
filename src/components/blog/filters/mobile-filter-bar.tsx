'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BlogFilters } from './blog-filters';
import { useMobileFilterSheet } from '@/hooks/use-mobile-filter-sheet';

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
 * A slim horizontal pill strip that shows the filter trigger and active filter chips
 * in a single scrollable row. Tapping the filter pill opens a bottom sheet.
 *
 * Mobile only (hidden at lg breakpoint).
 */
export function MobileFilterBar({
  selectedCategory,
  selectedTags,
  readingTime,
  categoryList,
  categoryDisplayMap,
  tagList,
  query,
  sortBy = 'newest',
  dateRange = 'all',
  totalResults,
}: MobileFilterBarProps) {
  const { isOpen, setIsOpen } = useMobileFilterSheet();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClearAll = () => {
    startTransition(() => {
      setIsOpen(false);
      router.push('/blog', { scroll: false });
    });
  };

  // Build active filter chip list
  const activeFilters: Array<{ key: string; label: string }> = [];

  if (query) activeFilters.push({ key: 'q', label: `"${query}"` });
  if (selectedCategory) {
    activeFilters.push({
      key: 'category',
      label: categoryDisplayMap[selectedCategory] || selectedCategory,
    });
  }
  selectedTags.forEach((tag) => activeFilters.push({ key: 'tag', label: tag }));
  if (readingTime) {
    const labels: Record<string, string> = { quick: '<5 min', medium: '5–15 min', deep: '>15 min' };
    activeFilters.push({ key: 'readingTime', label: labels[readingTime] || readingTime });
  }
  if (sortBy && sortBy !== 'newest' && sortBy !== 'popular') {
    const labels: Record<string, string> = {
      oldest: 'Oldest',
      archived: 'Archived',
      drafts: 'Drafts',
    };
    activeFilters.push({ key: 'sortBy', label: labels[sortBy] || sortBy });
  }
  if (dateRange && dateRange !== 'all') {
    const labels: Record<string, string> = {
      '30d': 'Last 30d',
      '90d': 'Last 90d',
      year: 'This year',
    };
    activeFilters.push({ key: 'dateRange', label: labels[dateRange] || dateRange });
  }

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        {/* Single horizontal scrollable row */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          {/* Filter trigger pill */}
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label={
                hasActiveFilters ? `Filters (${activeFilters.length} active)` : 'Open filters'
              }
              className={cn(
                'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
                'border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                hasActiveFilters
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border hover:bg-muted'
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
              <span>{hasActiveFilters ? `Filters · ${activeFilters.length}` : 'Filter'}</span>
            </button>
          </SheetTrigger>

          {/* Active filter chips */}
          {activeFilters.map((filter, index) => (
            <span
              key={`${filter.key}-${index}`}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-foreground border border-border/60 whitespace-nowrap"
            >
              {filter.label}
            </span>
          ))}

          {/* Clear all — only when filters active */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearAll}
              disabled={isPending}
              aria-label="Clear all filters"
              className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground border border-border/60 hover:border-border transition-colors disabled:opacity-50"
            >
              <X className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Bottom sheet */}
        <SheetContent side="bottom" className="max-h-[80vh] overflow-auto p-4">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription className="sr-only">
                  Filter blog posts by category, tags, reading time, and sort options
                </SheetDescription>
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={handleClearAll} disabled={isPending}>
                    {isPending ? '…' : 'Clear all'}
                  </Button>
                )}
                <SheetClose asChild>
                  <Button variant="ghost" size="sm" aria-label="Close filters">
                    Done
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
        </SheetContent>
      </Sheet>
    </div>
  );
}
