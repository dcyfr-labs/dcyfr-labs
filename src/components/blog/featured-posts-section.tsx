'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, Calendar } from 'lucide-react';
import type { Post } from '@/data/posts';
import { TYPOGRAPHY, SPACING, IMAGE_PLACEHOLDER } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface FeaturedPostsSectionProps {
  /** Featured posts to display */
  posts: readonly Post[];
}

interface FeaturedCardImageProps {
  readonly post: Post;
  readonly index: number;
}

function FeaturedCardImage({ post, index }: FeaturedCardImageProps) {
  const [imgError, setImgError] = useState(false);
  const hasImage = post.image?.url && !post.image.hideCard && !imgError;

  if (hasImage) {
    return (
      <div className="relative h-44 overflow-hidden rounded-t-lg">
        <Image
          src={post.image!.url}
          alt={post.image!.alt || post.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={index === 0}
          placeholder="blur"
          blurDataURL={IMAGE_PLACEHOLDER.blur}
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
      </div>
    );
  }

  // Gradient fallback when no cover image
  return (
    <div className="relative h-20 overflow-hidden rounded-t-lg bg-linear-to-br from-primary/10 via-muted/40 to-muted/20" />
  );
}

/**
 * Featured Posts Section
 *
 * Displays featured blog posts in a prominent grid layout at the top of the blog page.
 * Helps new visitors discover the best-performing and most important content.
 *
 * Features:
 * - Grid layout that responds to screen size (1 column on mobile, 2 on tablet, 2 on desktop)
 * - Cover image with gradient overlay (fallback gradient when no image)
 * - Featured badge indicator
 * - Post metadata (date, reading time)
 * - Clear call-to-action
 * - Design token compliance
 *
 * @component
 * @param {FeaturedPostsSectionProps} props
 * @param {Post[]} props.posts - Array of featured posts to display
 *
 * @example
 * import { featuredPosts } from '@/data/posts';
 * <FeaturedPostsSection posts={featuredPosts} />
 */
export function FeaturedPostsSection({ posts }: FeaturedPostsSectionProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className={cn('border-b border-border/50 pb-8 md:pb-10 lg:pb-14', SPACING.section)}>
      <div className={`${SPACING.content} mb-6`}>
        <div>
          <h2 className={TYPOGRAPHY.h2.standard}>Featured Articles</h2>
          <p className={cn(TYPOGRAPHY.body.small, 'text-muted-foreground')}>
            Recommended reading to get started
          </p>
        </div>
      </div>

      {/* Featured posts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((post, index) => {
          const publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });

          return (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className={cn(
                'group relative flex flex-col h-full rounded-lg border border-border/50 overflow-hidden transition-colors',
                'hover:bg-accent hover:border-border',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
              )}
            >
              {/* Cover image */}
              <FeaturedCardImage post={post} index={index} />

              {/* Card content */}
              <div className="flex flex-col flex-1 p-4">
                {/* Featured Badge */}
                <div className="mb-3">
                  <Badge variant="default" className="text-xs">
                    Featured
                  </Badge>
                </div>

                {/* Post Title */}
                <h3
                  className={cn(
                    TYPOGRAPHY.h3.standard,
                    'group-hover:text-primary transition-colors line-clamp-2'
                  )}
                >
                  {post.title}
                </h3>

                {/* Post Summary */}
                <p className={cn(TYPOGRAPHY.body.small, 'text-muted-foreground my-2 line-clamp-2')}>
                  {post.summary}
                </p>

                {/* Tags (first 2) */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 my-3">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          'inline-block px-2 py-1 rounded text-xs',
                          'bg-secondary text-secondary-foreground'
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 2 && (
                      <span className={cn('text-xs text-muted-foreground')}>
                        +{post.tags.length - 2} more
                      </span>
                    )}
                  </div>
                )}

                {/* Metadata and CTA */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/30">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {publishedDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {post.readingTime.minutes} min
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
