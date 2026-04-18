import * as React from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export interface FooterLink {
  href: string;
  label: string;
  external?: boolean;
}

export interface FooterColumn {
  /** Column heading. Omit to render an unlabeled column (e.g. social icons). */
  title?: string;
  links: FooterLink[];
}

export interface FooterSocial {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export interface SiteFooterProps {
  /** Left column: brand identity. */
  brand: {
    name: React.ReactNode;
    tagline?: React.ReactNode;
  };
  /** Middle columns: navigation groupings. */
  columns: FooterColumn[];
  /** Optional social icon row in the right column. */
  social?: FooterSocial[];
  /** Optional copyright line override. Defaults to `© <year> <brand>`. */
  copyright?: React.ReactNode;
  /** Optional legal links (privacy, terms) shown next to the copyright line. */
  legal?: FooterLink[];
  className?: string;
}

/**
 * Site footer — 3-column grid on ≥md, stacked on mobile.
 *
 * Reference implementation per
 * `openspec/changes/dcyfr-skeleton-sites-scaffolding/spec.md#42-sitefooter-`.
 */
export function SiteFooter({
  brand,
  columns,
  social,
  copyright,
  legal,
  className,
}: SiteFooterProps) {
  const year = new Date().getFullYear();
  const brandName = typeof brand.name === 'string' ? brand.name : null;
  const resolvedCopyright =
    copyright ?? (brandName ? `© ${year} ${brandName}. All rights reserved.` : `© ${year}`);

  return (
    <footer
      data-slot="site-footer"
      className={cn('mt-24 border-t border-border bg-background', className)}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.5fr)_repeat(auto-fit,minmax(140px,1fr))] md:gap-8">
          <div className="space-y-3">
            <div className="text-base font-semibold text-foreground">{brand.name}</div>
            {brand.tagline && (
              <p className="max-w-xs text-sm text-muted-foreground">{brand.tagline}</p>
            )}
            {social && social.length > 0 && (
              <ul className="flex items-center gap-2 pt-2">
                {social.map((s) => (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4"
                    >
                      {s.icon}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {columns.map((col, i) => (
            <div key={col.title ?? `col-${i}`} className="space-y-3">
              {col.title && (
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {col.title}
                </div>
              )}
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-start gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{resolvedCopyright}</p>
          {legal && legal.length > 0 && (
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
