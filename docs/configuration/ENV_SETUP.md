<!-- TLP:CLEAR -->

# Environment Configuration Setup Guide

Complete guide for setting up environment variables for local development and production deployments.

## Quick Start

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit with your actual credentials
nano .env.local
```

## Services & API Keys

### Inngest (Background Jobs)

Used for asynchronous background job processing, contact form handling, and scheduled tasks.

**Setup:**
1. Sign up at [inngest.com](https://app.inngest.com/)
2. Create a project
3. Copy your event key and signing key

**Environment Variables:**
```
INNGEST_EVENT_KEY=your-key-here
INNGEST_SIGNING_KEY=your-key-here
INNGEST_ERROR_ALERTS_EMAIL=your-email@example.com  # Optional alerts
```

**What It Does:**
- Asynchronous contact form processing
- Scheduled GitHub data refreshes
- Analytics computation
- Background job retries and monitoring

### Resend (Email Delivery)

Used for sending contact form submissions and security alert emails.

**Setup:**
1. Sign up at [resend.com](https://resend.com)
2. Create API key in dashboard
3. Verify domain (if using custom domain)

**Environment Variables:**
```
RESEND_API_KEY=your-key-here
SECURITY_ALERT_EMAIL=security@example.com    # Security alerts
CONTACT_EMAIL=contact@example.com              # Contact form fallback
NEXT_PUBLIC_FROM_EMAIL=no-reply@example.com   # Sender address
```

**What It Does:**
- Sends contact form submissions
- Delivers security alerts
- Email notifications for critical errors

### Sentry (Error Tracking)

Used for error monitoring, performance tracking, and uptime checks.

**Setup:**
1. Sign up at [sentry.io](https://sentry.io)
2. Create a project for your application
3. Copy the DSN (Data Source Name)

**Environment Variables:**
```
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

**Features Enabled:**
- Real-time error alerting
- Performance monitoring
- Session replay (JavaScript errors)
- Release tracking

**Important Note:**
- Sentry is **disabled in development** to avoid polluting production monitoring with dev errors
- Only enabled when `NODE_ENV=production` AND `VERCEL_ENV=production`

### GreyNoise (IP Reputation & Threat Intelligence)

Used for automated IP reputation checking and malicious IP blocking.

**Setup:**
1. Sign up at [viz.greynoise.io](https://viz.greynoise.io/)
2. Create API key (free tier available)
3. Add key to environment

**Environment Variables:**
```
GREYNOISE_API_KEY=your-api-key-here
```

**Rate Limiting Behavior:**
```
Malicious IPs:        0 requests (permanently blocked)
Suspicious IPs:       10 requests per 5 minutes
Unknown IPs:          100 requests per 5 minutes
Benign IPs (RIOT):    1000 requests per 5 minutes
```

**Manual API Usage:**

Check single IP reputation:
```bash
curl -H "Authorization: Bearer $ADMIN_API_KEY" \
  "https://your-domain.com/api/ip-reputation?ip=1.2.3.4"
```

Response example:
```json
{
  "ip": "1.2.3.4",
  "classification": "malicious",
  "confidence": 0.95,
  "threat_types": ["botnet", "scanner"],
  "last_seen": "2025-01-10T12:00:00Z"
}
```

Trigger manual reputation check:
```bash
curl -X POST \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"ips": ["1.2.3.4", "5.6.7.8"]}' \
  "https://your-domain.com/api/ip-reputation/check"
```

**Cost Considerations:**
- GreyNoise is a paid API service (free tier available for basic lookups)
- System caches results in Redis to minimize API calls
- Bulk processing optimizes API usage
- Monitor your usage in the GreyNoise dashboard to avoid overages

### GitHub Integration

Used for GitHub webhooks, authentication, and repository synchronization.

**Setup:**
1. Create a GitHub Personal Access Token (Settings → Developer Settings → Personal Access Tokens)
2. Required scopes: `repo`, `gist`, `workflow`
3. Copy the token

**Environment Variables:**
```
GITHUB_TOKEN=ghp_your-token-here
CRON_SECRET=your-secure-cron-secret-here
```

**What It Does:**
- GitHub webhook integration for activity feed
- Repository data synchronization
- GitHub Actions authentication

### OpenCode.ai (Fallback AI Provider)

Used for AI assistance when primary providers are rate-limited.

**Setup:**
1. Create account at [opencode.ai](https://opencode.ai)
2. Configure in `.opencode/config.json`
3. Set up provider preferences (Claude, Groq, Ollama, etc.)

**Environment Variables:**
```
# Optional - configured in .opencode/config.json instead
OPENCODE_API_KEY=your-key-here
```

**What It Does:**
- Fallback AI provider when Claude is rate-limited
- Cost-effective alternative with Groq
- Local model support via Ollama
- Multi-provider switching

## Vercel Deployment

For Vercel deployments, set these environment variables in your Vercel Project Settings:

1. Go to Project → Settings → Environment Variables
2. Add each variable from `.env.example`
3. Ensure production-only secrets (API keys) are set to "Production" environment only
4. Development environment variables can use mock/test values

**Example Vercel Configuration:**
```yaml
# Production (dcyfr.dev)
NODE_ENV: production
SENTRY_DSN: [Your production Sentry DSN]
INNGEST_EVENT_KEY: [Your production key]
RESEND_API_KEY: [Your production key]

# Preview (deployments to main)
NODE_ENV: production
SENTRY_DSN: [Your production Sentry DSN]
INNGEST_EVENT_KEY: [Your production key]
```

## Local Development Setup

### Minimal Setup (Core Features)

```bash
# Copy example file
cp .env.example .env.local

# Add only critical keys for your development
# Leave optional services blank to test graceful degradation
```

### Full Setup (All Features)

```bash
# Set all API keys from the services above
# This allows testing all features locally
```

### Testing Service Degradation

To test how the app behaves when optional services are missing:

```bash
# Leave these blank in .env.local:
# - INNGEST_EVENT_KEY
# - INNGEST_SIGNING_KEY
# - RESEND_API_KEY
# - SENTRY_DSN
# - GREYNOISE_API_KEY

# App should still work with:
# - Contact form (slower, no emails)
# - IP checking disabled (standard rate limiting only)
# - Errors logged to console (no Sentry)
# - Background jobs disabled
```

## Security Best Practices

### Never Commit Secrets

```bash
# ❌ WRONG - This exposes secrets
git add .env.local
git commit -m "Add env vars"

# ✅ CORRECT - .env.local is in .gitignore
# Environment variables are managed per-environment
```

### Rotate Keys Regularly

- Monthly: Rotate API keys in production
- Immediately: If a key is exposed or appears in logs
- After team changes: Rotate team-shared keys

### Use Different Keys Per Environment

```
Development:  test-keys (low security)
Staging:      staging-keys (medium security)
Production:   prod-keys (high security)
```

### Audit Key Usage

Monitor API usage in each service's dashboard:
- Inngest: https://app.inngest.com/dashboard
- Resend: https://resend.com/dashboard
- Sentry: https://sentry.io/settings/
- GreyNoise: https://viz.greynoise.io/account

## Troubleshooting

### "Sentry is not configured"
- **In Development**: This is expected - Sentry is intentionally disabled in dev mode
- **In Production**: Check that `SENTRY_DSN` is set in Vercel environment variables

### "Email is not configured"
- **Contact form still works**: Submissions are logged to console
- **To fix**: Add `RESEND_API_KEY` to environment variables

### "IP reputation checking failed"
- **Graceful fallback**: Standard rate limiting still protects the app
- **To fix**: Add `GREYNOISE_API_KEY` to environment variables

### "Background jobs not processing"
- **Fallback**: Jobs run synchronously (slower)
- **To fix**: Add `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`

## Environment Variable Validation

Run this to verify your environment is properly configured:

```bash
npm run validate:botid      # Check BotID setup
npm run mcp:validate        # Check MCP servers
npm run dev:check           # Quick development check
npm run dev:check:fast      # Fast validation
```

## Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- .env.example - Complete variable reference
