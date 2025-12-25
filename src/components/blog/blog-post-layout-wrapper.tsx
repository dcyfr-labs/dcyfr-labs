"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type BlogPostLayoutWrapperProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * BlogPostLayoutWrapper
 * 
 * Three-column layout wrapper for blog post pages:
 * - Left rail: Table of contents (H2/H3 headings) - 240px
 * - Center: Main content (article) - fluid
 * - Right rail: Sidebar (metadata, quick actions, related posts) - 240px
 * 
 * Responsive breakpoints:
 * - Mobile/Tablet (< lg): Single column with TOC below content
 * - Desktop (lg): Two columns (TOC + Content, sidebar hidden)
 * - Large Desktop (xl): Three columns with sidebar
 * 
 * @example
 * ```tsx
 * <BlogPostLayoutWrapper>
 *   <div>{TOC Component}</div>
 *   <div>{Main Content}</div>
 *   <div>{Sidebar Component}</div>
 * </BlogPostLayoutWrapper>
 * ```
 */
export function BlogPostLayoutWrapper({ children, className }: BlogPostLayoutWrapperProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        // Two-column grid on medium screens: TOC + Content (hide sidebar)
        "lg:grid-cols-[240px_1fr]",
        // Three-column grid on larger screens: TOC (240px) + Content (1fr) + Sidebar (240px)
        "xl:grid-cols-[240px_1fr_240px]",
        className
      )}
    >
      {children}
    </div>
  );
}
