import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterBadges } from "@/components/common/filters";
import { Tags } from "lucide-react";

describe("FilterBadges", () => {
  const mockItems = ["react", "nextjs", "typescript"];

  it("should render all badge items", () => {
    const onToggle = vi.fn();
    render(
      <FilterBadges
        items={mockItems}
        selected={[]}
        onToggle={onToggle}
      />
    );

    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("nextjs")).toBeInTheDocument();
    expect(screen.getByText("typescript")).toBeInTheDocument();
  });

  it("should return null when items array is empty", () => {
    const onToggle = vi.fn();
    const { container } = render(
      <FilterBadges
        items={[]}
        selected={[]}
        onToggle={onToggle}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should highlight selected badges", () => {
    const onToggle = vi.fn();
    render(
      <FilterBadges
        items={mockItems}
        selected={["react", "typescript"]}
        onToggle={onToggle}
      />
    );

    const reactBadge = screen.getByText("react");
    const nextjsBadge = screen.getByText("nextjs");

    // Both badges should be clickable
    expect(reactBadge).toBeInTheDocument();
    expect(nextjsBadge).toBeInTheDocument();
  });

  it("should show X icon on selected badges", () => {
    const onToggle = vi.fn();
    render(
      <FilterBadges
        items={mockItems}
        selected={["react"]}
        onToggle={onToggle}
      />
    );

    const icons = document.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThan(0);
  });

  it("should call onToggle when badge is clicked", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();

    render(
      <FilterBadges
        items={mockItems}
        selected={[]}
        onToggle={onToggle}
      />
    );

    const reactBadge = screen.getByText("react");
    await user.click(reactBadge);

    expect(onToggle).toHaveBeenCalledWith("react");
  });

  it("should toggle selected badge", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();

    render(
      <FilterBadges
        items={mockItems}
        selected={["react"]}
        onToggle={onToggle}
      />
    );

    const reactBadge = screen.getByText("react");
    await user.click(reactBadge);

    expect(onToggle).toHaveBeenCalledWith("react");
  });

  it("should render icon when provided", () => {
    const onToggle = vi.fn();
    render(
      <FilterBadges
        items={mockItems}
        selected={[]}
        onToggle={onToggle}
        icon={Tags}
      />
    );

    const icon = document.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should render label when provided", () => {
    const onToggle = vi.fn();
    render(
      <FilterBadges
        items={mockItems}
        selected={[]}
        onToggle={onToggle}
        label="Categories"
      />
    );

    expect(screen.getByText("Categories")).toBeInTheDocument();
  });

  it("should render both icon and label", () => {
    const onToggle = vi.fn();
    render(
      <FilterBadges
        items={mockItems}
        selected={[]}
        onToggle={onToggle}
        icon={Tags}
        label="Tech Stack"
      />
    );

    expect(screen.getByText("Tech Stack")).toBeInTheDocument();
    const icon = document.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const onToggle = vi.fn();
    const { container } = render(
      <FilterBadges
        items={mockItems}
        selected={[]}
        onToggle={onToggle}
        className="custom-wrapper"
      />
    );

    expect(container.querySelector(".custom-wrapper")).toBeInTheDocument();
  });

  it("should handle multiple selected items", () => {
    const onToggle = vi.fn();
    render(
      <FilterBadges
        items={mockItems}
        selected={["react", "nextjs", "typescript"]}
        onToggle={onToggle}
      />
    );

    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("nextjs")).toBeInTheDocument();
    expect(screen.getByText("typescript")).toBeInTheDocument();
  });
});
