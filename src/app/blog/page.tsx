import type { Metadata } from "next";
import { posts, type Post } from "@/data/posts";
import { getArchiveData } from "@/lib/archive";
import { getPostBadgeMetadata } from "@/lib/post-badges";
import { createArchivePageMetadata, createCollectionSchema, getJsonLdScriptProps } from "@/lib/metadata";
import { AUTHOR_NAME, SITE_URL } from "@/lib/site-config";
import { headers } from "next/headers";
import { getMultiplePostViews } from "@/lib/views";
import { TYPOGRAPHY, CONTAINER_WIDTHS } from "@/lib/design-tokens";
import { ArchivePagination } from "@/components/layouts/archive-pagination";
import {
  PostList,
  BlogSearchAnalytics,
  BlogSidebar,
  BlogLayoutManager,
  BlogLayoutWrapper,
  BlogFilters,
} from "@/components/blog";
import { ViewToggle } from "@/components/common";

const pageTitle = "Blog";
const pageDescription = "Blog posts on software development, cybersecurity, emerging technologies, and more.";
const POSTS_PER_PAGE = 12;

export const metadata: Metadata = createArchivePageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/blog",
});

interface BlogPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  // Get nonce from proxy for CSP
  const nonce = (await headers()).get("x-nonce") || "";
  
  // Resolve search parameters
  const resolvedParams = (await searchParams) ?? {};
  const getParam = (key: string) => {
    const value = resolvedParams[key];
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
  };
  
  // Support category filter (primary classification - lowercase in URL)
  const categoryParam = getParam("category");
  const selectedCategory = categoryParam ? categoryParam.toLowerCase() : "";
  
  // Support multiple tags (comma-separated, case-insensitive)
  const tagParam = getParam("tag");
  const selectedTags = tagParam ? tagParam.split(",").filter(Boolean).map(t => t.toLowerCase()) : [];
  const query = getParam("q");
  const readingTime = getParam("readingTime");
  const sortBy = getParam("sortBy") || "newest";
  const dateRange = getParam("dateRange") || "all";
  const layoutParam = getParam("layout");
  const layout = (["grid", "list", "magazine", "compact"].includes(layoutParam)) ? layoutParam as "grid" | "list" | "magazine" | "compact" : "grid";
  
  // Apply category filter first (case-insensitive)
  const postsWithCategoryFilter = selectedCategory
    ? posts.filter((post) => 
        post.category && post.category.toLowerCase() === selectedCategory
      )
    : posts;
  
  // Apply archived filter when sortBy=archived
  const postsWithArchivedFilter = sortBy === "archived"
    ? postsWithCategoryFilter.filter((post) => post.archived)
    : postsWithCategoryFilter;
  
  // Apply drafts filter when sortBy=drafts (development only)
  const postsWithDraftsFilter = sortBy === "drafts" && process.env.NODE_ENV === "development"
    ? postsWithArchivedFilter.filter((post) => post.draft)
    : postsWithArchivedFilter;
  
  // Apply date range filter
  const now = new Date();
  const postsWithDateFilter = dateRange !== "all"
    ? postsWithDraftsFilter.filter((post) => {
        const postDate = new Date(post.publishedAt);
        const daysDiff = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dateRange === "30d") return daysDiff <= 30;
        if (dateRange === "90d") return daysDiff <= 90;
        if (dateRange === "year") {
          return postDate.getFullYear() === now.getFullYear();
        }
        return true;
      })
    : postsWithDraftsFilter;
  
  // Apply reading time filter (custom filter not in Archive pattern)
  const postsWithReadingTimeFilter = readingTime
    ? postsWithDateFilter.filter((post) => {
        const minutes = post.readingTime.minutes;
        if (readingTime === "quick") return minutes <= 5;
        if (readingTime === "medium") return minutes > 5 && minutes <= 15;
        if (readingTime === "deep") return minutes > 15;
        return true;
      })
    : postsWithDateFilter;
  
  // Apply multiple tag filter manually before Archive pattern (case-insensitive)
  const postsWithTagFilter = selectedTags.length > 0
    ? postsWithReadingTimeFilter.filter((post) =>
        selectedTags.every((tag) => 
          post.tags.some(t => t.toLowerCase() === tag)
        )
      )
    : postsWithReadingTimeFilter;
  
  // Use Archive Pattern for filtering, sorting, pagination (without tag filter)
  const archiveData = getArchiveData<Post>(
    {
      items: postsWithTagFilter,
      searchFields: ["title", "summary", "body"],
      tagField: "tags",
      dateField: "publishedAt",
      itemsPerPage: POSTS_PER_PAGE,
    },
    {
      search: query,
      page: getParam("page"),
    }
  );
  
  // Get view counts for all posts (for sorting and display)
  const postIds = archiveData.allFilteredItems.map(post => post.id);
  const viewCounts = await getMultiplePostViews(postIds);
  
  // Apply sort by popularity if requested
  let sortedItems = archiveData.allFilteredItems;
  if (sortBy === "popular") {
    sortedItems = [...archiveData.allFilteredItems].sort((a, b) => {
      const aViews = viewCounts.get(a.id) || 0;
      const bViews = viewCounts.get(b.id) || 0;
      return bViews - aViews; // Descending order
    });
  } else if (sortBy === "oldest") {
    sortedItems = [...archiveData.allFilteredItems].sort((a, b) => {
      return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
    });
  }
  // "newest" is already the default sort from archiveData
  
  // Re-paginate sorted items
  const startIndex = (archiveData.currentPage - 1) * archiveData.itemsPerPage;
  const endIndex = startIndex + archiveData.itemsPerPage;
  const paginatedItems = sortedItems.slice(startIndex, endIndex);
  
  // Update archiveData with sorted items
  const sortedArchiveData = {
    ...archiveData,
    items: paginatedItems,
    allFilteredItems: sortedItems,
    totalItems: sortedItems.length,
    totalPages: Math.ceil(sortedItems.length / archiveData.itemsPerPage),
  };
  
  // Transform availableTags to include counts
  const availableTagsWithCounts = sortedArchiveData.availableTags.map(tag => ({
    tag,
    count: sortedArchiveData.allFilteredItems.filter(post => post.tags.includes(tag)).length,
  }));
  
  // Get available categories from all posts (for filter UI)
  // Categories use proper casing for display
  const categoryDisplayMap: Record<string, string> = {
    development: "Development",
    security: "Security",
    career: "Career",
    ai: "AI",
    tutorial: "Tutorial",
  };
  const availableCategories = Array.from(
    new Set(
      posts
        .map((p) => p.category)
        .filter((c): c is NonNullable<typeof c> => !!c)
    )
  ).sort();
  
  // Check if filters are active for empty state
  const hasActiveFilters = Boolean(
    query || 
    selectedCategory ||
    selectedTags.length > 0 || 
    readingTime || 
    sortBy !== 'newest' || 
    dateRange !== 'all'
  );
  
  // Get badge metadata (latest and hottest posts)
  const { latestSlug, hottestSlug } = await getPostBadgeMetadata(posts);
  
  // Featured posts disabled - always show all posts
  // const activeFeaturedPosts = featuredPosts.filter(p => !p.archived && !p.draft);
  // const shouldShowFeaturedSection = activeFeaturedPosts.length > 0 && !hasActiveFilters;
  const shouldShowFeaturedSection = false;
  
  // Exclude featured posts from main list only when featured section is shown
  const mainListPosts = shouldShowFeaturedSection 
    ? sortedArchiveData.items.filter(p => !p.featured)
    : sortedArchiveData.items;
  
  // JSON-LD structured data
  const collectionTitle = selectedTags.length > 0 ? `Blog - ${selectedTags.join(", ")}` : pageTitle;
  const collectionDescription = selectedTags.length > 0 
    ? `Articles tagged with "${selectedTags.join('", "')}"` 
    : pageDescription;
  
  const jsonLd = createCollectionSchema({
    name: collectionTitle,
    description: collectionDescription,
    url: `${SITE_URL}/blog`,
    items: sortedArchiveData.allFilteredItems.map(post => ({
      name: post.title,
      description: post.summary,
      url: `${SITE_URL}/blog/${post.slug}`,
      datePublished: new Date(post.publishedAt),
      author: AUTHOR_NAME,
    })),
  });
  
  return (
    <>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />
      
      {/* Track search and filter analytics */}
      <BlogSearchAnalytics 
        query={query}
        tags={selectedTags}
        resultsCount={sortedArchiveData.totalItems}
      />
      
      {/* Layout preference manager */}
      <BlogLayoutManager />
      
      {/* Blog layout with sidebar on desktop */}
      <div className={`container ${CONTAINER_WIDTHS.archive} mx-auto px-4 sm:px-8 lg:px-8 pt-8 md:pt-12 pb-8`}>
        {/* Main grid: Sidebar + Content */}
        <BlogLayoutWrapper>
          {/* Sidebar (desktop only) */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <BlogSidebar
                selectedCategory={selectedCategory}
                selectedTags={selectedTags}
                readingTime={readingTime}
                categoryList={availableCategories}
                categoryDisplayMap={categoryDisplayMap}
                tagList={availableTagsWithCounts}
                query={query}
                sortBy={sortBy}
                dateRange={dateRange}
                totalResults={sortedArchiveData.totalItems}
                totalPosts={posts.length}
              />
            </div>
          </div>

          {/* Main content area */}
          <div className="px-2 sm:px-4 lg:px-8 w-full">
            {/* Header with View Toggle */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className={TYPOGRAPHY.h1.hero}>{pageTitle}</h1>
                <p className="text-muted-foreground">{pageDescription}</p>
              </div>
              {/* Layout switcher hidden - grid is default */}
              {/* <div className="shrink-0 hidden lg:flex items-center gap-3">
                <ViewToggle currentView={layout} />
              </div> */}
            </div>
            
            {/* Mobile filters (below lg breakpoint) */}
            <div className="lg:hidden mb-6 p-4 border rounded-lg">
              <BlogFilters 
                selectedCategory={selectedCategory}
                selectedTags={selectedTags}
                readingTime={readingTime}
                categoryList={availableCategories}
                categoryDisplayMap={categoryDisplayMap}
                tagList={sortedArchiveData.availableTags}
                query={query}
                sortBy={sortBy}
                dateRange={dateRange}
              />
            </div>

            {/* Featured posts section - DISABLED */}
            {/* To re-enable: set shouldShowFeaturedSection logic above */}

            {/* Post list */}
            <PostList 
              posts={mainListPosts}
              latestSlug={latestSlug ?? undefined}
              hottestSlug={hottestSlug ?? undefined}
              titleLevel="h2"
              layout={layout}
              viewCounts={viewCounts}
              hasActiveFilters={hasActiveFilters}
              emptyMessage="No posts found. Try adjusting your search or filters."
              searchQuery={query}
            />

            {/* Pagination */}
            {sortedArchiveData.totalPages > 1 && (
              <div className="mt-8">
                <ArchivePagination
                  currentPage={sortedArchiveData.currentPage}
                  totalPages={sortedArchiveData.totalPages}
                  hasPrevPage={sortedArchiveData.currentPage > 1}
                  hasNextPage={sortedArchiveData.currentPage < sortedArchiveData.totalPages}
                />
              </div>
            )}
          </div>
        </BlogLayoutWrapper>
      </div>
    </>
  );
}
