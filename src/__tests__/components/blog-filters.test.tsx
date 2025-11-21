import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BlogFilters } from "@/components/blog-filters";
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
vi.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange: (value: string) => void }) => (
    <div data-testid="select-container">
      <select data-testid="reading-time-select" value={value} onChange={(e) => onValueChange(e.target.value)}>
        {children}
      </select>
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder: string }) => <span>{placeholder}</span>,
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, onClick, variant }: { children: React.ReactNode; onClick: () => void; variant: string }) => {
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
    selectedTags: [],
    readingTime: null,
    tagList: ["TypeScript", "React", "Next.js", "Testing"],
    query: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsData = {};
    vi.useFakeTimers();
  });

  describe("Rendering", () => {
    it("should render search input", () => {
      render(<BlogFilters {...defaultProps} />);
      expect(screen.getByTestId("search-input")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Search posts...")).toBeInTheDocument();
    });

    it("should render reading time select", () => {
      render(<BlogFilters {...defaultProps} />);
      expect(screen.getByTestId("reading-time-select")).toBeInTheDocument();
    });

    it("should render all tag badges", () => {
      render(<BlogFilters {...defaultProps} />);
      defaultProps.tagList.forEach(tag => {
        expect(screen.getByTestId(`badge-${tag}`)).toBeInTheDocument();
      });
    });

    it("should not render clear all button when no filters active", () => {
      render(<BlogFilters {...defaultProps} />);
      expect(screen.queryByTestId("clear-all-button")).not.toBeInTheDocument();
    });

    it("should render clear all button when filters are active", () => {
      render(<BlogFilters {...defaultProps} selectedTags={["React"]} />);
      expect(screen.getByTestId("clear-all-button")).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("should update search input value on change", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BlogFilters {...defaultProps} />);
      
      const input = screen.getByTestId("search-input") as HTMLInputElement;
      await user.type(input, "test query");
      
      expect(input.value).toBe("test query");
    });

    it("should debounce search updates (250ms)", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BlogFilters {...defaultProps} />);
      
      const input = screen.getByTestId("search-input");
      await user.type(input, "test");
      
      // Should not push immediately
      expect(mockPush).not.toHaveBeenCalled();
      
      // Fast-forward time
      vi.advanceTimersByTime(250);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/blog?q=test", { scroll: false });
      });
    });

    it("should clear debounce timer on component unmount", async () => {
      const user = userEvent.setup({ delay: null });
      const { unmount } = render(<BlogFilters {...defaultProps} />);
      
      const input = screen.getByTestId("search-input");
      await user.type(input, "test");
      
      unmount();
      vi.advanceTimersByTime(250);
      
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should not update URL if search value unchanged", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BlogFilters {...defaultProps} query="existing" />);
      
      const input = screen.getByTestId("search-input");
      
      // Clear and retype the same value
      await user.clear(input);
      await user.type(input, "existing");
      
      vi.advanceTimersByTime(250);
      
      // Should not call push since value is the same
      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled();
      });
    });

    it("should trim search query", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BlogFilters {...defaultProps} />);
      
      const input = screen.getByTestId("search-input");
      await user.type(input, "  test query  ");
      
      vi.advanceTimersByTime(250);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/blog?q=test+query", { scroll: false });
      });
    });

    it("should delete query param when search is cleared", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BlogFilters {...defaultProps} query="existing" />);
      
      const input = screen.getByTestId("search-input");
      await user.clear(input);
      
      vi.advanceTimersByTime(250);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/blog?", { scroll: false });
      });
    });

    it("should reset page parameter when searching", async () => {
      mockSearchParamsData.page = "2";
      const user = userEvent.setup({ delay: null });
      render(<BlogFilters {...defaultProps} />);
      
      const input = screen.getByTestId("search-input");
      await user.type(input, "test");
      
      vi.advanceTimersByTime(250);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/blog?q=test", { scroll: false });
      });
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
    it("should display 'all' as default value", () => {
      render(<BlogFilters {...defaultProps} />);
      const select = screen.getByTestId("reading-time-select") as HTMLSelectElement;
      expect(select.value).toBe("all");
    });

    it("should display selected reading time", () => {
      render(<BlogFilters {...defaultProps} readingTime="quick" />);
      const select = screen.getByTestId("reading-time-select") as HTMLSelectElement;
      expect(select.value).toBe("quick");
    });

    it("should update URL when reading time changes", () => {
      render(<BlogFilters {...defaultProps} />);
      const select = screen.getByTestId("reading-time-select");
      
      fireEvent.change(select, { target: { value: "medium" } });
      
      expect(mockPush).toHaveBeenCalledWith("/blog?readingTime=medium");
    });

    it("should remove readingTime param when 'all' selected", () => {
      render(<BlogFilters {...defaultProps} readingTime="quick" />);
      const select = screen.getByTestId("reading-time-select");
      
      fireEvent.change(select, { target: { value: "all" } });
      
      expect(mockPush).toHaveBeenCalledWith("/blog?");
    });

    it("should reset page parameter when changing reading time", () => {
      mockSearchParamsData.page = "3";
      render(<BlogFilters {...defaultProps} />);
      
      const select = screen.getByTestId("reading-time-select");
      fireEvent.change(select, { target: { value: "deep" } });
      
      expect(mockPush).toHaveBeenCalledWith("/blog?readingTime=deep");
    });

    it("should preserve other params when changing reading time", () => {
      mockSearchParamsData.q = "test";
      mockSearchParamsData.tag = "React";
      render(<BlogFilters {...defaultProps} query="test" selectedTags={["React"]} />);
      
      const select = screen.getByTestId("reading-time-select");
      fireEvent.change(select, { target: { value: "quick" } });
      
      expect(mockPush).toHaveBeenCalledWith("/blog?q=test&tag=React&readingTime=quick");
    });
  });

  describe("Tag Filtering", () => {
    it("should display unselected tags with outline variant", () => {
      render(<BlogFilters {...defaultProps} />);
      const badge = screen.getByTestId("badge-React");
      expect(badge.getAttribute("data-variant")).toBe("outline");
    });

    it("should display selected tags with default variant", () => {
      render(<BlogFilters {...defaultProps} selectedTags={["React"]} />);
      const badge = screen.getByTestId("badge-React");
      expect(badge.getAttribute("data-variant")).toBe("default");
    });

    it("should add tag when clicked", async () => {
      const user = userEvent.setup();
      render(<BlogFilters {...defaultProps} />);
      
      const badge = screen.getByTestId("badge-React");
      await user.click(badge);
      
      expect(mockPush).toHaveBeenCalledWith("/blog?tag=React");
    });

    it("should remove tag when clicked again", async () => {
      const user = userEvent.setup();
      render(<BlogFilters {...defaultProps} selectedTags={["React"]} />);
      
      const badge = screen.getByTestId("badge-React");
      await user.click(badge);
      
      expect(mockPush).toHaveBeenCalledWith("/blog?");
    });

    it("should handle multiple selected tags", async () => {
      const user = userEvent.setup();
      render(<BlogFilters {...defaultProps} selectedTags={["React"]} />);
      
      const badge = screen.getByTestId("badge-TypeScript");
      await user.click(badge);
      
      expect(mockPush).toHaveBeenCalledWith("/blog?tag=React%2CTypeScript");
    });

    it("should remove tag from multiple selections", async () => {
      const user = userEvent.setup();
      render(<BlogFilters {...defaultProps} selectedTags={["React", "TypeScript"]} />);
      
      const badge = screen.getByTestId("badge-React");
      await user.click(badge);
      
      expect(mockPush).toHaveBeenCalledWith("/blog?tag=TypeScript");
    });

    it("should reset page parameter when toggling tags", async () => {
      mockSearchParamsData.page = "2";
      const user = userEvent.setup();
      render(<BlogFilters {...defaultProps} />);
      
      const badge = screen.getByTestId("badge-React");
      await user.click(badge);
      
      expect(mockPush).toHaveBeenCalledWith("/blog?tag=React");
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
      expect(button.textContent).toContain("3");
    });

    it("should calculate correct filter count", () => {
      render(<BlogFilters {...defaultProps} selectedTags={["React"]} />);
      const button = screen.getByTestId("clear-all-button");
      expect(button.textContent).toContain("1");
    });

    it("should navigate to /blog when clicked", async () => {
      const user = userEvent.setup();
      render(<BlogFilters {...defaultProps} selectedTags={["React"]} />);
      
      const button = screen.getByTestId("clear-all-button");
      await user.click(button);
      
      expect(mockPush).toHaveBeenCalledWith("/blog");
    });

    it("should clear all filters at once", async () => {
      mockSearchParamsData.q = "test";
      mockSearchParamsData.tag = "React,TypeScript";
      mockSearchParamsData.readingTime = "quick";
      mockSearchParamsData.page = "2";
      
      const user = userEvent.setup();
      render(<BlogFilters {...defaultProps} selectedTags={["React", "TypeScript"]} readingTime="quick" query="test" />);
      
      const button = screen.getByTestId("clear-all-button");
      await user.click(button);
      
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
      const topRow = container.querySelector(".flex.flex-col.sm\\:flex-row");
      expect(topRow).toBeInTheDocument();
    });

    it("should have responsive width for reading time select", () => {
      const { container } = render(<BlogFilters {...defaultProps} />);
      const selectContainer = container.querySelector(".w-full.sm\\:w-\\[200px\\]");
      expect(selectContainer).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty tag list", () => {
      render(<BlogFilters {...defaultProps} tagList={[]} />);
      expect(screen.queryByTestId(/^badge-/)).not.toBeInTheDocument();
    });

    it("should handle special characters in search", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BlogFilters {...defaultProps} />);
      
      const input = screen.getByTestId("search-input");
      await user.type(input, "test & query <>");
      
      vi.advanceTimersByTime(250);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
    });

    it("should handle tags with special characters", () => {
      render(<BlogFilters {...defaultProps} tagList={["Next.js", "C++", "F#"]} />);
      expect(screen.getByTestId("badge-Next.js")).toBeInTheDocument();
      expect(screen.getByTestId("badge-C++")).toBeInTheDocument();
      expect(screen.getByTestId("badge-F#")).toBeInTheDocument();
    });

    it("should handle rapid search input changes", async () => {
      const user = userEvent.setup({ delay: null });
      render(<BlogFilters {...defaultProps} />);
      
      const input = screen.getByTestId("search-input");
      await user.type(input, "a");
      vi.advanceTimersByTime(100);
      await user.type(input, "b");
      vi.advanceTimersByTime(100);
      await user.type(input, "c");
      vi.advanceTimersByTime(250);
      
      // Should only push once with final value
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalledWith("/blog?q=abc", { scroll: false });
      });
    });
  });
});
