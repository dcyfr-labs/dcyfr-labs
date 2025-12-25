"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/common/alert";
import { toast } from "@/lib/toast";
import { Loader2 } from "lucide-react";
import { SPACING } from "@/lib/design-tokens";
import { useFormValidation, validators } from "@/hooks/use-form-validation";

export function ContactForm() {
  const {
    values,
    fieldStates,
    isSubmitting,
    setValue,
    handleBlur,
    handleSubmit,
    reset,
  } = useFormValidation({
    initialValues: {
      name: "",
      email: "",
      message: "",
      website: "", // Honeypot field
    },
    validationRules: {
      name: [
        validators.required("Please enter your name"),
        validators.minLength(2, "Name must be at least 2 characters"),
      ],
      email: [
        validators.required("Please enter your email"),
        validators.email("Please enter a valid email address"),
      ],
      message: [
        validators.required("Please enter a message"),
        validators.minLength(20, "Message must be at least 20 characters"),
        validators.maxLength(1000, "Message must be less than 1000 characters"),
      ],
    },
    onSubmit: async (formValues) => {
      const data = {
        name: formValues.name,
        email: formValues.email,
        message: formValues.message,
        website: formValues.website, // Honeypot
      };

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          // Handle rate limiting with specific message
          if (response.status === 429) {
            const retryAfter = result.retryAfter || 60;
            toast.error(
              `Too many requests. Please try again in ${retryAfter} seconds.`
            );
          } else {
            toast.error(result.error || "Failed to send message");
          }
          return;
        }

        // Success response with optional warning
        if (result.warning) {
          toast.warning(
            result.message ||
              "Message received, but email delivery is unavailable."
          );
        } else {
          toast.success(result.message || "Message sent successfully!");
        }

        // Reset form on success
        reset();
      } catch (error) {
        // If API is completely unavailable (404/blocking), show alternative contact methods
        if (error instanceof TypeError && error.message.includes("fetch")) {
          toast.error(
            "The contact form is temporarily unavailable. Please reach out via email or social media below.",
            { duration: 8000 }
          );
        } else {
          toast.error(
            "Something went wrong. Please try again or use alternative contact methods below."
          );
        }
        console.error("Contact form error:", error);
      }
    },
  });

  return (
    <div>
      {/* Informational banner using unified Alert component */}
      <Alert type="info" className="mb-8">
        <strong>Multiple ways to connect:</strong> You can use the form below or
        reach out directly via email and social media.
      </Alert>

      <form onSubmit={handleSubmit} className={SPACING.content}>
        {/* Honeypot field - hidden from real users, visible to bots */}
        <div className="hidden" aria-hidden="true">
          <Label htmlFor="website">Website (leave blank)</Label>
          <Input
            id="website"
            name="website"
            type="text"
            autoComplete="off"
            tabIndex={-1}
            placeholder="https://example.com"
            value={values.website}
            onChange={(e) => setValue("website", e.target.value)}
          />
        </div>

        {/* Name field with validation */}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            inputMode="text"
            placeholder="Your name"
            autoComplete="name"
            required
            disabled={isSubmitting}
            value={values.name}
            onChange={(e) => setValue("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            error={fieldStates.name.error}
            success={fieldStates.name.showSuccess}
          />
        </div>

        {/* Email field with validation */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            placeholder="your.email@example.com"
            autoComplete="email"
            required
            disabled={isSubmitting}
            value={values.email}
            onChange={(e) => setValue("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            error={fieldStates.email.error}
            success={fieldStates.email.showSuccess}
          />
        </div>

        {/* Message field with validation */}
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            name="message"
            placeholder="Your message (minimum 20 characters)..."
            required
            disabled={isSubmitting}
            rows={6}
            className="resize-none"
            value={values.message}
            onChange={(e) => setValue("message", e.target.value)}
            onBlur={() => handleBlur("message")}
            error={fieldStates.message.error}
            success={fieldStates.message.showSuccess}
          />
        </div>

        <p className="text-muted-foreground text-xs">
          By submitting this form, you agree to our data handling practices. We
          collect only the information you provide (name, email, message) to
          respond to your inquiry. Your data is not shared with third parties and
          is handled securely.
        </p>

        <Button
          type="submit"
          size="lg"
          className="w-full sm:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isSubmitting ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </div>
  );
}
