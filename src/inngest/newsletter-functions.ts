import { inngest } from './client';
import { Resend } from 'resend';
import { AUTHOR_EMAIL, FROM_EMAIL } from '@/lib/site-config';

// Initialize Resend only if configured
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const isEmailConfigured = !!RESEND_API_KEY;
const resend = isEmailConfigured ? new Resend(RESEND_API_KEY) : null;

/**
 * Newsletter subscription handler
 *
 * @remarks
 * Handles newsletter subscriptions asynchronously with:
 * - Automatic retries on failure (3 attempts with exponential backoff)
 * - Confirmation email to subscriber
 * - Notification email to site owner
 * - Graceful degradation if Resend is not configured
 */
export const newsletterSubscribeSubmitted = inngest.createFunction(
  {
    id: 'newsletter-subscribe-submitted',
    retries: 3,
  },
  { event: 'newsletter/subscribe.submitted' },
  async ({ event, step }) => {
    const { email, subscribedAt } = event.data;

    console.warn('[Newsletter Function] Processing subscription:', {
      emailDomain: email.split('@')[1],
      emailConfigured: isEmailConfigured,
    });

    // Step 1: Send confirmation email to subscriber
    const confirmationResult = await step.run('send-confirmation-email', async () => {
      if (!isEmailConfigured || !resend) {
        console.warn('[Newsletter Function] Email not configured, skipping confirmation', {
          hasResendKey: !!process.env.RESEND_API_KEY,
        });
        return { success: false, reason: 'not-configured' };
      }

      try {
        const result = await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: 'Confirm your subscription',
          text: `Thanks for subscribing!\n\nYou'll receive new blog posts and updates straight to your inbox.\n\nBest,\nDrew`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px;">
              <h2>Thanks for subscribing!</h2>
              <p>You're on the list. You'll receive new posts and updates straight to your inbox.</p>
              <hr style="border: 1px solid #eee; margin: 20px 0;" />
              <p>Best,<br/>Drew</p>
            </div>
          `,
        });

        console.warn('[Newsletter Function] Confirmation email sent:', {
          messageId: result.data?.id,
          emailDomain: email.split('@')[1],
        });

        return { success: true, messageId: result.data?.id };
      } catch (error) {
        console.error('[Newsletter Function] Failed to send confirmation email:', {
          error: error instanceof Error ? error.message : String(error),
          emailDomain: email.split('@')[1],
        });
        throw error; // Will trigger retry
      }
    });

    // Step 2: Notify site owner of new subscriber
    await step.run('send-owner-notification', async () => {
      if (!isEmailConfigured || !resend) {
        return { success: false, reason: 'not-configured' };
      }

      try {
        const result = await resend.emails.send({
          from: FROM_EMAIL,
          to: AUTHOR_EMAIL,
          subject: 'New newsletter subscriber',
          text: `New subscriber: ${email}\nSubscribed: ${new Date(subscribedAt).toLocaleString()}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px;">
              <h2>New Newsletter Subscriber</h2>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Subscribed:</strong> ${new Date(subscribedAt).toLocaleString()}</p>
            </div>
          `,
        });

        console.warn('[Newsletter Function] Owner notification sent:', {
          messageId: result.data?.id,
        });

        return { success: true, messageId: result.data?.id };
      } catch (error) {
        // Don't fail the function if owner notification fails
        console.error('[Newsletter Function] Failed to send owner notification:', {
          error: error instanceof Error ? error.message : String(error),
        });
        return { success: false, error: String(error) };
      }
    });

    console.warn('[Newsletter Function] Subscription processed:', {
      emailDomain: email.split('@')[1],
      confirmation: confirmationResult.success,
      timestamp: subscribedAt,
    });

    return {
      success: true,
      confirmation: confirmationResult,
      processedAt: new Date().toISOString(),
    };
  }
);
