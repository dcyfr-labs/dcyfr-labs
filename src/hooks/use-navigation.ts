/**
 * Unified navigation hook for active state detection and navigation utilities
 *
 * Consolidates navigation logic used across:
 * - SiteHeader
 * - MobileNav
 * - BottomNav
 * - Breadcrumbs
 * - Any navigation component
 *
 * Provides consistent active state detection and navigation utilities.
 *
 * @example
 * ```tsx
 * function NavItem({ href, label, exactMatch }) {
 *   const { isActive } = useNavigation();
 *
 *   return (
 *     <Link
 *       href={href}
 *       className={isActive(href, exactMatch) ? 'active' : ''}
 *     >
 *       {label}
 *     </Link>
 *   );
 * }
 * ```
 */

"use client";

import { usePathname } from "next/navigation";
import { useCallback } from "react";
import type { NavItem } from "@/lib/navigation-config";

export interface UseNavigationReturn {
  /**
   * Current pathname
   */
  pathname: string;
  /**
   * Check if a given href is active based on current pathname
   *
   * @param href - The href to check
   * @param exact - If true, requires exact match. If false, uses startsWith (default)
   * @returns true if the href is active
   *
   * @example
   * ```tsx
   * isActive('/blog') // true if pathname is /blog or /blog/post-1
   * isActive('/blog', true) // true only if pathname is exactly /blog
   * isActive('/') // requires exact match to avoid matching all routes
   * ```
   */
  isActive: (href: string, exact?: boolean) => boolean;
  /**
   * Check if a navigation item is active
   * Uses the item's exactMatch property or falls back to the exact parameter
   *
   * @param item - NavItem with href and optional exactMatch
   * @param exact - Override for exactMatch (optional)
   * @returns true if the item is active
   */
  isNavItemActive: (item: NavItem, exact?: boolean) => boolean;
  /**
   * Get ARIA current attribute value for active items
   *
   * @param href - The href to check
   * @param exact - If true, requires exact match
   * @returns 'page' if active, undefined otherwise
   */
  getAriaCurrent: (href: string, exact?: boolean) => "page" | undefined;
}

/**
 * Hook for navigation utilities and active state detection
 */
export function useNavigation(): UseNavigationReturn {
  const pathname = usePathname();

  /**
   * Check if a given href is active
   * Special handling for root path to require exact match
   */
  const isActive = useCallback(
    (href: string, exact = false): boolean => {
      // Root path always requires exact match to avoid matching everything
      if (href === "/") {
        return pathname === "/";
      }

      // Exact match mode
      if (exact) {
        return pathname === href;
      }

      // StartsWith match mode
      // Check both pathname and pathname without query params
      const pathWithoutQuery = pathname.split("?")[0];
      return pathname.startsWith(href) || pathWithoutQuery.startsWith(href);
    },
    [pathname]
  );

  /**
   * Check if a NavItem is active using its configuration
   */
  const isNavItemActive = useCallback(
    (item: NavItem, exact?: boolean): boolean => {
      // Use item's exactMatch property if defined, otherwise use the exact parameter
      const shouldUseExact = exact !== undefined ? exact : item.exactMatch;
      return isActive(item.href, shouldUseExact);
    },
    [isActive]
  );

  /**
   * Get ARIA current attribute for active items
   */
  const getAriaCurrent = useCallback(
    (href: string, exact = false): "page" | undefined => {
      return isActive(href, exact) ? "page" : undefined;
    },
    [isActive]
  );

  return {
    pathname,
    isActive,
    isNavItemActive,
    getAriaCurrent,
  };
}

/**
 * Helper hook for handling logo click behavior
 * Scrolls to top if already on homepage, otherwise navigates
 *
 * @example
 * ```tsx
 * function Logo() {
 *   const handleLogoClick = useLogoClick();
 *
 *   return (
 *     <Link href="/" onClick={handleLogoClick}>
 *       <Logo />
 *     </Link>
 *   );
 * }
 * ```
 */
export function useLogoClick(): (e: React.MouseEvent<HTMLAnchorElement>) => void {
  const pathname = usePathname();

  return useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (pathname === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      }
    },
    [pathname]
  );
}
