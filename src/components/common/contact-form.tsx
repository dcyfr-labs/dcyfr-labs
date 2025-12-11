"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { Loader2 } from "lucide-react";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    startTransition(() => {
      setIsSubmitting(true);
    });

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
      // Honeypot field - should always be empty for real users
      website: formData.get("website") as string,
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
          toast.error(`Too many requests. Please try again in ${retryAfter} seconds.`);
        } else {
          toast.error(result.error || "Failed to send message");
        }
        return;
      }

      // Success response with optional warning
      if (result.warning) {
        toast.warning(result.message || "Message received, but email delivery is unavailable.");
      } else {
        toast.success(result.message || "Message sent successfully!");
      }
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      // If API is completely unavailable (404/blocking), show alternative contact methods
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error(
          "The contact form is temporarily unavailable. Please reach out via email or social media below.",
          { duration: 8000 }
        );
      } else {
        toast.error("Something went wrong. Please try again or use alternative contact methods below.");
      }
      console.error("Contact form error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      {/* Informational banner */}
      <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Multiple ways to connect:</strong> You can use the form below or reach out directly via email and social media.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
        />
      </div>
      
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
        />
      </div>
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
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Your message..."
          required
          disabled={isSubmitting}
          rows={6}
          className="resize-none"
        />
      </div>
      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" />}
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
    </div>
  );
}
