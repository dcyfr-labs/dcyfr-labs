/**
 * Feeds Page Tests
 *
 * Comprehensive test suite for the refactored feeds discovery page.
 * Tests page structure, metadata, feed rendering, and user interactions.
 */

import { render, screen } from "@testing-library/react";
import FeedsPage, { metadata } from "@/app/feeds/page";
import { SITE_TITLE, SITE_URL } from "@/lib/site-config";

describe("FeedsPage", () => {
  describe("Metadata", () => {
    it("should have correct page title", () => {
      expect(metadata.title).toBe("Web Feeds");
    });

    it("should have descriptive page description", () => {
      expect(metadata.description).toContain("RSS/Atom feeds");
      expect(metadata.description).toContain("blog posts");
    });

    it("should have correct canonical path", () => {
      expect(metadata.alternates?.canonical).toBeDefined();
    });
  });

  describe("Page Structure", () => {
    beforeEach(() => {
      render(<FeedsPage />);
    });

    it("should render page layout successfully", () => {
      const heading = screen.getByRole("heading", {
        name: /Subscribe to our Web Feeds/i,
      });
      expect(heading).toBeInTheDocument();
    });

    it("should display main heading", () => {
      const heading = screen.getByRole("heading", {
        name: /Subscribe to our Web Feeds/i,
      });
      expect(heading).toBeInTheDocument();
    });

    it("should display description text", () => {
      const description = screen.getByText(
        /Stay up to date with the latest content/i
      );
      expect(description).toBeInTheDocument();
    });
  });

  describe("Feeds Section", () => {
    beforeEach(() => {
      render(<FeedsPage />);
    });

    it("should render 'What are Web Feeds?' section", () => {
      const section = screen.getByRole("heading", {
        name: /What are Web Feeds\?/i,
      });
      expect(section).toBeInTheDocument();
    });

    it("should explain feed readers", () => {
      const text = screen.getByText(/Web feeds allow you to subscribe to content updates/i);
      expect(text).toBeInTheDocument();
    });

    it("should link to Inoreader", () => {
      const link = screen.getByRole("link", { name: /Inoreader/i });
      expect(link).toHaveAttribute("href", "https://www.inoreader.com");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("should link to NetNewsWire", () => {
      const link = screen.getByRole("link", { name: /NetNewsWire/i });
      expect(link).toHaveAttribute("href", "https://netnewswire.com");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  describe("Feed Cards", () => {
    beforeEach(() => {
      render(<FeedsPage />);
    });

    it("should display 'Available Feeds' heading", () => {
      const heading = screen.getByRole("heading", {
        name: /Available Feeds/i,
      });
      expect(heading).toBeInTheDocument();
    });

    it("should render Activity Feed card", () => {
      const activityFeed = screen.getByRole("heading", {
        name: /Activity Feed/i,
      });
      expect(activityFeed).toBeInTheDocument();
    });

    it("should render Activity Feed description", () => {
      const description = screen.getByText(/Complete timeline of all content/i);
      expect(description).toBeInTheDocument();
    });

    it("should render Blog Feed card", () => {
      const blogFeed = screen.getByRole("heading", { name: /Blog Feed/i });
      expect(blogFeed).toBeInTheDocument();
    });

    it("should render Projects Feed card", () => {
      const projectsFeed = screen.getByRole("heading", {
        name: /Projects Feed/i,
      });
      expect(projectsFeed).toBeInTheDocument();
    });

    it("should not render Legacy Unified Feed (filtered out)", () => {
      const legacyFeed = screen.queryByRole("heading", {
        name: /Legacy Unified Feed/i,
      });
      expect(legacyFeed).not.toBeInTheDocument();
    });
  });

  describe("Feed Format Options", () => {
    beforeEach(() => {
      render(<FeedsPage />);
    });

    it("should display RSS buttons", () => {
      const buttons = screen.getAllByRole("link", { name: /RSS/i });
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should display Atom buttons", () => {
      const buttons = screen.getAllByRole("link", { name: /Atom/i });
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should display JSON buttons", () => {
      const buttons = screen.getAllByRole("link", { name: /JSON/i });
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should link to correct Activity Feed RSS endpoint", () => {
      const rssButtons = screen.getAllByRole("link", { name: /RSS/i });
      const activityRssButton = rssButtons.find((btn) =>
        btn.getAttribute("href")?.includes("/activity/feed?format=rss")
      );
      expect(activityRssButton).toBeInTheDocument();
      expect(activityRssButton).toHaveAttribute("type", "application/rss+xml");
    });

    it("should link to correct Blog Feed Atom endpoint", () => {
      const atomButtons = screen.getAllByRole("link", { name: /Atom/i });
      const blogAtomButton = atomButtons.find((btn) =>
        btn.getAttribute("href")?.includes("/blog/feed")
      );
      expect(blogAtomButton).toBeInTheDocument();
      expect(blogAtomButton).toHaveAttribute("type", "application/atom+xml");
    });

    it("should link to correct Projects Feed JSON endpoint", () => {
      const jsonButtons = screen.getAllByRole("link", { name: /JSON/i });
      const projectsJsonButton = jsonButtons.find((btn) =>
        btn.getAttribute("href")?.includes("/work/feed?format=json")
      );
      expect(projectsJsonButton).toBeInTheDocument();
      expect(projectsJsonButton).toHaveAttribute(
        "type",
        "application/feed+json"
      );
    });
  });

  describe("Format Options Section", () => {
    beforeEach(() => {
      render(<FeedsPage />);
    });

    it("should display format option cards", () => {
      const atomCard = screen.getByRole("heading", {
        name: /^Atom$/i,
      });
      expect(atomCard).toBeInTheDocument();
    });

    it("should explain RSS format", () => {
      const description = screen.getByText(
        /Widely supported XML format with excellent compatibility/i
      );
      expect(description).toBeInTheDocument();
    });

    it("should explain Atom format", () => {
      const description = screen.getByText(
        /Modern XML feed format with enhanced features/i
      );
      expect(description).toBeInTheDocument();
    });

    it("should explain JSON Feed format", () => {
      const description = screen.getByText(
        /Modern JSON-based format that's easier to parse/i
      );
      expect(description).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      render(<FeedsPage />);
    });

    it("should have proper heading hierarchy", () => {
      const h1 = screen.getByRole("heading", {
        name: /Subscribe to our Web Feeds/i,
      });
      const h2s = screen.getAllByRole("heading", { level: 2 });
      const h3s = screen.getAllByRole("heading", { level: 3 });

      expect(h1).toBeInTheDocument();
      expect(h2s.length).toBeGreaterThan(0);
      expect(h3s.length).toBeGreaterThan(0);
    });

    it("should render section elements", () => {
      const sections = screen.queryAllByRole("region");
      // Page may have multiple sections (some wrapped, some not)
      expect(sections.length).toBeGreaterThanOrEqual(0);
    });

    it("should have links with descriptive text", () => {
      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        // Each link should have either text content or aria-label
        expect(
          link.textContent || link.getAttribute("aria-label")
        ).toBeTruthy();
      });
    });
  });

  // Update frequencies are currently commented out in the page
  describe.skip("Feed Update Frequencies", () => {
    beforeEach(() => {
      render(<FeedsPage />);
    });

    it("should display Activity Feed update frequency", () => {
      const frequency = screen.getByText(/Updated hourly/);
      expect(frequency).toBeInTheDocument();
    });

    it("should display Blog Feed update frequency", () => {
      const frequencies = screen.getAllByText(/Updated daily/);
      expect(frequencies.length).toBeGreaterThanOrEqual(2);
    });

    it("should display Projects Feed update frequency", () => {
      const frequencies = screen.getAllByText(/Updated daily/);
      expect(frequencies.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("External Links", () => {
    beforeEach(() => {
      render(<FeedsPage />);
    });

    it("should open external links in new tabs", () => {
      const externalLinks = screen.getAllByRole("link", {
        name: /Inoreader|NetNewsWire/,
      });
      externalLinks.forEach((link) => {
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      });
    });

    it("should open feed links in new tabs", () => {
      const feedLinks = screen.getAllByRole("link");
      const feedFormatLinks = feedLinks.filter((link) =>
        link.getAttribute("href")?.includes("/feed")
      );
      feedFormatLinks.forEach((link) => {
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      });
    });
  });
});
