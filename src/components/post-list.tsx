"use client";

import Link from "next/link";
import type { Post } from "@/data/posts";
import { PostBadges } from "@/components/post-badges";
import { PostThumbnail } from "@/components/post-thumbnail";
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
 * @property {"default" | "magazine" | "grid"} [layout="default"] - Layout variant to use
 */
interface PostListProps {
  posts: Post[];
  latestSlug?: string;
  hottestSlug?: string;
  titleLevel?: "h2" | "h3";
  emptyMessage?: string;
  layout?: "default" | "magazine" | "grid";
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
 * - **Layout variants**: default (compact), magazine (alternating large images), grid (2-column)
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
  layout = "default"
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const TitleTag = titleLevel;

  // Magazine layout: alternating large images
  if (layout === "magazine") {
    return (
      <div className="space-y-12" data-testid="post-list">
        {posts.map((p, index) => {
          const featuredImage = ensurePostImage(p.image, {
            title: p.title,
            tags: p.tags,
          });
          const isEven = index % 2 === 0;

          return (
            <ScrollReveal 
              key={p.slug} 
              animation="fade-up"
              delay={index * 100}
              duration={600}
            >
              <article className={`group rounded-lg border overflow-hidden ${HOVER_EFFECTS.cardSubtle}`}>
                <Link href={`/blog/${p.slug}`} className="block">
                  {/* Alternating layout: even = image left, odd = image right */}
                  <div className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    {/* Large featured image */}
                    <div className="shrink-0 md:w-1/2">
                      <PostThumbnail 
                        image={featuredImage} 
                        size="lg"
                        className="w-full aspect-video md:aspect-3/2 object-cover"
                      />
                    </div>
                    
                    {/* Post content */}
                    <div className="flex-1 min-w-0 p-6 md:p-8 flex flex-col justify-center">
                      {/* Badges and metadata */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mb-3">
                        <PostBadges post={p} size="sm" isLatestPost={latestSlug === p.slug} isHotPost={hottestSlug === p.slug} />
                        <time dateTime={p.publishedAt}>
                          {new Date(p.publishedAt).toLocaleDateString("en-US", { 
                            year: "numeric", 
                            month: "short", 
                            day: "numeric" 
                          })}
                        </time>
                        <span aria-hidden="true">•</span>
                        <span>{p.readingTime.text}</span>
                      </div>
                      
                      {/* Title - larger for magazine layout */}
                      <TitleTag className="font-semibold text-xl md:text-2xl lg:text-3xl line-clamp-3 mb-3">
                        {p.title}
                      </TitleTag>
                      
                      {/* Summary - more lines visible */}
                      <p className="text-sm md:text-base text-muted-foreground line-clamp-3 md:line-clamp-4 mb-4">{p.summary}</p>
                      
                      {/* Tags */}
                      {p.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {p.tags.slice(0, 5).map(tag => (
                            <span key={tag} className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
                              {tag}
                            </span>
                          ))}
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
              <article className={`group rounded-lg border overflow-hidden ${HOVER_EFFECTS.cardSubtle} flex flex-col h-full`}>
                <Link href={`/blog/${p.slug}`} className="flex flex-col h-full">
                  {/* Image on top */}
                  <div className="shrink-0">
                    <PostThumbnail 
                      image={featuredImage} 
                      size="md"
                      className="w-full aspect-video object-cover"
                    />
                  </div>
                  
                  {/* Post content */}
                  <div className="flex-1 p-4 flex flex-col">
                    {/* Badges and metadata */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mb-2">
                      <PostBadges post={p} size="sm" isLatestPost={latestSlug === p.slug} isHotPost={hottestSlug === p.slug} />
                      <time dateTime={p.publishedAt}>
                        {new Date(p.publishedAt).toLocaleDateString("en-US", { 
                          year: "numeric", 
                          month: "short", 
                          day: "numeric" 
                        })}
                      </time>
                      <span aria-hidden="true">•</span>
                      <span>{p.readingTime.text}</span>
                    </div>
                    
                    {/* Title */}
                    <TitleTag className="font-semibold text-lg md:text-xl line-clamp-2 mb-2">
                      {p.title}
                    </TitleTag>
                    
                    {/* Summary */}
                    <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{p.summary}</p>
                    
                    {/* Tags */}
                    {p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {p.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                            {tag}
                          </span>
                        ))}
                        {p.tags.length > 3 && (
                          <span className="text-xs px-2 py-0.5 text-muted-foreground">
                            +{p.tags.length - 3}
                          </span>
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

  // Default layout: compact horizontal cards
  return (
    <div className="space-y-4" data-testid="post-list">
      {posts.map((p, index) => {
        // Ensure every post has an image (use default if none specified)
        const featuredImage = ensurePostImage(p.image, {
          title: p.title,
          tags: p.tags,
        });

        return (
          <ScrollReveal 
            key={p.slug} 
            animation="fade-up"
            delay={index * 100}
            duration={600}
          >
            <article className={`group rounded-lg border overflow-hidden ${HOVER_EFFECTS.cardSubtle}`}>
              <Link href={`/blog/${p.slug}`} className="block">
                {/* Mobile: Vertical card layout with full-width image */}
                {/* Desktop: Horizontal layout with side thumbnail */}
                <div className="flex flex-col md:flex-row">
                  {/* Featured image - full-width on mobile, side thumbnail on desktop */}
                  <div className="shrink-0 md:p-3">
                    <PostThumbnail 
                      image={featuredImage} 
                      size="sm"
                      className="rounded-none md:rounded-md w-full aspect-video md:w-32 md:aspect-4/3 object-cover"
                    />
                  </div>
                  
                  {/* Post content */}
                  <div className="flex-1 min-w-0 p-3 sm:p-4 md:py-3 md:pr-3">
                    {/* Badges and metadata */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mb-2">
                      
                      {/* Post badges */}
                      <PostBadges post={p} size="sm" isLatestPost={latestSlug === p.slug} isHotPost={hottestSlug === p.slug} />
                      {/* Published date */}
                      <time dateTime={p.publishedAt}>
                        {new Date(p.publishedAt).toLocaleDateString("en-US", { 
                          year: "numeric", 
                          month: "short", 
                          day: "numeric" 
                        })}
                      </time>
                      {/* Reading time - show on all screens */}
                      <span aria-hidden="true">•</span>
                      <span>{p.readingTime.text}</span>
                      {/* Tags - desktop only (limit 3 + count) */}
                      {p.tags.length > 0 && (
                        <>
                          <span className="hidden md:inline-block" aria-hidden="true">•</span>
                          <span className="hidden md:inline-block">
                            {p.tags.slice(0, 3).join(" · ")}
                            {p.tags.length > 3 && ` +${p.tags.length - 3}`}
                          </span>
                        </>
                      )}
                    </div>
                    
                    {/* Title */}
                    <TitleTag className={`font-medium ${titleLevel === "h2" ? "text-base sm:text-lg md:text-xl" : "text-base sm:text-lg"} line-clamp-2 mb-1 `}>
                      {p.title}
                    </TitleTag>
                    
                    {/* Summary */}
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{p.summary}</p>
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
