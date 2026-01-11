/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeedDropdown } from '@/components/blog';

describe("FeedDropdown", () => {
  it("renders the Subscribe button trigger", () => {
    render(<FeedDropdown feedType="blog" />);
    expect(screen.getByText("Subscribe")).toBeInTheDocument();
  });

  it("renders for blog feed type", () => {
    render(<FeedDropdown feedType="blog" />);
    expect(screen.getByText("Subscribe")).toBeInTheDocument();
  });

  it("renders for work feed type", () => {
    render(<FeedDropdown feedType="work" />);
    expect(screen.getByText("Subscribe")).toBeInTheDocument();
  });

  it("renders for activity feed type", () => {
    render(<FeedDropdown feedType="activity" />);
    expect(screen.getByText("Subscribe")).toBeInTheDocument();
  });

  it("includes RSS icon in trigger button", () => {
    const { container } = render(<FeedDropdown feedType="blog" />);
    
    // Should have an SVG icon (Lucide RSS icon)
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("applies correct styling to trigger button", () => {
    render(<FeedDropdown feedType="blog" />);
    const button = screen.getByText("Subscribe").closest("button");
    
    expect(button).toHaveClass("inline-flex");
    expect(button).toHaveClass("items-center");
    expect(button).toHaveClass("gap-2");
  });
});
