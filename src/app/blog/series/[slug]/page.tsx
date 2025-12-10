import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { postsBySeries, allSeriesNames } from "@/data/posts";
import { PageLayout } from "@/components/layouts";
import { SeriesHeader, PostList } from "@/components/blog";
import { SITE_TITLE_PLAIN, SITE_URL, getOgImageUrl, getTwitterImageUrl } from "@/lib/site-config";
import { CONTAINER_WIDTHS, CONTAINER_PADDING, SPACING } from "@/lib/design-tokens";

/**
 * Generate static paths for all series at build time
 */
export async function generateStaticParams() {
  return allSeriesNames.map((seriesName) => ({
    slug: seriesName.toLowerCase().replace(/\s+/g, "-"),
  }));
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
  const seriesName = allSeriesNames.find(
    name => name.toLowerCase().replace(/\s+/g, "-") === slug
  );
  
  if (!seriesName) return {};
  
  const title = `${seriesName} Series`;
  const description = `All posts in the ${seriesName} series`;
  
  return {
    title,
    description,
    openGraph: {
      title: `${title}`,
      description,
      url: `${SITE_URL}/blog/series/${slug}`,
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
      images: [getTwitterImageUrl(title, description)],
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
  const seriesName = allSeriesNames.find(
    (name) => name.toLowerCase().replace(/\s+/g, "-") === slug
  );

  if (!seriesName) {
    notFound();
  }

  const seriesPosts = postsBySeries[seriesName] || [];

  if (seriesPosts.length === 0) {
    notFound();
  }

  // Calculate total reading time for all posts in series
  const totalReadingTime = seriesPosts.reduce((sum, post) => {
    return sum + post.readingTime.minutes;
  }, 0);

  return (
    <PageLayout>
      <div
        className={`mx-auto ${CONTAINER_WIDTHS.archive} ${CONTAINER_PADDING}`}
      >
        <SeriesHeader
          name={seriesName}
          postCount={seriesPosts.length}
          totalMinutes={Math.ceil(totalReadingTime)}
        />

        <div className={SPACING.section}>
          <PostList
            posts={seriesPosts}
            layout="list"
            emptyMessage="No posts found in this series."
          />
        </div>
      </div>
    </PageLayout>
  );
}
