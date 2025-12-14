# Sentry Alert Manual Setup Guide

## Current Status

✅ **Sentry is receiving events!** (77 events visible in screenshot)
✅ Issue created: "Admin access denied: invalid or missing API key"
❌ Alerts not triggering (deprecated API syntax)

## Quick Alert Setup (5 minutes)

### Step 1: Navigate to Alerts

1. Go to: https://sentry.io
2. Select your organization (dcyfr-labs)
3. Click **"Alerts"** in the left sidebar
4. Click **"Create Alert"** button

### Step 2: Choose Alert Type

- Select **"Issues"** (not "Metric Alerts")
- This is the simplest and works on all Sentry plans

### Step 3: Configure Brute Force Detection Alert

**Basic Info:**
- **Alert name**: `🟠 Brute Force: Admin Access Attempts`
- **Team**: Your team (or leave as default)
- **Environment**: All Environments

**When Conditions (Triggers):**
```
When an event is captured by Sentry and ALL of these filters match:
  - The event's message CONTAINS "Admin access denied"
```

**If Conditions (Filters):**
```
If ALL of these conditions are met:
  - The issue has happened at least 10 times (Optional - for frequency)
```

**Then Actions:**
```
Then perform these actions:
  - Send a notification via Email to [Your Team]
```

**How Often:**
```
Perform actions:
  ○ On every new issue (will alert once per unique issue)
  ● At most once every 30 minutes for an issue (RECOMMENDED)
```

Click **"Save Rule"**

### Step 4: Configure Production Access Alert (Optional)

Repeat Step 2-3 with these settings:

**Basic Info:**
- **Alert name**: `🔴 CRITICAL: Production Admin Access`

**When Conditions:**
```
When an event is captured by Sentry and ALL of these filters match:
  - The event's message CONTAINS "production"
  - The event's message CONTAINS "Admin"
```

**Then Actions:**
```
Then perform these actions:
  - Send a notification via Email to [Your Team]
```

**How Often:**
```
  ● At most once every 5 minutes for an issue
```

### Step 5: Test the Alert

Run the test script to trigger events:

```bash
./scripts/test-security-alerts.sh
```

This will:
- Send 15 failed auth attempts (triggers brute force alert)
- Generate structured logs
- Create events in Sentry

**Expected Result:**
- Within 1-2 minutes, you should receive an email
- Subject: "Alert: 🟠 Brute Force: Admin Access Attempts"
- The email will link to the issue in Sentry

### Step 6: Verify Alert Fired

1. Go to: https://sentry.io/alerts/rules/
2. Click on your alert rule
3. Scroll down to **"Alert History"**
4. You should see recent triggers

## Troubleshooting

### No Email Received?

**Check 1: Email Settings**
```
Settings → Account → Notifications → Email
Ensure "Issue Alerts" is enabled
```

**Check 2: Alert History**
```
Alerts → [Your Alert] → History tab
If no triggers, the conditions might not match
```

**Check 3: Issue Exists**
```
Issues tab → Search for "Admin access denied"
Should show 77+ events
```

### Events Not Appearing?

**Check dev server is running with Sentry enabled:**
```bash
grep "enabled: true" sentry.server.config.ts
# Should return: enabled: true,
```

**Check DSN is configured:**
```bash
grep "^SENTRY_DSN" .env.local | head -1
# Should show your DSN (not empty)
```

**Restart dev server:**
```bash
npm run dev
```

## Alternative: Sentry's Auto-Detection

Sentry can automatically suggest alerts for your most common issues:

1. Go to **Issues** tab
2. Click on "Admin access denied: invalid or missing API key"
3. Look for **"Create Alert"** button at the top
4. Sentry will pre-fill settings based on this specific issue
5. Review and save

This is often the fastest way to set up your first alert!

## After Testing: Disable Sentry in Development

Once alerts are working, revert the temporary change:

```typescript
// sentry.server.config.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Revert to production-only
  enabled: process.env.NODE_ENV === "production",

  // ... rest of config
});
```

Then restart the dev server.

## Summary

**Fastest path to working alerts:**
1. Use Sentry UI (not API scripts)
2. Create "Issue Alert" (not "Metric Alert")
3. Match on: message contains "Admin access denied"
4. Action: Email notification
5. Frequency: At most once every 30 minutes
6. Test with: `./scripts/test-security-alerts.sh`

**Current achievement:**
- ✅ 77 events successfully sent to Sentry
- ✅ Events properly grouped by fingerprint
- ✅ Structured logging working
- ⏳ Waiting for alert configuration

You're 90% done - just need the manual alert setup!
