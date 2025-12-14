# Migration Plan: Rebrand to DCYFR Labs

**Created:** November 26, 2025
**Status:** 🟡 Planning Phase
**Priority:** 🔴 HIGH

---

## Executive Summary

Comprehensive rebranding from "dcyfr-labs" to "dcyfr-labs" and "Drew's Lab" to "DCYFR Labs". This migration maintains current domain infrastructure (www.dcyfr.ai) while preparing for future migration to dcyfrlabs.com.

### Scope

**Immediate Changes (This Migration):**
- Repository name: `dcyfr-labs` → `dcyfr-labs`
- Site title: "Drew's Lab" → "DCYFR Labs"
- Package name: `dcyfr-labs` → `dcyfr-labs`
- All documentation references
- Code references and configuration

**Future Changes (Deferred):**
- Domain migration: `www.dcyfr.ai` → `dcyfrlabs.com`
- DNS and redirect configuration
- SEO considerations for domain change

---

## Impact Assessment

### Files Affected: ~69 files

**Repository Configuration:**
- package.json, package-lock.json
- README.md, SECURITY.md, CODE_OF_CONDUCT.md, SUPPORT.md
- .github/ templates and workflows

**Source Code:**
- src/lib/site-config.ts (site metadata)
- src/app/page.tsx (homepage branding)
- src/components/logo.tsx, src/components/common/logo.tsx
- src/data/projects.ts (project descriptions)
- src/inngest/client.ts (Inngest app name)

**Tests:**
- src/__tests__/lib/metadata.test.ts
- src/__tests__/lib/feeds.test.ts
- e2e/homepage.spec.ts

**Documentation: ~50 files**
- All docs/ references
- GitHub issue/PR templates
- Workflow files

**Configuration:**
- next.config.ts
- Scripts (check-security-alert.mjs)

### Breaking Changes

**GitHub:**
- Repository URL changes from `github.com/dcyfr/dcyfr-labs` to `github.com/dcyfr/dcyfr-labs`
- Existing clones will need remote URL updates
- Open PRs and issues remain intact (GitHub handles redirects)
- GitHub Actions workflows continue to work

**External References:**
- Package managers (npm) - local only, not published
- Documentation links in external sites
- Bookmarks and saved URLs

---

## Migration Strategy

### Phase 1: Pre-Migration Preparation ✅

**Checklist:**
- [x] Create migration plan document
- [ ] Backup current state
  ```bash
  git tag pre-dcyfr-rebrand-$(date +%Y%m%d)
  git push origin --tags
  ```
- [ ] Document all breaking changes
- [ ] Create rollback plan
- [ ] Notify stakeholders (if applicable)

### Phase 2: Code Changes 🔄

**Order of Operations:**

1. **Update Package Configuration**
   - package.json (name field)
   - package-lock.json (regenerate)

2. **Update Site Metadata**
   - src/lib/site-config.ts (SITE_NAME, SITE_TITLE)
   - src/app/layout.tsx (verify metadata)

3. **Update Components**
   - src/components/logo.tsx
   - src/components/common/logo.tsx
   - src/app/page.tsx (homepage title)

4. **Update Data**
   - src/data/projects.ts (project descriptions)
   - src/inngest/client.ts (app name)

5. **Update Tests**
   - src/__tests__/lib/metadata.test.ts
   - src/__tests__/lib/feeds.test.ts
   - e2e/homepage.spec.ts

6. **Update Configuration**
   - next.config.ts
   - scripts/*.mjs

### Phase 3: Documentation Updates 🔄

**Root Documentation:**
- README.md (all references)
- SECURITY.md (repository URLs)
- CODE_OF_CONDUCT.md (repository URLs)
- SUPPORT.md (repository URLs)
- CHANGELOG.md (repository URLs)
- CONTRIBUTING.md (repository URLs)

**GitHub Templates:**
- .github/PULL_REQUEST_TEMPLATE.md
- .github/ISSUE_TEMPLATE/*.md
- .github/ISSUE_TEMPLATE/config.yml
- .github/copilot-instructions.md
- .github/CODEOWNERS
- .github/workflows/*.yml

**Documentation Directory:**
- docs/ (50+ files with references)
- Focus on:
  - Repository URLs
  - Project name references
  - Site name references

### Phase 4: Repository Rename 🔄

**GitHub Repository Rename:**

1. **Backup First**
   ```bash
   git tag pre-rename-backup
   git push origin --tags
   ```

2. **Rename on GitHub**
   - Go to Settings → General → Repository name
   - Change from `dcyfr-labs` to `dcyfr-labs`
   - Confirm rename

3. **Update Local Repository**
   ```bash
   git remote set-url origin git@github.com:dcyfr/dcyfr-labs.git
   git remote -v  # Verify
   ```

4. **Verify GitHub Redirects**
   - Old URLs redirect automatically
   - Test: https://github.com/dcyfr/dcyfr-labs → redirects
   - Clone links update automatically

### Phase 4.5: Verify Vercel Integration 🔄

**Vercel Configuration Check:**

1. **Understanding Vercel Behavior**
   - ✅ Vercel uses repository ID, not name
   - ✅ GitHub webhooks auto-update
   - ✅ No changes needed to .vercel/project.json
   - ✅ No changes needed to vercel.json

2. **Post-Rename Verification**
   ```bash
   # Push test commit to trigger deployment
   git commit --allow-empty -m "test: verify Vercel webhook after rename"
   git push origin main
   ```

3. **Check Vercel Dashboard**
   - Log in to https://vercel.com
   - Navigate to project
   - Verify "Git Repository" shows: `dcyfr/dcyfr-labs`
   - Check recent deployment succeeds

4. **If Webhook Fails (Rare)**
   - Go to Vercel project Settings → Git
   - Disconnect and reconnect Git repository
   - Select `dcyfr/dcyfr-labs`
   - Trigger new deployment

**Vercel Files (No Changes Required):**
- `.vercel/project.json` - Uses IDs only
- `vercel.json` - No repository references

### Phase 5: Verification & Testing 🔄

**Testing Checklist:**

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes (all tests)
- [ ] `npm run build` succeeds
- [ ] Homepage displays "DCYFR Labs"
- [ ] Logo renders correctly
- [ ] Metadata correct in browser
- [ ] RSS feeds have correct titles
- [ ] Social sharing cards correct
- [ ] All internal links work
- [ ] Repository links work
- [ ] GitHub workflows trigger correctly

**Manual Testing:**

- [ ] Visit homepage (verify branding)
- [ ] Check about page
- [ ] Check blog posts (feeds, metadata)
- [ ] Check projects page
- [ ] Verify no "Drew's Lab" visible
- [ ] Verify no "dcyfr-labs" in visible UI
- [ ] Test GitHub links in docs
- [ ] Check CI/CD pipeline

### Phase 6: Deployment 🔄

**Deployment Steps:**

1. **Commit All Changes**
   ```bash
   git add .
   git commit -m "chore: rebrand to DCYFR Labs

   - Rename repository from dcyfr-labs to dcyfr-labs
   - Update site name from Drew's Lab to DCYFR Labs
   - Update all documentation and configuration
   - Maintain current domain (www.dcyfr.ai)

   BREAKING CHANGE: Repository URL changed
   "
   ```

2. **Push to GitHub**
   ```bash
   git push origin main
   ```

3. **Verify Vercel Deployment**
   - Check deployment succeeds
   - Verify production site shows new branding
   - Test all key pages

4. **Update Git Remotes (Team)**
   - Document for other developers
   - Provide remote update commands

### Phase 7: Post-Migration 🔄

**Cleanup:**

- [ ] Update package-lock.json
- [ ] Verify all GitHub Actions pass
- [ ] Update project in external tracking tools
- [ ] Update local development environments
- [ ] Document completed migration in done.md

**Monitoring:**

- [ ] Watch for broken links (7 days)
- [ ] Monitor search traffic (SEO impact)
- [ ] Check for 404s in analytics
- [ ] Verify social media cards

---

## Rollback Plan

### If Migration Fails

**Option 1: Revert Repository Name (GitHub)**
1. Rename repository back to `dcyfr-labs` in GitHub settings
2. Update local remote: `git remote set-url origin git@github.com:dcyfr/dcyfr-labs.git`
3. Revert code changes: `git revert <commit-hash>`

**Option 2: Restore from Backup**
1. Checkout pre-migration tag: `git checkout pre-dcyfr-rebrand-<date>`
2. Force push if needed: `git push origin main --force` (use with caution)
3. Rename repository back on GitHub

**Option 3: Selective Revert**
1. Revert specific files: `git checkout HEAD~1 -- <file-path>`
2. Keep some changes, revert others
3. Commit selective reverts

---

## Risk Assessment

### Low Risk ✅
- Local development (easy to fix)
- Documentation changes (non-breaking)
- Test updates (verified by test suite)
- Package name (not published to npm)

### Medium Risk ⚠️
- Repository name change (GitHub handles redirects)
- Git remote URLs (documented migration path)
- CI/CD workflows (tested before merge)
- External bookmarks (GitHub redirects)

### High Risk ❌
**None identified** - Domain stays the same, GitHub provides automatic redirects

---

## Communication Plan

### Before Migration
- [ ] Create migration announcement (if public repo)
- [ ] Document in CHANGELOG.md
- [ ] Update README with migration notice
- [ ] Notify team members (if applicable)

### During Migration
- [ ] Status updates in commits
- [ ] Tag releases appropriately
- [ ] Monitor deployment pipeline

### After Migration
- [ ] Announcement: "Rebranded to DCYFR Labs"
- [ ] Update external references
- [ ] Blog post (optional)
- [ ] Social media update (optional)

---

## Future Considerations

### Domain Migration (Future Phase)

**When ready to migrate from www.dcyfr.ai to dcyfrlabs.com:**

1. **DNS Setup**
   - Configure dcyfrlabs.com in Vercel
   - Set up 301 redirects from www.dcyfr.ai
   - Update Google Search Console
   - Update sitemap URLs

2. **SEO Considerations**
   - Implement 301 permanent redirects
   - Update canonical URLs
   - Submit new sitemap
   - Monitor search rankings
   - Preserve backlinks

3. **Code Updates**
   - Update SITE_URL in site-config.ts
   - Update environment variables
   - Update RSS feed URLs
   - Update social meta tags

4. **External Services**
   - Update Inngest app URL
   - Update Redis connection strings (if needed)
   - Update Resend domain
   - Update analytics tracking
   - Update social media profiles

**Estimated effort:** 4-6 hours
**Risk:** Medium (SEO impact requires careful planning)
**Timeline:** TBD

---

## Success Criteria

Migration is considered successful when:

- [ ] All tests pass (≥99% pass rate maintained)
- [ ] Production site displays "DCYFR Labs" branding
- [ ] No visible "Drew's Lab" or "dcyfr-labs" in UI
- [ ] Repository renamed to `dcyfr-labs` on GitHub
- [ ] All GitHub Actions workflows pass
- [ ] No broken internal links
- [ ] RSS feeds work with new branding
- [ ] Documentation accurate and complete
- [ ] Zero production errors related to rebrand
- [ ] Team can clone and develop normally

---

## Timeline

**Estimated Duration:** 2-3 hours

| Phase | Duration | Status |
|-------|----------|--------|
| Pre-Migration Prep | 15 min | 🟡 In Progress |
| Code Changes | 45 min | ⚪ Pending |
| Documentation Updates | 30 min | ⚪ Pending |
| Repository Rename | 10 min | ⚪ Pending |
| Verification & Testing | 30 min | ⚪ Pending |
| Deployment | 15 min | ⚪ Pending |
| Post-Migration | 15 min | ⚪ Pending |

---

## Appendix

### File Change Summary

**Critical Files (Must Change):**
- package.json
- src/lib/site-config.ts
- src/components/logo.tsx
- src/app/page.tsx
- README.md
- SECURITY.md

**High Priority (Should Change):**
- All .github/ files
- All docs/ files with repository URLs
- Test files with branding checks
- CI/CD workflows

**Low Priority (Nice to Change):**
- Historical documentation references
- Archive files
- Comments in code

### Search Patterns

**Find all references:**
```bash
# Repository name
grep -r "dcyfr-labs" --exclude-dir=node_modules --exclude-dir=.next

# Site name
grep -r "Drew's Lab" --exclude-dir=node_modules --exclude-dir=.next

# Future: Domain references (keep for now)
grep -r "www.dcyfr.ai" --exclude-dir=node_modules --exclude-dir=.next
```

---

**Next Steps:** Begin Phase 2 (Code Changes) after approval.
