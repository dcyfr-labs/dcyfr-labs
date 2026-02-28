"use client";

import * as React from "react";
import { Mail, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPACING, BORDERS, ANIMATION, SPACING_SCALE } from '@/lib/design-tokens';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * NewsletterSignup Component
 *
 * Inline email signup form with localStorage persistence for tracking signups.
 * Supports multiple visual variants and includes success/error states.
 *
 * @component
 * @example
 * ```tsx
 * <NewsletterSignup
 *   title="Stay Updated"
 *   description="Get notified about new blog posts and security insights."
 *   variant="card"
 * />
 * ```
 *
 * @features
 * - Email validation (regex + basic format checks)
 * - localStorage persistence (tracks signup timestamp)
 * - Success animation with checkmark
 * - Error handling with user-friendly messages
 * - Three visual variants (inline, card, minimal)
 * - Analytics tracking for signup events
 *
 * @variants
 * - inline: Horizontal layout (email input + button side-by-side)
 * - card: Card-based layout with background and border
 * - minimal: Compact layout with minimal styling
 *
 * @accessibility
 * - Semantic HTML with form element
 * - ARIA labels for screen readers
 * - Focus management
 * - Error announcements
 */

export type NewsletterVariant = "inline" | "card" | "minimal";

export interface NewsletterSignupProps {
  /** Title heading */
  title?: string;
  /** Description text */
  description?: string;
  /** Submit button text */
  buttonText?: string;
  /** Success message after signup */
  successMessage?: string;
  /** Email input placeholder */
  placeholder?: string;
  /** Visual variant (default: "card") */
  variant?: NewsletterVariant;
  /** Optional className */
  className?: string;
}

const NEWSLETTER_STORAGE_KEY = "dcyfr-newsletter-signup";

export function NewsletterSignup({
  title = "Stay Updated",
  description = "Subscribe to get the latest blog posts and insights delivered to your inbox.",
  buttonText = "Subscribe",
  successMessage = "Thanks for subscribing! Check your email to confirm.",
  placeholder = "Enter your email",
  variant = "card",
  className,
}: NewsletterSignupProps) {
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Check if user has already signed up
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    
    const signupData = localStorage.getItem(NEWSLETTER_STORAGE_KEY);
    if (signupData) {
      try {
        const { timestamp } = JSON.parse(signupData);
        // Check if signup was within last 30 days
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        if (timestamp > thirtyDaysAgo) {
          setIsSuccess(true);
        }
      } catch {
        // Invalid data, clear it
        localStorage.removeItem(NEWSLETTER_STORAGE_KEY);
      }
    }
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call (localStorage-based for now)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Store signup in localStorage
      localStorage.setItem(
        NEWSLETTER_STORAGE_KEY,
        JSON.stringify({
          email,
          timestamp: Date.now(),
        })
      );

      // Track signup event
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "newsletter_signup", {
          method: "inline_form",
          variant,
        });
      }

      setIsSuccess(true);
      setEmail("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Variant-specific classes
  const containerClasses = {
    inline: "flex flex-col sm:flex-row gap-3 items-start sm:items-center",
    card: cn(
      "border rounded-lg p-4",
      BORDERS.card,
      "bg-gradient-to-br from-primary/5 to-transparent"
    ),
    minimal: "flex flex-col gap-2",
  };

  const contentWrapperClasses = {
    inline: "flex-1",
    card: `mb-${SPACING_SCALE.md}`,
    minimal: `mb-${SPACING_SCALE.sm}`,
  };

  const formClasses = {
    inline: "flex gap-2 flex-1 w-full",
    card: "flex gap-2",
    minimal: "flex gap-2",
  };

  if (isSuccess) {
    return (
      <div
        className={cn(
          containerClasses[variant],
          "newsletter-signup-success",
          className
        )}
      >
        <div className="flex items-center gap-3 text-success">
          <div className="rounded-full bg-success/10 p-2">
            <Check className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium m-0">{successMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        containerClasses[variant],
        "newsletter-signup",
        className
      )}
    >
      {/* Content */}
      <div className={contentWrapperClasses[variant]}>
        {title && (
          <h3 className="text-xl font-semibold m-0 mb-2">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-muted-foreground m-0 text-sm">
            {description}
          </p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className={formClasses[variant]}>
        <div className="flex-1 min-w-0">
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null); // Clear error on input
            }}
            placeholder={placeholder}
            disabled={isLoading}
            aria-label="Email address"
            aria-invalid={!!error}
            aria-describedby={error ? "newsletter-error" : undefined}
            className={cn(
              "w-full",
              error && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {error && (
            <p
              id="newsletter-error"
              className="text-xs text-destructive mt-1"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Subscribing...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              {buttonText}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
