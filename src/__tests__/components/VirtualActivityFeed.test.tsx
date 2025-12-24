import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { VirtualActivityFeed } from "@/components/activity/VirtualActivityFeed";
import type { ActivityItem } from "@/lib/activity";

// Mock dependencies with return values
vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: () => ({
    getVirtualItems: () => [],
    getTotalSize: () => 0,
    scrollOffset: 0,
    measureElement: undefined,
  }),
}));

vi.mock("@/hooks/useScrollRestoration", () => ({
  useScrollRestoration: () => {},
}));

// Sample test data
const mockActivities: ActivityItem[] = [
  {
    id: "1",
    source: "blog",
    verb: "published",
    title: "Test Blog Post",
    timestamp: new Date("2025-01-01T12:00:00Z"),
    href: "/blog/test-post",
    meta: {
      readingTime: "5 min",
      tags: ["typescript", "react"],
    },
  },
  {
    id: "2",
    source: "project",
    verb: "launched",
    title: "Test Project",
    timestamp: new Date("2025-01-02T12:00:00Z"),
    href: "https://example.com",
    meta: {
      category: "web-app",
      status: "active",
    },
  },
  {
    id: "3",
    source: "analytics",
    verb: "reached",
    title: "1000 Visitors",
    timestamp: new Date("2025-01-03T12:00:00Z"),
    href: "/analytics",
    meta: {
      milestone: 1000,
      stats: {
        views: 1000,
      },
    },
  },
];

describe("VirtualActivityFeed", () => {
  describe("Loading & Empty States", () => {
    it("renders loading skeleton when isLoading is true", () => {
      const { container } = render(<VirtualActivityFeed items={[]} isLoading />);

      // Should not show empty state when loading
      expect(screen.queryByText("No recent activity")).not.toBeInTheDocument();
      expect(container).toBeTruthy();
    });

    it("renders empty state when no items", () => {
      render(<VirtualActivityFeed items={[]} />);
      expect(screen.getByText("No recent activity")).toBeInTheDocument();
    });

    it("renders custom empty message", () => {
      render(
        <VirtualActivityFeed
          items={[]}
          emptyMessage="Custom empty message"
        />
      );
      expect(screen.getByText("Custom empty message")).toBeInTheDocument();
    });
  });

  describe("Rendering", () => {
    it("renders with activities without crashing", () => {
      const { container } = render(
        <VirtualActivityFeed items={mockActivities} />
      );
      expect(container).toBeTruthy();
      expect(screen.queryByText("No recent activity")).not.toBeInTheDocument();
    });

    it("renders with groups", () => {
      const { container } = render(
        <VirtualActivityFeed items={mockActivities} showGroups />
      );
      expect(container).toBeTruthy();
    });

    it("renders without groups", () => {
      const { container } = render(
        <VirtualActivityFeed items={mockActivities} showGroups={false} />
      );
      expect(container).toBeTruthy();
    });
  });

  describe("Variants", () => {
    it("renders timeline variant", () => {
      const { container } = render(
        <VirtualActivityFeed items={mockActivities} variant="timeline" />
      );
      expect(container).toBeTruthy();
    });

    it("renders compact variant", () => {
      const { container } = render(
        <VirtualActivityFeed items={mockActivities} variant="compact" />
      );
      expect(container).toBeTruthy();
    });

    it("renders minimal variant", () => {
      const { container } = render(
        <VirtualActivityFeed items={mockActivities} variant="minimal" />
      );
      expect(container).toBeTruthy();
    });

    it("renders standard variant", () => {
      const { container } = render(
        <VirtualActivityFeed items={mockActivities} variant="standard" />
      );
      expect(container).toBeTruthy();
    });
  });

  describe("Infinite Scroll", () => {
    it("does not call onLoadMore when disabled", () => {
      const onLoadMore = vi.fn();
      render(
        <VirtualActivityFeed
          items={mockActivities}
          enableInfiniteScroll={false}
          onLoadMore={onLoadMore}
          hasMore
        />
      );
      expect(onLoadMore).not.toHaveBeenCalled();
    });

    it("renders loading indicator when isLoadingMore", () => {
      render(
        <VirtualActivityFeed
          items={mockActivities}
          enableInfiniteScroll
          hasMore
          isLoadingMore
        />
      );
      expect(screen.getByText("Loading more...")).toBeInTheDocument();
    });

    it("does not render loading indicator when not loading more", () => {
      render(
        <VirtualActivityFeed
          items={mockActivities}
          enableInfiniteScroll
          hasMore
          isLoadingMore={false}
        />
      );
      expect(screen.queryByText("Loading more...")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility & Performance", () => {
    it("renders with proper container structure", () => {
      const { container } = render(
        <VirtualActivityFeed items={mockActivities} />
      );
      const scrollContainer = container.querySelector(".overflow-auto");
      expect(scrollContainer).toBeInTheDocument();
    });

    it("uses contain: strict for performance", () => {
      const { container } = render(
        <VirtualActivityFeed items={mockActivities} />
      );
      const scrollContainer = container.querySelector(".overflow-auto");
      expect(scrollContainer).toHaveStyle({ contain: "strict" });
    });

    it("applies max-height to scrollable container", () => {
      const { container } = render(
        <VirtualActivityFeed items={mockActivities} />
      );
      const scrollContainer = container.querySelector(".overflow-auto");
      expect(scrollContainer).toHaveClass("max-h-[80vh]");
    });
  });
});
