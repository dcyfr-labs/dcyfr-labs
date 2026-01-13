import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAnchorExpansion } from "@/lib/hooks";

describe("useAnchorExpansion", () => {
  let mockWindowLocation: any;
  let mockGetElementById: any;
  let mockQuerySelector: any;
  let mockScrollIntoView: any;

  beforeEach(() => {
    // Mock window.location
    mockWindowLocation = {
      hash: "",
    };
    Object.defineProperty(window, "location", {
      value: mockWindowLocation,
      writable: true,
    });

    // Mock document.getElementById
    mockGetElementById = vi.spyOn(document, "getElementById");

    // Mock document.querySelector
    mockQuerySelector = vi.spyOn(document, "querySelector");

    // Mock scrollIntoView
    mockScrollIntoView = vi.fn();

    // Clear any existing event listeners
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should not do anything when hash is empty", () => {
    mockWindowLocation.hash = "";
    renderHook(() => useAnchorExpansion());

    expect(mockGetElementById).not.toHaveBeenCalled();
  });

  it("should find and scroll to target element with hash", async () => {
    mockWindowLocation.hash = "#test-heading";

    const mockElement = document.createElement("div");
    mockElement.scrollIntoView = mockScrollIntoView;
    mockGetElementById.mockReturnValue(mockElement);

    renderHook(() => useAnchorExpansion());

    vi.advanceTimersByTime(100);

    expect(mockGetElementById).toHaveBeenCalledWith("test-heading");
    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });

  it("should expand CollapsibleSection when target is inside it", async () => {
    mockWindowLocation.hash = "#inside-collapsible";

    // Create mock collapsible content div
    const contentDiv = document.createElement("div");
    contentDiv.id = "collapsible-content-my-section";

    // Create mock target element
    const targetElement = document.createElement("h2");
    targetElement.id = "inside-collapsible";
    contentDiv.appendChild(targetElement);
    targetElement.scrollIntoView = mockScrollIntoView;

    // Mock getElementById to return our structure
    mockGetElementById.mockImplementation((id: string) => {
      if (id === "inside-collapsible") return targetElement;
      return null;
    });

    // Create mock button
    const mockButton = document.createElement("button");
    mockButton.setAttribute("aria-controls", "collapsible-content-my-section");
    mockButton.setAttribute("aria-expanded", "false");
    mockButton.click = vi.fn();

    mockQuerySelector.mockImplementation((selector: string) => {
      if (
        selector === 'button[aria-controls="collapsible-content-my-section"]'
      ) {
        return mockButton;
      }
      return null;
    });

    renderHook(() => useAnchorExpansion());

    vi.advanceTimersByTime(100);

    expect(mockButton.click).toHaveBeenCalled();
  });

  it("should expand Footnotes when target is inside footnotes", async () => {
    mockWindowLocation.hash = "#footnote-1";

    // Create mock footnotes content div
    const contentDiv = document.createElement("div");
    contentDiv.id = "footnotes-content";

    // Create mock target element
    const targetElement = document.createElement("a");
    targetElement.id = "footnote-1";
    contentDiv.appendChild(targetElement);
    targetElement.scrollIntoView = mockScrollIntoView;

    // Mock getElementById to return our structure
    mockGetElementById.mockImplementation((id: string) => {
      if (id === "footnote-1") return targetElement;
      return null;
    });

    // Create mock button
    const mockButton = document.createElement("button");
    mockButton.setAttribute("aria-controls", "footnotes-content");
    mockButton.setAttribute("aria-expanded", "false");
    mockButton.click = vi.fn();

    mockQuerySelector.mockImplementation((selector: string) => {
      if (selector === 'button[aria-controls="footnotes-content"]') {
        return mockButton;
      }
      return null;
    });

    renderHook(() => useAnchorExpansion());

    vi.advanceTimersByTime(100);

    expect(mockButton.click).toHaveBeenCalled();
  });

  it("should expand RiskAccordion when target is inside it", async () => {
    mockWindowLocation.hash = "#risk-ASI01-detail";

    // Create mock risk content div
    const contentDiv = document.createElement("div");
    contentDiv.id = "risk-ASI01-content";

    // Create mock target element
    const targetElement = document.createElement("p");
    targetElement.id = "risk-ASI01-detail";
    contentDiv.appendChild(targetElement);
    targetElement.scrollIntoView = mockScrollIntoView;

    // Mock getElementById to return our structure
    mockGetElementById.mockImplementation((id: string) => {
      if (id === "risk-ASI01-detail") return targetElement;
      return null;
    });

    // Create mock button
    const mockButton = document.createElement("button");
    mockButton.setAttribute("aria-controls", "risk-ASI01-content");
    mockButton.setAttribute("aria-expanded", "false");
    mockButton.click = vi.fn();

    mockQuerySelector.mockImplementation((selector: string) => {
      if (selector === 'button[aria-controls="risk-ASI01-content"]') {
        return mockButton;
      }
      return null;
    });

    renderHook(() => useAnchorExpansion());

    vi.advanceTimersByTime(100);

    expect(mockButton.click).toHaveBeenCalled();
  });

  it("should not click button if already expanded", async () => {
    mockWindowLocation.hash = "#inside-collapsible";

    // Create mock collapsible content div
    const contentDiv = document.createElement("div");
    contentDiv.id = "collapsible-content-my-section";

    // Create mock target element
    const targetElement = document.createElement("h2");
    targetElement.id = "inside-collapsible";
    contentDiv.appendChild(targetElement);
    targetElement.scrollIntoView = mockScrollIntoView;

    // Mock getElementById to return our structure
    mockGetElementById.mockImplementation((id: string) => {
      if (id === "inside-collapsible") return targetElement;
      return null;
    });

    // Create mock button - already expanded
    const mockButton = document.createElement("button");
    mockButton.setAttribute("aria-controls", "collapsible-content-my-section");
    mockButton.setAttribute("aria-expanded", "true"); // Already expanded
    mockButton.click = vi.fn();

    mockQuerySelector.mockImplementation((selector: string) => {
      if (
        selector === 'button[aria-controls="collapsible-content-my-section"]'
      ) {
        return mockButton;
      }
      return null;
    });

    renderHook(() => useAnchorExpansion());

    vi.advanceTimersByTime(100);

    expect(mockButton.click).not.toHaveBeenCalled();
  });

  it("should listen to hashchange events", async () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");

    renderHook(() => useAnchorExpansion());

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "hashchange",
      expect.any(Function)
    );

    addEventListenerSpy.mockRestore();
  });

  it("should remove hashchange listener on cleanup", async () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useAnchorExpansion());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "hashchange",
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });
});
