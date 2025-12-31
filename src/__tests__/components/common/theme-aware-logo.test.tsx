import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeAwareLogo } from "@/components/common";

// Mock Logo component
vi.mock("@/components/common/logo", () => ({
  default: ({
    width,
    height,
    fill,
    className,
  }: {
    width: string | number;
    height: string | number;
    fill: string;
    className?: string;
  }) => (
    <svg
      width={width}
      height={height}
      fill={fill}
      className={className}
      data-testid="theme-aware-logo"
    >
      <path d="test-path" />
    </svg>
  ),
}));

describe("ThemeAwareLogo", () => {
  it("renders with default props", () => {
    render(<ThemeAwareLogo />);

    const logo = screen.getByTestId("theme-aware-logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("width", "40");
    expect(logo).toHaveAttribute("height", "40");
  });

  it("uses currentColor for theme adaptation", () => {
    render(<ThemeAwareLogo />);

    const logo = screen.getByTestId("theme-aware-logo");
    expect(logo).toHaveAttribute("fill", "currentColor");
  });

  it("applies text-foreground class for theme matching", () => {
    render(<ThemeAwareLogo />);

    const logo = screen.getByTestId("theme-aware-logo");
    expect(logo.className).toContain("text-foreground");
    expect(logo.className).toContain("transition-colors");
  });

  it("accepts custom dimensions", () => {
    render(<ThemeAwareLogo width={48} height={48} />);

    const logo = screen.getByTestId("theme-aware-logo");
    expect(logo).toHaveAttribute("width", "48");
    expect(logo).toHaveAttribute("height", "48");
  });

  it("accepts custom className", () => {
    render(<ThemeAwareLogo className="custom-class" />);

    const logo = screen.getByTestId("theme-aware-logo");
    expect(logo.className).toContain("custom-class");
    expect(logo.className).toContain("text-foreground");
  });

  it("accepts string dimensions", () => {
    render(<ThemeAwareLogo width="100%" height="100%" />);

    const logo = screen.getByTestId("theme-aware-logo");
    expect(logo).toHaveAttribute("width", "100%");
    expect(logo).toHaveAttribute("height", "100%");
  });
});
