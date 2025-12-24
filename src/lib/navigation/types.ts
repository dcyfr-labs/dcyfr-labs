/**
 * Navigation Types
 * 
 * Shared type definitions for all navigation components
 */

import type { LucideIcon } from "lucide-react";

/**
 * Core navigation item definition
 */
export interface NavItem {
  /** Link destination */
  href: string;
  /** Display label */
  label: string;
  /** Short label for compact views */
  shortLabel?: string;
  /** Icon component (Lucide) */
  icon?: LucideIcon;
  /** Descriptive text for tooltips/cards */
  description?: string;
  /** Keyboard shortcut (e.g., "g h" for go home) */
  shortcut?: string;
  /** Whether to prefetch this route */
  prefetch?: boolean;
  /** Whether to match exact path only (vs startsWith) */
  exactMatch?: boolean;
  /** Visual emphasis variant */
  variant?: "primary" | "secondary" | "tertiary";
  /** Whether this link opens in a new tab */
  external?: boolean;
  /** Badge/count to display (for notifications) */
  badge?: number | string;
}

/**
 * Navigation section with grouped items
 */
export interface NavSection {
  /** Section identifier */
  id: string;
  /** Section heading */
  label: string;
  /** Section description (for accessibility) */
  description?: string;
  /** Items in this section */
  items: NavItem[];
  /** Whether section should be collapsible */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
}

/**
 * Mega menu column configuration
 */
export interface MegaMenuColumn {
  /** Column identifier */
  id: string;
  /** Column heading */
  label: string;
  /** Items in this column */
  items: NavItem[];
}

/**
 * Complete navigation configuration
 */
export interface NavigationConfig {
  /** Primary header navigation */
  header: NavItem[];
  /** Mobile drawer navigation */
  mobile: NavSection[];
  /** Bottom navigation (mobile only, max 5 items) */
  bottom: NavItem[];
  /** Footer navigation sections */
  footer: NavSection[];
  /** Mega menu configurations */
  megaMenus?: Record<string, MegaMenuColumn[]>;
}

/**
 * Navigation context type
 */
export type NavContext = 
  | "header"
  | "mobile"
  | "bottom"
  | "footer"
  | "megamenu"
  | "command-palette"
  | "breadcrumb";

/**
 * Analytics tracking metadata
 */
export interface NavAnalytics {
  /** Analytics event name */
  event: string;
  /** Event category */
  category: string;
  /** Event label */
  label: string;
  /** Additional properties */
  properties?: Record<string, unknown>;
}
