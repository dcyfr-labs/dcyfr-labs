import { inngest } from "./client";
import { Resend } from "resend";
import { AUTHOR_EMAIL, FROM_EMAIL } from "@/lib/site-config";
import { track } from "@vercel/analytics/server";

// Initialize Resend only if configured
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const isEmailConfigured = !!RESEND_API_KEY;
const resend = isEmailConfigured ? new Resend(RESEND_API_KEY) : null;

/**
 * Contact form email handler
 * 
 * @remarks
 * Handles contact form submissions asynchronously with:
 * - Automatic retries on failure (3 attempts with exponential backoff)
 * - Email delivery to site owner
 * - Confirmation email to submitter
 * - Error tracking and logging
 * 
 * Benefits over synchronous processing:
 * - Faster API response (< 100ms vs 1-2s)
 * - Reliable delivery with automatic retries
 * - No user-facing errors if email service is slow
 * - Better observability in Inngest dashboard
 * 
 * @see https://www.inngest.com/docs/guides/retries
 */
export const contactFormSubmitted = inngest.createFunction(
  { 
    id: "contact-form-submitted",
    retries: 3,
  },
  { event: "contact/form.submitted" },
  async ({ event, step }) => {
    const { name, email, message, submittedAt } = event.data;

    // Log function execution for debugging
    console.warn("[Contact Function] Processing submission:", {
      fromEmail: email,
      messageLength: message.length,
      emailConfigured: isEmailConfigured,
      resendFromEmail: FROM_EMAIL,
    });

    // Step 1: Send notification email to site owner
    const notificationResult = await step.run("send-notification-email", async () => {
      if (!isEmailConfigured || !resend) {
        console.warn("[Contact Function] Email not configured, skipping notification", {
          hasResendKey: !!process.env.RESEND_API_KEY,
          resendInstance: !!resend,
        });
        return { success: false, reason: "not-configured" };
      }

      try {
        const result = await resend.emails.send({
          from: FROM_EMAIL,
          to: AUTHOR_EMAIL,
          subject: `Contact form: ${name}`,
          replyTo: email,
          text: `From: ${name} <${email}>\nSubmitted: ${new Date(submittedAt).toLocaleString()}\n\n${message}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px;">
              <h2>New Contact Form Submission</h2>
              <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
              <p><strong>Submitted:</strong> ${new Date(submittedAt).toLocaleString()}</p>
              <hr style="border: 1px solid #eee; margin: 20px 0;" />
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
          `,
        });

        console.warn("Notification email sent:", {
          messageId: result.data?.id,
          to: AUTHOR_EMAIL,
          from: FROM_EMAIL,
          emailDomain: email.split('@')[1],
        });
        
        // Track in Vercel Analytics
        await track('contact_form_submitted', {
          emailDomain: email.split('@')[1],
          hasMessage: !!message,
          success: true,
        });

        return { 
          success: true, 
          messageId: result.data?.id,
        };
      } catch (error) {
        console.error("[Contact Function] Failed to send notification email:", {
          error: error instanceof Error ? error.message : String(error),
          from: FROM_EMAIL,
          to: AUTHOR_EMAIL,
          emailDomain: email.split('@')[1],
        });
        throw error; // Will trigger retry
      }
    });

    // Step 2: Send confirmation email to submitter
    const confirmationResult = await step.run("send-confirmation-email", async () => {
      if (!isEmailConfigured || !resend) {
        return { success: false, reason: "not-configured" };
      }

      try {
        const result = await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: "Thanks for reaching out!",
          text: `Hi ${name},\n\nThank you for your message! I've received your submission and will get back to you as soon as possible.\n\nBest regards,\nDrew`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px;">
              <h2>Thanks for reaching out!</h2>
              <p>Hi ${name},</p>
              <p>Thank you for your message! I've received your submission and will get back to you as soon as possible.</p>
              <hr style="border: 1px solid #eee; margin: 20px 0;" />
              <p><strong>Your message:</strong></p>
              <p style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px;">${message}</p>
              <hr style="border: 1px solid #eee; margin: 20px 0;" />
              <p>Best regards,<br/>Drew</p>
            </div>
          `,
        });

        console.warn("Confirmation email sent:", {
          messageId: result.data?.id,
          to: email,
          from: FROM_EMAIL,
        });

        return { 
          success: true, 
          messageId: result.data?.id,
        };
      } catch (error) {
        // Log but don't fail the function if confirmation email fails
        console.error("[Contact Function] Failed to send confirmation email:", {
          error: error instanceof Error ? error.message : String(error),
          from: FROM_EMAIL,
          to: email,
        });
        return { success: false, error: String(error) };
      }
    });

    // Step 3: Track the result
    await step.run("track-result", async () => {
      // Could send analytics event, update database, etc.
      console.warn("Contact form processed:", {
        notification: notificationResult.success,
        confirmation: confirmationResult.success,
        emailDomain: email.split('@')[1],
        timestamp: submittedAt,
      });
    });

    return {
      success: true,
      notification: notificationResult,
      confirmation: confirmationResult,
      processedAt: new Date().toISOString(),
    };
  },
);
