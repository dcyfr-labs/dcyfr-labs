"use client";

import type { ReactNode } from "react";
import { BlogKeyboardProvider } from "@/components/blog/blog-keyboard-provider";

interface BlogLayoutWrapperProps {
  children: ReactNode;
}

/**
 * Blog Layout Wrapper Component
 * 
 * Two-column layout for blog archive page.
 * Sidebar positioned on the left side, always expanded at 280px.
 * No collapsible functionality.
 * Provides keyboard navigation context for blog features.
 */
export function BlogLayoutWrapper({ children }: BlogLayoutWrapperProps) {
  return (
    <BlogKeyboardProvider onToggleFilters={() => {}}>
      <div className="grid gap-4 items-start lg:grid-cols-[280px_1fr]">
        {children}
      </div>
    </BlogKeyboardProvider>
  );
}
