# Documentation Organization & Consolidation Guide

**Date:** December 15, 2025  
**Purpose:** Document the restructuring of public vs. private documentation and provide clear index for finding information

---

## 🎯 Consolidation Overview

We have consolidated documentation into two clear categories:

| Category | Location | Visibility | Purpose |
|---|---|---|---|
| **Public** | `/docs/` | Public (in git) | Guides, patterns, architecture for all audiences |
| **Private** | Subdirectory `private/` folders (e.g., `/docs/security/private/`) | Internal only | Sensitive findings, operational data, internal decisions |

**Note:** We use subdirectory-specific `private/` folders instead of a centralized `docs/private/*` structure to prevent duplicate content and keep related materials together.

This prevents accidentally exposing:

- Security vulnerability details
- Performance metrics and benchmarks
- Operational status reports
- Working backlogs and sprint data
- Audit findings and compliance gaps
- Team decisions and personal information

---

## 📁 Complete Documentation Index

### Public Documentation (`/docs`) - Shared with Community

#### Core Architecture
- **`docs/architecture/`** - System design decisions
  - `ADR-*.md` - Architecture Decision Records
  - `*.md` - Technology choices and rationale

#### Component Development
- **`docs/components/`** - Component patterns and examples
  - Usage guides and props
  - Accessibility standards
  - Testing patterns

#### API & Platform
- **`docs/api/`** - API documentation
  - Endpoint reference
  - Request/response examples
  - Error handling guide
  - Rate limiting policies

#### Automation & CI/CD
- **`docs/automation/`** - Build and deployment processes
  - Build optimization strategies (Phases 1-3 only)
  - Testing procedures
  - Deployment processes (public overview)
  - Cache strategy architecture (Phase 2)
  - Performance tuning approaches
  - Dependency management strategy (Phase 4)

#### Testing & Quality
- **`docs/testing/`** - Testing guidance
  - Testing strategies and patterns
  - Test examples and templates
  - Coverage targets
  - E2E testing guide

#### AI & Code Generation
- **`docs/ai/`** - AI assistant guidance (Copilot, Claude)
  - Component patterns
  - Code style standards
  - Quick reference guides
  - Decision trees

#### Templates & Snippets
- **`docs/templates/`** - Copy-paste starting points
  - Component templates
  - Page templates
  - API route templates
  - Test suite templates

#### Accessibility
- **`docs/accessibility/`** - A11y standards
  - Accessibility checklist
  - Pronunciation guides
  - WCAG compliance notes

#### Development
- **`docs/development/`** - Developer setup
  - Local development guide
  - Environment setup
  - Debugging tips
  - Development workflow

#### Blog & Content
- **`docs/blog/`** - Blog post guidelines
  - Post structure
  - Frontmatter requirements
  - SEO checklist
  - Publishing workflow

#### Operations (Non-Sensitive)
- **`docs/operations/`** - General operational guidance
  - Release procedures
  - Version management
  - Documentation workflow (this document)

#### Project Info
- **`docs/README.md`** - Documentation index
- **`docs/INDEX.md`** - Quick reference
- **`docs/quick-start.md`** - Getting started

---

### Private Documentation (Subdirectory `private/` folders) - Internal Only

Each documentation category maintains its own `private/` subdirectory for sensitive content:

#### Security Findings & Audits

- **`docs/security/private/`** - Sensitive security information
  - **`FINDINGS_AND_ACTION_ITEMS.md`** - October 2025 security analysis
  - **`CODEQL_FINDINGS_RESOLVED.md`** - CodeQL vulnerability analysis
  - **`SECURITY_AUDIT_SUMMARY.md`** - Full security assessment reports
  - **`VULNERABILITY_PATTERNS.md`** - Detailed vulnerability analysis
  - **`INCIDENT_REPORTS.md`** - Security incidents with details
  - **`COMPLIANCE_AUDIT.md`** - GDPR/CCPA assessment results

#### Operational Status & Metrics

- **`docs/operations/private/`** - Internal operational intelligence
  - **`OPERATIONAL_STATUS.md`** - Current deployment status
  - **`PERFORMANCE_METRICS.md`** - Detailed performance dashboards and benchmarks
  - **`WORKING_BACKLOG.md`** - Sprint backlog and task tracking
  - **`CI_CD_METRICS.md`** - Detailed build/test metrics
  - **`TEAM_DECISIONS.md`** - Internal decision log
  - **`BUDGET_NOTES.md`** - Financial and resource allocation

#### Design & UX Analysis

- **`docs/design/private/`** - Internal design decisions and analysis
  - **`UI_UX_ANALYSIS.md`** - Detailed UX analysis
  - **`DESIGN_METRICS.md`** - Design system metrics
  - **`THEME_AUDIT.md`** - Theme engine audit results

#### Development & Performance

- **`docs/development/private/`** - Internal technical details
  - **`INFRASTRUCTURE_DETAILS.md`** - Detailed infrastructure setup
  - **`DEPLOYMENT_PROCEDURES.md`** - Emergency deployment steps
  - **`PERFORMANCE_ANALYSIS.md`** - Detailed performance tuning notes

---

## 🔄 Migration Status

### Already Moved ✅

- Security findings → `docs/security/private/`
- CI/CD performance reports → `docs/operations/private/PERFORMANCE_METRICS.md`
- Phase completion summaries with detailed metrics → `docs/operations/private/`
- Design analysis → `docs/design/private/`

### Migration Pattern

When moving from centralized to subdirectory structure:

1. Identify document category (security, operations, design, etc.)
2. Move to appropriate `docs/[category]/private/` folder
3. Update any references in other docs
4. Remove from old centralized location

### Public Summaries (Keep in `/docs`)

- `docs/automation/CI_CD_OPTIMIZATION_CAMPAIGN_REPORT.md` - Campaign overview (metrics redacted)
- `docs/automation/CACHE_OPTIMIZATION.md` - Strategy overview
- `docs/automation/PHASE4_DEPENDENCY_MANAGEMENT.md` - Process guidance
- Phase completion summaries with redacted metrics (if needed as guidance)

---

## 🛡️ Guardrails in Place

### 1. Pre-Commit Hook (`.githooks/pre-commit`)

Automatically prevents:

- ❌ Sensitive files in public docs (`*FINDINGS.md`, `*AUDIT.md`, etc.)
- ❌ Hardcoded credentials and secrets
- ❌ Large binary files
- ⚠️ Operational docs in wrong location

### 2. .gitignore Configuration

```gitignore
# Exclude private documentation from version control
docs/*/private/
```

**Note:** Files in `docs/[category]/private/` folders are still in the repo (for team access) but excluded from public git history.

### 3. File Naming Conventions

**Public docs:**

```text
COMPONENT_PATTERNS.md
API_REFERENCE.md
SECURITY_BEST_PRACTICES.md
TESTING_GUIDE.md
```

**Private docs (trigger warnings):**

```text
*_FINDINGS.md
*_AUDIT.md
*_REPORT.md
*_ANALYSIS.md
*_METRICS.md
*_STATUS.md
```

### 4. Header Requirements

Every doc must include audience statement:

**Public docs:**

```markdown
# Document Title

**Audience:** Public / Contributors / Users
**Last Updated:** YYYY-MM-DD
```

**Private docs:**

```markdown
# Document Title

🔒 **PRIVATE DOCUMENTATION** 🔒
**Audience:** Internal Team Only
**Last Updated:** YYYY-MM-DD
```

---

## 📋 Verification Checklist

Before committing documentation:

- [ ] Document is in correct location (`/docs/[category]` or `/docs/[category]/private/`)
- [ ] No credentials or secrets (use env vars)
- [ ] No sensitive findings if in public docs
- [ ] No operational metrics if in public docs
- [ ] File has appropriate header
- [ ] File naming follows conventions
- [ ] Pre-commit hook passes (automatic)
- [ ] References updated if moved
- [ ] Links work (internal paths correct)

---

## 🚀 Setup Instructions

### For Your Machine

```bash
# Configure git to use the new hooks directory
git config core.hooksPath .githooks

# Verify it works
cd /path/to/dcyfr-labs
ls -la .githooks/
# Should see: pre-commit (executable)

# Test the hook
git diff --cached docs/  # Stage a doc change
git commit -m "test"     # Should run pre-commit checks
```

### For Team

```bash
# Add to onboarding/setup docs
1. Clone repo: git clone https://github.com/dcyfr/dcyfr-labs.git
2. Configure hooks: git config core.hooksPath .githooks
3. Install dependencies: npm install
4. Verify hooks work: npm run validate:docs
```

### For CI/CD

Add to `.github/workflows/` if needed for automated checks:

```yaml
- name: Validate docs structure
  run: |
    .githooks/pre-commit
```

---

## 📊 Documentation Metrics

### Public Documentation

- **Total files:** ~45 docs
- **Total size:** ~2.5 MB
- **Categories:** 10+ main areas
- **Status:** Community-visible, maintained

### Private Documentation

- **Total files:** Distributed across category subdirectories
- **Location:** Each category has its own `private/` folder
- **Categories:** Security, operations, design, development, and more
- **Status:** Team-only, confidential

---

## 🔄 Quarterly Maintenance

Every 3 months, review:

1. **Misplaced Content** - Check for sensitive docs outside `private/` folders
2. **Stale Documentation** - Archive outdated private docs
3. **Coverage Gaps** - Identify missing public guidance
4. **Link Rot** - Verify all internal references work
5. **Governance Compliance** - Ensure pre-commit hooks work
6. **Archive Old Reports** - Move superseded status/metrics to archive
7. **Structure Consistency** - Verify all categories have proper `private/` folder if needed

---

## 📞 FAQ

**Q: Can team members access private documentation?**
A: Yes, files in `docs/[category]/private/` folders are in the repo but excluded from public git visibility. Team members can see them locally.

**Q: What if I need to share private findings?**
A: Create a public version with details removed in the parent `docs/[category]/` folder, and reference it.

**Q: Should all status reports be private?**
A: Yes. General processes can be public, but metrics, timelines, and operational status go in `docs/operations/private/`.

**Q: How do I handle a discovered security issue?**
A: Put full analysis in `docs/security/private/`. Create public version with only the fix, not the vulnerability.

**Q: Why subdirectory `private/` folders instead of centralized `docs/private/`?**
A: Prevents duplicate content, keeps related materials together, and reduces navigation complexity.

**Q: Can I override the pre-commit hook?**
A: Yes: `git commit --no-verify`. But don't. Follow the standards instead.

---

## 📚 Related Documentation

- [DOCS_GOVERNANCE.md](./DOCS_GOVERNANCE.md) - Full governance policy
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contributor guidelines (updated)
- [docs/README.md](./README.md) - Public docs index
- [.gitignore](../../.gitignore) - Git exclusions

---

**Status:** Active  
**Last Updated:** December 15, 2025  
**Maintained By:** Tech Lead  
**Next Review:** March 15, 2026
