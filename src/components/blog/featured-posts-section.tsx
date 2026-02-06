'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, Calendar } from 'lucide-react';
import type { Post } from '@/data/posts';
import { TYPOGRAPHY, SPACING, SEMANTIC_COLORS } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

interface FeaturedPostsSectionProps {
  /** Featured posts to display */
  posts: readonly Post[];
}

/**
 * Featured Posts Section
 *
 * Displays featured blog posts in a prominent grid layout at the top of the blog page.
 * Helps new visitors discover the best-performing and most important content.
 *
 * Features:
 * - Grid layout that responds to screen size (1 column on mobile, 2 on tablet, 2 on desktop)
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
    <section className={cn('border-b border-border/50', SPACING.section)}>
      <div className="space-y-4 mb-6">
        <div>
          <h2 className={TYPOGRAPHY.h2.standard}>Featured Articles</h2>
          <p className={cn(TYPOGRAPHY.body.small, 'text-muted-foreground')}>
            Recommended reading to get started
          </p>
        </div>
      </div>

      {/* Featured posts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((post) => {
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
                'group relative flex flex-col rounded-lg border border-border/50 p-4 transition-colors',
                'hover:bg-accent hover:border-border',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
              )}
            >
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
            </Link>
          );
        })}
      </div>
    </section>
  );
}
