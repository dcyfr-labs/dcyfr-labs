{/* TLP:CLEAR */}

# Integration Examples - Inngest Error Alerting

Practical examples of how to use the error alerting system with your existing Inngest functions.

## Example 1: Basic Function with Auto-Alerting

```typescript
// src/inngest/contact-functions.ts
import { inngest } from "./client";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const contactFormSubmitted = inngest.createFunction(
  { 
    id: "contact-form-submitted",
    retries: 3,  // Will auto-alert on final failure
  },
  { event: "contact/form.submitted" },
  async ({ event, step }) => {
    // Your existing code here
    // If it throws an error:
    // 1. Inngest will retry 3 times
    // 2. After all retries fail, inngestErrorHandler auto-triggers
    // 3. Email alert sent (contact-form is CRITICAL)
    
    const result = await step.run("send-email", async () => {
      const result = await resend.emails.send({
        from: "noreply@dcyfr.ai",
        to: "contact@dcyfr.ai",
        subject: `Contact from ${event.data.name}`,
        html: `<p>${event.data.message}</p>`,
      });
      
      if (!result.data?.id) {
        throw new Error("Email send failed"); // Will trigger alert
      }
      
      return result.data;
    });
    
    return { success: true, messageId: result.id };
  }
);
```

**What happens on failure:**
- Step throws error → Retry 3 times → All fail → inngestErrorHandler triggered
- Sentry receives error (tagged: `severity: critical`, `function: contact-form-submitted`)
- Email alert sent to `INNGEST_ERROR_ALERTS_EMAIL`
- You get notified immediately ✅

---

## Example 2: Graceful Error Handling with Custom Context

```typescript
// src/inngest/github-functions.ts
import { inngest } from "./client";
import { reportInngestError } from "@/inngest/error-handler";

export const refreshGitHubData = inngest.createFunction(
  { 
    id: "refresh-github-data",
    retries: 2,  // Lower retries for scheduled tasks
  },
  { cron: "0 * * * *" },  // Every hour
  async ({ event, step }) => {
    const startTime = Date.now();
    
    try {
      const data = await step.run("fetch-github-data", async () => {
        const response = await fetch("https://api.github.com/user/repos", {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }
        
        return response.json();
      });
      
      await step.run("store-cache", async () => {
        // Store in Redis or database
      });
      
      return {
        success: true,
        repoCount: data.length,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      // Manually report with custom context
      const executionTime = Date.now() - startTime;
      
      await reportInngestError(inngest, {
        functionId: "refresh-github-data",
        functionName: "Refresh GitHub Data",
        error: error as Error,
        event,
        attempt: 1,
        maxRetries: 2,
        executionId: `github-sync-${Date.now()}`,
        timestamp: new Date().toISOString(),
        context: {
          executionTime,
          attempt: 1,
          isScheduled: true,
          nextRetryIn: "1 hour",
        },
      });
      
      // Still throw to trigger normal retry mechanism
      throw error;
    }
  }
);
```

**What happens:**
- Function fails → Manual error report sent → Sentry receives error + context
- Inngest retries automatically (2 times)
- After final failure, inngestErrorHandler also triggered
- You see error in both manual report AND handler
- `context` shows execution time and custom metrics

---

## Example 3: Different Failure Levels

```typescript
// src/inngest/blog-functions.ts
import { inngest } from "./client";

export const calculateTrending = inngest.createFunction(
  { 
    id: "calculate-trending",
    retries: 1,  // Optional: low retries for background tasks
  },
  { cron: "0 * * * *" },  // Every hour
  async ({ event, step }) => {
    try {
      const posts = await step.run("fetch-trending", async () => {
        // Fetch posts with views from last 7 days
        // This might fail but it's not critical
        throw new Error("Redis connection timeout");  // Non-critical error
      });
      
      return { trending: posts };
    } catch (error) {
      // Just log for LOW severity functions
      console.log("Trending calculation failed (non-critical):", error);
      
      // inngestErrorHandler will receive this but won't email
      // (calculateTrending maps to MEDIUM severity, which doesn't email)
      throw error;
    }
  }
);

export const handleMilestone = inngest.createFunction(
  { 
    id: "handle-milestone",
    retries: 2,
  },
  { event: "blog/milestone.reached" },
  async ({ event, step }) => {
    try {
      await step.run("notify-author", async () => {
        // Send notification email
        // This is nice-to-have but not critical
        throw new Error("Email service unavailable");
      });
      
      return { notified: true };
    } catch (error) {
      // Also LOW/MEDIUM severity - no urgent alert
      console.log("Milestone notification failed:", error);
      throw error;
    }
  }
);

export const contactFormSubmitted = inngest.createFunction(
  { 
    id: "contact-form-submitted",
    retries: 3,
  },
  { event: "contact/form.submitted" },
  async ({ event, step }) => {
    try {
      await step.run("send-email", async () => {
        // This IS critical - user is waiting
        throw new Error("Email service unavailable");  // CRITICAL error!
      });
      
      return { sent: true };
    } catch (error) {
      // CRITICAL severity - immediate alert!
      console.log("Contact form email failed:", error);
      throw error;
    }
  }
);
```

**Failure outcomes:**
- `calculateTrending` fails → Sentry logged, no email (MEDIUM severity)
- `handleMilestone` fails → Sentry logged, no email (MEDIUM severity)  
- `contactFormSubmitted` fails → Sentry logged + EMAIL ALERT (CRITICAL severity)

---

## Example 4: Add New Alert Severity

```typescript
// In error-handler.ts, customize determineSeverity():

function determineSeverity(error: InngestFunctionError): ErrorSeverity {
  const functionId = error.functionId.toLowerCase();
  const errorMsg = error.error.message.toLowerCase();

  // Keep existing rules...
  if (functionId.includes("contact")) {
    return ErrorSeverity.CRITICAL;
  }

  // Add YOUR custom rules:
  
  // Example: Mark payment errors as critical
  if (functionId.includes("payment") || functionId.includes("subscription")) {
    return ErrorSeverity.CRITICAL;
  }

  // Example: Mark API sync as high severity
  if (functionId.includes("api-sync") || functionId.includes("webhook")) {
    return ErrorSeverity.HIGH;
  }

  // Example: Timeout errors are medium
  if (errorMsg.includes("timeout") || errorMsg.includes("deadline")) {
    return ErrorSeverity.MEDIUM;
  }

  // Example: Rate limit errors are low (expected)
  if (errorMsg.includes("rate limit") || errorMsg.includes("429")) {
    return ErrorSeverity.LOW;
  }

  // Default: HIGH for unknown critical functions
  if (functionId.includes("critical")) {
    return ErrorSeverity.HIGH;
  }

  return ErrorSeverity.MEDIUM;
}
```

---

## Example 5: Monitoring Multiple Alert Channels

```typescript
// src/inngest/error-handler.ts
// Add these steps after email alert:

// Step X: Send to Slack
await step.run("send-slack-alert", async () => {
  if (severity !== ErrorSeverity.CRITICAL) {
    return { skipped: true };  // Only Slack for critical
  }

  const slackWebhook = process.env.SLACK_WEBHOOK_URL;
  if (!slackWebhook) {
    return { skipped: true, reason: "no-webhook" };
  }

  try {
    await fetch(slackWebhook, {
      method: "POST",
      body: JSON.stringify({
        text: `🚨 CRITICAL: Function failed`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${errorData.functionName}* failed\n*Error:* ${errorData.error.message}`,
            },
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "View in Inngest",
                },
                url: `https://app.inngest.com/v1/exec/${errorData.executionId}`,
              },
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "View in Sentry",
                },
                url: `https://sentry.io`,
              },
            ],
          },
        ],
      }),
    });

    return { success: true, channel: "slack" };
  } catch (error) {
    console.error("Failed to send Slack alert:", error);
    return { success: false };
  }
});

// Step Y: Send to PagerDuty
await step.run("send-pagerduty-alert", async () => {
  if (severity !== ErrorSeverity.CRITICAL) {
    return { skipped: true };
  }

  const pdToken = process.env.PAGERDUTY_TOKEN;
  if (!pdToken) {
    return { skipped: true, reason: "no-token" };
  }

  try {
    const response = await fetch(
      "https://api.pagerduty.com/incidents",
      {
        method: "POST",
        headers: {
          "Authorization": `Token token=${pdToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          incidents: [
            {
              type: "incident",
              title: `Critical: ${errorData.functionName} failed`,
              service: {
                id: process.env.PAGERDUTY_SERVICE_ID,
                type: "service_reference",
              },
              urgency: "high",
              body: {
                type: "incident_body",
                details: errorData.error.message,
              },
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`PagerDuty API error: ${response.status}`);
    }

    return { success: true, channel: "pagerduty" };
  } catch (error) {
    console.error("Failed to send PagerDuty alert:", error);
    return { success: false };
  }
});
```

---

## Example 6: Testing Error Handling

```typescript
// In your tests or dev environment:

import { inngest } from "@/inngest/client";
import { InngestFunctionError } from "@/inngest/error-handler";

// Simulate a function failure
async function testErrorHandling() {
  // Trigger error event manually
  await inngest.send({
    name: "inngest/function.failed",
    data: {
      functionId: "test-function",
      functionName: "Test Function",
      error: {
        message: "Test error - check if alert works",
        stack: "at test function...",
        code: "TEST_ERROR",
      },
      event: {
        name: "test/event",
        data: { userId: "test-123" },
      },
      attempt: 3,
      maxRetries: 3,
      executionId: `test-exec-${Date.now()}`,
      timestamp: new Date().toISOString(),
      context: {
        testRun: true,
        expectedBehavior: "Alert should be sent",
      },
    } as InngestFunctionError,
  });

  console.log("Test error sent to handler");
  // Check your email and Sentry within 30 seconds
}

// Run locally:
// 1. Set INNGEST_ERROR_ALERTS_EMAIL
// 2. npm run dev
// 3. Call testErrorHandling() in browser console or API route
// 4. Watch for email alert and Sentry error
```

---

## Implementation Checklist

- [ ] Add `INNGEST_ERROR_ALERTS_EMAIL` environment variable
- [ ] Deploy changes (error-handler.ts and route.ts update)
- [ ] Test with a real function error (contact form is easiest)
- [ ] Verify email arrives
- [ ] Check error appears in Sentry
- [ ] Review Inngest dashboard for handler execution
- [ ] Customize severity rules for your functions
- [ ] Set up Sentry alert rules for notification patterns
- [ ] Add Slack/PagerDuty integration if needed

---

## Related Documentation

- [Full Error Alerting Guide](./inngest-error-alerting)
- [Quick Reference](./inngest-error-alerting-quick-ref)
- [Implementation Summary](./inngest-error-alerting-implementation)
- [Inngest Integration](./inngest-integration)
