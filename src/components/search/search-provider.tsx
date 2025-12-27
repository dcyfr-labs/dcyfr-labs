"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

/**
 * SearchProvider Context
 *
 * Global state for search modal (open/close).
 * Handles keyboard shortcut (/)
 */

interface SearchContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  // Keyboard shortcut: / (forward slash)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Only listen for forward slash key
      if (e.key !== "/") return;

      // Don't trigger if typing in input/textarea
      if (
        e.target instanceof HTMLElement &&
        (e.target.tagName === "INPUT" ||
          e.target.tagName === "TEXTAREA" ||
          e.target.contentEditable === "true")
      ) {
        return;
      }

      e.preventDefault();
      setOpen((prevOpen) => !prevOpen);
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const toggle = () => setOpen((prev) => !prev);

  return (
    <SearchContext.Provider value={{ open, setOpen, toggle }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
