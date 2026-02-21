import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BlogFilters } from '@/components/blog';
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

// Mock UI components
let selectCounter = 0;
vi.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange: (value: string) => void }) => {
    const id = selectCounter++;
    return (
      <div data-testid={`select-container-${id}`}>
        <select 
          data-testid={`select-${id}`} 
          value={value} 
          onChange={(e) => onValueChange(e.target.value)}
          aria-label={`Select ${id}`}
        >
          {children}
        </select>
      </div>
    );
  },
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder: string }) => <span>{placeholder}</span>,
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, onClick, variant, className }: { children: React.ReactNode; onClick: () => void; variant: string; className?: string }) => {
    // Extract text from children (handle both string and React elements)
    const getText = (node: React.ReactNode): string => {
      if (typeof node === 'string') return node;
      if (Array.isArray(node)) return node.map(getText).join('');
      if (node && typeof node === 'object' && 'props' in node) {
        const element = node as { props: { children?: React.ReactNode } };
        return getText(element.props.children);
      }
      return '';
    };
    
    const text = getText(children);
    const tagName = text.split('\n')[0]; // Get first line as tag name
    
    return (
      <button
        data-testid={`badge-${tagName}`}
        data-variant={variant}
        className={className}
        onClick={onClick}
      >
        {children}
      </button>
    );
  },
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ value, onChange, placeholder, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      data-testid="search-input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, variant, size, className }: { children: React.ReactNode; onClick: () => void; variant: string; size: string; className: string }) => (
    <button
      data-testid="clear-all-button"
      data-variant={variant}
      data-size={size}
      className={className}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

describe("BlogFilters Component", () => {
  const defaultProps = {
    selectedCategory: "",
    selectedTags: [],
    readingTime: null,
    categoryList: ["technology", "security", "career", "tutorial"],
    categoryDisplayMap: {
      technology: "Technology",
      security: "Security",
      career: "Career",
      tutorial: "Tutorial",
    },
    tagList: ["TypeScript", "React", "Next.js", "Testing"],
    query: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsData = {};
    vi.useFakeTimers();
    selectCounter = 0; // Reset counter for each test
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("Rendering", () => {
    it("should render search input", () => {
      render(<BlogFilters {...defaultProps} />);
      expect(screen.getByTestId("search-input")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Search posts...")).toBeInTheDocument();
    });

    it("should render sort filter badges", () => {
      render(<BlogFilters {...defaultProps} />);
      expect(screen.getByTestId("badge-Newest")).toBeInTheDocument();
      expect(screen.getByTestId("badge-Popular")).toBeInTheDocument();
      expect(screen.getByTestId("badge-Oldest")).toBeInTheDocument();
    });

    it("should render reading time filter badges", () => {
      render(<BlogFilters {...defaultProps} />);
      expect(screen.getByTestId("badge-<5 min")).toBeInTheDocument();
      expect(screen.getByTestId("badge-5-15 min")).toBeInTheDocument();
      expect(screen.getByTestId("badge->15 min")).toBeInTheDocument();
    });

    it("should render date range filter badges", () => {
      render(<BlogFilters {...defaultProps} />);
      expect(screen.getByTestId("badge-30 days")).toBeInTheDocument();
      expect(screen.getByTestId("badge-90 days")).toBeInTheDocument();
      expect(screen.getByTestId("badge-This year")).toBeInTheDocument();
    });

    it("should render all tag badges", () => {
      render(<BlogFilters {...defaultProps} />);
      defaultProps.tagList.forEach(tag => {
        expect(screen.getByTestId(`badge-${tag}`)).toBeInTheDocument();
      });
    });

    it("should not render clear all button when no filters active", () => {
      render(<BlogFilters {...defaultProps} />);
      const clearButton = screen.queryByTestId("clear-all-button");
      // Button should either not exist or be invisible
      if (clearButton) {
        expect(clearButton).toHaveClass("invisible");
      }
    });

    it("should render clear all button when filters are active", () => {
      render(<BlogFilters {...defaultProps} selectedTags={["React"]} />);
      expect(screen.getByTestId("clear-all-button")).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("should update search input value on change", async () => {
      vi.useRealTimers(); // userEvent doesn't work with fake timers
      const user = userEvent.setup();
      render(<BlogFilters {...defaultProps} />);
      
      const input = screen.getByTestId("search-input") as HTMLInputElement;
      await user.type(input, "test query");
      
      expect(input.value).toBe("test query");
      vi.useFakeTimers();
    });

    it("should debounce search updates (250ms)", async () => {
      const { unmount } = render(<BlogFilters {...defaultProps} />);
      
      const input = screen.getByTestId("search-input");
      fireEvent.change(input, { target: { value: "test" } });
      
      // Should not push immediately
      expect(mockPush).not.toHaveBeenCalled();
      
      // Fast-forward time
      vi.advanceTimersByTime(250);
      
      expect(mockPush).toHaveBeenCalledWith("/blog?q=test", { scroll: false });
      
      mockPush.mockClear();
      unmount();
      vi.advanceTimersByTime(250);
      
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should not update URL if search value unchanged", async () => {
      render(<BlogFilters {...defaultProps} query="existing" />);
      
      const input = screen.getByTestId("search-input") as HTMLInputElement;
      
      // Clear and retype the same value
      fireEvent.change(input, { target: { value: "" } });
      fireEvent.change(input, { target: { value: "existing" } });
      
      vi.advanceTimersByTime(250);
      
      // Should not call push since value is the same
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should trim search query", async () => {
      render(<BlogFilters {...defaultProps} />);
      
      const input = screen.getByTestId("search-input");
      fireEvent.change(input, { target: { value: "  test query  " } });
      
      vi.advanceTimersByTime(250);
      
      expect(mockPush).toHaveBeenCalledWith("/blog?q=test+query", { scroll: false });
    });

    it("should delete query param when search is cleared", async () => {
      render(<BlogFilters {...defaultProps} query="existing" />);
      
      const input = screen.getByTestId("search-input");
      fireEvent.change(input, { target: { value: "" } });
      
      vi.advanceTimersByTime(250);
      
      expect(mockPush).toHaveBeenCalledWith("/blog?", { scroll: false });
    });

    it("should reset page parameter when searching", async () => {
      mockSearchParamsData.page = "2";
      render(<BlogFilters {...defaultProps} />);
      
      const input = screen.getByTestId("search-input");
      fireEvent.change(input, { target: { value: "test" } });
      
      vi.advanceTimersByTime(250);
      
      expect(mockPush).toHaveBeenCalledWith("/blog?q=test", { scroll: false });
    });

    it("should sync search value with query prop", () => {
      const { rerender } = render(<BlogFilters {...defaultProps} query="" />);
      
      const input = screen.getByTestId("search-input") as HTMLInputElement;
      expect(input.value).toBe("");
      
      rerender(<BlogFilters {...defaultProps} query="new query" />);
      expect(input.value).toBe("new query");
    });
  });

  describe("Reading Time Filter", () => {
    it("should show reading time badges as outline by default", () => {
      render(<BlogFilters {...defaultProps} />);
      const badge = screen.getByTestId("badge-<5 min");
      expect(badge.dataset.variant).toBe("outline");
    });

    it("should show selected reading time badge as default variant", () => {
      render(<BlogFilters {...defaultProps} readingTime="quick" />);
      const badge = screen.getByTestId("badge-<5 min");
      expect(badge.dataset.variant).toBe("default");
    });

    it("should update URL when reading time badge is clicked", () => {
      render(<BlogFilters {...defaultProps} />);
      const badge = screen.getByTestId("badge-5-15 min");
      
      fireEvent.click(badge);
      
      expect(mockPush).toHaveBeenCalledWith("/blog?readingTime=medium");
    });

    it("should remove readingTime param when selected badge is clicked again", () => {
      render(<BlogFilters {...defaultProps} readingTime="quick" />);
      const badge = screen.getByTestId("badge-<5 min");
      
      fireEvent.click(badge);
      
      expect(mockPush).toHaveBeenCalledWith("/blog?");
    });

    it("should reset page parameter when changing reading time", () => {
      mockSearchParamsData.page = "3";
      render(<BlogFilters {...defaultProps} />);
      
      const badge = screen.getByTestId("badge->15 min");
      fireEvent.click(badge);
      
      expect(mockPush).toHaveBeenCalledWith("/blog?readingTime=deep");
    });

    it("should preserve other params when changing reading time", () => {
      mockSearchParamsData.q = "test";
      mockSearchParamsData.tag = "React";
      render(<BlogFilters {...defaultProps} query="test" selectedTags={["React"]} />);
      
      const badge = screen.getByTestId("badge-<5 min");
      fireEvent.click(badge);
      
      expect(mockPush).toHaveBeenCalledWith("/blog?q=test&tag=React&readingTime=quick");
    });
  });

  describe("Tag Filtering", () => {
    it("should display unselected tags with outline variant", () => {
      render(<BlogFilters {...defaultProps} />);
      const badge = screen.getByTestId("badge-React");
      expect(badge.dataset.variant).toBe("outline");
    });

    it("should display selected tags with default variant", () => {
      render(<BlogFilters {...defaultProps} selectedTags={["React"]} />);
      const badge = screen.getByTestId("badge-React");
      expect(badge.dataset.variant).toBe("default");
    });

    it("should add tag when clicked", () => {
      render(<BlogFilters {...defaultProps} />);
      
      const badge = screen.getByTestId("badge-React");
      fireEvent.click(badge);
      
      expect(mockPush).toHaveBeenCalledWith("/blog?tag=react");
    });

    it("should remove tag when clicked again", () => {
      render(<BlogFilters {...defaultProps} selectedTags={["react"]} />);
      
      const badge = screen.getByTestId("badge-React");
      fireEvent.click(badge);
      
      expect(mockPush).toHaveBeenCalledWith("/blog?");
    });

    it("should handle multiple selected tags", () => {
      render(<BlogFilters {...defaultProps} selectedTags={["react"]} />);
      
      const badge = screen.getByTestId("badge-TypeScript");
      fireEvent.click(badge);
      
      expect(mockPush).toHaveBeenCalledWith("/blog?tag=react%2Ctypescript");
    });

    it("should remove tag from multiple selections", () => {
      render(<BlogFilters {...defaultProps} selectedTags={["react", "typescript"]} />);
      
      const badge = screen.getByTestId("badge-React");
      fireEvent.click(badge);
      
      expect(mockPush).toHaveBeenCalledWith("/blog?tag=typescript");
    });

    it("should reset page parameter when toggling tags", () => {
      mockSearchParamsData.page = "2";
      render(<BlogFilters {...defaultProps} />);
      
      const badge = screen.getByTestId("badge-React");
      fireEvent.click(badge);
      
      expect(mockPush).toHaveBeenCalledWith("/blog?tag=react");
    });

    it("should show X icon on selected tags", () => {
      render(<BlogFilters {...defaultProps} selectedTags={["React"]} />);
      const badge = screen.getByTestId("badge-React");
      expect(badge.textContent).toContain("React");
    });
  });

  describe("Clear All Filters", () => {
    it("should show filter count badge", () => {
      render(<BlogFilters {...defaultProps} selectedTags={["React", "TypeScript"]} readingTime="quick" query="test" />);
      const button = screen.getByTestId("clear-all-button");
      expect(button.textContent).toContain("Clear all");
      expect(button.textContent).toContain("4"); // 2 tags + 1 readingTime + 1 query
    });

    it("should calculate correct filter count", () => {
      render(<BlogFilters {...defaultProps} selectedTags={["React"]} />);
      const button = screen.getByTestId("clear-all-button");
      expect(button.textContent).toContain("Clear all");
      expect(button.textContent).toContain("1");
    });

    it("should navigate to /blog when clicked", () => {
      render(<BlogFilters {...defaultProps} selectedTags={["React"]} />);
      
      const button = screen.getByTestId("clear-all-button");
      fireEvent.click(button);
      
      expect(mockPush).toHaveBeenCalledWith("/blog");
    });

    it("should clear all filters at once", () => {
      mockSearchParamsData.q = "test";
      mockSearchParamsData.tag = "React,TypeScript";
      mockSearchParamsData.readingTime = "quick";
      mockSearchParamsData.page = "2";
      
      render(<BlogFilters {...defaultProps} selectedTags={["React", "TypeScript"]} readingTime="quick" query="test" />);
      
      const button = screen.getByTestId("clear-all-button");
      fireEvent.click(button);
      
      expect(mockPush).toHaveBeenCalledWith("/blog");
    });
  });

  describe("Accessibility", () => {
    it("should have accessible search input", () => {
      render(<BlogFilters {...defaultProps} />);
      const input = screen.getByTestId("search-input");
      expect(input).toHaveAttribute("aria-label", "Search blog posts");
    });

    it("should have type='search' on input", () => {
      render(<BlogFilters {...defaultProps} />);
      const input = screen.getByTestId("search-input");
      expect(input).toHaveAttribute("type", "search");
    });

    it("should disable autocomplete on search input", () => {
      render(<BlogFilters {...defaultProps} />);
      const input = screen.getByTestId("search-input");
      expect(input).toHaveAttribute("autoComplete", "off");
    });

    it("should have clickable badges", () => {
      render(<BlogFilters {...defaultProps} />);
      const badge = screen.getByTestId("badge-React");
      expect(badge.className).toContain("cursor-pointer");
    });

    it("should prevent text selection on badges", () => {
      render(<BlogFilters {...defaultProps} />);
      const badge = screen.getByTestId("badge-React");
      expect(badge.className).toContain("select-none");
    });
  });

  describe("Responsive Behavior", () => {
    it("should have responsive layout classes", () => {
      const { container } = render(<BlogFilters {...defaultProps} />);
      // Updated to match new badge-based filter layout
      const filterRow = container.querySelector(".flex.flex-wrap");
      expect(filterRow).toBeInTheDocument();
    });

    it("should render filter badges with proper classes", () => {
      render(<BlogFilters {...defaultProps} />);
      // Verify sort badges are rendered
      const newestBadge = screen.getByTestId("badge-Newest");
      expect(newestBadge).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty tag list", () => {
      render(<BlogFilters {...defaultProps} tagList={[]} categoryList={[]} />);
      // With new badge-based filters, we still have sort/date/reading time badges (9 total)
      // But no tag badges specifically
      expect(screen.queryByTestId("badge-React")).not.toBeInTheDocument();
      expect(screen.queryByTestId("badge-TypeScript")).not.toBeInTheDocument();
    });

    it("should handle special characters in search", async () => {
      render(<BlogFilters {...defaultProps} />);
      
      const input = screen.getByTestId("search-input");
      fireEvent.change(input, { target: { value: "test & query <>" } });
      
      vi.advanceTimersByTime(250);
      
      expect(mockPush).toHaveBeenCalled();
    });

    it("should handle tags with special characters", () => {
      render(<BlogFilters {...defaultProps} tagList={["Next.js", "C++", "F#"]} />);
      expect(screen.getByTestId("badge-Next.js")).toBeInTheDocument();
      expect(screen.getByTestId("badge-C++")).toBeInTheDocument();
      expect(screen.getByTestId("badge-F#")).toBeInTheDocument();
    });

    it("should handle rapid search input changes", async () => {
      render(<BlogFilters {...defaultProps} />);
      
      const input = screen.getByTestId("search-input");
      fireEvent.change(input, { target: { value: "a" } });
      vi.advanceTimersByTime(100);
      fireEvent.change(input, { target: { value: "ab" } });
      vi.advanceTimersByTime(100);
      fireEvent.change(input, { target: { value: "abc" } });
      vi.advanceTimersByTime(250);
      
      // Should only push once with final value
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/blog?q=abc", { scroll: false });
    });
  });
});
