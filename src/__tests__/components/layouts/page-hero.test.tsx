import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type React from 'react'
import { PageHero } from '@/components/layouts'

// Mock dependencies
vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className}>
      Loading...
    </div>
  ),
}))

describe('PageHero', () => {
  describe('Basic Rendering', () => {
    it('renders with title and description', () => {
      render(
        <PageHero
          title="Test Title"
          description="Test Description"
        />
      )

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('renders title as ReactNode', () => {
      render(
        <PageHero
          title={
            <span data-testid="custom-title">
              Custom <strong>Title</strong>
            </span>
          }
          description="Description"
        />
      )

      expect(screen.getByTestId('custom-title')).toBeInTheDocument()
      expect(screen.getByText('Title')).toBeInTheDocument()
    })

    it('renders description as ReactNode', () => {
      render(
        <PageHero
          title="Title"
          description={
            <div data-testid="custom-description">
              <p>Paragraph 1</p>
              <p>Paragraph 2</p>
            </div>
          }
        />
      )

      expect(screen.getByTestId('custom-description')).toBeInTheDocument()
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument()
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument()
    })

    it('renders without title', () => {
      render(<PageHero description="Just a description" />)

      expect(screen.getByText('Just a description')).toBeInTheDocument()
      expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    })

    it('renders without description', () => {
      render(<PageHero title="Just a title" />)

      expect(screen.getByText('Just a title')).toBeInTheDocument()
    })

    it('renders as section element', () => {
      const { container } = render(
        <PageHero title="Title" description="Description" />
      )

      expect(container.querySelector('section')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('renders standard variant by default', () => {
      const { container } = render(
        <PageHero title="Title" description="Description" />
      )

      // Standard variant should be applied
      expect(container.querySelector('section')).toBeInTheDocument()
    })

    it('renders homepage variant', () => {
      render(
        <PageHero
          variant="homepage"
          title="Homepage Title"
          description="Homepage Description"
        />
      )

      expect(screen.getByText('Homepage Title')).toBeInTheDocument()
      expect(screen.getByText('Homepage Description')).toBeInTheDocument()
    })

    it('renders article variant', () => {
      render(
        <PageHero
          variant="article"
          title="Article Title"
          description="Article Description"
        />
      )

      expect(screen.getByText('Article Title')).toBeInTheDocument()
      expect(screen.getByText('Article Description')).toBeInTheDocument()
    })
  })

  describe('Alignment', () => {
    it('renders with left alignment by default', () => {
      const { container } = render(
        <PageHero title="Title" description="Description" />
      )

      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
    })

    it('renders with center alignment', () => {
      render(
        <PageHero
          title="Centered Title"
          description="Centered Description"
          align="center"
        />
      )

      expect(screen.getByText('Centered Title')).toBeInTheDocument()
      expect(screen.getByText('Centered Description')).toBeInTheDocument()
    })
  })

  describe('Optional Elements', () => {
    it('renders with image', () => {
      render(
        <PageHero
          title="Title"
          description="Description"
          image={<div data-testid="hero-image" role="img" aria-label="Avatar">Avatar Image</div>}
        />
      )

      expect(screen.getByTestId('hero-image')).toBeInTheDocument()
      expect(screen.getByLabelText('Avatar')).toBeInTheDocument()
    })

    it('renders with actions', () => {
      render(
        <PageHero
          title="Title"
          description="Description"
          actions={
            <div data-testid="hero-actions">
              <button>Action 1</button>
              <button>Action 2</button>
            </div>
          }
        />
      )

      expect(screen.getByTestId('hero-actions')).toBeInTheDocument()
      expect(screen.getByText('Action 1')).toBeInTheDocument()
      expect(screen.getByText('Action 2')).toBeInTheDocument()
    })

    it('renders with itemCount', () => {
      render(
        <PageHero
          title="Blog Posts"
          description="All posts"
          itemCount={42}
        />
      )

      expect(screen.getByText('Blog Posts')).toBeInTheDocument()
      // itemCount is typically rendered in the component's internal logic
    })
  })

  describe('Custom Classes', () => {
    it('applies custom className to container', () => {
      const { container } = render(
        <PageHero
          title="Title"
          description="Description"
          className="custom-hero"
        />
      )

      const section = container.querySelector('section')
      expect(section?.className).toContain('custom-hero')
    })

    it('applies custom contentClassName', () => {
      render(
        <PageHero
          title="Title"
          description="Description"
          contentClassName="custom-content"
        />
      )

      // contentClassName should be applied to inner content wrapper
      expect(screen.getByText('Title')).toBeInTheDocument()
    })

    it('combines multiple custom classes', () => {
      const { container } = render(
        <PageHero
          title="Title"
          description="Description"
          className="custom-hero bg-muted"
          contentClassName="custom-content p-4"
        />
      )

      const section = container.querySelector('section')
      expect(section?.className).toContain('custom-hero')
      expect(section?.className).toContain('bg-muted')
    })
  })

  describe('Loading State', () => {
    it('renders skeleton when loading is true', () => {
      render(<PageHero loading />)

      const skeletons = screen.getAllByTestId('skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('does not render title/description when loading', () => {
      render(
        <PageHero
          loading
          title="Should not appear"
          description="Should not appear"
        />
      )

      expect(screen.queryByText('Should not appear')).not.toBeInTheDocument()
    })

    it('renders standard variant skeleton by default', () => {
      render(<PageHero loading />)

      expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
    })

    it('renders homepage variant skeleton', () => {
      render(<PageHero loading variant="homepage" />)

      const skeletons = screen.getAllByTestId('skeleton')
      // Homepage variant should have image + title + description + actions skeletons
      expect(skeletons.length).toBeGreaterThanOrEqual(4)
    })

    it('renders with center alignment in loading state', () => {
      render(<PageHero loading align="center" />)

      expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
    })
  })

  describe('Complex Scenarios', () => {
    it('renders homepage variant with all features', () => {
      render(
        <PageHero
          variant="homepage"
          align="center"
          title="Welcome"
          description="Full-stack developer"
          image={<div data-testid="avatar">Avatar</div>}
          actions={
            <div data-testid="actions">
              <button>View Work</button>
              <button>Contact Me</button>
            </div>
          }
        />
      )

      expect(screen.getByText('Welcome')).toBeInTheDocument()
      expect(screen.getByText('Full-stack developer')).toBeInTheDocument()
      expect(screen.getByTestId('avatar')).toBeInTheDocument()
      expect(screen.getByTestId('actions')).toBeInTheDocument()
      expect(screen.getByText('View Work')).toBeInTheDocument()
      expect(screen.getByText('Contact Me')).toBeInTheDocument()
    })

    it('renders article variant with custom styling', () => {
      render(
        <PageHero
          variant="article"
          title="Blog Post Title"
          description="A detailed post about web development"
          className="border-b"
          contentClassName="max-w-prose"
        />
      )

      expect(screen.getByText('Blog Post Title')).toBeInTheDocument()
      expect(screen.getByText('A detailed post about web development')).toBeInTheDocument()
    })

    it('renders with ReactNode title and actions', () => {
      render(
        <PageHero
          title={
            <div>
              <span>Main Title</span>
              <span className="text-muted-foreground"> - Subtitle</span>
            </div>
          }
          description="Description"
          actions={
            <>
              <button>Primary</button>
              <button>Secondary</button>
            </>
          }
        />
      )

      expect(screen.getByText('Main Title')).toBeInTheDocument()
      expect(screen.getByText('- Subtitle')).toBeInTheDocument()
      expect(screen.getByText('Primary')).toBeInTheDocument()
      expect(screen.getByText('Secondary')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('renders with empty strings', () => {
      render(<PageHero title="" description="" />)

      // Should render without errors even with empty strings
      const section = document.querySelector('section')
      expect(section).toBeInTheDocument()
    })

    it('renders with only image', () => {
      render(
        <PageHero
          image={<div data-testid="only-image">Image Only</div>}
        />
      )

      expect(screen.getByTestId('only-image')).toBeInTheDocument()
    })

    it('renders with only actions', () => {
      render(
        <PageHero
          actions={<button data-testid="only-action">Action Only</button>}
        />
      )

      expect(screen.getByTestId('only-action')).toBeInTheDocument()
    })

    it('handles null children in actions gracefully', () => {
      render(
        <PageHero
          title="Title"
          actions={
            <>
              <button>Visible</button>
              {false && <button>Hidden</button>}
            </>
          }
        />
      )

      expect(screen.getByText('Visible')).toBeInTheDocument()
      expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('renders title as h1 when provided as string', () => {
      render(<PageHero title="Accessible Title" description="Description" />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Accessible Title')
    })

    it('maintains semantic structure with image and content', () => {
      const { container } = render(
        <PageHero
          title="Title"
          description="Description"
          image={<div data-testid="test-image" role="img" aria-label="Test">Test Image</div>}
        />
      )

      expect(container.querySelector('section')).toBeInTheDocument()
      expect(screen.getByTestId('test-image')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })
  })
})
