"use client";

import { useBlogLayout } from "@/components/blog";
import { BlogSidebar, type BlogSidebarProps } from "@/components/blog";

/**
 * Blog Sidebar Wrapper
 *
 * Client component that conditionally renders the sidebar based on layout state.
 * Controlled via the 'f' keyboard shortcut to toggle visibility.
 */
export function BlogSidebarWrapper(props: BlogSidebarProps) {
  const { sidebarVisible } = useBlogLayout();

  if (!sidebarVisible) {
    return null;
  }

  return (
    <div className="hidden lg:block">
      <div className="sticky top-24 pt-16">
        <BlogSidebar {...props} />
      </div>
    </div>
  );
}
