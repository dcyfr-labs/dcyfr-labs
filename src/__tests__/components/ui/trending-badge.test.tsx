import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TrendingBadge } from "@/components/ui/trending-badge";

// ============================================================================
// TESTS
// ============================================================================

describe("TrendingBadge", () => {
  describe("Rendering", () => {
    it("should render Hot badge with correct icon and label", () => {
      render(<TrendingBadge variant="hot" />);

      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("🔥");
      expect(badge).toHaveTextContent("Hot");
    });

    it("should render Rising badge with correct icon and label", () => {
      render(<TrendingBadge variant="rising" />);

      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("📈");
      expect(badge).toHaveTextContent("Rising");
    });

    it("should render Top badge with correct icon and label", () => {
      render(<TrendingBadge variant="top" />);

      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("⭐");
      expect(badge).toHaveTextContent("Top");
    });

    it("should render Accelerating badge with correct icon and label", () => {
      render(<TrendingBadge variant="accelerating" />);

      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("🚀");
      expect(badge).toHaveTextContent("Accelerating");
    });
  });

  describe("Styling", () => {
    it("should apply Hot badge styling", () => {
      render(<TrendingBadge variant="hot" />);

      const badge = screen.getByRole("status");
      expect(badge).toHaveClass("px-2");
      expect(badge).toHaveClass("rounded");
    });

    it("should apply Rising badge styling", () => {
      render(<TrendingBadge variant="rising" />);

      const badge = screen.getByRole("status");
      expect(badge).toHaveClass("px-2");
      expect(badge).toHaveClass("rounded");
    });

    it("should apply Top badge styling", () => {
      render(<TrendingBadge variant="top" />);

      const badge = screen.getByRole("status");
      expect(badge).toHaveClass("px-2");
      expect(badge).toHaveClass("rounded");
    });

    it("should apply Accelerating badge styling", () => {
      render(<TrendingBadge variant="accelerating" />);

      const badge = screen.getByRole("status");
      expect(badge).toHaveClass("px-2");
      expect(badge).toHaveClass("rounded");
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

      // Icon span should have aria-hidden
      const iconSpan = container.querySelector('[aria-hidden="true"]');
      expect(iconSpan).toBeInTheDocument();
      expect(iconSpan).toHaveTextContent("🔥");
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
    });
  });
});
