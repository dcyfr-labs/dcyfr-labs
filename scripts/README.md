# Scripts Directory

This directory contains utility scripts for development, testing, and maintenance tasks.

> **Note:** On November 14, 2025, obsolete ad-hoc test scripts were archived to `archive/legacy-tests/` and replaced with modern testing infrastructure (Vitest, Playwright, Lighthouse CI). See [npm-scripts-cleanup-2025-11-14.md](/docs/operations/npm-scripts-cleanup-2025-11-14.md) for details.

## Quick Reference

| Script                                 | Purpose                                 | Usage                                                    | Frequency |
| -------------------------------------- | --------------------------------------- | -------------------------------------------------------- | --------- |
| `check-security-alert.mjs`             | Check GitHub security alerts status     | `node scripts/check-security-alert.mjs <alert-number>`   | 🔥 High   |
| `run-with-dev.mjs`                     | Run tasks with Next.js dev server       | `node scripts/run-with-dev.mjs <script-path>`            | 🔥 High   |
| `generate-blog-hero.mjs`               | Generate SVG hero images for blog posts | `node scripts/generate-blog-hero.mjs --slug <post-slug>` | 🟡 Medium |
| `generate-project-hero.mjs`            | Generate SVG hero images for projects   | `node scripts/generate-project-hero.mjs --all`           | 🟡 Medium |
| `prune-vercel-preview-deployments.mjs` | Delete old Vercel preview deployments   | `node scripts/prune-vercel-preview-deployments.mjs`      | 🟡 Medium |
| `test-accessibility.mjs`               | Automated accessibility testing         | `node scripts/test-accessibility.mjs`                    | 🟡 Medium |
| `test-accessibility-manual.mjs`        | Manual accessibility checklist          | `node scripts/test-accessibility-manual.mjs`             | 🔵 Low    |
| `test-skip-link.mjs`                   | Test skip-to-content implementation     | `node scripts/test-skip-link.mjs`                        | 🔵 Low    |
| `test-skip-link-structure.mjs`         | Validate skip link structure            | `node scripts/test-skip-link-structure.mjs`              | 🔵 Low    |
| `check-headers.mjs`                    | Validate HTTP security headers          | `node scripts/check-headers.mjs`                         | 🔵 Low    |

---

## Active Scripts

### Core Utilities

#### check-security-alert.mjs

Checks the status of GitHub security code scanning alerts using the GitHub API.

```bash
# Check by alert number (defaults to dcyfr/dcyfr-labs)
node scripts/check-security-alert.mjs 2

# Check by full URL
node scripts/check-security-alert.mjs https://github.com/dcyfr/dcyfr-labs/security/code-scanning/2
```

**Features:**

- Accepts alert number or full GitHub security URL
- Shows alert state (open/fixed/dismissed)
- Displays rule ID, severity, and location
- Returns appropriate exit codes for CI/CD

**Exit Codes:**

- `0` - Alert is fixed, dismissed, or not found (resolved)
- `1` - Alert is still open or error occurred

#### run-with-dev.mjs

Helper script for running tasks with Next.js dev server. Used by accessibility test scripts.

```bash
node scripts/run-with-dev.mjs <script-path>
```

#### check-headers.mjs

Validates HTTP security headers (standalone utility, no npm script).

```bash
node scripts/check-headers.mjs
```

### Content Generation

#### generate-blog-hero.mjs

Generates gradient SVG hero images for blog posts with deterministic color schemes.

```bash
# Generate for specific post
node scripts/generate-blog-hero.mjs --slug my-post-slug

# Generate for all posts missing images
node scripts/generate-blog-hero.mjs --all

# Preview without saving
node scripts/generate-blog-hero.mjs --slug my-post --preview

# Force regeneration with specific gradient
node scripts/generate-blog-hero.mjs --slug my-post --variant ocean --force
```

**Features:**

- 22 gradient variants across 5 themes (brand, warm, cool, neutral, vibrant)
- Tag-based thematic gradient selection (security → red, performance → blue, etc.)
- Deterministic gradient selection (same slug = same gradient)
- 1200×630px OG image compliant

#### generate-project-hero.mjs

Generates theme-aware SVG hero images for project cards with unique color schemes and pattern overlays.

```bash
# Generate all project images
node scripts/generate-project-hero.mjs --all

# Generate single project
node scripts/generate-project-hero.mjs --project code

# Preview without saving
node scripts/generate-project-hero.mjs --project tech --preview

# Force regeneration
node scripts/generate-project-hero.mjs --all --force

# Via npm script
npm run generate:project-hero
```

**Features:**

- 6 unique color schemes with no repeating colors:
  - `code.svg` → Red gradient with dot pattern
  - `tech.svg` → Blue gradient with circuit pattern
  - `design.svg` → Green gradient with grid pattern
  - `startup.svg` → Violet gradient with wave pattern
  - `nonprofit.svg` → Indigo gradient with hexagon pattern
  - `general.svg` → Orange gradient with line pattern
- CSS custom properties for automatic light/dark mode adaptation
- Pattern overlays for depth (dots, grid, lines, circuits, hexagons, waves)
- 1200×630px OG image compliant
- File sizes ~1.5-2KB per SVG

**Color-to-Project Mapping:**
| Project | Color | Pattern | Use Case |
|---------|-------|---------|----------|
| code | Red (#ef4444) | Dots | Code/development projects |
| tech | Blue (#3b82f6) | Circuits | Technology/infrastructure |
| design | Green (#10b981) | Grid | Design/creative work |
| startup | Violet (#8b5cf6) | Waves | Startup/entrepreneurial |
| nonprofit | Indigo (#6366f1) | Hexagons | Nonprofit/community |
| general | Orange (#f97316) | Lines | General/miscellaneous |

**Dark Mode Support:**
Images automatically adapt to theme via CSS media queries and `data-theme` attribute. Pattern visibility is preserved in both light and dark modes through optimized gradient overlays.

### Accessibility Testing

#### test-accessibility.mjs

Automated accessibility testing suite for HTML structure validation.

```bash
node scripts/test-accessibility.mjs
```

#### test-accessibility-manual.mjs

Manual accessibility testing checklist for keyboard and screen reader verification.

```bash
node scripts/test-accessibility-manual.mjs
```

#### test-skip-link.mjs

Tests skip-to-content link implementation across pages.

```bash
node scripts/test-skip-link.mjs
```

#### test-skip-link-structure.mjs

Validates skip link HTML structure and focus behavior.

```bash
node scripts/test-skip-link-structure.mjs
```

### Vercel Operations

#### prune-vercel-preview-deployments.mjs

Prunes old preview deployments from Vercel using the Vercel API.

```bash
# Default retention: 90 days
node scripts/prune-vercel-preview-deployments.mjs

# Dry run
DRY_RUN=true node scripts/prune-vercel-preview-deployments.mjs

# Custom retention
RETENTION_DAYS=120 node scripts/prune-vercel-preview-deployments.mjs

# Via npm scripts
npm run vercel:prune:preview
npm run vercel:prune:preview:dry-run
```

Required environment variables:

- `VERCEL_TOKEN`
- `VERCEL_PROJECT_ID`

Optional:

- `VERCEL_TEAM_ID` (for team-scoped projects)
- `RETENTION_DAYS` (defaults to `90`)
- `DRY_RUN` (`true`/`false`, defaults to `false`)

## Archived Scripts

### Legacy Test Scripts (archived November 14, 2025)

One-off development test scripts moved to `scripts/archive/legacy-tests/`. These have been superseded by proper testing infrastructure:

- **Vitest** (`npm run test`) for unit and integration tests
- **Playwright** (`npm run test:e2e`) for E2E tests (runs production build by default).
  Use `npm run test:e2e:dev` to run E2E against the local dev server.
- **Lighthouse CI** (`npm run lighthouse:ci`) for performance and accessibility validation

See `scripts/archive/legacy-tests/README.md` for complete list and migration guidance.

### Historical Scripts

One-time debug and migration scripts are in `scripts/archive/`. See `scripts/archive/README.md` for details.

---

## Troubleshooting

### Issue: Script Permission Denied

**Symptoms:** `Permission denied` error when running script

**Solutions:**

```bash
# Option 1: Run with node explicitly
node scripts/check-security-alert.mjs

# Option 2: Make script executable
chmod +x scripts/check-security-alert.mjs
./scripts/check-security-alert.mjs
```

**Prevention:** Always run scripts with `node` command instead of direct execution.

### Issue: Module Not Found Errors

**Symptoms:** `Cannot find module` or `ERR_MODULE_NOT_FOUND` errors

**Common Causes & Solutions:**

1. **Dependencies not installed**

   ```bash
   # Install all dependencies
   npm install

   # Verify node_modules exists
   ls node_modules/
   ```

2. **Wrong working directory**

   ```bash
   # Scripts must run from project root
   cd /path/to/dcyfr-labs
   node scripts/check-security-alert.mjs
   ```

3. **Missing local module**

   ```bash
   # Check if script exists
   ls scripts/check-security-alert.mjs

   # Verify path is correct
   pwd  # Should show dcyfr-labs directory
   ```

### Issue: GitHub API Authentication Errors

**Symptoms:** `401 Unauthorized` or `403 Forbidden` when running `check-security-alert.mjs`

**Solutions:**

1. **Set GITHUB_TOKEN environment variable**

   ```bash
   # Create GitHub personal access token (Settings → Developer settings → Personal access tokens)
   export GITHUB_TOKEN=ghp_your_token_here

   # Run script
   node scripts/check-security-alert.mjs 2
   ```

2. **Add token to .env file**
   ```bash
   # Create/edit .env file
   echo "GITHUB_TOKEN=ghp_your_token_here" >> .env
   ```

**Required token scopes:**

- `repo` (for private repos) or `public_repo` (for public repos)
- `security_events` (for code scanning alerts)

### Issue: Dev Server Timeout

**Symptoms:** `run-with-dev.mjs` script hangs or times out

**Solutions:**

1. **Check if dev server is already running**

   ```bash
   # Kill existing dev server
   lsof -i :3000 | grep node | awk '{print $2}' | xargs kill -9

   # Try running script again
   node scripts/run-with-dev.mjs scripts/test-accessibility.mjs
   ```

2. **Increase timeout (if needed)**
   - Edit `run-with-dev.mjs` and increase timeout value
   - Default timeout is typically 30-60 seconds

3. **Check for port conflicts**

   ```bash
   # See what's using port 3000
   lsof -i :3000

   # Use different port if needed
   PORT=3001 node scripts/run-with-dev.mjs scripts/test-accessibility.mjs
   ```

### Issue: Environment Variable Not Set

**Symptoms:** Script fails with "Environment variable X is not defined" or similar

**Solutions:**

1. **Create .env file** (if missing)

   ```bash
   # Copy example (if exists)
   cp .env.example .env

   # Or create from scratch
   cat > .env << EOF
   GITHUB_TOKEN=your_token_here
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   EOF
   ```

2. **Load .env in script**
   - Most scripts automatically load `.env` via `dotenv` package
   - Verify `dotenv` is installed: `npm list dotenv`

3. **Set variable temporarily**
   ```bash
   # For one-time use
   GITHUB_TOKEN=ghp_xxx node scripts/check-security-alert.mjs 2
   ```

### Issue: Generated Images Not Appearing

**Symptoms:** `generate-blog-hero.mjs` or `generate-project-hero.mjs` runs successfully but images don't show

**Solutions:**

1. **Check output path**

   ```bash
   # Blog heroes saved to:
   ls src/content/blog/<slug>/hero.svg

   # Project heroes saved to:
   ls public/projects/<project-name>.svg
   ```

2. **Verify SVG syntax**

   ```bash
   # Open SVG in browser to test
   # Should render without errors
   ```

3. **Check file permissions**

   ```bash
   # Ensure files are readable
   chmod 644 src/content/blog/*/hero.svg
   chmod 644 public/projects/*.svg
   ```

4. **Force regeneration**
   ```bash
   # Use --force flag to overwrite existing
   node scripts/generate-blog-hero.mjs --slug my-post --force
   ```

---

## Adding New Scripts

When adding new scripts:

1. Use `.mjs` extension for ES modules
2. Add shebang line: `#!/usr/bin/env node`
3. Include descriptive comment header
4. Update this README with script description and usage
5. Add entry to Quick Reference table (top of README)
6. Consider adding an npm script alias in `package.json` if frequently used

### Baseline Browser Mapping

The `baseline-browser-mapping` script in this repo generates a JSON data file using the `baseline-browser-mapping` package. This data can be used in Lighthouse or other analysis tooling to ensure accurate baseline browser mappings.

Run it to update the JSON file at `src/data/baseline-browser-mapping.json`:

```bash
npm run update:baseline
```

This repository includes a scheduled GitHub Action (`.github/workflows/update-baseline-mapping.yml`) to refresh the data weekly. The script can also be run locally if you want to regenerate the file manually.

## CI integration

This repository now runs the `update:baseline` script before Lighthouse CI in both local and CI environments. The script is invoked automatically via NPM pre-scripts and as part of the Lighthouse CI workflow.

Local commands:

```bash
npm run update:baseline         # generate baseline mapping locally
npm run lighthouse:ci           # triggers update:baseline, build, and lhci autorun
```

In CI (GitHub Actions):

- The Lighthouse CI workflow (`.github/workflows/lighthouse-ci.yml`) now runs `npm run update:baseline` before building.
- Running `npm run lhci:autorun` or `npm run lhci:collect` will also run `update:baseline` automatically because of NPM `pre` scripts.
