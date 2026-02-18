import type { Metadata } from 'next';
import { Suspense } from 'react';
import { posts, featuredPosts, type Post } from '@/data/posts';
import { POST_CATEGORY_LABEL } from '@/lib/post-categories';
import { getArchiveData } from '@/lib/archive';
import { getPostBadgeMetadata } from '@/lib/post-badges.server';
import { groupPostsByCategory, sortCategoriesByCount } from '@/lib/blog-grouping';
import {
  createArchivePageMetadata,
  createCollectionSchema,
  getJsonLdScriptProps,
} from '@/lib/metadata';
import { AUTHOR_NAME, SITE_URL } from '@/lib/site-config';
import { teamMembers } from '@/data/team';
import { headers } from 'next/headers';
import { getMultiplePostViews } from '@/lib/views.server';
import {
  CONTAINER_WIDTHS,
  CONTAINER_PADDING,
  SPACING,
  MOBILE_SAFE_PADDING,
} from '@/lib/design-tokens';
import { ArchivePagination, ArchiveHero, PageLayout } from '@/components/layouts';
import {
  BlogSearchAnalytics,
  BlogSidebarWrapper,
  BlogLayoutManager,
  BlogLayoutWrapper,
  MobileFilterBar,
  BlogListSkeleton,
  ModernBlogGrid,
  FeedDropdown,
  FeaturedPostsSection,
} from '@/components/blog';
import { PostList } from '@/components/blog/client';
import { DynamicBlogContent } from '@/components/blog/server';
import { ViewToggle, SmoothScrollToHash } from '@/components/common';

// Force dynamic rendering - don't attempt to prerender during build
// This page uses headers() for CSP nonce which requires runtime
export const dynamic = 'force-dynamic';

const pageTitle = 'Blog';
const pageDescription =
  'Blog posts on software development, cybersecurity, emerging technologies, and more.';
const POSTS_PER_PAGE = 12;

/**
 * Wrapper for ModernBlogGrid that fetches view counts
 * Similar pattern to DynamicBlogContent but simplified for modern cards
 */
async function ModernBlogGridWrapper({
  posts,
  latestSlug,
  hottestSlug,
  query,
  sortedArchiveData,
}: {
  posts: Post[];
  latestSlug?: string;
  hottestSlug?: string;
  query: string;
  sortedArchiveData: any;
}) {
  // Fetch view counts for all posts
  const postIds = posts.map((post) => post.id);
  const viewCounts = await getMultiplePostViews(postIds);

  return (
    <div className={SPACING.section}>
      <ModernBlogGrid
        posts={posts}
        latestSlug={latestSlug}
        hottestSlug={hottestSlug}
        searchQuery={query}
        variant="elevated"
      />

      {/* Pagination */}
      {sortedArchiveData.totalPages > 1 && (
        <div className="mt-12">
          <ArchivePagination
            currentPage={sortedArchiveData.currentPage}
            totalPages={sortedArchiveData.totalPages}
            hasPrevPage={sortedArchiveData.currentPage > 1}
            hasNextPage={sortedArchiveData.currentPage < sortedArchiveData.totalPages}
          />
        </div>
      )}
    </div>
  );
}

type BlogFilterParams = {
  selectedCategory: string;
  selectedTags: string[];
  selectedAuthor: string;
  readingTime: string;
  dateRange: string;
  showArchived: boolean;
  showDrafts: boolean;
};

/**
 * Apply all blog post filters in sequence. Returns the final filtered list.
 */
function applyBlogFilters(allPosts: Post[], params: BlogFilterParams): Post[] {
  const { selectedCategory, selectedTags, selectedAuthor, readingTime, dateRange, showArchived, showDrafts } = params;
  const now = new Date();

  // Archived / draft guards
  const withArchived = showArchived
    ? allPosts.filter((p) => p.archived)
    : allPosts.filter((p) => !p.archived);

  const withCategory = selectedCategory
    ? withArchived.filter((p) => p.category && p.category.toLowerCase() === selectedCategory)
    : withArchived;

  const withDrafts = showDrafts
    ? withCategory.filter((p) => p.draft)
    : withCategory;

  // Date range filter
  const withDate =
    dateRange !== 'all'
      ? withDrafts.filter((p) => {
          const postDate = new Date(p.publishedAt);
          const daysDiff = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
          if (dateRange === '30d') return daysDiff <= 30;
          if (dateRange === '90d') return daysDiff <= 90;
          if (dateRange === 'year') return postDate.getFullYear() === now.getFullYear();
          return true;
        })
      : withDrafts;

  // Reading time filter
  const withReadingTime = readingTime
    ? withDate.filter((p) => {
        const minutes = p.readingTime.minutes;
        if (readingTime === 'quick') return minutes <= 5;
        if (readingTime === 'medium') return minutes > 5 && minutes <= 15;
        if (readingTime === 'deep') return minutes > 15;
        return true;
      })
    : withDate;

  // Tag filter (multi-tag AND logic)
  const withTags =
    selectedTags.length > 0
      ? withReadingTime.filter((p) =>
          selectedTags.every((tag) => p.tags.some((t) => t.toLowerCase() === tag))
        )
      : withReadingTime;

  // Author filter
  const withAuthor = selectedAuthor
    ? withTags.filter((p) => {
        const postAuthors = p.authors || ['dcyfr'];
        return postAuthors.includes(selectedAuthor);
      })
    : withTags;

  return withAuthor;
}

export const metadata: Metadata = {
  ...createArchivePageMetadata({
    title: pageTitle,
    description: pageDescription,
    path: '/blog',
  }),
  alternates: {
    types: {
      'application/rss+xml': [
        {
          url: `${SITE_URL}/blog/rss.xml`,
          title: `${SITE_URL} - Blog (RSS)`,
        },
      ],
      'application/atom+xml': [
        {
          url: `${SITE_URL}/blog/feed`,
          title: `${SITE_URL} - Blog (Atom)`,
        },
      ],
      'application/feed+json': [
        {
          url: `${SITE_URL}/blog/feed.json`,
          title: `${SITE_URL} - Blog (JSON Feed)`,
        },
      ],
    },
  },
};

// Enable Partial Prerendering for faster initial load with dynamic filters
export const experimental_ppr = true;

interface BlogPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  // Get nonce from proxy for CSP
  const nonce = (await headers()).get('x-nonce') || '';

  // Resolve search parameters
  const resolvedParams = (await searchParams) ?? {};
  const getParam = (key: string) => {
    const value = resolvedParams[key];
    return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
  };

  // A/B test parameter for modern cards
  const modern = getParam('modern') === 'true';

  // Support category filter (primary classification - lowercase in URL)
  const categoryParam = getParam('category');
  const selectedCategory = categoryParam ? categoryParam.toLowerCase() : '';

  // Support multiple tags (comma-separated, case-insensitive)
  const tagParam = getParam('tag');
  const selectedTags = tagParam
    ? tagParam
        .split(',')
        .filter(Boolean)
        .map((t) => t.toLowerCase())
    : [];

  // Support author filter
  const authorParam = getParam('author');
  const selectedAuthor = authorParam || '';

  const query = getParam('q');
  const readingTime = getParam('readingTime');
  const sortBy = getParam('sortBy') || 'newest';
  const dateRange = getParam('dateRange') || 'all';
  const showArchived = getParam('showArchived') === 'true';
  const showDrafts = getParam('showDrafts') === 'true' && process.env.NODE_ENV === 'development';
  const layoutParam = getParam('layout');
  const layout = ['grid', 'list', 'magazine', 'compact', 'grouped'].includes(layoutParam)
    ? (layoutParam as 'grid' | 'list' | 'magazine' | 'compact' | 'grouped')
    : 'magazine';

  // Apply all filters
  const filteredPosts = applyBlogFilters(posts, {
    selectedCategory,
    selectedTags,
    selectedAuthor,
    readingTime,
    dateRange,
    showArchived,
    showDrafts,
  });

  // Use Archive Pattern for filtering, sorting, pagination (without tag filter)
  const archiveData = getArchiveData<Post>(
    {
      items: filteredPosts,
      searchFields: ['title', 'summary', 'body'],
      tagField: 'tags',
      dateField: 'publishedAt',
      itemsPerPage: POSTS_PER_PAGE,
    },
    {
      search: query,
      page: getParam('page'),
    }
  );

  // NOTE: View count fetching and popularity sorting moved to DynamicBlogContent
  // This keeps the static shell rendering fast for PPR

  // For non-popularity sorts, we can still sort here
  let sortedItems = archiveData.allFilteredItems;
  if (sortBy === 'oldest') {
    sortedItems = [...archiveData.allFilteredItems].sort((a, b) => {
      return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
    });
  }
  // "newest" is already the default sort from archiveData
  // "popular" sort will be handled in DynamicBlogContent after fetching view counts

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

  // Get badge metadata (latest and hottest posts)
  const { latestSlug, hottestSlug } = await getPostBadgeMetadata(posts);

  // Group posts by category for grouped layout
  const groupedPosts = groupPostsByCategory(sortedArchiveData.allFilteredItems);
  const sortedCategories = sortCategoriesByCount(groupedPosts);

  // Transform availableTags to include counts and sort by count (highest first)
  const availableTagsWithCounts = sortedArchiveData.availableTags
    .map((tag) => ({
      tag,
      count: sortedArchiveData.allFilteredItems.filter((post) => post.tags.includes(tag)).length,
    }))
    .sort((a, b) => b.count - a.count);

  // Get available categories from all posts (for filter UI)
  // Use centralized category label mapping as single source of truth
  const categoryDisplayMap = POST_CATEGORY_LABEL;

  // Filter categories based on currently filtered posts (like topics do)
  // Only show categories that have posts in the current filtered result set
  const availableCategories = Array.from(
    new Set(
      sortedArchiveData.allFilteredItems
        .map((p) => p.category)
        .filter((c): c is NonNullable<typeof c> => !!c)
    )
  ).sort((a, b) => a.localeCompare(b));

  // Check if filters are active for empty state
  const hasActiveFilters = Boolean(
    query ||
    selectedCategory ||
    selectedTags.length > 0 ||
    readingTime ||
    sortBy !== 'newest' ||
    dateRange !== 'all' ||
    selectedAuthor ||
    showArchived ||
    showDrafts
  );
  const shouldShowFeaturedSection = true;

  // Create serializable authors list for client component (without icon objects)
  const serializableAuthors = teamMembers.map((author) => ({
    id: author.id,
    name: author.name,
    avatarImagePath: author.avatarImagePath,
  }));

  // Exclude featured posts from main list only when featured section is shown
  const mainListPosts = shouldShowFeaturedSection
    ? sortedArchiveData.items.filter((p) => !p.featured)
    : sortedArchiveData.items;

  // JSON-LD structured data
  const collectionTitle = selectedTags.length > 0 ? `Blog - ${selectedTags.join(', ')}` : pageTitle;
  const collectionDescription =
    selectedTags.length > 0
      ? `Articles tagged with "${selectedTags.join('", "')}"`
      : pageDescription;

  const jsonLd = createCollectionSchema({
    name: collectionTitle,
    description: collectionDescription,
    url: `${SITE_URL}/blog`,
    items: sortedArchiveData.allFilteredItems.map((post) => ({
      name: post.title,
      description: post.summary,
      url: `${SITE_URL}/blog/${post.slug}`,
      datePublished: new Date(post.publishedAt),
      author: AUTHOR_NAME,
    })),
  });

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />
      <SmoothScrollToHash />

      {/* Track search and filter analytics */}
      <BlogSearchAnalytics
        query={query}
        tags={selectedTags}
        resultsCount={sortedArchiveData.totalItems}
      />

      {/* Layout preference manager */}
      <BlogLayoutManager />

      {/* Hero section with Feed dropdown */}
      <ArchiveHero
        variant="full"
        title={pageTitle}
        description={pageDescription}
        stats={`${sortedArchiveData.totalItems} ${sortedArchiveData.totalItems === 1 ? 'article' : 'articles'} across ${sortedArchiveData.availableTags.length} ${sortedArchiveData.availableTags.length === 1 ? 'topic' : 'topics'}`}
        actions={<FeedDropdown feedType="blog" />}
        align="center"
      />

      {/* Blog layout with sidebar on desktop */}
      <div
        className={`mx-auto ${CONTAINER_WIDTHS.archive} ${CONTAINER_PADDING} ${MOBILE_SAFE_PADDING} ${SPACING.section}`}
      >
        {/* Featured posts section (full width, only when no filters active) */}
        {shouldShowFeaturedSection && !hasActiveFilters && (
          <FeaturedPostsSection posts={featuredPosts} />
        )}

        {/* Main grid: Sidebar + Content */}
        <BlogLayoutWrapper>
          {/* Sidebar (desktop only) - positioned on left, toggled via 'f' key */}
          <BlogSidebarWrapper
            selectedCategory={selectedCategory}
            selectedTags={selectedTags}
            readingTime={readingTime}
            categoryList={availableCategories}
            categoryDisplayMap={categoryDisplayMap}
            tagList={availableTagsWithCounts}
            authors={serializableAuthors}
            selectedAuthor={selectedAuthor}
            showArchived={showArchived}
            showDrafts={showDrafts}
            query={query}
            sortBy={sortBy}
            dateRange={dateRange}
            totalResults={sortedArchiveData.totalItems}
            totalPosts={posts.length}
          />

          {/* Main content area with Suspense for PPR */}
          <Suspense fallback={<BlogListSkeleton layout={layout} itemCount={3} />}>
            {modern ? (
              <ModernBlogGridWrapper
                posts={mainListPosts}
                latestSlug={latestSlug ?? undefined}
                hottestSlug={hottestSlug ?? undefined}
                query={query}
                sortedArchiveData={sortedArchiveData}
              />
            ) : (
              <DynamicBlogContent
                sortedArchiveData={sortedArchiveData}
                mainListPosts={mainListPosts}
                latestSlug={latestSlug ?? undefined}
                hottestSlug={hottestSlug ?? undefined}
                selectedCategory={selectedCategory}
                selectedTags={selectedTags}
                readingTime={readingTime}
                availableCategories={availableCategories}
                categoryDisplayMap={categoryDisplayMap}
                availableTagsWithCounts={availableTagsWithCounts}
                query={query}
                sortBy={sortBy}
                dateRange={dateRange}
                layout={layout}
                hasActiveFilters={hasActiveFilters}
                groupedCategories={layout === 'grouped' ? sortedCategories : undefined}
              />
            )}
          </Suspense>
        </BlogLayoutWrapper>
      </div>
    </PageLayout>
  );
}
