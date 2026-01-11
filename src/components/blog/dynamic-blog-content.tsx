/**
 * DynamicBlogContent
 *
 * Server Component for blog post list and pagination
 * Wrapped in Suspense in BlogPage to enable streaming
 *
 * This component is called after the static shell renders,
 * allowing the page to show structure immediately and stream
 * the post list and pagination as the data loads.
 */

import { Suspense } from "react";
import type { ArchiveData } from "@/lib/archive";
import type { Post } from "@/data/posts";
import type { PostCategory } from "@/lib/post-categories";
import { getMultiplePostViews } from "@/lib/views.server";
import { calculateActiveFilterCount } from "@/lib/blog.server";
import { SPACING } from "@/lib/design-tokens";
import { ArchivePagination } from "@/components/layouts";
import {
  PostList,
  PostCategorySection,
  MobileFilterBar,
  FloatingFilterFab,
  HorizontalFilterChips,
  LayoutToggle,
} from "@/components/blog";

interface DynamicBlogContentProps {
  /** Archive data with filtered/paginated posts */
  sortedArchiveData: ArchiveData<Post>;
  /** Main list posts (featured excluded if section shown) */
  mainListPosts: Post[];
  /** Latest post slug for badge display */
  latestSlug?: string;
  /** Hottest post slug for badge display */
  hottestSlug?: string;
  /** Selected category filter */
  selectedCategory: string;
  /** Selected tags filter */
  selectedTags: string[];
  /** Reading time filter */
  readingTime: string;
  /** Available categories for filter UI */
  availableCategories: string[];
  /** Display map for category labels */
  categoryDisplayMap: Record<string, string>;
  /** Available tags with counts */
  availableTagsWithCounts: Array<{ tag: string; count: number }>;
  /** Search query */
  query: string;
  /** Sort by option */
  sortBy: string;
  /** Date range filter */
  dateRange: string;
  /** Post layout mode */
  layout: "grid" | "list" | "magazine" | "compact" | "grouped";
  /** Whether active filters are applied */
  hasActiveFilters: boolean;
  /** Grouped categories (only when layout=grouped) */
  groupedCategories?: [PostCategory, Post[]][];
}

/**
 * Internal component that actually fetches view counts and renders content
 * Split from wrapper to allow React to detect async operations
 */
async function DynamicBlogContentImpl({
  sortedArchiveData,
  mainListPosts,
  latestSlug,
  hottestSlug,
  selectedCategory,
  selectedTags,
  readingTime,
  availableCategories,
  categoryDisplayMap,
  availableTagsWithCounts,
  query,
  sortBy,
  dateRange,
  layout,
  hasActiveFilters,
  groupedCategories,
}: DynamicBlogContentProps) {
  // Fetch view counts for all filtered posts (this is the async operation that gets streamed)
  const postIds = sortedArchiveData.allFilteredItems.map(
    (post: Post) => post.id
  );
  const viewCounts = await getMultiplePostViews(postIds);

  // Apply sort by popularity if requested (after view counts are loaded)
  let postsToDisplay = mainListPosts;
  if (sortBy === "popular") {
    postsToDisplay = [...mainListPosts].sort((a: Post, b: Post) => {
      const aViews = viewCounts.get(a.id) || 0;
      const bViews = viewCounts.get(b.id) || 0;
      return bViews - aViews; // Descending order
    });
  }

  // Calculate active filter count for FAB
  const activeFilterCount = calculateActiveFilterCount({
    query,
    selectedCategory,
    selectedTags,
    readingTime,
    sortBy,
    dateRange,
  });

  // Feature flag: Horizontal filter chips can be toggled off for now to simplify mobile UI
  const showHorizontalFilterChips =
    process.env.NEXT_PUBLIC_FEATURE_HORIZONTAL_FILTER_CHIPS === "true";

  return (
    <div id="blog-posts" className="w-full">
      {/* Horizontal filter chips (mobile only) - sticky at top, full width */}
      {showHorizontalFilterChips && (
        <div className="lg:hidden mb-4">
          <HorizontalFilterChips
            selectedCategory={selectedCategory}
            sortBy={sortBy}
            categoryList={availableCategories}
            categoryDisplayMap={categoryDisplayMap}
          />
        </div>
      )}

      {/* Layout toggle (desktop only) */}
      <div className="mb-6 flex justify-end">
        <LayoutToggle currentLayout={layout} />
      </div>

      <div>
        {/* Mobile filters (below lg breakpoint) - collapsible for better content visibility */}
        <div className="lg:hidden mb-4">
          <MobileFilterBar
            selectedCategory={selectedCategory}
            selectedTags={selectedTags}
            readingTime={readingTime}
            categoryList={availableCategories}
            categoryDisplayMap={categoryDisplayMap}
            tagList={availableTagsWithCounts.map(({ tag }) => tag)}
            query={query}
            sortBy={sortBy}
            dateRange={dateRange}
            totalResults={sortedArchiveData.totalItems}
          />
        </div>

        {/* Floating filter FAB for mobile */}
        <FloatingFilterFab
          activeFilterCount={activeFilterCount}
          hasFilters={hasActiveFilters}
        />

        {/* Post list or grouped view */}
        {layout === "grouped" && groupedCategories ? (
          <div className={SPACING.subsection}>
            {groupedCategories.map(([category, posts]) => (
              <PostCategorySection
                key={category}
                category={category}
                label={categoryDisplayMap[category]}
                posts={posts}
                latestSlug={latestSlug}
                hottestSlug={hottestSlug}
                viewCounts={viewCounts}
                searchQuery={query}
              />
            ))}
          </div>
        ) : (
          <PostList
            posts={postsToDisplay}
            latestSlug={latestSlug}
            hottestSlug={hottestSlug}
            titleLevel="h2"
            layout={layout as "grid" | "list" | "magazine" | "compact"}
            viewCounts={viewCounts}
            hasActiveFilters={hasActiveFilters}
            emptyMessage="No posts found. Try adjusting your search or filters."
            searchQuery={query}
          />
        )}

        {/* Pagination */}
        {sortedArchiveData.totalPages > 1 && (
          <div className="mt-8">
            <ArchivePagination
              currentPage={sortedArchiveData.currentPage}
              totalPages={sortedArchiveData.totalPages}
              hasPrevPage={sortedArchiveData.currentPage > 1}
              hasNextPage={
                sortedArchiveData.currentPage < sortedArchiveData.totalPages
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Public export - wrapper component with Suspense boundary
 * to be called from BlogPage with fallback skeleton
 */
export async function DynamicBlogContent(props: DynamicBlogContentProps) {
  return <DynamicBlogContentImpl {...props} />;
}
