import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage, useLocalStorageValue } from "@/hooks/use-local-storage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should return initial value when key doesn't exist", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));
    
    expect(result.current[0]).toBe("initial");
  });

  it("should persist value to localStorage", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));
    
    act(() => {
      result.current[1]("updated");
    });

    expect(result.current[0]).toBe("updated");
    expect(localStorage.getItem("test-key")).toBe(JSON.stringify("updated"));
  });

  it("should retrieve persisted value on mount", () => {
    localStorage.setItem("test-key", JSON.stringify("persisted"));

    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    expect(result.current[0]).toBe("persisted");
  });

  it("should handle function updater", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it("should handle complex objects", () => {
    const { result } = renderHook(() =>
      useLocalStorage("test-key", { count: 0, name: "test" })
    );

    act(() => {
      result.current[1]({ count: 5, name: "updated" });
    });

    expect(result.current[0]).toEqual({ count: 5, name: "updated" });
    expect(JSON.parse(localStorage.getItem("test-key") || "{}")).toEqual({
      count: 5,
      name: "updated",
    });
  });

  it("should remove value from localStorage", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    act(() => {
      result.current[1]("updated");
    });

    expect(localStorage.getItem("test-key")).toBe(JSON.stringify("updated"));

    act(() => {
      result.current[2](); // removeValue
    });

    expect(result.current[0]).toBe("initial");
    expect(localStorage.getItem("test-key")).toBeNull();
  });

  it("should handle invalid JSON gracefully", () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    
    localStorage.setItem("test-key", "invalid-json{");

    const { result } = renderHook(() => useLocalStorage("test-key", "fallback"));

    expect(result.current[0]).toBe("fallback");
    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  it("should sync across multiple instances", () => {
    const { result: result1 } = renderHook(() => useLocalStorage("sync-key", "initial"));
    const { result: result2 } = renderHook(() => useLocalStorage("sync-key", "initial"));

    act(() => {
      result1.current[1]("updated");
    });

    // Simulate storage event
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "sync-key",
          newValue: JSON.stringify("updated"),
        })
      );
    });

    expect(result2.current[0]).toBe("updated");
  });

  it("should handle removal across instances", () => {
    const { result: result1 } = renderHook(() => useLocalStorage("sync-key", "initial"));
    const { result: result2 } = renderHook(() => useLocalStorage("sync-key", "initial"));

    act(() => {
      result1.current[1]("value");
    });

    act(() => {
      result1.current[2](); // removeValue
    });

    // Simulate storage event
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "sync-key",
          newValue: null,
        })
      );
    });

    expect(result2.current[0]).toBe("initial");
  });
});

describe("useLocalStorageValue", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return default value when key doesn't exist", () => {
    expect(useLocalStorageValue("missing-key", "default")).toBe("default");
  });

  it("should return stored value when key exists", () => {
    localStorage.setItem("stored-key", JSON.stringify("stored-value"));
    
    expect(useLocalStorageValue("stored-key", "default")).toBe("stored-value");
  });

  it("should handle complex objects", () => {
    const obj = { foo: "bar", baz: 123 };
    localStorage.setItem("object-key", JSON.stringify(obj));

    expect(useLocalStorageValue("object-key", {})).toEqual(obj);
  });

  it("should handle invalid JSON gracefully", () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    
    localStorage.setItem("invalid-key", "not-json{");

    expect(useLocalStorageValue("invalid-key", "fallback")).toBe("fallback");
    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });
});
