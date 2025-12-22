import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/navigation
const mockUsePathname = vi.fn();
vi.mock('next/navigation', () => ({ 
  usePathname: () => mockUsePathname()
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, onClick, ...props }: any) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

import { SiteHeader } from '@/components/navigation/site-header';

describe('SiteHeader', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
  });

  describe('Basic Rendering', () => {
    it('renders the site header with logo', () => {
      render(<SiteHeader />);
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('site-header');
    });

    it('renders logo link to homepage', () => {
      render(<SiteHeader />);
      const logoLink = screen.getByRole('link', { name: /DCYFR Labs/i });
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('renders About link in desktop nav', () => {
      render(<SiteHeader />);
      const aboutLink = screen.getByRole('link', { name: /About/i });
      expect(aboutLink).toBeInTheDocument();
      expect(aboutLink).toHaveAttribute('href', '/about');
    });

    it('renders Sponsors link in desktop nav', () => {
      render(<SiteHeader />);
      const sponsorsLink = screen.getByRole('link', { name: /Sponsors/i });
      expect(sponsorsLink).toBeInTheDocument();
      expect(sponsorsLink).toHaveAttribute('href', '/sponsors');
    });

    it('renders theme toggle button', () => {
      render(<SiteHeader />);
      const themeToggles = screen.getAllByRole('button', { name: /switch to|toggle theme/i });
      expect(themeToggles.length).toBeGreaterThan(0);
    });
  });

  describe('Desktop Navigation', () => {
    it('renders desktop navigation with aria-label', () => {
      render(<SiteHeader />);
      const nav = screen.getByRole('navigation', { name: /Main navigation/i });
      expect(nav).toBeInTheDocument();
    });

    it('hides desktop navigation on mobile (has hidden md:flex classes)', () => {
      render(<SiteHeader />);
      const nav = screen.getByRole('navigation', { name: /Main navigation/i });
      expect(nav.className).toContain('hidden md:flex');
    });
  });

  describe('Blog Dropdown', () => {
    it('renders Blog dropdown button', () => {
      render(<SiteHeader />);
      const blogButton = screen.getByRole('button', { name: /Blog/i });
      expect(blogButton).toBeInTheDocument();
      expect(blogButton).toHaveAttribute('aria-haspopup', 'menu');
      expect(blogButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('opens Blog dropdown when clicked', async () => {
      render(<SiteHeader />);
      const blogButton = screen.getByRole('button', { name: /Blog/i });
      
      fireEvent.click(blogButton);
      
      await waitFor(() => {
        expect(blogButton).toHaveAttribute('aria-expanded', 'true');
      });
      
      expect(screen.getByRole('link', { name: /All Posts/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Series/i })).toBeInTheDocument();
    });

    it('closes Blog dropdown when clicking a link', async () => {
      render(<SiteHeader />);
      const blogButton = screen.getByRole('button', { name: /Blog/i });
      
      fireEvent.click(blogButton);
      
      const allPostsLink = await screen.findByRole('link', { name: /All Posts/i });
      fireEvent.click(allPostsLink);
      
      await waitFor(() => {
        expect(blogButton).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('closes Blog dropdown when clicking outside', async () => {
      render(<SiteHeader />);
      const blogButton = screen.getByRole('button', { name: /Blog/i });

      fireEvent.click(blogButton);
      expect(blogButton).toHaveAttribute('aria-expanded', 'true');

      // Wait for event listener to be registered (useDropdown uses setTimeout)
      await waitFor(() => {}, { timeout: 10 });

      // Click outside the dropdown
      fireEvent.click(document.body);

      await waitFor(() => {
        expect(blogButton).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('displays chevron icon that rotates when dropdown opens', () => {
      render(<SiteHeader />);
      const blogButton = screen.getByRole('button', { name: /Blog/i });
      const chevron = blogButton.querySelector('svg');
      
      expect(chevron).toBeInTheDocument();
      expect(chevron?.className).not.toContain('rotate-180');
      
      fireEvent.click(blogButton);
      
      expect(chevron?.className).toContain('rotate-180');
    });
  });

  describe('Our Work Dropdown', () => {
    it('renders Our Work dropdown button', () => {
      render(<SiteHeader />);
      const workButton = screen.getByRole('button', { name: /Our Work/i });
      expect(workButton).toBeInTheDocument();
      expect(workButton).toHaveAttribute('aria-haspopup', 'menu');
      expect(workButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('opens Our Work dropdown when clicked', async () => {
      render(<SiteHeader />);
      const workButton = screen.getByRole('button', { name: /Our Work/i });
      
      fireEvent.click(workButton);
      
      await waitFor(() => {
        expect(workButton).toHaveAttribute('aria-expanded', 'true');
      });
      
      expect(screen.getByRole('link', { name: /All Projects/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Community/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Nonprofit/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Startup/i })).toBeInTheDocument();
    });

    it('closes Our Work dropdown when clicking a link', async () => {
      render(<SiteHeader />);
      const workButton = screen.getByRole('button', { name: /Our Work/i });
      
      fireEvent.click(workButton);
      
      const allProjectsLink = await screen.findByRole('link', { name: /All Projects/i });
      fireEvent.click(allProjectsLink);
      
      await waitFor(() => {
        expect(workButton).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('closes Our Work dropdown when clicking outside', async () => {
      render(<SiteHeader />);
      const workButton = screen.getByRole('button', { name: /Our Work/i });

      fireEvent.click(workButton);
      expect(workButton).toHaveAttribute('aria-expanded', 'true');

      // Wait for event listener to be registered (useDropdown uses setTimeout)
      await waitFor(() => {}, { timeout: 10 });

      // Click outside the dropdown
      fireEvent.click(document.body);

      await waitFor(() => {
        expect(workButton).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('displays correct links in Our Work dropdown', async () => {
      render(<SiteHeader />);
      const workButton = screen.getByRole('button', { name: /Our Work/i });
      
      fireEvent.click(workButton);
      
      const communityLink = await screen.findByRole('link', { name: /Community/i });
      const nonprofitLink = screen.getByRole('link', { name: /Nonprofit/i });
      const startupLink = screen.getByRole('link', { name: /Startup/i });
      
      expect(communityLink).toHaveAttribute('href', '/work?category=community');
      expect(nonprofitLink).toHaveAttribute('href', '/work?category=nonprofit');
      expect(startupLink).toHaveAttribute('href', '/work?category=startup');
    });
  });

  describe('Logo Click Behavior', () => {
    it('scrolls to top when clicking logo on homepage', () => {
      mockUsePathname.mockReturnValue('/');
      const scrollToSpy = vi.fn();
      window.scrollTo = scrollToSpy;
      
      render(<SiteHeader />);
      const logoLink = screen.getByRole('link', { name: /DCYFR Labs/i });
      
      fireEvent.click(logoLink);
      
      expect(scrollToSpy).toHaveBeenCalledWith({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    });

    it('navigates normally when clicking logo on other pages', () => {
      mockUsePathname.mockReturnValue('/blog');
      const scrollToSpy = vi.fn();
      window.scrollTo = scrollToSpy;
      
      render(<SiteHeader />);
      const logoLink = screen.getByRole('link', { name: /DCYFR Labs/i });
      
      fireEvent.click(logoLink);
      
      // Should not scroll when not on homepage
      expect(scrollToSpy).not.toHaveBeenCalled();
    });
  });

  describe('Mobile Navigation', () => {
    it('renders mobile navigation container', () => {
      render(<SiteHeader />);
      const header = screen.getByRole('banner');
      const mobileNavContainer = header.querySelector('.flex.md\\:hidden');
      expect(mobileNavContainer).toBeInTheDocument();
    });

    it('shows theme toggle in mobile nav', () => {
      render(<SiteHeader />);
      const themeToggles = screen.getAllByRole('button', { name: /switch to|toggle theme/i });
      expect(themeToggles.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for navigation', () => {
      render(<SiteHeader />);
      expect(screen.getByRole('navigation', { name: /Main navigation/i })).toBeInTheDocument();
    });

    it('has proper ARIA attributes for dropdowns', () => {
      render(<SiteHeader />);
      
      const blogButton = screen.getByRole('button', { name: /Blog/i });
      expect(blogButton).toHaveAttribute('aria-haspopup', 'menu');
      expect(blogButton).toHaveAttribute('aria-expanded');
      
      const workButton = screen.getByRole('button', { name: /Our Work/i });
      expect(workButton).toHaveAttribute('aria-haspopup', 'menu');
      expect(workButton).toHaveAttribute('aria-expanded');
    });

    it('updates aria-expanded when dropdowns open/close', async () => {
      render(<SiteHeader />);
      const blogButton = screen.getByRole('button', { name: /Blog/i });
      
      expect(blogButton).toHaveAttribute('aria-expanded', 'false');
      
      fireEvent.click(blogButton);
      await waitFor(() => {
        expect(blogButton).toHaveAttribute('aria-expanded', 'true');
      });
      
      fireEvent.click(blogButton);
      await waitFor(() => {
        expect(blogButton).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });

  describe('Styling and Layout', () => {
    it('applies sticky positioning to header', () => {
      render(<SiteHeader />);
      const header = screen.getByRole('banner');
      expect(header.className).toContain('sticky');
      expect(header.className).toContain('top-0');
    });

    it('applies backdrop blur effect', () => {
      render(<SiteHeader />);
      const header = screen.getByRole('banner');
      expect(header.className).toContain('backdrop-blur');
    });

    it('has correct z-index for stacking', () => {
      render(<SiteHeader />);
      const header = screen.getByRole('banner');
      expect(header.className).toContain('z-40');
    });
  });
});
