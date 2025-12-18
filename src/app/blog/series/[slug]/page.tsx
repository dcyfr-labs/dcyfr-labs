import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { allSeries, getSeriesByAnySlug } from "@/data/posts";
import { PageLayout, PageHero } from "@/components/layouts";
import { PostList, SeriesPageAnalyticsTracker } from "@/components/blog";
import { SITE_TITLE_PLAIN, SITE_URL, getOgImageUrl } from "@/lib/site-config";
import { CONTAINER_WIDTHS, CONTAINER_PADDING, SPACING } from "@/lib/design-tokens";

/**
 * Generate static paths for all series at build time
 * Includes both current and previous slugs for 301 redirects
 */
export async function generateStaticParams() {
  const allParams = [];

  // Add current slugs
  for (const series of allSeries) {
    allParams.push({ slug: series.slug });
  }

  // Add previous slugs for redirect pages
  for (const series of allSeries) {
    for (const post of series.posts) {
      if (post.series?.previousSlugs) {
        for (const oldSlug of post.series.previousSlugs) {
          allParams.push({ slug: oldSlug });
        }
      }
    }
  }

  return allParams;
}

/**
 * Revalidate every 24 hours for series pages
 * (regenerate on-demand if new posts are added to a series)
 */
export const revalidate = 86400;

/**
 * Generate metadata for series page
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;
  const result = getSeriesByAnySlug(slug);

  if (!result) return {};

  const { series } = result;
  const title = `${series.name} Series`;
  const description = series.description || `All posts in the ${series.name} series`;

  return {
    title,
    description,
    openGraph: {
      title: `${title}`,
      description,
      url: `${SITE_URL}/blog/series/${series.slug}`,
      siteName: SITE_TITLE_PLAIN,
      type: "website",
      images: [
        {
          url: getOgImageUrl(title, description),
          width: 1200,
          height: 630,
          type: "image/png",
          alt: `${title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title}`,
      description,
      images: [getOgImageUrl(title, description)],
    },
  };
}

/**
 * Series archive page - displays all posts in a series with metadata
 *
 * Features:
 * - Metadata generation with series info
 * - Series header with post count and reading time
 * - Chronologically ordered post list
 * - SEO optimization with Open Graph and Twitter Card
 */
export default async function SeriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = getSeriesByAnySlug(slug);

  if (!result) {
    notFound();
  }

  const { series, needsRedirect, canonicalSlug } = result;

  // If this is an old slug, redirect to the current one
  if (needsRedirect) {
    redirect(`/blog/series/${canonicalSlug}`);
  }

  return (
    <PageLayout>
      {/* Analytics tracking */}
      <SeriesPageAnalyticsTracker
        series={{
          slug: series.slug,
          name: series.name,
          postCount: series.postCount,
          totalReadingTime: series.totalReadingTime,
        }}
      />

      {/* Hero section with full-width background */}
      <PageHero
        variant="homepage"
        title={series.name}
        description={series.description}
        itemCount={series.postCount}
        fullWidth
      />

      {/* Content section with archive-width container */}
      <div className={`mx-auto ${CONTAINER_WIDTHS.archive} ${CONTAINER_PADDING}`}>
        <div className={SPACING.section}>
          <PostList
            posts={series.posts}
            layout="list"
            emptyMessage="No posts found in this series."
          />
        </div>
      </div>
    </PageLayout>
  );
}
