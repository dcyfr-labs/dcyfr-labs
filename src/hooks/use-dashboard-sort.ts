/**
 * Dashboard Sort Hook
 * 
 * Custom hook for managing table sort state with URL synchronization.
 * Handles sort field, direction, and persistence across page reloads.
 * 
 * @module hooks/use-dashboard-sort
 */

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SortDirection } from "@/lib/dashboard";

interface UseDashboardSortOptions<T> {
  /** Initial sort field */
  initialField?: keyof T;
  /** Initial sort direction */
  initialDirection?: SortDirection;
  /** Enable URL synchronization (default: true) */
  syncWithUrl?: boolean;
  /** Valid sort fields (for URL validation) */
  validFields?: (keyof T)[];
}

interface UseDashboardSortReturn<T> {
  /** Current sort field */
  sortField: keyof T;
  /** Current sort direction */
  sortDirection: SortDirection;
  /** Update sort field (toggles direction if same field) */
  handleSort: (field: keyof T) => void;
  /** Set sort field */
  setSortField: (field: keyof T) => void;
  /** Set sort direction */
  setSortDirection: (direction: SortDirection) => void;
}

/**
 * Manage dashboard sort state with URL synchronization
 * 
 * @example
 * ```tsx
 * const { sortField, sortDirection, handleSort } = useDashboardSort<Post>({
 *   initialField: 'views',
 *   initialDirection: 'desc',
 *   validFields: ['title', 'views', 'publishedAt']
 * });
 * ```
 */
export function useDashboardSort<T extends Record<string, unknown>>({
  initialField,
  initialDirection = "desc",
  syncWithUrl = true,
  validFields = [],
}: UseDashboardSortOptions<T>): UseDashboardSortReturn<T> {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sortField, setSortFieldState] = useState<keyof T>(
    initialField as keyof T
  );
  const [sortDirection, setSortDirectionState] =
    useState<SortDirection>(initialDirection);

  // Initialize state from URL on mount
  useEffect(() => {
    if (!syncWithUrl) return;

    const params = new URLSearchParams(searchParams.toString());

    // Sort field
    const urlSortField = params.get("sortField");
    if (urlSortField) {
      // Validate against allowed fields if provided
      if (validFields.length === 0 || validFields.includes(urlSortField as keyof T)) {
        setSortFieldState(urlSortField as keyof T);
      }
    }

    // Sort direction
    const urlSortDirection = params.get("sortDirection");
    if (urlSortDirection && ["asc", "desc"].includes(urlSortDirection)) {
      setSortDirectionState(urlSortDirection as SortDirection);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Update URL when sort changes
  useEffect(() => {
    if (!syncWithUrl) return;

    const params = new URLSearchParams(searchParams.toString());

    // Update sort field
    if (sortField !== initialField) {
      params.set("sortField", String(sortField));
    } else {
      params.delete("sortField");
    }

    // Update sort direction
    if (sortDirection !== initialDirection) {
      params.set("sortDirection", sortDirection);
    } else {
      params.delete("sortDirection");
    }

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    router.replace(newUrl, { scroll: false });
  }, [sortField, sortDirection, initialField, initialDirection, syncWithUrl, router, searchParams]);

  // Handle sort (toggle direction if same field)
  const handleSort = useCallback(
    (field: keyof T) => {
      if (field === sortField) {
        // Toggle direction
        setSortDirectionState((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        // New field, default to desc
        setSortFieldState(field);
        setSortDirectionState("desc");
      }
    },
    [sortField]
  );

  const setSortField = useCallback((field: keyof T) => {
    setSortFieldState(field);
  }, []);

  const setSortDirection = useCallback((direction: SortDirection) => {
    setSortDirectionState(direction);
  }, []);

  return {
    sortField,
    sortDirection,
    handleSort,
    setSortField,
    setSortDirection,
  };
}
