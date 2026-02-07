'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { SPACING } from '@/lib/design-tokens';

type BlogPostLayoutWrapperProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * BlogPostLayoutWrapper
 *
 * Three-column layout wrapper for blog post pages:
 * - Left rail: Sidebar (metadata, quick actions) + Table of contents (H2/H3 headings) - 240px
 * - Center: Main content (article) - fluid
 * - Right rail: Empty (reserved for future use) - 240px
 *
 * Responsive breakpoints:
 * - Mobile/Tablet (< lg): Single column with TOC below content
 * - Desktop (lg): Two columns (Sidebar+TOC + Content)
 * - Large Desktop (xl): Three columns with right rail reserved
 *
 * @example
 * ```tsx
 * <BlogPostLayoutWrapper>
 *   <div>{Sidebar + TOC Component}</div>
 *   <div>{Main Content}</div>
 *   <div>{Right Rail - Empty}</div>
 * </BlogPostLayoutWrapper>
 * ```
 */
export function BlogPostLayoutWrapper({ children, className }: BlogPostLayoutWrapperProps) {
  return (
    <div
      className={cn(
        'grid min-w-0',
        SPACING.blogLayout,
        // Two-column grid on medium screens: Sidebar+TOC + Content
        'lg:grid-cols-[240px_1fr]',
        // Three-column grid on larger screens: Sidebar+TOC (240px) + Content (1fr) + Right Rail (240px)
        // "xl:grid-cols-[240px_1fr_240px]",
        className
      )}
    >
      {children}
    </div>
  );
}
