"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Post } from "@/data/posts";
import { PostBadges } from "@/components/blog";
import { SeriesBadge } from "@/components/blog";
import { Badge } from "@/components/ui/badge";
import { PostThumbnail } from "@/components/blog";
import { HighlightText } from "@/components/common";
import { BookmarkButton } from "@/components/blog";
import dynamic from "next/dynamic";
import { HOVER_EFFECTS, SPACING, ANIMATION } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

const ScrollReveal = dynamic(
  () =>
    import("@/components/features/scroll-reveal").then((mod) => ({
      default: mod.ScrollReveal,
    })),
  {
    loading: () => <div className="contents" />,
    ssr: true,
  }
);

/**
 * Props for the PostList component
 * @typedef {Object} PostListProps
 * @property {Post[]} posts - Array of blog posts to display
 * @property {string} [latestSlug] - Slug of the most recent post (for "New" badge)
 * @property {string} [hottestSlug] - Slug of the hottest/trending post (for "Hot" badge)
 * @property {"h2" | "h3"} [titleLevel="h2"] - HTML heading level for post titles
 * @property {string} [emptyMessage="No posts found."] - Message to show when posts array is empty
 * @property {"grid" | "list" | "magazine" | "compact"} [layout="grid"] - Layout variant to use (grid = hero first post + 2-column grid)
 * @property {Map<string, number>} [viewCounts] - Map of post ID to view count
 * @property {() => void} [onClearFilters] - Callback when clear filters is clicked in empty state
 * @property {boolean} [hasActiveFilters=false] - Whether filters are currently active
 * @property {string} [searchQuery] - Search query for highlighting matches in titles and descriptions
 */
interface PostListProps {
  posts: Post[];
  latestSlug?: string;
  hottestSlug?: string;
  titleLevel?: "h2" | "h3";
  emptyMessage?: string;
  layout?: "grid" | "list" | "magazine" | "compact";
  viewCounts?: Map<string, number>;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
  searchQuery?: string;
}

/**
 * PostList Component
 *
 * Reusable component for displaying blog posts in a responsive, mobile-first format.
 * Used across the site: homepage hero section, /blog page, search results, tag filters.
 *
 * Features:
 * - **Mobile-first responsive design** with vertical cards on mobile, horizontal on desktop
 * - **Full-width 16:9 images** on mobile (< md breakpoint) for better visual impact
 * - **Simplified metadata** on mobile screens (date + reading time only)
 * - Post badges (Draft, Archived, New, Hot)
 * - Post title with dynamic heading level
 * - Summary with metadata
 * - Hover effects with lift animation
 * - Empty state with customizable message
 * - Integration with post filtering and search
 * - **Layout variants**: grid (2-column), list (single column expanded), magazine (alternating large images), compact (dense)
 *
 * ⚠️ SKELETON SYNC REQUIRED
 * When updating this component's structure, also update:
 * - src/components/post-list-skeleton.tsx
 *
 * Key structural elements that must match:
 * - article: rounded-lg, border, overflow-hidden
 * - Mobile (< md): Vertical layout
 *   - PostThumbnail: w-full, aspect-video (192px height)
 *   - Content: p-3 sm:p-4 with space-y-2
 *   - Metadata: Only date + reading time (tags hidden)
 * - Desktop (≥ md): Horizontal layout (flex-row)
 *   - Thumbnail: w-32, h-24 (128x96px)
 *   - Content: flex-1 with padding
 *   - Metadata: All visible (date + reading time + tags)
 * - Hover effects: hover:bg-muted/50, hover:shadow-md, hover:-translate-y-0.5
 *
 * @component
 * @param {PostListProps} props - Component props
 * @param {Post[]} props.posts - Array of posts to display
 * @param {string} [props.latestSlug] - Identifies most recent post for "New" badge
 * @param {string} [props.hottestSlug] - Identifies hottest post for "Hot" badge
 * @param {"h2" | "h3"} [props.titleLevel="h2"] - Semantic heading level (h2 for main content, h3 for secondary)
 * @param {string} [props.emptyMessage="No posts found."] - Text shown when no posts to display
 *
 * @returns {React.ReactElement} List of post articles or empty state message
 *
 * @example
 * // Display all posts on blog page
 * <PostList posts={filteredPosts} />
 *
 * @example
 * // Display posts with badges on homepage
 * <PostList
 *   posts={featuredPosts}
 *   latestSlug={latestPost.slug}
 *   hottestSlug={trendingPost.slug}
 *   emptyMessage="No featured posts yet."
 * />
 *
 * @example
 * // Display search results with h3 headings
 * <PostList
 *   posts={searchResults}
 *   titleLevel="h3"
 *   emptyMessage={`No posts found for "${query}"`}
 * />
 *
 * @styling
 * **Mobile (< md breakpoint):**
 * - Vertical card layout with full-width featured image (16:9 aspect, 192px height)
 * - Content padding: p-3 sm:p-4
 * - Simplified metadata (date + reading time, tags hidden)
 * - Full card is tappable with large touch target
 *
 * **Desktop (≥ md breakpoint):**
 * - Horizontal layout with side thumbnail (128x96px)
 * - Content displays inline with thumbnail
 * - Full metadata visible (date + reading time + tags)
 * - Hover lift effect (-translate-y-0.5)
 *
 * **Common:**
 * - Rounded corners with border
 * - Transition effects on hover
 * - Shadow on hover (hover:shadow-md)
 * - Background muted on hover (hover:bg-muted/50)
 *
 * @accessibility
 * - Semantic article elements for screen readers
 * - Time element with dateTime attribute for machine-readable dates
 * - Heading hierarchy respects titleLevel prop
 * - Post badges announce post status (draft, archived, new, hot)
 * - Entire card is keyboard navigable via Link wrapper
 * - Touch targets meet 44px minimum on mobile
 *
 * @performance
 * - Maps over posts array with slug as key for React reconciliation
 * - No fetching - uses pre-computed posts data
 * - Lightweight component with minimal state
 * - Early exit (null) for empty array not rendered as empty container
 * - Scroll reveal animations staggered by 100ms for visual polish
 *
 * @usage
 * Shared across:
 * - src/app/page.tsx (homepage)
 * - src/app/blog/page.tsx (blog listing)
 * - Search/filter results
 *
 * @see src/components/post-badges.tsx for badge implementation
 * @see src/components/post-thumbnail.tsx for image optimization
 * @see src/data/posts.ts for Post type definition
 * @see /docs/components/skeleton-sync-strategy.md for skeleton sync guidelines
 */

// ─── MagazinePostList ──────────────────────────────────────────────────────────

interface MagazinePostListProps {
  posts: Post[];
  latestSlug?: string;
  hottestSlug?: string;
  titleLevel: "h2" | "h3";
  viewCounts?: Map<string, number>;
  searchQuery?: string;
  formatViews: (count: number) => string;
}

function MagazinePostList({
  posts,
  latestSlug,
  hottestSlug,
  titleLevel,
  viewCounts,
  searchQuery,
  formatViews,
}: MagazinePostListProps) {
  const TitleTag = titleLevel;
  return (
    <div className={SPACING.subsection} data-testid="post-list">
      {posts.map((p, index) => {
        const isFirstPost = index === 0;

        if (isFirstPost) {
          return (
            <ScrollReveal key={p.slug}>
              <article
                className={`group rounded-xl border border-border/40 overflow-hidden relative bg-card shadow-md hover:shadow-lg transition-all ${ANIMATION.duration.normal} ${HOVER_EFFECTS.card}`}
              >
                <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <BookmarkButton slug={p.slug} size="icon" variant="ghost" className="bg-background/80 backdrop-blur-sm hover:bg-background" />
                </div>
                {p.image && p.image.url && !p.image.hideCard && (
                  <div className="absolute inset-0 z-0">
                    <Image src={p.image.url} alt={p.image.alt || p.title} fill className={`object-cover group-hover:scale-105 transition-transform ${ANIMATION.duration.slow}`} sizes="(max-width: 768px) 100vw, 100vw" priority />
                    <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/50 to-black/70" />
                  </div>
                )}
                <Link href={`/blog/${p.slug}`} className="block">
                  <div className="p-4 md:p-10 lg:p-12 relative z-10 flex flex-col justify-end min-h-96 md:min-h-128">
                    <div className={`flex flex-nowrap items-center gap-x-3 text-sm mb-4 overflow-x-auto ${p.image && p.image.url && !p.image.hideCard ? "text-white/70" : "text-muted-foreground"}`}>
                      <PostBadges post={p} isLatestPost={latestSlug === p.slug} isHotPost={hottestSlug === p.slug} showCategory={true} />
                      <SeriesBadge post={p} />
                    </div>
                    <div className={`hidden md:flex flex-nowrap items-center gap-x-3 text-sm mb-5 overflow-x-auto ${p.image && p.image.url && !p.image.hideCard ? "text-white/70" : "text-muted-foreground"}`}>
                      <time dateTime={p.publishedAt} className="whitespace-nowrap">{new Date(p.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
                      <span aria-hidden="true" className={p.image && p.image.url && !p.image.hideCard ? "text-white/50" : "text-muted-foreground"}>•</span>
                      <span className="whitespace-nowrap">{p.readingTime.text}</span>
                      {viewCounts && viewCounts.has(p.id) && viewCounts.get(p.id)! > 0 && (
                        <>
                          <span aria-hidden="true" className={p.image && p.image.url && !p.image.hideCard ? "text-white/50" : "text-muted-foreground"}>•</span>
                          <span className="whitespace-nowrap">{formatViews(viewCounts.get(p.id)!)} views</span>
                        </>
                      )}
                    </div>
                    <TitleTag className={`font-bold text-4xl md:text-5xl lg:text-6xl leading-tight line-clamp-3 mb-4 ${p.image && p.image.url && !p.image.hideCard ? "text-white" : "text-foreground"}`}>
                      <HighlightText text={p.title} searchQuery={searchQuery} />
                    </TitleTag>
                    {p.subtitle && (
                      <p className={`font-medium text-lg md:text-xl mb-4 line-clamp-2 ${p.image && p.image.url && !p.image.hideCard ? "text-white/80" : "text-muted-foreground"}`}>
                        <HighlightText text={p.subtitle} searchQuery={searchQuery} />
                      </p>
                    )}
                    <p className={`text-base md:text-lg leading-relaxed line-clamp-2 md:line-clamp-3 mb-6 ${p.image && p.image.url && !p.image.hideCard ? "text-white/80" : "text-muted-foreground"}`}>
                      <HighlightText text={p.summary} searchQuery={searchQuery} />
                    </p>
                    {p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {p.tags.slice(0, 5).map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20">{tag}</Badge>
                        ))}
                        {p.tags.length > 5 && <Badge variant="secondary" className="bg-white/10 text-white/70 backdrop-blur-sm border border-white/20">+{p.tags.length - 5}</Badge>}
                      </div>
                    )}
                  </div>
                </Link>
              </article>
            </ScrollReveal>
          );
        }

        // Alternating horizontal layout for remaining posts
        const isSecondRow = index === 1 || index === 2;
        const isEven = index % 2 === 0;
        return (
          <ScrollReveal key={p.slug}>
            <article className={`group rounded-lg border border-border/40 overflow-hidden relative bg-card shadow-sm hover:shadow-md transition-all ${ANIMATION.duration.normal} ${HOVER_EFFECTS.card}`}>
              <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <BookmarkButton slug={p.slug} size="icon" variant="ghost" className="bg-background/80 backdrop-blur-sm hover:bg-background" />
              </div>
              <Link href={`/blog/${p.slug}`} className="block h-full">
                <div className={cn("h-full flex flex-col md:items-stretch", isEven ? "md:flex-row" : "md:flex-row-reverse")}>
                  {p.image && p.image.url && !p.image.hideCard && (
                    <div className={`relative overflow-hidden bg-muted shrink-0 ${index === 1 ? "md:w-2/5" : "md:w-3/5"}`}>
                      <Image src={p.image.url} alt={p.image.alt || p.title} fill className={`object-cover group-hover:scale-110 transition-transform ${ANIMATION.duration.slow}`} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    </div>
                  )}
                  <div className={`p-4 md:p-8 flex flex-col justify-between ${p.image && p.image.url && !p.image.hideCard ? (index === 1 ? "md:w-3/5" : "md:w-2/5") : "w-full"}`}>
                    <div className="flex flex-nowrap items-center gap-x-2.5 text-sm text-muted-foreground mb-2.5 overflow-x-auto">
                      <PostBadges post={p} size="sm" isLatestPost={latestSlug === p.slug} isHotPost={hottestSlug === p.slug} showCategory={true} />
                      <SeriesBadge post={p} size="sm" />
                    </div>
                    <div className="hidden md:flex flex-nowrap items-center gap-x-2.5 text-sm text-muted-foreground mb-2.5 overflow-x-auto">
                      <time dateTime={p.publishedAt} className="whitespace-nowrap">{new Date(p.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</time>
                      <span aria-hidden="true" className="text-muted-foreground">•</span>
                      <span className="whitespace-nowrap">{p.readingTime.text}</span>
                      {viewCounts && viewCounts.has(p.id) && viewCounts.get(p.id)! > 0 && (
                        <>
                          <span aria-hidden="true" className="text-muted-foreground">•</span>
                          <span className="whitespace-nowrap">{formatViews(viewCounts.get(p.id)!)} views</span>
                        </>
                      )}
                    </div>
                    <TitleTag className={`font-bold leading-tight line-clamp-2 mb-3 text-foreground ${isSecondRow ? "text-lg md:text-2xl" : "text-xl md:text-3xl"}`}>
                      <HighlightText text={p.title} searchQuery={searchQuery} />
                    </TitleTag>
                    <p className="text-sm md:text-base leading-relaxed text-muted-foreground line-clamp-2 md:line-clamp-3 mb-3">
                      <HighlightText text={p.summary} searchQuery={searchQuery} />
                    </p>
                    {p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {p.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                        {p.tags.length > 3 && <Badge variant="outline" className="text-xs">+{p.tags.length - 3}</Badge>}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </article>
          </ScrollReveal>
        );
      })}
    </div>
  );
}

// ─── PostList ─────────────────────────────────────────────────────────────────

export function PostList({
  posts,
  latestSlug,
  hottestSlug,
  titleLevel = "h2",
  emptyMessage = "No posts found.",
  layout = "grid",
  viewCounts,
  onClearFilters,
  hasActiveFilters = false,
  searchQuery,
}: PostListProps) {
  const router = useRouter();

  // Helper to format view count
  const formatViews = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  // Handle clear filters
  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      router.push("/blog");
    }
  };

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground mb-4">{emptyMessage}</p>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-primary hover:underline font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>
    );
  }

  const TitleTag = titleLevel;

  // Magazine layout: first post as hero, then alternating side-by-side layouts with modern styling
  if (layout === "magazine") {
    return (
      <MagazinePostList
        posts={posts}
        latestSlug={latestSlug}
        hottestSlug={hottestSlug}
        titleLevel={titleLevel}
        viewCounts={viewCounts}
        searchQuery={searchQuery}
        formatViews={formatViews}
      />
    );
  }


  // Grid layout: Hero first post + 2-column grid for rest
  if (layout === "grid") {
    // Grid layout implementation: Hero first post + 2-column grid for rest
    return (
      <div data-testid="post-list">
        {/* Hero section - First post */}
        <ScrollReveal className="mb-6">
          <article
            className={`group rounded-xl border border-border/40 overflow-hidden relative bg-card shadow-md hover:shadow-lg transition-all ${HOVER_EFFECTS.card}`}
          >
            {/* Bookmark Button - Top Right Corner */}
            <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <BookmarkButton
                slug={posts[0].slug}
                size="icon"
                variant="ghost"
                className="bg-background/80 backdrop-blur-sm hover:bg-background"
              />
            </div>

            {/* Background image with scale effect */}
            {posts[0].image &&
              posts[0].image.url &&
              !posts[0].image.hideCard && (
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <Image
                    src={posts[0].image.url}
                    alt={posts[0].image.alt || posts[0].title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    style={{ transitionDuration: ANIMATION.duration.slow }}
                    sizes="(max-width: 768px) 100vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/50 to-black/70" />
                </div>
              )}

            <Link href={`/blog/${posts[0].slug}`} className="block">
              <div className="min-h-96 md:min-h-128 p-4 md:p-10 lg:p-12 relative z-10 flex flex-col justify-end">
                <div className="flex flex-nowrap items-center gap-x-3 text-sm mb-4 text-white/80 overflow-x-auto">
                  <PostBadges
                    post={posts[0]}
                    isLatestPost={latestSlug === posts[0].slug}
                    isHotPost={hottestSlug === posts[0].slug}
                    showCategory={true}
                  />
                  <SeriesBadge post={posts[0]} />
                </div>

                <div className="hidden md:flex flex-nowrap items-center gap-x-3 text-sm mb-4 text-white/70 overflow-x-auto">
                  <time dateTime={posts[0].publishedAt}>
                    {new Date(posts[0].publishedAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </time>
                  <span aria-hidden="true">•</span>
                  <span>{posts[0].readingTime.text}</span>
                  {viewCounts &&
                    viewCounts.has(posts[0].id) &&
                    viewCounts.get(posts[0].id)! > 0 && (
                      <>
                        <span aria-hidden="true">•</span>
                        <span>
                          {formatViews(viewCounts.get(posts[0].id)!)} views
                        </span>
                      </>
                    )}
                </div>

                <TitleTag className="font-bold text-4xl md:text-5xl lg:text-6xl leading-tight line-clamp-3 mb-4 text-white">
                  <HighlightText
                    text={posts[0].title}
                    searchQuery={searchQuery}
                  />
                </TitleTag>

                {posts[0].subtitle && (
                  <p className="font-medium text-lg md:text-xl text-white/90 mb-4">
                    <HighlightText
                      text={posts[0].subtitle}
                      searchQuery={searchQuery}
                    />
                  </p>
                )}

                <p className="text-base md:text-lg leading-relaxed text-white/80 line-clamp-2 md:line-clamp-3 mb-5">
                  <HighlightText
                    text={posts[0].summary}
                    searchQuery={searchQuery}
                  />
                </p>

                {posts[0].tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {posts[0].tags.slice(0, 5).map((tag) => (
                      <Badge
                        key={tag}
                        className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {posts[0].tags.length > 5 && (
                      <Badge className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20">
                        +{posts[0].tags.length - 5} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </Link>
          </article>
        </ScrollReveal>

        {/* Grid section - Remaining posts in 2-column layout */}
        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 gap-4",
            SPACING.section
          )}
        >
          {posts.slice(1).map((p, index) => (
            <ScrollReveal key={p.slug}>
              <article
                className={`group rounded-lg border border-border/40 overflow-hidden relative bg-card shadow-md hover:shadow-lg transition-all flex flex-col h-full ${HOVER_EFFECTS.card}`}
              >
                {/* Bookmark Button - Top Right Corner */}
                <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <BookmarkButton
                    slug={p.slug}
                    size="icon"
                    variant="ghost"
                    className="bg-background/80 backdrop-blur-sm hover:bg-background"
                  />
                </div>

                {/* Background image with scale effect */}
                {p.image && p.image.url && !p.image.hideCard && (
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    <Image
                      src={p.image.url}
                      alt={p.image.alt || p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      style={{ transitionDuration: ANIMATION.duration.slow }}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/50 to-black/70" />
                  </div>
                )}
                <Link href={`/blog/${p.slug}`} className="flex flex-col h-full">
                  <div className="flex-1 flex flex-col p-4 md:p-8 relative z-10">
                    <div
                      className={`flex flex-wrap items-center gap-x-2 gap-y-1 mb-3 text-sm ${p.image && p.image.url && !p.image.hideCard ? "text-white/70" : "text-muted-foreground"}`}
                    >
                      <PostBadges
                        post={p}
                        size="default"
                        isLatestPost={latestSlug === p.slug}
                        isHotPost={hottestSlug === p.slug}
                        showCategory={true}
                      />
                      <SeriesBadge post={p} size="default" />
                    </div>

                    <div
                      className={`hidden md:flex flex-nowrap items-center gap-x-2 mb-3 text-xs ${p.image && p.image.url && !p.image.hideCard ? "text-white/60" : "text-muted-foreground"}`}
                    >
                      <time dateTime={p.publishedAt}>
                        {new Date(p.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                      <span aria-hidden="true">•</span>
                      <span>{p.readingTime.text}</span>
                      {viewCounts &&
                        viewCounts.has(p.id) &&
                        viewCounts.get(p.id)! > 0 && (
                          <>
                            <span aria-hidden="true">•</span>
                            <span>
                              {formatViews(viewCounts.get(p.id)!)} views
                            </span>
                          </>
                        )}
                    </div>

                    <TitleTag
                      className={`font-semibold text-lg md:text-xl line-clamp-2 mb-3 ${p.image && p.image.url && !p.image.hideCard ? "text-white" : "text-foreground"}`}
                    >
                      <HighlightText text={p.title} searchQuery={searchQuery} />
                    </TitleTag>

                    <p
                      className={`text-sm line-clamp-3 md:line-clamp-4 flex-1 ${p.image && p.image.url && !p.image.hideCard ? "text-white/80" : "text-muted-foreground"}`}
                    >
                      <HighlightText
                        text={p.summary}
                        searchQuery={searchQuery}
                      />
                    </p>

                    {p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {p.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            className={`backdrop-blur-sm border ${p.image && p.image.url && !p.image.hideCard ? "bg-white/20 text-white border-white/30 hover:bg-white/30" : "bg-white/10 text-foreground hover:bg-white/20 border-border/40"}`}
                          >
                            {tag}
                          </Badge>
                        ))}
                        {p.tags.length > 3 && (
                          <Badge
                            className={`backdrop-blur-sm border ${p.image && p.image.url && !p.image.hideCard ? "bg-white/20 text-white/70 border-white/30 hover:bg-white/30" : "bg-white/10 text-muted-foreground hover:bg-white/20 border-border/40"}`}
                          >
                            +{p.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    );
  }

  // List layout: single column with full details
  if (layout === "list") {
    return (
      <div className={SPACING.subsection} data-testid="post-list">
        {posts.map((p, index) => {
          return (
            <ScrollReveal key={p.slug} delay={index * 80}>
              <article
                className={`group rounded-lg border border-border/40 overflow-hidden relative bg-card shadow-md hover:shadow-lg transition-all ${HOVER_EFFECTS.card}`}
              >
                {/* Bookmark Button - Top Right Corner */}
                <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <BookmarkButton
                    slug={p.slug}
                    size="icon"
                    variant="ghost"
                    className="bg-background/80 backdrop-blur-sm hover:bg-background"
                  />
                </div>

                {/* Background image with scale effect - only if explicitly defined in post and not hidden */}
                {p.image && p.image.url && !p.image.hideCard && (
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    <Image
                      src={p.image.url}
                      alt={p.image.alt || p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      style={{ transitionDuration: ANIMATION.duration.slow }}
                      sizes="(max-width: 768px) 100vw, 100vw"
                    />
                    {/* Dark gradient overlay for text contrast */}
                    <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/50 to-black/70" />
                  </div>
                )}
                <Link href={`/blog/${p.slug}`} className="block">
                  <div className="p-4 md:p-8 lg:p-10 relative z-10">
                    {/* Badges - show on all posts */}
                    <div
                      className={`flex flex-nowrap items-center gap-x-2 text-xs mb-4 overflow-x-auto ${p.image && p.image.url && !p.image.hideCard ? "text-white/70" : "text-muted-foreground"}`}
                    >
                      <PostBadges
                        post={p}
                        size="sm"
                        isLatestPost={latestSlug === p.slug}
                        isHotPost={hottestSlug === p.slug}
                        showCategory={true}
                      />
                      <SeriesBadge post={p} size="sm" />
                    </div>

                    {/* Time/reading time/views - desktop only */}
                    <div
                      className={`hidden md:flex flex-nowrap items-center gap-x-2 text-xs mb-4 overflow-x-auto ${p.image && p.image.url && !p.image.hideCard ? "text-white/60" : "text-muted-foreground"}`}
                    >
                      <time dateTime={p.publishedAt}>
                        {new Date(p.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                      <span aria-hidden="true">•</span>
                      <span>{p.readingTime.text}</span>
                      {viewCounts &&
                        viewCounts.has(p.id) &&
                        viewCounts.get(p.id)! > 0 && (
                          <>
                            <span aria-hidden="true">•</span>
                            <span>
                              {formatViews(viewCounts.get(p.id)!)} views
                            </span>
                          </>
                        )}
                    </div>

                    {/* Title */}
                    <TitleTag
                      className={`font-semibold text-2xl md:text-3xl lg:text-4xl line-clamp-2 mb-4 ${p.image && p.image.url && !p.image.hideCard ? "text-white" : "text-foreground"}`}
                    >
                      <HighlightText text={p.title} searchQuery={searchQuery} />
                    </TitleTag>

                    {/* Summary - more lines visible */}
                    <p
                      className={`text-base md:text-lg line-clamp-3 md:line-clamp-4 mb-5 ${p.image && p.image.url && !p.image.hideCard ? "text-white/80" : "text-muted-foreground"}`}
                    >
                      <HighlightText
                        text={p.summary}
                        searchQuery={searchQuery}
                      />
                    </p>

                    {/* Tags */}
                    {p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {p.tags.slice(0, 5).map((tag) => (
                          <Badge
                            key={tag}
                            className={`backdrop-blur-sm border text-xs ${p.image && p.image.url && !p.image.hideCard ? "bg-white/20 text-white border-white/30 hover:bg-white/30" : "bg-white/10 text-foreground hover:bg-white/20 border-border/40"}`}
                          >
                            {tag}
                          </Badge>
                        ))}
                        {p.tags.length > 5 && (
                          <Badge
                            className={`backdrop-blur-sm border text-xs ${p.image && p.image.url && !p.image.hideCard ? "bg-white/20 text-white/70 border-white/30 hover:bg-white/30" : "bg-white/10 text-muted-foreground hover:bg-white/20 border-border/40"}`}
                          >
                            +{p.tags.length - 5}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              </article>
            </ScrollReveal>
          );
        })}
      </div>
    );
  }

  // Compact layout: minimal cards with modern styling
  if (layout === "compact") {
    return (
      <div className={SPACING.postList} data-testid="post-list">
        {posts.map((p, index) => {
          return (
            <ScrollReveal key={p.slug}>
              <article
                className={`group rounded-lg border border-border/40 overflow-hidden relative bg-card shadow-sm hover:shadow-md transition-all ${HOVER_EFFECTS.card}`}
              >
                {/* Bookmark Button - Top Right Corner */}
                <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <BookmarkButton
                    slug={p.slug}
                    size="sm"
                    variant="ghost"
                    className="bg-background/80 backdrop-blur-sm hover:bg-background"
                  />
                </div>

                {/* Background image with scale effect - only if explicitly defined in post and not hidden */}
                {p.image && p.image.url && !p.image.hideCard && (
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    <Image
                      src={p.image.url}
                      alt={p.image.alt || p.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform"
                      style={{ transitionDuration: ANIMATION.duration.normal }}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {/* Dark gradient overlay for text contrast */}
                    <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/60 to-black/80" />
                  </div>
                )}
                <Link href={`/blog/${p.slug}`} className="block">
                  <div className="p-3 md:p-4 relative z-10 min-h-24 flex flex-col justify-end">
                    {/* Badges - show on all posts */}
                    <div
                      className={`flex flex-nowrap items-center gap-x-1.5 text-xs mb-1.5 overflow-x-auto ${p.image && p.image.url && !p.image.hideCard ? "text-white/70" : "text-muted-foreground"}`}
                    >
                      <PostBadges
                        post={p}
                        size="sm"
                        isLatestPost={latestSlug === p.slug}
                        isHotPost={hottestSlug === p.slug}
                        showCategory={true}
                      />
                      <SeriesBadge post={p} size="sm" />
                    </div>

                    {/* Time/reading time/views - desktop only */}
                    <div
                      className={`hidden md:flex flex-nowrap items-center gap-x-1 text-xs mb-2 overflow-x-auto ${p.image && p.image.url && !p.image.hideCard ? "text-white/60" : "text-muted-foreground"}`}
                    >
                      <time dateTime={p.publishedAt}>
                        {new Date(p.publishedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                      <span aria-hidden="true">•</span>
                      <span>{p.readingTime.text}</span>
                      {viewCounts &&
                        viewCounts.has(p.id) &&
                        viewCounts.get(p.id)! > 0 && (
                          <>
                            <span aria-hidden="true">•</span>
                            <span>
                              {formatViews(viewCounts.get(p.id)!)} views
                            </span>
                          </>
                        )}
                    </div>

                    {/* Title - compact */}
                    <TitleTag
                      className={`font-medium text-sm md:text-base line-clamp-2 ${p.image && p.image.url && !p.image.hideCard ? "text-white" : "text-foreground"}`}
                    >
                      <HighlightText text={p.title} searchQuery={searchQuery} />
                    </TitleTag>
                  </div>
                </Link>
              </article>
            </ScrollReveal>
          );
        })}
      </div>
    );
  }

  // Default fallback to magazine layout
  return (
    <div className={SPACING.subsection} data-testid="post-list">
      {posts.map((p, index) => (
        <ScrollReveal key={p.slug}>
          <article
            className={`group rounded-lg border overflow-hidden relative bg-card ${HOVER_EFFECTS.card}`}
          >
            <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <BookmarkButton
                slug={p.slug}
                size="icon"
                variant="ghost"
                className="bg-background/80 backdrop-blur-sm hover:bg-background"
              />
            </div>
            {p.image && p.image.url && !p.image.hideCard && (
              <div className="absolute inset-0 z-0">
                <Image
                  src={p.image.url}
                  alt={p.image.alt || p.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 100vw"
                />
                <div className="absolute inset-0 bg-linear-to-b from-background/45 via-background/70 to-background/95" />
              </div>
            )}
            <Link href={`/blog/${p.slug}`} className="block">
              <div className="p-4 md:p-8 relative z-10">
                <div className="flex flex-nowrap items-center gap-x-2.5 text-sm text-muted-foreground mb-3 overflow-x-auto">
                  <PostBadges
                    post={p}
                    size="sm"
                    isLatestPost={latestSlug === p.slug}
                    isHotPost={hottestSlug === p.slug}
                    showCategory={true}
                  />
                  <SeriesBadge post={p} size="sm" />
                </div>
                <div className="hidden md:flex flex-nowrap items-center gap-x-2.5 text-sm text-muted-foreground mb-3 overflow-x-auto">
                  <time dateTime={p.publishedAt}>
                    {new Date(p.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <span aria-hidden="true" className="text-muted-foreground">
                    •
                  </span>
                  <span>{p.readingTime.text}</span>
                  {viewCounts &&
                    viewCounts.has(p.id) &&
                    viewCounts.get(p.id)! > 0 && (
                      <>
                        <span
                          aria-hidden="true"
                          className="text-muted-foreground"
                        >
                          •
                        </span>
                        <span>{formatViews(viewCounts.get(p.id)!)} views</span>
                      </>
                    )}
                </div>
                <TitleTag className="font-bold text-xl md:text-2xl lg:text-3xl leading-tight line-clamp-2 mb-3 text-foreground">
                  <HighlightText text={p.title} searchQuery={searchQuery} />
                </TitleTag>
                <p className="text-sm md:text-base leading-relaxed text-muted-foreground line-clamp-2 lg:line-clamp-3 mb-4">
                  <HighlightText text={p.summary} searchQuery={searchQuery} />
                </p>
                {p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {p.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs border-border text-foreground"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {p.tags.length > 3 && (
                      <Badge
                        variant="outline"
                        className="text-xs border-border text-muted-foreground"
                      >
                        +{p.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </Link>
          </article>
        </ScrollReveal>
      ))}
    </div>
  );
}
