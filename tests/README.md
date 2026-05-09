# Tests

Vitest scans two roots (see [`vitest.config.ts`](../vitest.config.ts)):

- `tests/**/*.{test,spec}.{ts,tsx}` — all unit, integration, security, and component tests
- `scripts/__tests__/**/*.{test,spec}.{ts,mjs}` — tests for build/automation scripts

E2E tests live in `e2e/` and run via Playwright (`npm run test:e2e`).

**All tests live under `tests/`. There are no co-located test files in `src/`.** Mirror the source path under `tests/` — e.g. a test for `src/components/security/ScanResults.tsx` lives at `tests/components/security/ScanResults.test.tsx`. Import the module under test via the `@/` alias.

## Where does this test go?

| Test type                          | Location                                  |
| ---------------------------------- | ----------------------------------------- |
| Component render / hook behavior   | `tests/components/<area>/<name>.test.tsx` |
| Pure function in `src/lib/`        | `tests/lib/<name>.test.ts`                |
| API route integration              | `tests/integration/<name>.test.ts`        |
| Security / auth / input-validation | `tests/security/<name>.test.ts`           |
| Red-team negative cases            | `tests/red-team/<name>.test.ts`           |
| Build / generator script behavior  | `scripts/__tests__/<name>.test.mjs`       |
| Full user journey                  | `e2e/<name>.spec.ts`                      |

## Setup files

- [`vitest.setup.ts`](./vitest.setup.ts) — global Vitest setup (Testing Library cleanup, fetch mock, Jest DOM matchers)
- [`msw-handlers.ts`](./msw-handlers.ts) — MSW handlers for `/api/github-contributions`, `/api/contact`, `/api/health`
- [`common-mocks.ts`](./common-mocks.ts) — shared mock factories
- [`__mocks__/server-only.ts`](./__mocks__/server-only.ts) — Next.js `server-only` marker shim
