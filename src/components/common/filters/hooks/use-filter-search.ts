"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface UseFilterSearchOptions {
  query: string;
  basePath: string;
  debounceMs?: number;
  paramName?: string;
}

export function useFilterSearch({
  query,
  basePath,
  debounceMs = 250,
  paramName = "q"
}: UseFilterSearchOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(query);
  const [, startTransition] = useTransition();

  // Sync search value with query prop
  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  // Debounced search - update URL after delay
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const normalized = searchValue.trim();
      if (normalized === query.trim()) return;

      const params = new URLSearchParams(searchParams.toString());
      if (normalized) {
        params.set(paramName, normalized);
      } else {
        params.delete(paramName);
      }
      params.delete("page");

      startTransition(() => {
        router.push(`${basePath}?${params.toString()}`, { scroll: false });
      });
    }, debounceMs);

    return () => window.clearTimeout(timeout);
  }, [searchValue, query, searchParams, router, basePath, debounceMs, paramName]);

  return { searchValue, setSearchValue };
}
