import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KeyTakeaway } from "../key-takeaway";

describe("KeyTakeaway", () => {
  describe("Rendering", () => {
    it("renders with default insight variant", () => {
      render(<KeyTakeaway>Test content</KeyTakeaway>);
      expect(screen.getByRole("note")).toBeInTheDocument();
      expect(screen.getByText("Test content")).toBeInTheDocument();
    });

    it("renders children correctly", () => {
      render(
        <KeyTakeaway>
          <p>Paragraph 1</p>
          <p>Paragraph 2</p>
        </KeyTakeaway>
      );
      expect(screen.getByText("Paragraph 1")).toBeInTheDocument();
      expect(screen.getByText("Paragraph 2")).toBeInTheDocument();
    });

    it("renders with optional title", () => {
      render(<KeyTakeaway title="Important Note">Content here</KeyTakeaway>);
      expect(screen.getByText("Important Note")).toBeInTheDocument();
      expect(screen.getByText("Content here")).toBeInTheDocument();
    });

    it("renders without title", () => {
      render(<KeyTakeaway>Just content</KeyTakeaway>);
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
      expect(screen.getByText("Just content")).toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("renders insight variant with correct styles", () => {
      const { container } = render(
        <KeyTakeaway variant="insight">Insight content</KeyTakeaway>
      );
      const noteElement = container.querySelector('[role="note"]');
      expect(noteElement).toHaveClass("border-info");
      expect(noteElement).toHaveClass("bg-info-subtle");
    });

    it("renders security variant with correct styles", () => {
      const { container } = render(
        <KeyTakeaway variant="security">Security content</KeyTakeaway>
      );
      const noteElement = container.querySelector('[role="note"]');
      expect(noteElement).toHaveClass("border-success");
      expect(noteElement).toHaveClass("bg-success-subtle");
    });

    it("renders warning variant with correct styles", () => {
      const { container } = render(
        <KeyTakeaway variant="warning">Warning content</KeyTakeaway>
      );
      const noteElement = container.querySelector('[role="note"]');
      expect(noteElement).toHaveClass("border-warning");
      expect(noteElement).toHaveClass("bg-warning-subtle");
    });

    it("renders tip variant with correct styles", () => {
      const { container } = render(
        <KeyTakeaway variant="tip">Tip content</KeyTakeaway>
      );
      const noteElement = container.querySelector('[role="note"]');
      expect(noteElement).toHaveClass("border-semantic-purple");
      expect(noteElement).toHaveClass("bg-semantic-purple/10");
    });
  });

  describe("Icons", () => {
    it("renders icon for insight variant", () => {
      const { container } = render(
        <KeyTakeaway variant="insight">Content</KeyTakeaway>
      );
      // Lucide icons render as SVG elements
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass("text-info");
    });

    it("renders icon for security variant", () => {
      const { container } = render(
        <KeyTakeaway variant="security">Content</KeyTakeaway>
      );
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass("text-success");
    });

    it("renders icon for warning variant", () => {
      const { container } = render(
        <KeyTakeaway variant="warning">Content</KeyTakeaway>
      );
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass("text-warning");
    });

    it("renders icon for tip variant", () => {
      const { container } = render(
        <KeyTakeaway variant="tip">Content</KeyTakeaway>
      );
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass("text-semantic-purple");
    });

    it("marks icon as decorative", () => {
      const { container } = render(<KeyTakeaway>Content</KeyTakeaway>);
      const icon = container.querySelector("svg");
      expect(icon).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Accessibility", () => {
    it("has note role", () => {
      render(<KeyTakeaway>Content</KeyTakeaway>);
      expect(screen.getByRole("note")).toBeInTheDocument();
    });

    it("has aria-label matching title when provided", () => {
      render(<KeyTakeaway title="Custom Title">Content</KeyTakeaway>);
      const note = screen.getByRole("note");
      expect(note).toHaveAttribute("aria-label", "Custom Title");
    });

    it("has aria-label matching variant label when no title", () => {
      render(<KeyTakeaway variant="security">Content</KeyTakeaway>);
      const note = screen.getByRole("note");
      expect(note).toHaveAttribute("aria-label", "Security Note");
    });

    it("has aria-label for insight variant", () => {
      render(<KeyTakeaway variant="insight">Content</KeyTakeaway>);
      const note = screen.getByRole("note");
      expect(note).toHaveAttribute("aria-label", "Key Insight");
    });

    it("has aria-label for warning variant", () => {
      render(<KeyTakeaway variant="warning">Content</KeyTakeaway>);
      const note = screen.getByRole("note");
      expect(note).toHaveAttribute("aria-label", "Warning");
    });

    it("has aria-label for tip variant", () => {
      render(<KeyTakeaway variant="tip">Content</KeyTakeaway>);
      const note = screen.getByRole("note");
      expect(note).toHaveAttribute("aria-label", "Pro Tip");
    });
  });

  describe("Title Styling", () => {
    it("renders title in strong tag", () => {
      render(<KeyTakeaway title="Bold Title">Content</KeyTakeaway>);
      const title = screen.getByText("Bold Title");
      expect(title.tagName).toBe("STRONG");
    });

    it("applies variant color to title", () => {
      render(
        <KeyTakeaway variant="security" title="Security Title">
          Content
        </KeyTakeaway>
      );
      const title = screen.getByText("Security Title");
      expect(title).toHaveClass("text-success");
    });
  });

  describe("Custom className", () => {
    it("applies custom className", () => {
      const { container } = render(
        <KeyTakeaway className="custom-class">Content</KeyTakeaway>
      );
      const note = container.querySelector('[role="note"]');
      expect(note).toHaveClass("custom-class");
    });
  });

  describe("Layout", () => {
    it("has left border", () => {
      const { container } = render(<KeyTakeaway>Content</KeyTakeaway>);
      const note = container.querySelector('[role="note"]');
      expect(note).toHaveClass("border-l-4");
    });

    it("has rounded corners", () => {
      const { container } = render(<KeyTakeaway>Content</KeyTakeaway>);
      const note = container.querySelector('[role="note"]');
      expect(note).toHaveClass("rounded-md");
    });

    it("has vertical margin", () => {
      const { container } = render(<KeyTakeaway>Content</KeyTakeaway>);
      const note = container.querySelector('[role="note"]');
      expect(note).toHaveClass("my-6");
    });
  });
});
