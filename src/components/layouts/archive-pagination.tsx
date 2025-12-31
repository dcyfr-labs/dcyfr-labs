/**
 * Archive Pagination Component
 *
 * Page navigation with prev/next buttons and page numbers.
 * Manages URL state for shareable paginated views.
 *
 * @example
 * ```tsx
 * <ArchivePagination
 *   currentPage={2}
 *   totalPages={10}
 *   hasNextPage={true}
 *   hasPrevPage={true}
 * />
 * ```
 */

"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPACING } from "@/lib/design-tokens";

export interface ArchivePaginationProps {
  /** Current page number (1-indexed) */
  currentPage: number;

  /** Total number of pages */
  totalPages: number;

  /** Whether there's a previous page */
  hasPrevPage: boolean;

  /** Whether there's a next page */
  hasNextPage: boolean;

  /** Maximum page numbers to show (default: 7) */
  maxPageNumbers?: number;

  /** Custom className */
  className?: string;

  /** Scroll to top on navigation (default: true) */
  scrollToTop?: boolean;
}

export function ArchivePagination({
  currentPage,
  totalPages,
  hasPrevPage,
  hasNextPage,
  maxPageNumbers = 7,
  className,
  scrollToTop = true,
}: ArchivePaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * Build URL for a specific page
   */
  const buildPageUrl = (page: number): string => {
    const params = new URLSearchParams(searchParams.toString());

    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }

    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  };

  /**
   * Calculate which page numbers to display
   * Shows: [1] ... [current-1] [current] [current+1] ... [total]
   */
  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= maxPageNumbers) {
      // Show all pages if total is small
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [];
    const halfMax = Math.floor(maxPageNumbers / 2);

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    let startPage = Math.max(2, currentPage - halfMax);
    let endPage = Math.min(totalPages - 1, currentPage + halfMax);

    // Adjust if near start
    if (currentPage <= halfMax + 1) {
      endPage = Math.min(totalPages - 1, maxPageNumbers - 1);
    }

    // Adjust if near end
    if (currentPage >= totalPages - halfMax) {
      startPage = Math.max(2, totalPages - maxPageNumbers + 2);
    }

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push("ellipsis");
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push("ellipsis");
    }

    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  // Don't render if only one page
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className={cn("flex items-center justify-center gap-2", className)}
      aria-label="Pagination"
    >
      {/* Previous Button */}
      <Button
        variant="outline"
        size="default"
        asChild
        disabled={!hasPrevPage}
        className="gap-1"
      >
        {hasPrevPage ? (
          <Link
            href={buildPageUrl(currentPage - 1)}
            scroll={scrollToTop}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:inline">Previous</span>
          </Link>
        ) : (
          <span>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:inline">Previous</span>
          </span>
        )}
      </Button>

      {/* Page Numbers */}
      <div className="hidden sm:flex items-center gap-1">
        {pageNumbers.map((pageNum, index) => {
          if (pageNum === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-muted-foreground"
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          const isCurrentPage = pageNum === currentPage;

          return (
            <Button
              key={pageNum}
              variant={isCurrentPage ? "default" : "outline"}
              size="default"
              asChild={!isCurrentPage}
              disabled={isCurrentPage}
              className={cn(
                "min-w-[2.5rem]",
                isCurrentPage && "pointer-events-none"
              )}
              aria-label={`Go to page ${pageNum}`}
              aria-current={isCurrentPage ? "page" : undefined}
            >
              {isCurrentPage ? (
                <span>{pageNum}</span>
              ) : (
                <Link href={buildPageUrl(pageNum)} scroll={scrollToTop}>
                  {pageNum}
                </Link>
              )}
            </Button>
          );
        })}
      </div>

      {/* Mobile Page Indicator */}
      <div className="sm:hidden px-3 py-2 text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="default"
        asChild
        disabled={!hasNextPage}
        className="gap-1"
      >
        {hasNextPage ? (
          <Link
            href={buildPageUrl(currentPage + 1)}
            scroll={scrollToTop}
            aria-label="Go to next page"
          >
            <span className="sr-only sm:not-sr-only sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <span className="sr-only sm:not-sr-only sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </nav>
  );
}
