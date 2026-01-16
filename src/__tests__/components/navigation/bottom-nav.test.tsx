import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BottomNav } from '@/components/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}));

describe('BottomNav', () => {
  beforeEach(() => {
    // Reset scroll position
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 0,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders navigation with correct aria-label', () => {
      render(<BottomNav />);
      const nav = screen.getByRole('navigation', { name: /bottom navigation/i });
      expect(nav).toBeInTheDocument();
    });

    it('renders all navigation links', () => {
      render(<BottomNav />);
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });

    it('is visible initially at top of page', () => {
      render(<BottomNav />);
      const nav = screen.getByRole('navigation', { name: /bottom navigation/i });
      expect(nav).not.toHaveAttribute('aria-hidden', 'true');
      expect(nav.className).toContain('translate-y-0');
    });
  });

  describe('Scroll Behavior', () => {
    it('remains visible when scrolling down', async () => {
      render(<BottomNav />);
      const nav = screen.getByRole('navigation', { name: /bottom navigation/i });

      // Scroll down
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 200,
      });
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(nav).not.toHaveAttribute('aria-hidden', 'true');
        expect(nav.className).toContain('translate-y-0');
      });
    });

    it('hides when scrolling up past threshold', async () => {
      render(<BottomNav />);
      const nav = screen.getByRole('navigation', { name: /bottom navigation/i });

      // Scroll down first
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 300,
      });
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(nav.className).toContain('translate-y-0');
      });

      // Then scroll up
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 200,
      });
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(nav).toHaveAttribute('aria-hidden', 'true');
        expect(nav.className).toContain('translate-y-full');
      });
    });

    it('shows when at top of page regardless of scroll direction', async () => {
      render(<BottomNav />);
      const nav = screen.getByRole('navigation', { name: /bottom navigation/i });

      // Scroll down
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 300,
      });
      fireEvent.scroll(window);

      // Then scroll back to top
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 50,
      });
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(nav).not.toHaveAttribute('aria-hidden', 'true');
        expect(nav.className).toContain('translate-y-0');
      });
    });

    it('does not trigger on small scroll movements', async () => {
      render(<BottomNav />);
      const nav = screen.getByRole('navigation', { name: /bottom navigation/i });

      // Small scroll movement (below 100px threshold)
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 50,
      });
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(nav).not.toHaveAttribute('aria-hidden', 'true');
        expect(nav.className).toContain('translate-y-0');
      });
    });
  });

  describe('Styling', () => {
    it('has correct positioning classes', () => {
      render(<BottomNav />);
      const nav = screen.getByRole('navigation', { name: /bottom navigation/i });

      expect(nav.className).toContain('fixed');
      expect(nav.className).toContain('left-0');
      expect(nav.className).toContain('right-0');
      expect(nav.className).toContain('z-40');
      expect(nav.className).toContain('md:hidden');
    });

    it('has transition classes for smooth animation', () => {
      render(<BottomNav />);
      const nav = screen.getByRole('navigation', { name: /bottom navigation/i });

      expect(nav.className).toContain('transition-transform');
      expect(nav.className).toContain('duration-300');
      expect(nav.className).toContain('ease-in-out');
    });

    it('has backdrop blur effect', () => {
      render(<BottomNav />);
      const nav = screen.getByRole('navigation', { name: /bottom navigation/i });

      expect(nav.className).toContain('backdrop-blur');
      expect(nav.className).toContain('bg-background');
    });
  });

  describe('Accessibility', () => {
    it('sets aria-hidden when not visible', async () => {
      render(<BottomNav />);
      const nav = screen.getByRole('navigation', { name: /bottom navigation/i });

      // Scroll down then up to hide nav
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 300,
      });
      fireEvent.scroll(window);

      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 200,
      });
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(nav).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('removes aria-hidden when visible', async () => {
      render(<BottomNav />);
      const nav = screen.getByRole('navigation', { name: /bottom navigation/i });

      // Initially visible
      expect(nav).not.toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Event Listeners', () => {
    it('adds scroll event listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      render(<BottomNav />);

      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), {
        passive: true,
      });
    });

    it('removes scroll event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = render(<BottomNav />);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });
  });
});
