/**
 * Homepage Hero Actions Component
 * 
 * Client component for hero section buttons with conversion tracking.
 * Provides responsive button layout with visual hierarchy and icons.
 * 
 * Layout:
 * - Desktop: Primary button large + Secondary button standard + Tertiary outline
 * - Mobile: Primary button full-width, Secondary/Tertiary stacked below
 */

'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';
import { Briefcase, BookOpen, Info } from 'lucide-react';

export function HomepageHeroActions() {
  const handleBlogClick = () => {
    trackEvent({
      name: 'external_link_clicked',
      properties: {
        url: '/blog',
        source: 'homepage_hero_primary_cta',
      },
    });
  };

  const handleProjectsClick = () => {
    trackEvent({
      name: 'external_link_clicked',
      properties: {
        url: '/work',
        source: 'homepage_hero_secondary_cta',
      },
    });
  };

  const handleAboutClick = () => {
    trackEvent({
      name: 'external_link_clicked',
      properties: {
        url: '/about',
        source: 'homepage_hero_tertiary_cta',
      },
    });
  };

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 pt-4 sm:pt-6 justify-center items-center">
      {/* Primary CTA - Our Work */}
      <Button
        variant="cta"
        asChild
        size="default"
        className="gap-2 hover:scale-105 transition-transform duration-200"
      >
        <Link href="/work" onClick={handleProjectsClick}>
          <Briefcase className="h-4 w-4" />
          <span>View our work</span>
        </Link>
      </Button>

      {/* Secondary CTA - Blog */}
      <Button
        variant="cta-outline"
        asChild
        size="default"
        className="gap-2 hover:scale-105 transition-transform duration-200"
      >
        <Link href="/blog" onClick={handleBlogClick}>
          <BookOpen className="h-4 w-4" />
          <span>Read blog</span>
        </Link>
      </Button>

      {/* Tertiary CTA - About */}
      <Button
        variant="secondary"
        asChild
        size="default"
        className="gap-2 hover:scale-105 transition-transform duration-200"
      >
        <Link href="/about" onClick={handleAboutClick}>
          <Info className="h-4 w-4" />
          <span>Learn more</span>
        </Link>
      </Button>
    </div>
  );
}
