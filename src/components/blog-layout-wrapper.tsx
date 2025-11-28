"use client";

import { useState, createContext, useContext } from "react";
import { BlogKeyboardProvider } from "@/components/blog-keyboard-provider";

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within BlogLayoutWrapper");
  }
  return context;
}

interface BlogLayoutWrapperProps {
  children: React.ReactNode;
}

/**
 * Blog Layout Wrapper Component
 * 
 * Provides sidebar collapse state management for the blog layout.
 * Adjusts grid layout to give more space to content when sidebar is collapsed.
 * Integrates keyboard shortcuts for blog navigation.
 */
export function BlogLayoutWrapper({ children }: BlogLayoutWrapperProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const toggleCollapsed = () => setIsCollapsed(prev => !prev);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, toggleCollapsed }}>
      <BlogKeyboardProvider onToggleFilters={toggleCollapsed}>
        <div 
          className={`grid gap-8 items-start transition-all duration-300 ${
            isCollapsed 
              ? "lg:grid-cols-[48px_1fr]" 
              : "lg:grid-cols-[280px_1fr]"
          }`}
        >
          {children}
        </div>
      </BlogKeyboardProvider>
    </SidebarContext.Provider>
  );
}
