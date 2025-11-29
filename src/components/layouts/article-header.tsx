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

import { TYPOGRAPHY } from '@/lib/design-tokens';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ArticleHeaderProps {
  /** Article title */
  title: string;
  
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
  };
  
  /** Additional content (e.g., metadata shown conditionally) */
  children?: React.ReactNode;
}

export function ArticleHeader({
  title,
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

  // If background image is provided, render with card-like styling
  if (backgroundImage) {
    return (
      <div className={cn("relative rounded-lg border overflow-hidden mb-8 holo-card", className)}>
        {/* Background Image with gradient overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage.url}
            alt={backgroundImage.alt}
            fill
            priority
            quality={90}
            className={cn(
              "object-cover holo-image-shift",
              backgroundImage.position && `object-${backgroundImage.position}`
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 holo-gradient-dark" />
        </div>
        
        {/* Subtle shine effect */}
        <div className="holo-shine" />

        {/* Content - positioned above background */}
        <div className="relative z-10 px-4 sm:px-6 md:px-8 py-8 md:py-12 space-y-4">
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
      </div>
    );
  }

  // Default rendering without background image
  return (
    <div className={cn("space-y-4", className)}>
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
  );
}
