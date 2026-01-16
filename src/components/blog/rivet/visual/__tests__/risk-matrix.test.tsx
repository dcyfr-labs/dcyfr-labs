import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RiskMatrix, type RiskItem } from "../risk-matrix";

describe("RiskMatrix", () => {
  const defaultRisks: RiskItem[] = [
    {
      id: "r1",
      name: "SQL Injection",
      description: "Unvalidated user input in database queries",
      likelihood: "high",
      impact: "critical",
    },
    {
      id: "r2",
      name: "XSS Attack",
      description: "Malicious scripts in user content",
      likelihood: "medium",
      impact: "high",
    },
    {
      id: "r3",
      name: "Weak Password",
      description: "Users choosing simple passwords",
      likelihood: "high",
      impact: "medium",
    },
    {
      id: "r4",
      name: "Physical Security",
      description: "Unauthorized access to facilities",
      likelihood: "low",
      impact: "low",
    },
  ];

  beforeEach(() => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with default title", () => {
      render(<RiskMatrix risks={defaultRisks} />);
      
      expect(screen.getByText("Risk Assessment Matrix")).toBeInTheDocument();
    });

    it("should render with custom title", () => {
      render(<RiskMatrix risks={defaultRisks} title="Security Risk Analysis" />);
      
      expect(screen.getByText("Security Risk Analysis")).toBeInTheDocument();
    });

    it("should render SVG matrix", () => {
      const { container } = render(<RiskMatrix risks={defaultRisks} />);
      
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      // Skip: happy-dom doesn't preserve SVG role attribute
      // expect(svg).toHaveAttribute("role", "img");
    });

    it("should render all risk dots", () => {
      render(<RiskMatrix risks={defaultRisks} />);
      
      const dots = screen.getAllByRole("button").filter(
        (el) => el.tagName.toLowerCase() === "circle"
      );
      expect(dots.length).toBeGreaterThanOrEqual(4);
    });

    it("should show legend by default", () => {
      render(<RiskMatrix risks={defaultRisks} />);
      
      expect(screen.getByText("Risk Levels")).toBeInTheDocument();
      expect(screen.getByText("Low Risk")).toBeInTheDocument();
      expect(screen.getByText("Medium Risk")).toBeInTheDocument();
      expect(screen.getByText("High Risk")).toBeInTheDocument();
      expect(screen.getByText("Critical Risk")).toBeInTheDocument();
    });

    it("should hide legend when showLegend is false", () => {
      render(<RiskMatrix risks={defaultRisks} showLegend={false} />);
      
      expect(screen.queryByText("Risk Levels")).not.toBeInTheDocument();
    });

    it("should show export buttons by default", () => {
      render(<RiskMatrix risks={defaultRisks} />);
      
      expect(screen.getByRole("button", { name: /PNG/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /SVG/ })).toBeInTheDocument();
    });

    it("should hide export buttons when showExport is false", () => {
      render(<RiskMatrix risks={defaultRisks} showExport={false} />);
      
      expect(screen.queryByRole("button", { name: /PNG/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /SVG/ })).not.toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <RiskMatrix risks={defaultRisks} className="custom-matrix" />
      );
      
      expect(container.querySelector(".custom-matrix")).toBeInTheDocument();
    });
  });

  describe("Risk Positioning", () => {
    it("should plot risks at correct positions", () => {
      const { container } = render(<RiskMatrix risks={defaultRisks} />);
      
      const circles = container.querySelectorAll("circle.risk-dot");
      expect(circles).toHaveLength(4);
    });

    it("should handle all risk level combinations", () => {
      const allLevelRisks: RiskItem[] = [
        { id: "1", name: "Low-Low", likelihood: "low", impact: "low" },
        { id: "2", name: "Low-Critical", likelihood: "low", impact: "critical" },
        { id: "3", name: "Critical-Low", likelihood: "critical", impact: "low" },
        { id: "4", name: "Critical-Critical", likelihood: "critical", impact: "critical" },
      ];

      const { container } = render(<RiskMatrix risks={allLevelRisks} />);
      
      const circles = container.querySelectorAll("circle.risk-dot");
      expect(circles).toHaveLength(4);
    });
  });

  describe("Interactive Features", () => {
    it("should be interactive by default", () => {
      const { container } = render(<RiskMatrix risks={defaultRisks} />);
      
      const firstDot = container.querySelector("circle.risk-dot");
      expect(firstDot).toHaveAttribute("role", "button");
      expect(firstDot).toHaveAttribute("tabindex", "0");
    });

    it("should open dialog when risk dot is clicked", async () => {
      const { container } = render(<RiskMatrix risks={defaultRisks} />);
      
      const firstDot = container.querySelector("circle.risk-dot");
      fireEvent.click(firstDot!);
      
      await waitFor(() => {
        // Check for dialog-specific content (not SVG title)
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText(/Unvalidated user input/)).toBeInTheDocument();
      });
    });

    it("should show risk details in dialog", async () => {
      const { container } = render(<RiskMatrix risks={defaultRisks} />);
      
      const firstDot = container.querySelector("circle.risk-dot");
      fireEvent.click(firstDot!);
      
      await waitFor(() => {
        expect(screen.getByText("Likelihood:")).toBeInTheDocument();
        expect(screen.getByText("high")).toBeInTheDocument();
        expect(screen.getByText("Impact:")).toBeInTheDocument();
        expect(screen.getByText("critical")).toBeInTheDocument();
      });
    });

    it("should close dialog when dismissed", async () => {
      const { container } = render(<RiskMatrix risks={defaultRisks} />);
      
      const firstDot = container.querySelector("circle.risk-dot");
      fireEvent.click(firstDot!);
      
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
      
      // Close dialog by clicking overlay or close button
      const dialog = screen.getByRole("dialog");
      fireEvent.keyDown(dialog, { key: "Escape" });
      
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("should support keyboard navigation on risk dots", async () => {
      const { container } = render(<RiskMatrix risks={defaultRisks} />);
      
      const firstDot = container.querySelector("circle.risk-dot") as SVGCircleElement;
      firstDot.focus();
      fireEvent.keyDown(firstDot, { key: "Enter" });
      
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("should support Space key on risk dots", async () => {
      const { container } = render(<RiskMatrix risks={defaultRisks} />);
      
      const firstDot = container.querySelector("circle.risk-dot") as SVGCircleElement;
      firstDot.focus();
      fireEvent.keyDown(firstDot, { key: " " });
      
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("should not be interactive when interactive is false", () => {
      const { container } = render(
        <RiskMatrix risks={defaultRisks} interactive={false} />
      );
      
      const firstDot = container.querySelector("circle.risk-dot");
      expect(firstDot).not.toHaveAttribute("role", "button");
      expect(firstDot).toHaveAttribute("tabindex", "-1");
    });
  });

  describe("Export Functionality", () => {
    it("should have disabled PNG export button", () => {
      render(<RiskMatrix risks={defaultRisks} />);
      
      const pngButton = screen.getByRole("button", { name: /PNG/ });
      expect(pngButton).toBeDisabled();
    });

    it("should trigger SVG export on button click", () => {
      // Mock document.createElement and appendChild/removeChild
      const mockLink = document.createElement("a");
      const createElementSpy = vi.spyOn(document, "createElement").mockReturnValue(mockLink);
      const appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation(() => mockLink);
      const removeChildSpy = vi.spyOn(document.body, "removeChild").mockImplementation(() => mockLink);
      const clickSpy = vi.spyOn(mockLink, "click").mockImplementation(() => {});

      render(<RiskMatrix risks={defaultRisks} />);
      
      const svgButton = screen.getByRole("button", { name: /SVG/ });
      fireEvent.click(svgButton);
      
      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(appendChildSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      clickSpy.mockRestore();
    });

    it("should generate SVG with correct filename", () => {
      const mockLink = document.createElement("a");
      vi.spyOn(document, "createElement").mockReturnValue(mockLink);
      vi.spyOn(document.body, "appendChild").mockImplementation(() => mockLink);
      vi.spyOn(document.body, "removeChild").mockImplementation(() => mockLink);
      vi.spyOn(mockLink, "click").mockImplementation(() => {});

      render(<RiskMatrix risks={defaultRisks} />);
      
      const svgButton = screen.getByRole("button", { name: /SVG/ });
      fireEvent.click(svgButton);
      
      expect(mockLink.download).toMatch(/^risk-matrix-\d{4}-\d{2}-\d{2}\.svg$/);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels on SVG", () => {
      const { container } = render(<RiskMatrix risks={defaultRisks} />);
      
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("role", "img");
      expect(svg).toHaveAttribute("aria-label", "Risk assessment matrix visualization");
    });

    it("should have descriptive ARIA labels on risk dots", () => {
      const { container } = render(<RiskMatrix risks={defaultRisks} />);
      
      const firstDot = container.querySelector("circle.risk-dot");
      const ariaLabel = firstDot?.getAttribute("aria-label");
      
      expect(ariaLabel).toContain("SQL Injection");
      expect(ariaLabel).toContain("likelihood");
      expect(ariaLabel).toContain("impact");
    });

    it("should support keyboard focus on interactive elements", () => {
      const { container } = render(<RiskMatrix risks={defaultRisks} />);
      
      const dots = container.querySelectorAll("circle.risk-dot");
      dots.forEach((dot) => {
        expect(dot).toHaveAttribute("tabindex", "0");
      });
    });

    it("should show tooltips on SVG hover (title element)", () => {
      const { container } = render(<RiskMatrix risks={defaultRisks} />);
      
      const titles = container.querySelectorAll("g > title");
      expect(titles.length).toBeGreaterThan(0);
      expect(titles[0].textContent).toBe("SQL Injection");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty risks array", () => {
      const { container } = render(<RiskMatrix risks={[]} />);
      
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      
      const dots = container.querySelectorAll("circle.risk-dot");
      expect(dots).toHaveLength(0);
    });

    it("should handle single risk", () => {
      const singleRisk: RiskItem[] = [
        {
          id: "r1",
          name: "Test Risk",
          likelihood: "medium",
          impact: "medium",
        },
      ];

      const { container } = render(<RiskMatrix risks={singleRisk} />);
      
      const dots = container.querySelectorAll("circle.risk-dot");
      expect(dots).toHaveLength(1);
    });

    it("should handle risks without descriptions", () => {
      const risksNoDesc: RiskItem[] = [
        {
          id: "r1",
          name: "Risk Without Description",
          likelihood: "high",
          impact: "low",
        },
      ];

      const { container } = render(<RiskMatrix risks={risksNoDesc} />);
      
      const firstDot = container.querySelector("circle.risk-dot");
      fireEvent.click(firstDot!);
      
      // Dialog should still open
      expect(screen.getByText("Risk Without Description")).toBeInTheDocument();
    });

    it("should handle many risks (overlapping dots)", () => {
      const manyRisks: RiskItem[] = Array.from({ length: 20 }, (_, i) => ({
        id: `r${i}`,
        name: `Risk ${i}`,
        likelihood: ["low", "medium", "high", "critical"][i % 4] as any,
        impact: ["low", "medium", "high", "critical"][Math.floor(i / 4) % 4] as any,
      }));

      const { container } = render(<RiskMatrix risks={manyRisks} />);
      
      const dots = container.querySelectorAll("circle.risk-dot");
      expect(dots.length).toBe(20);
    });

    it("should handle very long risk names", () => {
      const longNameRisks: RiskItem[] = [
        {
          id: "r1",
          name: "This is a very long risk name that should still be handled correctly in the visualization and dialog".repeat(2),
          likelihood: "high",
          impact: "high",
        },
      ];

      const { container } = render(<RiskMatrix risks={longNameRisks} />);
      
      const firstDot = container.querySelector("circle.risk-dot");
      fireEvent.click(firstDot!);
      
      expect(screen.getByText(/This is a very long risk name/)).toBeInTheDocument();
    });
  });

  describe("Visual Rendering", () => {
    it("should render 4x4 grid cells", () => {
      const { container } = render(<RiskMatrix risks={defaultRisks} />);
      
      const gridCells = container.querySelectorAll("rect");
      expect(gridCells.length).toBeGreaterThanOrEqual(16); // 4x4 grid
    });

    it("should render axis labels", () => {
      render(<RiskMatrix risks={defaultRisks} />);
      
      expect(screen.getByText(/Likelihood/)).toBeInTheDocument();
      expect(screen.getByText(/Impact/)).toBeInTheDocument();
    });

    it("should render tick labels for all levels", () => {
      render(<RiskMatrix risks={defaultRisks} />);
      
      const labels = screen.getAllByText("Low");
      expect(labels.length).toBeGreaterThanOrEqual(2); // X and Y axes
      
      expect(screen.getAllByText("Medium").length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText("High").length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText("Critical").length).toBeGreaterThanOrEqual(2);
    });
  });
});
