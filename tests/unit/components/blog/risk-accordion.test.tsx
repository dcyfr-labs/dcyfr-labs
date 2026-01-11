/**
 * Risk Accordion Component Tests
 *
 * Tests for interactive accordion features:
 * - Individual accordion expand/collapse
 * - Group "Expand All" / "Collapse All" buttons
 * - Progress counter ("X of Y risks reviewed")
 */

import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RiskAccordion, RiskAccordionGroup } from "@/components/blog";

describe("RiskAccordion", () => {
  describe("Individual Accordion", () => {
    it("should expand and collapse when clicked", async () => {
      const user = userEvent.setup();
      render(
        <RiskAccordion
          id="ASI01"
          title="Test Risk"
          severity="critical"
          summary="Test summary"
        >
          <div>Full content here</div>
        </RiskAccordion>
      );

      // Initially collapsed - content should not be visible
      expect(screen.queryByText("Full content here")).not.toBeInTheDocument();

      // Click to expand
      const button = screen.getByRole("button", { name: /Test Risk/i });
      await user.click(button);

      // Wait for animation to complete
      await waitFor(() => {
        expect(screen.getByText("Full content here")).toBeInTheDocument();
      });

      // Click again to collapse
      await user.click(button);

      // Wait for collapse animation
      await waitFor(() => {
        expect(screen.queryByText("Full content here")).not.toBeInTheDocument();
      });
    });
  });

  describe("RiskAccordionGroup", () => {
    it("should track expanded count correctly", async () => {
      const user = userEvent.setup();
      render(
        <RiskAccordionGroup>
          <RiskAccordion
            id="ASI01"
            title="Risk 1"
            severity="critical"
            summary="Summary 1"
          >
            Content 1
          </RiskAccordion>
          <RiskAccordion
            id="ASI02"
            title="Risk 2"
            severity="high"
            summary="Summary 2"
          >
            Content 2
          </RiskAccordion>
          <RiskAccordion
            id="ASI03"
            title="Risk 3"
            severity="medium"
            summary="Summary 3"
          >
            Content 3
          </RiskAccordion>
        </RiskAccordionGroup>
      );

      // Initially 0 of 3 expanded - look for text containing "reviewed"
      expect(screen.getByText(/reviewed/)).toBeInTheDocument();

      // Expand first risk
      const risk1Button = screen.getByRole("button", { name: /Risk 1/i });
      await user.click(risk1Button);

      // Should show 1 expanded
      await waitFor(() => {
        const groupControl = screen.getByText(/reviewed/).closest("div");
        expect(groupControl?.textContent).toMatch(/1.*of.*3/);
      });

      // Expand second risk
      const risk2Button = screen.getByRole("button", { name: /Risk 2/i });
      await user.click(risk2Button);

      // Should show 2 of 3
      await waitFor(() => {
        const groupControl = screen.getByText(/reviewed/).closest("div");
        expect(groupControl?.textContent).toMatch(/2.*of.*3/);
      });

      // Collapse first risk
      await user.click(risk1Button);

      // Should show 1 of 3
      await waitFor(() => {
        const groupControl = screen.getByText(/reviewed/).closest("div");
        expect(groupControl?.textContent).toMatch(/1.*of.*3/);
      });
    });

    it("should expand all accordions when Expand All is clicked", async () => {
      const user = userEvent.setup();
      render(
        <RiskAccordionGroup>
          <RiskAccordion
            id="ASI01"
            title="Risk 1"
            severity="critical"
            summary="Summary 1"
          >
            Content 1
          </RiskAccordion>
          <RiskAccordion
            id="ASI02"
            title="Risk 2"
            severity="high"
            summary="Summary 2"
          >
            Content 2
          </RiskAccordion>
          <RiskAccordion
            id="ASI03"
            title="Risk 3"
            severity="medium"
            summary="Summary 3"
          >
            Content 3
          </RiskAccordion>
        </RiskAccordionGroup>
      );

      // Initially all collapsed
      expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Content 2")).not.toBeInTheDocument();
      expect(screen.queryByText("Content 3")).not.toBeInTheDocument();

      // Click "Expand All"
      const expandAllButton = screen.getByRole("button", {
        name: /Expand All/i,
      });
      await user.click(expandAllButton);

      // Wait for all content to be visible
      await waitFor(() => {
        expect(screen.getByText("Content 1")).toBeInTheDocument();
        expect(screen.getByText("Content 2")).toBeInTheDocument();
        expect(screen.getByText("Content 3")).toBeInTheDocument();
      });

      // Counter should show 3 of 3
      const groupControl = screen.getByText(/reviewed/).closest("div");
      expect(groupControl?.textContent).toMatch(/3.*of.*3/);
    });

    it("should collapse all accordions when Collapse All is clicked", async () => {
      const user = userEvent.setup();
      render(
        <RiskAccordionGroup>
          <RiskAccordion
            id="ASI01"
            title="Risk 1"
            severity="critical"
            summary="Summary 1"
          >
            Content 1
          </RiskAccordion>
          <RiskAccordion
            id="ASI02"
            title="Risk 2"
            severity="high"
            summary="Summary 2"
          >
            Content 2
          </RiskAccordion>
        </RiskAccordionGroup>
      );

      // Expand all first
      const expandAllButton = screen.getByRole("button", {
        name: /Expand All/i,
      });
      await user.click(expandAllButton);

      // Wait for content to be visible
      await waitFor(() => {
        expect(screen.getByText("Content 1")).toBeInTheDocument();
        expect(screen.getByText("Content 2")).toBeInTheDocument();
      });

      // Click "Collapse All"
      const collapseAllButton = screen.getByRole("button", {
        name: /Collapse All/i,
      });
      await user.click(collapseAllButton);

      // Wait for all content to be hidden
      await waitFor(() => {
        expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
        expect(screen.queryByText("Content 2")).not.toBeInTheDocument();
      });

      // Counter should show 0 of 2
      const groupControl = screen.getByText(/reviewed/).closest("div");
      expect(groupControl?.textContent).toMatch(/0.*of.*2/);
    });
  });
});
