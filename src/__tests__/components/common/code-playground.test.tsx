import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CodePlayground } from "@/components/common";

describe("CodePlayground Component", () => {
  describe("rendering", () => {
    it("shows error for invalid template ID", () => {
      render(<CodePlayground template="non-existent-template" />);
      expect(screen.getByText(/Code playground template not found/)).toBeInTheDocument();
    });

    it("renders loading state initially", () => {
      render(<CodePlayground template="react-counter" />);
      expect(screen.getByText(/Loading playground/i)).toBeInTheDocument();
    });
  });

  describe("mobile behavior", () => {
    it("detects mobile viewport", () => {
      // Component should render without errors even on mobile
      const originalWidth = window.innerWidth;
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });

      expect(() => {
        render(<CodePlayground template="react-counter" />);
      }).not.toThrow();

      // Restore width
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: originalWidth,
      });
    });
  });

  describe("props", () => {
    it("accepts template prop", () => {
      expect(() => {
        render(<CodePlayground template="react-counter" />);
      }).not.toThrow();
    });

    it("accepts height prop", () => {
      expect(() => {
        render(<CodePlayground template="react-counter" height="600px" />);
      }).not.toThrow();
    });

    it("accepts title prop", () => {
      expect(() => {
        render(<CodePlayground template="react-counter" title="Custom Title" />);
      }).not.toThrow();
    });

    it("accepts showEditor prop", () => {
      expect(() => {
        render(<CodePlayground template="react-counter" showEditor={false} />);
      }).not.toThrow();
    });

    it("accepts showOpenButton prop", () => {
      expect(() => {
        render(<CodePlayground template="react-counter" showOpenButton={false} />);
      }).not.toThrow();
    });
  });
});
