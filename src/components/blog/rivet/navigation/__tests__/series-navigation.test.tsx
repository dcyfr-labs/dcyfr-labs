import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SeriesNavigation, type SeriesItem } from "../series-navigation";

describe("SeriesNavigation", () => {
  const defaultSeries: SeriesItem[] = [
    {
      id: "1",
      title: "Part 1: Introduction",
      slug: "part-1-introduction",
      isCompleted: true,
    },
    {
      id: "2",
      title: "Part 2: Getting Started",
      slug: "part-2-getting-started",
      isCompleted: false,
    },
    {
      id: "3",
      title: "Part 3: Advanced Topics",
      slug: "part-3-advanced-topics",
      isCompleted: false,
    },
  ];

  describe("Rendering", () => {
    it("should render series title", () => {
      render(
        <SeriesNavigation
          seriesTitle="Complete Guide"
          currentSlug="part-2-getting-started"
          items={defaultSeries}
        />
      );

      expect(screen.getByText("Complete Guide")).toBeInTheDocument();
    });

    it("should show current part indicator", () => {
      render(
        <SeriesNavigation
          seriesTitle="Complete Guide"
          currentSlug="part-2-getting-started"
          items={defaultSeries}
        />
      );

      expect(screen.getByText("Part 2 of 3")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <SeriesNavigation
          seriesTitle="Complete Guide"
          currentSlug="part-2-getting-started"
          items={defaultSeries}
          className="custom-class"
        />
      );

      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  describe("Progress Bar", () => {
    it("should display progress count", () => {
      render(
        <SeriesNavigation
          seriesTitle="Complete Guide"
          currentSlug="part-2-getting-started"
          items={defaultSeries}
        />
      );

      expect(screen.getByText("1/3 completed")).toBeInTheDocument();
    });

    it("should render progress bar with correct percentage", () => {
      const { container } = render(
        <SeriesNavigation
          seriesTitle="Complete Guide"
          currentSlug="part-2-getting-started"
          items={defaultSeries}
        />
      );

      const progressBar = container.querySelector('[role="progressbar"]') as HTMLElement;
      // Check that width is approximately 33% (1 of 3 completed)
      const width = progressBar?.style.width;
      expect(width).toMatch(/33\./); // Matches "33.xxx%"
      expect(progressBar).toHaveAttribute("aria-valuenow", "1");
      expect(progressBar).toHaveAttribute("aria-valuemin", "0");
      expect(progressBar).toHaveAttribute("aria-valuemax", "3");
    });

    it("should show 0% progress when no items completed", () => {
      const incompleteSeries = defaultSeries.map((item) => ({
        ...item,
        isCompleted: false,
      }));

      const { container } = render(
        <SeriesNavigation
          seriesTitle="Complete Guide"
          currentSlug="part-1-introduction"
          items={incompleteSeries}
        />
      );

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveStyle({ width: "0%" });
    });

    it("should show 100% progress when all items completed", () => {
      const completeSeries = defaultSeries.map((item) => ({
        ...item,
        isCompleted: true,
      }));

      const { container } = render(
        <SeriesNavigation
          seriesTitle="Complete Guide"
          currentSlug="part-1-introduction"
          items={completeSeries}
        />
      );

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveStyle({ width: "100%" });
      expect(screen.getByText("3/3 completed")).toBeInTheDocument();
    });
  });

  describe("Previous/Next Navigation", () => {
    it("should show previous link when not on first item", () => {
      render(
        <SeriesNavigation
          seriesTitle="Complete Guide"
          currentSlug="part-2-getting-started"
          items={defaultSeries}
        />
      );

      const previousLink = screen.getByText("Part 1: Introduction").closest("a");
      expect(previousLink).toHaveAttribute("href", "/part-1-introduction");
    });

    it("should show next link when not on last item", () => {
      render(
        <SeriesNavigation
          seriesTitle="Complete Guide"
          currentSlug="part-2-getting-started"
          items={defaultSeries}
        />
      );

      const nextLink = screen.getByText("Part 3: Advanced Topics").closest("a");
      expect(nextLink).toHaveAttribute("href", "/part-3-advanced-topics");
    });

    it("should not show previous link on first item", () => {
      render(
        <SeriesNavigation
          seriesTitle="Complete Guide"
          currentSlug="part-1-introduction"
          items={defaultSeries}
        />
      );

      expect(screen.queryByText("Previous")).not.toBeInTheDocument();
    });

    it("should not show next link on last item", () => {
      render(
        <SeriesNavigation
          seriesTitle="Complete Guide"
          currentSlug="part-3-advanced-topics"
          items={defaultSeries}
        />
      );

      expect(screen.queryByText("Next")).not.toBeInTheDocument();
    });
  });

  describe("All Parts List", () => {
    it("should not show all parts by default", () => {
      render(
        <SeriesNavigation
          seriesTitle="Complete Guide"
          currentSlug="part-2-getting-started"
          items={defaultSeries}
        />
      );

      expect(screen.queryByText("All Parts")).not.toBeInTheDocument();
    });

    it("should show all parts when showAllParts is true", () => {
      render(
        <SeriesNavigation
          seriesTitle="Complete Guide"
          currentSlug="part-2-getting-started"
          items={defaultSeries}
          showAllParts
        />
      );

      expect(screen.getByText("All Parts")).toBeInTheDocument();
      expect(screen.getAllByRole("link")).toHaveLength(5); // 3 in list + 1 prev + 1 next
    });

    it("should highlight current item in all parts list", () => {
      render(
        <SeriesNavigation
          seriesTitle="Complete Guide"
          currentSlug="part-2-getting-started"
          items={defaultSeries}
          showAllParts
        />
      );

      const currentLink = screen
        .getByText("Part 2: Getting Started")
        .closest("a");
      expect(currentLink).toHaveAttribute("aria-current", "page");
    });

    it("should show completion status in all parts list", () => {
      const { container } = render(
        <SeriesNavigation
          seriesTitle="Complete Guide"
          currentSlug="part-2-getting-started"
          items={defaultSeries}
          showAllParts
        />
      );

      // First item is completed (green background)
      const completedBadge = container.querySelector(".bg-green-500");
      expect(completedBadge).toBeInTheDocument();
      expect(completedBadge).toHaveTextContent("1");
    });
  });

  describe("Accessibility", () => {
    it("should have accessible navigation landmark", () => {
      const { container } = render(
        <SeriesNavigation
          seriesTitle="Complete Guide"
          currentSlug="part-2-getting-started"
          items={defaultSeries}
        />
      );

      const nav = container.querySelector("nav");
      expect(nav).toHaveAttribute("aria-label", "Series navigation");
    });

    it("should have accessible progress bar", () => {
      const { container } = render(
        <SeriesNavigation
          seriesTitle="Complete Guide"
          currentSlug="part-2-getting-started"
          items={defaultSeries}
        />
      );

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute(
        "aria-label",
        "Series progress: 1 of 3 completed"
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle single-item series", () => {
      const singleItem: SeriesItem[] = [
        {
          id: "1",
          title: "Only Part",
          slug: "only-part",
          isCompleted: false,
        },
      ];

      render(
        <SeriesNavigation
          seriesTitle="Single Part Series"
          currentSlug="only-part"
          items={singleItem}
        />
      );

      expect(screen.getByText("Part 1 of 1")).toBeInTheDocument();
      expect(screen.queryByText("Previous")).not.toBeInTheDocument();
      expect(screen.queryByText("Next")).not.toBeInTheDocument();
    });

    it("should handle many items in series", () => {
      const manyItems: SeriesItem[] = Array.from({ length: 20 }, (_, i) => ({
        id: String(i + 1),
        title: `Part ${i + 1}`,
        slug: `part-${i + 1}`,
        isCompleted: i < 5,
      }));

      render(
        <SeriesNavigation
          seriesTitle="Long Series"
          currentSlug="part-10"
          items={manyItems}
          showAllParts
        />
      );

      expect(screen.getByText("Part 10 of 20")).toBeInTheDocument();
      expect(screen.getByText("5/20 completed")).toBeInTheDocument();
    });

    it("should handle very long titles", () => {
      const longTitleSeries: SeriesItem[] = [
        {
          id: "1",
          title:
            "Part 1: A Very Long Title That Should Be Truncated or Wrapped Properly in the UI Component",
          slug: "part-1",
          isCompleted: false,
        },
        {
          id: "2",
          title: "Part 2: Short",
          slug: "part-2",
          isCompleted: false,
        },
      ];

      render(
        <SeriesNavigation
          seriesTitle="Complete Guide"
          currentSlug="part-2"
          items={longTitleSeries}
        />
      );

      expect(
        screen.getByText(/A Very Long Title That Should Be Truncated/)
      ).toBeInTheDocument();
    });

    it("should handle missing current slug gracefully", () => {
      render(
        <SeriesNavigation
          seriesTitle="Complete Guide"
          currentSlug="nonexistent-slug"
          items={defaultSeries}
        />
      );

      // Should still render but without current part indicator
      expect(screen.getByText("Complete Guide")).toBeInTheDocument();
      expect(screen.queryByText(/Part \d+ of \d+/)).not.toBeInTheDocument();
    });
  });
});
