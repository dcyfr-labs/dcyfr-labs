import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { posts, postsBySeries } from "@/data/posts";
import { getPostByAnySlug } from "@/lib/blog.server";
import { SITE_URL, AUTHOR_NAME } from "@/lib/site-config";
import "katex/dist/katex.min.css"; // KaTeX styles for math rendering in blog posts
import { extractHeadings } from "@/lib/toc";
import { headers } from "next/headers";
import { getArticleData } from "@/lib/article";
import {
  CONTAINER_WIDTHS,
  CONTAINER_PADDING,
  CONTAINER_VERTICAL_PADDING,
  SPACING,
  TYPOGRAPHY,
} from "@/lib/design-tokens";
import {
  createArticlePageMetadata,
  createArticleSchema,
  createBreadcrumbSchema,
  getJsonLdScriptProps,
} from "@/lib/metadata";
import {
  ArticleLayout,
  ArticleHeader,
  ArticleFooter,
} from "@/components/layouts";
import {
  BlogPostLayoutWrapper,
  CollapsibleBlogSidebar,
  SeriesNavigation,
  PostHeroImage,
  BlogAnalyticsTracker,
  SidebarVisibilityProvider,
  HideWhenSidebarVisible,
  ReadingProgressBar,
  AnchorExpansionWrapper,
} from "@/components/blog";
import {
  ViewCountDisplay,
  ViewCountSkeleton,
  BlogPostSidebarWrapper,
  getHottestPostSlug,
} from "@/components/blog/server";
import {
  MDX,
  FigureProvider,
  RelatedPosts,
  SmoothScrollToHash,
  TableOfContents,
  TableOfContentsSidebar,
  PostInteractions,
} from "@/components/common";
import { Breadcrumbs } from "@/components/navigation";
import { ArticleReadingProgress } from "@/components/app";
import { LazyGiscusComments } from "@/components/features";
import { ViewTracker } from "@/components/features";

// Enable Incremental Static Regeneration with 1 hour revalidation
export const revalidate = 3600; // 1 hour in seconds

// Enable Partial Prerendering for faster initial page load
// ISR keeps content fresh, PPR streams dynamic view counts and related posts
export const experimental_ppr = true;

// Pre-generate all blog post pages at build time
export async function generateStaticParams() {
  const allParams = [];

  // Add current slugs
  for (const post of posts) {
    allParams.push({ slug: post.slug });
  }

  // Add post IDs for redirect pages (e.g., /blog/post-20200107-04d94a8e → /blog/demo-markdown)
  for (const post of posts) {
    if (post.id !== post.slug) {
      allParams.push({ slug: post.id });
    }
  }

  // Add previous slugs for redirect pages
  for (const post of posts) {
    if (post.previousSlugs) {
      for (const oldSlug of post.previousSlugs) {
        allParams.push({ slug: oldSlug });
      }
    }
  }

  // Add previous IDs for redirect pages (analytics migration)
  for (const post of posts) {
    if (post.previousIds) {
      for (const oldId of post.previousIds) {
        allParams.push({ slug: oldId });
      }
    }
  }

  return allParams;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = getPostByAnySlug(slug, posts);

  if (!result) return {};

  const post = result.post;

  // Use hero image for OG if available
  const heroImageUrl = post.image?.url
    ? `${SITE_URL}${post.image.url}`
    : undefined;

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
    imageAlt: post.image?.caption ?? post.image?.alt,
  });
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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
    relatedFields: ["tags"],
    idField: "slug",
    dateField: "publishedAt",
    maxRelated: 3,
  });

  // Get hottest post slug (streams with PPR)
  const hottestSlug = await getHottestPostSlug(posts);

  const latestPost = [...posts]
    .filter((p) => !p.archived && !p.draft)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))[0];

  // Get series posts if this post is part of a series
  const seriesPosts = post.series
    ? (postsBySeries[post.series.name] ?? [])
    : [];

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
    <ArticleReadingProgress
      articleId={post.slug}
      title={post.title}
      readingTime={post.readingTime.minutes}
    >
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

      {/* Auto-expand collapsed components when navigating to anchor links */}
      <AnchorExpansionWrapper />

      <ReadingProgressBar />
      <SmoothScrollToHash />
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />

      {/* Desktop Layout: Three-column (Sidebar + Content + Empty Right) - DOM order optimized for accessibility */}
      <div
        className={`container ${CONTAINER_WIDTHS.archive} mx-auto ${CONTAINER_PADDING} pt-6 md:pt-8 lg:pt-36`}
      >
        <BlogPostLayoutWrapper>
          {/* Left Rail: Sidebar + Table of Contents (desktop only) */}
          <div className="hidden lg:block lg:order-1 relative space-y-8">
            <CollapsibleBlogSidebar>
              <BlogPostSidebarWrapper
                headings={headings}
                slug={post.slug}
                postId={post.id}
                authors={post.authors}
                postTitle={post.title}
                metadata={{
                  publishedAt: new Date(post.publishedAt),
                  updatedAt: post.updatedAt
                    ? new Date(post.updatedAt)
                    : undefined,
                  readingTime: post.readingTime.text,
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
            </CollapsibleBlogSidebar>
            <div className="sticky top-24">
              <TableOfContentsSidebar headings={headings} slug={post.slug} />
            </div>
          </div>

          {/* Center: Main Content (DOM order for accessibility/SEO) */}
          <SidebarVisibilityProvider>
            <div className="min-w-0 lg:order-2">
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
                  backgroundImage={
                    post.image
                      ? {
                          url: post.image.url,
                          alt: post.image.alt || `Hero image for ${post.title}`,
                          position:
                            (post.image.position === "background"
                              ? "center"
                              : post.image.position) || "center",
                          caption: post.image.caption,
                          credit: post.image.credit,
                          priority: post.featured || false, // Prioritize hero image loading for featured posts
                          hideHero: post.image.hideHero,
                        }
                      : undefined
                  }
                >
                  {/* Metadata shown only when sidebar is hidden 
                  <HideWhenSidebarVisible> */}
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
                    <Suspense fallback={<ViewCountSkeleton />}>
                      <ViewCountDisplay postId={post.id} />
                    </Suspense>
                  </div>
                  {/* </HideWhenSidebarVisible> */}
                </ArticleHeader>

                {/* Series navigation */}
                {post.series && seriesPosts.length > 0 && (
                  <SeriesNavigation
                    currentPost={post}
                    seriesPosts={seriesPosts}
                  />
                )}

                <div className="prose my-8">
                  <FigureProvider>
                    <MDX source={post.body} useFontContrast={true} />
                  </FigureProvider>
                </div>

                {/* Post interactions (like, bookmark, share) */}
                <div className="my-6">
                  <PostInteractions
                    contentId={post.slug}
                    contentType="post"
                    title={post.title}
                    description={post.summary}
                    href={`/blog/${post.slug}`}
                    variant="default"
                    showCounts={true}
                  />
                </div>

                <ArticleFooter>
                  {/* Related posts section */}
                  <RelatedPosts
                    posts={articleData.relatedItems}
                    currentSlug={post.slug}
                  />
                </ArticleFooter>

                {/* Comments section - hidden for draft posts */}
                {!post.draft && <LazyGiscusComments />}
              </ArticleLayout>

              {/* Mobile/Tablet ToC - positioned after content for better mobile UX */}
              <div className="lg:hidden mt-8">
                <TableOfContents headings={headings} slug={post.slug} />
              </div>
            </div>
          </SidebarVisibilityProvider>

          {/* Right Rail: Empty (reserved for future use)
          <div className="hidden xl:block xl:order-3 relative"> */}
          {/* Empty - reserved for future use 
          </div> */}
        </BlogPostLayoutWrapper>
      </div>
    </ArticleReadingProgress>
  );
}
