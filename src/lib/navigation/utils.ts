/**
 * Navigation Utilities
 * 
 * Helper functions for navigation components
 */

import type { NavItem } from "./types";

/**
 * Check if nav item should be active for given pathname
 */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.exactMatch) {
    return pathname === item.href;
  }

  // Handle query params - never highlight dropdown items when on parent page
  if (item.href.includes("?")) {
    return false; // Dropdown items with query params should only highlight when actually clicked
  }

  // For paths, ensure exact match or child route (not just prefix)
  if (pathname === item.href) {
    return true;
  }

  // Only mark as active if it's a true child route (has trailing path segment)
  return pathname.startsWith(item.href + "/");
}

/**
 * Get aria-current value for navigation link
 */
export function getAriaCurrent(
  href: string,
  pathname: string,
  exactMatch?: boolean
): "page" | undefined {
  const isActive = exactMatch
    ? pathname === href
    : pathname.startsWith(href);

  return isActive ? "page" : undefined;
}

/**
 * Get analytics tracking data for nav click
 */
export function getNavAnalytics(
  item: NavItem,
  context: string
): {
  event: string;
  category: string;
  label: string;
  href: string;
} {
  const page = item.href.replace("/", "") || "home";

  return {
    event: "navigation_click",
    category: `nav_${context}`,
    label: `${context}_${page}`,
    href: item.href,
  };
}

/**
 * Format keyboard shortcut for display
 * Converts "g h" to "G then H"
 */
export function formatShortcut(shortcut: string): string {
  const parts = shortcut.split(" ");

  if (parts.length === 1) {
    return parts[0].toUpperCase();
  }

  return parts.map((p) => p.toUpperCase()).join(" then ");
}

/**
 * Check if item is external link
 */
export function isExternalLink(href: string): boolean {
  return href.startsWith("http") || href.startsWith("mailto:");
}

/**
 * Get rel attribute for links
 */
export function getLinkRel(item: NavItem): string | undefined {
  if (item.external || isExternalLink(item.href)) {
    return "noopener noreferrer";
  }

  return undefined;
}

/**
 * Get target attribute for links
 */
export function getLinkTarget(item: NavItem): "_blank" | undefined {
  if (item.external || isExternalLink(item.href)) {
    return "_blank";
  }

  return undefined;
}
