# Private Package Integration Strategy

**Document ID:** TLP:GREEN
**Last Updated:** February 1, 2026
**Status:** Recommended Architecture

## Overview

This document outlines the secure integration strategy for `@dcyfr/agents` (proprietary package) into dcyfr-labs while maintaining security and preventing accidental exposure.

---

## Current Architecture

### Compatibility Layer (✅ Already Implemented)

The `src/lib/ai-compat.ts` module provides a **zero-trust compatibility layer**:

```typescript
// Dynamic import with graceful fallback
try {
  const gates = await import('@dcyfr/agents/enforcement/approval-gates' as any);
  // Use proprietary implementation
} catch (error) {
  // Fallback to safe default behavior
  console.warn('@dcyfr/agents not available, using conservative defaults');
  return true; // Safe default: require approval
}
```

**Benefits:**

- ✅ Works without the package installed
- ✅ No build errors when package missing
- ✅ Conservative defaults (fails safe)
- ✅ Runtime detection and graceful degradation

---

## Integration Strategies

### Strategy 1: GitHub Packages (Recommended for Production)

**Use Case:** Automated CI/CD, team collaboration, production deployments

**Setup:**

1. **Publish to GitHub Packages:**

```bash
cd ../dcyfr-ai-agents
npm login --registry=https://npm.pkg.github.com --scope=@dcyfr
npm publish
```

2. **Configure `.npmrc` in dcyfr-labs:**

```properties
@dcyfr:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
```

3. **Update `package.json`:**

```json
{
  "dependencies": {
    "@dcyfr/agents": "^1.0.0"
  }
}
```

4. **Set Environment Variable:**

```bash
# Local development (.env.local)
GITHUB_PACKAGES_TOKEN=ghp_your_token_here

# CI/CD (GitHub Actions secrets)
GITHUB_PACKAGES_TOKEN=${{ secrets.GITHUB_PACKAGES_TOKEN }}

# Vercel (Environment Variables)
GITHUB_PACKAGES_TOKEN=ghp_production_token
```

**Security:**

- ✅ Token-based authentication (no password in git)
- ✅ Scoped to organization (@dcyfr)
- ✅ Works in CI/CD with secrets
- ✅ Version-controlled releases

**Limitations:**

- Requires GitHub token with `read:packages` scope
- Token management needed for team members

---

### Strategy 2: Local Development Only (Current Setup)

**Use Case:** Solo development, testing, local-only features

**Setup:**

1. **Keep package.json as-is:**

```json
{
  "dependencies": {
    "@dcyfr/agents": "file:../dcyfr-ai-agents"
  }
}
```

2. **Add to `.gitignore`:**

```ignore
# Already ignored
/node_modules/@dcyfr/agents
```

3. **Installation:**

```bash
# Local development only
cd /path/to/dcyfr-labs
npm install
```

**Security:**

- ✅ Never committed to git
- ✅ Simple local setup
- ✅ No token management

**Limitations:**

- ❌ Doesn't work in CI/CD
- ❌ Requires manual setup for team members
- ❌ Production builds fail without package

---

### Strategy 3: Conditional Installation (Hybrid)

**Use Case:** Optional features, development-only tooling

**Setup:**

1. **Make package optional in `package.json`:**

```json
{
  "optionalDependencies": {
    "@dcyfr/agents": "file:../dcyfr-ai-agents"
  }
}
```

2. **Install only when needed:**

```bash
# Development environment
npm install --include=optional

# Production/CI (skip proprietary package)
npm install --omit=optional
```

3. **Runtime detection:**

```typescript
// Already implemented in ai-compat.ts
const hasProprietaryAgents = await checkPackageAvailable();
```

**Security:**

- ✅ Explicit opt-in
- ✅ Production builds succeed without package
- ✅ Feature detection at runtime

**Limitations:**

- Team members must know to use `--include=optional`

---

### Strategy 4: Git Submodule (Not Recommended)

**Why Not:**

- ❌ Exposes private repo structure
- ❌ Complex merge conflicts
- ❌ Hard to version separately

---

## Recommended Implementation

### Phase 1: Current State (Local Development)

- Keep `file:../dcyfr-ai-agents` for local development
- Compatibility layer handles missing package
- No changes needed

### Phase 2: Team Collaboration (Optional)

- Publish to GitHub Packages
- Update `.npmrc` with scoped registry
- Add token to `.env.local` (gitignored)
- Document setup in README

### Phase 3: Production (When Ready)

- Use GitHub Packages in Vercel
- Add `GITHUB_PACKAGES_TOKEN` to environment variables
- Configure build to skip if token not present

---

## Security Checklist

### What Should NEVER Be Committed

- [ ] ❌ `.env.local` with tokens
- [ ] ❌ `node_modules/@dcyfr/agents` directory
- [ ] ❌ Personal access tokens in `.npmrc`
- [ ] ❌ Private package source code

### What Should Be Committed

- [ ] ✅ `package.json` with scoped registry reference
- [ ] ✅ `.npmrc` with registry URL (no tokens)
- [ ] ✅ Documentation (this file)
- [ ] ✅ Compatibility layer (`ai-compat.ts`)

### GitHub Secrets Required

For CI/CD to work:

```yaml
# .github/workflows/*.yml
env:
  GITHUB_PACKAGES_TOKEN: ${{ secrets.GITHUB_PACKAGES_TOKEN }}
```

**Token Scopes:**

- `read:packages` - Read from GitHub Packages
- `repo` - Access private repositories (if needed)

---

## Testing the Integration

### Test 1: Package Available

```bash
cd dcyfr-labs
npm install
npm run build
# Should use proprietary agents
```

### Test 2: Package Unavailable

```bash
cd dcyfr-labs
rm -rf node_modules/@dcyfr/agents
npm run build
# Should fall back to conservative defaults
```

### Test 3: Production Build

```bash
# Simulate production (no package)
npm ci --omit=optional
npm run build
# Should succeed with warnings
```

---

## Troubleshooting

### "Cannot find module '@dcyfr/agents'"

**Cause:** Package not installed or registry not configured

**Solutions:**

1. **Local development:**

   ```bash
   npm install
   ```

2. **Missing sibling directory:**

   ```bash
   cd /Users/drew/DCYFR/code
   git clone git@github.com:dcyfr/dcyfr-ai-agents.git
   cd dcyfr-labs
   npm install
   ```

3. **Production (expected):**
   - Build should succeed with fallback behavior
   - Check console for warning messages

### "401 Unauthorized" from GitHub Packages

**Cause:** Missing or invalid `GITHUB_PACKAGES_TOKEN`

**Solutions:**

1. **Generate token:**
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Create token with `read:packages` scope
   - Add to `.env.local`:
     ```bash
     GITHUB_PACKAGES_TOKEN=ghp_xxxxxxxxxxxxx
     ```

2. **Verify `.npmrc`:**
   ```properties
   @dcyfr:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
   ```

---

## Monitoring & Maintenance

### Monthly Checklist

- [ ] Verify GitHub token hasn't expired
- [ ] Check for package updates
- [ ] Test fallback behavior in CI
- [ ] Review access logs in GitHub Packages

### Version Updates

```bash
# Update to latest version
npm update @dcyfr/agents

# Or specific version
npm install @dcyfr/agents@1.2.0
```

---

## References

- [GitHub Packages Documentation](https://docs.github.com/en/packages)
- [NPM Private Packages](https://docs.npmjs.com/about-private-packages)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Next Steps:**

1. ✅ Keep current local setup working
2. Decide if team collaboration needed → GitHub Packages
3. Configure production builds based on requirements

**Status:** Current architecture is production-ready with graceful degradation.
