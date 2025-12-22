import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useNavigation, useLogoClick } from "@/hooks/use-navigation";
import type { NavItem } from "@/lib/navigation-config";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

const mockUsePathname = vi.mocked(await import("next/navigation")).usePathname;

describe("useNavigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("pathname", () => {
    it("should return current pathname", () => {
      mockUsePathname.mockReturnValue("/blog");

      const { result } = renderHook(() => useNavigation());

      expect(result.current.pathname).toBe("/blog");
    });
  });

  describe("isActive", () => {
    it("should return true for exact match on root path", () => {
      mockUsePathname.mockReturnValue("/");

      const { result } = renderHook(() => useNavigation());

      expect(result.current.isActive("/")).toBe(true);
    });

    it("should return false for non-root paths when on root", () => {
      mockUsePathname.mockReturnValue("/");

      const { result } = renderHook(() => useNavigation());

      expect(result.current.isActive("/blog")).toBe(false);
    });

    it("should match with startsWith by default", () => {
      mockUsePathname.mockReturnValue("/blog/post-1");

      const { result } = renderHook(() => useNavigation());

      expect(result.current.isActive("/blog")).toBe(true);
    });

    it("should match exact path when exact is true", () => {
      mockUsePathname.mockReturnValue("/blog");

      const { result } = renderHook(() => useNavigation());

      expect(result.current.isActive("/blog", true)).toBe(true);
    });

    it("should not match partial path when exact is true", () => {
      mockUsePathname.mockReturnValue("/blog/post-1");

      const { result } = renderHook(() => useNavigation());

      expect(result.current.isActive("/blog", true)).toBe(false);
    });

    it("should handle paths with query parameters", () => {
      mockUsePathname.mockReturnValue("/work?category=startup");

      const { result } = renderHook(() => useNavigation());

      expect(result.current.isActive("/work")).toBe(true);
    });

    it("should handle nested paths", () => {
      mockUsePathname.mockReturnValue("/blog/series/next-js");

      const { result } = renderHook(() => useNavigation());

      expect(result.current.isActive("/blog")).toBe(true);
      expect(result.current.isActive("/blog/series")).toBe(true);
    });

    it("should always require exact match for root path", () => {
      mockUsePathname.mockReturnValue("/blog");

      const { result } = renderHook(() => useNavigation());

      // Even with exact=false, root should not match
      expect(result.current.isActive("/", false)).toBe(false);
    });
  });

  describe("isNavItemActive", () => {
    it("should use item's exactMatch property", () => {
      mockUsePathname.mockReturnValue("/blog/post-1");

      const item: NavItem = {
        href: "/blog",
        label: "Blog",
        exactMatch: true,
      };

      const { result } = renderHook(() => useNavigation());

      expect(result.current.isNavItemActive(item)).toBe(false);
    });

    it("should use startsWith when exactMatch is false", () => {
      mockUsePathname.mockReturnValue("/blog/post-1");

      const item: NavItem = {
        href: "/blog",
        label: "Blog",
        exactMatch: false,
      };

      const { result } = renderHook(() => useNavigation());

      expect(result.current.isNavItemActive(item)).toBe(true);
    });

    it("should override with exact parameter when provided", () => {
      mockUsePathname.mockReturnValue("/blog/post-1");

      const item: NavItem = {
        href: "/blog",
        label: "Blog",
        exactMatch: false,
      };

      const { result } = renderHook(() => useNavigation());

      // Override exactMatch with exact parameter
      expect(result.current.isNavItemActive(item, true)).toBe(false);
    });

    it("should handle items without exactMatch property", () => {
      mockUsePathname.mockReturnValue("/blog/post-1");

      const item: NavItem = {
        href: "/blog",
        label: "Blog",
      };

      const { result } = renderHook(() => useNavigation());

      // Should use startsWith by default
      expect(result.current.isNavItemActive(item)).toBe(true);
    });
  });

  describe("getAriaCurrent", () => {
    it("should return 'page' when active", () => {
      mockUsePathname.mockReturnValue("/blog");

      const { result } = renderHook(() => useNavigation());

      expect(result.current.getAriaCurrent("/blog")).toBe("page");
    });

    it("should return undefined when not active", () => {
      mockUsePathname.mockReturnValue("/work");

      const { result } = renderHook(() => useNavigation());

      expect(result.current.getAriaCurrent("/blog")).toBeUndefined();
    });

    it("should respect exact parameter", () => {
      mockUsePathname.mockReturnValue("/blog/post-1");

      const { result } = renderHook(() => useNavigation());

      expect(result.current.getAriaCurrent("/blog", false)).toBe("page");
      expect(result.current.getAriaCurrent("/blog", true)).toBeUndefined();
    });
  });
});

describe("useLogoClick", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.scrollTo
    window.scrollTo = vi.fn();
  });

  it("should scroll to top when on homepage", () => {
    mockUsePathname.mockReturnValue("/");

    const { result } = renderHook(() => useLogoClick());

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.MouseEvent<HTMLAnchorElement>;

    result.current(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  });

  it("should not prevent default when not on homepage", () => {
    mockUsePathname.mockReturnValue("/blog");

    const { result } = renderHook(() => useLogoClick());

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.MouseEvent<HTMLAnchorElement>;

    result.current(mockEvent);

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("should not scroll when on nested route", () => {
    mockUsePathname.mockReturnValue("/blog/post-1");

    const { result } = renderHook(() => useLogoClick());

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.MouseEvent<HTMLAnchorElement>;

    result.current(mockEvent);

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
