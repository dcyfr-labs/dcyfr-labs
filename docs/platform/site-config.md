{/* TLP:CLEAR */}

Site configuration and environment overrides

This file documents how to update site-wide values and how environment variables affect the active domain and derived values.

Location

- `src/lib/site-config.ts` — central source-of-truth for domain, author, site title, and common derived values.

Provided constants

- DOMAIN_DEV — default local development domain ("localhost").
- DOMAIN_PREVIEW — preview deployments (e.g., vercel preview domain).
- DOMAIN_PRODUCTION — production domain.
- SITE_DOMAIN — derived active domain used across the site (see override rules below).
- SITE_URL — `https://${SITE_DOMAIN}`.
- AUTHOR_NAME — display name used in JSON-LD and UI.
- AUTHOR_EMAIL — primary email address.
- FROM_EMAIL — default from address for outgoing contact emails (derived as `contact@${SITE_DOMAIN}`).
- SITE_TITLE — site title.

How SITE_DOMAIN is chosen

The code selects `SITE_DOMAIN` with this priority:

1. `NEXT_PUBLIC_SITE_DOMAIN` (explicit override) — highest priority.
2. If `NEXT_PUBLIC_VERCEL_ENV === 'preview'` then use `DOMAIN_PREVIEW`.
3. If `NODE_ENV === 'development'` then use `DOMAIN_DEV`.
4. Otherwise default to `DOMAIN_PRODUCTION`.

How to customize

- For local development, you usually don't need to change anything; `NODE_ENV` will be `development` and `SITE_DOMAIN` will be `localhost`.
- For preview deployments, Vercel sets `NEXT_PUBLIC_VERCEL_ENV=preview`, so the preview domain will be used.
- To explicitly force a domain (e.g., for QA or special staging), set environment variable `NEXT_PUBLIC_SITE_DOMAIN` to the desired domain (e.g., `staging.example.com`).

Notes about build-time vs runtime

- These constants are read at runtime in server components and server routes. When running static builds, ensure environment variables are available at build-time if you want the build to reflect a non-production domain.

Security & secrets

- Do not store API keys or secrets in this file. Use environment variables for secret values.

Examples

- Force staging domain during preview builds:
  - Set `NEXT_PUBLIC_SITE_DOMAIN=staging.www.dcyfr.ai` in the preview build environment.

- Local dev (default): no changes required.

Contact

- If you want a different `FROM_EMAIL`, edit `src/lib/site-config.ts` to set an explicit `FROM_EMAIL` constant instead of the derived value.