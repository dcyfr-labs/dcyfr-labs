import type { Metadata } from "next";
import { allSeries } from "@/data/posts";
import { PageLayout } from "@/components/layouts";
import { ArchiveHero } from "@/components/layouts/archive-hero";
import { SeriesCard, SeriesAnalyticsTracker } from "@/components/blog";
import { SITE_TITLE_PLAIN, SITE_URL, getOgImageUrl } from "@/lib/site-config";
import { CONTAINER_WIDTHS, CONTAINER_PADDING, GRID_PATTERNS, SPACING, MOBILE_SAFE_PADDING } from "@/lib/design-tokens";

/**
 * Revalidate every 24 hours for series index page
 */
export const revalidate = 86400;

/**
 * Generate metadata for series index page
 */
export async function generateMetadata(): Promise<Metadata> {
  const title = "Blog Series";
  const description = "Explore multi-part content series organized by topic.. Deep dives into development, security, performance, and more.";

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_TITLE_PLAIN}`,
      description,
      url: `${SITE_URL}/blog/series`,
      siteName: SITE_TITLE_PLAIN,
      type: "website",
      images: [
        {
          url: getOgImageUrl(title, description),
          width: 1200,
          height: 630,
          type: "image/png",
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_TITLE_PLAIN}`,
      description,
      images: [getOgImageUrl(title, description)],
    },
  };
}

/**
 * Series Index Page
 *
 * Displays all blog series in a responsive grid layout with series cards.
 * Each card shows:
 * - Series name and icon
 * - Description (auto-generated if not provided)
 * - Post count and total reading time
 * - Color-coded theming
 * - Link to series archive page
 *
 * Features:
 * - Static generation with 24-hour revalidation
 * - SEO optimization with Open Graph and Twitter Card
 * - Responsive grid (1 col mobile → 2 col tablet → 3 col desktop)
 * - Empty state handling
 */
export default function SeriesIndexPage() {
  // Sort series by latest post date (most recently updated first)
  const sortedSeries = [...allSeries].sort((a, b) => {
    const dateA = new Date(a.latestPost.publishedAt).getTime();
    const dateB = new Date(b.latestPost.publishedAt).getTime();
    return dateB - dateA;
  });

  // Calculate total posts across all series
  const totalPosts = sortedSeries.reduce((sum, series) => sum + series.postCount, 0);

  return (
    <PageLayout>
      {/* Analytics tracking */}
      <SeriesAnalyticsTracker seriesCount={sortedSeries.length} />

      {/* Hero section with medium background */}
      <ArchiveHero
        variant="medium"
        title="Blog Series"
        description="Explore multi-part content series organized by topic."
        stats={`${sortedSeries.length} ${sortedSeries.length === 1 ? 'series' : 'series'} • ${totalPosts} total ${totalPosts === 1 ? 'post' : 'posts'}`}
      />

      {/* Content section with archive-width container */}
      <div className={`mx-auto ${CONTAINER_WIDTHS.archive} ${CONTAINER_PADDING} ${MOBILE_SAFE_PADDING}`}>
        {sortedSeries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No series found. Check back soon!</p>
          </div>
        ) : (
          <div className={SPACING.section}>
            <div className={GRID_PATTERNS.three}>
              {sortedSeries.map((series, index) => (
                <SeriesCard key={series.slug} series={series} position={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
