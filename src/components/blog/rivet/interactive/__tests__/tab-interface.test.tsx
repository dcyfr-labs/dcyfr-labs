import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TabInterface, type TabItem } from "../tab-interface";

describe("TabInterface", () => {
  const defaultTabs: TabItem[] = [
    {
      id: "overview",
      label: "Overview",
      content: <div>Overview content goes here</div>,
    },
    {
      id: "details",
      label: "Details",
      content: <div>Detailed information</div>,
    },
    {
      id: "settings",
      label: "Settings",
      content: <div>Settings panel</div>,
    },
  ];

  beforeEach(() => {
    // Clear location hash
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname);
    }

    // Mock gtag
    (window as any).gtag = vi.fn();
  });

  describe("Rendering", () => {
    it("should render with default first tab active", () => {
      render(<TabInterface tabs={defaultTabs} />);

      expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
      expect(screen.getByText("Overview content goes here")).toBeVisible();
    });

    it("should render with custom default tab", () => {
      render(<TabInterface tabs={defaultTabs} defaultTab="details" />);

      expect(screen.getByRole("tab", { name: "Details" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
      expect(screen.getByText("Detailed information")).toBeVisible();
    });

    it("should render all tab labels", () => {
      render(<TabInterface tabs={defaultTabs} />);

      expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Details" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Settings" })).toBeInTheDocument();
    });

    it("should render tab with icon", () => {
      const tabsWithIcon: TabItem[] = [
        {
          id: "home",
          label: "Home",
          icon: <span data-testid="home-icon">🏠</span>,
          content: <div>Home content</div>,
        },
      ];

      render(<TabInterface tabs={tabsWithIcon} />);

      expect(screen.getByTestId("home-icon")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <TabInterface tabs={defaultTabs} className="custom-class" />
      );

      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("should render with default variant", () => {
      const { container } = render(
        <TabInterface tabs={defaultTabs} variant="default" />
      );

      const tablist = container.querySelector('[role="tablist"]');
      expect(tablist).toHaveClass("border-b");
    });

    it("should render with pills variant", () => {
      const { container } = render(
        <TabInterface tabs={defaultTabs} variant="pills" />
      );

      const tablist = container.querySelector('[role="tablist"]');
      expect(tablist).toHaveClass("bg-muted/50");
    });

    it("should render with underline variant", () => {
      const { container } = render(
        <TabInterface tabs={defaultTabs} variant="underline" />
      );

      const tablist = container.querySelector('[role="tablist"]');
      expect(tablist).toHaveClass("border-b-2");
    });
  });

  describe("Tab Switching", () => {
    it("should switch tabs on click", async () => {
      render(<TabInterface tabs={defaultTabs} />);

      const detailsTab = screen.getByRole("tab", { name: "Details" });
      fireEvent.click(detailsTab);

      await waitFor(() => {
        expect(detailsTab).toHaveAttribute("aria-selected", "true");
        expect(screen.getByText("Detailed information")).toBeVisible();
      });
    });

    it("should hide inactive tab content", () => {
      const { container } = render(<TabInterface tabs={defaultTabs} />);

      const detailsTab = screen.getByRole("tab", { name: "Details" });
      fireEvent.click(detailsTab);

      const overviewPanel = container.querySelector("#panel-overview");
      expect(overviewPanel).toHaveAttribute("hidden");
    });

    it("should call onTabChange callback", () => {
      const onTabChange = vi.fn();
      render(<TabInterface tabs={defaultTabs} onTabChange={onTabChange} />);

      const detailsTab = screen.getByRole("tab", { name: "Details" });
      fireEvent.click(detailsTab);

      expect(onTabChange).toHaveBeenCalledWith("details");
    });

    it("should track analytics event on tab change", () => {
      render(<TabInterface tabs={defaultTabs} />);

      const detailsTab = screen.getByRole("tab", { name: "Details" });
      fireEvent.click(detailsTab);

      expect((window as any).gtag).toHaveBeenCalledWith("event", "tab_change", {
        event_category: "engagement",
        event_label: "details",
      });
    });
  });

  describe("URL Hash Sync", () => {
    it("should sync with URL hash on mount", () => {
      window.location.hash = "#details";
      render(<TabInterface tabs={defaultTabs} syncWithUrl />);

      expect(screen.getByRole("tab", { name: "Details" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });

    it("should update URL hash on tab change", async () => {
      render(<TabInterface tabs={defaultTabs} syncWithUrl />);

      const settingsTab = screen.getByRole("tab", { name: "Settings" });
      fireEvent.click(settingsTab);

      await waitFor(() => {
        expect(window.location.hash).toBe("#settings");
      });
    });

    it("should not sync URL when syncWithUrl is false", () => {
      render(<TabInterface tabs={defaultTabs} syncWithUrl={false} />);

      const detailsTab = screen.getByRole("tab", { name: "Details" });
      fireEvent.click(detailsTab);

      expect(window.location.hash).toBe("");
    });

    it("should ignore invalid hash on mount", () => {
      window.location.hash = "#nonexistent";
      render(<TabInterface tabs={defaultTabs} syncWithUrl />);

      // Should fall back to first tab
      expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });
  });

  describe("Keyboard Navigation", () => {
    it("should navigate with ArrowRight", () => {
      render(<TabInterface tabs={defaultTabs} />);

      const overviewTab = screen.getByRole("tab", { name: "Overview" });
      overviewTab.focus();
      fireEvent.keyDown(overviewTab, { key: "ArrowRight" });

      expect(screen.getByRole("tab", { name: "Details" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });

    it("should navigate with ArrowLeft", () => {
      render(<TabInterface tabs={defaultTabs} defaultTab="details" />);

      const detailsTab = screen.getByRole("tab", { name: "Details" });
      detailsTab.focus();
      fireEvent.keyDown(detailsTab, { key: "ArrowLeft" });

      expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });

    it("should wrap to last tab with ArrowLeft on first tab", () => {
      render(<TabInterface tabs={defaultTabs} />);

      const overviewTab = screen.getByRole("tab", { name: "Overview" });
      overviewTab.focus();
      fireEvent.keyDown(overviewTab, { key: "ArrowLeft" });

      expect(screen.getByRole("tab", { name: "Settings" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });

    it("should wrap to first tab with ArrowRight on last tab", () => {
      render(<TabInterface tabs={defaultTabs} defaultTab="settings" />);

      const settingsTab = screen.getByRole("tab", { name: "Settings" });
      settingsTab.focus();
      fireEvent.keyDown(settingsTab, { key: "ArrowRight" });

      expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });

    it("should jump to first tab with Home key", () => {
      render(<TabInterface tabs={defaultTabs} defaultTab="settings" />);

      const settingsTab = screen.getByRole("tab", { name: "Settings" });
      settingsTab.focus();
      fireEvent.keyDown(settingsTab, { key: "Home" });

      expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });

    it("should jump to last tab with End key", () => {
      render(<TabInterface tabs={defaultTabs} />);

      const overviewTab = screen.getByRole("tab", { name: "Overview" });
      overviewTab.focus();
      fireEvent.keyDown(overviewTab, { key: "End" });

      expect(screen.getByRole("tab", { name: "Settings" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes on tablist", () => {
      render(<TabInterface tabs={defaultTabs} />);

      const tablist = screen.getByRole("tablist");
      expect(tablist).toHaveAttribute("aria-label", "Content tabs");
    });

    it("should have proper ARIA attributes on tabs", () => {
      render(<TabInterface tabs={defaultTabs} />);

      const overviewTab = screen.getByRole("tab", { name: "Overview" });
      expect(overviewTab).toHaveAttribute("id", "tab-overview");
      expect(overviewTab).toHaveAttribute("aria-controls", "panel-overview");
      expect(overviewTab).toHaveAttribute("aria-selected", "true");
      expect(overviewTab).toHaveAttribute("tabindex", "0");
    });

    it("should have proper ARIA attributes on tabpanels", () => {
      render(<TabInterface tabs={defaultTabs} />);

      const overviewPanel = screen.getByRole("tabpanel", { name: "Overview" });
      expect(overviewPanel).toHaveAttribute("id", "panel-overview");
      expect(overviewPanel).toHaveAttribute("aria-labelledby", "tab-overview");
      expect(overviewPanel).toHaveAttribute("tabindex", "0");
    });

    it("should set tabindex -1 on inactive tabs", () => {
      render(<TabInterface tabs={defaultTabs} />);

      const detailsTab = screen.getByRole("tab", { name: "Details" });
      expect(detailsTab).toHaveAttribute("tabindex", "-1");
    });
  });

  describe("Edge Cases", () => {
    it("should handle single tab", () => {
      const singleTab: TabItem[] = [
        { id: "only", label: "Only Tab", content: <div>Single content</div> },
      ];

      render(<TabInterface tabs={singleTab} />);

      expect(screen.getByRole("tab", { name: "Only Tab" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
      expect(screen.getByText("Single content")).toBeVisible();
    });

    it("should handle many tabs", () => {
      const manyTabs: TabItem[] = Array.from({ length: 10 }, (_, i) => ({
        id: `tab-${i}`,
        label: `Tab ${i + 1}`,
        content: <div>Content {i + 1}</div>,
      }));

      render(<TabInterface tabs={manyTabs} />);

      expect(screen.getAllByRole("tab")).toHaveLength(10);
    });

    it("should handle empty content", () => {
      const emptyContentTab: TabItem[] = [
        { id: "empty", label: "Empty", content: null },
      ];

      render(<TabInterface tabs={emptyContentTab} />);

      const panel = screen.getByRole("tabpanel");
      expect(panel).toBeInTheDocument();
    });

    it("should handle complex React content", () => {
      const complexTab: TabItem[] = [
        {
          id: "complex",
          label: "Complex",
          content: (
            <div>
              <h3>Title</h3>
              <p>Paragraph</p>
              <button>Action</button>
            </div>
          ),
        },
      ];

      render(<TabInterface tabs={complexTab} />);

      expect(screen.getByRole("heading", { name: "Title" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
    });
  });
});
