import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ArticleHeader } from '@/components/layouts/article-header'

describe('ArticleHeader', () => {
  it('renders caption and credit when backgroundImage includes them', () => {
    render(
      <ArticleHeader
        title="Test Article"
        backgroundImage={{
          url: '/test.jpg',
          alt: 'Test image',
          caption: 'This is a caption',
          credit: 'Jane Doe',
          position: 'center',
          priority: false,
        }}
      />
    )

    expect(screen.getByText('This is a caption')).toBeInTheDocument()
    expect(screen.getByText(/Photo by Jane Doe/)).toBeInTheDocument()

    // Ensure figcaption exists
    const figcaption = document.querySelector('figcaption')
    expect(figcaption).toBeInTheDocument()
  })
})
