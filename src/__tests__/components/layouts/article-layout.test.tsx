import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type React from 'react'
import { ArticleLayout } from '@/components/layouts/article-layout'

describe('ArticleLayout', () => {
  describe('Basic Rendering', () => {
    it('renders children correctly', () => {
      render(
        <ArticleLayout>
          <div data-testid="article-content">Article Content</div>
        </ArticleLayout>
      )

      expect(screen.getByTestId('article-content')).toBeInTheDocument()
      expect(screen.getByText('Article Content')).toBeInTheDocument()
    })

    it('renders as article element', () => {
      const { container } = render(
        <ArticleLayout>
          <div>Content</div>
        </ArticleLayout>
      )

      expect(container.querySelector('article')).toBeInTheDocument()
    })

    it('renders without header and footer', () => {
      render(
        <ArticleLayout>
          <div data-testid="content">Just Content</div>
        </ArticleLayout>
      )

      expect(screen.getByTestId('content')).toBeInTheDocument()
      expect(screen.queryByRole('banner')).not.toBeInTheDocument()
      expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
    })
  })

  describe('Header', () => {
    it('renders header when provided', () => {
      render(
        <ArticleLayout
          header={
            <div data-testid="article-header">
              <h1>Article Title</h1>
              <time>2025-01-15</time>
            </div>
          }
        >
          <div>Content</div>
        </ArticleLayout>
      )

      expect(screen.getByTestId('article-header')).toBeInTheDocument()
      expect(screen.getByText('Article Title')).toBeInTheDocument()
      expect(screen.getByText('2025-01-15')).toBeInTheDocument()
    })

    it('renders header in header element', () => {
      const { container } = render(
        <ArticleLayout
          header={<div data-testid="header-content">Header</div>}
        >
          <div>Content</div>
        </ArticleLayout>
      )

      const header = container.querySelector('header')
      expect(header).toBeInTheDocument()
      expect(header?.querySelector('[data-testid="header-content"]')).toBeInTheDocument()
    })

    it('does not render header element when header not provided', () => {
      const { container } = render(
        <ArticleLayout>
          <div>Content</div>
        </ArticleLayout>
      )

      expect(container.querySelector('header')).not.toBeInTheDocument()
    })
  })

  describe('Footer', () => {
    it('renders footer when provided', () => {
      render(
        <ArticleLayout
          footer={
            <div data-testid="article-footer">
              <div>Share this blog post</div>
              <div>Related posts</div>
            </div>
          }
        >
          <div>Content</div>
        </ArticleLayout>
      )

      expect(screen.getByTestId('article-footer')).toBeInTheDocument()
      expect(screen.getByText('Share this blog post')).toBeInTheDocument()
      expect(screen.getByText('Related posts')).toBeInTheDocument()
    })

    it('renders footer in footer element', () => {
      const { container } = render(
        <ArticleLayout
          footer={<div data-testid="footer-content">Footer</div>}
        >
          <div>Content</div>
        </ArticleLayout>
      )

      const footer = container.querySelector('footer')
      expect(footer).toBeInTheDocument()
      expect(footer?.querySelector('[data-testid="footer-content"]')).toBeInTheDocument()
    })

    it('does not render footer element when footer not provided', () => {
      const { container } = render(
        <ArticleLayout>
          <div>Content</div>
        </ArticleLayout>
      )

      expect(container.querySelector('footer')).not.toBeInTheDocument()
    })

    it('applies border-t class to footer', () => {
      const { container } = render(
        <ArticleLayout
          footer={<div>Footer</div>}
        >
          <div>Content</div>
        </ArticleLayout>
      )

      const footer = container.querySelector('footer')
      expect(footer?.className).toContain('border-t')
    })
  })

  describe('Prose Width', () => {
    it('uses prose width by default', () => {
      const { container } = render(
        <ArticleLayout>
          <div>Content</div>
        </ArticleLayout>
      )

      const article = container.querySelector('article')
      // Should have prose width class applied (max-w-4xl from design tokens)
      expect(article).toBeInTheDocument()
    })

    it('uses prose width when useProseWidth is true', () => {
      const { container } = render(
        <ArticleLayout useProseWidth={true}>
          <div>Content</div>
        </ArticleLayout>
      )

      const article = container.querySelector('article')
      expect(article).toBeInTheDocument()
    })

    it('uses standard width when useProseWidth is false', () => {
      const { container } = render(
        <ArticleLayout useProseWidth={false}>
          <div>Content</div>
        </ArticleLayout>
      )

      const article = container.querySelector('article')
      expect(article).toBeInTheDocument()
    })
  })

  describe('Custom Classes', () => {
    it('applies custom className to article container', () => {
      const { container } = render(
        <ArticleLayout className="custom-article">
          <div>Content</div>
        </ArticleLayout>
      )

      const article = container.querySelector('article')
      expect(article?.className).toContain('custom-article')
    })

    it('applies custom contentClassName to content wrapper', () => {
      const { container } = render(
        <ArticleLayout contentClassName="custom-content">
          <div data-testid="content">Content</div>
        </ArticleLayout>
      )

      expect(screen.getByTestId('content')).toBeInTheDocument()
    })

    it('combines multiple custom classes', () => {
      const { container } = render(
        <ArticleLayout
          className="custom-article bg-background"
          contentClassName="custom-content prose"
        >
          <div>Content</div>
        </ArticleLayout>
      )

      const article = container.querySelector('article')
      expect(article?.className).toContain('custom-article')
      expect(article?.className).toContain('bg-background')
    })
  })

  describe('Complex Scenarios', () => {
    it('renders complete article with header, content, and footer', () => {
      render(
        <ArticleLayout
          header={
            <div data-testid="header">
              <h1>Blog Post Title</h1>
              <p>Published on Jan 15, 2025</p>
            </div>
          }
          footer={
            <div data-testid="footer">
              <div>Share on social media</div>
              <div>Related articles</div>
            </div>
          }
        >
          <div data-testid="content">
            <p>Article paragraph 1</p>
            <p>Article paragraph 2</p>
          </div>
        </ArticleLayout>
      )

      expect(screen.getByTestId('header')).toBeInTheDocument()
      expect(screen.getByTestId('content')).toBeInTheDocument()
      expect(screen.getByTestId('footer')).toBeInTheDocument()
      expect(screen.getByText('Blog Post Title')).toBeInTheDocument()
      expect(screen.getByText('Article paragraph 1')).toBeInTheDocument()
      expect(screen.getByText('Share on social media')).toBeInTheDocument()
    })

    it('renders with custom styling and all features', () => {
      const { container } = render(
        <ArticleLayout
          header={<div data-testid="header">Header</div>}
          footer={<div data-testid="footer">Footer</div>}
          useProseWidth={true}
          className="custom-layout"
          contentClassName="custom-content"
        >
          <div data-testid="content">Content</div>
        </ArticleLayout>
      )

      const article = container.querySelector('article')
      expect(article?.className).toContain('custom-layout')
      expect(screen.getByTestId('header')).toBeInTheDocument()
      expect(screen.getByTestId('content')).toBeInTheDocument()
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })

    it('renders with header only', () => {
      render(
        <ArticleLayout
          header={<div data-testid="header">Header Only</div>}
        >
          <div data-testid="content">Content</div>
        </ArticleLayout>
      )

      expect(screen.getByTestId('header')).toBeInTheDocument()
      expect(screen.getByTestId('content')).toBeInTheDocument()
      expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
    })

    it('renders with footer only', () => {
      render(
        <ArticleLayout
          footer={<div data-testid="footer">Footer Only</div>}
        >
          <div data-testid="content">Content</div>
        </ArticleLayout>
      )

      expect(screen.queryByRole('banner')).not.toBeInTheDocument()
      expect(screen.getByTestId('content')).toBeInTheDocument()
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })
  })

  describe('Content Structure', () => {
    it('renders MDX-like content correctly', () => {
      render(
        <ArticleLayout>
          <div data-testid="mdx-content">
            <h2>Section Heading</h2>
            <p>Paragraph text</p>
            <pre>
              <code>const example = true</code>
            </pre>
          </div>
        </ArticleLayout>
      )

      expect(screen.getByTestId('mdx-content')).toBeInTheDocument()
      expect(screen.getByText('Section Heading')).toBeInTheDocument()
      expect(screen.getByText('Paragraph text')).toBeInTheDocument()
      expect(screen.getByText('const example = true')).toBeInTheDocument()
    })

    it('renders multiple content sections', () => {
      render(
        <ArticleLayout>
          <section data-testid="section-1">Section 1</section>
          <section data-testid="section-2">Section 2</section>
          <section data-testid="section-3">Section 3</section>
        </ArticleLayout>
      )

      expect(screen.getByTestId('section-1')).toBeInTheDocument()
      expect(screen.getByTestId('section-2')).toBeInTheDocument()
      expect(screen.getByTestId('section-3')).toBeInTheDocument()
    })

    it('renders nested components in content', () => {
      const ContentSection = () => (
        <div data-testid="content-section">
          <h2>Nested Component</h2>
          <p>Nested content</p>
        </div>
      )

      render(
        <ArticleLayout>
          <ContentSection />
        </ArticleLayout>
      )

      expect(screen.getByTestId('content-section')).toBeInTheDocument()
      expect(screen.getByText('Nested Component')).toBeInTheDocument()
    })

    it('handles conditional content rendering', () => {
      const showExtra = true

      render(
        <ArticleLayout>
          <div data-testid="main-content">Main Content</div>
          {showExtra && <div data-testid="extra-content">Extra Content</div>}
        </ArticleLayout>
      )

      expect(screen.getByTestId('main-content')).toBeInTheDocument()
      expect(screen.getByTestId('extra-content')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('uses semantic article element', () => {
      const { container } = render(
        <ArticleLayout>
          <div>Content</div>
        </ArticleLayout>
      )

      const article = container.querySelector('article')
      expect(article).toBeInTheDocument()
      expect(article?.tagName).toBe('ARTICLE')
    })

    it('uses semantic header element for header', () => {
      const { container } = render(
        <ArticleLayout
          header={<div>Header Content</div>}
        >
          <div>Content</div>
        </ArticleLayout>
      )

      const header = container.querySelector('header')
      expect(header).toBeInTheDocument()
      expect(header?.tagName).toBe('HEADER')
    })

    it('uses semantic footer element for footer', () => {
      const { container } = render(
        <ArticleLayout
          footer={<div>Footer Content</div>}
        >
          <div>Content</div>
        </ArticleLayout>
      )

      const footer = container.querySelector('footer')
      expect(footer).toBeInTheDocument()
      expect(footer?.tagName).toBe('FOOTER')
    })

    it('maintains heading hierarchy in header', () => {
      render(
        <ArticleLayout
          header={
            <div>
              <h1>Main Title</h1>
              <h2>Subtitle</h2>
            </div>
          }
        >
          <div>Content</div>
        </ArticleLayout>
      )

      expect(screen.getByRole('heading', { level: 1, name: 'Main Title' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2, name: 'Subtitle' })).toBeInTheDocument()
    })

    it('preserves ARIA attributes on children', () => {
      render(
        <ArticleLayout>
          <div aria-label="Article Content" data-testid="aria-content">
            Content with ARIA
          </div>
        </ArticleLayout>
      )

      const element = screen.getByTestId('aria-content')
      expect(element).toHaveAttribute('aria-label', 'Article Content')
    })
  })

  describe('Edge Cases', () => {
    it('renders with null children gracefully', () => {
      expect(() => {
        render(
          <ArticleLayout>
            {null}
            <div>Valid Content</div>
          </ArticleLayout>
        )
      }).not.toThrow()

      expect(screen.getByText('Valid Content')).toBeInTheDocument()
    })

    it('renders with empty string content', () => {
      expect(() => {
        render(
          <ArticleLayout>
            <div>{''}</div>
          </ArticleLayout>
        )
      }).not.toThrow()
    })

    it('renders with React fragments', () => {
      render(
        <ArticleLayout>
          <>
            <div data-testid="fragment-1">Fragment 1</div>
            <div data-testid="fragment-2">Fragment 2</div>
          </>
        </ArticleLayout>
      )

      expect(screen.getByTestId('fragment-1')).toBeInTheDocument()
      expect(screen.getByTestId('fragment-2')).toBeInTheDocument()
    })
  })
})
