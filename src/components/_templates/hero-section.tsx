/**
 * Hero Section Template
 *
 * Demonstrates correct usage of PageHero component with design tokens.
 * This is the RECOMMENDED approach for all page headers.
 *
 * **Design Token Compliance**: ✅ 100%
 * - Uses PageHero layout component
 * - All spacing via design tokens
 * - Semantic colors throughout
 *
 * @example Standard hero
 * ```tsx
 * <HeroSectionStandard />
 * ```
 *
 * @example Centered hero
 * ```tsx
 * <HeroSectionCentered />
 * ```
 *
 * @example Hero with actions
 * ```tsx
 * <HeroSectionWithActions />
 * ```
 */

import { PageHero } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';

/**
 * Standard left-aligned hero (most common)
 * Use for: About pages, standard content pages
 */
export function HeroSectionStandard() {
  return (
    <PageHero
      title="About Me"
      description="Full-stack developer passionate about building great experiences with modern web technologies."
      variant="standard"
    />
  );
}

/**
 * Centered hero (homepage style)
 * Use for: Landing pages, homepage
 */
export function HeroSectionCentered() {
  return (
    <PageHero
      title="Hi, I'm Drew"
      description="Building products that make a difference. Specializing in React, TypeScript, and modern web architecture."
      variant="homepage"
      align="center"
    />
  );
}

/**
 * Hero with action buttons
 * Use for: Pages with primary CTAs, conversion-focused pages
 */
export function HeroSectionWithActions() {
  return (
    <PageHero
      title="Let's Work Together"
      description="I'm available for freelance projects and consulting. Let's build something amazing."
      variant="standard"
      actions={
        <div className="flex gap-4">
          <Button size="lg" asChild>
            <Link href="/contact">
              Get in Touch
              <Mail className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/work">
              View My Work
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      }
    />
  );
}

/**
 * Archive page hero with item count
 * Use for: Blog listings, project archives
 */
export function HeroSectionArchive({ itemCount = 0 }: { itemCount?: number }) {
  return (
    <PageHero
      title="Blog"
      description="Thoughts on development, design, and building products"
      variant="standard"
      itemCount={itemCount}
    />
  );
}

/**
 * Minimal hero (article style)
 * Use for: Blog posts, documentation pages
 */
export function HeroSectionArticle() {
  return (
    <PageHero
      title="Building a Design System from Scratch"
      description="How we created a scalable, maintainable design system for our product"
      variant="article"
    />
  );
}
