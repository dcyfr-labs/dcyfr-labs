<!-- TLP:CLEAR -->

# CSP Intelligent Filtering Implementation

**Date**: December 18, 2025
**Status**: ✅ Implemented

## Overview

Implemented intelligent filtering for CSP violation reports to automatically exclude known false positives (browser extensions, development tools) while preserving visibility of legitimate security concerns.

## Problem Statement

CSP violations were cluttering Sentry with false positives:
- **Browser extensions** injecting inline scripts without nonces
- **Development environment** traffic from localhost
- **Dev tools** (React DevTools, Redux DevTools) triggering violations
- **Result**: 109 violations from DCYFR-LABS-9, all from browser extensions

## Solution: Multi-Layer Filtering

### 1. Server-Side Filtering

**Location**: [`src/app/api/csp-report/route.ts`](../../src/app/api/csp-report/route.ts)

Implemented `isKnownFalsePositive()` function that filters violations BEFORE sending to Sentry.

#### Filter Criteria

```typescript
function isKnownFalsePositive(
  violationData: {
    blockedUri: string;
    sourceFile: string;
    effectiveDirective?: string;
  },
  clientIp: string
): boolean
```

**Filter 1: Localhost Traffic**
```typescript
if (clientIp === "127.0.0.1" || clientIp === "::1") {
  return true; // Development environment
}
```

**Filter 2: Browser Extension Indicators**
```typescript
const extensionIndicators = [
  "about",                    // Chrome extension pages
  "chrome-extension://",
  "moz-extension://",
  "safari-extension://",
  "ms-browser-extension://",
];
```

**Filter 3: Inline Scripts Without Legitimate Source**
```typescript
const isInlineScript = violationData.blockedUri === "inline";
const hasVagueSource = sourceFile === "about" || sourceFile === "unknown" || !sourceFile;

if (isInlineScript && hasVagueSource) {
  return true; // Likely browser extension
}
```

**Filter 4: Script-src-elem + Inline + Vague Source**
```typescript
if (
  violationData.effectiveDirective === "script-src-elem" &&
  isInlineScript &&
  hasVagueSource
) {
  return true; // Most common extension violation pattern
}
```

### 2. Conditional Sentry Reporting

```typescript
// Check if this is a known false positive
const isFalsePositive = isKnownFalsePositive(violationData, clientIp);

// Always log to console for debugging (Vercel logs → Axiom)
if (isFalsePositive) {
  console.info("CSP Violation (Known False Positive):", {
    ...violationData,
    reason: "Browser extension or development environment",
    filtered: true,
  });
} else {
  console.warn("CSP Violation Report:", violationData);
}

// Send to Sentry ONLY if NOT a false positive
if (!isFalsePositive) {
  Sentry.captureMessage("CSP Violation", { ... });
}
```

### 3. Custom Fingerprinting

Improved issue grouping in Sentry with custom fingerprints:

```typescript
fingerprint: [
  "csp-violation",
  violationData.effectiveDirective || "unknown",
  violationData.blockedUri || "unknown",
]
```

**Benefits**:
- Groups violations by directive + blocked URI
- Prevents fragmentation across multiple issues
- Easier to track patterns and trends

## Configuration

### Sentry Fingerprint Rules (Optional)

You can also add server-side fingerprint rules in Sentry:

**Location**: `Project Settings → Issue Grouping → Fingerprint Rules`

```yaml
# Group all CSP violations together
error.type:CSP Violation -> csp-violation

# Auto-ignore browser extension violations (backup to server-side filtering)
error.value:"sourceFile: about" -> browser-extension-csp
```

**Source**: [Sentry Fingerprint Rules Documentation](https://docs.sentry.io/concepts/data-management/event-grouping/fingerprint-rules/)

### Environment Variables

No additional environment variables required. Uses existing:
- `SENTRY_AUTH_TOKEN` - For Sentry integration
- Request IP detection from Next.js

## Impact Analysis

### Before Implementation

- **Sentry Issues**: Cluttered with 109 false positive violations
- **Developer Experience**: Difficult to identify real security issues
- **Alert Fatigue**: Warnings for non-actionable violations

### After Implementation

- **Sentry Issues**: Only legitimate CSP violations logged
- **Vercel Logs**: All violations still captured (including filtered ones)
- **Axiom**: Complete audit trail preserved
- **Developer Experience**: Clean signal-to-noise ratio

## Testing

### Test Scenario 1: Localhost Traffic

```bash
# From localhost (127.0.0.1)
curl -X POST http://localhost:3000/api/csp-report \
  -H "Content-Type: application/json" \
  -d '{
    "csp-report": {
      "blocked-uri": "inline",
      "source-file": "about",
      "violated-directive": "script-src-elem"
    }
  }'
```

**Expected**: Logged to Vercel/Axiom, NOT sent to Sentry

### Test Scenario 2: Production with Extension

```bash
# From production with extension indicators
curl -X POST https://www.dcyfr.ai/api/csp-report \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 203.0.113.1" \
  -d '{
    "csp-report": {
      "blocked-uri": "inline",
      "source-file": "about",
      "violated-directive": "script-src-elem"
    }
  }'
```

**Expected**: Logged to Vercel/Axiom, NOT sent to Sentry (filtered by sourceFile)

### Test Scenario 3: Legitimate Violation

```bash
# Legitimate CSP violation (malicious script)
curl -X POST https://www.dcyfr.ai/api/csp-report \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 203.0.113.1" \
  -d '{
    "csp-report": {
      "blocked-uri": "https://evil.com/malicious.js",
      "source-file": "https://www.dcyfr.ai/",
      "violated-directive": "script-src"
    }
  }'
```

**Expected**: Logged to Vercel/Axiom AND sent to Sentry ✅

## Monitoring

### Vercel Logs (Complete Audit Trail)

All violations (filtered + legitimate) are logged to Vercel:

```typescript
// Filtered violations
console.info("CSP Violation (Known False Positive):", { ... });

// Legitimate violations
console.warn("CSP Violation Report:", { ... });
```

**Access**: Vercel Dashboard → Logs → Filter by "CSP Violation"

### Axiom (Queryable Logs)

Query filtered vs. legitimate violations:

```apl
['vercel']
| where ['message'] contains "CSP Violation"
| extend filtered = iff(['message'] contains "False Positive", true, false)
| summarize count() by filtered, bin_auto(['_time'])
```

### Sentry (Legitimate Violations Only)

Only real security concerns appear in Sentry with proper grouping:

- **Fingerprint**: Groups by directive + blocked URI
- **Tags**: `violatedDirective`, `effectiveDirective`, `disposition`
- **Context**: Full violation details in CSP context

## Benefits

### 1. Reduced Alert Fatigue

✅ **Before**: 109 violations over 36 days (all false positives)
✅ **After**: Only legitimate violations trigger Sentry issues

### 2. Preserved Audit Trail

✅ All violations still logged to Vercel/Axiom
✅ Can query filtered violations for debugging
✅ Complete forensics if needed

### 3. Better Issue Grouping

✅ Custom fingerprints prevent issue fragmentation
✅ Easier to track patterns and trends
✅ Clearer action items

### 4. No Legitimate Violations Missed

✅ Conservative filtering (only obvious false positives)
✅ Real security issues always logged to Sentry
✅ Can adjust filters based on patterns

## Maintenance

### Adding New Filter Rules

To filter additional patterns, update `isKnownFalsePositive()`:

```typescript
// Example: Filter specific extension URLs
const knownExtensionUrls = [
  "chrome-extension://abc123/script.js",
  "moz-extension://def456/content.js",
];

if (knownExtensionUrls.includes(violationData.blockedUri)) {
  return true;
}
```

### Monitoring Filter Effectiveness

Query Axiom to see filtered violations:

```apl
['vercel']
| where ['message'] contains "Known False Positive"
| summarize count() by bin_auto(['_time'])
| render timechart
```

### Reviewing Filtered Violations

Periodically review filtered violations to ensure no false negatives:

```apl
['vercel']
| where ['message'] contains "Known False Positive"
| project ['_time'], ['message']
| take 100
```

## Rollback Plan

If filtering causes issues:

1. **Quick Disable**: Comment out the `isFalsePositive` check
   ```typescript
   // const isFalsePositive = isKnownFalsePositive(violationData, clientIp);
   const isFalsePositive = false; // Disable filtering temporarily
   ```

2. **Selective Disable**: Remove specific filter criteria
   ```typescript
   // Comment out Filter 4 if too aggressive
   // if (violationData.effectiveDirective === "script-src-elem" && ...) { ... }
   ```

3. **Revert**: Git revert the commit
   ```bash
   git revert <commit-hash>
   ```

## Related Documentation

- [CSP Implementation Guide](./csp/implementation.md)
- [Sentry Fingerprint Rules](https://docs.sentry.io/concepts/data-management/event-grouping/fingerprint-rules/)
- [Sentry Issue Alerts](https://docs.sentry.io/product/alerts/create-alerts/issue-alert-config/)

**Internal Documentation** (Private):

- CSP Violation Analysis Reports - `docs/security/private/`
- Sentry MCP Setup Guide - `docs/troubleshooting/private/`
- Implementation Summaries - `docs/security/private/`

## Future Enhancements

### 1. Machine Learning Detection

Use historical data to identify extension patterns:
- Train on known false positives
- Detect new extension signatures automatically
- Update filters dynamically

### 2. Allowlist Management

Create admin UI to manage allowed/blocked patterns:
- Add extension URLs to allowlist
- Review and approve filtered violations
- Export/import filter rules

### 3. Advanced Fingerprinting

Enhance Sentry grouping with:
- User agent clustering
- Geographic patterns
- Time-based correlation

### 4. Alert Thresholds

Set up intelligent alerts:
- Alert only if >10 violations/hour from unique IPs
- Suppress single-occurrence violations
- Escalate patterns that match attack signatures

## Tags

`csp`, `security`, `filtering`, `false-positives`, `browser-extensions`, `sentry`, `automation`
