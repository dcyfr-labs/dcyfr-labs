import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { posts, postsBySeries } from "@/data/posts";
import { getPostByAnySlug } from "@/lib/blog";
import { SITE_URL, AUTHOR_NAME } from "@/lib/site-config";
import { MDX } from "@/components/mdx";
import "katex/dist/katex.min.css"; // KaTeX styles for math rendering in blog posts
import { getPostViews, getMultiplePostViews } from "@/lib/views";
import { getPostShares } from "@/lib/shares";
import { ReadingProgress } from "@/components/reading-progress";
import { RelatedPosts } from "@/components/related-posts";
import { TableOfContents } from "@/components/table-of-contents";
import { extractHeadings } from "@/lib/toc";
import { headers } from "next/headers";
import { ShareButtons } from "@/components/share-buttons";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SeriesNavigation } from "@/components/series-navigation";

const GiscusComments = dynamic(() => import("@/components/giscus-comments").then(mod => ({ default: mod.GiscusComments })), {
  loading: () => (
    <div className="space-y-2">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-24 w-full" />
    </div>
  ),
});
import { PostHeroImage } from "@/components/post-hero-image";
import { ViewTracker } from "@/components/view-tracker";
import { BlogAnalyticsTracker } from "@/components/blog-analytics-tracker";
import { ArticleLayout, ArticleHeader, ArticleFooter } from "@/components/layouts";
import { getArticleData } from "@/lib/article";
import { 
  createArticlePageMetadata,
  createArticleSchema,
  createBreadcrumbSchema,
  getJsonLdScriptProps 
} from "@/lib/metadata";

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
  const viewMap = await getMultiplePostViews(posts.map(p => p.slug));
  let hottestSlug: string | null = null;
  let maxViews = 0;
  viewMap.forEach((views, slug) => {
    if (views > maxViews) {
      maxViews = views;
      hottestSlug = slug;
    }
  });
  
  const latestPost = [...posts]
    .filter(p => !p.archived)
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
      {/* FAB menu disabled */}
      {/* <BlogFABMenu headings={headings} /> */}
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />
      
      {/* Table of Contents */}
      <TableOfContents headings={headings} slug={post.slug} />
      
      <ArticleLayout useProseWidth={false}>
          <Breadcrumbs items={[
            { label: "Home", href: "/" },
            { label: "Blog", href: "/blog" },
            { label: post.title }
          ]} />
          
          <ArticleHeader
            title={post.title}
            date={new Date(post.publishedAt)}
            metadata={`${post.readingTime.text}${typeof viewCount === "number" ? ` · ${viewCount.toLocaleString()} ${viewCount === 1 ? "view" : "views"}` : ""}`}
          />
          
          {/* Hero image - show after header if post has featured image */}
          {post.image && (
            <PostHeroImage
              image={post.image}
              title={post.title}
              priority={true}
            />
          )}
          
          {/* Series navigation - show after header if post is part of a series */}
          {post.series && seriesPosts.length > 0 && (
            <SeriesNavigation currentPost={post} seriesPosts={seriesPosts} />
          )}
          
          <div className="prose my-8">
            <MDX source={post.body} />
          </div>
          
          <ArticleFooter
            shareComponent={
              <ShareButtons
                url={`${SITE_URL}/blog/${post.slug}`}
                title={post.title}
                postId={post.id}
                initialShareCount={shareCount ?? 0}
              />
            }
            sources={post.sources?.map(s => ({ title: s.label, url: s.href }))}
            tags={post.tags}
            onTagClick={(tag) => `/blog?tag=${encodeURIComponent(tag)}`}
          >
            {/* Related posts section */}
            <RelatedPosts posts={articleData.relatedItems} currentSlug={post.slug} />
          </ArticleFooter>
          
          {/* Comments section - hidden for draft posts */}
          {!post.draft && <GiscusComments />}
        </ArticleLayout>
    </>
  );
}
