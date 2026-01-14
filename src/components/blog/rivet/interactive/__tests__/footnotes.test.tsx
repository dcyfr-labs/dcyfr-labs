import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Footnotes } from "../footnotes";

// Mock localStorage to avoid cross-test contamination
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Footnotes Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders with collapsed state by default", () => {
    render(
      <Footnotes>
        <div>Footnote content</div>
      </Footnotes>
    );

    const content = screen.getByRole("region");
    expect(content).toHaveClass("max-h-0 opacity-0");
  });

  it("expands when toggle button is clicked", () => {
    render(
      <Footnotes>
        <div>Footnote content</div>
      </Footnotes>
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    const content = screen.getByRole("region");
    expect(content).toHaveClass("max-h-[5000px] opacity-100");
  });

  it("collapses when toggle button is clicked again", () => {
    render(
      <Footnotes>
        <div>Footnote content</div>
      </Footnotes>
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);
    fireEvent.click(button);

    const content = screen.getByRole("region");
    expect(content).toHaveClass("max-h-0 opacity-0");
  });

  it("renders footnotes title", () => {
    render(
      <Footnotes>
        <div>Footnote content</div>
      </Footnotes>
    );

    expect(screen.getByText("Footnotes")).toBeInTheDocument();
  });

  it("handles Enter key to toggle expansion", () => {
    render(
      <Footnotes>
        <div>Footnote content</div>
      </Footnotes>
    );

    const button = screen.getByRole("button");
    fireEvent.keyDown(button, { key: "Enter" });

    const content = screen.getByRole("region");
    expect(content).toHaveClass("max-h-[5000px] opacity-100");
  });

  it("handles Space key to toggle expansion", () => {
    render(
      <Footnotes>
        <div>Footnote content</div>
      </Footnotes>
    );

    const button = screen.getByRole("button");
    fireEvent.keyDown(button, { key: " " });

    const content = screen.getByRole("region");
    expect(content).toHaveClass("max-h-[5000px] opacity-100");
  });

  it("updates aria-expanded attribute based on state", () => {
    render(
      <Footnotes>
        <div>Footnote content</div>
      </Footnotes>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("accepts custom className", () => {
    const { container } = render(
      <Footnotes className="custom-class">
        <div>Footnote content</div>
      </Footnotes>
    );

    const section = container.querySelector("section");
    expect(section).toHaveClass("custom-class");
  });

  it("renders children content inside collapsible section", () => {
    render(
      <Footnotes>
        <div data-testid="footnote-content">Custom footnote content</div>
      </Footnotes>
    );

    expect(screen.getByTestId("footnote-content")).toBeInTheDocument();
  });

  it("renders chevron icon that rotates on expand", () => {
    const { container } = render(
      <Footnotes>
        <div>Footnote content</div>
      </Footnotes>
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(svg).toHaveClass("rotate-180");
  });

  it("renders with proper semantic markup", () => {
    const { container } = render(
      <Footnotes>
        <div>Footnote content</div>
      </Footnotes>
    );

    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();

    const button = screen.getByRole("button");
    expect(button.tagName).toBe("BUTTON");

    const h3 = screen.getByRole("heading", { level: 3 });
    expect(h3).toHaveTextContent("Footnotes");
  });

  it("uses reducedSpacing prop for tighter spacing", () => {
    const { container } = render(
      <Footnotes>
        <div>Footnote content</div>
      </Footnotes>
    );

    const section = container.querySelector("section");
    // Check that it has reduced spacing (mb-2 instead of my-4)
    expect(section).toHaveClass("mb-2");
  });
});

