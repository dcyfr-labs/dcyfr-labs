import { getAllPosts } from "@/lib/blog";

// Re-export category types and labels from centralized file (client-safe)
export type { PostCategory } from "@/lib/post-categories";
export { POST_CATEGORY_LABEL } from "@/lib/post-categories";
import type { PostCategory } from "@/lib/post-categories";

export type PostImage = {
  url: string; // local path (e.g., "/blog/images/post-slug/hero.jpg") or external URL
  alt?: string; // optional alt text (falls back to caption or generated text when not provided)
  width?: number; // optional, for next/image optimization
  height?: number; // optional, maintains aspect ratio
  caption?: string; // optional, displayed below image
  credit?: string; // optional, photographer/source attribution
  position?: "top" | "left" | "right" | "background"; // list view placement hint
  hideHero?: boolean; // hide image in hero section on detail pages
  hideCard?: boolean; // hide image as background in list view cards
};

export type Post = {
  id: string; // stable permanent identifier (never changes, independent of slug)
  slug: string; // unique URL segment (active/current slug - can change)
  title: string;
  subtitle?: string; // optional subtitle displayed below title (alternative to em-dash in title)
  summary: string;
  publishedAt: string; // ISO string
  updatedAt?: string; // ISO string
  category?: PostCategory; // primary category for filtering
  tags: string[];
  featured?: boolean;
  archived?: boolean; // posts that are no longer updated
  draft?: boolean; // only visible in development
  body: string; // MDX content
  previousSlugs?: string[]; // old slugs that should 301 redirect to current slug
  previousIds?: string[]; // old IDs for analytics migration (auto-migrates Redis data)
  image?: PostImage; // optional featured image
  series?: {
    name: string; // series name (e.g., "React Hooks Deep Dive")
    order: number; // position in series (1-indexed)
    description?: string; // series summary (auto-generated from first post if not provided)
    icon?: string; // Lucide icon name (e.g., "Shield", "Rocket") or custom SVG path
    color?: string; // series color theme (see SERIES_COLORS in design-tokens.ts)
    previousSlugs?: string[]; // old series slugs for 301 redirects (e.g., ["old-series-name"])
  };
  authors?: string[]; // team member IDs (defaults to ["dcyfr"] if not specified)
  authorId?: string; // @deprecated - use authors instead (kept for backward compatibility)
  readingTime: {
    words: number;
    minutes: number;
    text: string;
  };
};

// Retrieve all posts from the file system
export const posts: Post[] = getAllPosts();

export const postsBySlug = Object.fromEntries(posts.map((post) => [post.slug, post])) as Record<string, Post>;

export const postTagCounts = posts.reduce<Record<string, number>>((acc, post) => {
  for (const tag of post.tags) {
    acc[tag] = (acc[tag] ?? 0) + 1;
  }
  return acc;
}, {});

export const allPostTags = Object.freeze(Object.keys(postTagCounts).sort());

export const postCategoryCounts = posts.reduce<Record<string, number>>((acc, post) => {
  if (post.category) {
    acc[post.category] = (acc[post.category] ?? 0) + 1;
  }
  return acc;
}, {});

export const allPostCategories = Object.freeze(Object.keys(postCategoryCounts).sort());

export const featuredPosts = Object.freeze(posts.filter((post) => post.featured));

// Group posts by series
const postsBySeriesUnsorted = posts.reduce<Record<string, Post[]>>((acc, post) => {
  if (post.series) {
    if (!acc[post.series.name]) {
      acc[post.series.name] = [];
    }
    acc[post.series.name].push(post);
  }
  return acc;
}, {});

// Sort posts within each series by order
Object.keys(postsBySeriesUnsorted).forEach(seriesName => {
  postsBySeriesUnsorted[seriesName].sort((a, b) => {
    const orderA = a.series?.order ?? 0;
    const orderB = b.series?.order ?? 0;
    return orderA - orderB;
  });
});

// Rebuild postsBySeries with sorted keys for consistency
export const postsBySeries: Record<string, Post[]> = {};
const sortedSeriesNames = Object.keys(postsBySeriesUnsorted).sort((a, b) => a.localeCompare(b));
sortedSeriesNames.forEach(seriesName => {
  postsBySeries[seriesName] = postsBySeriesUnsorted[seriesName];
});

// Export series names in sorted order for consistency
export const allSeriesNames = Object.freeze(sortedSeriesNames);

// ============================================================================
// SERIES METADATA
// ============================================================================

/**
 * Enhanced series metadata with computed values
 * Provides complete series information for index pages and navigation
 */
export type SeriesMetadata = {
  name: string; // series name
  slug: string; // URL-safe slug
  description: string; // auto-generated if not in frontmatter
  icon?: string; // Lucide icon name or custom SVG
  color: string; // color theme (falls back to 'default')
  postCount: number; // number of posts in series
  totalReadingTime: number; // total minutes across all posts
  posts: Post[]; // all posts in series (sorted by order)
  firstPost: Post; // first post in series
  latestPost: Post; // most recently published post
};

/**
 * Generate series metadata from posts
 * Auto-generates description from first post summary if not provided
 */
export const allSeries: SeriesMetadata[] = allSeriesNames.map((name) => {
  const seriesPosts = postsBySeries[name];
  const firstPost = seriesPosts[0];
  const latestPost = [...seriesPosts].sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )[0];

  return {
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    description: firstPost.series?.description || firstPost.summary,
    icon: firstPost.series?.icon,
    color: firstPost.series?.color || 'default',
    postCount: seriesPosts.length,
    totalReadingTime: seriesPosts.reduce((sum, p) => sum + p.readingTime.minutes, 0),
    posts: seriesPosts,
    firstPost,
    latestPost,
  };
});

/**
 * Get series metadata by slug
 * @param slug - URL-safe series slug
 * @returns SeriesMetadata or undefined if not found
 */
export function getSeriesBySlug(slug: string): SeriesMetadata | undefined {
  return allSeries.find(s => s.slug === slug);
}

/**
 * Get series metadata for a post
 * @param post - Blog post
 * @returns SeriesMetadata or undefined if post not in a series
 */
export function getSeriesForPost(post: Post): SeriesMetadata | undefined {
  if (!post.series) return undefined;
  return allSeries.find(s => s.name === post.series!.name);
}

/**
 * Get series by any slug (current or previous)
 * Supports 301 redirects from old series slugs
 *
 * @param slug - URL slug to search for
 * @returns Object with series, redirect flag, and canonical slug, or null if not found
 *
 * @example
 * ```ts
 * const result = getSeriesByAnySlug("old-name");
 * if (result?.needsRedirect) {
 *   redirect(`/blog/series/${result.canonicalSlug}`);
 * }
 * ```
 */
export function getSeriesByAnySlug(
  slug: string
): { series: SeriesMetadata; needsRedirect: boolean; canonicalSlug: string } | null {
  // First try direct match by current slug
  const series = allSeries.find((s) => s.slug === slug);
  if (series) {
    return { series, needsRedirect: false, canonicalSlug: series.slug };
  }

  // Then check previousSlugs in any post from the series
  for (const s of allSeries) {
    const hasPreviousSlug = s.posts.some(
      (post) => post.series?.previousSlugs?.includes(slug)
    );
    if (hasPreviousSlug) {
      return { series: s, needsRedirect: true, canonicalSlug: s.slug };
    }
  }

  return null;
}
