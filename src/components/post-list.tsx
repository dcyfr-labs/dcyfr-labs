"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Post } from "@/data/posts";
import { PostBadges } from "@/components/post-badges";
import { SeriesBadge } from "@/components/series-badge";
import { Badge } from "@/components/ui/badge";
import { PostThumbnail } from "@/components/post-thumbnail";
import { HighlightText } from "@/components/highlight-text";
import dynamic from "next/dynamic";
import { ensurePostImage } from "@/lib/default-images";
import { HOVER_EFFECTS } from "@/lib/design-tokens";

const ScrollReveal = dynamic(() => import("@/components/scroll-reveal").then(mod => ({ default: mod.ScrollReveal })), {
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
      <div className="space-y-8" data-testid="post-list">
        {posts.map((p, index) => {
          const featuredImage = ensurePostImage(p.image, {
            title: p.title,
            tags: p.tags,
          });
          const isFirstPost = index === 0;
          const isEven = index % 2 === 0;

          // Hero layout for first post
          if (isFirstPost) {
            return (
              <ScrollReveal 
                key={p.slug} 
                animation="fade-up"
                delay={0}
                duration={600}
              >
                <article className={`group rounded-lg border overflow-hidden relative bg-card ${HOVER_EFFECTS.cardSubtle}`}>

                  <Link href={`/blog/${p.slug}`} className="block">
                    {/* Content */}
                    <div className="p-6 md:p-10 lg:p-12">
                      {/* Badges and metadata */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm mb-4">
                        <PostBadges post={p} isLatestPost={latestSlug === p.slug} isHotPost={hottestSlug === p.slug} showCategory />
                        <SeriesBadge post={p} />
                        <time dateTime={p.publishedAt} className="text-muted-foreground">
                          {new Date(p.publishedAt).toLocaleDateString("en-US", { 
                            year: "numeric", 
                            month: "long", 
                            day: "numeric" 
                          })}
                        </time>
                        <span aria-hidden="true" className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{p.readingTime.text}</span>
                        {viewCounts && viewCounts.has(p.id) && viewCounts.get(p.id)! > 0 && (
                          <>
                            <span aria-hidden="true" className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{formatViews(viewCounts.get(p.id)!)} views</span>
                          </>
                        )}
                      </div>
                      
                      {/* Large hero title */}
                      <TitleTag className="font-bold text-3xl md:text-4xl lg:text-5xl leading-tight line-clamp-3 mb-4">
                        <HighlightText text={p.title} searchQuery={searchQuery} />
                      </TitleTag>
                      
                      {/* Summary */}
                      <p className="text-base md:text-xl leading-relaxed text-muted-foreground line-clamp-2 md:line-clamp-3 mb-5">
                        <HighlightText text={p.summary} searchQuery={searchQuery} />
                      </p>
                      
                      {/* Tags with better styling */}
                      {p.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {p.tags.slice(0, 5).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs md:text-sm">
                              {tag}
                            </Badge>
                          ))}
                          {p.tags.length > 5 && (
                            <Badge variant="secondary" className="text-xs md:text-sm">
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
            <ScrollReveal 
              key={p.slug} 
              animation="fade-up"
              delay={index * 50}
              duration={600}
            >
              <article className={`group rounded-lg border overflow-hidden relative bg-card ${HOVER_EFFECTS.cardSubtle}`}>
                <Link href={`/blog/${p.slug}`} className="block">
                  {/* Content section */}
                  <div className="p-6 md:p-8">
                      {/* Badges and metadata */}
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-muted-foreground mb-3">
                        <PostBadges post={p} size="sm" isLatestPost={latestSlug === p.slug} isHotPost={hottestSlug === p.slug} showCategory />
                        <SeriesBadge post={p} size="sm" />
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
                      
                      {/* Title with better sizing */}
                      <TitleTag className="font-bold text-xl md:text-2xl lg:text-3xl leading-tight line-clamp-2 mb-3">
                        <HighlightText text={p.title} searchQuery={searchQuery} />
                      </TitleTag>
                      
                      {/* Summary with better line height */}
                      <p className="text-sm md:text-base leading-relaxed text-muted-foreground line-clamp-2 lg:line-clamp-3 mb-4">
                        <HighlightText text={p.summary} searchQuery={searchQuery} />
                      </p>
                      
                      {/* Tags - limited with better styling */}
                      {p.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {p.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {p.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
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

  // Grid layout: 2-column grid with images on top
  if (layout === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="post-list">
        {posts.map((p, index) => {
          const featuredImage = ensurePostImage(p.image, {
            title: p.title,
            tags: p.tags,
          });

          return (
            <ScrollReveal 
              key={p.slug} 
              animation="fade-up"
              delay={index * 50}
              duration={600}
            >
              <article className={`group rounded-lg border overflow-hidden relative bg-card ${HOVER_EFFECTS.cardSubtle} flex flex-col h-full`}>
                <Link href={`/blog/${p.slug}`} className="flex flex-col h-full">
                  {/* Post content */}
                  <div className="flex-1 p-4 flex flex-col">
                    {/* Badges and metadata */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mb-2">
                      <PostBadges post={p} size="sm" isLatestPost={latestSlug === p.slug} isHotPost={hottestSlug === p.slug} showCategory />
                      <SeriesBadge post={p} size="sm" />
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
                          <span className="hidden sm:inline">{formatViews(viewCounts.get(p.id)!)} views</span>
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

  // List layout: single column with full details
  if (layout === "list") {
    return (
      <div className="space-y-6" data-testid="post-list">
        {posts.map((p, index) => {
          const featuredImage = ensurePostImage(p.image, {
            title: p.title,
            tags: p.tags,
          });

          return (
            <ScrollReveal 
              key={p.slug} 
              animation="fade-up"
              delay={index * 80}
              duration={600}
            >
              <article className={`group rounded-lg border overflow-hidden relative bg-card ${HOVER_EFFECTS.cardSubtle}`}>
                <Link href={`/blog/${p.slug}`} className="block">
                  <div className="p-5 md:p-6">
                    {/* Badges and metadata */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mb-3">
                      <PostBadges post={p} size="sm" isLatestPost={latestSlug === p.slug} isHotPost={hottestSlug === p.slug} showCategory />
                      <SeriesBadge post={p} size="sm" />
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
                    <TitleTag className="font-semibold text-xl md:text-2xl line-clamp-2 mb-3">
                      <HighlightText text={p.title} searchQuery={searchQuery} />
                    </TitleTag>
                    
                    {/* Summary - more lines visible */}
                    <p className="text-sm md:text-base text-muted-foreground line-clamp-4 mb-4">
                      <HighlightText text={p.summary} searchQuery={searchQuery} />
                    </p>
                    
                    {/* Tags */}
                    {p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {p.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
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
      <div className="space-y-3" data-testid="post-list">
        {posts.map((p, index) => {
          const featuredImage = ensurePostImage(p.image, {
            title: p.title,
            tags: p.tags,
          });

          return (
            <ScrollReveal 
              key={p.slug} 
              animation="fade-up"
              delay={index * 50}
              duration={600}
            >
              <article className={`group rounded-lg border overflow-hidden relative bg-card ${HOVER_EFFECTS.cardSubtle}`}>
                <Link href={`/blog/${p.slug}`} className="block">
                  <div className="p-3">
                    {/* Badges and metadata - compact */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mb-1.5">
                      <PostBadges post={p} size="sm" isLatestPost={latestSlug === p.slug} isHotPost={hottestSlug === p.slug} showCategory />
                      <SeriesBadge post={p} size="sm" />
                      <time dateTime={p.publishedAt}>
                        {new Date(p.publishedAt).toLocaleDateString("en-US", { 
                          month: "short", 
                          day: "numeric",
                          year: "numeric"
                        })}
                      </time>
                      <span aria-hidden="true">•</span>
                      <span>{p.readingTime.text}</span>
                      {viewCounts && viewCounts.has(p.id) && viewCounts.get(p.id)! > 0 && (
                        <>
                          <span className="hidden sm:inline" aria-hidden="true">•</span>
                          <span className="hidden sm:inline">{formatViews(viewCounts.get(p.id)!)} views</span>
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="post-list">
      {posts.map((p, index) => {
        const featuredImage = ensurePostImage(p.image, {
          title: p.title,
          tags: p.tags,
        });

        return (
          <ScrollReveal 
            key={p.slug} 
            animation="fade-up"
            delay={index * 50}
            duration={600}
          >
            <article className={`group rounded-lg border overflow-hidden relative bg-card ${HOVER_EFFECTS.cardSubtle} flex flex-col h-full`}>
              <Link href={`/blog/${p.slug}`} className="flex flex-col h-full">
                {/* Post content */}
                <div className="flex-1 p-4 flex flex-col">
                  {/* Badges and metadata */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mb-2">
                    <PostBadges post={p} size="sm" isLatestPost={latestSlug === p.slug} isHotPost={hottestSlug === p.slug} showCategory />
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
                        <span className="hidden sm:inline">{formatViews(viewCounts.get(p.id)!)} views</span>
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
