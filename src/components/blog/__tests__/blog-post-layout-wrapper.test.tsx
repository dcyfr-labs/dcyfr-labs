import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { BlogPostLayoutWrapper } from "../blog-post-layout-wrapper";

describe("BlogPostLayoutWrapper", () => {
  describe("Layout Structure", () => {
    it("renders with grid display class", () => {
      const { container } = render(
        <BlogPostLayoutWrapper>
          <div data-testid="toc">TOC</div>
          <div data-testid="content">Content</div>
          <div data-testid="sidebar">Sidebar</div>
        </BlogPostLayoutWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("grid");
    });

    it("applies responsive grid column classes", () => {
      const { container } = render(
        <BlogPostLayoutWrapper>
          <div>Content</div>
        </BlogPostLayoutWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      // Two-column on large screens (TOC + Content)
      expect(wrapper).toHaveClass("lg:grid-cols-[240px_1fr]");
      // Three-column on extra large screens (TOC + Content + Sidebar)
      expect(wrapper).toHaveClass("xl:grid-cols-[240px_1fr_240px]");
    });

    it("applies spacing design token (gap-8)", () => {
      const { container } = render(
        <BlogPostLayoutWrapper>
          <div>Content</div>
        </BlogPostLayoutWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("gap-8");
    });

    it("renders all children correctly", () => {
      const { getByTestId } = render(
        <BlogPostLayoutWrapper>
          <div data-testid="toc">Table of Contents</div>
          <div data-testid="content">Main Content</div>
          <div data-testid="sidebar">Sidebar</div>
        </BlogPostLayoutWrapper>
      );

      expect(getByTestId("toc")).toBeInTheDocument();
      expect(getByTestId("content")).toBeInTheDocument();
      expect(getByTestId("sidebar")).toBeInTheDocument();
    });

    it("accepts and applies custom className", () => {
      const { container } = render(
        <BlogPostLayoutWrapper className="custom-class">
          <div>Content</div>
        </BlogPostLayoutWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("custom-class");
      // Should still have base classes
      expect(wrapper).toHaveClass("grid");
    });
  });

  describe("Accessibility", () => {
    it("maintains semantic HTML structure", () => {
      const { container } = render(
        <BlogPostLayoutWrapper>
          <nav data-testid="toc">TOC</nav>
          <article data-testid="content">Content</article>
          <aside data-testid="sidebar">Sidebar</aside>
        </BlogPostLayoutWrapper>
      );

      // Children should maintain their semantic elements
      expect(container.querySelector("nav")).toBeInTheDocument();
      expect(container.querySelector("article")).toBeInTheDocument();
      expect(container.querySelector("aside")).toBeInTheDocument();
    });
  });
});
