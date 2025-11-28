"use client";

import { useRef, useState, createContext, useContext, type RefObject } from "react";
import { useBlogKeyboardShortcuts } from "@/hooks/use-blog-keyboard-shortcuts";
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help";

interface BlogKeyboardContextType {
  searchInputRef: RefObject<HTMLInputElement | null>;
  toggleFilters: () => void;
}

const BlogKeyboardContext = createContext<BlogKeyboardContextType | undefined>(undefined);

export function useBlogKeyboard() {
  const context = useContext(BlogKeyboardContext);
  if (!context) {
    throw new Error("useBlogKeyboard must be used within BlogKeyboardProvider");
  }
  return context;
}

interface BlogKeyboardProviderProps {
  children: React.ReactNode;
  onToggleFilters: () => void;
}

/**
 * Blog Keyboard Provider
 * 
 * Provides keyboard shortcut functionality for the blog page.
 * Manages help dialog state and search input ref.
 */
export function BlogKeyboardProvider({ children, onToggleFilters }: BlogKeyboardProviderProps) {
  const [showHelp, setShowHelp] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useBlogKeyboardShortcuts({
    onShowHelp: () => setShowHelp(true),
    onToggleFilters,
    searchInputRef,
  });

  return (
    <BlogKeyboardContext.Provider value={{ searchInputRef, toggleFilters: onToggleFilters }}>
      {children}
      <KeyboardShortcutsHelp open={showHelp} onOpenChange={setShowHelp} />
    </BlogKeyboardContext.Provider>
  );
}
