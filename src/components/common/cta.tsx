/**
 * Call-to-Action Components
 *
 * Reusable conversion-optimized CTAs for blog posts, project pages, and other content.
 * Tracks clicks and provides consistent styling.
 */

'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { TYPOGRAPHY, getContainerClasses } from '@/lib/design-tokens';
import { getSocialLink } from '@/data/socials';

// ============================================================================
// SHARED STYLES
// ============================================================================

/**
 * Prose reset styles for headings inside prose containers
 * Overrides serif font and margin from .prose h1/h2/h3 rules
 */
const PROSE_RESET_STYLES: React.CSSProperties = {
//  fontFamily: 'var(--font-sans)',
//  marginTop: 0,
//  marginBottom: 0,
};

// ============================================================================
// SHARED UTILITIES
// ============================================================================

type TrackingLocation =
  | "homepage"
  | "about-page"
  | "about-availability-banner"
  | "blog-post-end"
  | "project-page-end";

/**
 * Creates a click handler that tracks navigation events
 */
function createTrackingHandler(url: string, source: TrackingLocation) {
  return () => {
    trackEvent({
      name: 'external_link_clicked',
      properties: { url, source },
    });
  };
}

/**
 * Gets LinkedIn link with UTM parameters
 */
function getLinkedInUrl(campaign: string): string | null {
  const linkedInLink = getSocialLink('linkedin');
  if (!linkedInLink) return null;
  return `${linkedInLink.url}?utm_source=portfolio&utm_medium=website&utm_campaign=${campaign}`;
}

/**
 * Gets Peerlist link with UTM parameters
 */
function getPeerlistUrl(campaign: string): string | null {
  const peerlistLink = getSocialLink('peerlist');
  if (!peerlistLink) return null;
  return `${peerlistLink.url}?utm_source=portfolio&utm_medium=website&utm_campaign=${campaign}`;
}

/**
 * Gets Calendar link with UTM parameters
 */
function getCalendarUrl(campaign: string): string | null {
  const calendarLink = getSocialLink('calendar');
  if (!calendarLink) return null;
  return `${calendarLink.url}?utm_source=portfolio&utm_medium=website&utm_campaign=${campaign}`;
}

export interface CTAProps {
  /** CTA variant style */
  variant?: 'default' | 'minimal' | 'centered';

  /** Location identifier for tracking */
  location: 'homepage' | 'about-page' | 'blog-post-end' | 'project-page-end';

  /** Custom className */
  className?: string;
}

/**
 * About Page Availability Banner
 */
export function AvailabilityBanner({ className }: { className?: string }) {
  const linkedInLink = getSocialLink('linkedin');
  const linkedInUrl = getLinkedInUrl('availability_banner');
  const calendarLink = getSocialLink('calendar');
  const calendarUrl = getCalendarUrl('availability_banner');

  const handleContactClick = createTrackingHandler(
    '/contact',
    'about-availability-banner'
  );
  const handleLinkedInClick = linkedInLink
    ? createTrackingHandler(linkedInLink.url, 'about-availability-banner')
    : undefined;
  const handleCalendarClick = calendarLink
    ? createTrackingHandler(calendarLink.url, 'about-availability-banner')
    : undefined;

  return (
    <div className={cn("rounded-lg border bg-muted/50 p-4", className)}>
      <div className="flex items-start gap-3">
        <div className="relative h-3 w-3 mt-1.5 shrink-0" aria-hidden="true">
          <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
          <span className="absolute inset-0 rounded-full bg-green-500" />
        </div>
        <div className="flex-1">
          <div className="font-semibold mb-1">
            We&apos;re currently available for new projects!
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Our calendar is now open! Whether you&apos;re looking for advice on
            secure coding practices, application performance, or architecture, we&apos;re here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="cta" asChild className="w-full sm:w-auto">
              <Link href="/contact" onClick={handleContactClick}>
                Contact us
              </Link>
            </Button>
            <Button variant="cta-outline" asChild className="w-full sm:w-auto">
              <a
                href={calendarUrl ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCalendarClick}
                aria-label={calendarLink?.description ?? 'Schedule a meeting'}
              >
                Schedule a meeting
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Blog Post CTA
 */
export function BlogPostCTA({
  variant = 'default',
  location,
  className,
}: CTAProps) {
  const handleContactClick = createTrackingHandler('/contact', location);
  const handleAboutClick = createTrackingHandler('/about', location);

  if (variant === 'minimal') {
    return (
      <div className={cn("border-t pt-8 mt-8", className)}>
        <p className="text-sm text-muted-foreground">
          What did you think? Leave a comment below or
          <Link
            href="/contact"
            onClick={handleContactClick}
            className="text-primary underline ml-1"
          >
            send us a message
          </Link>
          {' '}with your thoughts!
        </p>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        variant === "centered" ? "text-center" : "",
        "rounded-lg border bg-linear-to-b from-muted/50 to-muted/30 p-4 md:p-8 mt-12 mb-6",
        className
      )}
    >
      <h2
        className={cn(TYPOGRAPHY.h2.featured, "mb-2")}
        style={PROSE_RESET_STYLES}
      >
        What did you think?
      </h2>
      <p className="text-muted-foreground mb-6">
        Feel free to{' '}
        <Link
          href="/contact"
          onClick={handleContactClick}
          className="text-primary underline"
        >
          send us a message
        </Link>{' '}
        with your thoughts, or learn more{' '}
        <Link
          href="/about"
          onClick={handleAboutClick}
          className="text-primary underline"
        >
          about us
        </Link>
        !
      </p>
      <div
        className={cn(
          variant === "centered" ? "justify-center" : "",
          "flex flex-col sm:flex-row gap-3"
        )}
      >
        <Button variant="cta" asChild size="lg">
          <Link href="/contact" onClick={handleContactClick}>
            Contact us
          </Link>
        </Button>
        <Button variant="cta-outline" size="lg" asChild>
          <Link href="/about" onClick={handleAboutClick}>
            About us
          </Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * Projects Page CTA
 */
export function ProjectsCTA({ className }: { className?: string }) {
  const peerlistLink = getSocialLink('peerlist');
  const peerlistUrl = getPeerlistUrl('projects_cta');

  const handleContactClick = createTrackingHandler(
    '/contact',
    'project-page-end'
  );
  const handlePeerlistClick = peerlistLink
    ? createTrackingHandler(peerlistLink.url, 'project-page-end')
    : undefined;

  return (
    <section className={cn('mt-12 text-center', className)}>
      <div className="rounded-lg border bg-linear-to-b from-muted/50 to-muted/30 p-4 md:p-8">
        <h2 className={cn(TYPOGRAPHY.h2.featured, 'mb-2')}>
          Interested in collaborating?
        </h2>
        <p
          className="text-muted-foreground mb-6"
        >
          Whether you have a project in mind or just want to connect, we&apos;d
          love to hear from you.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="cta" asChild size="lg">
            <Link href="/contact" onClick={handleContactClick}>
              Contact us
            </Link>
          </Button>
          <Button variant="cta-outline" size="lg" asChild>
            <a
              href={peerlistUrl ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handlePeerlistClick}
              aria-label={peerlistLink?.description ?? 'Collaborate on Peerlist'}
            >
              Build with us on Peerlist
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
