import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useKeyboardShortcut,
  getModifierKey,
  formatShortcut,
  type KeyboardShortcut,
} from "@/hooks/use-keyboard-shortcut";

describe("useKeyboardShortcut", () => {
  let mockCallback: (event: KeyboardEvent) => void;

  beforeEach(() => {
    mockCallback = vi.fn() as (event: KeyboardEvent) => void;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should call callback when matching shortcut is pressed", () => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: "k",
        metaKey: true,
        callback: mockCallback,
      },
    ];

    renderHook(() => useKeyboardShortcut(shortcuts));

    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should not call callback for non-matching shortcuts", () => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: "k",
        metaKey: true,
        callback: mockCallback,
      },
    ];

    renderHook(() => useKeyboardShortcut(shortcuts));

    const event = new KeyboardEvent("keydown", {
      key: "b",
      metaKey: true,
      bubbles: true,
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it("should prevent default behavior when shortcut matches", () => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: "k",
        metaKey: true,
        callback: mockCallback,
      },
    ];

    renderHook(() => useKeyboardShortcut(shortcuts));

    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    act(() => {
      window.dispatchEvent(event);
    });

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("should not trigger in input fields by default", () => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: "k",
        metaKey: true,
        callback: mockCallback,
        preventInInput: true,
      },
    ];

    renderHook(() => useKeyboardShortcut(shortcuts));

    const input = document.createElement("input");
    document.body.appendChild(input);

    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    });
    Object.defineProperty(event, "target", { value: input, configurable: true });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(mockCallback).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it("should trigger in input fields when preventInInput is false", () => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: "/",
        callback: mockCallback,
        preventInInput: false,
      },
    ];

    renderHook(() => useKeyboardShortcut(shortcuts));

    const input = document.createElement("input");
    document.body.appendChild(input);

    const event = new KeyboardEvent("keydown", {
      key: "/",
      bubbles: true,
    });
    Object.defineProperty(event, "target", { value: input, configurable: true });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(mockCallback).toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it("should handle multiple shortcuts", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const shortcuts: KeyboardShortcut[] = [
      { key: "k", metaKey: true, callback: callback1 },
      { key: "b", metaKey: true, callback: callback2 },
    ];

    renderHook(() => useKeyboardShortcut(shortcuts));

    // Trigger first shortcut
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
    });

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();

    // Trigger second shortcut
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "b", metaKey: true, bubbles: true }));
    });

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it("should trigger shortcut without modifier keys", () => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: "/",
        callback: mockCallback,
      },
    ];

    renderHook(() => useKeyboardShortcut(shortcuts));

    const event = new KeyboardEvent("keydown", {
      key: "/",
      bubbles: true,
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(mockCallback).toHaveBeenCalled();
  });

  it("should cleanup event listener on unmount", () => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: "k",
        metaKey: true,
        callback: mockCallback,
      },
    ];

    const { unmount } = renderHook(() => useKeyboardShortcut(shortcuts));

    unmount();

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
    });

    expect(mockCallback).not.toHaveBeenCalled();
  });
});

describe("getModifierKey", () => {
  it("should return ⌘ on Mac", () => {
    Object.defineProperty(navigator, "platform", {
      value: "MacIntel",
      configurable: true,
    });

    expect(getModifierKey()).toBe("⌘");
  });

  it("should return Ctrl on Windows", () => {
    Object.defineProperty(navigator, "platform", {
      value: "Win32",
      configurable: true,
    });

    expect(getModifierKey()).toBe("Ctrl");
  });
});

describe("formatShortcut", () => {
  it("should format simple meta+key shortcut", () => {
    // Mock Mac platform
    Object.defineProperty(navigator, "platform", {
      value: "MacIntel",
      configurable: true,
    });

    const shortcut: KeyboardShortcut = {
      key: "k",
      metaKey: true,
      callback: vi.fn(),
    };

    expect(formatShortcut(shortcut)).toBe("⌘+K");
  });

  it("should format complex shortcut with multiple modifiers", () => {
    Object.defineProperty(navigator, "platform", {
      value: "MacIntel",
      configurable: true,
    });

    const shortcut: KeyboardShortcut = {
      key: "p",
      metaKey: true,
      shiftKey: true,
      callback: vi.fn(),
    };

    expect(formatShortcut(shortcut)).toBe("⌘+Shift+P");
  });

  it("should format shortcut with alt key", () => {
    Object.defineProperty(navigator, "platform", {
      value: "MacIntel",
      configurable: true,
    });

    const shortcut: KeyboardShortcut = {
      key: "t",
      metaKey: true,
      altKey: true,
      callback: vi.fn(),
    };

    expect(formatShortcut(shortcut)).toBe("⌘+⌥+T");
  });
});
