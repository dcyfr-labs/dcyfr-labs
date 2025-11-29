/**
 * Call-to-Action Component
 * 
 * Reusable conversion-optimized CTA for blog posts, project pages, and other content.
 * Tracks clicks and provides consistent styling.
 */

'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { TYPOGRAPHY, getContainerClasses } from '@/lib/design-tokens';
import { getSocialLink } from '@/data/socials';

export interface CTAProps {
  /** CTA variant style */
  variant?: 'default' | 'minimal' | 'centered';
  
  /** Location identifier for tracking */
  location: 'homepage' | 'about-page' | 'projects-page' | 'blog-post-end';
  
  /** Custom className */
  className?: string;
}

/**
 * Blog Post CTA - Appears at the end of blog posts
 */
export function BlogPostCTA({ variant = 'default', location, className }: CTAProps) {
  const linkedInLink = getSocialLink('linkedin');
  
  const handleContactClick = () => {
    trackEvent({
      name: 'external_link_clicked',
      properties: {
        url: '/contact',
        source: location,
      },
    });
  };

  const handleLinkedInClick = () => {
    if (linkedInLink) {
      trackEvent({
        name: 'external_link_clicked',
        properties: {
          url: linkedInLink.url,
          source: location,
        },
      });
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={cn('border-t pt-8 mt-8', className)}>
        <p className="text-sm text-muted-foreground">
          Building something similar? We&apos;d love to hear about it—
          <Link
            href="/contact"
            onClick={handleContactClick}
            className="text-primary hover:underline ml-1"
          >
            let&apos;s chat
          </Link>
          .
        </p>
      </div>
    );
  }

  if (variant === 'centered') {
    return (
      <div className={cn('border-t pt-12 mt-12 text-center', className)}>
        <h2 className={cn(TYPOGRAPHY.h2.standard, 'mb-3')}>
          
        </h2>
        <p className={cn('text-muted-foreground mb-6 mx-auto', getContainerClasses('narrow'))}>
          If you&apos;re building a Next.js application and need help with security,
          performance, or architecture, we&apos;re here to help.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="cta" asChild>
            <Link href="/contact" onClick={handleContactClick}>
              Start a conversation
            </Link>
          </Button>
          <Button variant="cta-outline" asChild>
            <a
              href={linkedInLink ? `${linkedInLink.url}?utm_source=portfolio&utm_medium=website&utm_campaign=blog_cta` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkedInClick}
              aria-label={linkedInLink?.description || 'Connect on LinkedIn'}
            >
              Connect on LinkedIn
            </a>
          </Button>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('rounded-lg border bg-muted/30 p-6 mt-12', className)}>
      <h2 className={cn(TYPOGRAPHY.h3.standard, 'mb-2')}>
        Building a Next.js app?
      </h2>
      <p className="text-muted-foreground mb-4">
        Whether you&apos;re facing challenges with security, performance, or architecture,
        we&apos;re here to help you build robust and scalable applications.
      </p>
      <div className="flex gap-3">
        <Button variant="cta" asChild size="sm">
          <Link href="/contact" onClick={handleContactClick}>
            Get in touch
          </Link>
        </Button>
        <Button variant="cta-outline" size="sm" asChild>
          <a
            href={linkedInLink ? `${linkedInLink.url}?utm_source=portfolio&utm_medium=website&utm_campaign=blog_cta` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkedInClick}
            aria-label={linkedInLink?.description || 'Connect on LinkedIn'}
          >
            Connect on LinkedIn
          </a>
        </Button>
      </div>
    </div>
  );
}

/**
 * Projects Page CTA
 */
export function ProjectsCTA({ className }: { className?: string }) {
  const handleContactClick = () => {
    trackEvent({
      name: 'external_link_clicked',
      properties: {
        url: '/contact',
        source: 'projects-page-cta',
      },
    });
  };

  const handleAboutClick = () => {
    trackEvent({
      name: 'external_link_clicked',
      properties: {
        url: '/about',
        source: 'projects-page-cta',
      },
    });
  };

  return (
    <section className={cn('mt-16 text-center', className)}>
      <div className="rounded-lg border bg-linear-to-b from-muted/50 to-muted/30 p-8 md:p-12">
        <h2 className={cn(TYPOGRAPHY.h2.featured, 'mb-3')}>
          Interested in working together?
        </h2>
        <p className={cn('text-lg text-muted-foreground mb-6 mx-auto', getContainerClasses('standard'))}>
          Whether you&apos;re looking for a developer, consultant, or collaborator,
          we&apos;re always open to discussing new projects and opportunities.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="cta" asChild size="lg">
            <Link href="/contact" onClick={handleContactClick}>
              Start a conversation
            </Link>
          </Button>
          <Button variant="cta-outline" size="lg" asChild>
            <Link href="/about" onClick={handleAboutClick}>
              Learn more about us
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/**
 * About Page Availability Banner
 */
export function AvailabilityBanner({ className }: { className?: string }) {
  const handleContactClick = () => {
    trackEvent({
      name: 'external_link_clicked',
      properties: {
        url: '/contact',
        source: 'about-availability-banner',
      },
    });
  };

  return (
    <div className={cn('rounded-lg border bg-muted/50 p-6', className)}>
      <div className="flex items-start gap-3">
        <div className="h-3 w-3 rounded-full bg-green-500 mt-1 shrink-0" />
        <div className="flex-1">
          <div className="font-semibold mb-1">
            Open to new opportunities
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            If you&apos;d like to discuss a project or opportunity, feel free to reach out!
          </p>
          <Button asChild>
            <Link href="/contact" onClick={handleContactClick}>
              Contact us
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
