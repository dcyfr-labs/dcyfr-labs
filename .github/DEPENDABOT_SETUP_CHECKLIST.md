# Dependabot GitHub Settings Checklist

**Complete these steps to activate Dependabot monitoring:**

## Step 1: Enable Dependabot Features

Visit your repository security settings:
```
https://github.com/dcyfr/dcyfr-labs/settings/security_analysis
```

Enable these features (click the "Enable" button for each):

- [ ] **Dependency graph** (should already be enabled)
- [ ] **Dependabot alerts** 
- [ ] **Dependabot security updates**

## Step 2: Configure Notifications

Visit your personal notification settings:
```
https://github.com/settings/notifications
```

Under **"Dependabot alerts"** section:

- [ ] Enable email notifications
- [ ] Enable web notifications  
- [ ] Choose notification level: **"Watching and participating"** (recommended)

## Step 3: Set Alert Preferences (Optional)

Back in repository settings → Code security and analysis → Dependabot alerts:

- [ ] Configure severity threshold: **"Critical" and "High"** (recommended)

## Step 4: Verify Setup

After enabling, Dependabot will:

1. **Immediately**: Scan for security vulnerabilities (within minutes)
2. **Within 24 hours**: Open first batch of update PRs (if updates available)
3. **Weekly**: Check for new updates every Monday at 9 AM PST

Check that it's working:
```bash
# View any Dependabot PRs
gh pr list --label "dependencies"

# Or visit in browser
open "https://github.com/dcyfr/dcyfr-labs/pulls?q=is%3Apr+label%3Adependencies"
```

## What's Already Configured

✅ **Configuration files created:**
- `.github/dependabot.yml` - Update schedule and grouping rules
- `.github/workflows/dependabot-auto-merge.yml` - Optional auto-merge for patch updates
- `docs/operations/dependabot-setup.md` - Complete documentation

✅ **Smart defaults:**
- Weekly updates every Monday at 9 AM PST
- Intelligent package grouping (Next.js, TypeScript, UI packages, etc.)
- Up to 10 concurrent PRs
- Proper labeling and commit message format

## Expected Results

**Within 24 hours:**
- Security alerts for any existing vulnerabilities
- Update PRs for out-of-date dependencies (if any)

**Ongoing:**
- Weekly PR batches every Monday
- Immediate security alerts when new vulnerabilities are discovered
- Auto-merge for safe patch updates (if workflow enabled)

## Questions?

See the complete guide: `/docs/operations/dependabot-setup.md`
