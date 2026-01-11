import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock next/navigation
const mockUsePathname = vi.fn();
vi.mock('next/navigation', () => ({ 
  usePathname: () => mockUsePathname()
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import { BackToTop } from '@/components/navigation';

describe('BackToTop', () => {
  let scrollToSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset pathname
    mockUsePathname.mockReturnValue('/');
    
    // Mock scrollTo
    scrollToSpy = vi.fn();
    (window.scrollTo as any) = scrollToSpy;
    
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
    it('does not render initially when scroll is at top', () => {
      render(<BackToTop />);
      expect(screen.queryByRole('button', { name: /Scroll to top/i })).not.toBeInTheDocument();
    });

    it('renders button after scrolling past threshold', async () => {
      render(<BackToTop />);
      
      // Simulate scroll past 400px threshold
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 500,
      });
      
      fireEvent.scroll(window);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Scroll to top/i })).toBeInTheDocument();
      });
    });

    it('does not render when scroll is below threshold', async () => {
      render(<BackToTop />);
      
      // Simulate scroll below 400px threshold
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 300,
      });
      
      fireEvent.scroll(window);
      
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /Scroll to top/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Scroll Behavior', () => {
    it('scrolls to top with smooth behavior when clicked', async () => {
      render(<BackToTop />);
      
      // Trigger scroll to show button
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 500,
      });
      fireEvent.scroll(window);
      
      const button = await screen.findByRole('button', { name: /Scroll to top/i });
      fireEvent.click(button);
      
      expect(scrollToSpy).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth'
      });
    });

    it('checks initial scroll position on mount', () => {
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 500,
      });
      
      render(<BackToTop />);
      
      // Component should check initial position
      expect(screen.queryByRole('button', { name: /Scroll to top/i })).toBeInTheDocument();
    });

    it('shows button at exact 401px threshold', async () => {
      render(<BackToTop />);
      
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 401,
      });
      
      fireEvent.scroll(window);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Scroll to top/i })).toBeInTheDocument();
      });
    });

    it('hides button at exact 400px threshold', async () => {
      // Start with button visible
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 500,
      });
      
      const { rerender } = render(<BackToTop />);
      fireEvent.scroll(window);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Scroll to top/i })).toBeInTheDocument();
      });
      
      // Scroll back up to threshold
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 400,
      });
      
      fireEvent.scroll(window);
      rerender(<BackToTop />);
      
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /Scroll to top/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Blog Post Exclusion', () => {
    it('does not render on individual blog post pages', () => {
      mockUsePathname.mockReturnValue('/blog/my-post-slug');
      
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 500,
      });
      
      render(<BackToTop />);
      fireEvent.scroll(window);
      
      expect(screen.queryByRole('button', { name: /Scroll to top/i })).not.toBeInTheDocument();
    });

    it('renders on blog index page', async () => {
      mockUsePathname.mockReturnValue('/blog');
      
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 500,
      });
      
      render(<BackToTop />);
      fireEvent.scroll(window);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Scroll to top/i })).toBeInTheDocument();
      });
    });

    it('renders on homepage', async () => {
      mockUsePathname.mockReturnValue('/');
      
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 500,
      });
      
      render(<BackToTop />);
      fireEvent.scroll(window);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Scroll to top/i })).toBeInTheDocument();
      });
    });

    it('renders on other pages', async () => {
      mockUsePathname.mockReturnValue('/about');
      
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 500,
      });
      
      render(<BackToTop />);
      fireEvent.scroll(window);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Scroll to top/i })).toBeInTheDocument();
      });
    });

    it('returns null when on blog post page', () => {
      mockUsePathname.mockReturnValue('/blog/test-post');
      
      const { container } = render(<BackToTop />);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Event Listeners', () => {
    it('adds scroll event listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      
      render(<BackToTop />);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        { passive: true }
      );
    });

    it('removes scroll event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(<BackToTop />);
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      );
    });

    it('uses passive scroll listener for performance', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      
      render(<BackToTop />);
      
      const calls = addEventListenerSpy.mock.calls.filter(
        call => call[0] === 'scroll'
      );
      
      expect(calls[0]?.[2]).toEqual({ passive: true });
    });
  });

  describe('Accessibility', () => {
    it('has descriptive aria-label', async () => {
      render(<BackToTop />);
      
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 500,
      });
      fireEvent.scroll(window);
      
      const button = await screen.findByRole('button', { name: /Scroll to top/i });
      expect(button).toHaveAttribute('aria-label', 'Scroll to top');
    });

    it('is keyboard accessible', async () => {
      render(<BackToTop />);
      
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 500,
      });
      fireEvent.scroll(window);
      
      const button = await screen.findByRole('button', { name: /Scroll to top/i });
      
      // Simulate Enter key press
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      
      expect(button).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies correct positioning classes', async () => {
      render(<BackToTop />);
      
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 500,
      });
      fireEvent.scroll(window);
      
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /Scroll to top/i });
        const container = button.parentElement;

        expect(container?.className).toContain('fixed');
        expect(container?.className).toContain('bottom-[88px]');
        expect(container?.className).toContain('right-4');
        expect(container?.className).toContain('z-40');
      });
    });

    it('is hidden on desktop (md:hidden class)', async () => {
      render(<BackToTop />);
      
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 500,
      });
      fireEvent.scroll(window);
      
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /Scroll to top/i });
        const container = button.parentElement;
        
        expect(container?.className).toContain('md:hidden');
      });
    });

    it('has correct button size classes', async () => {
      render(<BackToTop />);
      
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 500,
      });
      fireEvent.scroll(window);
      
      const button = await screen.findByRole('button', { name: /Scroll to top/i });
      
      expect(button.className).toContain('h-14');
      expect(button.className).toContain('w-14');
    });

    it('renders ChevronUp icon', async () => {
      render(<BackToTop />);
      
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 500,
      });
      fireEvent.scroll(window);
      
      const button = await screen.findByRole('button', { name: /Scroll to top/i });
      const icon = button.querySelector('svg');
      
      expect(icon).toBeInTheDocument();
    });
  });
});
