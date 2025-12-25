"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CollapsibleBlogSidebarProps {
  children: ReactNode;
  className?: string;
}

/**
 * CollapsibleBlogSidebar Component
 *
 * Wrapper for blog post sidebar in right rail.
 * - Always expanded with full sidebar content (240px width)
 * - Static content (doesn't follow scroll)
 * - No collapsible functionality
 *
 * @param children - Sidebar content (typically BlogPostSidebarWrapper)
 * @param className - Optional CSS classes for grid order control
 */
export function CollapsibleBlogSidebar({ children, className }: CollapsibleBlogSidebarProps) {
  return (
    <aside className={cn("hidden xl:block w-full", className)}>
      {/* Sidebar content (BlogPostSidebarWrapper with Suspense for view count) */}
      {children}
    </aside>
  );
}
