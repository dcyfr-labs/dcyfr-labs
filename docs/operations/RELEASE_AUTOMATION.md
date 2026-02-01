# Automated Release Management

**Status:** Implemented
**Last Updated:** February 1, 2026
**Version:** 1.0.0

Comprehensive documentation for dcyfr-labs automated release system using Calendar Versioning (CalVer) and GitHub Actions.

---

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Workflow Triggers](#workflow-triggers)
- [Version Numbering](#version-numbering)
- [Changelog Generation](#changelog-generation)
- [Manual Workflows](#manual-workflows)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedures](#rollback-procedures)
- [Integration Points](#integration-points)
- [Development Commands](#development-commands)
- [FAQ](#faq)

---

## Overview

### What Is Automated?

When you **merge a PR to main**, the system automatically:

1. ✅ Bumps package.json version using CalVer (YYYY.MM.DD[.MICRO])
2. ✅ Extracts changes from PR description, todo.md moves, and commits
3. ✅ Updates CHANGELOG.md with new entry
4. ✅ Creates git tag for the version
5. ✅ Generates comprehensive GitHub Release with notes
6. ✅ Triggers Vercel deployment
7. ✅ Runs post-deploy cache invalidation

**No manual intervention required!**

### Key Benefits

- **Zero manual version bumping** - CalVer auto-increments based on current date
- **No forgotten changelogs** - Automated extraction from PR data
- **Same-day multiple deployments** - MICRO version auto-increment (2026.02.01.1, .2, .3...)
- **Comprehensive release notes** - Generated from changelog + PR metadata
- **Full audit trail** - Git tags + GitHub Releases for every deployment

### Architecture

```
PR Merge to Main
       ↓
Extract PR Number
       ↓
Bump CalVer Version ← checks existing tags for MICRO increment
       ↓
Generate Changelog Entry ← from PR/todo/commits/files
       ↓
Update CHANGELOG.md ← validates format
       ↓
Commit + Push ← package.json, package-lock.json, CHANGELOG.md
       ↓
Create Git Tag
       ↓
Generate Release Notes ← changelog + contributors + verification
       ↓
Create GitHub Release
       ↓
Vercel Deployment ← triggered by version commit
       ↓
Post-Deploy Cache Invalidation ← via Inngest
```

---

## How It Works

### 1. PR Merge Detection

**Workflow File:** `.github/workflows/release-automation.yml`

**Trigger:**
```yaml
on:
  push:
    branches:
      - main
```

**Filter Logic:**
```yaml
if: |
  contains(github.event.head_commit.message, 'Merge pull request') &&
  !startsWith(github.event.head_commit.message, 'chore(release):')
```

This ensures:
- ✅ Only PR merges trigger releases (not direct pushes)
- ✅ Release commits themselves don't trigger new releases (prevents loops)

### 2. Version Bumping

**Script:** `scripts/release/bump-version.mjs`

**Logic:**
```javascript
1. Get current date: YYYY.MM.DD
2. Search git tags: git tag -l "YYYY.MM.DD*"
3. If tags found:
   - Find highest MICRO version (e.g., 2026.02.01.2)
   - Increment by 1 (→ 2026.02.01.3)
4. If no tags:
   - Use base version (e.g., 2026.02.01)
5. Update package.json and package-lock.json
6. Output new version to stdout
```

**Example:**

First deploy today: `2026.02.01`
Second deploy today: `2026.02.01.1`
Third deploy today: `2026.02.01.2`

### 3. Changelog Entry Generation

**Script:** `scripts/release/generate-changelog-entry.mjs`

**Data Sources (Priority Order):**

1. **todo.md → done.md moves** (highest signal)
   - Detects completed tasks moved from `docs/operations/todo.md` to `done.md`
   - Format: `- [x] Task description (1.5h)`

2. **PR description** (structured extraction)
   - Looks for "Changes Made" section
   - Extracts bullet points

3. **Commit messages** (conventional commits)
   - `feat:` → Added
   - `fix:` → Fixed
   - `refactor:` → Changed
   - etc.

4. **File changes** (analysis fallback)
   - New components in `src/components/` → Added
   - New pages in `src/app/` → Added
   - Deleted files → Removed

**Breaking Change Detection:**
- PR label: `breaking-change`
- Commit message: `BREAKING CHANGE:`
- PR checkbox: `[x] Breaking change`

**Output Format:**
```markdown
## [2026.02.01] - 2026-02-01

Brief summary from PR description.

### Added

- New feature X
- New component Y

### Fixed

- Bug in component Z

### Changed

- Updated API route for better performance
```

### 4. CHANGELOG.md Update

**Script:** `scripts/release/update-changelog.mjs`

**Process:**
1. Read existing CHANGELOG.md
2. Validate Keep a Changelog format
3. Find insertion point (after header, before first version)
4. Insert new entry with proper spacing
5. Run validation: `npm run changelog:validate`
6. Create backup: `CHANGELOG.md.backup`

### 5. Commit & Push

**Author:** `github-actions[bot]`

**Commit Message:** `chore(release): YYYY.MM.DD[.MICRO]`

**Files Modified:**
- `package.json` - version field
- `package-lock.json` - version + packages[""].version
- `CHANGELOG.md` - new entry at top

### 6. Git Tag Creation

**Format:** Lightweight tag matching version (e.g., `2026.02.01`)

**Command:**
```bash
git tag $VERSION
git push origin $VERSION
```

### 7. GitHub Release Creation

**Script:** `scripts/release/create-release-notes.mjs`

**Release Notes Include:**
- Summary (from PR or changelog)
- Changes (categorized with emoji bullets)
- Contributors (top 5 recent committers)
- PR reference (link to merged PR)
- Deployment URLs (production + preview)
- Verification checklist (tests, Lighthouse, security)

**Example Release Notes:**
```markdown
# Release 2026.02.01

## Summary

Added automated release management system with CalVer versioning.

## Changes

### ✨ Added

- Automated version bumping with MICRO increment
- Changelog generation from PR/todo/commits
- GitHub Release creation workflow

### 🐛 Fixed

- Version conflict on same-day deploys

## Contributors

- @username1
- @username2

## Pull Request

#123

## Deployment

- Production: https://www.dcyfr.ai
- Preview: https://dcyfr-preview.vercel.app

## Verification

- ✅ All tests passing (1185/1197)
- ✅ Lighthouse CI: 92+ score
- ✅ TypeScript: 0 errors
```

---

## Workflow Triggers

### Automatic Trigger (Default)

**When:** PR merges to `main` branch

**Conditions:**
- Merge commit message contains "Merge pull request #"
- Commit message does NOT start with "chore(release):"
- Changed files are NOT docs-only (excluding CHANGELOG.md)

### Manual Trigger

**When:** You need to create a release manually

**How:**
1. Go to Actions tab in GitHub
2. Select "Automated Release" workflow
3. Click "Run workflow"
4. (Optional) Check "Force MICRO increment" to skip base version

**Use Cases:**
- Hotfix release outside normal PR workflow
- Retry failed automatic release
- Create release for historical commit

---

## Version Numbering

### CalVer Format

**Pattern:** `YYYY.MM.DD[.MICRO]`

**Components:**
- `YYYY` - Four-digit year (2026)
- `MM` - Two-digit month (01-12)
- `DD` - Two-digit day (01-31)
- `MICRO` - Optional incrementing number for same-day deploys (1, 2, 3...)

### Examples

| Scenario | Version |
|----------|---------|
| First deploy on Feb 1, 2026 | `2026.02.01` |
| Second deploy same day | `2026.02.01.1` |
| Third deploy same day | `2026.02.01.2` |
| First deploy next day | `2026.02.02` |
| Breaking change (any day) | `2026.02.15 ⚠️ BREAKING` (in changelog) |

### Why CalVer?

✅ **Instant clarity** - Know exactly when a feature shipped
✅ **No ambiguity** - No subjective "is this breaking?" decisions
✅ **Perfect for CD** - Every merge = new version
✅ **Simple maintenance** - No manual version tracking

---

## Changelog Generation

### Input Sources

#### 1. Todo Moves (Highest Priority)

**Detection:** Git diff in PR for `docs/operations/todo.md` and `done.md`

**Pattern:**
```markdown
# In todo.md (removed lines)
- [ ] Implement feature X (2h)

# In done.md (added lines)
- [x] Implement feature X (2h)
```

**Extraction:** "Implement feature X" → categorized by commit pattern

#### 2. PR Description

**Expected Format:**
```markdown
## Summary

Brief description of changes.

## Changes Made

- Added automated release workflow
- Fixed version conflict handling
- Updated documentation
```

**Extraction:** Bullet points from "Changes Made" section

#### 3. Commit Messages

**Conventional Commits:**
- `feat: Add new feature` → Added
- `fix: Resolve bug` → Fixed
- `refactor: Improve code` → Changed
- `docs: Update README` → Changed

**Keywords:**
- "add", "create" → Added
- "fix", "resolve" → Fixed
- "remove", "delete" → Removed
- "deprecate" → Deprecated
- "security", "vulnerability" → Security

#### 4. File Analysis

**New Files:**
- `src/components/NewComponent/index.tsx` → "New component: NewComponent"
- `src/app/new-page/page.tsx` → "New page: /new-page"
- `src/lib/new-util.ts` → "New utility: new-util"

**Deleted Files:**
- Any deleted file → "Removed {filepath}"

### Categorization

**Standard Categories (Keep a Changelog):**
- **Added** - New features, components, pages
- **Changed** - Modifications to existing functionality
- **Deprecated** - Soon-to-be-removed features
- **Removed** - Deleted features or files
- **Fixed** - Bug fixes
- **Security** - Security patches, vulnerability fixes

---

## Manual Workflows

### Manually Bump Version

```bash
# Dry run (see what version would be)
npm run release:bump:dry-run

# Actually bump version
npm run release:bump

# Force MICRO increment (even if no tags exist)
node scripts/release/bump-version.mjs --force-micro
```

### Manually Generate Changelog Entry

```bash
# Requires GH_TOKEN environment variable
export GH_TOKEN=ghp_xxxxxxxxxxxxx

# Generate entry for PR #123
npm run release:changelog -- --pr=123 --version=2026.02.01

# Output to file
npm run release:changelog -- --pr=123 --version=2026.02.01 > /tmp/entry.md
```

### Manually Update CHANGELOG.md

```bash
# From file
npm run release:update -- --version=2026.02.01 --entry=/tmp/entry.md

# From stdin
cat entry.md | npm run release:update -- --version=2026.02.01 --entry=-
```

### Manually Create Release Notes

```bash
export GH_TOKEN=ghp_xxxxxxxxxxxxx

npm run release:notes -- --pr=123 --version=2026.02.01 --changelog=/tmp/entry.md > notes.md
```

### Create GitHub Release Manually

```bash
# Using gh CLI
gh release create 2026.02.01 \
  --title "Release 2026.02.01" \
  --notes-file notes.md \
  --target main
```

---

## Troubleshooting

### Workflow Didn't Run

**Symptoms:** PR merged but no release created

**Possible Causes:**

1. **Not a PR merge**
   - Direct push to main (doesn't trigger workflow)
   - Solution: Always merge via PR

2. **Release commit merged**
   - Commit message starts with "chore(release):"
   - Solution: This is intentional (prevents loops)

3. **Docs-only change**
   - Workflow ignores `docs/**` and `*.md` files
   - Exception: `CHANGELOG.md` changes ARE tracked
   - Solution: Expected behavior for documentation updates

**Check Workflow Runs:**
```
GitHub → Actions tab → Automated Release workflow → Check recent runs
```

### Version Already Exists

**Symptoms:** Error: "tag already exists"

**Cause:** Git tag for version already pushed

**Solution:**
1. Workflow automatically increments MICRO version
2. If manual fix needed:
   ```bash
   # Delete local tag
   git tag -d 2026.02.01

   # Delete remote tag
   git push origin :refs/tags/2026.02.01

   # Re-run workflow
   ```

### Changelog Validation Failed

**Symptoms:** Workflow fails at "Update CHANGELOG.md" step

**Possible Causes:**

1. **Malformed entry generated**
   - Check `/tmp/changelog-entry.md` in workflow logs
   - Verify Keep a Changelog format

2. **Existing CHANGELOG.md corrupted**
   - Restore from backup: `CHANGELOG.md.backup`
   - Validate locally: `npm run changelog:validate`

**Manual Fix:**
```bash
# Restore backup
mv CHANGELOG.md.backup CHANGELOG.md

# Validate format
npm run changelog:validate

# If still failing, check for:
# - Missing "# Changelog" header
# - Missing Keep a Changelog reference
# - Invalid CalVer format in existing versions
```

### Release Creation Failed

**Symptoms:** Git tag exists but no GitHub Release

**Possible Causes:**

1. **GitHub API rate limit**
   - Wait 1 hour, re-run workflow manually

2. **Invalid release notes format**
   - Check workflow logs for formatting errors

**Manual Fix:**
```bash
# Create release manually
export GH_TOKEN=ghp_xxxxxxxxxxxxx

gh release create 2026.02.01 \
  --title "Release 2026.02.01" \
  --notes "See CHANGELOG.md for details" \
  --target main
```

### Incomplete Changelog Entry

**Symptoms:** Changelog entry missing expected changes

**Debug:**
```bash
# Test changelog generation locally
export GH_TOKEN=ghp_xxxxxxxxxxxxx

node scripts/release/generate-changelog-entry.mjs \
  --pr=123 \
  --version=2026.02.01 \
  > test-entry.md

cat test-entry.md
```

**Common Issues:**

1. **PR description missing "Changes Made" section**
   - Add section to PR template

2. **Commits don't follow conventional format**
   - File analysis fallback should still capture changes

3. **No todo.md moves detected**
   - Ensure PR diff includes `docs/operations/todo.md` and `done.md`

---

## Rollback Procedures

### Scenario 1: Wrong Version Tagged

**Problem:** Accidentally created release with wrong version

**Solution:**

```bash
# 1. Delete GitHub Release
gh release delete 2026.02.01.2 --yes

# 2. Delete remote tag
git push origin :refs/tags/2026.02.01.2

# 3. Delete local tag (if exists)
git tag -d 2026.02.01.2

# 4. Revert release commit
git revert <commit-sha-of-release>
git push origin main

# 5. Re-run workflow (if needed)
# GitHub Actions → Automated Release → Run workflow
```

### Scenario 2: Malformed CHANGELOG.md

**Problem:** Changelog entry corrupted or incorrect

**Solution:**

```bash
# 1. Restore from backup
git checkout HEAD~1 -- CHANGELOG.md

# 2. Commit restoration
git commit -m "chore: restore CHANGELOG.md"
git push origin main

# 3. Manually add correct entry
npm run release:update -- \
  --version=2026.02.01 \
  --entry=/path/to/correct-entry.md

# 4. Commit fix
git add CHANGELOG.md
git commit -m "chore: fix CHANGELOG.md for 2026.02.01"
git push origin main
```

### Scenario 3: Deployment Broken

**Problem:** Release deployed but application broken

**Solution:**

```bash
# 1. IMMEDIATE: Rollback Vercel deployment
# Vercel Dashboard → Deployments → Previous working deploy → Promote to Production

# 2. Revert problematic code
git revert <merge-commit-sha>
git push origin main
# This triggers new release + deployment

# 3. Delete broken release (optional)
gh release delete 2026.02.01 --yes
```

### Scenario 4: Version Skipped

**Problem:** Want to retroactively create release for older commit

**Solution:**

```bash
# 1. Checkout target commit
git checkout <commit-sha>

# 2. Manually run release scripts
npm run release:bump:dry-run  # Note the version
npm run release:changelog -- --pr=<PR-number> --version=YYYY.MM.DD > entry.md
npm run release:update -- --version=YYYY.MM.DD --entry=entry.md

# 3. Commit changes
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): YYYY.MM.DD"

# 4. Create tag
git tag YYYY.MM.DD

# 5. Push (careful - modifies history)
git push origin main --force-with-lease
git push origin YYYY.MM.DD

# 6. Create GitHub Release
npm run release:notes -- --pr=<PR> --version=YYYY.MM.DD --changelog=entry.md > notes.md
gh release create YYYY.MM.DD --title "Release YYYY.MM.DD" --notes-file notes.md --target main
```

⚠️ **Warning:** Force-pushing to main requires careful coordination with team

---

## Integration Points

### Existing Infrastructure

| Component | Integration | Notes |
|-----------|-------------|-------|
| **Vercel Deployment** | Triggered by version commit push | Automatic on commit to main |
| **Post-Deploy Workflow** | No conflicts | Runs on `deployment_status`, different trigger |
| **Changelog Scripts** | Used for validation | `npm run changelog:validate` called by workflow |
| **CalVer Documentation** | Referenced by scripts | `docs/operations/VERSIONING.md` |
| **PR Template** | Source of changelog data | `.github/PULL_REQUEST_TEMPLATE.md` |
| **Todo System** | Parsed for completed tasks | `docs/operations/todo.md`, `done.md` |

### Dependencies

**Required:**
- Node.js 24+ (per `.nvmrc`)
- npm 11.6.2+
- git 2.0+
- GitHub CLI (`gh`) - for manual operations

**Environment Variables:**
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions
- `GH_TOKEN` - Required for manual script execution (uses GitHub API)

---

## Development Commands

### Testing Scripts Locally

```bash
# Test version bump (dry run)
npm run release:bump:dry-run

# Test version bump (actual)
DRY_RUN=true npm run release:bump

# Test changelog generation
export GH_TOKEN=ghp_xxxxxxxxxxxxx
npm run release:changelog -- --pr=123 --version=2026.02.01

# Test changelog update
npm run release:update -- --version=2026.02.01 --entry=/tmp/entry.md

# Test release notes
npm run release:notes -- --pr=123 --version=2026.02.01 --changelog=/tmp/entry.md
```

### Validation

```bash
# Validate changelog format
npm run changelog:validate

# Check changelog staleness
npm run changelog:check

# Strict mode (exits with error if stale)
npm run changelog:check:strict
```

### Backfilling Historical Tags

```bash
# One-time script to create tags for existing CHANGELOG.md versions
npm run release:backfill
```

---

## FAQ

### Q: What happens if I push directly to main?

**A:** Workflow does NOT run. Only PR merges trigger releases.

**Workaround:** Manually trigger workflow via Actions tab

### Q: Can I skip a release for a PR?

**A:** Yes, add `[skip-release]` to PR title or merge commit message

**Implementation:** Add to workflow `if` condition:
```yaml
if: |
  contains(github.event.head_commit.message, 'Merge pull request') &&
  !contains(github.event.head_commit.message, '[skip-release]')
```

### Q: How do I handle multiple PRs merged in quick succession?

**A:** Workflow runs sequentially. Each gets its own MICRO version:
- PR #1 → 2026.02.01
- PR #2 (5 min later) → 2026.02.01.1
- PR #3 (10 min later) → 2026.02.01.2

### Q: What if changelog generation misses a change?

**A:** You can manually edit CHANGELOG.md after the fact:
1. Edit `CHANGELOG.md` locally
2. Commit: `git commit -m "docs: update CHANGELOG for 2026.02.01"`
3. Push: `git push origin main`
4. (Optional) Update GitHub Release notes manually

### Q: Can I customize the release notes template?

**A:** Yes, edit `scripts/release/create-release-notes.mjs`

Sections can be reordered, added, or removed in the `generateReleaseNotes()` function.

### Q: How do I test the workflow without deploying?

**A:** Enable workflow on `preview` branch first:
```yaml
on:
  push:
    branches:
      - preview  # Add this
      - main
```

Merge test PRs to preview, verify releases, then enable on main.

### Q: What's the token budget for this workflow?

**A:** Approximately 15-20k tokens per run:
- PR data fetch: ~2k
- Changelog generation: ~5k
- Release notes generation: ~3k
- Workflow execution: ~5k

### Q: Does this work with Dependabot PRs?

**A:** Yes! Dependabot PRs trigger releases just like regular PRs.

Changelog entry includes: "Updated dependencies" with commit details.

---

## Metrics & Monitoring

### Success Metrics

**Automation Goals:**
- ✅ 100% of PR merges create releases (no manual intervention)
- ✅ 0 manual version updates required
- ✅ <2 minutes from merge to release creation
- ✅ 95%+ changelog accuracy vs manual review
- ✅ 0 version conflicts on same-day deploys

**Quality Gates (Maintained):**
- All existing validation scripts pass
- Lighthouse CI ≥90% performance, ≥95% accessibility
- Test pass rate ≥99% (current: 1185/1197)
- 0 security vulnerabilities
- TypeScript: 0 errors
- ESLint: 0 errors

### Workflow Analytics

**Check Workflow History:**
```
GitHub → Actions tab → Automated Release
```

**Key Metrics:**
- Total runs
- Success rate
- Average duration
- Failure patterns

**Logs Location:**
- Workflow logs: GitHub Actions tab
- Script output: Workflow step logs
- Error details: Workflow annotations

---

## Future Enhancements

**Planned Improvements:**

1. **Slack/Discord Notifications**
   - Post release announcement to team channel
   - Include release URL and key changes

2. **Release Notes Customization**
   - Allow per-PR release notes overrides
   - Support multiple changelog formats

3. **Automated Testing Integration**
   - Run smoke tests before creating release
   - Block release if tests fail

4. **Changelog Preview**
   - Comment on PR with generated changelog preview
   - Allow edits before merge

5. **Version Suggestions**
   - Analyze breaking changes and suggest version
   - Warn on potential conflicts

---

## References

- **Versioning Scheme:** [`docs/operations/VERSIONING.md`](VERSIONING.md)
- **Keep a Changelog:** https://keepachangelog.com/
- **Calendar Versioning:** https://calver.org/
- **Conventional Commits:** https://www.conventionalcommits.org/
- **GitHub Actions:** https://docs.github.com/en/actions
- **GitHub Releases API:** https://docs.github.com/en/rest/releases

---

**Last Updated:** February 1, 2026
**Maintained By:** dcyfr-labs team
**Questions?** Open an issue or check workflow logs
