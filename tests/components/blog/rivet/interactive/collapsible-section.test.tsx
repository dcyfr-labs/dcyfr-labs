import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CollapsibleSection } from "@/components/blog/rivet/interactive/collapsible-section";

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("CollapsibleSection", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("renders with title", () => {
      render(
        <CollapsibleSection id="test-section" title="Test Title">
          <p>Test content</p>
        </CollapsibleSection>
      );

      expect(
        screen.getByRole("heading", { name: "Test Title" })
      ).toBeInTheDocument();
    });

    it("renders children when expanded", () => {
      render(
        <CollapsibleSection
          id="test-section"
          title="Test Title"
          defaultExpanded={true}
        >
          <p>Test content</p>
        </CollapsibleSection>
      );

      expect(screen.getByText("Test content")).toBeInTheDocument();
    });

    it("hides children when collapsed", () => {
      render(
        <CollapsibleSection
          id="test-section"
          title="Test Title"
          defaultExpanded={false}
        >
          <p>Test content</p>
        </CollapsibleSection>
      );

      const content = screen.getByText("Test content");
      const container = content.closest('[role="region"]');
      expect(container).toHaveClass("max-h-0", "opacity-0");
    });

    it("applies custom className", () => {
      const { container } = render(
        <CollapsibleSection
          id="test-section"
          title="Test Title"
          className="custom-class"
        >
          <p>Test content</p>
        </CollapsibleSection>
      );

      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  describe("Expand/Collapse", () => {
    it("starts collapsed by default", () => {
      render(
        <CollapsibleSection id="test-section" title="Test Title">
          <p>Test content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole("button", { name: /test title/i });
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("respects defaultExpanded prop", () => {
      render(
        <CollapsibleSection
          id="test-section"
          title="Test Title"
          defaultExpanded={true}
        >
          <p>Test content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole("button", { name: /test title/i });
      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    it("toggles expanded state on click", async () => {
      const user = userEvent.setup();
      render(
        <CollapsibleSection id="test-section" title="Test Title">
          <p>Test content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole("button", { name: /test title/i });
      expect(button).toHaveAttribute("aria-expanded", "false");

      await user.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");

      await user.click(button);
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("applies correct classes when expanded", async () => {
      const user = userEvent.setup();
      render(
        <CollapsibleSection id="test-section" title="Test Title">
          <p>Test content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole("button", { name: /test title/i });
      await user.click(button);

      const region = screen.getByRole("region");
      expect(region).toHaveClass("max-h-[5000px]", "opacity-100");
    });

    it("applies correct classes when collapsed", async () => {
      const user = userEvent.setup();
      render(
        <CollapsibleSection
          id="test-section"
          title="Test Title"
          defaultExpanded={true}
        >
          <p>Test content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole("button", { name: /test title/i });
      await user.click(button);

      const region = screen.getByRole("region");
      expect(region).toHaveClass("max-h-0", "opacity-0");
    });
  });

  describe("Keyboard Navigation", () => {
    it("toggles on Enter key", async () => {
      const user = userEvent.setup();
      render(
        <CollapsibleSection id="test-section" title="Test Title">
          <p>Test content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole("button", { name: /test title/i });
      button.focus();

      expect(button).toHaveAttribute("aria-expanded", "false");

      await user.keyboard("{Enter}");
      expect(button).toHaveAttribute("aria-expanded", "true");

      await user.keyboard("{Enter}");
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("toggles on Space key", async () => {
      const user = userEvent.setup();
      render(
        <CollapsibleSection id="test-section" title="Test Title">
          <p>Test content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole("button", { name: /test title/i });
      button.focus();

      expect(button).toHaveAttribute("aria-expanded", "false");

      await user.keyboard(" ");
      expect(button).toHaveAttribute("aria-expanded", "true");

      await user.keyboard(" ");
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("does not toggle on other keys", async () => {
      const user = userEvent.setup();
      render(
        <CollapsibleSection id="test-section" title="Test Title">
          <p>Test content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole("button", { name: /test title/i });
      button.focus();

      expect(button).toHaveAttribute("aria-expanded", "false");

      await user.keyboard("a");
      expect(button).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("LocalStorage Persistence", () => {
    it("saves state to localStorage when toggled", async () => {
      const user = userEvent.setup();
      render(
        <CollapsibleSection id="test-section" title="Test Title">
          <p>Test content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole("button", { name: /test title/i });
      await user.click(button);

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          "dcyfr-collapsible-sections",
          expect.stringContaining('"test-section":true')
        );
      });
    });

    it("loads saved state from localStorage", () => {
      mockLocalStorage.setItem(
        "dcyfr-collapsible-sections",
        JSON.stringify({ "test-section": true })
      );

      render(
        <CollapsibleSection id="test-section" title="Test Title">
          <p>Test content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole("button", { name: /test title/i });
      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    it("uses defaultExpanded when no saved state", () => {
      render(
        <CollapsibleSection
          id="test-section"
          title="Test Title"
          defaultExpanded={true}
        >
          <p>Test content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole("button", { name: /test title/i });
      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    it("handles localStorage getItem errors gracefully", () => {
      const consoleWarn = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});
      mockLocalStorage.getItem.mockImplementationOnce(() => {
        throw new Error("localStorage error");
      });

      render(
        <CollapsibleSection id="test-section" title="Test Title">
          <p>Test content</p>
        </CollapsibleSection>
      );

      expect(consoleWarn).toHaveBeenCalledWith(
        "Failed to load collapsible section state:",
        expect.any(Error)
      );
    });

    it("handles localStorage setItem errors gracefully", async () => {
      const consoleWarn = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error("localStorage error");
      });

      const user = userEvent.setup();
      render(
        <CollapsibleSection id="test-section" title="Test Title">
          <p>Test content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole("button", { name: /test title/i });
      await user.click(button);

      await waitFor(() => {
        expect(consoleWarn).toHaveBeenCalledWith(
          "Failed to save collapsible section state:",
          expect.any(Error)
        );
      });
    });

    it("manages multiple sections independently", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <>
          <CollapsibleSection id="section-1" title="Section 1">
            <p>Content 1</p>
          </CollapsibleSection>
          <CollapsibleSection id="section-2" title="Section 2">
            <p>Content 2</p>
          </CollapsibleSection>
        </>
      );

      const button1 = screen.getByRole("button", { name: /section 1/i });
      const button2 = screen.getByRole("button", { name: /section 2/i });

      // Expand section 1
      await user.click(button1);

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          "dcyfr-collapsible-sections",
          expect.stringContaining('"section-1":true')
        );
      });

      // Expand section 2
      await user.click(button2);

      await waitFor(() => {
        const savedData = JSON.parse(
          mockLocalStorage.setItem.mock.calls[
            mockLocalStorage.setItem.mock.calls.length - 1
          ][1]
        );
        expect(savedData).toEqual({
          "section-1": true,
          "section-2": true,
        });
      });
    });
  });

  describe("Chevron Icon", () => {
    it("rotates chevron when expanded", async () => {
      const user = userEvent.setup();
      render(
        <CollapsibleSection id="test-section" title="Test Title">
          <p>Test content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole("button", { name: /test title/i });
      const chevron = button.querySelector("svg");

      // Initially not rotated
      expect(chevron).not.toHaveClass("rotate-180");

      await user.click(button);

      // Rotated when expanded
      await waitFor(() => {
        expect(chevron).toHaveClass("rotate-180");
      });
    });

    it("rotates back when collapsed", async () => {
      const user = userEvent.setup();
      render(
        <CollapsibleSection
          id="test-section"
          title="Test Title"
          defaultExpanded={true}
        >
          <p>Test content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole("button", { name: /test title/i });
      const chevron = button.querySelector("svg");

      // Initially rotated
      expect(chevron).toHaveClass("rotate-180");

      await user.click(button);

      // Back to normal when collapsed
      await waitFor(() => {
        expect(chevron).not.toHaveClass("rotate-180");
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper button type", () => {
      render(
        <CollapsibleSection id="test-section" title="Test Title">
          <p>Test content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole("button", { name: /test title/i });
      expect(button).toHaveAttribute("type", "button");
    });

    it("has aria-expanded attribute", () => {
      render(
        <CollapsibleSection id="test-section" title="Test Title">
          <p>Test content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole("button", { name: /test title/i });
      expect(button).toHaveAttribute("aria-expanded");
    });

    it("has aria-controls pointing to content region", () => {
      render(
        <CollapsibleSection id="test-section" title="Test Title">
          <p>Test content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole("button", { name: /test title/i });
      const region = screen.getByRole("region");

      expect(button).toHaveAttribute("aria-controls", region.id);
      expect(region.id).toBe("collapsible-content-test-section");
    });

    it("content has role region", () => {
      render(
        <CollapsibleSection id="test-section" title="Test Title">
          <p>Test content</p>
        </CollapsibleSection>
      );

      const region = screen.getByRole("region");
      expect(region).toBeInTheDocument();
    });

    it("content has aria-labelledby pointing to header", () => {
      render(
        <CollapsibleSection id="test-section" title="Test Title">
          <p>Test content</p>
        </CollapsibleSection>
      );

      const region = screen.getByRole("region");
      expect(region).toHaveAttribute(
        "aria-labelledby",
        "collapsible-header-test-section"
      );
    });

    it("has focus visible styles on button", () => {
      render(
        <CollapsibleSection id="test-section" title="Test Title">
          <p>Test content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole("button", { name: /test title/i });
      expect(button.className).toContain("focus-visible");
    });
  });

  describe("Anchor Functionality", () => {
    beforeEach(() => {
      // Reset window location hash before each test
      window.location.hash = "";
    });

    it("section has id attribute matching the prop", () => {
      render(
        <CollapsibleSection id="test-anchor" title="Test Title">
          <p>Test content</p>
        </CollapsibleSection>
      );

      const section = screen.getByRole("button", { name: /test title/i }).closest("section");
      expect(section).toHaveAttribute("id", "test-anchor");
    });

    it("section has scroll-mt-20 class for scroll offset", () => {
      render(
        <CollapsibleSection id="test-anchor" title="Test Title">
          <p>Test content</p>
        </CollapsibleSection>
      );

      const section = screen.getByRole("button", { name: /test title/i }).closest("section");
      expect(section?.className).toContain("scroll-mt-20");
    });

    it("expands when URL hash matches section ID", async () => {
      // Set hash before rendering
      window.location.hash = "#test-anchor";

      render(
        <CollapsibleSection id="test-anchor" title="Test Title" defaultExpanded={false}>
          <p>Test content</p>
        </CollapsibleSection>
      );

      // Wait for effects to run
      await waitFor(() => {
        const button = screen.getByRole("button", { name: /test title/i });
        expect(button).toHaveAttribute("aria-expanded", "true");
      });
    });

    it("does not expand when URL hash does not match", async () => {
      window.location.hash = "#different-section";

      render(
        <CollapsibleSection id="test-anchor" title="Test Title" defaultExpanded={false}>
          <p>Test content</p>
        </CollapsibleSection>
      );

      await waitFor(() => {
        const button = screen.getByRole("button", { name: /test title/i });
        expect(button).toHaveAttribute("aria-expanded", "false");
      });
    });

    it("header button has correct id for aria-labelledby", () => {
      render(
        <CollapsibleSection id="test-anchor" title="Test Title">
          <p>Test content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole("button", { name: /test title/i });
      expect(button).toHaveAttribute("id", "collapsible-header-test-anchor");
    });
  });
});
