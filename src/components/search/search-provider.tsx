"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/**
 * SearchProvider Context
 *
 * Global state for search modal (open/close).
 * Keyboard shortcut (/) is handled by UnifiedCommand.
 */

interface SearchContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

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
