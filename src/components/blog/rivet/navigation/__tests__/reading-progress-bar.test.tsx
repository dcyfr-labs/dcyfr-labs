import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReadingProgressBar } from "../reading-progress-bar";

describe("ReadingProgressBar", () => {
  let scrollYSpy: ReturnType<typeof vi.spyOn>;
  let scrollEventListener: EventListener;

  beforeEach(() => {
    // Mock scrollY
    scrollYSpy = vi.spyOn(window, "scrollY", "get").mockReturnValue(0);

    // Mock document height
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 2000,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 800,
    });

    // Capture scroll event listener
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    scrollEventListener = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("renders with default props", () => {
      render(<ReadingProgressBar />);
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toBeInTheDocument();
    });

    it("renders at top position by default", () => {
      const { container } = render(<ReadingProgressBar />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("top-0");
    });

    it("renders at bottom when position=bottom", () => {
      const { container } = render(<ReadingProgressBar position="bottom" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("bottom-0");
    });

    it("applies custom height", () => {
      const { container } = render(<ReadingProgressBar height={8} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ height: "8px" });
    });
  });

  describe("Progress Calculation", () => {
    it("shows 0% progress at top of page", () => {
      scrollYSpy.mockReturnValue(0);
      render(<ReadingProgressBar />);
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-valuenow", "0");
    });

    it("shows 50% progress at middle of page", () => {
      // Document height: 2000, innerHeight: 800
      // Scrollable height: 2000 - 800 = 1200
      // Scroll to 600 (50% of 1200)
      scrollYSpy.mockReturnValue(600);
      render(<ReadingProgressBar />);
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-valuenow", "50");
    });

    it("shows 100% progress at bottom of page", () => {
      scrollYSpy.mockReturnValue(1200);
      render(<ReadingProgressBar />);
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-valuenow", "100");
    });
  });

  describe("Color Variants", () => {
    it("applies primary color by default", () => {
      const { container } = render(<ReadingProgressBar />);
      const progressDiv = container.querySelector(".bg-primary");
      expect(progressDiv).toBeInTheDocument();
    });

    it("applies secondary color", () => {
      const { container } = render(<ReadingProgressBar color="secondary" />);
      const progressDiv = container.querySelector(".bg-secondary");
      expect(progressDiv).toBeInTheDocument();
    });

    it("applies accent color", () => {
      const { container } = render(<ReadingProgressBar color="accent" />);
      const progressDiv = container.querySelector(".bg-accent");
      expect(progressDiv).toBeInTheDocument();
    });
  });

  describe("Percentage Display", () => {
    it("does not show percentage by default", () => {
      render(<ReadingProgressBar />);
      expect(screen.queryByText("%")).not.toBeInTheDocument();
    });

    it("shows percentage when showPercentage=true", () => {
      scrollYSpy.mockReturnValue(600); // 50%
      render(<ReadingProgressBar showPercentage />);
      expect(screen.getByText("50%")).toBeInTheDocument();
    });

    it("rounds percentage to nearest integer", () => {
      scrollYSpy.mockReturnValue(666); // 55.5%
      render(<ReadingProgressBar showPercentage />);
      expect(screen.getByText("56%")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has progressbar role", () => {
      render(<ReadingProgressBar />);
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("has aria-label", () => {
      render(<ReadingProgressBar />);
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-label", "Reading progress");
    });

    it("has aria-valuenow matching progress", () => {
      scrollYSpy.mockReturnValue(300); // 25%
      render(<ReadingProgressBar />);
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-valuenow", "25");
    });

    it("has aria-valuemin=0 and aria-valuemax=100", () => {
      render(<ReadingProgressBar />);
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-valuemin", "0");
      expect(progressBar).toHaveAttribute("aria-valuemax", "100");
    });
  });

  describe("Custom className", () => {
    it("applies custom className", () => {
      const { container } = render(
        <ReadingProgressBar className="custom-class" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("custom-class");
    });
  });
});
