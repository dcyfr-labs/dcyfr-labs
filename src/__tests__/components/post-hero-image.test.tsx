import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PostHeroImage } from '@/components/blog'

describe('PostHeroImage', () => {
  it('uses caption as alt text when caption is provided', () => {
    render(
      <PostHeroImage
        image={{ url: '/img.jpg', alt: 'Old alt', caption: 'Caption text' }}
        title="Test Title"
        priority={false}
      />
    )

    expect(screen.getByAltText('Caption text')).toBeInTheDocument()
  })

  it('uses provided alt when caption is not present', () => {
    render(
      <PostHeroImage
        image={{ url: '/img2.jpg', alt: 'Provided alt' }}
        title="Other Title"
        priority={false}
      />
    )

    expect(screen.getByAltText('Provided alt')).toBeInTheDocument()
  })

  it('falls back to generated alt using title when neither caption nor alt are provided', () => {
    render(
      <PostHeroImage
        image={{ url: '/img3.jpg' }}
        title="Fallback Title"
        priority={false}
      />
    )

    expect(screen.getByAltText('Hero image for Fallback Title')).toBeInTheDocument()
  })
})
