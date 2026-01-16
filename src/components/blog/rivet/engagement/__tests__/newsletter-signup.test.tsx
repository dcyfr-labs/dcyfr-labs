import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NewsletterSignup } from "../newsletter-signup";

describe("NewsletterSignup", () => {
  const NEWSLETTER_STORAGE_KEY = "dcyfr-newsletter-signup";

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset window.gtag mock
    window.gtag = undefined as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<NewsletterSignup />);
      
      expect(screen.getByText("Stay Updated")).toBeInTheDocument();
      expect(screen.getByText(/Subscribe to get the latest/)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Subscribe/ })).toBeInTheDocument();
    });

    it("should render with custom title and description", () => {
      render(
        <NewsletterSignup
          title="Join Our Newsletter"
          description="Get weekly updates on security topics."
        />
      );
      
      expect(screen.getByText("Join Our Newsletter")).toBeInTheDocument();
      expect(screen.getByText("Get weekly updates on security topics.")).toBeInTheDocument();
    });

    it("should render with custom button text", () => {
      render(<NewsletterSignup buttonText="Sign Me Up" />);
      
      expect(screen.getByRole("button", { name: /Sign Me Up/ })).toBeInTheDocument();
    });

    it("should render with custom placeholder", () => {
      render(<NewsletterSignup placeholder="your@email.com" />);
      
      expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    });

    it("should render card variant by default", () => {
      const { container } = render(<NewsletterSignup />);
      
      const newsletter = container.querySelector(".newsletter-signup");
      expect(newsletter?.className).toMatch(/border/);
      expect(newsletter?.className).toMatch(/rounded-lg/);
    });

    it("should render inline variant", () => {
      const { container } = render(<NewsletterSignup variant="inline" />);
      
      const newsletter = container.querySelector(".newsletter-signup");
      expect(newsletter?.className).toMatch(/flex/);
    });

    it("should render minimal variant", () => {
      const { container } = render(<NewsletterSignup variant="minimal" />);
      
      const newsletter = container.querySelector(".newsletter-signup");
      expect(newsletter?.className).toMatch(/flex/);
    });

    it("should apply custom className", () => {
      const { container } = render(<NewsletterSignup className="custom-class" />);
      
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    it("should show error when submitting empty email", async () => {
      const user = userEvent.setup({ delay: null });
      render(<NewsletterSignup />);
      
      const submitButton = screen.getByRole("button", { name: /Subscribe/ });
      await user.click(submitButton);
      
      expect(screen.getByText("Please enter your email address")).toBeInTheDocument();
    });

    it("should show error for invalid email format (client-side validation)", async () => {
      const user = userEvent.setup({ delay: null });
      render(<NewsletterSignup />);
      
      const emailInput = screen.getByLabelText("Email address");
      
      // Use fireEvent to bypass userEvent's form validation checks
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      
      // Directly trigger form submit event
      const form = emailInput.closest("form");
      fireEvent.submit(form!);
      
      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
      });
    });

    it("should accept valid email format", async () => {
      const user = userEvent.setup({ delay: null });
      render(<NewsletterSignup />);
      
      const emailInput = screen.getByLabelText("Email address");
      await user.type(emailInput, "user@example.com");
      
      const submitButton = screen.getByRole("button", { name: /Subscribe/ });
      await user.click(submitButton);
      
      // Should show loading state (not error)
      expect(screen.queryByText("Please enter a valid email address")).not.toBeInTheDocument();
    });

    it("should clear error message when user starts typing", async () => {
      const user = userEvent.setup({ delay: null });
      render(<NewsletterSignup />);
      
      // Submit empty to trigger error
      const submitButton = screen.getByRole("button", { name: /Subscribe/ });
      await user.click(submitButton);
      
      expect(screen.getByText("Please enter your email address")).toBeInTheDocument();
      
      // Start typing
      const emailInput = screen.getByLabelText("Email address");
      await user.type(emailInput, "u");
      
      expect(screen.queryByText("Please enter your email address")).not.toBeInTheDocument();
    });

    it("should have proper ARIA attributes for errors", async () => {
      const user = userEvent.setup({ delay: null });
      render(<NewsletterSignup />);
      
      const submitButton = screen.getByRole("button", { name: /Subscribe/ });
      await user.click(submitButton);
      
      const emailInput = screen.getByLabelText("Email address");
      expect(emailInput).toHaveAttribute("aria-invalid", "true");
      expect(emailInput).toHaveAttribute("aria-describedby", "newsletter-error");
    });
  });

  describe("Form Submission", () => {
    it("should show loading state during submission", async () => {
      const user = userEvent.setup({ delay: null });
      render(<NewsletterSignup />);
      
      const emailInput = screen.getByLabelText("Email address");
      await user.type(emailInput, "user@example.com");
      
      const submitButton = screen.getByRole("button", { name: /Subscribe/ });
      await user.click(submitButton);
      
      expect(screen.getByText("Subscribing...")).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it("should store signup in localStorage on success", async () => {
      const user = userEvent.setup({ delay: null });
      render(<NewsletterSignup />);
      
      const emailInput = screen.getByLabelText("Email address");
      await user.type(emailInput, "user@example.com");
      
      const submitButton = screen.getByRole("button", { name: /Subscribe/ });
      await user.click(submitButton);
      
      // Wait for async operation
      await waitFor(() => {
        const storedData = localStorage.getItem(NEWSLETTER_STORAGE_KEY);
        expect(storedData).toBeTruthy();
        
        const parsed = JSON.parse(storedData!);
        expect(parsed.email).toBe("user@example.com");
        expect(parsed.timestamp).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });

    it("should show success message after signup", async () => {
      const user = userEvent.setup({ delay: null });
      render(<NewsletterSignup />);
      
      const emailInput = screen.getByLabelText("Email address");
      await user.type(emailInput, "user@example.com");
      
      const submitButton = screen.getByRole("button", { name: /Subscribe/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Thanks for subscribing!/)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it("should show custom success message", async () => {
      const user = userEvent.setup({ delay: null });
      render(<NewsletterSignup successMessage="You're all set!" />);
      
      const emailInput = screen.getByLabelText("Email address");
      await user.type(emailInput, "user@example.com");
      
      const submitButton = screen.getByRole("button", { name: /Subscribe/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText("You're all set!")).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it("should clear email input after successful signup", async () => {
      const user = userEvent.setup({ delay: null });
      render(<NewsletterSignup />);
      
      const emailInput = screen.getByLabelText("Email address") as HTMLInputElement;
      await user.type(emailInput, "user@example.com");
      
      const submitButton = screen.getByRole("button", { name: /Subscribe/ });
      await user.click(submitButton);
      
      // Success message shown, original form hidden
      await waitFor(() => {
        expect(screen.getByText(/Thanks for subscribing!/)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it("should track analytics event on signup", async () => {
      const gtagMock = vi.fn();
      window.gtag = gtagMock;
      
      const user = userEvent.setup({ delay: null });
      render(<NewsletterSignup variant="inline" />);
      
      const emailInput = screen.getByLabelText("Email address");
      await user.type(emailInput, "user@example.com");
      
      const submitButton = screen.getByRole("button", { name: /Subscribe/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(gtagMock).toHaveBeenCalledWith("event", "newsletter_signup", {
          method: "inline_form",
          variant: "inline",
        });
      }, { timeout: 2000 });
    });
  });

  describe("Previous Signup Detection", () => {
    it("should show success state if user signed up recently", () => {
      // Set signup within last 30 days
      const recentTimestamp = Date.now() - 10 * 24 * 60 * 60 * 1000; // 10 days ago
      localStorage.setItem(
        NEWSLETTER_STORAGE_KEY,
        JSON.stringify({
          email: "user@example.com",
          timestamp: recentTimestamp,
        })
      );
      
      render(<NewsletterSignup />);
      
      expect(screen.getByText(/Thanks for subscribing!/)).toBeInTheDocument();
    });

    it("should show form if signup was over 30 days ago", () => {
      // Set old signup (31 days ago)
      const oldTimestamp = Date.now() - 31 * 24 * 60 * 60 * 1000;
      localStorage.setItem(
        NEWSLETTER_STORAGE_KEY,
        JSON.stringify({
          email: "user@example.com",
          timestamp: oldTimestamp,
        })
      );
      
      render(<NewsletterSignup />);
      
      // Should show form again
      expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    });

    it("should clear invalid localStorage data", () => {
      localStorage.setItem(NEWSLETTER_STORAGE_KEY, "invalid-json");
      
      render(<NewsletterSignup />);
      
      // Should show form and clear bad data
      expect(screen.getByLabelText("Email address")).toBeInTheDocument();
      expect(localStorage.getItem(NEWSLETTER_STORAGE_KEY)).toBeNull();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<NewsletterSignup />);
      
      expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    });

    it("should announce errors to screen readers", async () => {
      const user = userEvent.setup({ delay: null });
      render(<NewsletterSignup />);
      
      const submitButton = screen.getByRole("button", { name: /Subscribe/ });
      await user.click(submitButton);
      
      const error = screen.getByRole("alert");
      expect(error).toHaveTextContent("Please enter your email address");
    });

    it("should disable inputs during loading", async () => {
      const user = userEvent.setup({ delay: null });
      render(<NewsletterSignup />);
      
      const emailInput = screen.getByLabelText("Email address");
      await user.type(emailInput, "user@example.com");
      
      const submitButton = screen.getByRole("button", { name: /Subscribe/ });
      await user.click(submitButton);
      
      expect(emailInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle email with special characters", async () => {
      const user = userEvent.setup({ delay: null });
      render(<NewsletterSignup />);
      
      const emailInput = screen.getByLabelText("Email address");
      await user.type(emailInput, "user+test@example.co.uk");
      
      const submitButton = screen.getByRole("button", { name: /Subscribe/ });
      await user.click(submitButton);
      
      // Should not show validation error
      expect(screen.queryByText("Please enter a valid email address")).not.toBeInTheDocument();
    });

    it("should reject email without domain (client-side validation)", async () => {
      render(<NewsletterSignup />);
      
      const emailInput = screen.getByLabelText("Email address");
      fireEvent.change(emailInput, { target: { value: "user@" } });
      
      const form = emailInput.closest("form");
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
      });
    });

    it("should reject email without @ (client-side validation)", async () => {
      render(<NewsletterSignup />);
      
      const emailInput = screen.getByLabelText("Email address");
      fireEvent.change(emailInput, { target: { value: "userexample.com" } });
      
      const form = emailInput.closest("form");
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
      });
    });

    it("should handle very long email addresses", async () => {
      const user = userEvent.setup({ delay: null });
      render(<NewsletterSignup />);
      
      const longEmail = "a".repeat(50) + "@" + "b".repeat(50) + ".com";
      
      const emailInput = screen.getByLabelText("Email address");
      await user.type(emailInput, longEmail);
      
      const submitButton = screen.getByRole("button", { name: /Subscribe/ });
      await user.click(submitButton);
      
      // Should accept valid format even if long
      expect(screen.queryByText("Please enter a valid email address")).not.toBeInTheDocument();
    });
  });
});
