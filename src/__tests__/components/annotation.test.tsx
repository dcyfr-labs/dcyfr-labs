import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Annotation, AnnotationVariants } from "@/components/common";

// Mock rough-notation library
const mockShow = vi.fn();
const mockHide = vi.fn();
const mockRemove = vi.fn();
const mockAnnotate = vi.fn();

vi.mock("rough-notation", () => ({
  annotate: (...args: unknown[]) => {
    mockAnnotate(...args);
    return {
      show: mockShow,
      hide: mockHide,
      remove: mockRemove,
    };
  },
}));

describe("Annotation Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset IntersectionObserver mock with proper class implementation
    class MockIntersectionObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      constructor(callback: IntersectionObserverCallback) {
        // Store callback for potential triggering in tests
      }
    }
    window.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("should render children content", () => {
      render(<Annotation>Test content</Annotation>);
      expect(screen.getByText("Test content")).toBeInTheDocument();
    });

    it("should render as a span element", () => {
      const { container } = render(<Annotation>Test</Annotation>);
      expect(container.querySelector("span")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <Annotation className="custom-class">Test</Annotation>
      );
      expect(container.querySelector("span")?.className).toContain(
        "custom-class"
      );
    });
  });

  describe("Annotation Creation", () => {
    it("should create annotation with default type (underline)", () => {
      render(<Annotation>Test</Annotation>);

      expect(mockAnnotate).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          type: "underline",
        })
      );
    });

    it("should create annotation with specified type", () => {
      render(<Annotation type="box">Test</Annotation>);

      expect(mockAnnotate).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          type: "box",
        })
      );
    });

    it("should create annotation with custom color", () => {
      render(<Annotation color="#ff0000">Test</Annotation>);

      expect(mockAnnotate).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          color: "#ff0000",
        })
      );
    });

    it("should create annotation with custom stroke width", () => {
      render(<Annotation strokeWidth={4}>Test</Annotation>);

      expect(mockAnnotate).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          strokeWidth: 4,
        })
      );
    });

    it("should create annotation with custom animation duration", () => {
      render(<Annotation animationDuration={1500}>Test</Annotation>);

      expect(mockAnnotate).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          animationDuration: 1500,
        })
      );
    });

    it("should create annotation with custom iterations", () => {
      render(<Annotation iterations={3}>Test</Annotation>);

      expect(mockAnnotate).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          iterations: 3,
        })
      );
    });

    it("should create annotation with custom padding", () => {
      render(<Annotation padding={10}>Test</Annotation>);

      expect(mockAnnotate).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          padding: 10,
        })
      );
    });

    it("should enable multiline by default", () => {
      render(<Annotation>Test</Annotation>);

      expect(mockAnnotate).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          multiline: true,
        })
      );
    });

    it("should pass brackets config for bracket type", () => {
      render(
        <Annotation type="bracket" brackets="left">
          Test
        </Annotation>
      );

      expect(mockAnnotate).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          type: "bracket",
          brackets: ["left"],
        })
      );
    });

    it("should pass array of brackets", () => {
      render(
        <Annotation type="bracket" brackets={["left", "right"]}>
          Test
        </Annotation>
      );

      expect(mockAnnotate).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          brackets: ["left", "right"],
        })
      );
    });
  });

  describe("Show Behavior", () => {
    it("should show annotation when show prop is true", async () => {
      render(<Annotation show>Test</Annotation>);

      await waitFor(() => {
        expect(mockShow).toHaveBeenCalled();
      });
    });

    it("should not show annotation when show is false", async () => {
      render(<Annotation show={false}>Test</Annotation>);

      // Wait a bit to ensure show is not called
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(mockShow).not.toHaveBeenCalled();
    });

    it("should delay showing when animationDelay is set", async () => {
      vi.useFakeTimers();
      render(
        <Annotation show animationDelay={100}>
          Test
        </Annotation>
      );

      expect(mockShow).not.toHaveBeenCalled();

      // Advance timer and flush promises
      await vi.advanceTimersByTimeAsync(150);

      expect(mockShow).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe("Scroll Animation", () => {
    it("should set up IntersectionObserver when animateOnScroll is true", () => {
      const observeSpy = vi.fn();
      const disconnectSpy = vi.fn();

      class MockIntersectionObserver {
        observe = observeSpy;
        unobserve = vi.fn();
        disconnect = disconnectSpy;
        constructor() {}
      }
      window.IntersectionObserver =
        MockIntersectionObserver as unknown as typeof IntersectionObserver;

      render(<Annotation animateOnScroll>Test</Annotation>);

      expect(observeSpy).toHaveBeenCalled();
    });

    it("should not show immediately when animateOnScroll is true", async () => {
      render(
        <Annotation animateOnScroll show>
          Test
        </Annotation>
      );

      // Show should not be called because animateOnScroll takes precedence
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(mockShow).not.toHaveBeenCalled();
    });

    it("should disconnect observer on unmount", () => {
      const disconnectSpy = vi.fn();

      class MockIntersectionObserver {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = disconnectSpy;
        constructor() {}
      }
      window.IntersectionObserver =
        MockIntersectionObserver as unknown as typeof IntersectionObserver;

      const { unmount } = render(<Annotation animateOnScroll>Test</Annotation>);
      unmount();

      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe("Cleanup", () => {
    it("should remove annotation on unmount", () => {
      const { unmount } = render(<Annotation>Test</Annotation>);
      unmount();

      expect(mockRemove).toHaveBeenCalled();
    });
  });

  describe("Default Colors", () => {
    it("should use yellow color for highlight type", () => {
      render(<Annotation type="highlight">Test</Annotation>);

      expect(mockAnnotate).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          color: "oklch(0.95 0.15 85)",
        })
      );
    });

    it("should use primary color for underline type", () => {
      render(<Annotation type="underline">Test</Annotation>);

      expect(mockAnnotate).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          color: "var(--primary)",
        })
      );
    });

    it("should use muted-foreground for bracket type", () => {
      render(<Annotation type="bracket">Test</Annotation>);

      expect(mockAnnotate).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          color: "var(--muted-foreground)",
        })
      );
    });
  });

  describe("Annotation Types", () => {
    const types: Array<
      | "underline"
      | "box"
      | "circle"
      | "highlight"
      | "strike-through"
      | "crossed-off"
      | "bracket"
    > = [
      "underline",
      "box",
      "circle",
      "highlight",
      "strike-through",
      "crossed-off",
      "bracket",
    ];

    types.forEach((type) => {
      it(`should create ${type} annotation`, () => {
        render(<Annotation type={type}>Test</Annotation>);

        expect(mockAnnotate).toHaveBeenCalledWith(
          expect.any(HTMLElement),
          expect.objectContaining({
            type,
          })
        );
      });
    });
  });
});

describe("AnnotationVariants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render Highlight variant", () => {
    render(<AnnotationVariants.Highlight>Test</AnnotationVariants.Highlight>);

    expect(mockAnnotate).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        type: "highlight",
        color: "oklch(0.95 0.15 85)",
      })
    );
  });

  it("should render Underline variant", () => {
    render(<AnnotationVariants.Underline>Test</AnnotationVariants.Underline>);

    expect(mockAnnotate).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        type: "underline",
      })
    );
  });

  it("should render Circle variant with padding", () => {
    render(<AnnotationVariants.Circle>Test</AnnotationVariants.Circle>);

    expect(mockAnnotate).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        type: "circle",
        padding: 10,
      })
    );
  });

  it("should render Box variant", () => {
    render(<AnnotationVariants.Box>Test</AnnotationVariants.Box>);

    expect(mockAnnotate).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        type: "box",
      })
    );
  });

  it("should render StrikeThrough variant with destructive color", () => {
    render(
      <AnnotationVariants.StrikeThrough>Test</AnnotationVariants.StrikeThrough>
    );

    expect(mockAnnotate).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        type: "strike-through",
        color: "var(--destructive)",
      })
    );
  });

  it("should render CrossedOff variant with destructive color", () => {
    render(<AnnotationVariants.CrossedOff>Test</AnnotationVariants.CrossedOff>);

    expect(mockAnnotate).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        type: "crossed-off",
        color: "var(--destructive)",
      })
    );
  });

  it("should pass additional props to variants", () => {
    render(
      <AnnotationVariants.Highlight strokeWidth={5}>
        Test
      </AnnotationVariants.Highlight>
    );

    expect(mockAnnotate).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        strokeWidth: 5,
      })
    );
  });
});
