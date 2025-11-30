import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'

describe('useScrollAnimation Hook', () => {
  let observerMock: {
    observe: ReturnType<typeof vi.fn>
    unobserve: ReturnType<typeof vi.fn>
    disconnect: ReturnType<typeof vi.fn>
  }
  let observerCallback: ((entries: any[]) => void) | null = null

  // Helper to trigger the callback with entries
  function triggerIntersection(entries: any[]) {
    if (observerCallback) {
      const callback = observerCallback
      act(() => {
        callback(entries)
      })
    }
  }

  // Helper function that sets ref synchronously during render
  function setupHookWithRef(options?: Parameters<typeof useScrollAnimation>[0]) {
    const element = document.createElement('div')
    const result = renderHook(() => {
      const hookResult = useScrollAnimation(options)
      // Set ref synchronously during render (before useEffect runs)
      if (!hookResult.ref.current) {
        hookResult.ref.current = element
      }
      return hookResult
    })
    
    return { result: result.result, element }
  }

  beforeEach(() => {
    observerCallback = null

    // Mock IntersectionObserver
    observerMock = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }

    global.IntersectionObserver = vi.fn(function(callback) {
      // Store callback for manual triggering
      observerCallback = callback
      return observerMock
    }) as any
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('returns ref object', () => {
      const { result } = renderHook(() => useScrollAnimation())
      expect(result.current.ref).toBeDefined()
      expect(result.current.ref.current).toBeNull()
    })

    it('starts with isVisible false when ref is attached', () => {
      // With a ref attached, initial state is false (waiting for intersection)
      const element = document.createElement('div')
      const { result } = renderHook(() => {
        const hookResult = useScrollAnimation()
        if (!hookResult.ref.current) {
          hookResult.ref.current = element
        }
        return hookResult
      })
      expect(result.current.isVisible).toBe(false)
    })

    it('starts with hasAnimated false', () => {
      const { result } = renderHook(() => useScrollAnimation())
      expect(result.current.hasAnimated).toBe(false)
    })

    it('starts with shouldAnimate false when ref is attached', () => {
      // With a ref attached, initial state is false (waiting for intersection)
      const element = document.createElement('div')
      const { result } = renderHook(() => {
        const hookResult = useScrollAnimation()
        if (!hookResult.ref.current) {
          hookResult.ref.current = element
        }
        return hookResult
      })
      expect(result.current.shouldAnimate).toBe(false)
    })
  })

  describe('IntersectionObserver Setup', () => {
    it('creates IntersectionObserver with default options when element is present', () => {
      renderHook(() => {
        const hookResult = useScrollAnimation()
        // Simulate ref being attached during render
        if (!hookResult.ref.current) {
          hookResult.ref.current = document.createElement('div')
        }
        return hookResult
      })
      
      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        {
          threshold: 0.1,
          rootMargin: '0px',
        }
      )
    })

    it('creates IntersectionObserver with custom threshold', () => {
      renderHook(() => {
        const hookResult = useScrollAnimation({ threshold: 0.5 })
        if (!hookResult.ref.current) {
          hookResult.ref.current = document.createElement('div')
        }
        return hookResult
      })
      
      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        {
          threshold: 0.5,
          rootMargin: '0px',
        }
      )
    })

    it('creates IntersectionObserver with custom rootMargin', () => {
      renderHook(() => {
        const hookResult = useScrollAnimation({ rootMargin: '50px' })
        if (!hookResult.ref.current) {
          hookResult.ref.current = document.createElement('div')
        }
        return hookResult
      })
      
      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        {
          threshold: 0.1,
          rootMargin: '50px',
        }
      )
    })

    it('observes element when present', () => {
      const element = document.createElement('div')
      renderHook(() => {
        const hookResult = useScrollAnimation()
        if (!hookResult.ref.current) {
          hookResult.ref.current = element
        }
        return hookResult
      })
      
      expect(observerMock.observe).toHaveBeenCalledWith(element)
    })
  })

  describe('Visibility Detection', () => {
    it('updates isVisible when element enters viewport', async () => {
      const element = document.createElement('div')
      const { result } = renderHook(() => {
        const hookResult = useScrollAnimation()
        // Set ref synchronously during render (before useEffect runs)
        if (!hookResult.ref.current) {
          hookResult.ref.current = element
        }
        return hookResult
      })

      // Manually verify observer was created and callback stored
      expect(observerCallback).not.toBeNull()
      expect(observerMock.observe).toHaveBeenCalledWith(element)

      // Trigger intersection
      triggerIntersection([{ isIntersecting: true, target: element }])

      expect(result.current.isVisible).toBe(true)
    })

    it('updates isVisible when element leaves viewport', async () => {
      const element = document.createElement('div')
      const { result } = renderHook(() => {
        const hookResult = useScrollAnimation({ triggerOnce: false })
        if (!hookResult.ref.current) {
          hookResult.ref.current = element
        }
        return hookResult
      })

      expect(observerCallback).not.toBeNull()

      // Enter viewport
      triggerIntersection([{ isIntersecting: true, target: element }])
      expect(result.current.isVisible).toBe(true)

      // Leave viewport
      triggerIntersection([{ isIntersecting: false, target: element }])
      expect(result.current.isVisible).toBe(false)
    })
  })

  describe('Trigger Once Behavior', () => {
    it('sets hasAnimated when element becomes visible with triggerOnce=true', async () => {
      const { result, element } = setupHookWithRef({ triggerOnce: true })

      triggerIntersection([{ isIntersecting: true, target: element }])

      expect(result.current.hasAnimated).toBe(true)
    })

    it('does not reset hasAnimated when leaving viewport with triggerOnce=true', async () => {
      const { result, element } = setupHookWithRef({ triggerOnce: true })

      // Enter viewport
      triggerIntersection([{ isIntersecting: true, target: element }])
      expect(result.current.hasAnimated).toBe(true)

      // Leave viewport
      triggerIntersection([{ isIntersecting: false, target: element }])
      expect(result.current.hasAnimated).toBe(true)
    })

    it('allows repeating animations with triggerOnce=false', async () => {
      const { result, element } = setupHookWithRef({ triggerOnce: false })

      // First intersection
      triggerIntersection([{ isIntersecting: true, target: element }])
      expect(result.current.isVisible).toBe(true)

      // Leave viewport
      triggerIntersection([{ isIntersecting: false, target: element }])
      expect(result.current.isVisible).toBe(false)

      // Second intersection - should trigger again
      triggerIntersection([{ isIntersecting: true, target: element }])
      expect(result.current.isVisible).toBe(true)
    })
    
    it('disconnects observer after first trigger with triggerOnce=true', async () => {
      const { result, element } = setupHookWithRef({ triggerOnce: true })

      triggerIntersection([{ isIntersecting: true, target: element }])

      expect(observerMock.disconnect).toHaveBeenCalled()
    })
  })

  describe('shouldAnimate Behavior', () => {
    it('shouldAnimate equals isVisible (CSS handles reduced motion)', async () => {
      const { result, element } = setupHookWithRef()

      // Not visible yet
      expect(result.current.shouldAnimate).toBe(false)
      expect(result.current.isVisible).toBe(false)

      // Trigger intersection
      triggerIntersection([{ isIntersecting: true, target: element }])

      // Now both should be true
      expect(result.current.shouldAnimate).toBe(true)
      expect(result.current.isVisible).toBe(true)
    })
  })

  describe('Fallback Behavior', () => {
    it('shows element immediately if IntersectionObserver is unavailable', () => {
      // Remove IntersectionObserver
      const originalIO = global.IntersectionObserver
      // @ts-expect-error - intentionally setting to undefined
      global.IntersectionObserver = undefined

      const { result } = renderHook(() => {
        const hookResult = useScrollAnimation()
        if (!hookResult.ref.current) {
          hookResult.ref.current = document.createElement('div')
        }
        return hookResult
      })

      expect(result.current.isVisible).toBe(true)
      expect(result.current.shouldAnimate).toBe(true)

      // Restore
      global.IntersectionObserver = originalIO
    })
  })

  describe('Cleanup', () => {
    it('disconnects observer on unmount', () => {
      const element = document.createElement('div')
      const { unmount } = renderHook(() => {
        const hookResult = useScrollAnimation()
        if (!hookResult.ref.current) {
          hookResult.ref.current = element
        }
        return hookResult
      })
      
      unmount()
      
      expect(observerMock.disconnect).toHaveBeenCalled()
    })
  })

  describe('Options Validation', () => {
    it('handles threshold of 0', () => {
      renderHook(() => {
        const hookResult = useScrollAnimation({ threshold: 0 })
        if (!hookResult.ref.current) {
          hookResult.ref.current = document.createElement('div')
        }
        return hookResult
      })
      
      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ threshold: 0 })
      )
    })

    it('handles threshold of 1', () => {
      renderHook(() => {
        const hookResult = useScrollAnimation({ threshold: 1 })
        if (!hookResult.ref.current) {
          hookResult.ref.current = document.createElement('div')
        }
        return hookResult
      })
      
      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ threshold: 1 })
      )
    })
  })

  describe('Return Values', () => {
    it('returns all expected properties', () => {
      const { result } = renderHook(() => useScrollAnimation())
      
      expect(result.current).toHaveProperty('ref')
      expect(result.current).toHaveProperty('isVisible')
      expect(result.current).toHaveProperty('hasAnimated')
      expect(result.current).toHaveProperty('shouldAnimate')
    })

    it('returns stable ref across renders', () => {
      const { result, rerender } = renderHook(() => useScrollAnimation())
      
      const firstRef = result.current.ref
      rerender()
      const secondRef = result.current.ref
      
      expect(firstRef).toBe(secondRef)
    })
  })
})
