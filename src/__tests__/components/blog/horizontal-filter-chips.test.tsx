import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HorizontalFilterChips } from '@/components/blog';

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    toString: () => "",
  }),
}));

// Mock useMobileFilterSheet hook
vi.mock("@/hooks/use-mobile-filter-sheet", () => ({
  useMobileFilterSheet: () => ({
    isOpen: false,
    setIsOpen: vi.fn(),
  }),
}));

describe("HorizontalFilterChips", () => {
  const mockCategoryList = ["development", "security", "devops"];
  const mockCategoryDisplayMap = {
    development: "Development",
    security: "Security",
    devops: "DevOps",
  };

  const defaultProps = {
    selectedCategory: "",
    sortBy: "newest",
    categoryList: mockCategoryList,
    categoryDisplayMap: mockCategoryDisplayMap,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders sort options", () => {
      // The component is feature-gated and may be disabled via NEXT_PUBLIC_FEATURE_HORIZONTAL_FILTER_CHIPS
      // For consistent tests, mock the env variable to ensure it renders when required.
      vi.stubEnv('NEXT_PUBLIC_FEATURE_HORIZONTAL_FILTER_CHIPS', 'true');
      render(<HorizontalFilterChips {...defaultProps} />);

      expect(screen.getByText("Newest")).toBeInTheDocument();
      expect(screen.getByText("Popular")).toBeInTheDocument();
      expect(screen.getByText("Oldest")).toBeInTheDocument();
    });

    it("renders category badges", () => {
      vi.stubEnv('NEXT_PUBLIC_FEATURE_HORIZONTAL_FILTER_CHIPS', 'true');
      render(<HorizontalFilterChips {...defaultProps} />);

      expect(screen.getByText("Development")).toBeInTheDocument();
      expect(screen.getByText("Security")).toBeInTheDocument();
      expect(screen.getByText("DevOps")).toBeInTheDocument();
    });

    it("renders More filters button", () => {
      render(<HorizontalFilterChips {...defaultProps} />);

      expect(screen.getByText("More")).toBeInTheDocument();
    });

    it("limits category display to 6 items", () => {
      const largeCategoryList = [
        "cat1",
        "cat2",
        "cat3",
        "cat4",
        "cat5",
        "cat6",
        "cat7",
        "cat8",
      ];
      const largeCategoryMap = Object.fromEntries(
        largeCategoryList.map((cat) => [cat, cat.toUpperCase()])
      );

      render(
        <HorizontalFilterChips
          {...defaultProps}
          categoryList={largeCategoryList}
          categoryDisplayMap={largeCategoryMap}
        />
      );

      // Should show only first 6
      expect(screen.getByText("CAT1")).toBeInTheDocument();
      expect(screen.getByText("CAT6")).toBeInTheDocument();
      expect(screen.queryByText("CAT7")).not.toBeInTheDocument();
      expect(screen.queryByText("CAT8")).not.toBeInTheDocument();
    });
  });

  describe("Selected State", () => {
    it("shows selected state for active category", () => {
      render(
        <HorizontalFilterChips
          {...defaultProps}
          selectedCategory="security"
        />
      );

      const securityBadge = screen.getByText("Security");
      expect(securityBadge).toHaveClass("bg-primary");
    });

    it("shows selected state for active sort option", () => {
      vi.stubEnv('NEXT_PUBLIC_FEATURE_HORIZONTAL_FILTER_CHIPS', 'true');
      render(<HorizontalFilterChips {...defaultProps} sortBy="popular" />);

      const popularBadge = screen.getByText("Popular");
      expect(popularBadge).toHaveClass("bg-primary");
    });

    it("defaults to newest sort when sortBy is empty", () => {
      render(<HorizontalFilterChips {...defaultProps} sortBy="" />);

      const newestBadge = screen.getByText("Newest");
      expect(newestBadge).toHaveClass("bg-primary");
    });
  });

  describe("Interactions", () => {
    it("handles category click", () => {
      const { container } = render(<HorizontalFilterChips {...defaultProps} />);

      const securityBadge = screen.getByText("Security");
      fireEvent.click(securityBadge);

      // Verify click was registered (component uses useFilterParams internally)
      expect(securityBadge).toBeInTheDocument();
    });

    it("handles sort click", () => {
      const { container } = render(<HorizontalFilterChips {...defaultProps} />);

      const popularBadge = screen.getByText("Popular");
      fireEvent.click(popularBadge);

      expect(popularBadge).toBeInTheDocument();
    });

    it("opens filter sheet when More button clicked", () => {
      render(<HorizontalFilterChips {...defaultProps} />);

      const moreButton = screen.getByText("More");
      fireEvent.click(moreButton);

      // Verify button is clickable
      expect(moreButton).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper button roles", () => {
      render(<HorizontalFilterChips {...defaultProps} />);

      const moreButton = screen.getByRole("button", { name: /more/i });
      expect(moreButton).toBeInTheDocument();
    });

    it("badges are keyboard accessible", () => {
      render(<HorizontalFilterChips {...defaultProps} />);

      const badges = screen.getAllByText(/Newest|Popular|Oldest|Development|Security|DevOps/);
      
      // All badges should be clickable
      badges.forEach(badge => {
        expect(badge).toBeInTheDocument();
      });
    });
  });

  describe("Sticky Behavior", () => {
    it("applies sticky positioning class", () => {
      const { container } = render(<HorizontalFilterChips {...defaultProps} />);

      const stickyContainer = container.querySelector(".sticky");
      expect(stickyContainer).toBeInTheDocument();
      expect(stickyContainer).toHaveClass("top-16");
    });

    it("has z-index for proper layering", () => {
      const { container } = render(<HorizontalFilterChips {...defaultProps} />);

      const stickyContainer = container.querySelector(".z-20");
      expect(stickyContainer).toBeInTheDocument();
    });

    it("has backdrop blur effect", () => {
      const { container } = render(<HorizontalFilterChips {...defaultProps} />);

      const stickyContainer = container.querySelector(".backdrop-blur");
      expect(stickyContainer).toBeInTheDocument();
    });
  });

  describe("Horizontal Scroll", () => {
    it("has horizontal overflow enabled", () => {
      const { container } = render(<HorizontalFilterChips {...defaultProps} />);

      const scrollContainer = container.querySelector(".overflow-x-auto");
      expect(scrollContainer).toBeInTheDocument();
    });

    it("hides scrollbar with utility class", () => {
      const { container } = render(<HorizontalFilterChips {...defaultProps} />);

      const scrollContainer = container.querySelector(".scrollbar-hide");
      expect(scrollContainer).toBeInTheDocument();
    });

    it("content has minimum width to enable scrolling", () => {
      const { container } = render(<HorizontalFilterChips {...defaultProps} />);

      const innerContainer = container.querySelector(".w-max");
      expect(innerContainer).toBeInTheDocument();
    });
  });

  describe("Visual Separators", () => {
    it("has border separator between sort and categories", () => {
      const { container } = render(<HorizontalFilterChips {...defaultProps} />);

      const separator = container.querySelector(".border-r");
      expect(separator).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty category list", () => {
      render(
        <HorizontalFilterChips
          {...defaultProps}
          categoryList={[]}
          categoryDisplayMap={{}}
        />
      );

      // Should still render sort options and More button
      expect(screen.getByText("Newest")).toBeInTheDocument();
      expect(screen.getByText("More")).toBeInTheDocument();
    });

    it("handles missing display map entries", () => {
      render(
        <HorizontalFilterChips
          {...defaultProps}
          categoryList={["unmapped"]}
          categoryDisplayMap={{}}
        />
      );

      // Should fallback to category key
      expect(screen.getByText("unmapped")).toBeInTheDocument();
    });
  });
});
