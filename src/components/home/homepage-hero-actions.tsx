/**
 * Homepage Hero Actions Component
 * 
 * Client component for hero section buttons with conversion tracking.
 * Separated from server component to maintain SSR benefits while adding interactivity.
 */

'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

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
        url: '/portfolio',
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
    <div className="flex flex-wrap gap-2 sm:gap-3 pt-1 sm:pt-2 justify-center">
      <Button asChild size="default">
        <Link href="/blog" onClick={handleBlogClick}>
          Read my blog
        </Link>
      </Button>
      <Button variant="outline" asChild size="default">
        <Link href="/portfolio" onClick={handleProjectsClick}>
          View portfolio
        </Link>
      </Button>
      <Button variant="secondary" asChild size="default">
        <Link href="/about" onClick={handleAboutClick}>
          Learn more
        </Link>
      </Button>
    </div>
  );
}
