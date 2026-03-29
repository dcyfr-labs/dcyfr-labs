'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonText } from '@/components/ui/skeleton-primitives';
import { ArrowRight, Clock } from 'lucide-react';
import type { Post } from '@/data/posts';
import {
  TYPOGRAPHY,
  SPACING,
  ANIMATION,
  HOVER_EFFECTS,
  FOCUS_RING,
  SHADOWS,
} from '@/lib/design-tokens';
import { AUTHOR_NAME } from '@/lib/site-config';
import { cn } from '@/lib/utils';

interface FeaturedPostHeroProps {
  readonly post?: Post;
  /** Loading state - renders skeleton version */
  readonly loading?: boolean;
}

/** True when the post has a background card image visible */
function hasVisibleImage(post: Post): boolean {
  return !!(post.image?.url && !post.image.hideCard);
}

export function FeaturedPostHero({ post, loading = false }: FeaturedPostHeroProps) {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  const withImage = post ? hasVisibleImage(post) : false;

  if (loading) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border',
          SHADOWS.card.rest,
          ANIMATION.transition.base
        )}
      >
        <div className="absolute inset-0 z-0">
          <Skeleton className="h-full w-full" />
        </div>
        <div className={cn('relative z-10 p-4 md:p-8', SPACING.content)}>
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-5 w-28 rounded-md" />
          </div>
          <div className={SPACING.subsection}>
            <Skeleton className="h-10 md:h-12 w-3/4 mb-4" />
            <div className={SPACING.compact}>
              <SkeletonText lines={3} />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  const publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  return (
    <Link
      href={`/blog/${post.slug}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePosition({ x: 0.5, y: 0.5 })}
      className={cn(
        'group block relative overflow-hidden rounded-xl border',
        HOVER_EFFECTS.card,
        SHADOWS.card.rest,
        FOCUS_RING.default
      )}
    >
      {/* Radial glow following cursor */}
      <div
        className={cn(
          'absolute inset-0 z-10 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none',
          ANIMATION.transition.base
        )}
        style={{
          background: `radial-gradient(500px circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, hsl(var(--primary) / 0.08), transparent 50%)`,
        }}
        aria-hidden="true"
      />

      {/* Background image */}
      {withImage && post.image && (
        <div className="absolute inset-0 z-0">
          <Image
            src={post.image.url}
            alt={post.image.alt || post.title}
            fill
            className={cn('object-cover', ANIMATION.transition.slow)}
            sizes="(max-width: 768px) 100vw, 1200px"
            priority
          />
          <div
            className="absolute inset-0 bg-linear-to-b from-black/40 via-black/65 to-black/85"
            aria-hidden="true"
          />
        </div>
      )}

      <div className={cn('relative z-10 p-4 md:p-8', SPACING.content)}>
        {/* Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <Badge
            variant="default"
            className={cn(
              TYPOGRAPHY.label.xs,
              'backdrop-blur-sm',
              withImage
                ? 'bg-zinc-500/30 text-white border border-zinc-400/30'
                : 'bg-zinc-700 text-white border-none'
            )}
          >
            Latest Research
          </Badge>
          {post.tags.slice(0, 2).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/blog?tag=${encodeURIComponent(tag)}`);
              }}
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm transition-colors',
                withImage
                  ? 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                  : 'border-border/50 text-foreground hover:bg-accent'
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Title & summary */}
        <div className={SPACING.subsection}>
          <h2
            className={cn(
              TYPOGRAPHY.h2.featured,
              'md:text-4xl',
              withImage ? 'text-white' : 'text-foreground'
            )}
          >
            {post.title}
          </h2>
          {post.subtitle && (
            <p
              className={cn(
                TYPOGRAPHY.h3.standard,
                withImage ? 'text-white/80' : 'text-foreground/80'
              )}
            >
              {post.subtitle}
            </p>
          )}
          <p
            className={cn(
              TYPOGRAPHY.description,
              withImage ? 'text-white/80' : 'text-foreground/70'
            )}
          >
            {post.summary}
          </p>
        </div>

        {/* Metadata & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="flex flex-col gap-1">
            <div
              className={cn(
                'flex items-center gap-4 text-sm',
                withImage ? 'text-white/70' : 'text-foreground/60'
              )}
            >
              <time dateTime={post.publishedAt}>{publishedDate}</time>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {post.readingTime.text}
              </span>
            </div>
            <p
              className={cn(
                TYPOGRAPHY.metadata,
                withImage ? 'text-white/50' : 'text-foreground/40'
              )}
            >
              By {AUTHOR_NAME} · 25 certifications · 6+ yrs security architecture
            </p>
          </div>

          <span
            className={cn(
              'inline-flex items-center gap-1.5 font-medium shrink-0',
              ANIMATION.transition.base,
              withImage ? 'text-white' : 'text-primary'
            )}
          >
            Read post
            <ArrowRight
              className={cn('h-4 w-4 group-hover:translate-x-1', ANIMATION.transition.movement)}
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
