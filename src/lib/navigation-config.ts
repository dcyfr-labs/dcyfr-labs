/**
 * Centralized navigation configuration
 *
 * Single source of truth for all navigation structures across the site.
 * Used by: SiteHeader, MobileNav, BottomNav, CommandPalette, Footer
 *
 * @example
 * ```tsx
 * import { NAVIGATION } from '@/lib/navigation-config';
 *
 * // Use in components
 * NAVIGATION.primary.map(item => <Link href={item.href}>{item.label}</Link>)
 * ```
 */

import { Home, FileText, FolderGit2, Mail, Rss, Heart, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon?: LucideIcon;
  /**
   * Keyboard shortcut for navigation (e.g., "g h" for "go home")
   * Format: modifier keys separated by space, then key
   */
  shortcut?: string;
  /**
   * Whether this item should be prefetched
   * @default false
   */
  prefetch?: boolean;
  /**
   * Whether this item should match exact path only
   * @default false - uses startsWith for active state
   */
  exactMatch?: boolean;
}

export interface NavCategory {
  label: string;
  items: NavItem[];
}

/**
 * Primary navigation items (header, mobile menu)
 */
export const PRIMARY_NAV: NavItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: Home,
    exactMatch: true,
    shortcut: 'g h',
  },
  {
    href: '/blog',
    label: 'Blog',
    icon: FileText,
    shortcut: 'g b',
  },
  {
    href: '/work',
    label: 'Work',
    icon: FolderGit2,
    shortcut: 'g w',
  },
  {
    href: '/about',
    label: 'About',
    icon: User,
    shortcut: 'g a',
  },
  {
    href: '/contact',
    label: 'Contact',
    icon: Mail,
    shortcut: 'g c',
  },
  {
    href: '/likes',
    label: 'Likes',
    icon: Heart,
    shortcut: 'g l',
  },
] as const;

/**
 * Bottom navigation items (mobile only, 3-item limit)
 */
export const BOTTOM_NAV: NavItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: Home,
    exactMatch: true,
  },
  {
    href: '/blog',
    label: 'Blog',
    icon: FileText,
  },
  {
    href: '/work',
    label: 'Work',
    icon: FolderGit2,
  },
] as const;

/**
 * Blog category navigation
 */
export const BLOG_CATEGORIES: NavItem[] = [
  {
    href: '/blog',
    label: 'All Posts',
    exactMatch: true,
  },
  {
    href: '/blog/series',
    label: 'Blog Series',
  },
] as const;

/**
 * Work/Portfolio category navigation
 */
export const WORK_CATEGORIES: NavItem[] = [
  {
    href: '/work',
    label: 'All Projects',
    exactMatch: true,
  },
  {
    href: '/work?category=code',
    label: 'Code',
  },
  {
    href: '/work?category=nonprofit',
    label: 'Nonprofits',
  },
  {
    href: '/work?category=startup',
    label: 'Startups',
  },
] as const;

/**
 * Dev tools navigation (development only)
 */
export const DEV_TOOLS_NAV: NavItem[] = [
  {
    href: '/dev/docs',
    label: 'Docs',
  },
  {
    href: '/dev/analytics',
    label: 'Analytics',
  },
  {
    href: '/dev/agents',
    label: 'AI Agents',
  },
  {
    href: '/dev/maintenance',
    label: 'Maintenance',
  },
  {
    href: '/dev/mcp-health',
    label: 'MCP Health',
  },
  {
    href: '/dev/api-costs',
    label: 'API Costs',
  },
  {
    href: '/dev/unified-ai-costs',
    label: 'AI Cost Dashboard',
  },
  {
    href: '/dev/news',
    label: 'Tech News',
  },
] as const;

/**
 * Footer navigation items
 */
export const FOOTER_NAV: NavItem[] = [
  {
    href: '/about',
    label: 'About',
  },
  {
    href: '/contact',
    label: 'Contact',
  },
  {
    href: '/sponsors',
    label: 'Sponsors',
  },
  {
    href: '/privacy',
    label: 'Privacy Policy',
  },
  {
    href: '/terms',
    label: 'Terms of Service',
  },
] as const;

/**
 * Mobile navigation items (extended list with all pages)
 */
export const MOBILE_NAV: NavItem[] = [
  ...PRIMARY_NAV,
  {
    href: '/sponsors',
    label: 'Sponsors',
  },
  {
    href: '/privacy',
    label: 'Privacy Policy',
  },
  {
    href: '/terms',
    label: 'Terms of Service',
  },
] as const;

/**
 * Complete navigation structure organized by context
 */
export const NAVIGATION = {
  primary: PRIMARY_NAV,
  bottom: BOTTOM_NAV,
  mobile: MOBILE_NAV,
  blog: BLOG_CATEGORIES,
  work: WORK_CATEGORIES,
  devTools: DEV_TOOLS_NAV,
  footer: FOOTER_NAV,
} as const;

/**
 * Extract all keyboard shortcuts from navigation config
 * Useful for generating keyboard shortcut help or command palette
 */
export function getKeyboardShortcuts(): Array<{
  shortcut: string;
  label: string;
  href: string;
}> {
  return PRIMARY_NAV.filter((item): item is NavItem & { shortcut: string } => !!item.shortcut).map(
    (item) => ({
      shortcut: item.shortcut,
      label: item.label,
      href: item.href,
    })
  );
}

/**
 * Find navigation item by href
 */
export function findNavItem(href: string): NavItem | undefined {
  const allItems = [
    ...PRIMARY_NAV,
    ...BLOG_CATEGORIES,
    ...WORK_CATEGORIES,
    ...DEV_TOOLS_NAV,
    ...FOOTER_NAV,
  ];

  return allItems.find((item) => item.href === href);
}
