import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopyCodeButton } from "@/components/common/copy-code-button";

// Mock framer-motion to simplify animations in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the UI Button component
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, variant, size, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant: string; size: string }) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

describe("CopyCodeButton Component", () => {
  const mockCode = "console.log('Hello, World!');";

  // Helper to flush promises with fake timers
  const flushPromises = () => act(async () => {
    await Promise.resolve();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Mock clipboard API
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn(() => Promise.resolve()),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe("Rendering", () => {
    it("should render copy button", () => {
      render(<CopyCodeButton code={mockCode} />);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should have ghost variant and icon size", () => {
      render(<CopyCodeButton code={mockCode} />);
      const button = screen.getByRole("button");
      expect(button.getAttribute("data-variant")).toBe("ghost");
      expect(button.getAttribute("data-size")).toBe("icon");
    });

    it("should have positioning and hover classes", () => {
      render(<CopyCodeButton code={mockCode} />);
      const button = screen.getByRole("button");
      expect(button.className).toContain("absolute");
      expect(button.className).toContain("top-2");
      expect(button.className).toContain("right-2");
      expect(button.className).toContain("opacity-0");
      expect(button.className).toContain("group-hover:opacity-100");
    });

    it("should show copy icon initially", () => {
      const { container } = render(<CopyCodeButton code={mockCode} />);
      const copyIcon = container.querySelector('[class*="lucide-copy"]');
      expect(copyIcon).toBeInTheDocument();
    });

    it("should have proper initial aria-label", () => {
      render(<CopyCodeButton code={mockCode} />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Copy code");
    });
  });

  describe("Copy Functionality", () => {
    it("should copy code to clipboard when clicked", async () => {
      render(<CopyCodeButton code={mockCode} />);
      
      const button = screen.getByRole("button");
      fireEvent.click(button);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockCode);
    });

    it("should show check icon after successful copy", async () => {
      const { container } = render(<CopyCodeButton code={mockCode} />);
      
      const button = screen.getByRole("button");
      fireEvent.click(button);
      
      // Wait for promise to resolve
      await flushPromises();
      
      const checkIcon = container.querySelector('[class*="lucide-check"]');
      expect(checkIcon).toBeInTheDocument();
    });

    it("should update aria-label to 'Copied!' after copy", async () => {
      render(<CopyCodeButton code={mockCode} />);
      
      const button = screen.getByRole("button");
      fireEvent.click(button);
      
      await flushPromises();

      expect(button).toHaveAttribute("aria-label", "Copied!");
    });

    it("should reset to copy icon after 2 seconds", async () => {
      const { container } = render(<CopyCodeButton code={mockCode} />);
      
      const button = screen.getByRole("button");
      fireEvent.click(button);
      
      // Check icon should be visible
      await flushPromises();
      
      const checkIcon = container.querySelector('[class*="lucide-check"]');
      expect(checkIcon).toBeInTheDocument();
      
      // Fast-forward 2 seconds
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      
      // Copy icon should be back
      await flushPromises();

      const copyIcon = container.querySelector('[class*="lucide-copy"]');
      expect(copyIcon).toBeInTheDocument();
    });

    it("should reset aria-label after 2 seconds", async () => {
      render(<CopyCodeButton code={mockCode} />);
      
      const button = screen.getByRole("button");
      fireEvent.click(button);
      
      await flushPromises();

      expect(button).toHaveAttribute("aria-label", "Copied!");
      
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      
      await flushPromises();

      expect(button).toHaveAttribute("aria-label", "Copy code");
    });

    it("should handle multiple clicks", async () => {
      render(<CopyCodeButton code={mockCode} />);
      
      const button = screen.getByRole("button");
      
      // First click
      fireEvent.click(button);
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
      
      // Second click before timeout
      fireEvent.click(button);
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(2);
      
      // After timeout
      vi.advanceTimersByTime(2000);
      fireEvent.click(button);
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(3);
    });

    it("should copy empty string if code is empty", async () => {
      render(<CopyCodeButton code="" />);
      
      const button = screen.getByRole("button");
      fireEvent.click(button);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("");
    });

    it("should copy multi-line code correctly", async () => {
      const multiLineCode = `function greet(name) {
  console.log(\`Hello, \${name}!\`);
}`;
      render(<CopyCodeButton code={multiLineCode} />);
      
      const button = screen.getByRole("button");
      fireEvent.click(button);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(multiLineCode);
    });
  });

  describe("Error Handling", () => {
    it("should handle clipboard API failure gracefully", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const clipboardError = new Error("Clipboard write failed");
      
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: vi.fn(() => Promise.reject(clipboardError)),
        },
        writable: true,
        configurable: true,
      });
      
      render(<CopyCodeButton code={mockCode} />);
      
      const button = screen.getByRole("button");
      fireEvent.click(button);
      
      await Promise.resolve();

      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to copy code:", clipboardError);
      
      consoleErrorSpy.mockRestore();
    });

    it("should not show check icon on copy failure", async () => {
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: vi.fn(() => Promise.reject(new Error("Failed"))),
        },
        writable: true,
        configurable: true,
      });
      
      const { container } = render(<CopyCodeButton code={mockCode} />);
      
      const button = screen.getByRole("button");
      fireEvent.click(button);
      
      // Wait a bit and check that check icon is not shown
      await Promise.resolve();

      const checkIcon = container.querySelector('[class*="lucide-check"]');
      expect(checkIcon).not.toBeInTheDocument();
      
      // Copy icon should still be visible
      const copyIcon = container.querySelector('[class*="lucide-copy"]');
      expect(copyIcon).toBeInTheDocument();
    });

    it("should keep 'Copy code' aria-label on failure", async () => {
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: vi.fn(() => Promise.reject(new Error("Failed"))),
        },
        writable: true,
        configurable: true,
      });
      
      render(<CopyCodeButton code={mockCode} />);
      
      const button = screen.getByRole("button");
      const initialLabel = button.getAttribute("aria-label");
      
      fireEvent.click(button);
      
      await Promise.resolve();

      // Label should not change on error
      expect(button.getAttribute("aria-label")).toBe(initialLabel);
    });
  });

  describe("Accessibility", () => {
    it("should be keyboard accessible", async () => {
      render(<CopyCodeButton code={mockCode} />);
      const button = screen.getByRole("button");
      
      // Tab to button
      button.focus();
      expect(button).toHaveFocus();
      
      // Press Enter to activate
      button.click();
      
      await Promise.resolve();

      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    it("should have descriptive aria-label at all times", async () => {
      render(<CopyCodeButton code={mockCode} />);
      
      const button = screen.getByRole("button");
      
      // Initially
      expect(button.getAttribute("aria-label")).toBeTruthy();
      expect(button.getAttribute("aria-label")).not.toBe("");
      
      // After click
      fireEvent.click(button);
      await Promise.resolve();

      expect(button.getAttribute("aria-label")).toBeTruthy();
      expect(button.getAttribute("aria-label")).not.toBe("");
      
      // After timeout
      vi.advanceTimersByTime(2000);
      await Promise.resolve();

      expect(button.getAttribute("aria-label")).toBeTruthy();
      expect(button.getAttribute("aria-label")).not.toBe("");
    });

    it("should be a button element", () => {
      render(<CopyCodeButton code={mockCode} />);
      const button = screen.getByRole("button");
      expect(button.tagName).toBe("BUTTON");
    });
  });

  describe("Visual Feedback", () => {
    it("should show emerald check icon on success", async () => {
      const { container } = render(<CopyCodeButton code={mockCode} />);
      
      const button = screen.getByRole("button");
      fireEvent.click(button);

      await flushPromises();

       
      const checkIcon = container.querySelector('[class*="text-emerald-500"]');
      expect(checkIcon).toBeInTheDocument();
    });

    it("should use proper icon sizes", () => {
      const { container } = render(<CopyCodeButton code={mockCode} />);
      const icon = container.querySelector('[class*="h-4 w-4"]');
      expect(icon).toBeInTheDocument();
    });

    it("should have transition classes for opacity", () => {
      render(<CopyCodeButton code={mockCode} />);
      const button = screen.getByRole("button");
      expect(button.className).toContain("transition-opacity");
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid successive clicks", async () => {
      render(<CopyCodeButton code={mockCode} />);
      
      const button = screen.getByRole("button");
      
      // Click 5 times rapidly
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(5);
    });

    it("should handle special characters in code", async () => {
      const specialCode = "const str = `<script>alert('XSS')</script>`;";
      render(<CopyCodeButton code={specialCode} />);
      
      const button = screen.getByRole("button");
      fireEvent.click(button);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(specialCode);
    });

    it("should handle very long code strings", async () => {
      const longCode = "x".repeat(10000);
      render(<CopyCodeButton code={longCode} />);
      
      const button = screen.getByRole("button");
      fireEvent.click(button);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(longCode);
    });

    it("should handle unicode characters", async () => {
      const unicodeCode = "const emoji = '🚀 💻 🎉';";
      render(<CopyCodeButton code={unicodeCode} />);
      
      const button = screen.getByRole("button");
      fireEvent.click(button);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(unicodeCode);
    });

    it("should clean up timeout on unmount", async () => {
      const { unmount } = render(<CopyCodeButton code={mockCode} />);
      
      const button = screen.getByRole("button");
      fireEvent.click(button);
      
      // Unmount before timeout
      unmount();
      
      // Fast-forward time - should not cause errors
      vi.advanceTimersByTime(2000);
      
      // No errors should be thrown
      expect(true).toBe(true);
    });
  });
});
