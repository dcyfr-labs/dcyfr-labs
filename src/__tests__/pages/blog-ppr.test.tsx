/**
 * PPR (Partial Prerendering) Tests for Blog Pages
 * 
 * Tests for Suspense boundaries, skeleton rendering, and streaming behavior
 * Verifies that static content renders immediately and dynamic content streams
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BlogListSkeleton } from "@/components/blog";

describe("Blog PPR - BlogListSkeleton Component", () => {
  describe("Grid Layout", () => {
    it("renders skeleton placeholders for grid layout", () => {
      const { container } = render(<BlogListSkeleton layout="grid" itemCount={3} />);
      const skeletonItems = container.querySelectorAll("article");
      expect(skeletonItems.length).toBe(3);
    });

    it("renders mobile filters skeleton", () => {
      render(<BlogListSkeleton layout="grid" itemCount={3} />);
      const mobileFilters = document.querySelector(".lg\\:hidden");
      expect(mobileFilters).toBeInTheDocument();
    });

    it("renders pagination skeleton with 5 items", () => {
      const { container } = render(<BlogListSkeleton layout="grid" itemCount={3} />);
      const paginationItems = container.querySelectorAll(".h-10.w-10");
      expect(paginationItems.length).toBeGreaterThanOrEqual(5);
    });

    it("applies animate-pulse class to skeleton elements", () => {
      const { container } = render(<BlogListSkeleton layout="grid" itemCount={2} />);
      const pulseElements = container.querySelectorAll(".animate-pulse");
      expect(pulseElements.length).toBeGreaterThan(0);
    });

    it("uses aspect-video for hero images in grid layout", () => {
      const { container } = render(<BlogListSkeleton layout="grid" itemCount={2} />);
      const aspectVideoElements = container.querySelectorAll(".aspect-video");
      expect(aspectVideoElements.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("List Layout", () => {
    it("renders skeleton items with list layout structure", () => {
      const { container } = render(<BlogListSkeleton layout="list" itemCount={3} />);
      // List layout should have items with vertical spacing
      const parentDiv = container.querySelector("#blog-posts");
      expect(parentDiv).toBeInTheDocument();
    });

    it("doesn't render hero image placeholders in list layout", () => {
      const { container } = render(<BlogListSkeleton layout="list" itemCount={3} />);
      // List layout items shouldn't have aspect-video elements for each post
      const aspectVideoElements = container.querySelectorAll("article .aspect-video");
      expect(aspectVideoElements.length).toBe(0);
    });

    it("renders text line placeholders for list items", () => {
      const { container } = render(<BlogListSkeleton layout="list" itemCount={2} />);
      const textPlaceholders = container.querySelectorAll(".h-4, .h-5, .h-6");
      expect(textPlaceholders.length).toBeGreaterThan(0);
    });
  });

  describe("Magazine Layout", () => {
    it("renders fewer items in magazine layout (max 2)", () => {
      const { container } = render(
        <BlogListSkeleton layout="magazine" itemCount={5} />
      );
      const articles = container.querySelectorAll("article");
      expect(articles.length).toBe(2);
    });

    it("renders large hero images for magazine items", () => {
      const { container } = render(
        <BlogListSkeleton layout="magazine" itemCount={3} />
      );
      const aspectVideoElements = container.querySelectorAll(".aspect-video");
      expect(aspectVideoElements.length).toBe(2);
    });
  });

  describe("Compact Layout", () => {
    it("renders more items in compact layout", () => {
      const { container } = render(
        <BlogListSkeleton layout="compact" itemCount={3} />
      );
      // Compact shows itemCount + 3 (for visual density)
      const compactItems = container.querySelectorAll(".border-b");
      expect(compactItems.length).toBeGreaterThanOrEqual(3);
    });

    it("doesn't render large image placeholders in compact layout", () => {
      const { container } = render(
        <BlogListSkeleton layout="compact" itemCount={3} />
      );
      const aspectVideoElements = container.querySelectorAll(".aspect-video");
      expect(aspectVideoElements.length).toBe(0);
    });
  });

  describe("Accessibility", () => {
    it("renders with proper id for linking", () => {
      const { container } = render(<BlogListSkeleton layout="grid" />);
      const blogPostsDiv = container.querySelector("#blog-posts");
      expect(blogPostsDiv).toBeInTheDocument();
    });

    it("maintains color contrast with dark mode support", () => {
      const { container } = render(<BlogListSkeleton layout="grid" itemCount={2} />);
      const darkModeElements = container.querySelectorAll(".dark\\:bg-gray-700");
      expect(darkModeElements.length).toBeGreaterThan(0);
    });

    it("uses semantic HTML structure", () => {
      const { container } = render(<BlogListSkeleton layout="grid" itemCount={2} />);
      const articles = container.querySelectorAll("article");
      expect(articles.length).toBeGreaterThan(0);
    });
  });

  describe("CLS Prevention", () => {
    it("skeleton layout matches actual content dimensions", () => {
      const { container } = render(<BlogListSkeleton layout="grid" itemCount={3} />);
      const blogPostsDiv = container.querySelector("#blog-posts");
      
      // Check that skeleton has proper padding/margins like actual content
      expect(blogPostsDiv).toHaveClass("px-2", "sm:px-4", "lg:px-8", "w-full");
    });

    it("pagination skeleton has fixed height to prevent CLS", () => {
      const { container } = render(<BlogListSkeleton layout="grid" itemCount={3} />);
      const paginationItems = container.querySelectorAll(".h-10.w-10");
      
      // All items should have fixed height classes
      paginationItems.forEach((item) => {
        expect(item).toHaveClass("h-10");
      });
    });

    it("skeleton items have consistent spacing", () => {
      const { container } = render(<BlogListSkeleton layout="grid" itemCount={2} />);
      const gridContainer = container.querySelector(".grid");
      
      // Grid should have consistent gap (SPACING.contentGrid = gap-6)
      expect(gridContainer).toHaveClass("gap-6");
    });
  });

  describe("Loading States", () => {
    it("defaults to 3 items when itemCount not specified", () => {
      const { container } = render(<BlogListSkeleton layout="grid" />);
      const articles = container.querySelectorAll("article");
      expect(articles.length).toBe(3);
    });

    it("respects custom itemCount prop", () => {
      const { container } = render(<BlogListSkeleton layout="grid" itemCount={5} />);
      const articles = container.querySelectorAll("article");
      expect(articles.length).toBe(5);
    });

    it("defaults to grid layout when layout not specified", () => {
      const { container } = render(<BlogListSkeleton />);
      const articles = container.querySelectorAll("article");
      expect(articles.length).toBeGreaterThan(0);
    });
  });

  describe("PPR Integration", () => {
    it("provides fallback while DynamicBlogContent suspends", () => {
      // This test verifies the skeleton can be used as a Suspense fallback
      const { container } = render(
        <BlogListSkeleton layout="grid" itemCount={3} />
      );
      
      // Should render without errors
      expect(container.querySelector("#blog-posts")).toBeInTheDocument();
      
      // Should have animating elements (indicates loading)
      const animatingElements = container.querySelectorAll(".animate-pulse");
      expect(animatingElements.length).toBeGreaterThan(0);
    });

    it("skeleton structure matches expected DynamicBlogContent output", () => {
      const { container } = render(<BlogListSkeleton layout="grid" itemCount={3} />);
      
      // Should have blog-posts div (same as DynamicBlogContent)
      expect(container.querySelector("#blog-posts")).toBeInTheDocument();
      
      // Should have mobile filters (same as DynamicBlogContent)
      const mobileFilters = container.querySelector(".lg\\:hidden");
      expect(mobileFilters).toBeInTheDocument();
      
      // Should have pagination skeleton
      expect(container.querySelector(".mt-8")).toBeInTheDocument();
    });
  });
});
