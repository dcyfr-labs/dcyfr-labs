"use client";

import * as React from "react";

interface SidebarContextType {
  /** Whether sidebar is visible (lg breakpoint and above) */
  isSidebarVisible: boolean;
}

const SidebarContext = React.createContext<SidebarContextType>({
  isSidebarVisible: false,
});

/**
 * Provider that tracks sidebar visibility based on viewport width.
 * Used to conditionally hide duplicate content when sidebar is showing.
 */
export function SidebarVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarVisible, setIsSidebarVisible] = React.useState(false);

  React.useEffect(() => {
    // Check if lg breakpoint (1024px) is met
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsSidebarVisible(e.matches);
    };
    
    // Set initial value
    handleChange(mediaQuery);
    
    // Listen for changes
    mediaQuery.addEventListener("change", handleChange);
    
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <SidebarContext.Provider value={{ isSidebarVisible }}>
      {children}
    </SidebarContext.Provider>
  );
}

/**
 * Hook to check if sidebar is currently visible
 */
export function useSidebarVisibility() {
  return React.useContext(SidebarContext);
}

/**
 * Component that hides its children when sidebar is visible.
 * Useful for hiding duplicate metadata in the main content area.
 */
export function HideWhenSidebarVisible({ children }: { children: React.ReactNode }) {
  const { isSidebarVisible } = useSidebarVisibility();
  
  if (isSidebarVisible) {
    return null;
  }
  
  return <>{children}</>;
}
