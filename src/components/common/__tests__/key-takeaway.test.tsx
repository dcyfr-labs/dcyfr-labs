import { render, screen } from "@testing-library/react";
import { KeyTakeaway } from "../key-takeaway";

describe("KeyTakeaway Component", () => {
  it("renders children content correctly", () => {
    const testContent = "This is a critical insight for security.";

    render(<KeyTakeaway>{testContent}</KeyTakeaway>);

    expect(screen.getByText(testContent)).toBeInTheDocument();
    expect(screen.getByText("Key Takeaway:")).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<KeyTakeaway>Test content</KeyTakeaway>);

    // Should have role="note" for accessibility
    const container = screen.getByRole("note");
    expect(container).toBeInTheDocument();
  });

  it("renders lightbulb icon", () => {
    const { container } = render(<KeyTakeaway>Test content</KeyTakeaway>);

    // Icon should be hidden from screen readers
    const icon = container.querySelector('[aria-hidden="true"]');
    expect(icon).toBeInTheDocument();
  });

  it("applies custom className when provided", () => {
    const customClass = "my-custom-class";

    render(<KeyTakeaway className={customClass}>Test content</KeyTakeaway>);

    expect(screen.getByRole("note")).toHaveClass(customClass);
  });
});
