import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useFilterSearch } from "@/components/common/filters";

// Mock Next.js navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

describe("useFilterSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.forEach((_, key) => mockSearchParams.delete(key));
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with provided query", () => {
    const { result } = renderHook(() =>
      useFilterSearch({ query: "test", basePath: "/blog" })
    );

    expect(result.current.searchValue).toBe("test");
  });

  it("should sync search value when query prop changes", () => {
    const { result, rerender } = renderHook(
      ({ query }) => useFilterSearch({ query, basePath: "/blog" }),
      { initialProps: { query: "initial" } }
    );

    expect(result.current.searchValue).toBe("initial");

    rerender({ query: "updated" });

    expect(result.current.searchValue).toBe("updated");
  });

  it("should update search value immediately when setSearchValue is called", () => {
    const { result } = renderHook(() =>
      useFilterSearch({ query: "", basePath: "/blog" })
    );

    act(() => {
      result.current.setSearchValue("new value");
    });

    expect(result.current.searchValue).toBe("new value");
  });

  it("should debounce URL update by 250ms default", () => {
    const { result } = renderHook(() =>
      useFilterSearch({ query: "", basePath: "/blog" })
    );

    act(() => {
      result.current.setSearchValue("test");
    });

    expect(mockPush).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(249);
    });

    expect(mockPush).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(mockPush).toHaveBeenCalledWith("/blog?q=test", { scroll: false });
  });

  it("should respect custom debounce time", () => {
    const { result } = renderHook(() =>
      useFilterSearch({ query: "", basePath: "/blog", debounceMs: 500 })
    );

    act(() => {
      result.current.setSearchValue("test");
    });

    act(() => {
      vi.advanceTimersByTime(499);
    });

    expect(mockPush).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(mockPush).toHaveBeenCalled();
  });

  it("should trim whitespace before updating URL", () => {
    const { result } = renderHook(() =>
      useFilterSearch({ query: "", basePath: "/blog" })
    );

    act(() => {
      result.current.setSearchValue("  test  ");
    });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(mockPush).toHaveBeenCalledWith("/blog?q=test", { scroll: false });
  });

  it("should remove parameter when search is cleared", () => {
    mockSearchParams.set("q", "test");

    const { result } = renderHook(() =>
      useFilterSearch({ query: "test", basePath: "/blog" })
    );

    act(() => {
      result.current.setSearchValue("");
    });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(mockPush).toHaveBeenCalledWith("/blog?", { scroll: false });
  });

  it("should not update URL if value hasn't changed", () => {
    const { result } = renderHook(() =>
      useFilterSearch({ query: "test", basePath: "/blog" })
    );

    act(() => {
      result.current.setSearchValue("test");
    });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should use custom parameter name", () => {
    const { result } = renderHook(() =>
      useFilterSearch({ query: "", basePath: "/blog", paramName: "search" })
    );

    act(() => {
      result.current.setSearchValue("test");
    });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(mockPush).toHaveBeenCalledWith("/blog?search=test", {
      scroll: false,
    });
  });

  it("should reset pagination on search", () => {
    mockSearchParams.set("page", "3");

    const { result } = renderHook(() =>
      useFilterSearch({ query: "", basePath: "/blog" })
    );

    act(() => {
      result.current.setSearchValue("test");
    });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(mockPush).toHaveBeenCalledWith("/blog?q=test", { scroll: false });
  });

  it("should cancel previous debounce on rapid changes", () => {
    const { result } = renderHook(() =>
      useFilterSearch({ query: "", basePath: "/blog" })
    );

    act(() => {
      result.current.setSearchValue("a");
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      result.current.setSearchValue("ab");
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      result.current.setSearchValue("abc");
    });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/blog?q=abc", { scroll: false });
  });
});
