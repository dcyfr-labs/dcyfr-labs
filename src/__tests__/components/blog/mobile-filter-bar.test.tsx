import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileFilterBar } from "@/components/blog/filters/mobile-filter-bar";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock BlogFilters so we don't rely on internal implementations
vi.mock("@/components/blog/filters/blog-filters", async () => {
  return {
    BlogFilters: ({ query }: { query?: string }) => <div data-testid="blog-filters">BlogFilters - {query}</div>
  };
});

describe("MobileFilterBar (sheet)", () => {
  const defaultProps = {
    selectedCategory: "",
    selectedTags: [],
    readingTime: null,
    categoryList: ["infra", "devops"],
    categoryDisplayMap: { infra: "Infrastructure", devops: "DevOps" },
    tagList: ["web", "security"],
    query: "",
    sortBy: "newest",
    dateRange: "all",
    totalResults: 5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the trigger and shows active badges when filters applied", () => {
    render(<MobileFilterBar {...defaultProps} selectedTags={["web"]} />);
    // The trigger should render
    const triggerButton = screen.getByRole("button", { name: /filters/i });
    expect(triggerButton).toBeInTheDocument();

    // Active badges should be visible
    expect(screen.getByText(/web/i)).toBeInTheDocument();
  });

  it("opens sheet on trigger click and renders BlogFilters", () => {
    render(<MobileFilterBar {...defaultProps} />);
    const triggerButton = screen.getByRole("button", { name: /filter & search|filters/i });
    fireEvent.click(triggerButton);
    expect(screen.getByTestId("blog-filters")).toBeInTheDocument();
  });

  it("clear button clears filters by navigating to /blog and closes sheet", () => {
    render(<MobileFilterBar {...defaultProps} selectedTags={["web"]} />);
    const clearButton = screen.getAllByRole("button").find(btn => btn.textContent?.includes("Clear"));
    expect(clearButton).toBeDefined();
    fireEvent.click(clearButton!);
    expect(mockPush).toHaveBeenCalledWith("/blog", { scroll: false });
  });
});
