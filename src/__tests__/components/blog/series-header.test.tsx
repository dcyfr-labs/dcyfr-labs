import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SeriesHeader } from "@/components/blog/series-header";

describe("SeriesHeader", () => {
  it("should render series title", () => {
    render(
      <SeriesHeader name="React Hooks Deep Dive" postCount={5} totalMinutes={28} />
    );
    expect(screen.getByText("React Hooks Deep Dive")).toBeInTheDocument();
  });

  it("should display singular post count correctly", () => {
    render(
      <SeriesHeader name="Test Series" postCount={1} totalMinutes={5} />
    );
    expect(screen.getByText("1 post")).toBeInTheDocument();
  });

  it("should display plural post count correctly", () => {
    render(
      <SeriesHeader name="Test Series" postCount={5} totalMinutes={28} />
    );
    const postCounts = screen.getAllByText("5 posts");
    expect(postCounts.length).toBeGreaterThan(0);
  });

  it("should display correct reading time", () => {
    render(
      <SeriesHeader name="Test Series" postCount={5} totalMinutes={28} />
    );
    expect(screen.getByText("28 min read")).toBeInTheDocument();
  });

  it("should display singular reading time correctly", () => {
    render(
      <SeriesHeader name="Test Series" postCount={1} totalMinutes={1} />
    );
    expect(screen.getByText("1 min read")).toBeInTheDocument();
  });

  it("should display stats with icons", () => {
    const { container } = render(
      <SeriesHeader name="Test Series" postCount={5} totalMinutes={28} />
    );
    const icons = container.querySelectorAll("svg");
    // BookOpen and Clock icons
    expect(icons.length).toBeGreaterThanOrEqual(2);
  });
});
