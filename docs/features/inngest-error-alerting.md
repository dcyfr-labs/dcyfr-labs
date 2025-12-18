# Inngest Error Alerting Setup Guide

Complete guide to setting up automatic alerts for Inngest function failures.

## Overview

The error alerting system automatically notifies you when Inngest functions fail:

- **Sentry Integration** - Centralizes errors in Sentry dashboard
- **Email Alerts** - Critical/high severity failures trigger emails immediately
- **Severity Levels** - Automatically categorizes errors by importance
- **Structured Logging** - Full context stored for debugging

## Quick Start (5 minutes)

### Step 1: Add Environment Variable

Add to your `.env.local` (development) or Vercel (production):

```bash
# Email address to receive Inngest failure alerts
INNGEST_ERROR_ALERTS_EMAIL=your-email@example.com
```

### Step 2: Verify Sentry Configuration

Your Sentry integration is already configured in `sentry.server.config.ts`. The error handler will automatically:
- Report errors to Sentry
- Tag them with function ID and severity
- Include full execution context

### Step 3: Test It (Optional)

Trigger a test error:

```bash
curl -X POST http://localhost:3000/api/inngest \
  -H "Content-Type: application/json" \
  -d '{
    "name": "inngest/function.failed",
    "data": {
      "functionId": "test-error",
      "functionName": "Test Error Function",
      "error": {
        "message": "Test error message",
        "stack": "at test function"
      },
      "event": {
        "name": "test/event",
        "data": { "test": true }
      },
      "attempt": 1,
      "maxRetries": 3,
      "executionId": "test-123",
      "timestamp": "2025-12-09T10:00:00Z"
    }
  }'
```

## Production Setup

### In Vercel Dashboard

1. Go to **Settings** → **Environment Variables**
2. Add `INNGEST_ERROR_ALERTS_EMAIL` with your email
3. Deploy or redeploy the project

### In Inngest Dashboard

The error handler is automatically registered as a function. No additional setup needed. The handler will:

1. Automatically trigger when any function fails after all retries
2. Report to Sentry immediately
3. Send email alerts for critical/high severity errors

## How It Works

### Error Flow

```
Function Fails
    ↓
Retry Mechanism (configurable per function)
    ↓
All Retries Exhausted
    ↓
inngest/function.failed Event
    ↓
inngestErrorHandler Function
    ├─ Report to Sentry
    ├─ Send Alert Email (if critical/high)
    └─ Store Failure Metric
```

### Severity Levels

Errors are automatically categorized:

| Severity | Functions | Alert Timing |
|----------|-----------|--------------|
| **CRITICAL** | Contact form, Payment, Checkout | Immediate email |
| **HIGH** | GitHub sync, Security monitoring, Analytics | Email within 1 hour |
| **MEDIUM** | Milestone notifications, Trending posts, Timeouts | Daily digest (future) |
| **LOW** | Logging, Monitoring | Just log, no email |

Add your own severity rules in `src/inngest/error-handler.ts`:

```typescript
function determineSeverity(error: InngestFunctionError): ErrorSeverity {
  const functionId = error.functionId.toLowerCase();
  
  // Add your own rules:
  if (functionId.includes("my-critical-function")) {
    return ErrorSeverity.CRITICAL;
  }
  
  // ... rest of rules
}
```

## Alert Email Content

When an error is critical or high severity, you'll receive an email with:

- Function name and ID
- Execution ID (for tracking)
- Error message and stack trace
- Event data that triggered the error
- Attempt number and retry limit
- Links to Inngest dashboard and Sentry

Example:

```
🚨 CRITICAL: Inngest function failed - Contact Form Submission

Function: Contact Form Handler
ID: contact-form-submitted
Execution ID: run_4k9v8j3nf2k9

Error: ECONNREFUSED - Cannot connect to email service

Event Data:
{
  "name": "john@example.com",
  "email": "john@example.com",
  ...
}
```

## Troubleshooting

### Email alerts not sending

1. **Check environment variable:**
   ```bash
   echo $INNGEST_ERROR_ALERTS_EMAIL
   ```

2. **Verify Resend API key:**
   - Must have `RESEND_API_KEY` configured
   - Verify key has "send email" permission

3. **Check logs:**
   - In Inngest dashboard, find `inngestErrorHandler` function
   - Look for "send-alert-email" step
   - Check for errors in step output

4. **Test Resend directly:**
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer $RESEND_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "alerts@dcyfr.ai",
       "to": "your-email@example.com",
       "subject": "Test Email",
       "html": "<h1>Test</h1>"
     }'
   ```

### Not receiving Sentry errors

1. **Verify Sentry is enabled:**
   ```typescript
   // Should be true in production
   Sentry.isInitialized()
   ```

2. **Check environment:** Sentry is disabled in development
   - Set `NODE_ENV=production` to test locally

3. **Verify DSN:**
   - Check `SENTRY_DSN` is set correctly

### Alerts too frequent/not frequent enough

Adjust retry logic per function:

```typescript
// Fewer retries = faster alerts
export const myFunction = inngest.createFunction(
  {
    id: "my-function",
    retries: 1,  // Change this (default: 3)
  },
  { event: "my/event" },
  async ({ event, step }) => {
    // ...
  }
);
```

## Advanced: Custom Error Handling

### Manually trigger error handling

If you want to report an error without waiting for automatic failure:

```typescript
import { reportInngestError } from "@/inngest/error-handler";

export const myFunction = inngest.createFunction(
  { id: "my-function" },
  { event: "my/event" },
  async ({ event, step }) => {
    try {
      await step.run("do-something", async () => {
        // ... your code
      });
    } catch (error) {
      // Manually report to error handler
      await reportInngestError(inngest, {
        functionId: "my-function",
        functionName: "My Function",
        error: error as Error,
        event: event,
        attempt: 1,
        maxRetries: 3,
        executionId: step.run.id,
      });
      throw error;
    }
  }
);
```

### Add custom context

The error handler stores custom context. You can add data:

```typescript
await reportInngestError(inngest, {
  functionId: "my-function",
  functionName: "My Function",
  error: error as Error,
  event: event,
  attempt: 1,
  maxRetries: 3,
  executionId: step.run.id,
  context: {
    userId: event.data.userId,
    operationType: "critical-sync",
    customMetrics: {
      retryCount: 2,
      timeElapsed: 5000,
    },
  },
});
```

This context will appear in:
- Sentry error details
- Email alert extra information
- Inngest function output

## Monitoring Dashboard

### View failures in Sentry

1. Go to [Sentry Dashboard](https://sentry.io)
2. Select your project
3. Errors are tagged with:
   - `service: inngest`
   - `severity: critical|high|medium|low`
   - `function: function-id`

### View execution in Inngest

1. Go to [Inngest Dashboard](https://app.inngest.com)
2. Functions → `inngestErrorHandler`
3. View recent runs for error history

### Create Sentry alerts

Set up automatic Sentry alerts:

1. **For critical errors:**
   - Go to Sentry → Alerts → Create Alert Rule
   - Condition: `tags.severity == "critical"`
   - Action: Send to your Slack/email

2. **For high error rate:**
   - Go to Sentry → Alerts → Create Alert Rule
   - Condition: `event.error_count > 10 in last 5 minutes`
   - Action: Send to your Slack/email

## Performance Considerations

- **Error handler overhead:** ~500ms per error (Sentry + email)
- **Email delivery:** ~2-5 seconds via Resend
- **Retry policy:** 2 retries (lower than other functions to prevent cascading failures)

## Next Steps

### 1. Set up Sentry alerts
Configure alert rules for error patterns you care about.

### 2. Add severity rules
Customize `determineSeverity()` to match your business logic.

### 3. Create a monitoring dashboard
Build a page showing:
- Recent function failures
- Failure rate by function
- Critical errors in last 24h

### 4. Set up daily digests
Create a scheduled function to email daily failure summaries.

## Related Documentation

- [Inngest Integration Guide](./inngest-integration)
- Sentry Configuration
- [Environment Variables](../operations/environment-variables)
- [Production Deployment](../operations/production-deployment)

## FAQ

**Q: Will this spam my inbox?**  
A: No. Alerts only send for CRITICAL and HIGH severity errors. MEDIUM/LOW errors are just logged.

**Q: What if the error handler fails?**  
A: It has built-in retry logic (2 retries) and won't block main function execution.

**Q: Can I silence alerts for a specific function?**  
A: Yes. Change its severity to LOW in `determineSeverity()` or comment out the email step.

**Q: How long are failures kept?**  
A: Inngest keeps execution history for 30 days. Sentry keeps them based on your plan.

**Q: Can I see failure trends?**  
A: Yes. In Sentry, use the Stats tab. In Inngest, view the Functions analytics.
