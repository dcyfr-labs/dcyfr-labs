/**
 * Article Header Component
 * 
 * Standardized header for individual item pages with title, date, tags, and badges.
 * Provides consistent metadata display across all article-type pages.
 * Now supports featured background images with gradient overlays matching card designs.
 * 
 * @example
 * ```tsx
 * <ArticleHeader
 *   title="Building a Design System"
 *   date={new Date('2025-11-10')}
 *   tags={['react', 'design', 'typescript']}
 *   badges={<PostBadges draft={false} archived={false} />}
 *   metadata="5 min read · 1,234 views"
 *   backgroundImage={{
 *     url: "/blog/hero.jpg",
 *     alt: "Hero image"
 *   }}
 * />
 * ```
 */

import { TYPOGRAPHY, IMAGE_PLACEHOLDER } from '@/lib/design-tokens';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ProjectHeroOverlay } from '@/components/common';
import { cn } from '@/lib/utils';

export interface ArticleHeaderProps {
  /** Article title */
  title: string;
  
  /** Subtitle displayed below title (alternative to em-dash in title) */
  subtitle?: string;
  
  /** Published date (optional) */
  date?: Date;
  
  /** Tags/keywords (optional) */
  tags?: string[];
  
  /** Custom badges (e.g., Draft, New, etc.) */
  badges?: React.ReactNode;
  
  /** Additional metadata string (e.g., "5 min read · 1,234 views") */
  metadata?: string;
  
  /** Date format (default: "MMMM d, yyyy") */
  dateFormat?: 'short' | 'long';
  
  /** Show tags inline vs below title (default: below) */
  inlineTags?: boolean;
  
  /** Custom className */
  className?: string;
  
  /** Function to generate tag URLs (returns URL string) */
  onTagClick?: (tag: string) => string;
  
  /** Featured background image with gradient overlay */
  backgroundImage?: {
    url: string;
    alt: string;
    position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
    /** Optional caption text to display below the image */
    caption?: string;
    /** Optional credit/attribution for the image */
    credit?: string;
    /** Preload image for performance (use for featured/above-fold images) */
    priority?: boolean;
    /** Hide image in hero section */
    hideHero?: boolean;
  };
  
  /** Additional content (e.g., metadata shown conditionally) */
  children?: React.ReactNode;
}

export function ArticleHeader({
  title,
  subtitle,
  date,
  tags = [],
  badges,
  metadata,
  dateFormat = 'long',
  inlineTags = false,
  className,
  onTagClick,
  backgroundImage,
  children,
}: ArticleHeaderProps) {
  /**
   * Format date for display
   */
  const formattedDate = date 
    ? date.toLocaleDateString('en-US', 
        dateFormat === 'long' 
          ? { year: 'numeric', month: 'long', day: 'numeric' }
          : { year: 'numeric', month: 'short', day: 'numeric' }
      )
    : null;

  // Text content outside card, card contains only image
  return (
    <div className={className}>
      {/* Text Content Section - Outside and above the card */}
      <div className="space-y-3 mb-6">
        {/* Badges */}
        {badges && (
          <div className="flex flex-wrap gap-2">
            {badges}
          </div>
        )}

        {/* Title */}
        <h1 className={TYPOGRAPHY.h1.article}>
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        )}

        {/* Metadata Row */}
        {(date || metadata) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
            {formattedDate && (
              <time dateTime={date?.toISOString()}>
                {formattedDate}
              </time>
            )}
            
            {metadata && (
              <>
                {formattedDate && <span aria-hidden="true">·</span>}
                <span>{metadata}</span>
              </>
            )}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className={cn(
            "flex flex-wrap items-center gap-2",
            !inlineTags && "mt-4"
          )}>
            {!inlineTags && (
              <span className="text-sm text-muted-foreground">
                Tagged:
              </span>
            )}
            {tags.map((tag) => {
              const tagUrl = onTagClick?.(tag);
              const badgeContent = (
                <Badge
                  key={tag}
                  variant="outline"
                  className={cn(
                    "text-xs",
                    tagUrl && "cursor-pointer hover:bg-accent transition-colors"
                  )}
                >
                  {tag}
                </Badge>
              );
              
              return tagUrl ? (
                <Link key={tag} href={tagUrl}>
                  {badgeContent}
                </Link>
              ) : badgeContent;
            })}
          </div>
        )}
        
        {/* Children (additional content) */}
        {children}
      </div>

      {/* Featured Image Card - rendered below text */}
      {backgroundImage && !backgroundImage.hideHero && (
        <figure className="not-prose mb-8">
          <div className="relative w-full aspect-video overflow-hidden bg-muted rounded-lg border">
            {/* TODO: Re-enable holo effects after mouse-tracking implementation for dynamic pivoting */}
            <Image
              src={backgroundImage.url}
              alt={backgroundImage.alt}
              fill
              priority={backgroundImage.priority || false}
              quality={90}
              placeholder="blur"
              blurDataURL={IMAGE_PLACEHOLDER.blur}
              className={cn(
                "object-cover",
                backgroundImage.position && `object-${backgroundImage.position}`
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
            {/* Light/dark mode aware overlay for enhanced text contrast */}
            <ProjectHeroOverlay intensity="light" />
          </div>

          {/* Caption and Credit - show only when present */}
          {(backgroundImage.caption || backgroundImage.credit) && (
            <figcaption className="px-4 sm:px-8 md:px-8 pt-3 text-sm text-muted-foreground">
              {backgroundImage.caption && (
                <p className="mb-1">{backgroundImage.caption}</p>
              )}
              {backgroundImage.credit && (
                <p className="text-xs">Photo by {backgroundImage.credit}</p>
              )}
            </figcaption>
          )}
        </figure>
      )}
    </div>
  );
}
