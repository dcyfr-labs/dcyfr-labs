import { inngest } from "./client";
import * as Sentry from "@sentry/nextjs";

/**
 * Inngest Error Handler
 * 
 * Centralizes error handling and alerting for all Inngest function failures.
 * Automatically triggered when any function fails after all retry attempts.
 * 
 * Features:
 * - Reports to Sentry for dashboard visibility and alerting
 * - Sends email alerts for critical failures
 * - Tracks failure patterns
 * - Includes full error context and function execution details
 * 
 * @remarks
 * This function is automatically triggered by Inngest when:
 * 1. A function throws an error
 * 2. All retry attempts are exhausted (default: 3 retries)
 * 3. The error is considered a permanent failure
 * 
 * Set INNGEST_ERROR_ALERTS_EMAIL in environment to receive email alerts.
 */

export interface InngestFunctionError {
  functionId: string;
  functionName: string;
  error: {
    message: string;
    stack?: string;
    code?: string;
  };
  event: {
    name: string;
    data: Record<string, unknown>;
  };
  attempt: number;
  maxRetries: number;
  executionId: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

/**
 * Error severity levels for routing and alerting
 */
export enum ErrorSeverity {
  CRITICAL = "critical",    // Immediate alert required (contact form, payment)
  HIGH = "high",           // Send alert within 1 hour
  MEDIUM = "medium",       // Daily digest
  LOW = "low",             // Just log, no alert
}

/**
 * Determine error severity based on function and error type
 */
function determineSeverity(error: InngestFunctionError): ErrorSeverity {
  const functionId = error.functionId.toLowerCase();
  const errorMsg = error.error.message.toLowerCase();

  // Critical: User-facing operations
  if (
    functionId.includes("contact") ||
    functionId.includes("payment") ||
    functionId.includes("checkout")
  ) {
    return ErrorSeverity.CRITICAL;
  }

  // High: Core business functions
  if (
    functionId.includes("github") ||
    functionId.includes("security") ||
    functionId.includes("analytics")
  ) {
    return ErrorSeverity.HIGH;
  }

  // Medium: Optional/nice-to-have features
  if (
    functionId.includes("milestone") ||
    functionId.includes("trending") ||
    errorMsg.includes("timeout")
  ) {
    return ErrorSeverity.MEDIUM;
  }

  // Low: Logging and monitoring
  return ErrorSeverity.LOW;
}

/**
 * Main error handler function
 * Triggered automatically by Inngest when functions fail
 */
export const inngestErrorHandler = inngest.createFunction(
  {
    id: "inngest-error-handler",
    retries: 2, // Lower retry count to prevent alert spam
  },
  { event: "inngest/function.failed" },
  async ({ event, step }) => {
    const errorData = event.data as InngestFunctionError;
    const severity = determineSeverity(errorData);

    // Step 1: Report to Sentry
    await step.run("report-to-sentry", async () => {
      Sentry.captureException(new Error(errorData.error.message), {
        level: severity === ErrorSeverity.CRITICAL ? "fatal" : "error",
        contexts: {
          inngest: {
            functionId: errorData.functionId,
            functionName: errorData.functionName,
            executionId: errorData.executionId,
            attempt: errorData.attempt,
            maxRetries: errorData.maxRetries,
          },
          event: {
            name: errorData.event.name,
            data: errorData.event.data,
          },
        },
        tags: {
          service: "inngest",
          severity,
          function: errorData.functionId,
        },
        extra: {
          stack: errorData.error.stack,
          errorCode: errorData.error.code,
          timestamp: errorData.timestamp,
          context: errorData.context,
        },
      });

      return {
        success: true,
        sentryEventId: Sentry.lastEventId(),
      };
    });

    // Step 2: Send email alert for critical/high severity
    if (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH) {
      await step.run("send-alert-email", async () => {
        const alertEmail = process.env.INNGEST_ERROR_ALERTS_EMAIL;

        if (!alertEmail) {
          console.warn(
            "INNGEST_ERROR_ALERTS_EMAIL not configured, skipping email alert"
          );
          return { success: false, reason: "email-not-configured" };
        }

        try {
          // Import Resend here to avoid circular dependencies
          const { Resend } = await import("resend");
          const resend = new Resend(process.env.RESEND_API_KEY);

          const subject =
            severity === ErrorSeverity.CRITICAL
              ? `🚨 CRITICAL: Inngest function failed - ${errorData.functionName}`
              : `⚠️  HIGH: Inngest function failed - ${errorData.functionName}`;

          const htmlBody = `
            <div style="font-family: monospace; max-width: 800px; background: #f5f5f5; padding: 20px; border-radius: 8px;">
              <h2 style="color: ${severity === ErrorSeverity.CRITICAL ? "#d32f2f" : "#f57c00"};">
                ${severity === ErrorSeverity.CRITICAL ? "🚨 CRITICAL ERROR" : "⚠️ HIGH SEVERITY ERROR"}
              </h2>
              
              <h3>Function: ${errorData.functionName}</h3>
              <p><strong>ID:</strong> ${errorData.functionId}</p>
              <p><strong>Execution ID:</strong> <code>${errorData.executionId}</code></p>
              <p><strong>Time:</strong> ${new Date(errorData.timestamp).toISOString()}</p>
              <p><strong>Attempt:</strong> ${errorData.attempt}/${errorData.maxRetries}</p>
              
              <h3>Error Details</h3>
              <pre style="background: #fff; padding: 10px; border-left: 3px solid #d32f2f; overflow-x: auto;">
${errorData.error.message}
              </pre>
              
              ${errorData.error.stack ? `
              <h3>Stack Trace</h3>
              <pre style="background: #fff; padding: 10px; font-size: 11px; overflow-x: auto; max-height: 300px;">
${errorData.error.stack}
              </pre>
              ` : ""}
              
              <h3>Event Data</h3>
              <pre style="background: #fff; padding: 10px; overflow-x: auto; font-size: 11px;">
${JSON.stringify(errorData.event.data, null, 2)}
              </pre>
              
              <hr style="margin: 20px 0; border: 1px solid #ddd;" />
              
              <p>
                <a href="https://app.inngest.com" style="color: #1976d2; text-decoration: none;">
                  📊 View in Inngest Dashboard
                </a>
                |
                <a href="https://sentry.io" style="color: #1976d2; text-decoration: none;">
                  🔍 View in Sentry
                </a>
              </p>
              
              <p style="color: #666; font-size: 12px; margin-top: 20px;">
                This alert was triggered by the Inngest Error Handler.
                Configure INNGEST_ERROR_ALERTS_EMAIL to receive these alerts.
              </p>
            </div>
          `;

          const result = await resend.emails.send({
            from: "alerts@dcyfr.ai",
            to: alertEmail,
            subject,
            html: htmlBody,
          });

          console.log("Alert email sent:", {
            messageId: result.data?.id,
            to: alertEmail,
            functionId: errorData.functionId,
            severity,
          });

          return {
            success: true,
            messageId: result.data?.id,
            to: alertEmail,
          };
        } catch (error) {
          console.error("Failed to send alert email:", error);
          // Don't throw - we don't want email failures to trigger more retries
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      });
    }

    // Step 3: Store failure in monitoring system
    await step.run("store-failure-metric", async () => {
      try {
        // Future: Store in Redis or external analytics
        // For now, just log structured data
        console.log("Inngest function failure recorded", {
          functionId: errorData.functionId,
          severity,
          timestamp: errorData.timestamp,
          executionId: errorData.executionId,
        });

        return {
          success: true,
          stored: true,
        };
      } catch (error) {
        console.error("Failed to store failure metric:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    return {
      processed: true,
      functionId: errorData.functionId,
      severity,
      sentryEventId: Sentry.lastEventId(),
      timestamp: new Date().toISOString(),
    };
  }
);

/**
 * Wrapper function to convert standard errors into Inngest error events
 * Use this when you want to trigger error handling from within a step
 * 
 * @example
 * try {
 *   // ... do something
 * } catch (error) {
 *   await reportInngestError(inngest, {
 *     functionId: "my-function",
 *     functionName: "My Function",
 *     error,
 *     event: step.events.data,
 *     attempt: 1,
 *     maxRetries: 3,
 *     executionId: step.run.id,
 *   });
 * }
 */
export async function reportInngestError(
  client: typeof inngest,
  errorDetails: InngestFunctionError
): Promise<void> {
  await client.send({
    name: "inngest/function.failed",
    data: errorDetails,
  });
}
