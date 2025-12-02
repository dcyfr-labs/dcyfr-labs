# CSP Quick Reference

Quick reference for Content Security Policy implement| Service | Domain | Directive |
|---------|--------|--------|
| Vercel Analytics | `va.vercel-scripts.com` | `script-src`, `connect-src` |
| Vercel Insights | `*.vercel-insights.com` | `script-src`, `connect-src` |
| Vercel Live | `vercel.live`, `*.pusher.com` | `script-src`, `style-src`, `img-src`, `font-src`, `connect-src` |
| Google Fonts API | `fonts.googleapis.com` | `style-src` |
| Google Fonts CDN | `fonts.gstatic.com` | `font-src` |
| Vercel Images | `*.vercel.com` | `img-src` |n www.dcyfr.ai.

## Current CSP Header

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://*.vercel-insights.com https://vercel.live;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live;
img-src 'self' data: https://*.vercel.com https://vercel.com https://vercel.live;
font-src 'self' https://fonts.gstatic.com https://vercel.live;
connect-src 'self' https://va.vercel-scripts.com https://*.vercel-insights.com https://vercel-insights.com https://vercel.live https://*.pusher.com wss://*.pusher.com;
frame-src 'none';
object-src 'none';
base-uri 'self';
form-action 'self';
upgrade-insecure-requests;
block-all-mixed-content
```

## Implementation Files

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Dynamic CSP with nonce generation (primary) |
| `vercel.json` | Static CSP fallback (defense in depth) |

## Quick Testing

```bash
# Build and check
npm run build

# Check CSP header in browser
curl -I https://www.dcyfr.ai | grep -i content-security

# Test locally
npm run dev
# Open DevTools Console - look for CSP violations
```

## Common Tasks

### Add New Script Source

```typescript
// In src/middleware.ts
"script-src 'self' 'unsafe-inline' https://new-source.com ..."

// In vercel.json
"script-src 'self' 'unsafe-inline' https://new-source.com ..."
```

### Add New API Connection

```typescript
// In src/middleware.ts
"connect-src 'self' https://api.example.com ..."

// In vercel.json
"connect-src 'self' https://api.example.com ..."
```

### Add New Image Source

```typescript
// In src/middleware.ts
"img-src 'self' data: https://images.example.com ..."

// In vercel.json  
"img-src 'self' data: https://images.example.com ..."
```

## Allowed Domains

| Service | Domain | Directive |
|---------|--------|-----------|
| Vercel Analytics | `va.vercel-scripts.com` | `script-src`, `connect-src` |
| Vercel Insights | `*.vercel-insights.com` | `script-src`, `connect-src` |
| Google Fonts API | `fonts.googleapis.com` | `style-src` |
| Google Fonts CDN | `fonts.gstatic.com` | `font-src` |
| Vercel Images | `*.vercel.com` | `img-src` |

## Troubleshooting

### Script Blocked

```
Console: Refused to execute inline script
Fix: Check script-src includes required domain
```

### Style Blocked

```
Console: Refused to apply inline style
Fix: Check style-src includes 'unsafe-inline' or nonce
```

### Image Blocked

```
Console: Refused to load image
Fix: Check img-src includes source domain
```

### Font Blocked

```
Console: Refused to load font
Fix: Check font-src includes fonts.gstatic.com
```

## CSP Violation Example

```javascript
// This will be blocked:
<script src="https://unknown-domain.com/script.js"></script>

// This is allowed:
<script src="https://va.vercel-scripts.com/v1/script.js"></script>
```

## Testing Checklist

- [ ] Home page loads
- [ ] Blog posts work
- [ ] Contact form submits
- [ ] Vercel Analytics loads
- [ ] Google Fonts render
- [ ] No console errors
- [ ] Theme toggle works
- [ ] Toast notifications appear

## Report Mode (For Testing)

To test without blocking:

```typescript
// Change in src/middleware.ts
response.headers.set(
  "Content-Security-Policy-Report-Only",  // Note: -Report-Only
  cspHeader
);
```

## Links

- **Full Documentation:** `docs/security/csp/implementation.md`
- **Middleware:** `src/middleware.ts`
- **Config:** `vercel.json`
- **CSP Evaluator:** https://csp-evaluator.withgoogle.com/

## Status

✅ Implemented: October 5, 2025  
✅ Build: Passing  
✅ Security: Enhanced (XSS & Clickjacking protection)
