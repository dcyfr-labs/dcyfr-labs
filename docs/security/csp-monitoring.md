{/* TLP:CLEAR */}

# Content Security Policy (CSP) Monitoring

**Last Updated:** November 19, 2025  
**Status:** ✅ Active & Healthy

## Overview

This document tracks CSP violations reported to `/api/csp-report` and provides guidance on handling them.

## Current CSP Configuration

Location: `src/proxy.ts`

### Directives

```typescript
{
  "default-src": "'self'",
  "script-src": "'self' 'nonce-${nonce}' https://va.vercel-scripts.com https://*.vercel-insights.com https://vercel.live",
  "style-src": "'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live",
  "img-src": "'self' data: https://www.dcyfr.ai https://*.vercel.com https://avatars.githubusercontent.com https://vercel.live",
  "font-src": "'self' https://fonts.gstatic.com https://vercel.live",
  "connect-src": "'self' https://va.vercel-scripts.com https://*.vercel-insights.com https://*.sentry.io https://vercel.live https://*.pusher.com",
  "frame-src": "https://vercel.live https://giscus.app https://*.vercel-insights.com",
  "worker-src": "'self' blob:",
  "object-src": "'none'",
  "base-uri": "'self'",
  "form-action": "'self'",
  "upgrade-insecure-requests": "",
  "block-all-mixed-content": "",
  "report-uri": "/api/csp-report"
}
```

## Violation History

### 2025-11-12: Perplexity AI Browser Extension

**Sentry Issue:** [CYBERDREW-DEV-9](https://dcyfr-labs.sentry.io/issues/CYBERDREW-DEV-9)

**Details:**
- **Blocked URI:** `https://r2cdn.perplexity.ai/fonts/FKGroteskNeue.woff2`
- **Violated Directive:** `font-src`
- **Environment:** Production (`https://www.dcyfr.ai/`)
- **User Impact:** 1 user with Perplexity AI browser extension
- **Browser:** Chrome 141 on macOS
- **Timestamp:** 2025-11-12 17:01:23 UTC

**Root Cause:**  
Third-party browser extension (Perplexity AI) attempting to inject custom font into the page.

**Resolution:**  
✅ No action required. CSP working as intended by blocking unauthorized third-party content.

**Status:** Closed (expected behavior, not a bug)

## Violation Types & Handling

### Third-Party Browser Extensions

**Examples:** Ad blockers, password managers, AI assistants (like Perplexity)

**Characteristics:**
- Single or low occurrence count
- External domains (not your infrastructure)
- Font, script, or style injections
- User-specific (not affecting all visitors)

**Action:** ✅ **No action required** - Document and monitor

**Rationale:**
- CSP correctly protecting your site
- Cannot control user's browser extensions
- Extensions should respect CSP policies
- No security risk to your site

### Legitimate Site Resources

**Examples:** Newly added third-party services, CDN changes

**Characteristics:**
- High occurrence rate
- Affects all/many users
- Blocks legitimate functionality
- Consistent patterns

**Action:** 🔧 **Update CSP policy**

**Steps:**
1. Verify the resource is legitimate and necessary
2. Add domain to appropriate CSP directive
3. Test in development/staging
4. Deploy and monitor
5. Document change in this file

### Potential Security Issues

**Examples:** XSS attempts, malicious injections

**Characteristics:**
- Suspicious or unknown domains
- Multiple directive violations
- eval() or inline script attempts
- Data exfiltration patterns

**Action:** 🚨 **Investigate immediately**

**Steps:**
1. Create Sentry issue
2. Analyze violation context and source
3. Check for XSS vulnerabilities
4. Review recent code changes
5. Update security measures if needed

## Monitoring Guidelines

### Weekly Review (5 minutes)

1. Check Sentry for new CSP violations
2. Categorize by type (extension vs. legitimate vs. security)
3. Document any patterns or trends
4. Update this document if needed

### Monthly Audit (30 minutes)

1. Review all violations from past 30 days
2. Analyze patterns and trends
3. Assess if CSP policy needs updates
4. Test CSP policy against known bypasses
5. Update documentation

### Metrics to Track

- **Total violations:** Target &lt;5 per month (third-party only)
- **Unique violation sources:** Monitor for patterns
- **Affected users:** Should be low single digits
- **Legitimate blocks:** Should be 0 (means policy needs update)

## Testing CSP

### Manual Testing

```bash
# Test CSP headers in development
curl -I http://localhost:3000 | grep -i content-security-policy

# Test CSP headers in production
curl -I https://www.dcyfr.ai | grep -i content-security-policy
```

### Automated Testing

Use [CSP Evaluator](https://csp-evaluator.withgoogle.com/) to validate policy:

```bash
# Get CSP header
curl -I https://www.dcyfr.ai | grep -i content-security-policy > csp.txt

# Paste into: https://csp-evaluator.withgoogle.com/
```

### Common Issues

**Issue:** Nonce not working in development  
**Cause:** Turbopack HMR requires `unsafe-eval`  
**Solution:** Development adds `unsafe-eval` automatically

**Issue:** Inline styles blocked  
**Cause:** Third-party scripts inject styles without nonces  
**Solution:** Use `unsafe-inline` for styles only (acceptable risk)

**Issue:** Vercel Analytics blocked  
**Cause:** Missing vercel-scripts.com in script-src  
**Solution:** Already included in policy

## Policy Update Process

1. **Identify Need**
   - CSP violation blocks legitimate feature
   - New third-party service added
   - Security recommendation

2. **Evaluate Security Impact**
   - Is the domain trustworthy?
   - What resources are loaded?
   - Can we use stricter alternatives?

3. **Test Changes**
   ```bash
   # Update src/proxy.ts
   # Test locally
   npm run dev
   
   # Test production build
   npm run build
   npm start
   ```

4. **Deploy**
   - Create PR with changes
   - Document reason in commit message
   - Update this document

5. **Monitor**
   - Check Sentry for new violations
   - Verify functionality works
   - Watch for 30 days

## Resources

- **CSP Specification:** https://www.w3.org/TR/CSP3/
- **MDN CSP Guide:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- **CSP Evaluator:** https://csp-evaluator.withgoogle.com/
- **Report URI:** https://report-uri.com/
- **Sentry CSP Docs:** https://docs.sentry.io/platforms/javascript/configuration/integrations/captureconsole/

## Current Status

✅ **Healthy** - CSP working as intended

**Last 30 Days:**
- Total violations: 1
- Type: Third-party browser extension (expected)
- Legitimate blocks: 0
- Security issues: 0

**Next Review:** December 19, 2025
