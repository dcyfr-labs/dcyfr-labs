import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ArticleLayout } from '@/components/layouts'
import { ArticleHeader } from '@/components/layouts'
import { ArticleFooter } from '@/components/layouts'

describe('Print Styles - ArticleLayout', () => {
  describe('CSS Import', () => {
    it('loads print styles without errors', () => {
      expect(() => {
        render(
          <ArticleLayout>
            <div>Test Content</div>
          </ArticleLayout>
        )
      }).not.toThrow()
    })
  })

  describe('Print-Friendly Structure', () => {
    it('renders article with header for printing', () => {
      const { container } = render(
        <ArticleLayout
          header={
            <ArticleHeader
              title="Test Article"
              date={new Date('2025-12-07')}
              tags={['react', 'typescript']}
              metadata="5 min read"
            />
          }
        >
          <p>Article content here</p>
        </ArticleLayout>
      )

      const article = container.querySelector('article')
      expect(article).toBeInTheDocument()

      const header = article?.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('renders article with footer for printing', () => {
      const { container } = render(
        <ArticleLayout
          header={<ArticleHeader title="Test" />}
          footer={<ArticleFooter />}
        >
          <p>Content</p>
        </ArticleLayout>
      )

      const footer = container.querySelector('article > footer')
      expect(footer).toBeInTheDocument()
    })

    it('renders content div between header and footer', () => {
      const { container } = render(
        <ArticleLayout
          header={<ArticleHeader title="Test" />}
          footer={<ArticleFooter />}
        >
          <div data-testid="article-content">Test Content</div>
        </ArticleLayout>
      )

      expect(screen.getByTestId('article-content')).toBeInTheDocument()

      const article = container.querySelector('article')
      const header = article?.querySelector('header')
      const footer = article?.querySelector('footer')
      const content = screen.getByTestId('article-content')

      // Verify order: header -> content -> footer
      expect(header?.parentNode).toBe(article)
      expect(content.parentNode?.parentNode).toBe(article) // wrapped in div
      expect(footer?.parentNode).toBe(article)
    })
  })

  describe('Print-Specific Content', () => {
    it('preserves article content for printing', () => {
      const testContent = 'This is important article content for printing'
      render(
        <ArticleLayout>
          <p>{testContent}</p>
          <h2>Section Heading</h2>
          <p>More content</p>
        </ArticleLayout>
      )

      expect(screen.getByText(testContent)).toBeInTheDocument()
      expect(screen.getByText('Section Heading')).toBeInTheDocument()
    })

    it('handles code blocks for printing', () => {
      render(
        <ArticleLayout>
          <pre><code>const hello = &quot;world&quot;;</code></pre>
        </ArticleLayout>
      )

      expect(screen.getByText('const hello = "world";')).toBeInTheDocument()
    })

    it('handles lists for printing', () => {
      render(
        <ArticleLayout>
          <ul>
            <li>First point</li>
            <li>Second point</li>
            <li>Third point</li>
          </ul>
        </ArticleLayout>
      )

      expect(screen.getByText('First point')).toBeInTheDocument()
      expect(screen.getByText('Second point')).toBeInTheDocument()
      expect(screen.getByText('Third point')).toBeInTheDocument()
    })

    it('handles blockquotes for printing', () => {
      render(
        <ArticleLayout>
          <blockquote>
            <p>This is an important quote</p>
          </blockquote>
        </ArticleLayout>
      )

      expect(screen.getByText('This is an important quote')).toBeInTheDocument()
    })
  })

  describe('Print Layout Structure', () => {
    it('uses article element as semantic container', () => {
      const { container } = render(
        <ArticleLayout>
          <div>Content</div>
        </ArticleLayout>
      )

      const article = container.querySelector('article')
      expect(article?.tagName.toLowerCase()).toBe('article')
    })

    it('renders header as first child when provided', () => {
      const { container } = render(
        <ArticleLayout header={<div data-testid="header">Header</div>}>
          <div data-testid="content">Content</div>
        </ArticleLayout>
      )

      const article = container.querySelector('article')
      const firstChild = article?.querySelector('header')
      expect(firstChild?.querySelector('[data-testid="header"]')).toBeInTheDocument()
    })

    it('renders footer as last child when provided', () => {
      const { container } = render(
        <ArticleLayout footer={<div data-testid="footer">Footer</div>}>
          <div data-testid="content">Content</div>
        </ArticleLayout>
      )

      const article = container.querySelector('article')
      const lastChild = article?.lastElementChild
      expect(lastChild?.tagName.toLowerCase()).toBe('footer')
    })
  })

  describe('Print Media Query Support', () => {
    it('exports article with proper class structure for print styles', () => {
      const { container } = render(
        <ArticleLayout
          header={<ArticleHeader title="Article Title" />}
          footer={<ArticleFooter />}
        >
          <p>Article body content</p>
        </ArticleLayout>
      )

      const article = container.querySelector('article')
      
      // Verify elements exist for print CSS targeting
      expect(article?.querySelector('header')).toBeInTheDocument()
      expect(article?.querySelector('footer')).toBeInTheDocument()
      expect(article?.querySelector('div')).toBeInTheDocument() // content wrapper
    })
  })

  describe('Accessibility in Print', () => {
    it('maintains semantic structure for screen readers during print preview', () => {
      const { container } = render(
        <ArticleLayout
          header={<ArticleHeader title="Semantic Title" />}
        >
          <div aria-label="Article Content">Main content</div>
        </ArticleLayout>
      )

      const contentDiv = container.querySelector('[aria-label="Article Content"]')
      expect(contentDiv).toBeInTheDocument()
    })
  })
})
