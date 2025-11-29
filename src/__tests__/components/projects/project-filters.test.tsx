import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProjectFilters } from "@/components/projects/project-filters";
import type { ReadonlyURLSearchParams } from "next/navigation";

// Mock Next.js navigation
const mockPush = vi.fn();
let mockSearchParamsData: Record<string, string> = {};

const createMockSearchParams = (): ReadonlyURLSearchParams => {
  const params = new URLSearchParams(mockSearchParamsData);
  return params as unknown as ReadonlyURLSearchParams;
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => createMockSearchParams(),
}));

// Mock shared filter components
vi.mock("@/components/common/filters", async () => {
  const actual = await vi.importActual("@/components/common/filters");
  return {
    ...actual,
    FilterSearchInput: ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => (
      <input
        data-testid="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    ),
    FilterSelect: ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
      <select
        data-testid={`select-${value}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    ),
    FilterBadges: ({ items, selected, onToggle, displayMap, caseInsensitive }: { 
      items: string[]; 
      selected: string[]; 
      onToggle: (item: string) => void;
      displayMap?: Record<string, string>;
      caseInsensitive?: boolean;
    }) => {
      const isSelected = (item: string) => {
        if (caseInsensitive) {
          return selected.some((s) => s.toLowerCase() === item.toLowerCase());
        }
        return selected.includes(item);
      };
      const getLabel = (item: string) => displayMap?.[item] ?? item;
      return (
        <div data-testid="filter-badges">
          {items.map((item) => (
            <button
              key={item}
              data-testid={`badge-${item}`}
              data-selected={isSelected(item)}
              onClick={() => onToggle(item)}
            >
              {getLabel(item)}
            </button>
          ))}
        </div>
      );
    },
    FilterClearButton: ({ onClear, visible }: { onClear: () => void; visible: boolean }) =>
      visible ? (
        <button data-testid="clear-all-button" onClick={onClear}>
          Clear all
        </button>
      ) : null,
  };
});

// Helper to expand the collapsible filter section
const expandFilters = () => {
  const filtersButton = screen.getByRole("button", { name: /filters/i });
  fireEvent.click(filtersButton);
};

describe("ProjectFilters Component", () => {
  const defaultProps = {
    selectedCategory: "",
    selectedTags: [],
    status: null,
    categoryList: ["community", "nonprofit", "code", "startup"],
    categoryDisplayMap: {
      community: "Community",
      nonprofit: "Nonprofit",
      code: "Code",
      startup: "Startup",
    },
    tagList: ["web", "mobile", "api", "react", "nextjs", "typescript"],
    query: "",
    sortBy: "newest",
    totalResults: 10,
    hasActiveFilters: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsData = {};
  });

  describe("Rendering", () => {
    it("should render search input", () => {
      render(<ProjectFilters {...defaultProps} />);
      expect(screen.getByTestId("search-input")).toBeInTheDocument();
    });

    // Status and sort filters are temporarily disabled
    it.skip("should render status filter", () => {
      render(<ProjectFilters {...defaultProps} />);
      expect(screen.getByTestId("select-all")).toBeInTheDocument();
    });

    it.skip("should render sort filter", () => {
      render(<ProjectFilters {...defaultProps} />);
      expect(screen.getByTestId("select-newest")).toBeInTheDocument();
    });

    it("should render technology tags as badges", () => {
      render(<ProjectFilters {...defaultProps} />);
      expandFilters();
      // Tech items are now part of tags
      expect(screen.getByTestId("badge-react")).toBeInTheDocument();
      expect(screen.getByTestId("badge-nextjs")).toBeInTheDocument();
      expect(screen.getByTestId("badge-typescript")).toBeInTheDocument();
    });

    it("should render category badges", () => {
      render(<ProjectFilters {...defaultProps} />);
      expandFilters();
      expect(screen.getByTestId("badge-community")).toBeInTheDocument();
      expect(screen.getByTestId("badge-nonprofit")).toBeInTheDocument();
      expect(screen.getByTestId("badge-code")).toBeInTheDocument();
    });

    it("should render tag badges", () => {
      render(<ProjectFilters {...defaultProps} />);
      expandFilters();
      expect(screen.getByTestId("badge-web")).toBeInTheDocument();
      expect(screen.getByTestId("badge-mobile")).toBeInTheDocument();
      expect(screen.getByTestId("badge-api")).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("should update search value on input", () => {
      render(<ProjectFilters {...defaultProps} query="test" />);
      const input = screen.getByTestId("search-input") as HTMLInputElement;
      expect(input.value).toBe("test");
    });

    it("should handle search input changes", () => {
      render(<ProjectFilters {...defaultProps} />);
      const input = screen.getByTestId("search-input");
      fireEvent.change(input, { target: { value: "new search" } });
      expect((input as HTMLInputElement).value).toBe("new search");
    });
  });

  describe("Category Filter", () => {
    it("should show selected category badges", () => {
      render(<ProjectFilters {...defaultProps} selectedCategory="community" />);
      expandFilters();
      const communityBadge = screen.getByTestId("badge-community");
      expect(communityBadge).toHaveAttribute("data-selected", "true");
    });

    it("should toggle category selection on badge click", () => {
      render(<ProjectFilters {...defaultProps} />);
      expandFilters();
      const communityBadge = screen.getByTestId("badge-community");
      fireEvent.click(communityBadge);
      expect(mockPush).toHaveBeenCalled();
    });
  });

  describe("Tag Filter", () => {
    it("should show selected tag badges", () => {
      render(<ProjectFilters {...defaultProps} selectedTags={["web", "api"]} />);
      expandFilters();
      const webBadge = screen.getByTestId("badge-web");
      const apiBadge = screen.getByTestId("badge-api");
      expect(webBadge).toHaveAttribute("data-selected", "true");
      expect(apiBadge).toHaveAttribute("data-selected", "true");
    });

    it("should toggle tag selection on badge click", () => {
      render(<ProjectFilters {...defaultProps} />);
      expandFilters();
      const webBadge = screen.getByTestId("badge-web");
      fireEvent.click(webBadge);
      expect(mockPush).toHaveBeenCalled();
    });
  });

  // Status and sort filters are temporarily disabled
  describe.skip("Status Filter", () => {
    it("should display current status", () => {
      render(<ProjectFilters {...defaultProps} />);
      const select = screen.getByTestId("select-active") as HTMLSelectElement;
      expect(select.value).toBe("active");
    });

    it("should handle status change", () => {
      render(<ProjectFilters {...defaultProps} />);
      const select = screen.getByTestId("select-all");
      fireEvent.change(select, { target: { value: "in-progress" } });
      expect(mockPush).toHaveBeenCalled();
    });
  });

  describe.skip("Sort Filter", () => {
    it("should display current sort option", () => {
      render(<ProjectFilters {...defaultProps} sortBy="oldest" />);
      const select = screen.getByTestId("select-oldest") as HTMLSelectElement;
      expect(select.value).toBe("oldest");
    });

    it("should handle sort change", () => {
      render(<ProjectFilters {...defaultProps} />);
      const select = screen.getByTestId("select-newest");
      fireEvent.change(select, { target: { value: "alpha" } });
      expect(mockPush).toHaveBeenCalled();
    });
  });

  describe("Clear All Functionality", () => {
    it("should show clear button when filters are active", () => {
      render(<ProjectFilters {...defaultProps} selectedCategory="community" />);
      expect(screen.getByTestId("clear-all-button")).toBeInTheDocument();
    });

    it("should hide clear button when no filters are active", () => {
      render(<ProjectFilters {...defaultProps} />);
      expect(screen.queryByTestId("clear-all-button")).not.toBeInTheDocument();
    });

    it("should call clearAll when clear button is clicked", () => {
      render(<ProjectFilters {...defaultProps} query="test" />);
      const clearButton = screen.getByTestId("clear-all-button");
      fireEvent.click(clearButton);
      expect(mockPush).toHaveBeenCalledWith("/portfolio");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty tag list", () => {
      render(<ProjectFilters {...defaultProps} tagList={[]} />);
      expect(screen.queryByTestId("badge-web")).not.toBeInTheDocument();
    });

    it("should handle empty category list", () => {
      render(<ProjectFilters {...defaultProps} categoryList={[]} />);
      expect(screen.queryByTestId("badge-community")).not.toBeInTheDocument();
    });

    it("should handle multiple active filters", () => {
      render(
        <ProjectFilters
          {...defaultProps}
          selectedCategory="code"
          selectedTags={["web", "api", "react"]}
          query="test"
        />
      );
      expect(screen.getByTestId("clear-all-button")).toBeInTheDocument();
    });
  });
});
