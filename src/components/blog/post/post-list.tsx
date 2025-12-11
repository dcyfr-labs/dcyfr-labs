"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Post } from "@/data/posts";
import { PostBadges } from "@/components/blog/post/post-badges";
import { SeriesBadge } from "@/components/blog/post/series-badge";
import { Badge } from "@/components/ui/badge";
import { PostThumbnail } from "@/components/blog/post/post-thumbnail";
import { HighlightText } from "@/components/common/highlight-text";
import { BookmarkButton } from "@/components/blog/bookmark-button";
import dynamic from "next/dynamic";
import { HOVER_EFFECTS, SPACING } from "@/lib/design-tokens";

const ScrollReveal = dynamic(() => import("@/components/features/scroll-reveal").then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => <div className="contents" />,
  ssr: true,
});

/**
 * Props for the PostList component
 * @typedef {Object} PostListProps
 * @property {Post[]} posts - Array of blog posts to display
 * @property {string} [latestSlug] - Slug of the most recent post (for "New" badge)
 * @property {string} [hottestSlug] - Slug of the hottest/trending post (for "Hot" badge)
 * @property {"h2" | "h3"} [titleLevel="h2"] - HTML heading level for post titles
 * @property {string} [emptyMessage="No posts found."] - Message to show when posts array is empty
 * @property {"grid" | "list" | "magazine" | "compact"} [layout="grid"] - Layout variant to use
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
  layout?: "grid" | "list" | "magazine" | "compact" | "hybrid";
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
  searchQuery
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
      router.push('/blog');
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

  // Magazine layout: first post as hero, then alternating side-by-side layouts
  if (layout === "magazine") {
    return (
      <div className={SPACING.subsection} data-testid="post-list">
        {posts.map((p, index) => {
          const isFirstPost = index === 0;
          const isEven = index % 2 === 0;

          // Hero layout for first post
          if (isFirstPost) {
            return (
              <ScrollReveal key={p.slug} animation="fade-up" delay={0}>
                <article
                  className={`group rounded-lg border overflow-hidden relative bg-card ${HOVER_EFFECTS.card}`}
                >
                  {/* Bookmark Button - Top Right Corner */}
                  <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <BookmarkButton slug={p.slug} size="icon" variant="ghost" className="bg-background/80 backdrop-blur-sm hover:bg-background" />
                  </div>
                  
                  {/* Background image - only if explicitly defined in post and not hidden */}
                  {p.image && p.image.url && !p.image.hideCard && (
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={p.image.url}
                        alt={p.image.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 100vw"
                      />
                      {/* Gradient overlay for text contrast */}
                      <div className="absolute inset-0 bg-linear-to-b from-background/75 via-background/85 to-background/95" />
                    </div>
                  )}

                  <Link href={`/blog/${p.slug}`} className="block">
                    {/* Content */}
                    <div className="p-4 md:p-10 lg:p-12 relative z-10">
                      {/* Badges - show on all posts */}
                      <div className="flex flex-nowrap items-center gap-x-3 text-sm mb-4 text-zinc-700 dark:text-zinc-300 overflow-x-auto">
                        <PostBadges
                          post={p}
                          isLatestPost={latestSlug === p.slug}
                          isHotPost={hottestSlug === p.slug}
                          showCategory={true}
                        />
                        <SeriesBadge post={p} />
                      </div>

                      {/* Time/reading time/views - desktop only */}
                      <div className="hidden md:flex flex-nowrap items-center gap-x-3 text-sm mb-4 text-zinc-700 dark:text-zinc-300 overflow-x-auto">
                        <time
                          dateTime={p.publishedAt}
                          className="text-zinc-700 dark:text-zinc-300"
                        >
                          {new Date(p.publishedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </time>
                        <span aria-hidden="true" className="text-zinc-500">
                          •
                        </span>
                        <span className="text-zinc-700 dark:text-zinc-300">
                          {p.readingTime.text}
                        </span>
                        {viewCounts &&
                          viewCounts.has(p.id) &&
                          viewCounts.get(p.id)! > 0 && (
                            <>
                              <span
                                aria-hidden="true"
                                className="text-zinc-500"
                              >
                                •
                              </span>
                              <span className="text-zinc-700 dark:text-zinc-300">
                                {formatViews(viewCounts.get(p.id)!)} views
                              </span>
                            </>
                          )}
                      </div>

                      {/* Large hero title with better contrast */}
                      <TitleTag className="font-bold text-3xl md:text-4xl lg:text-5xl leading-tight line-clamp-3 mb-4 text-zinc-900 dark:text-zinc-100">
                        <HighlightText
                          text={p.title}
                          searchQuery={searchQuery}
                        />
                      </TitleTag>

                      {/* Subtitle if available */}
                      {p.subtitle && (
                        <p className="font-medium text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-4">
                          <HighlightText
                            text={p.subtitle}
                            searchQuery={searchQuery}
                          />
                        </p>
                      )}

                      {/* Extended summary with better readability */}
                      <p className="text-base md:text-xl leading-relaxed text-zinc-700 dark:text-zinc-300 line-clamp-2 md:line-clamp-3 mb-5">
                        <HighlightText
                          text={p.summary}
                          searchQuery={searchQuery}
                        />
                      </p>

                      {/* Tags with better styling */}
                      {p.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {p.tags.slice(0, 5).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs md:text-sm bg-zinc-200/80 text-zinc-800 dark:bg-zinc-700/80 dark:text-zinc-200"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {p.tags.length > 5 && (
                            <Badge
                              variant="secondary"
                              className="text-xs md:text-sm bg-zinc-200/80 text-zinc-800 dark:bg-zinc-700/80 dark:text-zinc-200"
                            >
                              +{p.tags.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                </article>
              </ScrollReveal>
            );
          }

          // Alternating horizontal layout for remaining posts
          return (
            <ScrollReveal key={p.slug} animation="fade-up" delay={index * 50}>
              <article
                className={`group rounded-lg border overflow-hidden relative bg-card ${HOVER_EFFECTS.card}`}
              >
                {/* Bookmark Button - Top Right Corner */}
                <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <BookmarkButton slug={p.slug} size="icon" variant="ghost" className="bg-background/80 backdrop-blur-sm hover:bg-background" />
                </div>
                
                {/* Background image - only if explicitly defined in post and not hidden */}
                {p.image && p.image.url && !p.image.hideCard && (
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={p.image.url}
                      alt={p.image.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 100vw"
                    />
                    {/* Gradient overlay for text contrast */}
                    <div className="absolute inset-0 bg-linear-to-b from-background/75 via-background/85 to-background/95" />
                  </div>
                )}
                <Link href={`/blog/${p.slug}`} className="block">
                  {/* Content section */}
                  <div className="p-4 md:p-8 relative z-10">
                    {/* Badges - show on all posts */}
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

                    {/* Time/reading time/views - desktop only */}
                    <div className="hidden md:flex flex-nowrap items-center gap-x-2.5 text-sm text-muted-foreground mb-3 overflow-x-auto">
                      <time
                        dateTime={p.publishedAt}
                        className="text-zinc-600 dark:text-zinc-400"
                      >
                        {new Date(p.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                      <span aria-hidden="true" className="text-zinc-400">
                        •
                      </span>
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {p.readingTime.text}
                      </span>
                      {viewCounts &&
                        viewCounts.has(p.id) &&
                        viewCounts.get(p.id)! > 0 && (
                          <>
                            <span aria-hidden="true" className="text-zinc-400">
                              •
                            </span>
                            <span className="text-zinc-600 dark:text-zinc-400">
                              {formatViews(viewCounts.get(p.id)!)} views
                            </span>
                          </>
                        )}
                    </div>

                    {/* Title with better sizing */}
                    <TitleTag className="font-bold text-xl md:text-2xl lg:text-3xl leading-tight line-clamp-2 mb-3 text-zinc-900 dark:text-zinc-100">
                      <HighlightText text={p.title} searchQuery={searchQuery} />
                    </TitleTag>

                    {/* Summary with better line height */}
                    <p className="text-sm md:text-base leading-relaxed text-zinc-600 dark:text-zinc-400 line-clamp-2 lg:line-clamp-3 mb-4">
                      <HighlightText
                        text={p.summary}
                        searchQuery={searchQuery}
                      />
                    </p>

                    {/* Tags - limited with better styling */}
                    {p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {p.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs border-zinc-300 text-zinc-700 dark:border-zinc-600 dark:text-zinc-300"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {p.tags.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-xs border-zinc-300 text-zinc-500 dark:border-zinc-600 dark:text-zinc-400"
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
          );
        })}
      </div>
    );
  }

  // Hybrid layout: First post as large hero card, remaining posts in 2-column grid
  if (layout === "hybrid") {
    // If less than 3 posts, fallback to magazine layout
    if (posts.length < 3) {
      return (
        <div className={SPACING.subsection} data-testid="post-list">
          {posts.map((p, index) => {
            const isFirstPost = index === 0;

            if (isFirstPost) {
              return (
                <ScrollReveal key={p.slug} animation="fade-up" delay={0}>
                  <article
                    className={`group rounded-lg border overflow-hidden relative bg-card ${HOVER_EFFECTS.card}`}
                  >
                    {/* Bookmark Button - Top Right Corner */}
                    <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <BookmarkButton slug={p.slug} size="icon" variant="ghost" className="bg-background/80 backdrop-blur-sm hover:bg-background" />
                    </div>

                    {/* Background image */}
                    {p.image && p.image.url && !p.image.hideCard && (
                      <div className="absolute inset-0 z-0">
                        <Image
                          src={p.image.url}
                          alt={p.image.alt}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 100vw"
                        />
                        <div className="absolute inset-0 bg-linear-to-b from-background/75 via-background/85 to-background/95" />
                      </div>
                    )}

                    <Link href={`/blog/${p.slug}`} className="block">
                      <div className="p-4 md:p-10 lg:p-12 relative z-10">
                        <div className="flex flex-nowrap items-center gap-x-3 text-sm mb-4 text-zinc-700 dark:text-zinc-300 overflow-x-auto">
                          <PostBadges
                            post={p}
                            isLatestPost={latestSlug === p.slug}
                            isHotPost={hottestSlug === p.slug}
                            showCategory={true}
                          />
                          <SeriesBadge post={p} />
                        </div>

                        <div className="hidden md:flex flex-nowrap items-center gap-x-3 text-sm mb-4 text-zinc-700 dark:text-zinc-300 overflow-x-auto">
                          <time dateTime={p.publishedAt}>
                            {new Date(p.publishedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </time>
                          <span aria-hidden="true" className="text-zinc-500">•</span>
                          <span className="text-zinc-700 dark:text-zinc-300">{p.readingTime.text}</span>
                          {viewCounts && viewCounts.has(p.id) && viewCounts.get(p.id)! > 0 && (
                            <>
                              <span aria-hidden="true" className="text-zinc-500">•</span>
                              <span className="text-zinc-700 dark:text-zinc-300">{formatViews(viewCounts.get(p.id)!)} views</span>
                            </>
                          )}
                        </div>

                        <TitleTag className="font-bold text-3xl md:text-4xl lg:text-5xl leading-tight line-clamp-3 mb-4 text-zinc-900 dark:text-zinc-100">
                          <HighlightText text={p.title} searchQuery={searchQuery} />
                        </TitleTag>

                        {p.subtitle && (
                          <p className="font-medium text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-4">
                            <HighlightText text={p.subtitle} searchQuery={searchQuery} />
                          </p>
                        )}

                        <p className="text-base md:text-xl leading-relaxed text-zinc-700 dark:text-zinc-300 line-clamp-2 md:line-clamp-3 mb-5">
                          <HighlightText text={p.summary} searchQuery={searchQuery} />
                        </p>

                        {p.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {p.tags.slice(0, 5).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs md:text-sm bg-zinc-200/80 text-zinc-800 dark:bg-zinc-700/80 dark:text-zinc-200">
                                {tag}
                              </Badge>
                            ))}
                            {p.tags.length > 5 && (
                              <Badge variant="secondary" className="text-xs md:text-sm bg-zinc-200/80 text-zinc-800 dark:bg-zinc-700/80 dark:text-zinc-200">
                                +{p.tags.length - 5} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  </article>
                </ScrollReveal>
              );
            }

            // Remaining posts in compact cards
            return (
              <ScrollReveal key={p.slug} animation="fade-up" delay={index * 50}>
                <article className={`group rounded-lg border overflow-hidden relative bg-card ${HOVER_EFFECTS.card}`}>
                  <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <BookmarkButton slug={p.slug} size="icon" variant="ghost" className="bg-background/80 backdrop-blur-sm hover:bg-background" />
                  </div>
                  {p.image && p.image.url && !p.image.hideCard && (
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={p.image.url}
                        alt={p.image.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 100vw"
                      />
                      <div className="absolute inset-0 bg-linear-to-b from-background/75 via-background/85 to-background/95" />
                    </div>
                  )}
                  <Link href={`/blog/${p.slug}`} className="block">
                    <div className="p-4 md:p-8 relative z-10">
                      <div className="flex flex-nowrap items-center gap-x-2.5 text-sm text-muted-foreground mb-3 overflow-x-auto">
                        <PostBadges post={p} size="sm" isLatestPost={latestSlug === p.slug} isHotPost={hottestSlug === p.slug} showCategory={true} />
                        <SeriesBadge post={p} size="sm" />
                      </div>
                      <TitleTag className="font-bold text-xl md:text-2xl lg:text-3xl leading-tight line-clamp-2 mb-3 text-zinc-900 dark:text-zinc-100">
                        <HighlightText text={p.title} searchQuery={searchQuery} />
                      </TitleTag>
                      <p className="text-sm md:text-base leading-relaxed text-zinc-600 dark:text-zinc-400 line-clamp-2 lg:line-clamp-3 mb-4">
                        <HighlightText text={p.summary} searchQuery={searchQuery} />
                      </p>
                      {p.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {p.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs border-zinc-300 text-zinc-700 dark:border-zinc-600 dark:text-zinc-300">
                              {tag}
                            </Badge>
                          ))}
                          {p.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs border-zinc-300 text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
                              +{p.tags.length - 3}
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

    // Main hybrid layout: Hero first post + 2-column grid for rest
    return (
      <div data-testid="post-list">
        {/* Hero section - First post */}
        <ScrollReveal animation="fade-up" delay={0} className="mb-6">
          <article className={`group rounded-lg border overflow-hidden relative bg-card ${HOVER_EFFECTS.card}`}>
            {/* Bookmark Button - Top Right Corner */}
            <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <BookmarkButton slug={posts[0].slug} size="icon" variant="ghost" className="bg-background/80 backdrop-blur-sm hover:bg-background" />
            </div>

            {/* Background image */}
            {posts[0].image && posts[0].image.url && !posts[0].image.hideCard && (
              <div className="absolute inset-0 z-0">
                <Image
                  src={posts[0].image.url}
                  alt={posts[0].image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 100vw"
                />
                <div className="absolute inset-0 bg-linear-to-b from-background/75 via-background/85 to-background/95" />
              </div>
            )}

            <Link href={`/blog/${posts[0].slug}`} className="block">
              <div className="p-4 md:p-10 lg:p-12 relative z-10">
                <div className="flex flex-nowrap items-center gap-x-3 text-sm mb-4 text-zinc-700 dark:text-zinc-300 overflow-x-auto">
                  <PostBadges
                    post={posts[0]}
                    isLatestPost={latestSlug === posts[0].slug}
                    isHotPost={hottestSlug === posts[0].slug}
                    showCategory={true}
                  />
                  <SeriesBadge post={posts[0]} />
                </div>

                <div className="hidden md:flex flex-nowrap items-center gap-x-3 text-sm mb-4 text-zinc-700 dark:text-zinc-300 overflow-x-auto">
                  <time dateTime={posts[0].publishedAt}>
                    {new Date(posts[0].publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <span aria-hidden="true" className="text-zinc-500">•</span>
                  <span className="text-zinc-700 dark:text-zinc-300">{posts[0].readingTime.text}</span>
                  {viewCounts && viewCounts.has(posts[0].id) && viewCounts.get(posts[0].id)! > 0 && (
                    <>
                      <span aria-hidden="true" className="text-zinc-500">•</span>
                      <span className="text-zinc-700 dark:text-zinc-300">{formatViews(viewCounts.get(posts[0].id)!)} views</span>
                    </>
                  )}
                </div>

                <TitleTag className="font-bold text-3xl md:text-4xl lg:text-5xl leading-tight line-clamp-3 mb-4 text-zinc-900 dark:text-zinc-100">
                  <HighlightText text={posts[0].title} searchQuery={searchQuery} />
                </TitleTag>

                {posts[0].subtitle && (
                  <p className="font-medium text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-4">
                    <HighlightText text={posts[0].subtitle} searchQuery={searchQuery} />
                  </p>
                )}

                <p className="text-base md:text-xl leading-relaxed text-zinc-700 dark:text-zinc-300 line-clamp-2 md:line-clamp-3 mb-5">
                  <HighlightText text={posts[0].summary} searchQuery={searchQuery} />
                </p>

                {posts[0].tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {posts[0].tags.slice(0, 5).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs md:text-sm bg-zinc-200/80 text-zinc-800 dark:bg-zinc-700/80 dark:text-zinc-200">
                        {tag}
                      </Badge>
                    ))}
                    {posts[0].tags.length > 5 && (
                      <Badge variant="secondary" className="text-xs md:text-sm bg-zinc-200/80 text-zinc-800 dark:bg-zinc-700/80 dark:text-zinc-200">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.slice(1).map((p, index) => (
            <ScrollReveal
              key={p.slug}
              animation="fade-up"
              delay={(index + 1) * 50}
            >
              <article className={`group rounded-lg border overflow-hidden relative bg-card ${HOVER_EFFECTS.card} flex flex-col h-full`}>
                {/* Bookmark Button - Top Right Corner */}
                <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <BookmarkButton slug={p.slug} size="icon" variant="ghost" className="bg-background/80 backdrop-blur-sm hover:bg-background" />
                </div>

                {/* Background image */}
                {p.image && p.image.url && !p.image.hideCard && (
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={p.image.url}
                      alt={p.image.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-background/75 via-background/85 to-background/95" />
                  </div>
                )}
                <Link href={`/blog/${p.slug}`} className="flex flex-col h-full">
                  <div className="flex-1 flex flex-col p-4 relative z-10">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground mb-2 text-sm">
                      <PostBadges
                        post={p}
                        size="default"
                        isLatestPost={latestSlug === p.slug}
                        isHotPost={hottestSlug === p.slug}
                        showCategory={true}
                      />
                      <SeriesBadge post={p} size="default" />
                    </div>

                    <div className="hidden md:flex flex-nowrap items-center gap-x-2 text-muted-foreground mb-2 text-xs">
                      <time dateTime={p.publishedAt}>
                        {new Date(p.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                      <span aria-hidden="true">•</span>
                      <span>{p.readingTime.text}</span>
                      {viewCounts && viewCounts.has(p.id) && viewCounts.get(p.id)! > 0 && (
                        <>
                          <span aria-hidden="true">•</span>
                          <span>{formatViews(viewCounts.get(p.id)!)} views</span>
                        </>
                      )}
                    </div>

                    <TitleTag className="font-semibold text-lg md:text-xl line-clamp-2 mb-2">
                      <HighlightText text={p.title} searchQuery={searchQuery} />
                    </TitleTag>

                    <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                      <HighlightText text={p.summary} searchQuery={searchQuery} />
                    </p>

                    {p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {p.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {p.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
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

  // Grid layout: 2-column grid with featured posts spanning full width
  if (layout === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="post-list">
        {posts.map((p, index) => {
          // Featured posts (New or Hot) span full width on desktop
          const isFeatured = latestSlug === p.slug || hottestSlug === p.slug;

          return (
            <ScrollReveal
              key={p.slug}
              animation="fade-up"
              delay={index * 50}
              className={isFeatured ? "md:col-span-2" : ""}
            >
              <article
                className={`group rounded-lg border overflow-hidden relative bg-card ${HOVER_EFFECTS.card} flex flex-col h-full`}
              >
                {/* Bookmark Button - Top Right Corner */}
                <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <BookmarkButton slug={p.slug} size="icon" variant="ghost" className="bg-background/80 backdrop-blur-sm hover:bg-background" />
                </div>
                
                {/* Background image - only if explicitly defined in post and not hidden */}
                {p.image && p.image.url && !p.image.hideCard && (
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={p.image.url}
                      alt={p.image.alt}
                      fill
                      className="object-cover"
                      sizes={
                        isFeatured
                          ? "(max-width: 768px) 100vw, 100vw"
                          : "(max-width: 768px) 100vw, 50vw"
                      }
                    />
                    {/* Gradient overlay for text contrast */}
                    <div className="absolute inset-0 bg-linear-to-b from-background/75 via-background/85 to-background/95" />
                  </div>
                )}
                {/* TODO: Re-enable holo effects after mouse-tracking implementation for dynamic pivoting */}
                <Link href={`/blog/${p.slug}`} className="flex flex-col h-full">
                  {/* Post content - larger padding for featured posts */}
                  <div
                    className={`flex-1 flex flex-col ${isFeatured ? "p-5 md:p-8" : "p-4"} relative z-10`}
                  >
                    {/* Badges - show on all posts */}
                    <div
                      className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground mb-2 ${isFeatured ? "text-sm" : "text-xs"}`}
                    >
                      <PostBadges
                        post={p}
                        size={isFeatured ? "default" : "sm"}
                        isLatestPost={latestSlug === p.slug}
                        isHotPost={hottestSlug === p.slug}
                        showCategory={true}
                      />
                      <SeriesBadge
                        post={p}
                        size={isFeatured ? "default" : "sm"}
                      />
                    </div>

                    {/* Title - larger for featured posts */}
                    <TitleTag
                      className={`font-semibold line-clamp-2 mb-2 ${isFeatured ? "text-2xl md:text-3xl" : "text-lg md:text-xl"}`}
                    >
                      <HighlightText text={p.title} searchQuery={searchQuery} />
                    </TitleTag>

                    {/* Metadata - moved below title for featured posts (desktop only) */}
                    <div
                      className={`hidden md:flex flex-nowrap items-center gap-x-2 text-muted-foreground mb-2 ${isFeatured ? "text-xs" : "text-xs"}`}
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

                    {/* Summary - more lines for featured */}
                    <p
                      className={`text-muted-foreground flex-1 ${isFeatured ? "text-base line-clamp-4 md:line-clamp-3" : "text-sm line-clamp-3"}`}
                    >
                      <HighlightText
                        text={p.summary}
                        searchQuery={searchQuery}
                      />
                    </p>

                    {/* Tags - show more for featured posts */}
                    {p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {p.tags.slice(0, isFeatured ? 5 : 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className={isFeatured ? "text-sm" : "text-xs"}
                          >
                            {tag}
                          </Badge>
                        ))}
                        {p.tags.length > (isFeatured ? 5 : 3) && (
                          <Badge
                            variant="outline"
                            className={isFeatured ? "text-sm" : "text-xs"}
                          >
                            +{p.tags.length - (isFeatured ? 5 : 3)}
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

  // List layout: single column with full details
  if (layout === "list") {
    return (
      <div className={SPACING.subsection} data-testid="post-list">
        {posts.map((p, index) => {
          return (
            <ScrollReveal key={p.slug} animation="fade-up" delay={index * 80}>
              <article
                className={`group rounded-lg border overflow-hidden relative bg-card ${HOVER_EFFECTS.card}`}
              >
                {/* Bookmark Button - Top Right Corner */}
                <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <BookmarkButton slug={p.slug} size="icon" variant="ghost" className="bg-background/80 backdrop-blur-sm hover:bg-background" />
                </div>
                
                {/* Background image - only if explicitly defined in post and not hidden */}
                {p.image && p.image.url && !p.image.hideCard && (
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={p.image.url}
                      alt={p.image.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 100vw"
                    />
                    {/* Gradient overlay for text contrast */}
                    <div className="absolute inset-0 bg-linear-to-b from-background/75 via-background/85 to-background/95" />
                  </div>
                )}
                <Link href={`/blog/${p.slug}`} className="block">
                  <div className="p-4 md:p-8 relative z-10">
                    {/* Badges - show on all posts */}
                    <div className="flex flex-nowrap items-center gap-x-2 text-xs text-muted-foreground mb-3 overflow-x-auto">
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
                    <div className="hidden md:flex flex-nowrap items-center gap-x-2 text-xs text-muted-foreground mb-3 overflow-x-auto">
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
                    <TitleTag className="font-semibold text-xl md:text-2xl line-clamp-2 mb-3">
                      <HighlightText text={p.title} searchQuery={searchQuery} />
                    </TitleTag>

                    {/* Summary - more lines visible */}
                    <p className="text-sm md:text-base text-muted-foreground line-clamp-4 mb-4">
                      <HighlightText
                        text={p.summary}
                        searchQuery={searchQuery}
                      />
                    </p>

                    {/* Tags */}
                    {p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {p.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
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

  // Compact layout: minimal cards
  if (layout === "compact") {
    return (
      <div className={SPACING.postList} data-testid="post-list">
        {posts.map((p, index) => {
          return (
            <ScrollReveal key={p.slug} animation="fade-up" delay={index * 50}>
              <article
                className={`group rounded-lg border overflow-hidden relative bg-card ${HOVER_EFFECTS.card}`}
              >
                {/* Bookmark Button - Top Right Corner */}
                <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <BookmarkButton slug={p.slug} size="icon" variant="ghost" className="bg-background/80 backdrop-blur-sm hover:bg-background" />
                </div>
                
                {/* Background image - only if explicitly defined in post and not hidden */}
                {p.image && p.image.url && !p.image.hideCard && (
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={p.image.url}
                      alt={p.image.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {/* Gradient overlay for text contrast */}
                    <div className="absolute inset-0 bg-linear-to-b from-background/75 via-background/85 to-background/95" />
                  </div>
                )}
                <Link href={`/blog/${p.slug}`} className="block">
                  <div className="p-3 relative z-10">
                    {/* Badges - show on all posts */}
                    <div className="flex flex-nowrap items-center gap-x-2 text-xs text-muted-foreground mb-1.5 overflow-x-auto">
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
                    <div className="hidden md:flex flex-nowrap items-center gap-x-2 text-xs text-muted-foreground mb-1.5 overflow-x-auto">
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
                    <TitleTag className="font-medium text-sm sm:text-base line-clamp-2">
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

  // Grid layout (default): 2-column card layout (reuse existing grid implementation)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="post-list">
      {posts.map((p, index) => {
        return (
          <ScrollReveal 
            key={p.slug} 
            animation="fade-up"
            delay={index * 50}
          >
            <article className={`group rounded-lg border overflow-hidden relative bg-card ${HOVER_EFFECTS.card} flex flex-col h-full`}>
              {/* Background image - only if explicitly defined in post and not hidden */}
              {p.image && p.image.url && !p.image.hideCard && (
                <div className="absolute inset-0 z-0">
                  <Image
                    src={p.image.url}
                    alt={p.image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Gradient overlay for text contrast */}
                  <div className="absolute inset-0 bg-linear-to-b from-background/75 via-background/85 to-background/95" />
                </div>
              )}
              <Link href={`/blog/${p.slug}`} className="flex flex-col h-full">
                {/* Post content */}
                <div className="flex-1 p-4 flex flex-col relative z-10">
                  {/* Badges - show on all posts */}
                  <div className="flex flex-nowrap items-center gap-x-2 text-xs text-muted-foreground mb-2 overflow-x-auto">
                    <PostBadges post={p} size="sm" isLatestPost={latestSlug === p.slug} isHotPost={hottestSlug === p.slug} showCategory={true} />
                    <SeriesBadge post={p} size="sm" />
                  </div>

                  {/* Time/reading time/views - desktop only */}
                  <div className="hidden md:flex flex-nowrap items-center gap-x-2 text-xs text-muted-foreground mb-2 overflow-x-auto">
                    <time dateTime={p.publishedAt}>
                      {new Date(p.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </time>
                    <span aria-hidden="true">•</span>
                    <span>{p.readingTime.text}</span>
                    {viewCounts && viewCounts.has(p.id) && viewCounts.get(p.id)! > 0 && (
                      <>
                        <span aria-hidden="true">•</span>
                        <span>{formatViews(viewCounts.get(p.id)!)} views</span>
                      </>
                    )}
                  </div>
                  
                  {/* Title */}
                  <TitleTag className="font-semibold text-lg md:text-xl line-clamp-2 mb-2">
                    <HighlightText text={p.title} searchQuery={searchQuery} />
                  </TitleTag>
                  
                  {/* Summary */}
                  <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                    <HighlightText text={p.summary} searchQuery={searchQuery} />
                  </p>
                  
                  {/* Tags */}
                  {p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {p.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {p.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{p.tags.length - 3}
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
