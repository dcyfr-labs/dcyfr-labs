/**
 * PageHero - Standardized hero section for all core pages
 * 
 * Provides consistent hero sections with title, description, and optional actions.
 * Automatically handles responsive spacing, typography, and layout based on variant.
 * 
 * **Loading State Support:**
 * Pass `loading={true}` to render skeleton version automatically, ensuring
 * loading states always match the actual structure.
 * 
 * @example Standard hero
 * ```tsx
 * <PageHero 
 *   title="About Me" 
 *   description="Full-stack developer passionate about building great experiences"
 * />
 * ```
 * 
 * @example Loading state
 * ```tsx
 * <PageHero 
 *   loading
 *   variant="homepage"
 *   align="center"
 * />
 * ```
 * 
 * @example Centered hero
 * ```tsx
 * <PageHero 
 *   title="Welcome"
 *   description="Explore our work and ideas"
 *   align="center"
 * />
 * ```
 * 
 * @example Homepage hero with actions
 * ```tsx
 * <PageHero 
 *   variant="homepage"
 *   title="Hi, I'm Drew"
 *   description="Full-stack developer and designer"
 *   actions={
 *     <div className="flex gap-4">
 *       <Button>View Work</Button>
 *       <Button variant="outline">Contact Me</Button>
 *     </div>
 *   }
 * />
 * ```
 * 
 * @example With custom image/avatar
 * ```tsx
 * <PageHero 
 *   title="About"
 *   description="Learn more about me"
 *   image={<Avatar src="/avatar.jpg" size="lg" />}
 * />
 * ```
 */

import { ReactNode } from 'react'
import { PAGE_LAYOUT, HERO_VARIANTS, CONTAINER_WIDTHS } from '@/lib/design-tokens'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type HeroVariant = keyof typeof HERO_VARIANTS
type HeroAlign = 'left' | 'center'

interface PageHeroProps {
  /** Hero title (H1) - can be string or ReactNode for custom content */
  title?: string | ReactNode
  /** Hero description/tagline */
  description?: string | ReactNode
  /** Hero variant (determines size and styling) */
  variant?: HeroVariant
  /** Text alignment */
  align?: HeroAlign
  /** Optional image/avatar element */
  image?: ReactNode
  /** Optional action buttons/links */
  actions?: ReactNode
  /** Additional CSS classes for the container */
  className?: string
  /** Additional CSS classes for the content wrapper */
  contentClassName?: string
  /** Item count for archive pages (e.g., "5 items") */
  itemCount?: number
  /** Loading state - renders skeleton version */
  loading?: boolean
  /** Full-width background (content still constrained) */
  fullWidth?: boolean
}

export function PageHero({
  title,
  description,
  variant = 'standard',
  align = 'left',
  image,
  actions,
  className,
  contentClassName,
  itemCount,
  loading = false,
  fullWidth = false,
}: PageHeroProps) {
  const styles = HERO_VARIANTS[variant]
  const alignmentClasses = align === 'center' ? 'text-center' : ''
  const imageJustify = align === 'center' ? 'justify-center' : 'justify-center md:justify-start'

  // Loading state - render skeleton version
  if (loading) {
    const titleWidth = variant === 'homepage' ? 'w-64' : 'w-48'
    const imageSize = variant === 'homepage' 
      ? 'h-32 w-32 md:h-40 md:w-40' 
      : 'h-20 w-20 md:h-24 md:w-24'
    
    return (
      <section className={cn(PAGE_LAYOUT.hero.container, className)}>
        <div className={cn(PAGE_LAYOUT.hero.content, alignmentClasses, contentClassName)}>
          {/* Image skeleton */}
          {(variant === 'homepage' || image !== undefined) && (
            <div className={cn('flex', imageJustify)}>
              <Skeleton className={cn(imageSize, 'rounded-full')} />
            </div>
          )}

          {/* Title skeleton */}
          <Skeleton className={cn('h-10 md:h-12', titleWidth, align === 'center' && 'mx-auto')} />

          {/* Description skeleton */}
          <div className="space-y-2">
            <Skeleton className={cn('h-6 w-full max-w-2xl', align === 'center' && 'mx-auto')} />
            <Skeleton className={cn('h-6 w-3/4 max-w-2xl', align === 'center' && 'mx-auto')} />
          </div>

          {/* Actions skeleton */}
          {(variant === 'homepage' || actions !== undefined) && (
            <div className={cn('pt-2 flex gap-3', align === 'center' && 'justify-center')}>
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-32" />
              {variant === 'homepage' && <Skeleton className="h-10 w-36 hidden sm:inline-flex" />}
            </div>
          )}
        </div>
      </section>
    )
  }

  // Normal render
  if (fullWidth) {
    // Full-width variant: background extends to edges, content is constrained to archive width
    return (
      <section
        className={cn(
          "w-full pt-24 md:pt-28 lg:pt-32 pb-8 md:pb-12 relative overflow-visible",
          align === "center" && "flex flex-col items-center",
          className
        )}
      >
        <div
          className={cn(
            `mx-auto ${CONTAINER_WIDTHS.archive} px-4 sm:px-8 md:px-8 space-y-4`,
            alignmentClasses,
            align === "center" && "flex flex-col items-center w-full",
            contentClassName
          )}
        >
          {/* Optional image/avatar */}
          {image && <div className={cn("flex", imageJustify)}>{image}</div>}

          {/* Title */}
          {title && <h1 className={styles.title}>{title}</h1>}

          {/* Description */}
          {description &&
            (typeof description === "string" ? (
              <p
                className={cn(
                  styles.description,
                  "max-w-3xl",
                  align === "center" && "mx-auto"
                )}
                style={align === "center" ? { textAlign: "center" } : undefined}
              >
                {description}
                {itemCount !== undefined && (
                  <span className="text-muted-foreground block md:inline">
                    {" "}
                    ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </span>
                )}
              </p>
            ) : (
              <div
                className={cn(
                  styles.description,
                  "max-w-3xl",
                  align === "center" && "mx-auto"
                )}
              >
                {description}
              </div>
            ))}

          {/* Actions */}
          {actions && (
            <div
              className={cn("pt-2", align === "center" && "flex justify-center")}
            >
              {actions}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Standard variant: both background and content constrained
  return (
    <section
      className={cn(
        PAGE_LAYOUT.hero.container,
        "relative overflow-visible",
        align === "center" && "flex flex-col items-center",
        className
      )}
    >
      <div
        className={cn(
          PAGE_LAYOUT.hero.content,
          alignmentClasses,
          align === "center" && "flex flex-col items-center w-full",
          contentClassName
        )}
      >
        {/* Optional image/avatar */}
        {image && <div className={cn("flex", imageJustify)}>{image}</div>}

        {/* Title */}
        {title && <h1 className={styles.title}>{title}</h1>}

        {/* Description - use div for ReactNode, p for string to avoid hydration errors */}
        {description &&
          (typeof description === "string" ? (
            <p
              className={cn(
                styles.description,
                "max-w-3xl",
                align === "center" && "mx-auto"
              )}
              style={align === "center" ? { textAlign: "center" } : undefined}
            >
              {description}
              {itemCount !== undefined && (
                <span className="text-muted-foreground block md:inline">
                  {" "}
                  ({itemCount} {itemCount === 1 ? "item" : "items"})
                </span>
              )}
            </p>
          ) : (
            <div
              className={cn(
                styles.description,
                "max-w-3xl",
                align === "center" && "mx-auto"
              )}
            >
              {description}
            </div>
          ))}

        {/* Actions */}
        {actions && (
          <div
            className={cn("pt-2", align === "center" && "flex justify-center")}
          >
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
