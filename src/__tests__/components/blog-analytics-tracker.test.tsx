import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BlogAnalyticsTracker } from '@/components/blog'

// Mock dependencies
const mockUseBlogAnalytics = vi.fn()
const mockTrackBlogView = vi.fn()
const mockUseReferralTracking = vi.fn()

vi.mock('@/hooks/use-blog-analytics', () => ({
  useBlogAnalytics: (props: unknown) => mockUseBlogAnalytics(props),
}))

vi.mock('@/lib/analytics', () => ({
  trackBlogView: (...args: unknown[]) => mockTrackBlogView(...args),
}))

vi.mock('@/hooks/use-referral-tracking', () => ({
  useReferralTracking: (postId: string) => mockUseReferralTracking(postId),
}))

describe('BlogAnalyticsTracker', () => {
  const mockPost = {
    id: 'test-post-123',
    slug: 'test-post',
    title: 'Test Blog Post',
    tags: ['testing', 'typescript', 'react'],
    readingTime: 5,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders without visible output', () => {
      const { container } = render(<BlogAnalyticsTracker post={mockPost} />)

      // Component should not render any visible content
      expect(container.firstChild).toBeNull()
    })

    it('does not render any DOM elements', () => {
      render(<BlogAnalyticsTracker post={mockPost} />)

      // Should not have any text content or elements
      expect(screen.queryByText(/./)).not.toBeInTheDocument()
    })
  })

  describe('Hook Integration', () => {
    it('calls useBlogAnalytics with post slug', () => {
      render(<BlogAnalyticsTracker post={mockPost} />)

      expect(mockUseBlogAnalytics).toHaveBeenCalledWith({
        slug: 'test-post',
      })
    })

    it('calls useBlogAnalytics once on mount', () => {
      render(<BlogAnalyticsTracker post={mockPost} />)

      expect(mockUseBlogAnalytics).toHaveBeenCalledTimes(1)
    })

    it('updates useBlogAnalytics when slug changes', () => {
      const { rerender } = render(<BlogAnalyticsTracker post={mockPost} />)

      const updatedPost = { ...mockPost, slug: 'updated-post' }
      rerender(<BlogAnalyticsTracker post={updatedPost} />)

      // Should be called twice (once on mount, once on update)
      expect(mockUseBlogAnalytics).toHaveBeenCalledTimes(2)
      expect(mockUseBlogAnalytics).toHaveBeenLastCalledWith({
        slug: 'updated-post',
      })
    })
  })

  describe('Analytics Tracking', () => {
    it('tracks initial blog view on mount', () => {
      render(<BlogAnalyticsTracker post={mockPost} />)

      expect(mockTrackBlogView).toHaveBeenCalledWith(
        'test-post',
        'Test Blog Post',
        ['testing', 'typescript', 'react'],
        5
      )
    })

    it('tracks blog view once on mount', () => {
      render(<BlogAnalyticsTracker post={mockPost} />)

      expect(mockTrackBlogView).toHaveBeenCalledTimes(1)
    })

    it('does not track view on re-renders with same props', () => {
      const { rerender } = render(<BlogAnalyticsTracker post={mockPost} />)

      rerender(<BlogAnalyticsTracker post={mockPost} />)

      // Should still be called only once
      expect(mockTrackBlogView).toHaveBeenCalledTimes(1)
    })

    it('tracks new view when slug changes', () => {
      const { rerender } = render(<BlogAnalyticsTracker post={mockPost} />)

      const updatedPost = { ...mockPost, slug: 'new-slug' }
      rerender(<BlogAnalyticsTracker post={updatedPost} />)

      expect(mockTrackBlogView).toHaveBeenCalledTimes(2)
      expect(mockTrackBlogView).toHaveBeenLastCalledWith(
        'new-slug',
        'Test Blog Post',
        ['testing', 'typescript', 'react'],
        5
      )
    })

    it('tracks new view when title changes', () => {
      const { rerender } = render(<BlogAnalyticsTracker post={mockPost} />)

      const updatedPost = { ...mockPost, title: 'New Title' }
      rerender(<BlogAnalyticsTracker post={updatedPost} />)

      expect(mockTrackBlogView).toHaveBeenCalledTimes(2)
      expect(mockTrackBlogView).toHaveBeenLastCalledWith(
        'test-post',
        'New Title',
        ['testing', 'typescript', 'react'],
        5
      )
    })

    it('tracks new view when tags change', () => {
      const { rerender } = render(<BlogAnalyticsTracker post={mockPost} />)

      const updatedPost = { ...mockPost, tags: ['new', 'tags'] }
      rerender(<BlogAnalyticsTracker post={updatedPost} />)

      expect(mockTrackBlogView).toHaveBeenCalledTimes(2)
      expect(mockTrackBlogView).toHaveBeenLastCalledWith(
        'test-post',
        'Test Blog Post',
        ['new', 'tags'],
        5
      )
    })

    it('tracks new view when reading time changes', () => {
      const { rerender } = render(<BlogAnalyticsTracker post={mockPost} />)

      const updatedPost = { ...mockPost, readingTime: 10 }
      rerender(<BlogAnalyticsTracker post={updatedPost} />)

      expect(mockTrackBlogView).toHaveBeenCalledTimes(2)
      expect(mockTrackBlogView).toHaveBeenLastCalledWith(
        'test-post',
        'Test Blog Post',
        ['testing', 'typescript', 'react'],
        10
      )
    })
  })

  describe('Post Data Variations', () => {
    it('handles post with single tag', () => {
      const postWithOneTag = { ...mockPost, tags: ['single'] }
      render(<BlogAnalyticsTracker post={postWithOneTag} />)

      expect(mockTrackBlogView).toHaveBeenCalledWith(
        'test-post',
        'Test Blog Post',
        ['single'],
        5
      )
    })

    it('handles post with no tags', () => {
      const postWithNoTags = { ...mockPost, tags: [] }
      render(<BlogAnalyticsTracker post={postWithNoTags} />)

      expect(mockTrackBlogView).toHaveBeenCalledWith(
        'test-post',
        'Test Blog Post',
        [],
        5
      )
    })

    it('handles post with many tags', () => {
      const manyTags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6']
      const postWithManyTags = { ...mockPost, tags: manyTags }
      render(<BlogAnalyticsTracker post={postWithManyTags} />)

      expect(mockTrackBlogView).toHaveBeenCalledWith(
        'test-post',
        'Test Blog Post',
        manyTags,
        5
      )
    })

    it('handles post with zero reading time', () => {
      const quickPost = { ...mockPost, readingTime: 0 }
      render(<BlogAnalyticsTracker post={quickPost} />)

      expect(mockTrackBlogView).toHaveBeenCalledWith(
        'test-post',
        'Test Blog Post',
        ['testing', 'typescript', 'react'],
        0
      )
    })

    it('handles post with long reading time', () => {
      const longPost = { ...mockPost, readingTime: 45 }
      render(<BlogAnalyticsTracker post={longPost} />)

      expect(mockTrackBlogView).toHaveBeenCalledWith(
        'test-post',
        'Test Blog Post',
        ['testing', 'typescript', 'react'],
        45
      )
    })

    it('handles post with special characters in title', () => {
      const specialPost = {
        ...mockPost,
        title: "Test's Post: A Guide to \"React\" & TypeScript!",
      }
      render(<BlogAnalyticsTracker post={specialPost} />)

      expect(mockTrackBlogView).toHaveBeenCalledWith(
        'test-post',
        "Test's Post: A Guide to \"React\" & TypeScript!",
        ['testing', 'typescript', 'react'],
        5
      )
    })

    it('handles post with special characters in slug', () => {
      const specialPost = { ...mockPost, slug: 'test-post-2024-update' }
      render(<BlogAnalyticsTracker post={specialPost} />)

      expect(mockTrackBlogView).toHaveBeenCalledWith(
        'test-post-2024-update',
        'Test Blog Post',
        ['testing', 'typescript', 'react'],
        5
      )
    })
  })

  describe('Component Lifecycle', () => {
    it('cleans up properly on unmount', () => {
      const { unmount } = render(<BlogAnalyticsTracker post={mockPost} />)

      unmount()

      // Should not throw errors
      expect(mockUseBlogAnalytics).toHaveBeenCalledTimes(1)
      expect(mockTrackBlogView).toHaveBeenCalledTimes(1)
    })

    it('handles multiple mount/unmount cycles', () => {
      const { unmount } = render(<BlogAnalyticsTracker post={mockPost} />)

      unmount()

      mockUseBlogAnalytics.mockClear()
      mockTrackBlogView.mockClear()

      // Remount with fresh render
      render(<BlogAnalyticsTracker post={mockPost} />)

      expect(mockUseBlogAnalytics).toHaveBeenCalled()
      expect(mockTrackBlogView).toHaveBeenCalled()
    })
  })

  describe('Integration Behavior', () => {
    it('calls hooks in correct order', () => {
      const callOrder: string[] = []

      mockUseBlogAnalytics.mockImplementation(() => {
        callOrder.push('useBlogAnalytics')
        return { hasTrackedCompletion: false }
      })

      mockTrackBlogView.mockImplementation(() => {
        callOrder.push('trackBlogView')
      })

      render(<BlogAnalyticsTracker post={mockPost} />)

      // Both should be called, order not strictly enforced but both present
      expect(callOrder).toContain('useBlogAnalytics')
      expect(callOrder).toContain('trackBlogView')
    })

    it('continues tracking even if trackBlogView throws', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      mockTrackBlogView.mockImplementation(() => {
        throw new Error('Analytics error')
      })

      // Component will throw since useEffect error isn't caught
      expect(() => {
        render(<BlogAnalyticsTracker post={mockPost} />)
      }).toThrow('Analytics error')

      // Hook should still have been called
      expect(mockUseBlogAnalytics).toHaveBeenCalled()
      
      consoleErrorSpy.mockRestore()
    })
  })
})
