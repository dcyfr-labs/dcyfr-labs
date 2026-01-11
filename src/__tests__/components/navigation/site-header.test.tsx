import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/navigation
const mockUsePathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, onClick, ...props }: any) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ alt, src, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} {...props} />
  ),
}));

import { SiteHeader } from "@/components/navigation";
import { SearchProvider } from "@/components/search";

// Helper to render with SearchProvider
const renderWithProviders = (component: React.ReactElement) => {
  return render(<SearchProvider>{component}</SearchProvider>);
};

describe("SiteHeader", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");

    // Mock matchMedia for desktop viewport (md breakpoint = 768px)
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("min-width"), // Match all min-width queries (desktop)
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  describe("Basic Rendering", () => {
    it("renders the site header with logo", () => {
      renderWithProviders(<SiteHeader />);
      const header = screen.getByRole("banner");
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass("site-header");
    });

    it("renders logo link to homepage", () => {
      renderWithProviders(<SiteHeader />);
      const logoLink = screen.getByRole("link", { name: /DCYFR Labs home/i });
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute("href", "/");
    });

    it("renders About link in desktop nav", () => {
      renderWithProviders(<SiteHeader />);
      const aboutLink = screen.getByRole("link", {
        name: /about/i,
      });
      expect(aboutLink).toBeInTheDocument();
      expect(aboutLink).toHaveAttribute("href", "/about");
    });

    it("renders Sponsors link in desktop nav", () => {
      renderWithProviders(<SiteHeader />);
      const sponsorsLink = screen.getByRole("link", {
        name: /Support open source development/i,
      });
      expect(sponsorsLink).toBeInTheDocument();
      expect(sponsorsLink).toHaveAttribute("href", "/sponsors");
    });

    it("renders theme toggle button", () => {
      renderWithProviders(<SiteHeader />);
      const themeToggles = screen.getAllByRole("button", {
        name: /switch to|toggle theme/i,
      });
      expect(themeToggles.length).toBeGreaterThan(0);
    });
  });

  describe("Desktop Navigation", () => {
    it("renders desktop navigation with aria-label", () => {
      renderWithProviders(<SiteHeader />);
      const nav = screen.getByRole("navigation", { name: /Main navigation/i });
      expect(nav).toBeInTheDocument();
    });

    it("hides desktop navigation on mobile (has hidden md:flex classes)", () => {
      renderWithProviders(<SiteHeader />);
      const nav = screen.getByRole("navigation", { name: /Main navigation/i });
      expect(nav.className).toContain("hidden md:flex");
    });
  });

  describe("Blog Dropdown", () => {
    it("renders Blog dropdown button", () => {
      renderWithProviders(<SiteHeader />);
      const blogButton = screen.getByRole("button", { name: /Blog/i });
      expect(blogButton).toBeInTheDocument();
      expect(blogButton).toHaveAttribute("aria-haspopup", "menu");
      expect(blogButton).toHaveAttribute("aria-expanded", "false");
    });

    it("opens Blog dropdown when clicked", async () => {
      renderWithProviders(<SiteHeader />);
      const blogButton = screen.getByRole("button", { name: /Blog menu/i });

      fireEvent.click(blogButton);

      // Wait for button to show expanded state and dropdown to render
      await waitFor(() => {
        expect(blogButton).toHaveAttribute("aria-expanded", "true");
      });

      // Wait for dropdown menuitems to appear (they use role="menuitem" + aria-label)
      const allPostsLink = await screen.findByRole("menuitem", {
        name: /Browse our blog articles/i,
      });
      const blogSeriesLink = screen.getByRole("menuitem", {
        name: /In-depth multi-part articles/i,
      });

      expect(allPostsLink).toBeInTheDocument();
      expect(blogSeriesLink).toBeInTheDocument();
    });

    it("closes Blog dropdown when clicking a link", async () => {
      renderWithProviders(<SiteHeader />);
      const blogButton = screen.getByRole("button", { name: /Blog menu/i });

      fireEvent.click(blogButton);

      const allPostsLink = await screen.findByRole("menuitem", {
        name: /Browse our blog articles/i,
      });
      fireEvent.click(allPostsLink);

      await waitFor(() => {
        expect(blogButton).toHaveAttribute("aria-expanded", "false");
      });
    });

    it("closes Blog dropdown when clicking outside", async () => {
      renderWithProviders(<SiteHeader />);
      const blogButton = screen.getByRole("button", { name: /Blog/i });

      fireEvent.click(blogButton);
      expect(blogButton).toHaveAttribute("aria-expanded", "true");

      // Wait for event listener to be registered (useDropdown uses setTimeout)
      await waitFor(() => {}, { timeout: 10 });

      // Click outside the dropdown
      fireEvent.click(document.body);

      await waitFor(() => {
        expect(blogButton).toHaveAttribute("aria-expanded", "false");
      });
    });

    it("displays chevron icon that rotates when dropdown opens", () => {
      renderWithProviders(<SiteHeader />);
      const blogButton = screen.getByRole("button", { name: /Blog/i });
      const chevron = blogButton.querySelector("svg");

      expect(chevron).toBeInTheDocument();
      expect(chevron?.className).not.toContain("rotate-180");

      fireEvent.click(blogButton);

      expect(chevron?.className).toContain("rotate-180");
    });
  });

  describe("Our Work Dropdown", () => {
    it("renders Our Work dropdown button", () => {
      renderWithProviders(<SiteHeader />);
      const workButton = screen.getByRole("button", { name: /Our Work/i });
      expect(workButton).toBeInTheDocument();
      expect(workButton).toHaveAttribute("aria-haspopup", "menu");
      expect(workButton).toHaveAttribute("aria-expanded", "false");
    });

    it("opens Our Work dropdown when clicked", async () => {
      renderWithProviders(<SiteHeader />);
      const workButton = screen.getByRole("button", { name: /Our Work menu/i });

      fireEvent.click(workButton);

      // Wait for button to show expanded state and dropdown to render
      await waitFor(() => {
        expect(workButton).toHaveAttribute("aria-expanded", "true");
      });

      // Wait for dropdown menuitems to appear (they use role="menuitem" + aria-label)
      const allProjectsLink = await screen.findByRole("menuitem", {
        name: /View complete portfolio/i,
      });
      const communityLink = screen.getByRole("menuitem", {
        name: /Open source and community work/i,
      });
      const nonprofitLink = screen.getByRole("menuitem", {
        name: /Mission-driven partnerships/i,
      });
      const startupLink = screen.getByRole("menuitem", {
        name: /Early-stage product development/i,
      });

      expect(allProjectsLink).toBeInTheDocument();
      expect(communityLink).toBeInTheDocument();
      expect(nonprofitLink).toBeInTheDocument();
      expect(startupLink).toBeInTheDocument();
    });

    it("closes Our Work dropdown when clicking a link", async () => {
      renderWithProviders(<SiteHeader />);
      const workButton = screen.getByRole("button", { name: /Our Work menu/i });

      fireEvent.click(workButton);

      const allProjectsLink = await screen.findByRole("menuitem", {
        name: /View complete portfolio/i,
      });
      fireEvent.click(allProjectsLink);

      await waitFor(() => {
        expect(workButton).toHaveAttribute("aria-expanded", "false");
      });
    });

    it("closes Our Work dropdown when clicking outside", async () => {
      renderWithProviders(<SiteHeader />);
      const workButton = screen.getByRole("button", { name: /Our Work/i });

      fireEvent.click(workButton);
      expect(workButton).toHaveAttribute("aria-expanded", "true");

      // Wait for event listener to be registered (useDropdown uses setTimeout)
      await waitFor(() => {}, { timeout: 10 });

      // Click outside the dropdown
      fireEvent.click(document.body);

      await waitFor(() => {
        expect(workButton).toHaveAttribute("aria-expanded", "false");
      });
    });

    it("displays correct links in Our Work dropdown", async () => {
      renderWithProviders(<SiteHeader />);
      const workButton = screen.getByRole("button", { name: /Our Work menu/i });

      fireEvent.click(workButton);

      const communityLink = await screen.findByRole("menuitem", {
        name: /Open source and community work/i,
      });
      const nonprofitLink = screen.getByRole("menuitem", {
        name: /Mission-driven partnerships/i,
      });
      const startupLink = screen.getByRole("menuitem", {
        name: /Early-stage product development/i,
      });

      expect(communityLink).toHaveAttribute("href", "/work?category=community");
      expect(nonprofitLink).toHaveAttribute("href", "/work?category=nonprofit");
      expect(startupLink).toHaveAttribute("href", "/work?category=startup");
    });
  });

  describe("Logo Click Behavior", () => {
    it("scrolls to top when clicking logo on homepage", () => {
      mockUsePathname.mockReturnValue("/");
      const scrollToSpy = vi.fn();
      window.scrollTo = scrollToSpy;

      renderWithProviders(<SiteHeader />);
      const logoLink = screen.getByRole("link", { name: /DCYFR Labs home/i });

      fireEvent.click(logoLink);

      expect(scrollToSpy).toHaveBeenCalledWith({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    });

    it("navigates normally when clicking logo on other pages", () => {
      mockUsePathname.mockReturnValue("/blog");
      const scrollToSpy = vi.fn();
      window.scrollTo = scrollToSpy;

      renderWithProviders(<SiteHeader />);
      const logoLink = screen.getByRole("link", { name: /DCYFR Labs home/i });

      fireEvent.click(logoLink);

      // Should not scroll when not on homepage
      expect(scrollToSpy).not.toHaveBeenCalled();
    });
  });

  describe("Mobile Navigation", () => {
    it("renders mobile navigation container", () => {
      renderWithProviders(<SiteHeader />);
      const header = screen.getByRole("banner");
      const mobileNavContainer = header.querySelector(".flex.md\\:hidden");
      expect(mobileNavContainer).toBeInTheDocument();
    });

    it("shows theme toggle in mobile nav", () => {
      renderWithProviders(<SiteHeader />);
      const themeToggles = screen.getAllByRole("button", {
        name: /switch to|toggle theme/i,
      });
      expect(themeToggles.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels for navigation", () => {
      renderWithProviders(<SiteHeader />);
      expect(
        screen.getByRole("navigation", { name: /Main navigation/i })
      ).toBeInTheDocument();
    });

    it("has proper ARIA attributes for dropdowns", () => {
      renderWithProviders(<SiteHeader />);

      const blogButton = screen.getByRole("button", { name: /Blog/i });
      expect(blogButton).toHaveAttribute("aria-haspopup", "menu");
      expect(blogButton).toHaveAttribute("aria-expanded");

      const workButton = screen.getByRole("button", { name: /Our Work/i });
      expect(workButton).toHaveAttribute("aria-haspopup", "menu");
      expect(workButton).toHaveAttribute("aria-expanded");
    });

    it("updates aria-expanded when dropdowns open/close", async () => {
      renderWithProviders(<SiteHeader />);
      const blogButton = screen.getByRole("button", { name: /Blog/i });

      expect(blogButton).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(blogButton);
      await waitFor(() => {
        expect(blogButton).toHaveAttribute("aria-expanded", "true");
      });

      fireEvent.click(blogButton);
      await waitFor(() => {
        expect(blogButton).toHaveAttribute("aria-expanded", "false");
      });
    });
  });

  describe("Styling and Layout", () => {
    it("applies sticky positioning to header", () => {
      renderWithProviders(<SiteHeader />);
      const header = screen.getByRole("banner");
      expect(header.className).toContain("sticky");
      expect(header.className).toContain("top-0");
    });

    it("applies backdrop blur effect when scrolled", async () => {
      renderWithProviders(<SiteHeader />);
      const header = screen.getByRole("banner");

      // Initially should not have backdrop blur
      expect(header.className).not.toContain("backdrop-blur");

      // Simulate scroll
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 100,
      });

      fireEvent.scroll(window, { target: { scrollY: 100 } });

      await waitFor(() => {
        expect(header.className).toContain("backdrop-blur");
      });
    });

    it("has correct z-index for stacking", () => {
      renderWithProviders(<SiteHeader />);
      const header = screen.getByRole("banner");
      expect(header.className).toContain("z-40");
    });
  });

  describe("Scroll Border Behavior", () => {
    it("does not have border-b when scrollY is 0", () => {
      // Mock scrollY to ensure it starts at 0
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 0,
      });

      renderWithProviders(<SiteHeader />);
      const header = screen.getByRole("banner");

      // Header should not have border-b at top of page
      // Note: The component checks if scrollY > threshold
      expect(header.className).not.toContain("border-b");
    });

    it("adds border-b when scrolled", async () => {
      renderWithProviders(<SiteHeader />);
      const header = screen.getByRole("banner");

      // Simulate scroll (needs to be beyond header height threshold)
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 100,
      });

      fireEvent.scroll(window, { target: { scrollY: 100 } });

      await waitFor(() => {
        expect(header.className).toContain("border-b");
      });
    });

    it("removes border-b when scrolled back to top", async () => {
      renderWithProviders(<SiteHeader />);
      const header = screen.getByRole("banner");

      // Simulate scroll down (beyond threshold)
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 100,
      });
      fireEvent.scroll(window, { target: { scrollY: 100 } });

      await waitFor(() => {
        expect(header.className).toContain("border-b");
      });

      // Simulate scroll back to top
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 0,
      });
      fireEvent.scroll(window, { target: { scrollY: 0 } });

      await waitFor(() => {
        expect(header.className).not.toContain("border-b");
      });
    });
  });
});
