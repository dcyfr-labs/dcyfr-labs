import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TLDRSummary } from "../tldr-summary";

describe("TLDRSummary", () => {
  const mockMostCommon = ["Item 1", "Item 2"];
  const mockMostDangerous = ["Dangerous 1"];
  const mockHardestToDetect = ["Hard 1", "Hard 2", "Hard 3"];

  describe("Rendering", () => {
    it("renders with all three sections", () => {
      render(
        <TLDRSummary
          mostCommon={mockMostCommon}
          mostDangerous={mockMostDangerous}
          hardestToDetect={mockHardestToDetect}
        />
      );

      expect(screen.getByText("Most Common")).toBeInTheDocument();
      expect(screen.getByText("Most Dangerous")).toBeInTheDocument();
      expect(screen.getByText("Hardest to Detect")).toBeInTheDocument();
    });

    it("renders custom title", () => {
      render(<TLDRSummary title="Quick Summary" mostCommon={mockMostCommon} />);

      expect(screen.getByText("Quick Summary")).toBeInTheDocument();
    });

    it("renders default title", () => {
      render(<TLDRSummary mostCommon={mockMostCommon} />);
      expect(screen.getByText("TL;DR")).toBeInTheDocument();
    });

    it("renders all items in mostCommon section", () => {
      render(<TLDRSummary mostCommon={mockMostCommon} />);
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
    });

    it("renders all items in mostDangerous section", () => {
      render(<TLDRSummary mostDangerous={mockMostDangerous} />);
      expect(screen.getByText("Dangerous 1")).toBeInTheDocument();
    });

    it("renders all items in hardestToDetect section", () => {
      render(<TLDRSummary hardestToDetect={mockHardestToDetect} />);
      expect(screen.getByText("Hard 1")).toBeInTheDocument();
      expect(screen.getByText("Hard 2")).toBeInTheDocument();
      expect(screen.getByText("Hard 3")).toBeInTheDocument();
    });

    it("returns null when no content provided", () => {
      const { container } = render(<TLDRSummary />);
      expect(container.firstChild).toBeNull();
    });

    it("returns null when empty arrays provided", () => {
      const { container } = render(
        <TLDRSummary mostCommon={[]} mostDangerous={[]} hardestToDetect={[]} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Sections", () => {
    it("only renders mostCommon when only that is provided", () => {
      render(<TLDRSummary mostCommon={mockMostCommon} />);
      expect(screen.getByText("Most Common")).toBeInTheDocument();
      expect(screen.queryByText("Most Dangerous")).not.toBeInTheDocument();
      expect(screen.queryByText("Hardest to Detect")).not.toBeInTheDocument();
    });

    it("only renders mostDangerous when only that is provided", () => {
      render(<TLDRSummary mostDangerous={mockMostDangerous} />);
      expect(screen.queryByText("Most Common")).not.toBeInTheDocument();
      expect(screen.getByText("Most Dangerous")).toBeInTheDocument();
      expect(screen.queryByText("Hardest to Detect")).not.toBeInTheDocument();
    });

    it("only renders hardestToDetect when only that is provided", () => {
      render(<TLDRSummary hardestToDetect={mockHardestToDetect} />);
      expect(screen.queryByText("Most Common")).not.toBeInTheDocument();
      expect(screen.queryByText("Most Dangerous")).not.toBeInTheDocument();
      expect(screen.getByText("Hardest to Detect")).toBeInTheDocument();
    });

    it("renders multiple sections when multiple are provided", () => {
      render(
        <TLDRSummary
          mostCommon={mockMostCommon}
          hardestToDetect={mockHardestToDetect}
        />
      );
      expect(screen.getByText("Most Common")).toBeInTheDocument();
      expect(screen.queryByText("Most Dangerous")).not.toBeInTheDocument();
      expect(screen.getByText("Hardest to Detect")).toBeInTheDocument();
    });

    it("does not render section when empty array provided", () => {
      render(<TLDRSummary mostCommon={mockMostCommon} mostDangerous={[]} />);
      expect(screen.getByText("Most Common")).toBeInTheDocument();
      expect(screen.queryByText("Most Dangerous")).not.toBeInTheDocument();
    });
  });

  describe("Jump Link", () => {
    it("renders default jump link", () => {
      render(<TLDRSummary mostCommon={mockMostCommon} />);
      const link = screen.getByText("Read full analysis");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "#content");
    });

    it("renders custom jump link", () => {
      render(
        <TLDRSummary mostCommon={mockMostCommon} jumpLink="#custom-section" />
      );
      const link = screen.getByText("Read full analysis");
      expect(link).toHaveAttribute("href", "#custom-section");
    });

    it("renders jump link as anchor tag", () => {
      render(<TLDRSummary mostCommon={mockMostCommon} />);
      const link = screen.getByText("Read full analysis");
      expect(link.tagName).toBe("A");
    });

    it("includes chevron icon in jump link", () => {
      const { container } = render(<TLDRSummary mostCommon={mockMostCommon} />);
      const link = screen.getByText("Read full analysis");
      const icon = link.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has section role", () => {
      render(<TLDRSummary mostCommon={mockMostCommon} />);
      const section = screen.getByRole("region");
      expect(section).toBeInTheDocument();
    });

    it("has aria-label matching title", () => {
      render(<TLDRSummary title="Quick Summary" mostCommon={mockMostCommon} />);
      const section = screen.getByRole("region");
      expect(section).toHaveAttribute("aria-label", "Quick Summary");
    });

    it("has aria-label with default title", () => {
      render(<TLDRSummary mostCommon={mockMostCommon} />);
      const section = screen.getByRole("region");
      expect(section).toHaveAttribute("aria-label", "TL;DR");
    });

    it("renders section headings", () => {
      render(
        <TLDRSummary
          mostCommon={mockMostCommon}
          mostDangerous={mockMostDangerous}
        />
      );
      const mostCommonHeading = screen.getByRole("heading", {
        name: "Most Common",
      });
      const mostDangerousHeading = screen.getByRole("heading", {
        name: "Most Dangerous",
      });
      expect(mostCommonHeading).toBeInTheDocument();
      expect(mostDangerousHeading).toBeInTheDocument();
    });

    it("uses list structure for items", () => {
      render(<TLDRSummary mostCommon={mockMostCommon} />);
      const lists = screen.getAllByRole("list");
      expect(lists.length).toBeGreaterThan(0);
    });

    it("marks decorative background as hidden", () => {
      const { container } = render(<TLDRSummary mostCommon={mockMostCommon} />);
      const decorative = container.querySelector('[aria-hidden="true"]');
      expect(decorative).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("has gradient background", () => {
      const { container } = render(<TLDRSummary mostCommon={mockMostCommon} />);
      const section = container.querySelector("section");
      expect(section).toHaveClass("bg-gradient-to-br");
    });

    it("has rounded corners", () => {
      const { container } = render(<TLDRSummary mostCommon={mockMostCommon} />);
      const section = container.querySelector("section");
      expect(section).toHaveClass("rounded-lg");
    });

    it("has vertical margin", () => {
      const { container } = render(<TLDRSummary mostCommon={mockMostCommon} />);
      const section = container.querySelector("section");
      expect(section).toHaveClass("my-8");
    });

    it("applies custom className", () => {
      const { container } = render(
        <TLDRSummary mostCommon={mockMostCommon} className="custom-class" />
      );
      const section = container.querySelector("section");
      expect(section).toHaveClass("custom-class");
    });
  });

  describe("Responsive Grid", () => {
    it("uses responsive grid for sections", () => {
      const { container } = render(
        <TLDRSummary
          mostCommon={mockMostCommon}
          mostDangerous={mockMostDangerous}
          hardestToDetect={mockHardestToDetect}
        />
      );
      const grid = container.querySelector(".grid");
      expect(grid).toHaveClass("md:grid-cols-3");
    });
  });
});
