"use client";

import { useRef, useState, createContext, useContext, type RefObject } from "react";
import { useBlogKeyboardShortcuts } from "@/hooks/use-blog-keyboard-shortcuts";
import { KeyboardShortcutsHelp } from "@/components/common/keyboard-shortcuts-help";

interface BlogKeyboardContextType {
  searchInputRef: RefObject<HTMLInputElement | null>;
  toggleSidebar: () => void;
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
  onToggleSidebar: () => void;
}

/**
 * Blog Keyboard Provider
 * 
 * Provides keyboard shortcut functionality for the blog page:
 * - f : Toggle sidebar visibility
 * - 1-4 : Switch layouts (compact, grid, list, magazine)
 * - / : Focus search input
 * - ? : Show help dialog
 * - Esc : Clear search (when search is focused)
 */
export function BlogKeyboardProvider({ children, onToggleSidebar }: BlogKeyboardProviderProps) {
  const [showHelp, setShowHelp] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useBlogKeyboardShortcuts({
    onShowHelp: () => setShowHelp(true),
    onToggleSidebar,
    searchInputRef,
  });

  return (
    <BlogKeyboardContext.Provider value={{ searchInputRef, toggleSidebar: onToggleSidebar }}>
      {children}
      <KeyboardShortcutsHelp open={showHelp} onOpenChange={setShowHelp} />
    </BlogKeyboardContext.Provider>
  );
}
