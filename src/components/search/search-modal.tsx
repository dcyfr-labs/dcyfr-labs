"use client";

import { SearchCommand } from "./search-command";
import { useSearch } from "./search-provider";

/**
 * SearchModal Component
 *
 * Wrapper that connects SearchCommand to SearchProvider context.
 * This component should be rendered once in the app layout.
 */
export function SearchModal() {
  const { open, setOpen } = useSearch();

  return <SearchCommand open={open} onOpenChange={setOpen} />;
}
