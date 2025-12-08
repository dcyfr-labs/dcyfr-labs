import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Figure, FigureProvider } from "@/components/common/figure-caption";

describe("Figure Caption Component", () => {
  it("renders without caption", () => {
    const { container } = render(
      <FigureProvider>
        <Figure>
          <img src="/test.jpg" alt="test" />
        </Figure>
      </FigureProvider>
    );

    expect(container.querySelector("figure")).not.toBeInTheDocument();
    expect(screen.getByAltText("test")).toBeInTheDocument();
  });

  it("renders with caption and automatic numbering", () => {
    const { container } = render(
      <FigureProvider>
        <Figure caption="First figure caption">
          <img src="/test1.jpg" alt="test1" />
        </Figure>
        <Figure caption="Second figure caption">
          <img src="/test2.jpg" alt="test2" />
        </Figure>
      </FigureProvider>
    );

    // Check figure elements exist
    const figures = screen.getAllByRole("figure");
    expect(figures).toHaveLength(2);

    // Get figcaption elements using DOM query
    const figcaptions = container.querySelectorAll("figcaption");
    expect(figcaptions).toHaveLength(2);

    // Check captions have correct numbering
    expect(figcaptions[0].textContent).toMatch(/Fig\.\s+1\s*:/);
    expect(figcaptions[0].textContent).toContain("First figure caption");
    expect(figcaptions[1].textContent).toMatch(/Fig\.\s+2\s*:/);
    expect(figcaptions[1].textContent).toContain("Second figure caption");
  });

  it("renders correct HTML structure", () => {
    const { container } = render(
      <FigureProvider>
        <Figure caption="Test caption">
          <img src="/test.jpg" alt="test" />
        </Figure>
      </FigureProvider>
    );

    const figure = container.querySelector("figure");
    expect(figure).toBeInTheDocument();

    const figcaption = container.querySelector("figcaption");
    expect(figcaption).toBeInTheDocument();
    expect(figcaption?.textContent).toContain("Fig. 1:");
    expect(figcaption?.textContent).toContain("Test caption");
  });

  it("applies correct styling classes", () => {
    const { container } = render(
      <FigureProvider>
        <Figure caption="Styled caption">
          <img src="/test.jpg" alt="test" />
        </Figure>
      </FigureProvider>
    );

    const figcaption = container.querySelector("figcaption");
    expect(figcaption).toHaveClass("italic", "text-center", "text-muted-foreground");

    const strongLabel = figcaption?.querySelector("strong");
    expect(strongLabel).toHaveClass("font-semibold", "not-italic");
  });

  it("maintains separate numbering for multiple providers", () => {
    const { container } = render(
      <>
        <FigureProvider>
          <Figure caption="First provider figure">
            <img src="/test1.jpg" alt="test1" />
          </Figure>
        </FigureProvider>
        <FigureProvider>
          <Figure caption="Second provider figure">
            <img src="/test2.jpg" alt="test2" />
          </Figure>
        </FigureProvider>
      </>
    );

    // Both should start from Fig. 1 due to separate providers
    const text = container.textContent;
    expect(text).toMatch(/Fig\. 1:.*First provider/);
    expect(text).toMatch(/Fig\. 1:.*Second provider/);
  });
});
