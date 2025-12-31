import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TrendingBadge } from "@/components/ui/trending-badge";
import { Flame, TrendingUp, Star, Rocket } from "lucide-react";

// ============================================================================
// TESTS
// ============================================================================

describe("TrendingBadge", () => {
  describe("Rendering", () => {
    it("should render Hot badge with correct icon and label", () => {
      render(<TrendingBadge variant="hot" />);

      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("Hot");
      // Icon is rendered as SVG via Lucide React
      const icon = badge.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should render Rising badge with correct icon and label", () => {
      render(<TrendingBadge variant="rising" />);

      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("Rising");
      // Icon is rendered as SVG via Lucide React
      const icon = badge.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should render Top badge with correct icon and label", () => {
      render(<TrendingBadge variant="top" />);

      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("Top");
      // Icon is rendered as SVG via Lucide React
      const icon = badge.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should render Accelerating badge with correct icon and label", () => {
      render(<TrendingBadge variant="accelerating" />);

      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("Accelerating");
      // Icon is rendered as SVG via Lucide React
      const icon = badge.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should apply Hot badge styling", () => {
      render(<TrendingBadge variant="hot" />);

      const badge = screen.getByRole("status");
      expect(badge).toHaveClass("bg-red-500/10");
      expect(badge).toHaveClass("text-red-500");
      expect(badge).toHaveClass("border-red-500/20");
    });

    it("should apply Rising badge styling", () => {
      render(<TrendingBadge variant="rising" />);

      const badge = screen.getByRole("status");
      expect(badge).toHaveClass("bg-blue-500/10");
      expect(badge).toHaveClass("text-blue-500");
      expect(badge).toHaveClass("border-blue-500/20");
    });

    it("should apply Top badge styling", () => {
      render(<TrendingBadge variant="top" />);

      const badge = screen.getByRole("status");
      expect(badge).toHaveClass("bg-neutral-500/10");
      expect(badge).toHaveClass("border-neutral-500/20");
    });

    it("should apply Accelerating badge styling", () => {
      render(<TrendingBadge variant="accelerating" />);

      const badge = screen.getByRole("status");
      expect(badge).toHaveClass("bg-purple-500/10");
      expect(badge).toHaveClass("text-purple-500");
      expect(badge).toHaveClass("border-purple-500/20");
    });

    it("should apply custom className", () => {
      render(<TrendingBadge variant="hot" className="custom-class" />);

      const badge = screen.getByRole("status");
      expect(badge).toHaveClass("custom-class");
    });
  });

  describe("Accessibility", () => {
    it("should have role='status' for screen readers", () => {
      render(<TrendingBadge variant="hot" />);

      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
    });

    it("should have default aria-label with description", () => {
      render(<TrendingBadge variant="hot" />);

      const badge = screen.getByRole("status");
      expect(badge).toHaveAttribute("aria-label", "Rapid growth this week");
    });

    it("should use custom aria-label when provided", () => {
      render(<TrendingBadge variant="rising" ariaLabel="Custom label" />);

      const badge = screen.getByRole("status");
      expect(badge).toHaveAttribute("aria-label", "Custom label");
    });

    it("should mark icon as aria-hidden", () => {
      const { container } = render(<TrendingBadge variant="hot" />);

      // Icon SVG should have aria-hidden
      const iconSvg = container.querySelector('svg[aria-hidden="true"]');
      expect(iconSvg).toBeInTheDocument();
    });
  });

  describe("Visual Structure", () => {
    it("should have correct base classes for layout", () => {
      render(<TrendingBadge variant="hot" />);

      const badge = screen.getByRole("status");
      expect(badge).toHaveClass("inline-flex");
      expect(badge).toHaveClass("items-center");
      expect(badge).toHaveClass("gap-1");
      expect(badge).toHaveClass("rounded-full");
    });

    it("should have correct sizing classes", () => {
      render(<TrendingBadge variant="hot" />);

      const badge = screen.getByRole("status");
      expect(badge).toHaveClass("px-2");
      expect(badge).toHaveClass("py-0.5");
      expect(badge).toHaveClass("text-xs");
    });

    it("should have border styling", () => {
      render(<TrendingBadge variant="hot" />);

      const badge = screen.getByRole("status");
      expect(badge).toHaveClass("border");
      expect(badge).toHaveClass("border-red-500/20");
    }); // Verify variant-specific border color
  });
});
