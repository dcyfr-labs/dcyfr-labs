import * as React from 'react';

import { cn } from '@/lib/utils';

export interface PageShellProps {
  /** Main content rendered between nav and footer. */
  children: React.ReactNode;
  /** Site navigation element, rendered at the top. */
  nav?: React.ReactNode;
  /** Site footer element, rendered at the bottom. */
  footer?: React.ReactNode;
  /** Optional hero element rendered full-bleed above main content. */
  hero?: React.ReactNode;
  /** Additional className on the main container. */
  containerClassName?: string;
  /** Vertical padding preset. Defaults to "default" (py-16 lg:py-24). */
  padding?: 'none' | 'tight' | 'default' | 'loose';
  /** Container max-width. Defaults to "6xl" (72rem). */
  maxWidth?: '4xl' | '5xl' | '6xl' | '7xl' | 'full';
}

const paddingClass = {
  none: '',
  tight: 'py-8',
  default: 'py-16 lg:py-24',
  loose: 'py-24 lg:py-32',
} as const;

const maxWidthClass = {
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
} as const;

/**
 * Full-page shell: nav + optional hero + main + footer.
 *
 * Reference implementation per
 * `openspec/changes/dcyfr-skeleton-sites-scaffolding/spec.md#43-pageshell-`.
 */
export function PageShell({
  children,
  nav,
  footer,
  hero,
  containerClassName,
  padding = 'default',
  maxWidth = '6xl',
}: PageShellProps) {
  return (
    <div
      data-slot="page-shell"
      className="flex min-h-screen flex-col bg-background text-foreground"
    >
      {nav}
      {hero}
      <main
        className={cn(
          'mx-auto w-full flex-1 px-4 sm:px-6 lg:px-8',
          maxWidthClass[maxWidth],
          paddingClass[padding],
          containerClassName
        )}
      >
        {children}
      </main>
      {footer}
    </div>
  );
}
