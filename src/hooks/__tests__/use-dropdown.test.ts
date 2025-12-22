import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDropdown } from "@/hooks/use-dropdown";

describe("useDropdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe("uncontrolled mode", () => {
    it("should start closed by default", () => {
      const { result } = renderHook(() => useDropdown());

      expect(result.current.isOpen).toBe(false);
    });

    it("should start open when defaultOpen is true", () => {
      const { result } = renderHook(() => useDropdown({ defaultOpen: true }));

      expect(result.current.isOpen).toBe(true);
    });

    it("should toggle state when toggle is called", () => {
      const { result } = renderHook(() => useDropdown());

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it("should open when open is called", () => {
      const { result } = renderHook(() => useDropdown());

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it("should close when close is called", () => {
      const { result } = renderHook(() => useDropdown({ defaultOpen: true }));

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe("controlled mode", () => {
    it("should use controlled state when isOpen is provided", () => {
      const onOpenChange = vi.fn();
      const { result } = renderHook(() =>
        useDropdown({ isOpen: true, onOpenChange })
      );

      expect(result.current.isOpen).toBe(true);
    });

    it("should call onOpenChange when toggle is called", () => {
      const onOpenChange = vi.fn();
      const { result } = renderHook(() =>
        useDropdown({ isOpen: false, onOpenChange })
      );

      act(() => {
        result.current.toggle();
      });

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it("should call onOpenChange when open is called", () => {
      const onOpenChange = vi.fn();
      const { result } = renderHook(() =>
        useDropdown({ isOpen: false, onOpenChange })
      );

      act(() => {
        result.current.open();
      });

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it("should call onOpenChange when close is called", () => {
      const onOpenChange = vi.fn();
      const { result } = renderHook(() =>
        useDropdown({ isOpen: true, onOpenChange })
      );

      act(() => {
        result.current.close();
      });

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("click outside detection", () => {
    it("should close when clicking outside the dropdown", () => {
      const { result } = renderHook(() => useDropdown({ defaultOpen: true }));

      // Create a container element
      const container = document.createElement("div");
      document.body.appendChild(container);

      // Mock the ref
      Object.defineProperty(result.current.ref, "current", {
        value: container,
        writable: true,
      });

      expect(result.current.isOpen).toBe(true);

      // Click outside
      act(() => {
        vi.runAllTimers();
        document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      expect(result.current.isOpen).toBe(false);

      document.body.removeChild(container);
    });

    it("should not close when clicking inside the dropdown", () => {
      const { result } = renderHook(() => useDropdown({ defaultOpen: true }));

      const container = document.createElement("div");
      document.body.appendChild(container);

      Object.defineProperty(result.current.ref, "current", {
        value: container,
        writable: true,
      });

      expect(result.current.isOpen).toBe(true);

      // Click inside
      act(() => {
        vi.runAllTimers();
        container.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      expect(result.current.isOpen).toBe(true);

      document.body.removeChild(container);
    });

    it("should not close when closeOnClickOutside is false", () => {
      const { result } = renderHook(() =>
        useDropdown({ defaultOpen: true, closeOnClickOutside: false })
      );

      expect(result.current.isOpen).toBe(true);

      act(() => {
        vi.runAllTimers();
        document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      expect(result.current.isOpen).toBe(true);
    });
  });

  describe("escape key handling", () => {
    it("should close when Escape is pressed", () => {
      const { result } = renderHook(() => useDropdown({ defaultOpen: true }));

      expect(result.current.isOpen).toBe(true);

      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      });

      expect(result.current.isOpen).toBe(false);
    });

    it("should not close when Escape is pressed and closeOnEscape is false", () => {
      const { result } = renderHook(() =>
        useDropdown({ defaultOpen: true, closeOnEscape: false })
      );

      expect(result.current.isOpen).toBe(true);

      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      });

      expect(result.current.isOpen).toBe(true);
    });

    it("should not close when other keys are pressed", () => {
      const { result } = renderHook(() => useDropdown({ defaultOpen: true }));

      expect(result.current.isOpen).toBe(true);

      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      });

      expect(result.current.isOpen).toBe(true);
    });
  });

  describe("props", () => {
    it("should provide correct trigger props", () => {
      const { result } = renderHook(() => useDropdown());

      expect(result.current.triggerProps).toEqual({
        onClick: expect.any(Function),
        "aria-haspopup": "menu",
        "aria-expanded": false,
      });
    });

    it("should update aria-expanded when open", () => {
      const { result } = renderHook(() => useDropdown({ defaultOpen: true }));

      expect(result.current.triggerProps["aria-expanded"]).toBe(true);
    });

    it("should provide correct content props", () => {
      const { result } = renderHook(() => useDropdown());

      expect(result.current.contentProps).toEqual({
        role: "menu",
      });
    });

    it("should toggle when triggerProps.onClick is called", () => {
      const { result } = renderHook(() => useDropdown());

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.triggerProps.onClick();
      });

      expect(result.current.isOpen).toBe(true);
    });
  });

  describe("cleanup", () => {
    it("should cleanup click listener on unmount", () => {
      const { result, unmount } = renderHook(() =>
        useDropdown({ defaultOpen: true })
      );

      const container = document.createElement("div");
      document.body.appendChild(container);

      Object.defineProperty(result.current.ref, "current", {
        value: container,
        writable: true,
      });

      unmount();

      // Click outside after unmount
      act(() => {
        vi.runAllTimers();
        document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      // State should not change (component is unmounted)
      expect(result.current.isOpen).toBe(true);

      document.body.removeChild(container);
    });

    it("should cleanup escape listener on unmount", () => {
      const { unmount } = renderHook(() =>
        useDropdown({ defaultOpen: true })
      );

      const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });
});
