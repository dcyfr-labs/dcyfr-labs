/**
 * Navigation Configuration
 * 
 * Centralized source of truth for all navigation structures.
 * Used by: Header, MobileNav, BottomNav, Footer, CommandPalette
 * 
 * SEO Optimized:
 * - Semantic link structure
 * - Clear hierarchy
 * - Descriptive labels
 * - Keyboard navigation support
 * 
 * @example
 * ```tsx
 * import { NAVIGATION } from '@/lib/navigation/config';
 * 
 * // Use in components
 * NAVIGATION.header.map(item => <NavLink item={item} />)
 * ```
 */

import {
  Home,
  User,
  FileText,
  Briefcase,
  Mail,
  Activity,
  Bookmark,
  Heart,
  Rss,
  Calendar,
  Code,
  Shield,
  Settings,
  ChartBar,
} from "lucide-react";
import type { NavItem, NavSection, NavigationConfig } from "./types";

// ============================================================================
// PRIMARY NAVIGATION (Header & Mobile)
// ============================================================================

/**
 * Core navigation items displayed in header
 * Optimized for discoverability and SEO
 */
export const HEADER_NAV: NavItem[] = [
  {
    href: "/",
    label: "Home",
    shortLabel: "Home",
    icon: Home,
    shortcut: "g h",
    description: "Return to homepage",
    exactMatch: true,
  },
  {
    href: "/about",
    label: "About",
    shortLabel: "About",
    icon: User,
    shortcut: "g a",
    description: "Learn about DCYFR Labs and our team",
  },
  {
    href: "/blog",
    label: "Blog",
    shortLabel: "Blog",
    icon: FileText,
    shortcut: "g b",
    description: "Read articles on security and development",
  },
  {
    href: "/work",
    label: "Our Work",
    shortLabel: "Work",
    icon: Briefcase,
    shortcut: "g w",
    description: "Explore our portfolio and client work",
  },
  {
    href: "/sponsors",
    label: "Sponsors",
    shortLabel: "Sponsors",
    icon: Heart,
    shortcut: "g s",
    description: "Support open source development",
  },
  {
    href: "/contact",
    label: "Contact",
    shortLabel: "Contact",
    icon: Mail,
    shortcut: "g c",
    description: "Get in touch with us",
  },
];

// ============================================================================
// BLOG SUB-NAVIGATION
// ============================================================================

export const BLOG_NAV: NavItem[] = [
  {
    href: "/blog",
    label: "All Posts",
    description: "Browse all blog articles",
    exactMatch: true,
  },
  {
    href: "/blog/series",
    label: "Blog Series",
    description: "Multi-part article collections",
  },
  {
    href: "/blog?category=DevSecOps",
    label: "DevSecOps",
    description: "Cybersecurity and secure development",
  },
  {
    href: "/blog?category=AI",
    label: "AI",
    description: "Artificial intelligence and development",
  },
];

// ============================================================================
// WORK/PORTFOLIO SUB-NAVIGATION
// ============================================================================

export const WORK_NAV: NavItem[] = [
  {
    href: "/work",
    label: "All Projects",
    description: "View complete portfolio",
    exactMatch: true,
  },
  {
    href: "/work?category=community",
    label: "Community",
    description: "Open source and community work",
  },
  {
    href: "/work?category=nonprofit",
    label: "Nonprofit",
    description: "Mission-driven partnerships",
  },
  {
    href: "/work?category=startup",
    label: "Startup",
    description: "Early-stage product development",
  }
];

// ============================================================================
// MOBILE NAVIGATION (Drawer)
// ============================================================================

/**
 * Mobile navigation sections with grouping
 * Optimized for touch targets and quick access
 */
export const MOBILE_NAV_SECTIONS: NavSection[] = [
  {
    id: "main",
    label: "Main Navigation",
    description: "Primary pages",
    items: [
      {
        href: "/",
        label: "Home",
        icon: Home,
        description: "Return to homepage",
        exactMatch: true,
      },
      {
        href: "/about",
        label: "About",
        icon: User,
        description: "Learn about DCYFR Labs",
      },
      {
        href: "/blog",
        label: "Blog",
        icon: FileText,
        description: "Read our articles",
      },
      {
        href: "/work",
        label: "Our Work",
        icon: Briefcase,
        description: "View our portfolio",
      },
      {
        href: "/sponsors",
        label: "Sponsors",
        icon: Heart,
        description: "Support us",
      },
      {
        href: "/contact",
        label: "Contact",
        icon: Mail,
        description: "Get in touch",
      },
    ],
  },
  {
    id: "discover",
    label: "Discover",
    description: "Additional content",
    items: [
      {
        href: "/activity",
        label: "Activity",
        icon: Activity,
        description: "Latest updates and activity",
      },
      {
        href: "/bookmarks",
        label: "Bookmarks",
        icon: Bookmark,
        description: "Curated resources and links",
      },
      {
        href: "/likes",
        label: "Likes",
        icon: Heart,
        description: "Content you've liked",
      },
      {
        href: "/feeds",
        label: "RSS Feeds",
        icon: Rss,
        description: "Subscribe to updates",
      },
    ],
  },
];

// ============================================================================
// BOTTOM NAVIGATION (Mobile Only)
// ============================================================================

/**
 * Bottom navigation bar (mobile only)
 * Limited to 3-5 most important destinations
 */
export const BOTTOM_NAV: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: Home,
    exactMatch: true,
  },
  {
    href: "/blog",
    label: "Blog",
    icon: FileText,
  },
  {
    href: "/work",
    label: "Work",
    icon: Briefcase,
  },
];

// ============================================================================
// FOOTER NAVIGATION
// ============================================================================

/**
 * Footer navigation sections
 * Comprehensive sitemap for SEO and discoverability
 */
export const FOOTER_NAV_SECTIONS: NavSection[] = [
  {
    id: "company",
    label: "Company",
    description: "Learn more about DCYFR Labs",
    items: [
      {
        href: "/about",
        label: "About Us",
        description: "Our story and team",
      },
      {
        href: "/services",
        label: "Services",
        description: "What we offer",
      },
      {
        href: "/sponsors",
        label: "Sponsors",
        description: "Support our work",
      },
      {
        href: "/contact",
        label: "Contact",
        description: "Get in touch",
      },
    ],
  },
  {
    id: "content",
    label: "Content",
    description: "Explore our content",
    items: [
      {
        href: "/blog",
        label: "Blog",
        description: "Latest articles",
      },
      {
        href: "/work",
        label: "Portfolio",
        description: "Our projects",
      },
      {
        href: "/activity",
        label: "Activity",
        description: "Recent updates",
      },
      {
        href: "/bookmarks",
        label: "Bookmarks",
        description: "Curated resources",
      },
      {
        href: "/likes",
        label: "Likes",
        description: "Content you liked",
      },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    description: "Helpful links and tools",
    items: [
      {
        href: "/feeds",
        label: "RSS Feeds",
        icon: Rss,
        description: "Subscribe to updates",
      },
      {
        href: "/sitemap.xml",
        label: "Sitemap",
        description: "Site structure",
        external: true,
      },
    ],
  },
  {
    id: "legal",
    label: "Legal",
    description: "Policies and terms",
    items: [
      {
        href: "/privacy",
        label: "Privacy Policy",
        description: "How we handle your data",
      },
      {
        href: "/terms",
        label: "Terms of Service",
        description: "Usage terms",
      },
    ],
  },
];

// ============================================================================
// DEV TOOLS NAVIGATION (Development Only)
// ============================================================================

/**
 * Developer tools navigation
 * Only visible in development environment
 */
export const DEV_TOOLS_NAV: NavItem[] = [
  {
    href: "/dev/docs",
    label: "Documentation",
    icon: FileText,
    description: "Developer documentation",
  },
  {
    href: "/dev/analytics",
    label: "Analytics",
    icon: ChartBar,
    description: "Analytics dashboard",
  },
  {
    href: "/dev/maintenance",
    label: "Maintenance",
    icon: Settings,
    description: "Site maintenance tools",
  },
];

// ============================================================================
// COMPLETE NAVIGATION CONFIG
// ============================================================================

/**
 * Complete navigation configuration
 * Single source of truth for all navigation structures
 */
export const NAVIGATION: NavigationConfig = {
  header: HEADER_NAV,
  mobile: MOBILE_NAV_SECTIONS,
  bottom: BOTTOM_NAV,
  footer: FOOTER_NAV_SECTIONS,
  megaMenus: {
    blog: [
      {
        id: "categories",
        label: "Categories",
        items: BLOG_NAV,
      },
    ],
    work: [
      {
        id: "portfolio",
        label: "Portfolio",
        items: WORK_NAV,
      },
    ],
  },
};

// ============================================================================
// UTILITY FUNCTIONS (Re-exported from utils.ts)
// ============================================================================

// All utility functions are implemented in utils.ts and re-exported here for convenience
export { isNavItemActive, getAriaCurrent, getNavAnalytics, formatShortcut } from "./utils";

/**
 * Get all keyboard shortcuts from navigation
 * Useful for command palette and help UI
 */
export function getKeyboardShortcuts(): Array<{
  shortcut: string;
  label: string;
  href: string;
  description?: string;
}> {
  return HEADER_NAV.filter(
    (item): item is NavItem & { shortcut: string } => !!item.shortcut
  ).map((item) => ({
    shortcut: item.shortcut,
    label: item.label,
    href: item.href,
    description: item.description,
  }));
}

/**
 * Find navigation item by href
 * Searches across all navigation structures
 */
export function findNavItem(href: string): NavItem | undefined {
  const allItems = [
    ...HEADER_NAV,
    ...BLOG_NAV,
    ...WORK_NAV,
    ...BOTTOM_NAV,
    ...MOBILE_NAV_SECTIONS.flatMap((section) => section.items),
    ...FOOTER_NAV_SECTIONS.flatMap((section) => section.items),
  ];

  return allItems.find((item) => item.href === href);
}

