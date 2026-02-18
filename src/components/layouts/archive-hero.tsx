/**
 * ArchiveHero - Hero section for archive pages (blog, work, certifications)
 *
 * Enhanced hero with background gradient, search/filters, and stats.
 * Provides three variants: full (with background), medium (minimal background), minimal (no background).
 *
 * @example Full variant (Blog archive)
 * ```tsx
 * <ArchiveHero
 *   variant="full"
 *   title="Blog"
 *   description="Articles on security, development, and technology"
 *   stats="142 articles across 12 topics"
 *   actions={<SearchBar />}
 * />
 * ```
 *
 * @example Medium variant (Series/Tag archives)
 * ```tsx
 * <ArchiveHero
 *   variant="medium"
 *   title="React Series"
 *   description="In-depth articles about React development"
 *   itemCount={8}
 * />
 * ```
 *
 * @example Minimal variant (Individual content)
 * ```tsx
 * <ArchiveHero
 *   variant="minimal"
 *   title="Project Details"
 *   description="Full-stack application built with Next.js"
 * />
 * ```
 */

import { ReactNode } from 'react';
import Image from 'next/image';
import {
  PAGE_LAYOUT,
  HERO_VARIANTS,
  CONTAINER_WIDTHS,
  ANIMATION,
  CONTAINER_PADDING,
  SPACING,
  TYPOGRAPHY,
} from '@/lib/design-tokens';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type ArchiveVariant = 'full' | 'medium' | 'minimal';
type ArchiveAlign = 'left' | 'center';

interface ArchiveHeroProps {
  /** Hero title (H1) */
  title: string | ReactNode;
  /** Hero description/tagline */
  description?: string | ReactNode;
  /** Archive variant (determines background and layout) */
  variant?: ArchiveVariant;
  /** Text alignment */
  align?: ArchiveAlign;
  /** Optional background image URL */
  backgroundImage?: string;
  /** Optional stats text (e.g., "142 articles across 12 topics") */
  stats?: string | ReactNode;
  /** Optional action elements (search bar, filters, CTAs) */
  actions?: ReactNode;
  /** Item count for archive pages (e.g., "5 items") */
  itemCount?: number;
  /** Loading state - renders skeleton version */
  loading?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
  /** Additional CSS classes for the content wrapper */
  contentClassName?: string;
}

/**
 * Get hero variant styles based on archive variant
 */
function getVariantStyles(variant: ArchiveVariant) {
  switch (variant) {
    case 'full':
      return {
        hasBackground: true,
        overlayIntensity: 'from-background/45 via-background/70 to-background/95',
      };
    case 'medium':
      return {
        hasBackground: true,
        overlayIntensity: 'from-background/70 via-background/85 to-background/95',
      };
    case 'minimal':
      return {
        hasBackground: false,
        overlayIntensity: '',
      };
  }
}

/** Render the description block, handling both string and ReactNode values */
function renderArchiveDescription(
  description: string | ReactNode | undefined,
  itemCount: number | undefined,
  align: ArchiveAlign,
  descriptionClass: string
): ReactNode {
  if (!description) return null;
  if (typeof description === 'string') {
    return (
      <p
        className={cn(descriptionClass, 'max-w-3xl', align === 'center' && 'mx-auto')}
        style={align === 'center' ? { textAlign: 'center' } : undefined}
      >
        {description}
        {itemCount !== undefined && (
          <span className="text-muted-foreground block md:inline">
            {' '}
            ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
        )}
      </p>
    );
  }
  return (
    <div className={cn(descriptionClass, 'max-w-3xl', align === 'center' && 'mx-auto')}>
      {description}
    </div>
  );
}

/** Render the stats block, handling both string and ReactNode values */
function renderArchiveStats(stats: string | ReactNode | undefined, align: ArchiveAlign): ReactNode {
  if (!stats) return null;
  if (typeof stats === 'string') {
    return (
      <p className={cn('text-sm text-muted-foreground', align === 'center' && 'mx-auto')}>
        {stats}
      </p>
    );
  }
  return <div className={cn('text-sm', align === 'center' && 'mx-auto')}>{stats}</div>;
}

export function ArchiveHero({
  title,
  description,
  variant = 'full',
  align = 'left',
  backgroundImage,
  stats,
  actions,
  itemCount,
  loading = false,
  className,
  contentClassName,
}: ArchiveHeroProps) {
  const variantStyles = getVariantStyles(variant);
  const heroStyles = HERO_VARIANTS.standard;
  const alignmentClasses = align === 'center' ? 'text-center' : '';

  // Loading state
  if (loading) {
    return (
      <section className={cn(PAGE_LAYOUT.hero.archiveContainer, PAGE_LAYOUT.hero.padding, className)}>
        <div className={cn(PAGE_LAYOUT.hero.content, alignmentClasses, contentClassName)}>
          <Skeleton className={cn('h-10 md:h-12 w-48', align === 'center' && 'mx-auto')} />
          <div className={SPACING.compact}>
            <Skeleton className={cn('h-6 w-full max-w-2xl', align === 'center' && 'mx-auto')} />
            <Skeleton className={cn('h-6 w-3/4 max-w-2xl', align === 'center' && 'mx-auto')} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        'w-full relative overflow-hidden',
        PAGE_LAYOUT.hero.padding,
        align === 'center' && 'flex flex-col items-center',
        className
      )}
    >
      {/* Background image with gradient overlay (full and medium variants only) */}
      {variantStyles.hasBackground && backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage}
            alt=""
            fill
            className={cn('object-cover', ANIMATION.transition.slow)}
            sizes="100vw"
            priority
          />
          {/* Gradient overlay for text contrast */}
          <div
            className={cn(
              'absolute inset-0 bg-linear-to-b',
              variantStyles.overlayIntensity,
              ANIMATION.transition.appearance
            )}
          />
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          PAGE_LAYOUT.hero.archiveContainer,
          PAGE_LAYOUT.hero.content,
          'relative z-10',
          alignmentClasses,
          align === 'center' && 'flex flex-col items-center w-full',
          contentClassName
        )}
      >
        {/* Title */}
        <h1 className={TYPOGRAPHY.h1.hero}>{title}</h1>

        {/* Description */}
        {renderArchiveDescription(description, itemCount, align, heroStyles.description)}

        {/* Stats (e.g., "142 articles across 12 topics") */}
        {renderArchiveStats(stats, align)}

        {/* Actions (search bar, filters, CTAs) */}
        {actions && (
          <div
            className={cn(
              'pt-2 w-full max-w-2xl',
              align === 'center' ? 'mx-auto flex justify-center' : ''
            )}
          >
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
