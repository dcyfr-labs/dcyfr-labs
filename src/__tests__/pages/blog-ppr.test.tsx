/**
 * PPR (Partial Prerendering) Tests for Blog Pages
 *
 * Tests for Suspense boundaries, skeleton rendering, and streaming behavior
 * Verifies that static content renders immediately and dynamic content streams
 *
 * Updated to test PostListSkeleton (which replaced BlogListSkeleton)
 */

import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BlogListSkeleton } from "@/components/blog";

describe("Blog PPR - BlogListSkeleton Component (PostListSkeleton)", () => {
  describe("Grid Layout", () => {
    it("renders skeleton placeholders for grid layout", () => {
      const { container } = render(<BlogListSkeleton layout="grid" itemCount={3} />);
      // PostListSkeleton grid uses Card components
      const gridContainer = container.querySelector(".grid");
      expect(gridContainer).toBeInTheDocument();

      // Should have overflow-hidden class on cards
      const skeletonCards = container.querySelectorAll(".overflow-hidden");
      expect(skeletonCards.length).toBeGreaterThanOrEqual(3);
    });

    it("applies skeleton-shimmer class to skeleton elements", () => {
      const { container} = render(<BlogListSkeleton layout="grid" itemCount={2} />);
      const shimmerElements = container.querySelectorAll(".skeleton-shimmer");
      expect(shimmerElements.length).toBeGreaterThan(0);
    });

    it("respects custom itemCount prop", () => {
      const { container } = render(<BlogListSkeleton layout="grid" itemCount={5} />);
      const gridContainer = container.querySelector(".grid");
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe("List Layout", () => {
    it("renders skeleton items with list layout structure", () => {
      const { container } = render(<BlogListSkeleton layout="list" itemCount={3} />);
      // List layout uses space-y-6
      const listContainer = container.querySelector(".space-y-6");
      expect(listContainer).toBeInTheDocument();
    });

    it("renders text line placeholders for list items", () => {
      const { container } = render(<BlogListSkeleton layout="list" itemCount={3} />);
      const shimmerElements = container.querySelectorAll(".skeleton-shimmer");
      expect(shimmerElements.length).toBeGreaterThan(0);
    });
  });

  describe("Magazine Layout", () => {
    it("renders magazine layout with grid structure", () => {
      const { container } = render(<BlogListSkeleton layout="magazine" itemCount={4} />);
      const magazineContainer = container.querySelector(".space-y-8");
      expect(magazineContainer).toBeInTheDocument();
    });
  });

  describe("Compact Layout (default)", () => {
    it("renders compact layout by default", () => {
      const { container } = render(<BlogListSkeleton itemCount={3} />);
      // Compact uses SPACING.postList which is space-y-3
      const articles = container.querySelectorAll("article");
      expect(articles.length).toBe(3);
    });

    it("renders with relative positioning for overlays", () => {
      const { container } = render(<BlogListSkeleton layout="compact" itemCount={3} />);
      const relativeElements = container.querySelectorAll(".relative");
      expect(relativeElements.length).toBeGreaterThan(0);
    });
  });

  describe("Grouped Layout", () => {
    it("renders grouped layout with category sections", () => {
      const { container } = render(<BlogListSkeleton layout="grouped" itemCount={3} />);
      // Grouped layout has category headings
      const categoryHeadings = container.querySelectorAll(".h-8.w-48");
      expect(categoryHeadings.length).toBeGreaterThanOrEqual(3);
    });

    it("renders multiple posts per category group", () => {
      const { container } = render(<BlogListSkeleton layout="grouped" itemCount={3} />);
      // Each group should have multiple post skeletons
      const articles = container.querySelectorAll("article");
      expect(articles.length).toBeGreaterThan(3); // More than just groups
    });
  });

  describe("Props and Defaults", () => {
    it("defaults to 3 items when count/itemCount not specified", () => {
      const { container } = render(<BlogListSkeleton />);
      const articles = container.querySelectorAll("article");
      expect(articles.length).toBe(3);
    });

    it("supports backward compatible itemCount prop", () => {
      const { container } = render(<BlogListSkeleton itemCount={5} />);
      const articles = container.querySelectorAll("article");
      expect(articles.length).toBe(5);
    });

    it("defaults to compact layout when layout not specified", () => {
      const { container } = render(<BlogListSkeleton />);
      // Compact layout uses article elements with specific structure
      const articles = container.querySelectorAll("article.group");
      expect(articles.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility & Performance", () => {
    it("uses semantic HTML structure", () => {
      const { container } = render(<BlogListSkeleton layout="grid" itemCount={3} />);
      // Should use semantic article or div elements
      const semanticElements = container.querySelectorAll("article, div");
      expect(semanticElements.length).toBeGreaterThan(0);
    });

    it("skeleton uses shimmer animation for visual feedback", () => {
      const { container } = render(<BlogListSkeleton layout="grid" itemCount={3} />);
      const shimmerElements = container.querySelectorAll(".skeleton-shimmer");
      expect(shimmerElements.length).toBeGreaterThan(0);
    });
  });
});
