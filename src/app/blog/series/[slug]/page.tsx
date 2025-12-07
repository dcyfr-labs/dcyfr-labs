import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { postsBySeries, allSeriesNames } from "@/data/posts";
import { Badge } from "@/components/ui/badge";
import { PostList } from "@/components/blog/post/post-list";
import { BookOpen } from "lucide-react";
import { SITE_TITLE_PLAIN, SITE_URL, getOgImageUrl, getTwitterImageUrl } from "@/lib/site-config";
import { CONTAINER_WIDTHS, CONTAINER_VERTICAL_PADDING, CONTAINER_PADDING, TYPOGRAPHY } from "@/lib/design-tokens";

/**
 * Generate static paths for all series at build time
 */
export async function generateStaticParams() {
  return allSeriesNames.map((seriesName) => ({
    slug: seriesName.toLowerCase().replace(/\s+/g, "-"),
  }));
}

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
      title: `${title} — ${SITE_TITLE_PLAIN}`,
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
          alt: `${title} — ${SITE_TITLE_PLAIN}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${SITE_TITLE_PLAIN}`,
      description,
      images: [getTwitterImageUrl(title, description)],
    },
  };
}

/**
 * Series page - displays all posts in a series
 */
export default async function SeriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Find series by slug
  const seriesName = allSeriesNames.find(
    name => name.toLowerCase().replace(/\s+/g, "-") === slug
  );
  
  if (!seriesName) {
    notFound();
  }
  
  const seriesPosts = postsBySeries[seriesName] ?? [];
  
  if (seriesPosts.length === 0) {
    notFound();
  }

  return (
    <div className={`mx-auto ${CONTAINER_WIDTHS.archive} ${CONTAINER_VERTICAL_PADDING} ${CONTAINER_PADDING}`}>
      {/* Page header */}
      <header className="space-y-4 mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/blog" className="hover:text-foreground transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span>Series</span>
        </div>
        
        <div className="flex items-start gap-4">
          <BookOpen className="h-8 w-8 mt-1 text-primary flex-shrink-0" />
          <div className="flex-1">
            <h1 className={TYPOGRAPHY.h1.hero}>
              {seriesName}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mt-2">
              A {seriesPosts.length}-part series exploring {seriesName.toLowerCase()}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="secondary">
            {seriesPosts.length} {seriesPosts.length === 1 ? "post" : "posts"}
          </Badge>
          <Badge variant="outline">
            {seriesPosts.reduce((acc, p) => acc + p.readingTime.minutes, 0)} min total
          </Badge>
        </div>
      </header>

      {/* Series posts list - ordered by series.order */}
      <section className="space-y-4">
        <h2 className="sr-only">Posts in this series</h2>
        {seriesPosts.map((post, index) => (
          <div key={post.slug} className="relative">
            <div className="absolute left-0 top-0 -ml-12 hidden md:block">
              <Badge variant="outline" className="min-w-10 justify-center">
                {index + 1}
              </Badge>
            </div>
            <PostList 
              posts={[post]}
              titleLevel="h3"
            />
          </div>
        ))}
      </section>

      {/* Navigation back to blog */}
      <div className="mt-12 pt-8 border-t">
        <Link
          href="/blog"
          className="text-sm text-primary hover:underline underline-offset-4"
        >
          ← Back to all posts
        </Link>
      </div>
    </div>
  );
}
