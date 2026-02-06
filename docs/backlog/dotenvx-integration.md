<!-- TLP:CLEAR -->
# dotenvx Integration - Environment Variable Encryption

**Status:** Backlog
**Priority:** P3 (Nice-to-have)
**Effort:** 4-8 hours (Hybrid) | 16-24 hours (Full)
**Created:** 2026-01-30

---

## Overview

**dotenvx** is an encrypted environment variable management tool from the creator of `dotenv`. It adds public-key encryption (Bitcoin secp256k1) to `.env` files, allowing safe commits to git.

**Website:** https://dotenvx.com/docs/
**GitHub:** https://github.com/dotenvx/dotenvx

---

## Key Benefits

1. **Security**: Encrypted `.env.production` files can be committed to git
2. **Vercel Integration**: Single `DOTENV_PRIVATE_KEY_PRODUCTION` replaces 20+ Vercel UI vars
3. **Secret Rotation**: `dotenvx set KEY value` → commit → deploy (no Vercel UI needed)
4. **Multi-Environment**: Native support for `.env.staging`, `.env.production`, etc.
5. **Audit Trail**: Encrypted changes tracked in git history

---

## Key Concerns

1. **Code Changes**: Requires replacing `process.env.*` with `dotenvx.get()` (20+ files)
2. **Build Process**: All npm scripts need `dotenvx run --` wrapper
3. **Migration Effort**: 870-line `.env.example` to migrate
4. **Complexity**: `.env.keys` file management, team onboarding
5. **Testing**: Vitest/Playwright may need updates
6. **Inngest Compatibility**: Auto-discovery may need explicit config

---

## Recommendation: Hybrid Approach

**Phase 1** (4-8 hours):

- ✅ Encrypt **only** `.env.production`
- ✅ Keep development using `.env.local` (no changes)
- ✅ Set single `DOTENV_PRIVATE_KEY_PRODUCTION` on Vercel
- ✅ **No code changes** - dotenvx handles runtime decryption

**Phase 2** (Optional, if Phase 1 succeeds):

- Migrate critical API routes to `dotenvx.get()`
- Add `.env.staging` encryption
- Update team documentation

---

## When to Prioritize

**Move to P1 if:**

- Handling payment/financial data
- Security compliance required (SOC2, ISO)
- Multi-region deployments planned
- Secret rotation becomes frequent pain point

**Keep as P3 if:**

- Current Vercel + GitHub Secrets works fine
- Team is small (<5 developers)
- No regulatory requirements

---

## Implementation Checklist

**Proof of Concept (2-4 hours):**

- [ ] Install `@dotenvx/dotenvx`
- [ ] Encrypt test `.env.production` file
- [ ] Test single API route with `dotenvx.get()`
- [ ] Verify Vercel deployment
- [ ] Check Inngest compatibility
- [ ] Test CI/CD pipeline

**Full Hybrid Migration (4-8 hours):**

- [ ] Encrypt `.env.production`
- [ ] Update `.gitignore` (allow `.env.production`, block `.env.keys`)
- [ ] Set `DOTENV_PRIVATE_KEY_PRODUCTION` on Vercel
- [ ] Update build scripts: `"build": "dotenvx run -- next build"`
- [ ] Test production deployment
- [ ] Document team workflow
- [ ] Backup `.env.keys` to 1Password

---

## References

- **Analysis Date:** 2026-01-30
- **Current Setup:** `.env.local` (gitignored) + Vercel UI vars
- **Score:** 7/10 - Good security, moderate complexity
- **Alternative:** Continue with current Vercel + GitHub Secrets (works well)

---

## Notes

- **Current `.env.example`:** 870 lines (large migration surface)
- **Scripts folder:** 200+ scripts use `process.env.*` directly
- **Test data rule:** Ensure `NODE_ENV` checks still work with encrypted envs
- **Whitepaper:** https://dotenvx.com/dotenvx.pdf

---

## Decision Log

**2026-01-30:** Initial analysis completed. Recommending Hybrid approach if security needs increase. Current setup (Vercel UI + GitHub Secrets) is sufficient for now. Backlogged for future consideration.
