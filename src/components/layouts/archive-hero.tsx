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

import { ReactNode } from 'react'
import Image from 'next/image'
import { PAGE_LAYOUT, HERO_VARIANTS, CONTAINER_WIDTHS, ANIMATION } from '@/lib/design-tokens'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type ArchiveVariant = 'full' | 'medium' | 'minimal'
type ArchiveAlign = 'left' | 'center'

interface ArchiveHeroProps {
  /** Hero title (H1) */
  title: string | ReactNode
  /** Hero description/tagline */
  description?: string | ReactNode
  /** Archive variant (determines background and layout) */
  variant?: ArchiveVariant
  /** Text alignment */
  align?: ArchiveAlign
  /** Optional background image URL */
  backgroundImage?: string
  /** Optional stats text (e.g., "142 articles across 12 topics") */
  stats?: string | ReactNode
  /** Optional action elements (search bar, filters, CTAs) */
  actions?: ReactNode
  /** Item count for archive pages (e.g., "5 items") */
  itemCount?: number
  /** Loading state - renders skeleton version */
  loading?: boolean
  /** Additional CSS classes for the container */
  className?: string
  /** Additional CSS classes for the content wrapper */
  contentClassName?: string
}

/**
 * Get hero variant styles based on archive variant
 */
function getVariantStyles(variant: ArchiveVariant) {
  switch (variant) {
    case 'full':
      return {
        container: 'pt-24 md:pt-28 lg:pt-32 pb-12 md:pb-16 lg:pb-20',
        hasBackground: true,
        overlayIntensity: 'from-background/45 via-background/70 to-background/95',
      }
    case 'medium':
      return {
        container: 'pt-24 md:pt-28 lg:pt-32 pb-10 md:pb-14',
        hasBackground: true,
        overlayIntensity: 'from-background/70 via-background/85 to-background/95',
      }
    case 'minimal':
      return {
        container: 'pt-24 md:pt-28 lg:pt-32 pb-8 md:pb-12',
        hasBackground: false,
        overlayIntensity: '',
      }
  }
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
  const variantStyles = getVariantStyles(variant)
  const heroStyles = HERO_VARIANTS.standard
  const alignmentClasses = align === 'center' ? 'text-center' : ''

  // Loading state
  if (loading) {
    return (
      <section className={cn(PAGE_LAYOUT.hero.container, className)}>
        <div className={cn(PAGE_LAYOUT.hero.content, alignmentClasses, contentClassName)}>
          <Skeleton className={cn('h-10 md:h-12 w-48', align === 'center' && 'mx-auto')} />
          <div className="space-y-2">
            <Skeleton className={cn('h-6 w-full max-w-2xl', align === 'center' && 'mx-auto')} />
            <Skeleton className={cn('h-6 w-3/4 max-w-2xl', align === 'center' && 'mx-auto')} />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className={cn(
        'w-full relative overflow-hidden',
        variantStyles.container,
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
          <div className={cn('absolute inset-0 bg-linear-to-b', variantStyles.overlayIntensity, ANIMATION.transition.appearance)} />
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          `mx-auto ${CONTAINER_WIDTHS.archive} px-4 sm:px-8 md:px-8 space-y-4 md:space-y-6 relative z-10`,
          alignmentClasses,
          align === 'center' && 'flex flex-col items-center w-full',
          contentClassName
        )}
      >
        {/* Title */}
        <h1 className={heroStyles.title}>{title}</h1>

        {/* Description */}
        {description && (
          typeof description === 'string' ? (
            <p
              className={cn(
                heroStyles.description,
                'max-w-3xl',
                align === 'center' && 'mx-auto'
              )}
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
          ) : (
            <div
              className={cn(
                heroStyles.description,
                'max-w-3xl',
                align === 'center' && 'mx-auto'
              )}
            >
              {description}
            </div>
          )
        )}

        {/* Stats (e.g., "142 articles across 12 topics") */}
        {stats && (
          typeof stats === 'string' ? (
            <p className={cn('text-sm text-muted-foreground', align === 'center' && 'mx-auto')}>
              {stats}
            </p>
          ) : (
            <div className={cn('text-sm', align === 'center' && 'mx-auto')}>
              {stats}
            </div>
          )
        )}

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
  )
}
