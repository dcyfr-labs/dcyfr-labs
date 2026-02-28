'use client';

import * as React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SITE_URL } from '@/lib/site-config';
import { SPACING, BORDERS, TYPOGRAPHY, SPACING_SCALE } from '@/lib/design-tokens';

/**
 * SeriesBackgroundNote Component
 *
 * Displays contextual background information about multi-part series posts.
 * Links to previous/related posts in the series using absolute URLs.
 *
 * @component
 * @example
 * ```tsx
 * <SeriesBackgroundNote
 *   description="This is a follow-up to"
 *   previousPost={{
 *     title: "Shipping a Developer Portfolio",
 *     slug: "shipping-developer-portfolio"
 *   }}
 *   context="where I built the foundation for what would become a comprehensive developer platform."
 * />
 * ```
 *
 * @rss-compatibility
 * - Component is rendered to HTML in RSS feeds via mdx-to-html.ts
 * - Uses absolute URLs (SITE_URL) for proper link resolution
 * - Semantic blockquote HTML for maximum compatibility
 * - No client-side interactivity required
 *
 * @implementation
 * - Left border accent with BookOpen icon
 * - Absolute URLs for all internal links
 * - Design tokens for consistent styling
 * - Renders as semantic blockquote for RSS feeds
 *
 * @accessibility
 * - Semantic HTML with role="note"
 * - Strong emphasis on "Series Background" label
 * - Icon is decorative (aria-hidden="true")
 */

interface SeriesBackgroundNoteProps {
  /** Introductory description (e.g., "This is a follow-up to" or "This is Part 3 of") */
  description: string;
  /** Previous/related post information */
  previousPost?: {
    title: string;
    slug: string;
  };
  /** Additional previous posts (for multi-part series) */
  additionalPosts?: Array<{
    title: string;
    slug: string;
  }>;
  /** Context description after the links */
  context?: string;
  /** Optional className */
  className?: string;
}

export function SeriesBackgroundNote({
  description,
  previousPost,
  additionalPosts = [],
  context,
  className,
}: SeriesBackgroundNoteProps) {
  // Build absolute URLs for links
  const getAbsoluteUrl = (slug: string) => `${SITE_URL}/blog/${slug}`;

  return (
    <blockquote
      role="note"
      className={cn(
        'series-background-note',
        'border-l-4 border-primary bg-muted/50 rounded-r-md',
        `pl-${SPACING_SCALE.md} pr-${SPACING_SCALE.md} py-${SPACING_SCALE.sm}`,
        `my-${SPACING_SCALE.lg}`,
        'not-prose',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <BookOpen className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
        <div className={cn(TYPOGRAPHY.body, 'text-foreground')}>
          <strong className="font-semibold">Series Background:</strong> {description}{' '}
          {previousPost && (
            <Link
              href={`/blog/${previousPost.slug}`}
              className="text-primary hover:underline font-medium"
              data-absolute-url={getAbsoluteUrl(previousPost.slug)}
            >
              {previousPost.title}
            </Link>
          )}
          {additionalPosts.length > 0 && (
            <>
              {additionalPosts.map((post, index) => (
                <React.Fragment key={post.slug}>
                  {index === 0
                    ? previousPost
                      ? ' and '
                      : ''
                    : index === additionalPosts.length - 1
                      ? ', and '
                      : ', '}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-primary hover:underline font-medium"
                    data-absolute-url={getAbsoluteUrl(post.slug)}
                  >
                    {post.title}
                  </Link>
                </React.Fragment>
              ))}
            </>
          )}
          {context && <span>. {context}</span>}
        </div>
      </div>
    </blockquote>
  );
}
