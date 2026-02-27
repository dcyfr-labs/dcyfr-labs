/**
 * PageLayout - Universal wrapper for all core pages
 *
 * Provides consistent structure, spacing, and max-width constraints for pages
 * like homepage, about, contact, and resume. This component ensures all pages
 * have the same vertical rhythm and responsive behavior.
 *
 * @example Basic usage
 * ```tsx
 * <PageLayout>
 *   <PageHero title="About" description="Learn more about me" />
 *   <PageSection>{content}</PageSection>
 * </PageLayout>
 * ```
 *
 * @example With custom className
 * ```tsx
 * <PageLayout className="bg-gradient-to-b from-background to-muted">
 *   {children}
 * </PageLayout>
 * ```
 *
 * @example With draft mode
 * ```tsx
 * <PageLayout isDraft>
 *   {children}
 * </PageLayout>
 * ```
 */

import { ReactNode } from 'react';
import { PAGE_LAYOUT } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import { DraftBanner } from '@/components/features/draft-banner';

export interface PageLayoutProps {
  /** Page content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Whether this is a draft page (shows banner in development and preview) */
  isDraft?: boolean;
}

export function PageLayout({ children, className, isDraft = false }: PageLayoutProps) {
  return (
    <div className={cn(PAGE_LAYOUT.wrapper, 'pb-16 md:pb-0 pt-16 md:pt-0', className)}>
      {isDraft &&
        (process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview') && (
          <DraftBanner />
        )}
      {children}
    </div>
  );
}
