'use client';

import * as React from 'react';
import Link from 'next/link';
import { MenuIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ThemeSwitcher } from './theme-switcher';

export interface NavLink {
  href: string;
  label: string;
  /** Open in a new tab. Adds rel=noopener + external icon implied. */
  external?: boolean;
  /** Override the default anchor behavior with a callback. */
  onClick?: () => void;
}

export interface NavCTA {
  href: string;
  label: string;
  /** Button variant — defaults to "default" (primary). */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
}

export interface SiteNavProps {
  /** Logo / wordmark element, rendered at the left. */
  logo: React.ReactNode;
  /** Primary navigation links. */
  links: NavLink[];
  /** Optional right-aligned CTA (e.g. "Sign in", "Get started"). */
  cta?: NavCTA;
  /** Layout variant — matches dcyfr-navigation-menu variants.
   *  - `default`: full-width bordered bar with backdrop-blur
   *  - `centered`: max-width container, transparent bg
   *  - `minimal`: transparent, no border */
  variant?: 'default' | 'centered' | 'minimal';
  /** Hide the theme switcher (e.g. single-scheme sites). */
  hideThemeSwitcher?: boolean;
  /** Additional className on the outer nav. */
  className?: string;
}

const variantClass = {
  default:
    'sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
  centered: 'sticky top-0 z-40 w-full bg-transparent',
  minimal: 'w-full bg-transparent',
} as const;

/**
 * Top-level site navigation. Desktop: horizontal link row + theme switcher + optional CTA.
 * Mobile (≤md): hamburger → `<Sheet>` drawer from the left.
 *
 * Reference implementation per
 * `openspec/changes/dcyfr-skeleton-sites-scaffolding/spec.md#4-shared-chrome-composition-rules`.
 */
export function SiteNav({
  logo,
  links,
  cta,
  variant = 'default',
  hideThemeSwitcher = false,
  className,
}: SiteNavProps) {
  return (
    <nav
      data-slot="site-nav"
      data-variant={variant}
      className={cn(variantClass[variant], className)}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          {logo}
          <ul className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  onClick={link.onClick}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {!hideThemeSwitcher && <ThemeSwitcher />}
          {cta && (
            <Button
              asChild
              variant={cta.variant ?? 'default'}
              size="sm"
              className="hidden md:inline-flex"
            >
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation menu"
              >
                <MenuIcon className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetTitle className="p-4">{logo}</SheetTitle>
              <SheetDescription className="sr-only">Primary site navigation</SheetDescription>
              <ul className="flex flex-col gap-1 px-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <SheetClose asChild>
                      <Link
                        href={link.href}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        className="block rounded-md px-3 py-2 text-base font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  </li>
                ))}
                {cta && (
                  <li className="mt-2">
                    <SheetClose asChild>
                      <Button asChild variant={cta.variant ?? 'default'} className="w-full">
                        <Link href={cta.href}>{cta.label}</Link>
                      </Button>
                    </SheetClose>
                  </li>
                )}
              </ul>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
