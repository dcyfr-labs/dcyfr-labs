import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useActiveFilters } from "@/components/common/filters";

describe("useActiveFilters", () => {
  it("should return no active filters for empty state", () => {
    const { result } = renderHook(() => useActiveFilters({}));

    expect(result.current.hasActive).toBe(false);
    expect(result.current.count).toBe(0);
    expect(result.current.activeFilters).toEqual([]);
  });

  it("should count string filters", () => {
    const { result } = renderHook(() =>
      useActiveFilters({
        sort: "newest",
        status: "active",
      })
    );

    expect(result.current.hasActive).toBe(true);
    expect(result.current.count).toBe(2);
    expect(result.current.activeFilters).toEqual([
      { key: "sort", value: "newest" },
      { key: "status", value: "active" },
    ]);
  });

  it("should count array filters by length", () => {
    const { result } = renderHook(() =>
      useActiveFilters({
        tags: ["react", "nextjs", "typescript"],
      })
    );

    expect(result.current.hasActive).toBe(true);
    expect(result.current.count).toBe(3);
    expect(result.current.activeFilters).toEqual([
      { key: "tags", value: ["react", "nextjs", "typescript"] },
    ]);
  });

  it("should ignore null and undefined values", () => {
    const { result } = renderHook(() =>
      useActiveFilters({
        sort: "newest",
        status: null,
        dateRange: undefined,
      })
    );

    expect(result.current.hasActive).toBe(true);
    expect(result.current.count).toBe(1);
    expect(result.current.activeFilters).toEqual([
      { key: "sort", value: "newest" },
    ]);
  });

  it("should ignore empty arrays", () => {
    const { result } = renderHook(() =>
      useActiveFilters({
        tags: [],
        tech: ["react"],
      })
    );

    expect(result.current.hasActive).toBe(true);
    expect(result.current.count).toBe(1);
    expect(result.current.activeFilters).toEqual([
      { key: "tech", value: ["react"] },
    ]);
  });

  it("should ignore empty strings", () => {
    const { result } = renderHook(() =>
      useActiveFilters({
        query: "",
        sort: "newest",
      })
    );

    expect(result.current.hasActive).toBe(true);
    expect(result.current.count).toBe(1);
    expect(result.current.activeFilters).toEqual([
      { key: "sort", value: "newest" },
    ]);
  });

  it("should respect default values", () => {
    const { result } = renderHook(() =>
      useActiveFilters(
        {
          sort: "newest",
          dateRange: "all",
          status: "active",
        },
        {
          sort: "newest",
          dateRange: "all",
        }
      )
    );

    expect(result.current.hasActive).toBe(true);
    expect(result.current.count).toBe(1);
    expect(result.current.activeFilters).toEqual([
      { key: "status", value: "active" },
    ]);
  });

  it("should handle mixed filter types", () => {
    const { result } = renderHook(() =>
      useActiveFilters(
        {
          query: "search term",
          tags: ["react", "nextjs"],
          sort: "newest",
          status: null,
        },
        {
          sort: "newest",
        }
      )
    );

    expect(result.current.hasActive).toBe(true);
    expect(result.current.count).toBe(3); // 1 query + 2 tags
    expect(result.current.activeFilters).toEqual([
      { key: "query", value: "search term" },
      { key: "tags", value: ["react", "nextjs"] },
    ]);
  });

  it("should handle arrays with default empty array", () => {
    const { result } = renderHook(() =>
      useActiveFilters(
        {
          tags: [],
          tech: ["react"],
        },
        {
          tags: [],
        }
      )
    );

    expect(result.current.hasActive).toBe(true);
    expect(result.current.count).toBe(1);
    expect(result.current.activeFilters).toEqual([
      { key: "tech", value: ["react"] },
    ]);
  });

  it("should handle complex real-world scenario", () => {
    const { result } = renderHook(() =>
      useActiveFilters(
        {
          query: "react hooks",
          tags: ["tutorial", "advanced"],
          readingTime: "medium",
          sortBy: "newest",
          dateRange: "all",
        },
        {
          sortBy: "newest",
          dateRange: "all",
        }
      )
    );

    expect(result.current.hasActive).toBe(true);
    expect(result.current.count).toBe(4); // 1 query + 2 tags + 1 readingTime
    expect(result.current.activeFilters).toEqual([
      { key: "query", value: "react hooks" },
      { key: "tags", value: ["tutorial", "advanced"] },
      { key: "readingTime", value: "medium" },
    ]);
  });
});
