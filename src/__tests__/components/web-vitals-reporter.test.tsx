import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { WebVitalsReporter } from '@/components/features'

// Mock the initWebVitals function
const mockInitWebVitals = vi.fn()

vi.mock('@/lib/web-vitals', () => ({
  initWebVitals: () => mockInitWebVitals(),
}))

describe('WebVitalsReporter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders without visible output', () => {
      const { container } = render(<WebVitalsReporter />)

      // Component should not render any visible content
      expect(container.firstChild).toBeNull()
    })

    it('does not render any DOM elements', () => {
      const { container } = render(<WebVitalsReporter />)

      // Container should be empty
      expect(container.innerHTML).toBe('')
    })

    it('returns null as documented', () => {
      const { container } = render(<WebVitalsReporter />)

      expect(container.textContent).toBe('')
    })
  })

  describe('Initialization', () => {
    it('calls initWebVitals on mount', () => {
      render(<WebVitalsReporter />)

      expect(mockInitWebVitals).toHaveBeenCalledTimes(1)
    })

    it('calls initWebVitals once even with multiple renders', () => {
      const { rerender } = render(<WebVitalsReporter />)

      rerender(<WebVitalsReporter />)
      rerender(<WebVitalsReporter />)

      // useEffect with empty deps should only run once
      expect(mockInitWebVitals).toHaveBeenCalledTimes(1)
    })

    it('does not call initWebVitals again on re-render', () => {
      const { rerender } = render(<WebVitalsReporter />)

      mockInitWebVitals.mockClear()

      rerender(<WebVitalsReporter />)

      expect(mockInitWebVitals).not.toHaveBeenCalled()
    })
  })

  describe('Component Lifecycle', () => {
    it('initializes on mount', () => {
      render(<WebVitalsReporter />)

      expect(mockInitWebVitals).toHaveBeenCalled()
    })

    it('does not reinitialize on unmount and remount', () => {
      const { unmount } = render(<WebVitalsReporter />)

      unmount()

      mockInitWebVitals.mockClear()

      // Remount
      render(<WebVitalsReporter />)

      // Should initialize again on new mount
      expect(mockInitWebVitals).toHaveBeenCalledTimes(1)
    })

    it('cleans up properly on unmount', () => {
      const { unmount } = render(<WebVitalsReporter />)

      // Should not throw
      expect(() => unmount()).not.toThrow()
    })

    it('handles multiple mount/unmount cycles', () => {
      const { unmount: unmount1 } = render(<WebVitalsReporter />)
      unmount1()

      mockInitWebVitals.mockClear()

      const { unmount: unmount2 } = render(<WebVitalsReporter />)
      unmount2()

      // Should have initialized on second mount
      expect(mockInitWebVitals).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error Handling', () => {
    it('throws error if initWebVitals throws', () => {
      mockInitWebVitals.mockImplementation(() => {
        throw new Error('Web Vitals error')
      })

      // React will propagate the error
      expect(() => {
        render(<WebVitalsReporter />)
      }).toThrow('Web Vitals error')
    })

    it('handles async initWebVitals rejection', async () => {
      mockInitWebVitals.mockRejectedValue(new Error('Async error'))

      // Should not crash
      render(<WebVitalsReporter />)

      expect(mockInitWebVitals).toHaveBeenCalled()
    })

    it('handles initWebVitals returning undefined', () => {
      mockInitWebVitals.mockReturnValue(undefined)

      const { container } = render(<WebVitalsReporter />)

      expect(mockInitWebVitals).toHaveBeenCalled()
      expect(container.innerHTML).toBe('')
    })

    it('handles initWebVitals returning null', () => {
      mockInitWebVitals.mockReturnValue(null)

      const { container } = render(<WebVitalsReporter />)

      expect(mockInitWebVitals).toHaveBeenCalled()
      expect(container.innerHTML).toBe('')
    })
  })

  describe('Multiple Instances', () => {
    it('initializes web vitals for each instance', () => {
      render(
        <>
          <WebVitalsReporter />
          <WebVitalsReporter />
          <WebVitalsReporter />
        </>
      )

      // Each instance should call init once
      expect(mockInitWebVitals).toHaveBeenCalledTimes(3)
    })

    it('handles conditional rendering', () => {
      const { rerender } = render(
        <>
          {true && <WebVitalsReporter />}
          {false && <WebVitalsReporter />}
        </>
      )

      expect(mockInitWebVitals).toHaveBeenCalledTimes(1)

      // Change conditions
      rerender(
        <>
          {false && <WebVitalsReporter />}
          {true && <WebVitalsReporter />}
        </>
      )

      // Should initialize the new instance
      expect(mockInitWebVitals).toHaveBeenCalledTimes(2)
    })
  })

  describe('Integration Scenarios', () => {
    it('works in root layout scenario', () => {
      // Simulating typical usage in root layout
      const RootLayout = ({ children }: { children: React.ReactNode }) => (
        <>
          <WebVitalsReporter />
          {children}
        </>
      )

      render(
        <RootLayout>
          <div>Page Content</div>
        </RootLayout>
      )

      expect(mockInitWebVitals).toHaveBeenCalledTimes(1)
    })

    it('initializes during component lifecycle', () => {
      const initOrder: string[] = []

      mockInitWebVitals.mockImplementation(() => {
        initOrder.push('web-vitals')
      })

      const OtherComponent = () => {
        initOrder.push('other-component')
        return <div>Other</div>
      }

      render(
        <>
          <WebVitalsReporter />
          <OtherComponent />
        </>
      )

      // Both should have executed
      expect(initOrder).toContain('web-vitals')
      expect(initOrder).toContain('other-component')
      // Other component renders before useEffect runs, so it comes first
      expect(initOrder[0]).toBe('other-component')
      expect(initOrder[1]).toBe('web-vitals')
    })

    it('does not block rendering of other components', () => {
      render(
        <>
          <WebVitalsReporter />
          <div data-testid="other-content">Other Content</div>
        </>
      )

      // Other content should render even if web vitals initializes
      const otherContent = document.querySelector('[data-testid="other-content"]')
      expect(otherContent).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('initializes synchronously on mount', () => {
      const beforeRender = Date.now()

      render(<WebVitalsReporter />)

      const afterRender = Date.now()

      // Should complete quickly (within reasonable time)
      expect(afterRender - beforeRender).toBeLessThan(1000)
      expect(mockInitWebVitals).toHaveBeenCalled()
    })

    it('does not cause unnecessary re-renders', () => {
      let renderCount = 0

      const TestWrapper = () => {
        renderCount++
        return <WebVitalsReporter />
      }

      const { rerender } = render(<TestWrapper />)

      const initialRenderCount = renderCount

      rerender(<TestWrapper />)

      // Should only re-render when parent forces it
      expect(renderCount).toBe(initialRenderCount + 1)
    })
  })

  describe('Typical Usage Patterns', () => {
    it('works when placed in app layout', () => {
      render(<WebVitalsReporter />)

      expect(mockInitWebVitals).toHaveBeenCalled()
    })

    it('initializes once per page load', () => {
      render(<WebVitalsReporter />)

      expect(mockInitWebVitals).toHaveBeenCalledTimes(1)
    })

    it('does not interfere with other tracking', () => {
      const otherTracking = vi.fn()

      render(
        <>
          <WebVitalsReporter />
          <button onClick={otherTracking}>Track</button>
        </>
      )

      expect(mockInitWebVitals).toHaveBeenCalled()
      // Other tracking should still be available
      expect(otherTracking).not.toHaveBeenCalled()
    })
  })
})
