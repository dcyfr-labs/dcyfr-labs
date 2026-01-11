import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FloatingFilterFab } from '@/components/blog';

const mockOpen = vi.fn();
const mockClose = vi.fn();
const mockSetIsOpen = vi.fn();
const mockToggle = vi.fn();

// Mock the hook - include full interface for robustness
vi.mock("@/hooks/use-mobile-filter-sheet", () => ({
  useMobileFilterSheet: vi.fn(() => ({
    isOpen: false,
    open: mockOpen,
    close: mockClose,
    setIsOpen: mockSetIsOpen,
    toggle: mockToggle,
  })),
}));

describe("FloatingFilterFab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders FAB button", () => {
    render(
      <FloatingFilterFab
        activeFilterCount={0}
        hasFilters={false}
      />
    );
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("shows filter count badge when filters are active", () => {
    render(
      <FloatingFilterFab
        activeFilterCount={3}
        hasFilters={true}
      />
    );
    const badge = screen.getByText("3");
    expect(badge).toBeInTheDocument();
  });

  it("hides badge when no filters are active", () => {
    render(
      <FloatingFilterFab
        activeFilterCount={0}
        hasFilters={false}
      />
    );
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("opens filter sheet on click", () => {
    render(
      <FloatingFilterFab
        activeFilterCount={1}
        hasFilters={true}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(mockOpen).toHaveBeenCalled();
  });

  it("updates aria-label based on filter status", () => {
    const { rerender } = render(
      <FloatingFilterFab
        activeFilterCount={0}
        hasFilters={false}
      />
    );
    
    let button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Open filters");

    rerender(
      <FloatingFilterFab
        activeFilterCount={2}
        hasFilters={true}
      />
    );

    button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Filters (2)");
  });

  it("applies correct styling for active filters state", () => {
    render(
      <FloatingFilterFab
        activeFilterCount={1}
        hasFilters={true}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("fixed", "bottom-20", "right-4", "z-30");
  });

  it("only renders on mobile (hidden on lg breakpoint)", () => {
    render(
      <FloatingFilterFab
        activeFilterCount={1}
        hasFilters={true}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("lg:hidden");
  });
});
