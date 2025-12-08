'use client';

/**
 * HeroOverlay Component
 * 
 * Universal overlay component for hero images and SVG assets with automatic light/dark mode awareness.
 * Provides consistent text contrast across blog posts, project pages, and other hero sections.
 * 
 * Features:
 * - Automatic light/dark mode detection
 * - Customizable overlay variants for different content types
 * - Gradient overlays for smoother transitions
 * - Support for multi-directional overlays (top, bottom, full)
 * - Accessibility optimized (aria-hidden, no interactive interference)
 * - Works with images, SVG assets, and solid backgrounds
 * 
 * @example Basic usage with default overlay
 * ```tsx
 * <div className="relative">
 *   <img src="/hero.jpg" alt="Hero" className="w-full" />
 *   <HeroOverlay />
 * </div>
 * ```
 * 
 * @example Custom overlay variant and direction
 * ```tsx
 * <HeroOverlay variant="project" direction="full" />
 * ```
 * 
 * @example Multiple overlays for complex layouts
 * ```tsx
 * <div className="relative">
 *   <HeroOverlay variant="blog" direction="top" intensity="strong" />
 *   <HeroOverlay variant="blog" direction="bottom" intensity="medium" />
 *   <Content />
 * </div>
 * ```
 */

import { cn } from '@/lib/utils';

type OverlayVariant = 'blog' | 'project' | 'default';
type OverlayDirection = 'top' | 'bottom' | 'full';
type OverlayIntensity = 'light' | 'medium' | 'strong';

interface HeroOverlayProps {
  /** Overlay variant determines the color scheme and contrast strength */
  variant?: OverlayVariant;
  
  /** Direction of the gradient overlay */
  direction?: OverlayDirection;
  
  /** Intensity of the overlay effect */
  intensity?: OverlayIntensity;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Height of gradient fade (default: varies by direction) */
  height?: string;
  
  /** Custom z-index (default: 10) */
  zIndex?: number;
}

/**
 * Get overlay gradient classes based on variant, direction, and intensity
 * Automatically adapts to light/dark mode using CSS custom properties
 */
function getOverlayClasses(
  variant: OverlayVariant = 'default',
  direction: OverlayDirection = 'top',
  intensity: OverlayIntensity = 'medium'
): string {
  const baseClasses = 'absolute pointer-events-none';
  
  // Direction and size classes
  const directionClasses = {
    top: 'inset-x-0 top-0',
    bottom: 'inset-x-0 bottom-0',
    full: 'inset-0',
  };
  
  // Intensity-based height
  const heightByIntensity = {
    light: {
      top: 'h-24',
      bottom: 'h-20',
      full: 'h-auto',
    },
    medium: {
      top: 'h-32',
      bottom: 'h-24',
      full: 'h-auto',
    },
    strong: {
      top: 'h-40',
      bottom: 'h-32',
      full: 'h-auto',
    },
  };
  
  // Gradient overlays with light/dark mode awareness
  // Using background-color with HSL variables for automatic theme adaptation
  const gradientClasses = {
    // Blog posts - higher contrast for readable titles and captions
    blog: {
      top: {
        light: 'bg-linear-to-b from-background/90 via-background/50 to-transparent',
        medium: 'bg-linear-to-b from-background/95 via-background/60 to-transparent',
        strong: 'bg-linear-to-b from-background/97 via-background/70 to-transparent',
      },
      bottom: {
        light: 'bg-linear-to-t from-background/80 to-transparent',
        medium: 'bg-linear-to-t from-background/90 to-transparent',
        strong: 'bg-linear-to-t from-background/95 to-transparent',
      },
      full: {
        light: 'bg-gradient-to-b from-black/40 via-black/20 to-black/40',
        medium: 'bg-gradient-to-b from-black/50 via-black/30 to-black/50',
        strong: 'bg-gradient-to-b from-black/60 via-black/40 to-black/60',
      },
    },
    
    // Project pages - balanced contrast with emphasis on header area
    project: {
      top: {
        light: 'bg-linear-to-b from-background/85 via-background/40 to-transparent',
        medium: 'bg-linear-to-b from-background/90 via-background/50 to-transparent',
        strong: 'bg-linear-to-b from-background/95 via-background/60 to-transparent',
      },
      bottom: {
        light: 'bg-linear-to-t from-background/70 to-transparent',
        medium: 'bg-linear-to-t from-background/80 to-transparent',
        strong: 'bg-linear-to-t from-background/90 to-transparent',
      },
      full: {
        light: 'bg-gradient-to-b from-black/10 to-black/5 to-black/10',
        medium: 'bg-gradient-to-b from-black/20 via-black/10 to-black/20',
        strong: 'bg-gradient-to-b from-black/30 via-black/20 to-black/30',
      },
    },
    
    // Default - subtle overlay for generic use cases
    default: {
      top: {
        light: 'bg-linear-to-b from-background/75 via-background/30 to-transparent',
        medium: 'bg-linear-to-b from-background/85 via-background/40 to-transparent',
        strong: 'bg-linear-to-b from-background/90 via-background/50 to-transparent',
      },
      bottom: {
        light: 'bg-linear-to-t from-background/60 to-transparent',
        medium: 'bg-linear-to-t from-background/70 to-transparent',
        strong: 'bg-linear-to-t from-background/80 to-transparent',
      },
      full: {
        light: 'bg-gradient-to-b from-black/20 via-black/10 to-black/20',
        medium: 'bg-gradient-to-b from-black/35 via-black/20 to-black/35',
        strong: 'bg-gradient-to-b from-black/50 via-black/30 to-black/50',
      },
    },
  };
  
  const directionClass = directionClasses[direction];
  const heightClass = heightByIntensity[intensity][direction];
  const gradientClass = gradientClasses[variant][direction][intensity];
  
  return cn(baseClasses, directionClass, heightClass, gradientClass);
}

export function HeroOverlay({
  variant = 'default',
  direction = 'top',
  intensity = 'medium',
  className,
  height,
  zIndex = 10,
}: HeroOverlayProps) {
  const overlayClasses = getOverlayClasses(variant, direction, intensity);
  
  return (
    <div
      className={cn(overlayClasses, className)}
      style={{ zIndex }}
      aria-hidden="true"
    />
  );
}

/**
 * Composite overlay for blog posts (top + bottom)
 * Provides balanced contrast for titles and captions
 */
export function BlogPostHeroOverlay({
  intensity = 'medium',
  className,
  zIndex = 10,
}: {
  intensity?: OverlayIntensity;
  className?: string;
  zIndex?: number;
}) {
  return (
    <>
      <HeroOverlay
        variant="blog"
        direction="full"
        intensity={intensity}
        className={className}
        zIndex={zIndex}
      />
    </>
  );
}

/**
 * Composite overlay for project pages (top + subtle bottom)
 * Emphasizes header area while maintaining readability
 */
export function ProjectHeroOverlay({
  intensity = 'medium',
  className,
  zIndex = 10,
}: {
  intensity?: OverlayIntensity;
  className?: string;
  zIndex?: number;
}) {
  return (
    <>
      <HeroOverlay
        variant="project"
        direction="full"
        intensity={intensity}
        className={className}
        zIndex={zIndex}
      />
    </>
  );
}

export type { OverlayVariant, OverlayDirection, OverlayIntensity, HeroOverlayProps };
