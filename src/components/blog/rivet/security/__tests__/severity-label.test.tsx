import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SeverityLabel } from "../severity-label";

describe("SeverityLabel", () => {
  describe("Rendering", () => {
    it("renders critical severity badge", () => {
      render(<SeverityLabel severity="critical" />);
      const badge = screen.getByText("CRITICAL");
      expect(badge).toBeInTheDocument();
    });

    it("renders high severity badge", () => {
      render(<SeverityLabel severity="high" />);
      const badge = screen.getByText("HIGH");
      expect(badge).toBeInTheDocument();
    });

    it("renders medium severity badge", () => {
      render(<SeverityLabel severity="medium" />);
      const badge = screen.getByText("MEDIUM");
      expect(badge).toBeInTheDocument();
    });

    it("renders low severity badge", () => {
      render(<SeverityLabel severity="low" />);
      const badge = screen.getByText("LOW");
      expect(badge).toBeInTheDocument();
    });

    it("renders info severity badge", () => {
      render(<SeverityLabel severity="info" />);
      const badge = screen.getByText("INFO");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Count Display", () => {
    it("displays count when provided", () => {
      render(<SeverityLabel severity="high" count={3} />);
      const badge = screen.getByText("3 HIGH");
      expect(badge).toBeInTheDocument();
    });

    it("displays severity without count when count is not provided", () => {
      render(<SeverityLabel severity="medium" />);
      const badge = screen.getByText("MEDIUM");
      expect(badge).toBeInTheDocument();
      expect(screen.queryByText(/\d+/)).not.toBeInTheDocument();
    });

    it("handles zero count", () => {
      render(<SeverityLabel severity="low" count={0} />);
      const badge = screen.getByText("0 LOW");
      expect(badge).toBeInTheDocument();
    });

    it("handles large counts", () => {
      render(<SeverityLabel severity="critical" count={999} />);
      const badge = screen.getByText("999 CRITICAL");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("applies critical severity styles", () => {
      render(<SeverityLabel severity="critical" />);
      const badge = screen.getByText("CRITICAL");
      expect(badge).toHaveClass("bg-red-600");
      expect(badge).toHaveClass("text-red-50");
    });

    it("applies high severity styles", () => {
      render(<SeverityLabel severity="high" />);
      const badge = screen.getByText("HIGH");
      expect(badge).toHaveClass("bg-orange-600");
      expect(badge).toHaveClass("text-orange-50");
    });

    it("applies medium severity styles", () => {
      render(<SeverityLabel severity="medium" />);
      const badge = screen.getByText("MEDIUM");
      expect(badge).toHaveClass("bg-yellow-600");
      expect(badge).toHaveClass("text-yellow-50");
    });

    it("applies low severity styles", () => {
      render(<SeverityLabel severity="low" />);
      const badge = screen.getByText("LOW");
      expect(badge).toHaveClass("bg-blue-600");
      expect(badge).toHaveClass("text-blue-50");
    });

    it("applies info severity styles", () => {
      render(<SeverityLabel severity="info" />);
      const badge = screen.getByText("INFO");
      expect(badge).toHaveClass("bg-gray-600");
      expect(badge).toHaveClass("text-gray-50");
    });

    it("accepts custom className", () => {
      render(<SeverityLabel severity="high" className="custom-class" />);
      const badge = screen.getByText("HIGH");
      expect(badge).toHaveClass("custom-class");
    });

    it("applies uppercase styling", () => {
      render(<SeverityLabel severity="medium" />);
      const badge = screen.getByText("MEDIUM");
      expect(badge).toHaveClass("uppercase");
    });
  });

  describe("Accessibility", () => {
    it("has proper aria-label without count", () => {
      render(<SeverityLabel severity="critical" />);
      const badge = screen.getByLabelText("Severity: CRITICAL");
      expect(badge).toBeInTheDocument();
    });

    it("has proper aria-label with count", () => {
      render(<SeverityLabel severity="high" count={3} />);
      const badge = screen.getByLabelText("Severity: HIGH, Count: 3");
      expect(badge).toBeInTheDocument();
    });

    it("uses semantic span element via Badge component", () => {
      const { container } = render(<SeverityLabel severity="medium" />);
      const badge = container.querySelector("span[data-slot='badge']");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Theme Support", () => {
    it("includes dark mode classes for critical", () => {
      render(<SeverityLabel severity="critical" />);
      const badge = screen.getByText("CRITICAL");
      expect(badge).toHaveClass("dark:bg-red-900");
      expect(badge).toHaveClass("dark:text-red-100");
    });

    it("includes dark mode classes for high", () => {
      render(<SeverityLabel severity="high" />);
      const badge = screen.getByText("HIGH");
      expect(badge).toHaveClass("dark:bg-orange-800");
      expect(badge).toHaveClass("dark:text-orange-100");
    });

    it("includes transition classes for smooth theme switching", () => {
      render(<SeverityLabel severity="medium" />);
      const badge = screen.getByText("MEDIUM");
      // ANIMATION.transition.theme should be applied
      expect(badge.className).toContain("transition");
    });
  });

  describe("Edge Cases", () => {
    it("handles negative count gracefully", () => {
      render(<SeverityLabel severity="low" count={-1} />);
      const badge = screen.getByText("-1 LOW");
      expect(badge).toBeInTheDocument();
    });

    it("renders correctly when count is undefined", () => {
      render(<SeverityLabel severity="info" count={undefined} />);
      const badge = screen.getByText("INFO");
      expect(badge).toBeInTheDocument();
    });
  });
});
