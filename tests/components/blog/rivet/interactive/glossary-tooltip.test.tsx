import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GlossaryTooltip } from "@/components/blog/rivet/interactive/glossary-tooltip";

const STORAGE_KEY = "dcyfr-glossary-visited";

describe("GlossaryTooltip", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("renders with term as default children", () => {
      render(
        <GlossaryTooltip
          term="Prompt Injection"
          definition="A technique where attackers manipulate AI prompts"
        />
      );

      expect(
        screen.getByRole("button", { name: /prompt injection/i })
      ).toBeInTheDocument();
    });

    it("renders with custom children", () => {
      render(
        <GlossaryTooltip
          term="Prompt Injection"
          definition="A technique where attackers manipulate AI prompts"
        >
          custom text
        </GlossaryTooltip>
      );

      expect(
        screen.getByRole("button", { name: /custom text/i })
      ).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <GlossaryTooltip
          term="Test Term"
          definition="Test definition"
          className="custom-class"
        />
      );

      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });

    it("shows pulse indicator for unvisited terms", () => {
      render(<GlossaryTooltip term="New Term" definition="Not visited yet" />);

      const button = screen.getByRole("button");
      const indicator = button.querySelector(".animate-pulse");
      expect(indicator).toBeInTheDocument();
    });

    it("hides pulse indicator for visited terms", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(["Visited Term"]));

      render(
        <GlossaryTooltip term="Visited Term" definition="Already visited" />
      );

      const button = screen.getByRole("button");
      const indicator = button.querySelector(".animate-pulse");
      expect(indicator).not.toBeInTheDocument();
    });
  });

  describe("Tooltip Interaction", () => {
    it("opens tooltip on click", async () => {
      const user = userEvent.setup();
      render(<GlossaryTooltip term="Test Term" definition="Test definition" />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });
    });

    it("displays term and definition in tooltip", async () => {
      const user = userEvent.setup();
      render(
        <GlossaryTooltip
          term="Prompt Injection"
          definition="A technique where attackers manipulate AI prompts to achieve malicious goals"
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
        expect(
          screen.getByRole("heading", { name: "Prompt Injection" })
        ).toBeInTheDocument();
        expect(
          screen.getByText(/technique where attackers manipulate/i)
        ).toBeInTheDocument();
      });
    });

    it("closes tooltip on second click", async () => {
      const user = userEvent.setup();
      render(<GlossaryTooltip term="Test Term" definition="Test definition" />);

      const button = screen.getByRole("button");

      // Open
      await user.click(button);
      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });

      // Close
      await user.click(button);
      await waitFor(() => {
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
      });
    });

    it("sets aria-expanded correctly", async () => {
      const user = userEvent.setup();
      render(<GlossaryTooltip term="Test Term" definition="Test definition" />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-expanded", "false");

      await user.click(button);
      await waitFor(() => {
        expect(button).toHaveAttribute("aria-expanded", "true");
      });
    });
  });

  describe("Keyboard Navigation", () => {
    it("opens tooltip on Enter key", async () => {
      const user = userEvent.setup();
      render(<GlossaryTooltip term="Test Term" definition="Test definition" />);

      const button = screen.getByRole("button");
      button.focus();
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });
    });

    it("opens tooltip on Space key", async () => {
      const user = userEvent.setup();
      render(<GlossaryTooltip term="Test Term" definition="Test definition" />);

      const button = screen.getByRole("button");
      button.focus();
      await user.keyboard(" ");

      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });
    });

    it("closes tooltip on Escape key", async () => {
      const user = userEvent.setup();
      render(<GlossaryTooltip term="Test Term" definition="Test definition" />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
      });
    });

    it("returns focus to trigger after Escape", async () => {
      const user = userEvent.setup();
      render(<GlossaryTooltip term="Test Term" definition="Test definition" />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(button).toHaveFocus();
      });
    });
  });

  describe("LocalStorage Integration", () => {
    it("marks term as visited after opening", async () => {
      const user = userEvent.setup();
      render(<GlossaryTooltip term="New Term" definition="Test definition" />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const visited = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        expect(visited).toContain("New Term");
      });
    });

    it("loads visited state from localStorage", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(["Existing Term"]));

      render(
        <GlossaryTooltip term="Existing Term" definition="Already visited" />
      );

      const button = screen.getByRole("button");
      const indicator = button.querySelector(".animate-pulse");
      expect(indicator).not.toBeInTheDocument();
    });

    it("handles localStorage errors gracefully", () => {
      vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("Storage error");
      });

      // Should render without crashing
      const { container } = render(
        <GlossaryTooltip term="Test Term" definition="Test definition" />
      );

      // Component should render despite localStorage error
      expect(container.querySelector("button")).toBeInTheDocument();
    });

    it("handles localStorage save errors gracefully", async () => {
      const user = userEvent.setup();

      render(<GlossaryTooltip term="Test Term" definition="Test definition" />);

      // Mock setItem to throw after component mounts
      const consoleWarn = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Storage error");
      });

      const button = screen.getByRole("button");
      await user.click(button);

      // Tooltip should still open despite save error
      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });
    });

    it("does not duplicate terms in localStorage", async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(["Existing Term"]));

      const user = userEvent.setup();
      render(
        <GlossaryTooltip term="Existing Term" definition="Test definition" />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const visited = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        expect(visited).toEqual(["Existing Term"]);
      });
    });
  });

  describe("Click Outside", () => {
    it("closes tooltip when clicking outside", async () => {
      const user = userEvent.setup();
      render(
        <div>
          <GlossaryTooltip term="Test Term" definition="Test definition" />
          <button>Outside Button</button>
        </div>
      );

      const glossaryButton = screen.getByRole("button", { name: /test term/i });
      await user.click(glossaryButton);

      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });

      const outsideButton = screen.getByRole("button", {
        name: /outside button/i,
      });
      fireEvent.mouseDown(outsideButton);

      await waitFor(() => {
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
      });
    });

    it("does not close when clicking inside tooltip", async () => {
      const user = userEvent.setup();
      render(<GlossaryTooltip term="Test Term" definition="Test definition" />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });

      const tooltip = screen.getByRole("tooltip");
      fireEvent.mouseDown(tooltip);

      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes", () => {
      render(<GlossaryTooltip term="Test Term" definition="Test definition" />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
      expect(button).toHaveAttribute("aria-expanded");
    });

    it("associates tooltip with trigger using aria-describedby", async () => {
      const user = userEvent.setup();
      render(<GlossaryTooltip term="Test Term" definition="Test definition" />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const tooltipId = button.getAttribute("aria-describedby");
        expect(tooltipId).toBeTruthy();
        expect(screen.getByRole("tooltip")).toHaveAttribute("id", tooltipId!);
      });
    });

    it("has cursor help styling", () => {
      render(<GlossaryTooltip term="Test Term" definition="Test definition" />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("cursor-help");
    });

    it("has focus visible styles", () => {
      render(<GlossaryTooltip term="Test Term" definition="Test definition" />);

      const button = screen.getByRole("button");
      expect(button.className).toContain("focus-visible");
    });
  });

  describe("Mobile Close Button", () => {
    it("renders close button on mobile", async () => {
      const user = userEvent.setup();
      render(<GlossaryTooltip term="Test Term" definition="Test definition" />);

      const button = screen.getByRole("button", { name: /test term/i });
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /close tooltip/i })
        ).toBeInTheDocument();
      });
    });

    it("closes tooltip when clicking close button", async () => {
      const user = userEvent.setup();
      render(<GlossaryTooltip term="Test Term" definition="Test definition" />);

      const openButton = screen.getByRole("button", { name: /test term/i });
      await user.click(openButton);

      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });

      const closeButton = screen.getByRole("button", {
        name: /close tooltip/i,
      });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
      });
    });
  });
});
