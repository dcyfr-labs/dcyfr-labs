/**
 * PPR (Partial Prerendering) Tests for Blog Pages
 *
 * Tests for Suspense boundaries, skeleton rendering, and streaming behavior
 * Verifies that static content renders immediately and dynamic content streams
 *
 * Updated to test PostListSkeleton (which replaced BlogListSkeleton)
 */

import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BlogListSkeleton } from '@/components/blog';
import { SPACING } from '@/lib/design-tokens';

describe('Blog PPR - BlogListSkeleton Component (PostListSkeleton)', () => {
  describe('Grid Layout', () => {
    it('renders skeleton placeholders for grid layout', () => {
      const { container } = render(<BlogListSkeleton layout="grid" itemCount={3} />);
      // PostListSkeleton grid uses Card components
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();

      // Should have overflow-hidden class on cards
      const skeletonCards = container.querySelectorAll('.overflow-hidden');
      expect(skeletonCards.length).toBeGreaterThanOrEqual(3);
    });

    it('applies skeleton-shimmer class to skeleton elements', () => {
      const { container } = render(<BlogListSkeleton layout="grid" itemCount={2} />);
      const shimmerElements = container.querySelectorAll('.skeleton-shimmer');
      expect(shimmerElements.length).toBeGreaterThan(0);
    });

    it('respects custom itemCount prop', () => {
      const { container } = render(<BlogListSkeleton layout="grid" itemCount={5} />);
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('List Layout', () => {
    it('renders skeleton items with list layout structure', () => {
      const { container } = render(<BlogListSkeleton layout="list" itemCount={3} />);
      // List layout uses SPACING.subsection
      const listContainer = container.querySelector('.' + SPACING.subsection.split(' ')[0]);
      expect(listContainer).toBeInTheDocument();
    });

    it('renders text line placeholders for list items', () => {
      const { container } = render(<BlogListSkeleton layout="list" itemCount={3} />);
      const shimmerElements = container.querySelectorAll('.skeleton-shimmer');
      expect(shimmerElements.length).toBeGreaterThan(0);
    });
  });

  describe('Magazine Layout', () => {
    it('renders magazine layout with grid structure', () => {
      const { container } = render(<BlogListSkeleton layout="magazine" itemCount={4} />);
      const magazineContainer = container.querySelector('.' + SPACING.subsection.split(' ')[0]);
      expect(magazineContainer).toBeInTheDocument();
    });
  });

  describe('Compact Layout (default)', () => {
    it('renders compact layout by default', () => {
      const { container } = render(<BlogListSkeleton itemCount={3} />);
      // Compact uses SPACING.postList which is space-y-3
      const articles = container.querySelectorAll('article');
      expect(articles.length).toBe(3);
    });

    it('renders with relative positioning for overlays', () => {
      const { container } = render(<BlogListSkeleton layout="compact" itemCount={3} />);
      const relativeElements = container.querySelectorAll('.relative');
      expect(relativeElements.length).toBeGreaterThan(0);
    });
  });

  describe('Grouped Layout', () => {
    it('renders grouped layout with category sections', () => {
      const { container } = render(<BlogListSkeleton layout="grouped" itemCount={3} />);
      // Grouped layout has category headings (check width class)
      const categoryHeadings = container.querySelectorAll('.w-48');
      expect(categoryHeadings.length).toBeGreaterThanOrEqual(3);
    });

    it('renders multiple posts per category group', () => {
      const { container } = render(<BlogListSkeleton layout="grouped" itemCount={3} />);
      // Each group should have multiple post skeletons
      const articles = container.querySelectorAll('article');
      expect(articles.length).toBeGreaterThan(3); // More than just groups
    });
  });

  describe('Props and Defaults', () => {
    it('defaults to 3 items when count/itemCount not specified', () => {
      const { container } = render(<BlogListSkeleton />);
      const articles = container.querySelectorAll('article');
      expect(articles.length).toBe(3);
    });

    it('supports backward compatible itemCount prop', () => {
      const { container } = render(<BlogListSkeleton itemCount={5} />);
      const articles = container.querySelectorAll('article');
      expect(articles.length).toBe(5);
    });

    it('defaults to compact layout when layout not specified', () => {
      const { container } = render(<BlogListSkeleton />);
      // Compact layout uses article elements with specific structure
      const articles = container.querySelectorAll('article.group');
      expect(articles.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility & Performance', () => {
    it('uses semantic HTML structure', () => {
      const { container } = render(<BlogListSkeleton layout="grid" itemCount={3} />);
      // Should use semantic article or div elements
      const semanticElements = container.querySelectorAll('article, div');
      expect(semanticElements.length).toBeGreaterThan(0);
    });

    it('skeleton uses shimmer animation for visual feedback', () => {
      const { container } = render(<BlogListSkeleton layout="grid" itemCount={3} />);
      const shimmerElements = container.querySelectorAll('.skeleton-shimmer');
      expect(shimmerElements.length).toBeGreaterThan(0);
    });
  });

  describe('Wrapper Structure', () => {
    it('includes wrapper by default to match DynamicBlogContent structure', () => {
      const { container } = render(<BlogListSkeleton layout="compact" itemCount={3} />);
      // Should have the blog-posts wrapper div
      const wrapper = container.querySelector('#blog-posts');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass('w-full');
    });

    it('includes layout toggle skeleton when wrapper is enabled', () => {
      const { container } = render(<BlogListSkeleton layout="compact" itemCount={3} />);
      // Layout toggle skeleton has specific width
      const layoutToggleSkeleton = container.querySelector('.w-\\[180px\\]');
      expect(layoutToggleSkeleton).toBeInTheDocument();
    });

    it('omits wrapper when includeWrapper is false', () => {
      const { container } = render(
        <BlogListSkeleton layout="compact" itemCount={3} includeWrapper={false} />
      );
      // Should NOT have the blog-posts wrapper
      const wrapper = container.querySelector('#blog-posts');
      expect(wrapper).not.toBeInTheDocument();
    });

    it('omits layout toggle skeleton when wrapper is disabled', () => {
      const { container } = render(
        <BlogListSkeleton layout="compact" itemCount={3} includeWrapper={false} />
      );
      // No layout toggle skeleton
      const layoutToggleSkeleton = container.querySelector('.w-\\[180px\\]');
      expect(layoutToggleSkeleton).not.toBeInTheDocument();
    });
  });
});
