import { describe, it, expect } from 'vitest'
import { posts } from '@/data/posts'

describe('Frontmatter validation', () => {
  it('featured posts must have an image with url and alt', () => {
    const featured = posts.filter((p) => p.featured)
    expect(featured.length).toBeGreaterThan(0)

    featured.forEach((post) => {
      expect(post.image).toBeDefined()
      expect(post.image?.url).toBeTruthy()
      expect(post.image?.alt).toBeTruthy()
    })
  })
})
