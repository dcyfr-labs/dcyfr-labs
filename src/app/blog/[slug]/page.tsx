import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { posts, postsBySeries } from "@/data/posts";
import { getPostByAnySlug } from "@/lib/blog";
import { SITE_URL, AUTHOR_NAME } from "@/lib/site-config";
import "katex/dist/katex.min.css"; // KaTeX styles for math rendering in blog posts
import { getPostViews, getMultiplePostViews } from "@/lib/views";
import { getPostShares } from "@/lib/shares";
import { extractHeadings } from "@/lib/toc";
import { headers } from "next/headers";
import { getArticleData } from "@/lib/article";
import { CONTAINER_WIDTHS } from "@/lib/design-tokens";
import {
  createArticlePageMetadata,
  createArticleSchema,
  createBreadcrumbSchema,
  getJsonLdScriptProps
} from "@/lib/metadata";
import { ArticleLayout, ArticleHeader, ArticleFooter } from "@/components/layouts";
import {
  BlogPostSidebar,
  SeriesNavigation,
  PostHeroImage,
  BlogAnalyticsTracker,
  SidebarVisibilityProvider,
  HideWhenSidebarVisible,
} from "@/components/blog";
import {
  MDX,
  RelatedPosts,
  SmoothScrollToHash,
  TableOfContents,
} from "@/components/common";
import { Breadcrumbs } from "@/components/navigation";
import { ReadingProgress } from "@/components/features/reading-progress";
import { ShareButtons } from "@/components/features/sharing/share-buttons";
import { LazyGiscusComments } from "@/components/features/comments/lazy-giscus-comments";
import { ViewTracker } from "@/components/features/view-tracker";
import { PostBadges } from "@/components/blog";

// Enable Incremental Static Regeneration with 1 hour revalidation
export const revalidate = 3600; // 1 hour in seconds

// Pre-generate all blog post pages at build time
export async function generateStaticParams() {
  const allParams = [];
  
  // Add current slugs
  for (const post of posts) {
    allParams.push({ slug: post.slug });
  }
  
  // Add previous slugs for redirect pages
  for (const post of posts) {
    if (post.previousSlugs) {
      for (const oldSlug of post.previousSlugs) {
        allParams.push({ slug: oldSlug });
      }
    }
  }
  
  return allParams;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = getPostByAnySlug(slug, posts);
  
  if (!result) return {};
  
  const post = result.post;
  
  // Use hero image for OG if available
  const heroImageUrl = post.image?.url ? `${SITE_URL}${post.image.url}` : undefined;
  
  return createArticlePageMetadata({
    title: post.title,
    description: post.summary,
    path: `/blog/${post.slug}`,
    publishedAt: new Date(post.publishedAt),
    modifiedAt: post.updatedAt ? new Date(post.updatedAt) : undefined,
    author: AUTHOR_NAME,
    keywords: post.tags,
    image: heroImageUrl,
    imageWidth: post.image?.width,
    imageHeight: post.image?.height,
    imageAlt: post.image?.alt,
  });
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = getPostByAnySlug(slug, posts);
  
  if (!result) {
    notFound();
  }
  
  const { post, needsRedirect, canonicalSlug } = result;
  
  // If this is an old slug, redirect to the current one
  if (needsRedirect) {
    redirect(`/blog/${canonicalSlug}`);
  }
  
  // Get nonce from proxy for CSP
  const nonce = (await headers()).get("x-nonce") || "";
  
  // Use Article Pattern for navigation and related posts
  const articleData = getArticleData({
    item: post,
    allItems: posts,
    relatedFields: ['tags'],
    idField: 'slug',
    dateField: 'publishedAt',
    maxRelated: 3,
  });
  
  // Get view/share counts (blog-specific, not in Article Pattern)
  const viewCount = await getPostViews(post.id);
  const shareCount = await getPostShares(post.id);
  
  // Get view counts and determine latest/hottest posts (blog-specific)
  // Use post IDs for view lookups, then map back to slugs
  const postIdToSlug = new Map(posts.map(p => [p.id, p.slug]));
  const viewMap = await getMultiplePostViews(posts.map(p => p.id));
  let hottestSlug: string | null = null;
  let maxViews = 0;
  viewMap.forEach((views, postId) => {
    if (views > maxViews) {
      maxViews = views;
      hottestSlug = postIdToSlug.get(postId) ?? null;
    }
  });
  
  const latestPost = [...posts]
    .filter(p => !p.archived && !p.draft)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))[0];
  
  // Get series posts if this post is part of a series
  const seriesPosts = post.series ? postsBySeries[post.series.name] ?? [] : [];
  
  // Extract headings for table of contents
  const headings = extractHeadings(post.body);
  
  // JSON-LD structured data for SEO
  const articleSchema = createArticleSchema({
    title: post.title,
    description: post.summary,
    url: `${SITE_URL}/blog/${post.slug}`,
    publishedAt: new Date(post.publishedAt),
    modifiedAt: post.updatedAt ? new Date(post.updatedAt) : undefined,
    author: AUTHOR_NAME,
    image: post.image?.url ? `${SITE_URL}${post.image.url}` : undefined,
    tags: post.tags,
  });
  
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Blog", url: `${SITE_URL}/blog` },
    { name: post.title, url: `${SITE_URL}/blog/${post.slug}` },
  ]);
  
  // Combine schemas in a graph
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [articleSchema, breadcrumbSchema],
  };

  return (
    <>
      {/* Client-side view tracking with anti-spam protection */}
      <ViewTracker postId={post.id} />

      {/* Vercel Analytics custom events tracking */}
      <BlogAnalyticsTracker
        post={{
          id: post.id,
          slug: post.slug,
          title: post.title,
          tags: post.tags,
          readingTime: post.readingTime.minutes,
        }}
      />

      <ReadingProgress />
      <SmoothScrollToHash />
      {/* FAB menu disabled */}
      {/* <BlogFABMenu headings={headings} /> */}
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />

      {/* Mobile/Tablet ToC - FAB menu enabled */}
      <div className="lg:hidden">
        <TableOfContents headings={headings} slug={post.slug} />
      </div>

      {/* Desktop Layout: Sidebar + Content */}
      <div className={`container ${CONTAINER_WIDTHS.archive} mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 pb-8`}>
        <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
          {/* Left Sidebar (desktop only) */}
          <BlogPostSidebar
            headings={headings}
            slug={post.slug}
            postTitle={post.title}
            metadata={{
              publishedAt: new Date(post.publishedAt),
              readingTime: post.readingTime.text,
              viewCount: viewCount ?? undefined,
              tags: post.tags,
              category: post.category,
              isDraft: post.draft,
              isArchived: post.archived,
              isLatest: latestPost?.slug === post.slug,
              isHot: hottestSlug === post.slug,
            }}
            series={post.series}
            seriesPosts={seriesPosts}
            relatedPosts={articleData.relatedItems}
          />

          {/* Main Content */}
          <SidebarVisibilityProvider>
          <div className="min-w-0">
            <ArticleLayout
              useProseWidth={false}
              className="py-0! max-w-none px-0"
            >
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Blog", href: "/blog" },
                  { label: post.title },
                ]}
              />

              <ArticleHeader
                title={post.title}
                subtitle={post.subtitle}
              >
                {/* Metadata shown only when sidebar is hidden */}
                <HideWhenSidebarVisible>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-4">
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <span aria-hidden="true">·</span>
                    <span>{post.readingTime.text}</span>
                    {typeof viewCount === "number" && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{viewCount.toLocaleString()} {viewCount === 1 ? "view" : "views"}</span>
                      </>
                    )}
                  </div>
                </HideWhenSidebarVisible>
              </ArticleHeader>

              {/* Series navigation */}
              {post.series && seriesPosts.length > 0 && (
                <SeriesNavigation
                  currentPost={post}
                  seriesPosts={seriesPosts}
                />
              )}

              <div className="prose my-8">
                <MDX source={post.body} />
              </div>


              <ArticleFooter>
                {/* Status badges and category - hidden when sidebar is visible */}
                <HideWhenSidebarVisible>
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    <PostBadges post={post} isLatestPost={latestPost?.slug === post.slug} isHotPost={hottestSlug === post.slug} showCategory={true} />
                  </div>
                </HideWhenSidebarVisible>

                {/* Tags section - hidden when sidebar is visible */}
                <HideWhenSidebarVisible>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                      <span className="text-sm text-muted-foreground">Tagged:</span>
                      {post.tags.map((tag: string) => (
                        <a key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer">
                            {tag}
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </HideWhenSidebarVisible>

                {/* Share section - hidden when sidebar is visible */}
                <HideWhenSidebarVisible>
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Share this blog post</h2>
                    <ShareButtons
                      url={`${SITE_URL}/blog/${post.slug}`}
                      title={post.title}
                      postId={post.id}
                      initialShareCount={shareCount ?? 0}
                    />
                  </div>
                </HideWhenSidebarVisible>
                
                {/* Related posts section */}
                <RelatedPosts
                  posts={articleData.relatedItems}
                  currentSlug={post.slug}
                />
              </ArticleFooter>

              {/* Comments section - hidden for draft posts */}
              {!post.draft && <LazyGiscusComments />}
            </ArticleLayout>
          </div>
          </SidebarVisibilityProvider>
        </div>
      </div>
    </>
  );
}
