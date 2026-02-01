# Private Package Setup Guide

## Quick Start (5 Minutes)

### Option 1: Local Development (Recommended for Solo Work)

**Current setup - already working!**

1. Verify sibling directory exists:
   ```bash
   ls -la /Users/drew/DCYFR/code/dcyfr-ai-agents
   ```

2. Install dependencies:
   ```bash
   cd /Users/drew/DCYFR/code/dcyfr-labs
   npm install
   ```

3. Build to verify:
   ```bash
   npm run build
   ```

**Status:** ✅ This already works! The `file:../dcyfr-ai-agents` reference in package.json handles it.

---

### Option 2: GitHub Packages (For Team Collaboration)

**Use when:** Multiple developers, CI/CD, production deployments

#### Step 1: Publish Package (One-time Setup)

```bash
cd /Users/drew/DCYFR/code/dcyfr-ai-agents

# Login to GitHub Packages
npm login --registry=https://npm.pkg.github.com --scope=@dcyfr

# Publish
npm publish
```

#### Step 2: Configure dcyfr-labs

1. Copy `.npmrc` template:
   ```bash
   cd /Users/drew/DCYFR/code/dcyfr-labs
   cp .npmrc.example .npmrc
   ```

2. Create GitHub Personal Access Token:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Scopes needed: `read:packages`, `write:packages` (if publishing)
   - Copy the token (starts with `ghp_`)

3. Add token to `.env.local`:
   ```bash
   echo "GITHUB_PACKAGES_TOKEN=ghp_your_token_here" >> .env.local
   ```

4. Update `package.json`:
   ```json
   {
     "dependencies": {
       "@dcyfr/agents": "^1.0.0"
     }
   }
   ```

5. Install:
   ```bash
   npm install
   ```

#### Step 3: Configure CI/CD

**GitHub Actions:**

```yaml
# .github/workflows/build.yml
- name: Install dependencies
  env:
    GITHUB_PACKAGES_TOKEN: ${{ secrets.GITHUB_PACKAGES_TOKEN }}
  run: npm ci
```

**Vercel:**

1. Go to: https://vercel.com/dcyfr/dcyfr-labs/settings/environment-variables
2. Add:
   - Name: `GITHUB_PACKAGES_TOKEN`
   - Value: `ghp_your_production_token`
   - Environments: Production, Preview, Development

---

### Option 3: Optional Dependency (Hybrid Approach)

**Use when:** Package is truly optional, want builds to succeed without it

1. Update `package.json`:
   ```json
   {
     "optionalDependencies": {
       "@dcyfr/agents": "file:../dcyfr-ai-agents"
     }
   }
   ```

2. Install with optional packages:
   ```bash
   npm install --include=optional
   ```

3. Production builds (skip optional):
   ```bash
   npm ci --omit=optional
   ```

---

## Verification

### Test 1: Local Development

```bash
# Should work with package
cd /Users/drew/DCYFR/code/dcyfr-labs
npm install
npm run build
# ✅ Build succeeds, uses proprietary agents
```

### Test 2: Missing Package (Fallback)

```bash
# Should work without package
cd /Users/drew/DCYFR/code/dcyfr-labs
rm -rf node_modules/@dcyfr
npm run build
# ✅ Build succeeds, uses conservative defaults
# ⚠️  Warning: "@dcyfr/agents not available"
```

### Test 3: GitHub Packages

```bash
# Verify token works
npm whoami --registry=https://npm.pkg.github.com
# Should show your GitHub username

# Test installation
npm install @dcyfr/agents
# ✅ Should download from GitHub Packages
```

---

## Security Checklist

### ✅ What's Protected

- [x] `.env.local` in `.gitignore` (tokens never committed)
- [x] `node_modules/` in `.gitignore` (package never committed)
- [x] `.npmrc.example` committed (template only, no tokens)
- [x] Compatibility layer handles missing package gracefully

### ⚠️ Never Commit

- [ ] `.env.local` with `GITHUB_PACKAGES_TOKEN`
- [ ] `.npmrc` with actual tokens
- [ ] `node_modules/@dcyfr/agents/` directory
- [ ] Personal access tokens anywhere in code

### ✅ Safe to Commit

- [x] `package.json` with scoped package reference
- [x] `.npmrc.example` (template)
- [x] `src/lib/ai-compat.ts` (compatibility layer)
- [x] Documentation

---

## Troubleshooting

### "Cannot find module '@dcyfr/agents'"

**During Development:**
```bash
# Verify sibling directory exists
ls -la ../dcyfr-ai-agents

# If missing, clone it:
cd /Users/drew/DCYFR/code
git clone git@github.com:dcyfr/dcyfr-ai-agents.git

# Reinstall
cd dcyfr-labs
npm install
```

**During Build (Expected):**
- Build should succeed with warning
- Compatibility layer provides safe defaults

### "401 Unauthorized" from GitHub Packages

```bash
# Check if token is set
echo $GITHUB_PACKAGES_TOKEN
# Should output: ghp_xxxxx

# If not set:
source .env.local
# OR
export GITHUB_PACKAGES_TOKEN=ghp_xxxxx

# Verify login
npm whoami --registry=https://npm.pkg.github.com
```

### Build Fails with Type Errors

```bash
# Verify the fix is applied
grep "as any" src/lib/ai-compat.ts
# Should show: import('@dcyfr/agents/enforcement/approval-gates' as any)

# If not, the fix needs to be reapplied
```

---

## Recommended Workflow

### For Solo Development (Current Setup)

1. Keep using `file:../dcyfr-ai-agents`
2. No additional configuration needed
3. ✅ Already working!

### For Team Collaboration

1. Publish to GitHub Packages once
2. Team members use GitHub tokens
3. Update CI/CD with secrets
4. Version controlled releases

### For Production

1. Add token to Vercel environment variables
2. Build succeeds with or without package
3. Monitor logs for fallback usage

---

## Next Steps

**Immediate (No changes needed):**
- ✅ Current setup is secure and working
- ✅ Build succeeds with graceful degradation
- ✅ Proprietary code never committed

**Future (When team collaboration needed):**
1. Publish `@dcyfr/agents` to GitHub Packages
2. Configure team members with tokens
3. Update CI/CD workflows
4. Document version update process

---

**Status:** Production-ready with current local setup. GitHub Packages integration ready when needed.
