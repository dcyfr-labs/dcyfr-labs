import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContactForm } from "@/components/common";
import { useSearchParams } from "next/navigation";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => ({
    get: vi.fn(() => null),
  })),
}));

// Mock toast
vi.mock("@/lib/toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

describe("ContactForm - Role Parameter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe("Form Submission with Role", () => {
    it("should include role in form submission when URL parameter is present", async () => {
      const user = userEvent.setup();
      const mockGet = vi.fn((key: string) => (key === "role" ? "executive" : null));
      const mockSearchParams = { get: mockGet };
      vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, message: "Message sent" }),
      });
      global.fetch = mockFetch;

      render(<ContactForm />);

      // Verify the hidden role field is present and has the value from URL
      const roleInput = document.querySelector('input[name="role"]');
      expect(roleInput).toBeInTheDocument();
      expect(roleInput).toHaveAttribute("type", "hidden");
      
      // Fill out form
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const messageInput = screen.getByLabelText(/message/i);

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");
      await user.type(messageInput, "This is a test message with sufficient length");

      // Submit form
      const submitButton = screen.getByRole("button", { name: /send message/i });
      await user.click(submitButton);

      // Verify fetch was called with role
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/contact",
          expect.objectContaining({
            method: "POST",
            body: expect.stringContaining('"role":"executive"'),
          })
        );
      });
    });

    it("should not include role if not selected", async () => {
      const user = userEvent.setup();
      const mockSearchParams = {
        get: vi.fn(() => null),
      };
      vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, message: "Message sent" }),
      });
      global.fetch = mockFetch;

      render(<ContactForm />);

      // Fill out form (without role parameter in URL)
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const messageInput = screen.getByLabelText(/message/i);

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");
      await user.type(messageInput, "This is a test message with sufficient length");

      // Submit form
      const submitButton = screen.getByRole("button", { name: /send message/i });
      await user.click(submitButton);

      // Verify fetch was called without role in body
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
        const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(callBody.role).toBeUndefined();
      });
    });
  });

  describe("Role Field UI", () => {
    it("should have hidden role field for URL parameter capture", () => {
      render(<ContactForm />);

      // Verify role field is hidden
      const roleInput = document.querySelector('input[name="role"]');
      expect(roleInput).toBeInTheDocument();
      expect(roleInput).toHaveAttribute("type", "hidden");
      expect(roleInput).toHaveAttribute("aria-hidden", "true");
    });

    it("should populate hidden role field from URL parameter", async () => {
      const mockGet = vi.fn((key: string) => (key === "role" ? "developer" : null));
      const mockSearchParams = { get: mockGet };
      vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

      render(<ContactForm />);

      // Wait for the role input to be populated
      await waitFor(() => {
        const roleInput = document.querySelector('input[name="role"]') as HTMLInputElement;
        expect(roleInput).toBeInTheDocument();
        expect(roleInput.value).toBe("developer");
      });
    });
  });
});

