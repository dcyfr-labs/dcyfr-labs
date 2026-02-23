<!-- TLP:CLEAR -->

# Guardrail: Next.js Middleware / Proxy Coexistence

**Classification:** TLP:CLEAR  
**Category:** Build Correctness / Security Architecture  
**Created:** 2026-02-22  
**Severity:** CRITICAL — build fails immediately if violated

---

## The Rule

**`src/middleware.ts` and `src/proxy.ts` MUST NOT exist simultaneously.**

Next.js 16+ enforces exactly one edge interception file. If both are present the
build aborts with:

```text
Error: Both middleware file "./src/src/middleware.ts" and proxy file
"./src/src/proxy.ts" are detected. Please use "./src/src/proxy.ts" only.
Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
```

---

## Current Canonical File

**`src/proxy.ts`** is the single source of truth for all edge-level concerns:

| Concern                                  | Implementation                                                                               |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| Content Security Policy (CSP nonce)      | `buildCspDirectives()`                                                                       |
| Suspicious path reconnaissance blocking  | `checkSuspiciousPath()` + `SUSPICIOUS_PATHS` list                                            |
| Honeypot paths (`/private`)              | `checkHoneypotPath()`                                                                        |
| `/dev/*` and `/api/dev/*` in production  | `checkHoneypotPath(["/dev"])` + `checkDevApiAccess()` — gated on `isProduction` (VERCEL_ENV) |
| `/api/debug/*` outside local dev         | `checkDebugApiAccess()` — gated on `!isDevelopment` (NODE_ENV)                               |
| `/api/admin/*` Bearer token auth (H-001) | `checkAdminApiAuth()` — enforced in all environments                                         |
| Internal API external-origin blocking    | `checkInternalApiAccess()`                                                                   |
| IndexNow key file serving                | `handleIndexNowKeyFile()`                                                                    |
| Sentry breadcrumbs for all blocks        | Embedded in each check function                                                              |

---

## Environment Logic Reference

Two independent env signals are used — do **not** conflate them:

| Variable                      | True When                   | Used For                                                     |
| ----------------------------- | --------------------------- | ------------------------------------------------------------ |
| `NODE_ENV === "development"`  | Local dev only              | `isDevelopment` — allows debug routes, loose CSP             |
| `VERCEL_ENV === "production"` | Live Vercel deployment only | `isProduction` — blocks /dev routes (preview retains access) |

Preview deployments are **neither**: `isDevelopment=false`, `isProduction=false`.
This intentionally allows `/dev/*` and `/api/dev/*` access in preview builds.

---

## Why This Conflict Occurred (History)

| Date         | Event                                                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Jan 27, 2026 | `middleware.ts` deleted; logic consolidated into `proxy.ts` (commit `c7e3dc66`)                                                                               |
| Feb 22, 2026 | Security audit H-001/H-002 prompted re-creation of `middleware.ts` (commit `95fab910`) without awareness that `proxy.ts` already covered `/dev` path blocking |
| Feb 22, 2026 | Conflict detected on production build; `middleware.ts` removed and missing guards merged into `proxy.ts`                                                      |

---

## Adding New Edge Logic

**Always add to `src/proxy.ts`.** Pattern to follow:

```typescript
/**
 * Check <what> — <condition that triggers block>.
 * Returns null if allowed.
 */
function checkMyNewGuard(request: NextRequest, pathname: string): NextResponse | null {
  if (!pathname.startsWith('/my-path')) return null;

  Sentry.addBreadcrumb({
    category: 'security',
    message: `<description>: ${pathname}`,
    level: 'warning',
    data: securityBreadcrumbData(request, pathname, 'my-category'),
  });

  return NextResponse.rewrite(new URL('/_not-found', request.url));
}
```

Then call it inside `performSecurityChecks()` with the appropriate environment gate.

---

## When `middleware.ts` May Return

Next.js may re-introduce `middleware.ts` as a standard alongside `proxy.ts` in a
future major version. **Before creating `middleware.ts` again:**

1. Confirm the installed Next.js version explicitly supports both files concurrently
2. Reference the official migration guide: [nextjs.org/docs/messages/middleware-to-proxy](https://nextjs.org/docs/messages/middleware-to-proxy)
3. Audit `proxy.ts` to identify any logic that should stay in proxy vs. move to middleware
4. Update this guardrail to describe the new coexistence rules and approved split

---

## Pre-Commit Check

The following one-liner can be added as a pre-commit hook or CI step to catch
the conflict before a build is attempted:

```bash
# Fail if both files exist
if [ -f src/middleware.ts ] && [ -f src/proxy.ts ]; then
  echo "ERROR: src/middleware.ts and src/proxy.ts cannot coexist (Next.js 16+)."
  echo "See docs/guardrails/NEXTJS_MIDDLEWARE_PROXY_CONFLICT.md"
  exit 1
fi
```
