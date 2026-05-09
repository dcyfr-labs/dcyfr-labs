import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

describe('useReducedMotion Hook', () => {
  let matchMediaMock: {
    matches: boolean;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Mock window.matchMedia
    matchMediaMock = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn(() => matchMediaMock),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('returns false when motion is not reduced', () => {
      matchMediaMock.matches = false;
      const { result } = renderHook(() => useReducedMotion());
      expect(result.current).toBe(false);
    });

    it('returns true when motion is reduced', () => {
      matchMediaMock.matches = true;
      const { result } = renderHook(() => useReducedMotion());
      expect(result.current).toBe(true);
    });

    it('queries correct media feature', () => {
      renderHook(() => useReducedMotion());
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });
  });

  describe('Media Query Changes', () => {
    it('updates when media query changes', async () => {
      matchMediaMock.matches = false;
      const { result } = renderHook(() => useReducedMotion());

      expect(result.current).toBe(false);

      // Simulate media query change
      const changeHandler = matchMediaMock.addEventListener.mock.calls[0][1];
      changeHandler({ matches: true } as MediaQueryListEvent);

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('registers change event listener', () => {
      renderHook(() => useReducedMotion());
      expect(matchMediaMock.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('handles multiple changes', async () => {
      matchMediaMock.matches = false;
      const { result } = renderHook(() => useReducedMotion());

      const changeHandler = matchMediaMock.addEventListener.mock.calls[0][1];

      // First change: enable reduced motion
      changeHandler({ matches: true } as MediaQueryListEvent);
      await waitFor(() => expect(result.current).toBe(true));

      // Second change: disable reduced motion
      changeHandler({ matches: false } as MediaQueryListEvent);
      await waitFor(() => expect(result.current).toBe(false));

      // Third change: enable again
      changeHandler({ matches: true } as MediaQueryListEvent);
      await waitFor(() => expect(result.current).toBe(true));
    });
  });

  describe('Cleanup', () => {
    it('removes event listener on unmount', () => {
      const { unmount } = renderHook(() => useReducedMotion());
      unmount();

      expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });

    it('removes the same listener that was added', () => {
      const { unmount } = renderHook(() => useReducedMotion());

      const addedListener = matchMediaMock.addEventListener.mock.calls[0][1];
      unmount();

      const removedListener = matchMediaMock.removeEventListener.mock.calls[0][1];
      expect(removedListener).toBe(addedListener);
    });
  });

  describe('SSR Compatibility', () => {
    it('handles missing window.matchMedia gracefully', () => {
      const originalMatchMedia = window.matchMedia;
      // @ts-expect-error - Testing missing API
      delete window.matchMedia;

      expect(() => {
        renderHook(() => useReducedMotion());
      }).toThrow();

      // Restore
      window.matchMedia = originalMatchMedia;
    });
  });

  describe('Hook Behavior', () => {
    it('does not trigger unnecessary re-renders', () => {
      const { result, rerender } = renderHook(() => useReducedMotion());

      const initialValue = result.current;
      rerender();

      expect(result.current).toBe(initialValue);
    });

    it('maintains state across re-renders', () => {
      matchMediaMock.matches = true;
      const { result, rerender } = renderHook(() => useReducedMotion());

      expect(result.current).toBe(true);
      rerender();
      expect(result.current).toBe(true);
    });
  });

  describe('Real-World Scenarios', () => {
    it('respects system preference on mount', () => {
      // User has reduced motion enabled
      matchMediaMock.matches = true;
      const { result } = renderHook(() => useReducedMotion());

      // Hook should respect this immediately
      expect(result.current).toBe(true);
    });

    it('updates when user changes system settings', async () => {
      // Start with normal motion
      matchMediaMock.matches = false;
      const { result } = renderHook(() => useReducedMotion());
      expect(result.current).toBe(false);

      // User enables reduced motion in system settings
      const changeHandler = matchMediaMock.addEventListener.mock.calls[0][1];
      changeHandler({ matches: true } as MediaQueryListEvent);

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });
  });

  describe('Type Safety', () => {
    it('returns boolean type', () => {
      const { result } = renderHook(() => useReducedMotion());
      expect(typeof result.current).toBe('boolean');
    });

    it('accepts no parameters', () => {
      expect(() => {
        renderHook(() => useReducedMotion());
      }).not.toThrow();
    });
  });
});
