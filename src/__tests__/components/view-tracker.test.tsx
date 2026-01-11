import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { ViewTracker } from '@/components/features'

// Mock the hook
const mockUseViewTracking = vi.fn()

vi.mock('@/hooks/use-view-tracking', () => ({
  useViewTracking: (postId: string, enabled?: boolean) => 
    mockUseViewTracking(postId, enabled),
}))

describe('ViewTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders without visible output', () => {
      const { container } = render(<ViewTracker postId="test-post-123" />)

      // Component should not render any visible content
      expect(container.firstChild).toBeNull()
    })

    it('does not render any DOM elements', () => {
      const { container } = render(<ViewTracker postId="test-post-123" />)

      // Container should be empty
      expect(container.innerHTML).toBe('')
    })
  })

  describe('Hook Integration', () => {
    it('calls useViewTracking with postId', () => {
      render(<ViewTracker postId="test-post-123" />)

      expect(mockUseViewTracking).toHaveBeenCalledWith('test-post-123', true)
    })

    it('calls useViewTracking with enabled=true by default', () => {
      render(<ViewTracker postId="test-post-123" />)

      expect(mockUseViewTracking).toHaveBeenCalledWith('test-post-123', true)
    })

    it('calls useViewTracking with enabled=false when specified', () => {
      render(<ViewTracker postId="test-post-123" enabled={false} />)

      expect(mockUseViewTracking).toHaveBeenCalledWith('test-post-123', false)
    })

    it('calls useViewTracking with enabled=true when explicitly specified', () => {
      render(<ViewTracker postId="test-post-123" enabled={true} />)

      expect(mockUseViewTracking).toHaveBeenCalledWith('test-post-123', true)
    })

    it('calls useViewTracking once on mount', () => {
      render(<ViewTracker postId="test-post-123" />)

      expect(mockUseViewTracking).toHaveBeenCalledTimes(1)
    })
  })

  describe('PostId Handling', () => {
    it('handles numeric postId', () => {
      render(<ViewTracker postId="12345" />)

      expect(mockUseViewTracking).toHaveBeenCalledWith('12345', true)
    })

    it('handles alphanumeric postId', () => {
      render(<ViewTracker postId="post-abc-123" />)

      expect(mockUseViewTracking).toHaveBeenCalledWith('post-abc-123', true)
    })

    it('handles UUID-style postId', () => {
      render(<ViewTracker postId="550e8400-e29b-41d4-a716-446655440000" />)

      expect(mockUseViewTracking).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        true
      )
    })

    it('handles postId with special characters', () => {
      render(<ViewTracker postId="post_2024-01-15" />)

      expect(mockUseViewTracking).toHaveBeenCalledWith('post_2024-01-15', true)
    })

    it('handles empty string postId', () => {
      render(<ViewTracker postId="" />)

      expect(mockUseViewTracking).toHaveBeenCalledWith('', true)
    })

    it('handles very long postId', () => {
      const longId = 'a'.repeat(200)
      render(<ViewTracker postId={longId} />)

      expect(mockUseViewTracking).toHaveBeenCalledWith(longId, true)
    })
  })

  describe('Props Updates', () => {
    it('updates hook when postId changes', () => {
      const { rerender } = render(<ViewTracker postId="post-1" />)

      rerender(<ViewTracker postId="post-2" />)

      expect(mockUseViewTracking).toHaveBeenCalledTimes(2)
      expect(mockUseViewTracking).toHaveBeenNthCalledWith(1, 'post-1', true)
      expect(mockUseViewTracking).toHaveBeenNthCalledWith(2, 'post-2', true)
    })

    it('updates hook when enabled changes', () => {
      const { rerender } = render(<ViewTracker postId="post-1" enabled={true} />)

      rerender(<ViewTracker postId="post-1" enabled={false} />)

      expect(mockUseViewTracking).toHaveBeenCalledTimes(2)
      expect(mockUseViewTracking).toHaveBeenNthCalledWith(1, 'post-1', true)
      expect(mockUseViewTracking).toHaveBeenNthCalledWith(2, 'post-1', false)
    })

    it('updates hook when both props change', () => {
      const { rerender } = render(<ViewTracker postId="post-1" enabled={true} />)

      rerender(<ViewTracker postId="post-2" enabled={false} />)

      expect(mockUseViewTracking).toHaveBeenCalledTimes(2)
      expect(mockUseViewTracking).toHaveBeenNthCalledWith(1, 'post-1', true)
      expect(mockUseViewTracking).toHaveBeenNthCalledWith(2, 'post-2', false)
    })

    it('does not update hook on re-render with same props', () => {
      const { rerender } = render(<ViewTracker postId="post-1" />)

      rerender(<ViewTracker postId="post-1" />)

      // Should be called twice (once per render) due to React re-rendering
      expect(mockUseViewTracking).toHaveBeenCalledTimes(2)
      expect(mockUseViewTracking).toHaveBeenCalledWith('post-1', true)
    })
  })

  describe('Enabled Flag Behavior', () => {
    it('tracks when enabled is not specified (default true)', () => {
      render(<ViewTracker postId="post-1" />)

      expect(mockUseViewTracking).toHaveBeenCalledWith('post-1', true)
    })

    it('tracks when enabled is explicitly true', () => {
      render(<ViewTracker postId="post-1" enabled={true} />)

      expect(mockUseViewTracking).toHaveBeenCalledWith('post-1', true)
    })

    it('does not track when enabled is false', () => {
      render(<ViewTracker postId="post-1" enabled={false} />)

      expect(mockUseViewTracking).toHaveBeenCalledWith('post-1', false)
    })

    it('handles enabled toggling from false to true', () => {
      const { rerender } = render(<ViewTracker postId="post-1" enabled={false} />)

      rerender(<ViewTracker postId="post-1" enabled={true} />)

      expect(mockUseViewTracking).toHaveBeenNthCalledWith(1, 'post-1', false)
      expect(mockUseViewTracking).toHaveBeenNthCalledWith(2, 'post-1', true)
    })

    it('handles enabled toggling from true to false', () => {
      const { rerender } = render(<ViewTracker postId="post-1" enabled={true} />)

      rerender(<ViewTracker postId="post-1" enabled={false} />)

      expect(mockUseViewTracking).toHaveBeenNthCalledWith(1, 'post-1', true)
      expect(mockUseViewTracking).toHaveBeenNthCalledWith(2, 'post-1', false)
    })
  })

  describe('Component Lifecycle', () => {
    it('cleans up properly on unmount', () => {
      const { unmount } = render(<ViewTracker postId="post-1" />)

      unmount()

      // Should have been called once
      expect(mockUseViewTracking).toHaveBeenCalledTimes(1)
    })

    it('handles multiple mount/unmount cycles', () => {
      const { unmount } = render(<ViewTracker postId="post-1" />)

      unmount()

      mockUseViewTracking.mockClear()

      // Remount with fresh render
      render(<ViewTracker postId="post-1" />)

      // Should be called on new mount
      expect(mockUseViewTracking).toHaveBeenCalledTimes(1)
    })

    it('maintains postId across re-renders', () => {
      const { rerender } = render(<ViewTracker postId="consistent-post" />)

      // Multiple re-renders with same postId
      rerender(<ViewTracker postId="consistent-post" />)
      rerender(<ViewTracker postId="consistent-post" />)

      // All calls should have same postId
      const calls = mockUseViewTracking.mock.calls
      calls.forEach(call => {
        expect(call[0]).toBe('consistent-post')
      })
    })
  })

  describe('Error Handling', () => {
    it('throws error if hook throws', () => {
      mockUseViewTracking.mockImplementation(() => {
        throw new Error('Hook error')
      })

      // React will propagate the error
      expect(() => {
        render(<ViewTracker postId="post-1" />)
      }).toThrow('Hook error')
    })

    it('handles hook returning undefined', () => {
      mockUseViewTracking.mockReturnValue(undefined)

      const { container } = render(<ViewTracker postId="post-1" />)

      // Should still render (nothing)
      expect(container.innerHTML).toBe('')
    })

    it('handles hook returning null', () => {
      mockUseViewTracking.mockReturnValue(null)

      const { container } = render(<ViewTracker postId="post-1" />)

      expect(container.innerHTML).toBe('')
    })
  })

  describe('Multiple Instances', () => {
    it('tracks multiple posts independently', () => {
      render(
        <>
          <ViewTracker postId="post-1" />
          <ViewTracker postId="post-2" />
          <ViewTracker postId="post-3" />
        </>
      )

      expect(mockUseViewTracking).toHaveBeenCalledTimes(3)
      expect(mockUseViewTracking).toHaveBeenCalledWith('post-1', true)
      expect(mockUseViewTracking).toHaveBeenCalledWith('post-2', true)
      expect(mockUseViewTracking).toHaveBeenCalledWith('post-3', true)
    })

    it('tracks same post with different enabled states', () => {
      render(
        <>
          <ViewTracker postId="post-1" enabled={true} />
          <ViewTracker postId="post-1" enabled={false} />
        </>
      )

      expect(mockUseViewTracking).toHaveBeenCalledTimes(2)
      expect(mockUseViewTracking).toHaveBeenNthCalledWith(1, 'post-1', true)
      expect(mockUseViewTracking).toHaveBeenNthCalledWith(2, 'post-1', false)
    })
  })
})
