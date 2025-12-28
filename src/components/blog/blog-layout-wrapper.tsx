"use client";

import type { ReactNode } from "react";
import { useState, createContext, useContext } from "react";
import { BlogKeyboardProvider } from "@/components/blog/blog-keyboard-provider";

interface BlogLayoutContextType {
  sidebarVisible: boolean;
}

const BlogLayoutContext = createContext<BlogLayoutContextType | undefined>(undefined);

export function useBlogLayout() {
  const context = useContext(BlogLayoutContext);
  if (!context) {
    throw new Error("useBlogLayout must be used within BlogLayoutWrapper");
  }
  return context;
}

interface BlogLayoutWrapperProps {
  children: ReactNode;
}

/**
 * Blog Layout Wrapper Component
 *
 * Two-column layout for blog archive page.
 * Sidebar can be toggled via keyboard shortcut (f key).
 * Provides keyboard navigation context for blog features.
 * 
 * Keyboard shortcuts:
 * - f : Toggle sidebar visibility
 * - 1-5 : Switch layouts (magazine, grid, list, compact, grouped)
 * - / : Focus search input
 * - ? : Show help dialog
 * - Esc : Clear search (when search is focused)
 */
export function BlogLayoutWrapper({ children }: BlogLayoutWrapperProps) {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const handleToggleSidebar = () => {
    setSidebarVisible(prev => !prev);
  };

  return (
    <BlogLayoutContext.Provider value={{ sidebarVisible }}>
      <BlogKeyboardProvider onToggleSidebar={handleToggleSidebar}>
        <div className={`grid gap-4 items-start ${sidebarVisible ? 'lg:grid-cols-[1fr_280px]' : 'lg:grid-cols-1'}`}>
          {children}
        </div>
      </BlogKeyboardProvider>
    </BlogLayoutContext.Provider>
  );
}
