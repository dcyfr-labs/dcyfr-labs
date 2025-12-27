"use client";

import { useEffect, useCallback, type RefObject } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface UseBlogKeyboardShortcutsProps {
  onShowHelp: () => void;
  onToggleSidebar?: () => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
}

/**
 * Custom hook for blog keyboard shortcuts
 * 
 * Handles global keyboard shortcuts for the blog page:
 * - f : Toggle sidebar visibility
 * - 1 : Compact layout
 * - 2 : Grid layout
 * - 3 : List layout
 * - 4 : Magazine layout
 * - / : Focus search input
 * - ? : Show help dialog
 * - Esc : Clear search (when search is focused)
 */
export function useBlogKeyboardShortcuts({
  onShowHelp,
  onToggleSidebar,
  searchInputRef,
}: UseBlogKeyboardShortcutsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateLayout = useCallback((layout: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (layout === "compact") {
      params.delete("layout");
    } else {
      params.set("layout", layout);
    }
    
    const query = params.toString();
    router.push(`/blog${query ? `?${query}` : ""}`, { scroll: false });
  }, [router, searchParams]);

  const clearSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    
    const query = params.toString();
    router.push(`/blog${query ? `?${query}` : ""}`, { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      const isTyping = 
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Search focus: / (but not when already typing or with modifiers)
      if (e.key === "/" && !isTyping && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        searchInputRef?.current?.focus();
        return;
      }

      // Help dialog: ? (but not with modifiers)
      if (e.key === "?" && !isTyping && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        onShowHelp();
        return;
      }

      // Toggle sidebar: f (but not when typing or with modifiers like Cmd+F/Ctrl+F)
      if (e.key === "f" && !isTyping && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey && onToggleSidebar) {
        e.preventDefault();
        onToggleSidebar();
        return;
      }

      // View switching: 1-4 (but not when typing or with modifiers)
      // 1 = compact, 2 = grid, 3 = list, 4 = magazine
      if (!isTyping && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey && ["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        const layouts = ["compact", "grid", "list", "magazine"];
        const layoutIndex = parseInt(e.key) - 1;
        updateLayout(layouts[layoutIndex]);
        return;
      }

      // Clear search: Escape (only when typing in search)
      if (e.key === "Escape" && target === searchInputRef?.current) {
        e.preventDefault();
        clearSearch();
        searchInputRef?.current?.blur();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [updateLayout, clearSearch, onShowHelp, onToggleSidebar, searchInputRef]);
}
