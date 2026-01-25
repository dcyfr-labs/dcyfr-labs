{/* TLP:CLEAR */}

# Inngest Error Alerting - Quick Reference

## Setup (1 minute)

```bash
# Add one environment variable:
INNGEST_ERROR_ALERTS_EMAIL=your-email@example.com
```

That's it! ✅ You're now getting alerts for:
- **CRITICAL** errors (contact form, payments) → Immediate email
- **HIGH** errors (GitHub sync, security) → Email + Sentry
- **MEDIUM** errors (analytics, trends) → Sentry only
- **LOW** errors (logging) → Console log only

## How to Get Alerts

### Option 1: Email Alerts (Immediate)
Add `INNGEST_ERROR_ALERTS_EMAIL` to receive emails for critical/high failures.

### Option 2: Sentry Dashboard
All errors automatically report to Sentry:
1. Go to https://sentry.io
2. Select your project
3. Filter by tag: `service: inngest`

### Option 3: Inngest Dashboard
Watch function execution:
1. Go to https://app.inngest.com
2. Functions → `inngestErrorHandler`
3. Recent runs show all error processing

## What You'll See

**Email Alert (Critical/High):**
```
🚨 CRITICAL: Inngest function failed - Contact Form Handler
Function: contactFormSubmitted
Error: ECONNREFUSED - Email service unavailable
Execution ID: run_9k2m3n4l5o6p7q8r
Attempt: 3/3 (all retries exhausted)
Links: Inngest Dashboard | Sentry
```

**Sentry Error:**
- Tagged: `severity: critical`, `function: contact-form-submitted`
- Includes: Stack trace, event data, execution context
- Alertable: Create rules based on severity/function/error pattern

## Customize Alerts

### Change severity for a function

Edit `src/inngest/error-handler.ts`:

```typescript
function determineSeverity(error: InngestFunctionError): ErrorSeverity {
  const functionId = error.functionId.toLowerCase();

  // Make your function CRITICAL
  if (functionId.includes("my-important-function")) {
    return ErrorSeverity.CRITICAL;
  }

  // Ignore errors from debug functions
  if (functionId.includes("debug") || functionId.includes("test")) {
    return ErrorSeverity.LOW;
  }

  // ... rest of logic
}
```

### Disable alerts for a specific function

In `determineSeverity()`, return `ErrorSeverity.LOW`:

```typescript
if (functionId.includes("background-task")) {
  return ErrorSeverity.LOW; // No email, just logs
}
```

### Add more alert channels

The handler can easily send to:
- Slack (add step with webhook)
- PagerDuty (add step with API)
- Discord (add step with webhook)

Example in `src/inngest/error-handler.ts`:

```typescript
// Add this step after "send-alert-email"
await step.run("send-slack-alert", async () => {
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;
  if (!slackWebhook) return { success: false };

  await fetch(slackWebhook, {
    method: "POST",
    body: JSON.stringify({
      text: `🚨 Function failed: ${errorData.functionName}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Error:* ${errorData.error.message}\n*Function:* ${errorData.functionName}`,
          },
        },
      ],
    }),
  });

  return { success: true };
});
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No email alerts | Check `INNGEST_ERROR_ALERTS_EMAIL` is set and `RESEND_API_KEY` exists |
| No Sentry errors | Verify `NODE_ENV=production` (Sentry disabled in dev) |
| Too many alerts | Change function severity to `LOW` or reduce retries |
| Not enough info | Add custom context with `reportInngestError()` |

## Files Involved

```
src/inngest/error-handler.ts          # Main error handler (NEW)
src/app/api/inngest/route.ts          # Registers handler (UPDATED)
docs/features/inngest-error-alerting.md  # Full documentation (NEW)
```

## See Also

- [Full Error Alerting Guide](./inngest-error-alerting)
- [Inngest Integration](./inngest-integration)
- [Environment Variables](../operations/environment-variables)
