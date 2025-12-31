import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFilterParams } from "@/components/common/filters";

// Mock Next.js navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

describe("useFilterParams", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.forEach((_, key) => mockSearchParams.delete(key));
  });

  describe("updateParam", () => {
    it("should add parameter when value is provided", () => {
      const { result } = renderHook(() =>
        useFilterParams({ basePath: "/test" })
      );

      act(() => {
        result.current.updateParam("sort", "newest");
      });

      expect(mockPush).toHaveBeenCalledWith("/test?sort=newest");
    });

    it("should remove parameter when value is null", () => {
      mockSearchParams.set("sort", "newest");

      const { result } = renderHook(() =>
        useFilterParams({ basePath: "/test" })
      );

      act(() => {
        result.current.updateParam("sort", null);
      });

      expect(mockPush).toHaveBeenCalledWith("/test?");
    });

    it("should remove parameter when value equals default", () => {
      mockSearchParams.set("sort", "newest");

      const { result } = renderHook(() =>
        useFilterParams({ basePath: "/test" })
      );

      act(() => {
        result.current.updateParam("sort", "newest", "newest");
      });

      expect(mockPush).toHaveBeenCalledWith("/test?");
    });

    it("should reset pagination by default", () => {
      mockSearchParams.set("page", "2");
      mockSearchParams.set("sort", "oldest");

      const { result } = renderHook(() =>
        useFilterParams({ basePath: "/test" })
      );

      act(() => {
        result.current.updateParam("sort", "newest");
      });

      expect(mockPush).toHaveBeenCalledWith("/test?sort=newest");
    });

    it("should not reset pagination when resetPagination is false", () => {
      mockSearchParams.set("page", "2");

      const { result } = renderHook(() =>
        useFilterParams({ basePath: "/test", resetPagination: false })
      );

      act(() => {
        result.current.updateParam("sort", "newest");
      });

      expect(mockPush).toHaveBeenCalledWith("/test?sort=newest&page=2");
    });
  });

  describe("toggleMultiParam", () => {
    it("should add item to empty selection", () => {
      const { result } = renderHook(() =>
        useFilterParams({ basePath: "/test" })
      );

      act(() => {
        result.current.toggleMultiParam("tag", "react", []);
      });

      expect(mockPush).toHaveBeenCalledWith("/test?tag=react");
    });

    it("should add item to existing selection", () => {
      const { result } = renderHook(() =>
        useFilterParams({ basePath: "/test" })
      );

      act(() => {
        result.current.toggleMultiParam("tag", "nextjs", ["react"]);
      });

      expect(mockPush).toHaveBeenCalledWith("/test?tag=react%2Cnextjs");
    });

    it("should remove item from selection", () => {
      const { result } = renderHook(() =>
        useFilterParams({ basePath: "/test" })
      );

      act(() => {
        result.current.toggleMultiParam("tag", "react", ["react", "nextjs"]);
      });

      expect(mockPush).toHaveBeenCalledWith("/test?tag=nextjs");
    });

    it("should remove parameter when last item is removed", () => {
      mockSearchParams.set("tag", "react");

      const { result } = renderHook(() =>
        useFilterParams({ basePath: "/test" })
      );

      act(() => {
        result.current.toggleMultiParam("tag", "react", ["react"]);
      });

      expect(mockPush).toHaveBeenCalledWith("/test?");
    });

    it("should reset pagination when toggling", () => {
      mockSearchParams.set("page", "3");

      const { result } = renderHook(() =>
        useFilterParams({ basePath: "/test" })
      );

      act(() => {
        result.current.toggleMultiParam("tag", "react", []);
      });

      expect(mockPush).toHaveBeenCalledWith("/test?tag=react");
    });
  });

  describe("clearAll", () => {
    it("should navigate to base path without parameters", () => {
      mockSearchParams.set("tag", "react");
      mockSearchParams.set("sort", "newest");
      mockSearchParams.set("page", "2");

      const { result } = renderHook(() =>
        useFilterParams({ basePath: "/test" })
      );

      act(() => {
        result.current.clearAll();
      });

      expect(mockPush).toHaveBeenCalledWith("/test");
    });
  });

  describe("getParam", () => {
    it("should return parameter value", () => {
      mockSearchParams.set("sort", "newest");

      const { result } = renderHook(() =>
        useFilterParams({ basePath: "/test" })
      );

      const value = result.current.getParam("sort");
      expect(value).toBe("newest");
    });

    it("should return null for missing parameter", () => {
      const { result } = renderHook(() =>
        useFilterParams({ basePath: "/test" })
      );

      const value = result.current.getParam("missing");
      expect(value).toBeNull();
    });
  });
});
