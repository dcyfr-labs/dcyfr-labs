"use client";

import { useEffect, useCallback, type RefObject } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface UseBlogKeyboardShortcutsProps {
  onShowHelp: () => void;
  onToggleFilters?: () => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
}

/**
 * Custom hook for blog keyboard shortcuts
 * 
 * Handles global keyboard shortcuts for the blog page:
 * - / : Focus search
 * - 1-4 : Switch views
 * - f : Toggle sidebar filters
 * - Esc : Clear search / close dialogs
 * - ? : Show help
 */
export function useBlogKeyboardShortcuts({
  onShowHelp,
  onToggleFilters,
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

      // Toggle filters: f (but not when typing or with modifiers like Cmd+F/Ctrl+F)
      if (e.key === "f" && !isTyping && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey && onToggleFilters) {
        e.preventDefault();
        onToggleFilters();
        return;
      }

      // View switching: 1-4 (but not when typing or with modifiers)
      if (!isTyping && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey && ["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        const views = ["compact", "grid", "list", "magazine"];
        const viewIndex = parseInt(e.key) - 1;
        updateLayout(views[viewIndex]);
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
  }, [updateLayout, clearSearch, onShowHelp, onToggleFilters, searchInputRef]);
}
