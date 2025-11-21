import type { Metadata } from "next";
import { posts, type Post } from "@/data/posts";
import { PostList } from "@/components/post-list";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogSearchAnalytics } from "@/components/blog-search-analytics";
import { ArchiveLayout } from "@/components/layouts/archive-layout";
import { ArchivePagination } from "@/components/layouts/archive-pagination";
import { getArchiveData } from "@/lib/archive";
import { getPostBadgeMetadata } from "@/lib/post-badges";
import { createArchivePageMetadata, createCollectionSchema, getJsonLdScriptProps } from "@/lib/metadata";
import { AUTHOR_NAME, SITE_URL } from "@/lib/site-config";
import { headers } from "next/headers";

const BlogFilters = dynamic(() => import("@/components/blog-filters").then(mod => ({ default: mod.BlogFilters })), {
  loading: () => (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <div className="flex gap-2 flex-wrap">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  ),
});

const pageTitle = "Blog";
const pageDescription = "Articles on web development, cybersecurity, artificial intelligence, and more.";
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
  
  // Support multiple tags (comma-separated)
  const tagParam = getParam("tag");
  const selectedTags = tagParam ? tagParam.split(",").filter(Boolean) : [];
  const query = getParam("q");
  const readingTime = getParam("readingTime");
  const layoutParam = getParam("layout");
  const layout = (layoutParam === "magazine" || layoutParam === "default") ? layoutParam : "grid";
  
  // Apply reading time filter (custom filter not in Archive pattern)
  const postsWithReadingTimeFilter = readingTime
    ? posts.filter((post) => {
        const minutes = post.readingTime.minutes;
        if (readingTime === "quick") return minutes <= 5;
        if (readingTime === "medium") return minutes > 5 && minutes <= 15;
        if (readingTime === "deep") return minutes > 15;
        return true;
      })
    : posts;
  
  // Apply multiple tag filter manually before Archive pattern
  const postsWithTagFilter = selectedTags.length > 0
    ? postsWithReadingTimeFilter.filter((post) =>
        selectedTags.every((tag) => post.tags.includes(tag))
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
  
  // Get badge metadata (latest and hottest posts)
  const { latestSlug, hottestSlug } = await getPostBadgeMetadata(posts);
  
  // JSON-LD structured data
  const collectionTitle = selectedTags.length > 0 ? `Blog - ${selectedTags.join(", ")}` : pageTitle;
  const collectionDescription = selectedTags.length > 0 
    ? `Articles tagged with "${selectedTags.join('", "')}"` 
    : pageDescription;
  
  const jsonLd = createCollectionSchema({
    name: collectionTitle,
    description: collectionDescription,
    url: `${SITE_URL}/blog`,
    items: archiveData.allFilteredItems.map(post => ({
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
        resultsCount={archiveData.totalItems}
      />
      
      <ArchiveLayout
        title={pageTitle}
        description={pageDescription}
        filters={
          <BlogFilters 
            selectedTags={selectedTags}
            readingTime={readingTime} 
            tagList={archiveData.availableTags}
            query={query}
          />
        }
        pagination={
          <ArchivePagination
            currentPage={archiveData.currentPage}
            totalPages={archiveData.totalPages}
            hasPrevPage={archiveData.currentPage > 1}
            hasNextPage={archiveData.currentPage < archiveData.totalPages}
          />
        }
      >
        <PostList 
          posts={archiveData.items}
          latestSlug={latestSlug ?? undefined}
          hottestSlug={hottestSlug ?? undefined}
          titleLevel="h2"
          layout={layout}
          emptyMessage="No posts found. Try adjusting your search or filters."
        />
      </ArchiveLayout>
    </>
  );
}
