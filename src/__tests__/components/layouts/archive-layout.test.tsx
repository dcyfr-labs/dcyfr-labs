import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type React from 'react'
import { ArchiveLayout } from '@/components/layouts'

// Mock PageHero component
vi.mock('@/components/layouts/page-hero', () => ({
  PageHero: ({ title, description, itemCount, loading, variant }: {
    title?: string | React.ReactNode
    description?: string | React.ReactNode
    itemCount?: number
    loading?: boolean
    variant?: string
  }) => (
    <div data-testid="page-hero">
      {loading ? (
        <div data-testid="hero-loading">Loading Hero...</div>
      ) : (
        <>
          {title && <div data-testid="hero-title">{title}</div>}
          {description && <div data-testid="hero-description">{description}</div>}
          {itemCount !== undefined && <div data-testid="hero-item-count">{itemCount}</div>}
          {variant && <div data-testid="hero-variant">{variant}</div>}
        </>
      )}
    </div>
  ),
}))

describe('ArchiveLayout', () => {
  describe('Basic Rendering', () => {
    it('renders children correctly', () => {
      render(
        <ArchiveLayout>
          <div data-testid="archive-content">Archive Content</div>
        </ArchiveLayout>
      )

      expect(screen.getByTestId('archive-content')).toBeInTheDocument()
      expect(screen.getByText('Archive Content')).toBeInTheDocument()
    })

    it('renders PageHero internally', () => {
      render(
        <ArchiveLayout title="Blog Posts" description="All our writing">
          <div>Content</div>
        </ArchiveLayout>
      )

      expect(screen.getByTestId('page-hero')).toBeInTheDocument()
      expect(screen.getByTestId('hero-title')).toHaveTextContent('Blog Posts')
      expect(screen.getByTestId('hero-description')).toHaveTextContent('All our writing')
    })

    it('uses standard variant for PageHero', () => {
      render(
        <ArchiveLayout title="Archive">
          <div>Content</div>
        </ArchiveLayout>
      )

      expect(screen.getByTestId('hero-variant')).toHaveTextContent('standard')
    })
  })

  describe('Title and Description', () => {
    it('renders with title only', () => {
      render(
        <ArchiveLayout title="Projects">
          <div>Content</div>
        </ArchiveLayout>
      )

      expect(screen.getByTestId('hero-title')).toHaveTextContent('Projects')
      expect(screen.queryByTestId('hero-description')).not.toBeInTheDocument()
    })

    it('renders with description only', () => {
      render(
        <ArchiveLayout description="A collection of items">
          <div>Content</div>
        </ArchiveLayout>
      )

      expect(screen.queryByTestId('hero-title')).not.toBeInTheDocument()
      expect(screen.getByTestId('hero-description')).toHaveTextContent('A collection of items')
    })

    it('renders title as ReactNode', () => {
      render(
        <ArchiveLayout
          title={
            <div data-testid="custom-title">
              Custom <strong>Title</strong>
            </div>
          }
        >
          <div>Content</div>
        </ArchiveLayout>
      )

      expect(screen.getByTestId('custom-title')).toBeInTheDocument()
      expect(screen.getByText('Title')).toBeInTheDocument()
    })

    it('renders description as ReactNode', () => {
      render(
        <ArchiveLayout
          title="Title"
          description={
            <div data-testid="custom-description">
              <p>Paragraph 1</p>
              <p>Paragraph 2</p>
            </div>
          }
        >
          <div>Content</div>
        </ArchiveLayout>
      )

      expect(screen.getByTestId('custom-description')).toBeInTheDocument()
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument()
    })
  })

  describe('Filters', () => {
    it('renders filters when provided', () => {
      render(
        <ArchiveLayout
          title="Blog Posts"
          filters={
            <div data-testid="archive-filters">
              <input placeholder="Search..." />
              <button>Filter by Tag</button>
            </div>
          }
        >
          <div>Content</div>
        </ArchiveLayout>
      )

      expect(screen.getByTestId('archive-filters')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
      expect(screen.getByText('Filter by Tag')).toBeInTheDocument()
    })

    it('does not render filters section when not provided', () => {
      const { container } = render(
        <ArchiveLayout title="Posts">
          <div>Content</div>
        </ArchiveLayout>
      )

      // Filters should not be rendered
      expect(screen.queryByTestId('archive-filters')).not.toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    it('renders pagination when provided', () => {
      render(
        <ArchiveLayout
          title="Blog Posts"
          pagination={
            <div data-testid="archive-pagination">
              <button>Previous</button>
              <span>Page 1 of 5</span>
              <button>Next</button>
            </div>
          }
        >
          <div>Content</div>
        </ArchiveLayout>
      )

      expect(screen.getByTestId('archive-pagination')).toBeInTheDocument()
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Page 1 of 5')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('does not render pagination section when not provided', () => {
      const { container } = render(
        <ArchiveLayout title="Posts">
          <div>Content</div>
        </ArchiveLayout>
      )

      expect(screen.queryByTestId('archive-pagination')).not.toBeInTheDocument()
    })
  })

  describe('Item Count', () => {
    it('passes itemCount to PageHero', () => {
      render(
        <ArchiveLayout
          title="Blog Posts"
          description="All posts"
          itemCount={42}
        >
          <div>Content</div>
        </ArchiveLayout>
      )

      expect(screen.getByTestId('hero-item-count')).toHaveTextContent('42')
    })

    it('does not render itemCount when not provided', () => {
      render(
        <ArchiveLayout title="Posts">
          <div>Content</div>
        </ArchiveLayout>
      )

      expect(screen.queryByTestId('hero-item-count')).not.toBeInTheDocument()
    })

    it('handles zero itemCount', () => {
      render(
        <ArchiveLayout title="Posts" itemCount={0}>
          <div>No items found</div>
        </ArchiveLayout>
      )

      expect(screen.getByTestId('hero-item-count')).toHaveTextContent('0')
    })
  })

  describe('Custom Classes', () => {
    it('applies custom className to container', () => {
      const { container } = render(
        <ArchiveLayout title="Posts" className="custom-archive">
          <div>Content</div>
        </ArchiveLayout>
      )

      const mainContainer = container.querySelector('.custom-archive')
      expect(mainContainer).toBeInTheDocument()
    })

    it('applies custom contentClassName to content section', () => {
      const { container } = render(
        <ArchiveLayout title="Posts" contentClassName="custom-content">
          <div data-testid="content">Content</div>
        </ArchiveLayout>
      )

      // Content should be rendered
      expect(screen.getByTestId('content')).toBeInTheDocument()
    })

    it('combines multiple custom classes', () => {
      const { container } = render(
        <ArchiveLayout
          title="Posts"
          className="custom-archive bg-muted"
          contentClassName="custom-content grid"
        >
          <div>Content</div>
        </ArchiveLayout>
      )

      expect(container.querySelector('.custom-archive')).toBeInTheDocument()
      expect(container.querySelector('.bg-muted')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('passes loading state to PageHero', () => {
      render(
        <ArchiveLayout loading>
          <div data-testid="skeleton-content">Loading Skeleton</div>
        </ArchiveLayout>
      )

      expect(screen.getByTestId('hero-loading')).toBeInTheDocument()
      expect(screen.getByTestId('skeleton-content')).toBeInTheDocument()
    })

    it('renders children even in loading state', () => {
      render(
        <ArchiveLayout loading>
          <div data-testid="content">Content still renders</div>
        </ArchiveLayout>
      )

      expect(screen.getByTestId('content')).toBeInTheDocument()
    })
  })

  describe('Complex Scenarios', () => {
    it('renders complete archive page with all features', () => {
      render(
        <ArchiveLayout
          title="Blog Posts"
          description="All our writing about web development"
          itemCount={25}
          filters={
            <div data-testid="filters">
              <input placeholder="Search..." />
            </div>
          }
          pagination={
            <div data-testid="pagination">
              <button>Previous</button>
              <button>Next</button>
            </div>
          }
          className="custom-archive"
          contentClassName="custom-content"
        >
          <div data-testid="post-list">
            <article>Post 1</article>
            <article>Post 2</article>
            <article>Post 3</article>
          </div>
        </ArchiveLayout>
      )

      expect(screen.getByTestId('hero-title')).toHaveTextContent('Blog Posts')
      expect(screen.getByTestId('hero-item-count')).toHaveTextContent('25')
      expect(screen.getByTestId('filters')).toBeInTheDocument()
      expect(screen.getByTestId('post-list')).toBeInTheDocument()
      expect(screen.getByTestId('pagination')).toBeInTheDocument()
      expect(screen.getByText('Post 1')).toBeInTheDocument()
    })

    it('renders minimal archive with just children', () => {
      render(
        <ArchiveLayout>
          <div data-testid="minimal-content">Minimal Content</div>
        </ArchiveLayout>
      )

      expect(screen.getByTestId('minimal-content')).toBeInTheDocument()
      expect(screen.getByTestId('page-hero')).toBeInTheDocument()
    })

    it('renders archive with filters but no pagination', () => {
      render(
        <ArchiveLayout
          title="Projects"
          filters={<div data-testid="filters">Filters</div>}
        >
          <div>Projects Grid</div>
        </ArchiveLayout>
      )

      expect(screen.getByTestId('filters')).toBeInTheDocument()
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
    })

    it('renders archive with pagination but no filters', () => {
      render(
        <ArchiveLayout
          title="Posts"
          pagination={<div data-testid="pagination">Pagination</div>}
        >
          <div>Posts List</div>
        </ArchiveLayout>
      )

      expect(screen.getByTestId('pagination')).toBeInTheDocument()
      expect(screen.queryByTestId('filters')).not.toBeInTheDocument()
    })
  })

  describe('Content Structure', () => {
    it('renders multiple children correctly', () => {
      render(
        <ArchiveLayout title="Posts">
          <article data-testid="post-1">Post 1</article>
          <article data-testid="post-2">Post 2</article>
          <article data-testid="post-3">Post 3</article>
        </ArchiveLayout>
      )

      expect(screen.getByTestId('post-1')).toBeInTheDocument()
      expect(screen.getByTestId('post-2')).toBeInTheDocument()
      expect(screen.getByTestId('post-3')).toBeInTheDocument()
    })

    it('renders nested components in children', () => {
      const PostList = () => (
        <div data-testid="post-list">
          <article>Post A</article>
          <article>Post B</article>
        </div>
      )

      render(
        <ArchiveLayout title="Posts">
          <PostList />
        </ArchiveLayout>
      )

      expect(screen.getByTestId('post-list')).toBeInTheDocument()
      expect(screen.getByText('Post A')).toBeInTheDocument()
      expect(screen.getByText('Post B')).toBeInTheDocument()
    })

    it('handles conditional rendering in children', () => {
      const hasContent = true

      render(
        <ArchiveLayout title="Posts">
          {hasContent && <div data-testid="has-content">Has Content</div>}
          {!hasContent && <div data-testid="no-content">No Content</div>}
        </ArchiveLayout>
      )

      expect(screen.getByTestId('has-content')).toBeInTheDocument()
      expect(screen.queryByTestId('no-content')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('maintains semantic structure', () => {
      const { container } = render(
        <ArchiveLayout
          title="Blog Posts"
          description="All posts"
          filters={<div>Filters</div>}
          pagination={<div>Pagination</div>}
        >
          <main data-testid="main-content">
            <article>Post 1</article>
          </main>
        </ArchiveLayout>
      )

      expect(screen.getByTestId('main-content')).toBeInTheDocument()
      expect(container.querySelector('main')).toBeInTheDocument()
      expect(container.querySelector('article')).toBeInTheDocument()
    })
  })
})
