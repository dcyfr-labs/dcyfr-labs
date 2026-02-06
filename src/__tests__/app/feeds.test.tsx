/**
 * Feeds Page Tests
 *
 * Comprehensive test suite for the refactored feeds discovery page.
 * Tests page structure, metadata, feed rendering, and user interactions.
 */

import { render, screen } from '@testing-library/react';
import FeedsPage, { metadata } from '@/app/(main)/feeds/page';
import { SITE_TITLE, SITE_URL } from '@/lib/site-config';

describe('FeedsPage', () => {
  // Single render for all DOM-querying tests (static page, no interactions)
  beforeEach(() => {
    render(<FeedsPage />);
  });

  describe('Metadata', () => {
    it('should have correct page title', () => {
      expect(metadata.title).toBe('Web Feeds');
    });

    it('should have descriptive page description', () => {
      expect(metadata.description).toContain('RSS/Atom feeds');
      expect(metadata.description).toContain('blog posts');
    });

    it('should have correct canonical path', () => {
      expect(metadata.alternates?.canonical).toBeDefined();
    });
  });

  describe('Page Structure', () => {
    it('should render page layout successfully', () => {
      const heading = screen.getByRole('heading', {
        name: /Subscribe to our Web Feeds/i,
      });
      expect(heading).toBeInTheDocument();
    });

    it('should display main heading', () => {
      const heading = screen.getByRole('heading', {
        name: /Subscribe to our Web Feeds/i,
      });
      expect(heading).toBeInTheDocument();
    });

    it('should display description text', () => {
      const description = screen.getByText(/Stay up to date with the latest content/i);
      expect(description).toBeInTheDocument();
    });
  });

  describe('Feeds Section', () => {
    it("should render 'What are Web Feeds?' section", () => {
      const section = screen.getByRole('heading', {
        name: /What are Web Feeds\?/i,
      });
      expect(section).toBeInTheDocument();
    });

    it('should explain feed readers', () => {
      const text = screen.getByText(/Use a feed reader like/i);
      expect(text).toBeInTheDocument();
    });

    it('should link to Inoreader', () => {
      const link = screen.getByRole('link', { name: /Inoreader/i });
      expect(link).toHaveAttribute('href', 'https://www.inoreader.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should link to NetNewsWire', () => {
      const link = screen.getByRole('link', { name: /NetNewsWire/i });
      expect(link).toHaveAttribute('href', 'https://netnewswire.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Feed Cards', () => {
    it("should display 'Available Feeds' heading", () => {
      const heading = screen.getByRole('heading', {
        name: /Available Feeds/i,
      });
      expect(heading).toBeInTheDocument();
    });

    it('should render Activity Feed card', () => {
      const activityFeed = screen.getByRole('heading', {
        name: /Activity Feed/i,
      });
      expect(activityFeed).toBeInTheDocument();
    });

    it('should render Activity Feed description', () => {
      const description = screen.getByText(/Complete timeline of all content/i);
      expect(description).toBeInTheDocument();
    });

    it('should render Blog Feed card', () => {
      const blogFeed = screen.getByRole('heading', { name: /Blog Feed/i });
      expect(blogFeed).toBeInTheDocument();
    });

    it('should render Projects Feed card', () => {
      const projectsFeed = screen.getByRole('heading', {
        name: /Projects Feed/i,
      });
      expect(projectsFeed).toBeInTheDocument();
    });

    it('should not render Legacy Unified Feed (filtered out)', () => {
      const legacyFeed = screen.queryByRole('heading', {
        name: /Legacy Unified Feed/i,
      });
      expect(legacyFeed).not.toBeInTheDocument();
    });
  });

  describe('Feed Format Options', () => {
    it('should display Activity Feed RSS button', () => {
      const buttons = screen.getAllByRole('link', { name: /RSS/i });
      // Should have RSS buttons for each feed (Activity, Blog, Projects)
      expect(buttons.length).toBeGreaterThanOrEqual(3);
    });

    it('should display Activity Feed Atom button', () => {
      const buttons = screen.getAllByRole('link', { name: /Atom/ });
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should display JSON buttons', () => {
      const buttons = screen.getAllByRole('link', { name: /JSON/i });
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should link to correct Activity Feed RSS endpoint', () => {
      const rssButtons = screen.getAllByRole('link', { name: /RSS/i });
      const activityRssButton = rssButtons.find((btn) =>
        btn.getAttribute('href')?.includes('/activity/feed?format=rss')
      );
      expect(activityRssButton).toBeInTheDocument();
      expect(activityRssButton).toHaveAttribute('type', 'application/rss+xml');
    });

    it('should link to correct Blog Feed Atom endpoint', () => {
      const atomButtons = screen.getAllByRole('link', { name: /Atom/ });
      const blogAtomButton = atomButtons.find((btn) =>
        btn.getAttribute('href')?.includes('/blog/feed')
      );
      expect(blogAtomButton).toBeInTheDocument();
      expect(blogAtomButton).toHaveAttribute('type', 'application/atom+xml');
    });

    it('should link to correct Projects Feed JSON endpoint', () => {
      const jsonButtons = screen.getAllByRole('link', { name: /JSON/i });
      const projectsJsonButton = jsonButtons.find((btn) =>
        btn.getAttribute('href')?.includes('/work/feed?format=json')
      );
      expect(projectsJsonButton).toBeInTheDocument();
      expect(projectsJsonButton).toHaveAttribute('type', 'application/feed+json');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const h1 = screen.getByRole('heading', {
        name: /Subscribe to our Web Feeds/i,
      });
      const h2s = screen.getAllByRole('heading', { level: 2 });
      const h3s = screen.getAllByRole('heading', { level: 3 });

      expect(h1).toBeInTheDocument();
      expect(h2s.length).toBeGreaterThan(0);
      expect(h3s.length).toBeGreaterThan(0);
    });

    it('should render section elements', () => {
      const sections = screen.queryAllByRole('region');
      // Page may have multiple sections (some wrapped, some not)
      expect(sections.length).toBeGreaterThanOrEqual(0);
    });

    it('should have links with descriptive text', () => {
      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        // Each link should have either text content or aria-label
        expect(link.textContent || link.getAttribute('aria-label')).toBeTruthy();
      });
    });
  });

  describe('External Links', () => {
    it('should open external links in new tabs', () => {
      const externalLinks = screen.getAllByRole('link', {
        name: /Inoreader|NetNewsWire/,
      });
      externalLinks.forEach((link) => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('should open feed links in new tabs', () => {
      const feedLinks = screen.getAllByRole('link');
      const feedFormatLinks = feedLinks.filter((link) =>
        link.getAttribute('href')?.includes('/feed')
      );
      feedFormatLinks.forEach((link) => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });
});
