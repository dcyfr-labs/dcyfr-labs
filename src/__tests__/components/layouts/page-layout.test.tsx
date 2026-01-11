import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type React from 'react'
import { PageLayout } from '@/components/layouts'

// Mock dependencies
vi.mock('@/components/features/draft-banner', () => ({
  DraftBanner: () => <div data-testid="draft-banner">Draft Banner</div>,
}))

describe('PageLayout', () => {
  beforeEach(() => {
    // Reset environment for each test
    vi.stubEnv('NODE_ENV', 'production')
  })

  describe('Basic Rendering', () => {
    it('renders children correctly', () => {
      render(
        <PageLayout>
          <div data-testid="child-content">Test Content</div>
        </PageLayout>
      )

      expect(screen.getByTestId('child-content')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('renders multiple children', () => {
      render(
        <PageLayout>
          <div data-testid="child-1">First Child</div>
          <div data-testid="child-2">Second Child</div>
          <div data-testid="child-3">Third Child</div>
        </PageLayout>
      )

      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
      expect(screen.getByTestId('child-3')).toBeInTheDocument()
    })

    it('renders with default wrapper structure', () => {
      const { container } = render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.tagName).toBe('DIV')
    })
  })

  describe('Custom className', () => {
    it('applies custom className to wrapper', () => {
      const { container } = render(
        <PageLayout className="custom-class">
          <div>Content</div>
        </PageLayout>
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('custom-class')
    })

    it('merges custom className with default classes', () => {
      const { container } = render(
        <PageLayout className="bg-linear-to-b from-background to-muted">
          <div>Content</div>
        </PageLayout>
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('bg-linear-to-b')
      expect(wrapper.className).toContain('from-background')
      expect(wrapper.className).toContain('to-muted')
    })

    it('works without custom className', () => {
      const { container } = render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>
      )

      const wrapper = container.firstChild as HTMLElement
      // Should still have default classes from PAGE_LAYOUT.wrapper
      expect(wrapper.className).toBeTruthy()
    })
  })

  describe('Draft Mode', () => {
    it('does not show draft banner by default', () => {
      render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>
      )

      expect(screen.queryByTestId('draft-banner')).not.toBeInTheDocument()
    })

    it('does not show draft banner when isDraft is false', () => {
      render(
        <PageLayout isDraft={false}>
          <div>Content</div>
        </PageLayout>
      )

      expect(screen.queryByTestId('draft-banner')).not.toBeInTheDocument()
    })

    it('shows draft banner in development when isDraft is true', () => {
      vi.stubEnv('NODE_ENV', 'development')

      render(
        <PageLayout isDraft>
          <div>Content</div>
        </PageLayout>
      )

      expect(screen.getByTestId('draft-banner')).toBeInTheDocument()
    })

    it('does not show draft banner in production even when isDraft is true', () => {
      vi.stubEnv('NODE_ENV', 'production')

      render(
        <PageLayout isDraft>
          <div>Content</div>
        </PageLayout>
      )

      expect(screen.queryByTestId('draft-banner')).not.toBeInTheDocument()
    })

    it('renders draft banner before children when shown', () => {
      vi.stubEnv('NODE_ENV', 'development')

      const { container } = render(
        <PageLayout isDraft>
          <div data-testid="child-content">Content</div>
        </PageLayout>
      )

      const wrapper = container.firstChild as HTMLElement
      const firstChild = wrapper.firstChild as HTMLElement
      expect(firstChild.getAttribute('data-testid')).toBe('draft-banner')
    })
  })

  describe('Complex Children', () => {
    it('renders nested components correctly', () => {
      const NestedComponent = () => (
        <div data-testid="nested">
          <h1>Title</h1>
          <p>Description</p>
        </div>
      )

      render(
        <PageLayout>
          <NestedComponent />
        </PageLayout>
      )

      expect(screen.getByTestId('nested')).toBeInTheDocument()
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('renders with React fragments', () => {
      render(
        <PageLayout>
          <>
            <div data-testid="fragment-child-1">First</div>
            <div data-testid="fragment-child-2">Second</div>
          </>
        </PageLayout>
      )

      expect(screen.getByTestId('fragment-child-1')).toBeInTheDocument()
      expect(screen.getByTestId('fragment-child-2')).toBeInTheDocument()
    })

    it('renders null children without errors', () => {
      expect(() => {
        render(
          <PageLayout>
            {null}
            <div>Valid Content</div>
          </PageLayout>
        )
      }).not.toThrow()

      expect(screen.getByText('Valid Content')).toBeInTheDocument()
    })

    it('renders conditional children', () => {
      const showContent = true

      render(
        <PageLayout>
          {showContent && <div data-testid="conditional">Conditional Content</div>}
          {!showContent && <div data-testid="hidden">Hidden Content</div>}
        </PageLayout>
      )

      expect(screen.getByTestId('conditional')).toBeInTheDocument()
      expect(screen.queryByTestId('hidden')).not.toBeInTheDocument()
    })
  })

  describe('Integration Scenarios', () => {
    it('works with PageHero component (simulated)', () => {
      const MockPageHero = () => (
        <div data-testid="page-hero">
          <h1>Page Title</h1>
          <p>Page Description</p>
        </div>
      )

      render(
        <PageLayout>
          <MockPageHero />
          <main data-testid="page-content">Main Content</main>
        </PageLayout>
      )

      expect(screen.getByTestId('page-hero')).toBeInTheDocument()
      expect(screen.getByTestId('page-content')).toBeInTheDocument()
    })

    it('works with custom sections', () => {
      render(
        <PageLayout className="custom-layout">
          <section data-testid="section-1">Section 1</section>
          <section data-testid="section-2">Section 2</section>
          <section data-testid="section-3">Section 3</section>
        </PageLayout>
      )

      expect(screen.getByTestId('section-1')).toBeInTheDocument()
      expect(screen.getByTestId('section-2')).toBeInTheDocument()
      expect(screen.getByTestId('section-3')).toBeInTheDocument()
    })

    it('combines isDraft and custom className', () => {
      vi.stubEnv('NODE_ENV', 'development')

      const { container } = render(
        <PageLayout isDraft className="custom-wrapper">
          <div>Content</div>
        </PageLayout>
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('custom-wrapper')
      expect(screen.getByTestId('draft-banner')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('maintains semantic HTML structure', () => {
      const { container } = render(
        <PageLayout>
          <main>
            <h1>Main Heading</h1>
            <article>Content</article>
          </main>
        </PageLayout>
      )

      expect(container.querySelector('main')).toBeInTheDocument()
      expect(container.querySelector('h1')).toBeInTheDocument()
      expect(container.querySelector('article')).toBeInTheDocument()
    })

    it('preserves ARIA attributes on children', () => {
      render(
        <PageLayout>
          <div aria-label="Test Label" data-testid="aria-element">
            Content
          </div>
        </PageLayout>
      )

      const element = screen.getByTestId('aria-element')
      expect(element).toHaveAttribute('aria-label', 'Test Label')
    })
  })
})
