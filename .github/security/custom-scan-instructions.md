# DCYFR Custom Security Scan Instructions

<!-- TLP:CLEAR -->
<!-- Referenced by .github/workflows/security-review.yml via custom-security-scan-instructions -->
<!-- Provides stack context and focus areas so analysis is precise rather than generic. -->

## Tech Stack Context

- **Framework**: Next.js 15 (App Router). Pages use React Server Components by
  default. Client components use `"use client"` at the top of the file.
- **Hosting**: Vercel Edge + Node.js serverless functions. Requests run in
  isolated edge runtimes per invocation.
- **Authentication**: NextAuth.js / Auth.js for session management.
- **Background jobs**: Inngest (event-driven, runs in a separate serverless
  context). Inngest functions receive signed event payloads — always verify
  signatures using `inngest.createFunction`.
- **Database ORM**: Drizzle ORM over a PostgreSQL-compatible database.
  Parameterised queries are used by default through the Drizzle query builder.
- **Cache / rate limiter**: Upstash Redis. Values stored in Upstash are
  untrusted if they originate from user input — check for poisoning.
- **File handling**: Blog posts are MDX files compiled at build time.
  Dynamic MDX compilation at runtime is NOT used. If you see `mdx-bundler` or
  `next-mdx-remote` with untrusted content at request time, flag it.
- **External HTTP calls**: Made via the native `fetch` API. Any URL that
  includes user-controlled input is a potential SSRF — always flag this.
- **MCP servers**: Internal Model Context Protocol servers in
  `src/app/api/mcp/` accept JSON-RPC over HTTP. Treat input to these endpoints
  as fully untrusted.

## High-Priority Areas to Focus On

1. **API routes** (`src/app/api/`): Look for IDOR (insecure direct object
   references), missing auth checks, SSRF in URL parameters, and unsafe
   deserialization of request bodies.

2. **Inngest functions** (`src/lib/inngest/`, `src/app/api/inngest/`): Verify
   all event handlers validate the shape of `event.data` before use and do not
   trust event payload fields without validation.

3. **Proxy and redirect routes**: Any route that fetches a URL from a query
   parameter or request body must validate against an allowlist. Check
   `src/app/api/proxy/`, `src/middleware.ts`, and any route with "redirect"
   in the name.

4. **Admin routes** (`src/app/admin/`): Check that every handler verifies the
   caller is an authenticated admin. Look for missing `auth()` checks.

5. **Credential handling**: Look for API keys or tokens passed as URL query
   parameters (should only be in headers or body). Check any route that accepts
   `apiKey` or `token` as a URL search parameter.

6. **Upstash / Redis reads used as trusted input**: If a value read from Redis
   is used in a SQL-like query, a `fetch()` URL, or eval context, flag it as a
   potential cache poisoning vulnerability.

7. **MCP server endpoints** (`src/app/api/mcp/`): Ensure each tool handler
   validates required parameters and does not execute arbitrary commands based
   on un-validated method names from the JSON-RPC payload.

## Severity Calibration Guidance

- **Critical**: RCE, hardcoded secrets, SSRF with full internal network access,
  auth bypass on admin endpoints, SQL/NoSQL injection.
- **High**: Broken access control where a regular user can read/modify another
  user's data, SSRF with limited scope, stored XSS in any persisted content,
  unsafe deserialization.
- **Medium**: Reflected XSS in non-persisted content, information disclosure of
  stack traces or internal paths, missing auth check on non-sensitive read
  endpoints, CSRF on low-impact actions.
- **Low / Informational**: Missing security headers, verbose error messages,
  best-practice deviations with no direct exploitability path.

## Out of Scope

- `/public/` and `/docs/` directories (static assets, no code logic).
- `e2e/` and `tests/` directories (see false-positive instructions).
- `node_modules/` (dependency scanning is handled separately by Dependabot and
  `npm audit`).
- Build output at `.next/`.
