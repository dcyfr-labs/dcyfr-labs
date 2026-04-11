# DCYFR False-Positive Filtering Instructions

<!-- TLP:CLEAR -->
<!-- Referenced by .github/workflows/security-review.yml via false-positive-filtering-instructions -->
<!-- Plain English instructions telling Claude which findings to suppress or downgrade. -->

## Suppress These Categories Entirely

- **Denial of Service / rate limiting on public endpoints**: We use Upstash
  rate limiting deliberately on public API routes. Any finding about missing
  or insufficient rate limiting on public-facing endpoints does not need to
  be reported unless rate limiting is completely absent server-wide.

- **Memory / CPU exhaustion**: These are infrastructure-level concerns handled
  by Vercel's edge runtime limits. Application-level DoS from unbounded loops
  is still reportable.

- **Open redirect on marketing / social share URLs**: The site intentionally
  has social sharing links that accept external URLs (Twitter share, LinkedIn
  share, etc.). These are not vulnerabilities.

- **Missing HttpOnly / Secure flags on session cookies**: We are evaluating
  Next.js Auth.js session configuration separately. Do not report per-cookie
  flag issues.

- **Missing CSRF tokens on GET requests**: GET requests should never have
  side effects in this codebase. CSRF only applies to state-mutating endpoints.

- **Generic "use parameterised queries" warnings on ORM calls**: We use Drizzle
  ORM. Findings that correctly identify a Drizzle query builder call as
  "concatenated string" when it is in fact a parameterised ORM method are
  false positives.

- **Environment variable presence checks**: Calls to
  `process.env.SOME_SECRET` are a configuration pattern, not a hardcoded
  secret. Only report when an actual secret value is hardcoded in source.

- **`dangerouslySetInnerHTML` in MDX blog components**: The blog renderer
  sanitises all input through `rehype-sanitize` before rendering. Do not
  report `dangerouslySetInnerHTML` findings in `src/components/common/mdx.tsx`
  or any MDX rendering pipeline component unless sanitisation is bypassed.

## Lower Severity (Report as Low / Informational Only)

- Design token validation scripts and internal build scripts that process
  trusted developer-authored content — these don't handle untrusted user input.

- Test files (`*.test.ts`, `*.spec.ts`, `e2e/`) — security issues in test
  infrastructure are lower priority and should be noted but not block PRs.

- Internal admin routes under `src/app/admin/` that are protected by
  Anthropic-issued API verification — note access control concerns but mark
  as informational unless an actual bypass is demonstrated.

## Always Report (Do Not Suppress Even If Matching Above)

- Any hardcoded API key, token, or credentials string (even in comments or
  test fixtures).
- Server-Side Request Forgery (SSRF) affecting proxy or URL-fetch routes.
- SQL injection or NoSQL injection in any context.
- Remote Code Execution in any form.
- Broken authentication or privilege escalation on API routes.
- Data exfiltration or PII logged to Vercel / Sentry without redaction.
