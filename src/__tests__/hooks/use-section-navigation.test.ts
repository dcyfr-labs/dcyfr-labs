import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSectionNavigation } from "@/hooks/use-section-navigation";

describe("useSectionNavigation", () => {
  let sections: HTMLElement[];

  beforeEach(() => {
    // Create mock sections
    sections = [
      document.createElement("section"),
      document.createElement("section"),
      document.createElement("section"),
    ];

    sections.forEach((section, i) => {
      section.dataset.section = "";
      section.setAttribute("id", `section-${i}`);
      Object.defineProperty(section, "offsetTop", {
        value: i * 1000,
        writable: true,
      });
      document.body.appendChild(section);
    });

    // Mock window.scrollTo
    window.scrollTo = vi.fn();
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
  });

  afterEach(() => {
    // Cleanup
    sections.forEach((section) => document.body.removeChild(section));
    vi.clearAllMocks();
  });

  it("should navigate to next section on PageDown", () => {
    const { result } = renderHook(() => useSectionNavigation());

    act(() => {
      const event = new KeyboardEvent("keydown", { key: "PageDown" });
      window.dispatchEvent(event);
    });

    expect(window.scrollTo).toHaveBeenCalled();
  });

  it("should navigate to previous section on PageUp", () => {
    // Set initial scroll position to second section
    Object.defineProperty(window, "scrollY", { value: 1000, writable: true });

    const { result } = renderHook(() => useSectionNavigation());

    act(() => {
      const event = new KeyboardEvent("keydown", { key: "PageUp" });
      window.dispatchEvent(event);
    });

    expect(window.scrollTo).toHaveBeenCalled();
  });

  it("should ignore keyboard events when typing in inputs", () => {
    const { result } = renderHook(() => useSectionNavigation());
    const input = document.createElement("input");
    document.body.appendChild(input);

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "PageDown",
        bubbles: true,
      });
      Object.defineProperty(event, "target", { value: input });
      input.dispatchEvent(event);
    });

    expect(window.scrollTo).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it("should ignore keyboard events with modifier keys", () => {
    const { result } = renderHook(() => useSectionNavigation());

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "PageDown",
        ctrlKey: true,
      });
      window.dispatchEvent(event);
    });

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("should respect disabled prop", () => {
    const { result } = renderHook(() =>
      useSectionNavigation({ disabled: true })
    );

    act(() => {
      const event = new KeyboardEvent("keydown", { key: "PageDown" });
      window.dispatchEvent(event);
    });

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("should return navigation methods", () => {
    const { result } = renderHook(() => useSectionNavigation());

    expect(result.current).toHaveProperty("navigateToNextSection");
    expect(result.current).toHaveProperty("navigateToPreviousSection");
    expect(result.current).toHaveProperty("scrollToSection");
    expect(result.current).toHaveProperty("getSections");
    expect(typeof result.current.navigateToNextSection).toBe("function");
  });

  it("should get all sections", () => {
    const { result } = renderHook(() => useSectionNavigation());

    const foundSections = result.current.getSections();
    expect(foundSections).toHaveLength(3);
  });
});
