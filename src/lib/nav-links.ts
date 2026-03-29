/**
 * Reusable Navigation Link Components
 *
 * Centralized link configurations and button components for consistent
 * navigation across the homepage and other pages.
 */

import { Briefcase, BookOpen, Activity, Bookmark } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Navigation link configuration
 */
export interface NavLinkConfig {
  href: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  description: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
}

/**
 * Primary navigation links used across the site
 * Single source of truth for navigation destinations
 */
export const PRIMARY_NAV_LINKS: NavLinkConfig[] = [
  {
    href: '/blog',
    label: 'Read our blog',
    shortLabel: 'Blog',
    icon: BookOpen,
    description: 'Read articles on security and development',
    variant: 'primary',
  },
  {
    href: '/work',
    label: 'View our work',
    shortLabel: 'Projects',
    icon: Briefcase,
    description: 'Explore our portfolio and client work',
    variant: 'secondary',
  },
];

/**
 * Secondary/utility navigation links
 */
export const SECONDARY_NAV_LINKS: NavLinkConfig[] = [
  {
    href: '/activity',
    label: 'Activity',
    icon: Activity,
    description: 'See latest activity and updates',
  },
  {
    href: '/bookmarks',
    label: 'Bookmarks',
    icon: Bookmark,
    description: 'Curated resources and links',
  },
];

/**
 * All navigation links combined (for quick links ribbon)
 */
export const ALL_NAV_LINKS: NavLinkConfig[] = [...PRIMARY_NAV_LINKS, ...SECONDARY_NAV_LINKS];

/**
 * Get analytics source identifier for a link
 */
export function getAnalyticsSource(href: string, context: 'hero' | 'ribbon' | 'nav'): string {
  const page = href.replace('/', '') || 'home';
  return `homepage_${context}_${page}`;
}
