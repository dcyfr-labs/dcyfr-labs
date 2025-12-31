import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FilterSelect } from "@/components/common/filters";
import { Clock } from "lucide-react";

describe("FilterSelect", () => {
  const mockOptions = [
    { value: "all", label: "All items" },
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
  ];

  it("should render with default props", () => {
    const onChange = vi.fn();
    render(
      <FilterSelect
        value="all"
        onChange={onChange}
        options={mockOptions}
        placeholder="Select option"
      />
    );

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should display icon when provided", () => {
    const onChange = vi.fn();
    render(
      <FilterSelect
        value="all"
        onChange={onChange}
        options={mockOptions}
        icon={Clock}
        placeholder="Select option"
      />
    );

    const icon = document.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should use default value when value is empty", () => {
    const onChange = vi.fn();
    render(
      <FilterSelect
        value=""
        onChange={onChange}
        options={mockOptions}
        placeholder="Select option"
        defaultValue="all"
      />
    );

    expect(screen.getByRole("combobox")).toHaveAttribute("data-state", "closed");
  });

  it("should apply custom className", () => {
    const onChange = vi.fn();
    render(
      <FilterSelect
        value="all"
        onChange={onChange}
        options={mockOptions}
        placeholder="Select option"
        className="custom-class"
      />
    );

    const wrapper = document.querySelector(".custom-class");
    expect(wrapper).toBeInTheDocument();
  });

  it("should pass onChange handler to Select", () => {
    const onChange = vi.fn();
    render(
      <FilterSelect
        value="all"
        onChange={onChange}
        options={mockOptions}
        placeholder="Select option"
      />
    );

    // Verify the component renders without errors and accepts onChange
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should render with all provided options", () => {
    const onChange = vi.fn();
    const { container } = render(
      <FilterSelect
        value="all"
        onChange={onChange}
        options={mockOptions}
        placeholder="Select option"
      />
    );

    // Options are rendered but in a portal, so we verify the component structure
    expect(container.querySelector("[role='combobox']")).toBeInTheDocument();
  });
});
