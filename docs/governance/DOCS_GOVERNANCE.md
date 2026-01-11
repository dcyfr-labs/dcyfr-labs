# Documentation Governance Policy

**Version:** 1.0.0  
**Date:** December 15, 2025  
**Purpose:** Establish clear standards for organizing public vs. private documentation and prevent accidental exposure of sensitive content

---

## 📋 Overview

This project maintains two categories of documentation:

- **`/docs`** - Public documentation (visible in git, published to community)
- **Subdirectory `private/` folders** - Internal documentation (e.g., `/docs/security/private/`, `/docs/operations/private/`) - excluded from git, not public

Clear boundaries prevent sensitive findings, operational metrics, and internal deliberations from being accidentally exposed publicly.

**Note:** We use subdirectory-specific `private/` folders instead of a centralized `docs/private/*` structure to prevent duplicate content and keep related materials together.

---

## 🎯 Core Principle

**"Shift Left, Assume Private"** - When in doubt, put it in the appropriate subdirectory `private/` folder (e.g., `docs/security/private/`). Move to public only after vetting and cleanup.

---

## 📁 Public Documentation (`/docs`)

### Purpose
Guidance, architecture decisions, and resources intended for external audience (community, contributors, users).

### What Belongs Here ✅

**Architecture & Patterns:**
- System design decisions (ADRs)
- Component patterns and best practices
- API design specifications
- Data flow diagrams (anonymized)
- Technology stack rationale

**User-Facing Guides:**
- Setup and installation instructions
- Feature documentation
- API reference
- Troubleshooting guides
- FAQ sections

**Contributing Standards:**
- Code style guide
- Contributing workflow
- Testing standards
- Performance requirements
- Security best practices (general)

**Project Information:**
- README and quick start
- Roadmap and future plans
- Changelog and releases
- Team and contact information

**Decision Documentation:**
- Architecture Decision Records (ADRs)
- Feature requests and specs
- Design proposals
- Migration guides

### What Does NOT Belong Here ❌

- Security analysis findings and CVE details
- Operational metrics and performance dashboards
- Internal status reports and sprint data
- Employee/team information and decisions
- Financial data and budgets
- Infrastructure credentials or secrets
- Incident reports with sensitive details
- Audit findings and compliance gaps
- Third-party security assessment reports
- Personal notes and working documents

---

## 📁 Private Documentation (Subdirectory `private/` folders)

### Purpose
Internal operational intelligence, sensitive findings, and working documents not intended for public visibility.

### Structure

Each documentation category has its own `private/` subdirectory for sensitive content:

```
docs/
├── security/
│   ├── public docs...
│   └── private/              # Security findings, audit reports, vulnerability details
│       ├── CODEQL_FINDINGS_RESOLVED.md
│       ├── SECURITY_AUDIT_SUMMARY.md
│       ├── VULNERABILITY_PATTERNS.md
│       └── INCIDENT_REPORTS.md
│
├── operations/
│   ├── public docs...
│   └── private/              # Operational status, metrics, working backlogs
│       ├── OPERATIONAL_STATUS.md
│       ├── PERFORMANCE_METRICS.md
│       ├── WORKING_BACKLOG.md
│       ├── TEAM_DECISIONS.md
│       └── BUDGET_NOTES.md
│
├── design/
│   ├── public docs...
│   └── private/              # Internal design decisions and analysis
│       ├── UI_UX_ANALYSIS.md
│       ├── DESIGN_METRICS.md
│       └── THEME_AUDIT.md
│
└── [other categories]/
    ├── public docs...
    └── private/              # Category-specific sensitive content
        └── ...
```

**Benefits of subdirectory approach:**

- Keeps related content together (public and private versions side-by-side)
- Prevents duplicate content across different private folders
- Makes it easier to find related materials
- Reduces navigation complexity

### What Belongs Here ✅

**Security & Vulnerabilities:**
- Detailed vulnerability findings
- Root cause analysis of security issues
- CodeQL results and remediation
- Penetration test reports
- Security assessment results
- Incident reports with details
- Zero-day information (until patched)

**Operational Intelligence:**
- Deployment checklists
- On-call procedures and playbooks
- Operational metrics and dashboards
- Performance analysis and tuning notes
- System capacity planning
- Infrastructure diagrams (detailed)
- Working backlogs and sprint notes

**Team & Decision Making:**
- Team decisions and reasoning
- Meeting notes with sensitive discussions
- Personnel and staffing decisions
- Budget and financial data
- Vendor evaluations
- Third-party assessment reports

**Compliance & Audit:**
- Full audit reports
- Compliance gap analysis
- Remediation tracking (sensitive items)
- Employee training records
- Access control changes

---

## 🚫 What Never Goes in Git

Regardless of public/private, **NEVER commit:**
- API keys, tokens, or credentials
- Database passwords or connection strings
- Private SSH keys
- Personal identifying information (PII)
- Unencrypted sensitive data
- Third-party proprietary information

**Use:** Environment variables, `.env.local`, or secrets management for all credentials.

---

## 🔄 Migration Rules

### From Public to Private ✅ (Safe)
If public doc contains sensitive data found during review:

1. Create `/docs/[category]/private/` copy with full details
2. Update public `/docs/[category]/` doc to general guidance only
3. Update public doc with pointer: "For sensitive findings, see private docs"
4. Remove sensitive details from public version
5. Commit: both versions appropriately placed

**Example:**

```markdown
# Public: docs/security/CSP_CONFIGURATION.md
CSP provides protection against injection attacks.
See Security Assessment for audit details.
```

```markdown
# Private: docs/security/private/CSP_FINDINGS.md
Detailed findings from October 2025 assessment:
- Specific violations discovered
- Root cause analysis
- Remediation timeline
```

### From Private to Public ✅ (With Care)
If private doc should be public (patterns, learnings):

1. Create sanitized public version in `/docs/`
2. Remove/generalize sensitive references
3. Cite the decision without exposing details
4. Keep private version for internal reference
5. Commit: new public doc added

---

## � Website Content (`src/content/`)

### Purpose
Public-facing content published on the live website (blog posts, portfolio items, project showcases).

**Key Difference:** `/docs` = internal project documentation; `src/content/` = user-facing website content

### Directory Structure

```
src/content/
├── blog/                           # Published blog posts (PUBLIC)
│   ├── post-slug/
│   │   ├── index.mdx              # Post content
│   │   └── assets/                # Images, diagrams, videos
│   │       ├── hero.webp          # Hero image
│   │       ├── diagram.svg        # Inline diagrams
│   │       └── demo.mp4           # Demo videos
│   └── private/                   # Draft/unpublished posts (PRIVATE)
│       └── draft-post/
│           ├── index.mdx          # Draft content (with draft: true)
│           └── assets/            # Draft images/assets
│               └── hero.webp
└── portfolio/                      # Portfolio items (PUBLIC by default)
    └── project-name/
        ├── index.json             # Project metadata
        └── assets/                # Project images
```

### What Belongs Where

**Published Blog Posts (`src/content/blog/{slug}/`):**
- ✅ Published posts with `draft: false` or no draft field
- ✅ All post assets (images, videos, diagrams)
- ✅ Hero images for published posts
- ❌ Work-in-progress content
- ❌ Sensitive case studies not yet approved

**Draft Blog Posts (`src/content/blog/private/{slug}/`):**
- ✅ Posts marked with `draft: true`
- ✅ Work-in-progress content
- ✅ Unpublished series installments
- ✅ Sensitive topics under review
- ✅ All draft assets (images, videos)

**Portfolio Items (`public/portfolio/` or `src/content/portfolio/`):**
- ✅ Public project showcases
- ✅ Case studies (with client approval)
- ❌ Client work without permission
- ❌ Proprietary implementations

### Classification Rules

| Content Type | Public | Private | Rule |
|---|---|---|---|
| **Published Blog Posts** | ✅ | ❌ | In `src/content/blog/{slug}/` with `draft: false` or omitted |
| **Draft Blog Posts** | ❌ | ✅ | In `src/content/blog/private/{slug}/` with `draft: true` |
| **Blog Images (published)** | ✅ | ❌ | In published post's `assets/` folder |
| **Blog Images (draft)** | ❌ | ✅ | In private post's `assets/` folder |
| **Blog Hero Images** | ✅ (published) | ✅ (draft) | Follow parent post's classification |
| **Portfolio Items** | ✅ | ❌ | In `public/portfolio/` (always public) |
| **Portfolio Case Studies** | ⚠️ | ⚠️ | Public only with client approval; otherwise private |
| **MDX Components** | ✅ | ❌ | Reusable components in `src/components/mdx/` |

### Draft vs. Private

Two mechanisms control post visibility:

1. **`draft: true` in frontmatter**
   - Post file exists in git (in `src/content/blog/`)
   - Excluded from public listings by build logic
   - Accessible if direct URL is known
   - **Use case:** Scheduled posts, soft launches

2. **`private/` folder** (RECOMMENDED)
   - Post in `src/content/blog/private/`
   - Completely excluded from git (via `.gitignore`)
   - Never committed, never public
   - **Use case:** Work-in-progress, sensitive content, unpublished drafts

**Best Practice:** Use `private/` folder for all drafts to prevent accidental publication via direct URLs.

### Blog Images & Assets

**Classification follows parent post:**

```yaml
# Published post: src/content/blog/my-post/index.mdx
image:
  url: "/blog/my-post/assets/hero.webp"  # ✅ PUBLIC
  
# Draft post: src/content/blog/private/my-draft/index.mdx
image:
  url: "/blog/private/my-draft/assets/hero.webp"  # ❌ PRIVATE (gitignored)
```

**Important:** Images in `src/content/blog/private/` are excluded from git and will never be deployed. This prevents accidental exposure of draft content screenshots, diagrams, or sensitive visuals.

### Publishing Workflow

**Moving from private to public:**

1. Ensure post is ready (reviewed, fact-checked)
2. Move folder from `src/content/blog/private/{slug}/` to `src/content/blog/{slug}/`
3. Update image URLs to remove `/private/` path segment:
   ```diff
   - url: "/blog/private/event-driven-architecture/assets/hero.webp"
   + url: "/blog/event-driven-architecture/assets/hero.webp"
   ```
4. Set `draft: false` or remove draft field
5. Commit and deploy

**Moving from public to private (unpublishing):**

1. Move folder from `src/content/blog/{slug}/` to `src/content/blog/private/{slug}/`
2. Update image URLs to include `/private/` path segment
3. Set `draft: true`
4. Commit (folder will be gitignored, effectively removing from public repo)

### Validation

Before committing blog content:

- [ ] Published posts are NOT in `private/` folder
- [ ] Draft posts ARE in `private/` folder
- [ ] Image URLs match post location (public vs. private paths)
- [ ] No sensitive client information in published posts
- [ ] Hero images exist and are accessible
- [ ] `draft: true` is set for all private folder posts

**Automated check:**

```bash
npm run validate:content  # Checks frontmatter, structure
```

---

## �📊 Document Classification Matrix

| Document Type | Public | Private | Rule |
|---|---|---|---|
| **ADRs** | ✅ | ✅* | Public by default; private for controversial decisions |
| **API Docs** | ✅ | ❌ | Always public (developer-facing) |
| **Component Patterns** | ✅ | ❌ | Always public (contributor guidance) |
| **Security Best Practices** | ✅ | ❌ | General guidance public; specific findings private |
| **CVE/Vulnerability Reports** | ⚠️ | ✅ | Public after patch; private until patched |
| **Performance Metrics** | ⚠️ | ✅ | Public: benchmarks; private: detailed analysis |
| **Incident Reports** | ⚠️ | ✅ | Public: lessons learned; private: full report |
| **Operational Status** | ❌ | ✅ | Always private (internal only) |
| **Team Decisions** | ❌ | ✅ | Always private unless published officially |
| **Audit Reports** | ❌ | ✅ | Always private unless publishing compliance |
| **Security Audit Findings** | ❌ | ✅ | Always private until remediated |
| **Budget/Financial Data** | ❌ | ✅ | Always private |
| **Infrastructure Details** | ❌ | ✅ | Always private for security |
| **Feature Roadmaps** | ✅ | ❌ | Public (roadmap visibility for contributors) |
| **OAuth Setup Guides** | ⚠️ | ⚠️ | Public with redaction; private for client IDs/secrets |
| **Integration Templates** | ✅ | ❌ | Public (templates for contributors) |
| **Test Analysis Reports** | ❌ | ✅ | Private (contains performance/coverage metrics) |
| **Phase Completion Reports** | ❌ | ✅ | Private (contains operational metrics) |
| **Campaign Performance Reports** | ❌ | ✅ | Private (contains performance/timing data) |
| **Build Optimization Reports** | ❌ | ✅ | Private (contains build timing/performance metrics) |
| **Archived Documentation** | ❌ | ✅ | Excluded from repo (historical reference, not active guidance) |
| **Published Blog Posts** | ✅ | ❌ | In `src/content/blog/{slug}/` with `draft: false` or omitted |
| **Draft Blog Posts** | ❌ | ✅ | In `src/content/blog/private/{slug}/` with `draft: true` |
| **Blog Images (published)** | ✅ | ❌ | In published post's `assets/` folder |
| **Blog Images (draft)** | ❌ | ✅ | In private post's `assets/` folder (gitignored) |
| **Blog Hero Images** | ✅/❌ | ✅/❌ | Follow parent post's classification |
| **Portfolio Items** | ✅ | ❌ | Public project showcases only |
| **Portfolio Case Studies** | ⚠️ | ⚠️ | Public with client approval; private otherwise |

---

## 📦 Archive Documentation Policy

### Purpose

Documentation is archived when it's no longer actively maintained but may be valuable for historical reference. Archived docs are excluded from git to keep the repository lean and prevent confusion with current guidance.

### What Gets Archived

- Superseded architecture decisions (keep current ADR, archive old)
- Deprecated features and their documentation
- Old patterns replaced by new best practices
- Historical project status reports (>6 months old)
- Obsolete tooling/framework guides

### How to Archive

1. **Move to `docs/archive/`** with clear naming:
   ```
   docs/archive/
   ├── ADR-002-redux-removed.md (superseded by Zustand ADR)
   ├── OLD_COMPONENT_LIBRARY_GUIDE.md (deprecated)
   ├── NEXT_PAGES_MIGRATION_NOTES.md (historical)
   └── 2024-Q4-PROJECT_STATUS.md (old reports)
   ```

2. **Add header to archived doc:**
   ```markdown
   # [ARCHIVED] Original Title

   ⚠️ **This documentation is archived and no longer maintained.**
   
   **Superseded by:** Link to current version or replacement
   **Archived Date:** YYYY-MM-DD
   **Reason:** Why this is archived (deprecated feature, superseded pattern, etc.)

   ---

   [Original content follows]
   ```

3. **Update old references:**
   - If current docs link to archived items, update to point to replacement
   - If new docs should replace old ones, add "See also: [archived version]"

### Archived vs. Private

- **Archived (`docs/archive/`):** Historical reference, intentionally excluded from git
- **Private (`docs/*/private/`):** Sensitive internal docs, excluded from git for security
- **Difference:** Archived = not needed anymore; Private = sensitive content

---

## 🛡️ Enforcement Mechanisms

### 1. Directory Structure Rules

```
✅ ALLOWED:
docs/README.md
docs/architecture/ADR-001-nextjs.md
docs/api/endpoints.md
docs/security/private/FINDINGS.md

❌ NOT ALLOWED:
docs/OPERATIONAL_STATUS.md (should be in docs/operations/private/)
docs/PERFORMANCE_METRICS.md (should be in docs/operations/private/)
docs/security/VULNERABILITY_DETAILS.md (should be in docs/security/private/)
```

### 2. File Naming Conventions

**Public docs use:**
- `COMPONENT_PATTERNS.md` - General patterns
- `API_REFERENCE.md` - API documentation
- `SECURITY_BEST_PRACTICES.md` - General guidance

**Private docs use:**
- `*_FINDINGS.md` - Detailed findings
- `*_REPORT.md` - Audit/assessment reports
- `*_ANALYSIS.md` - Detailed analysis
- `*_TRACKING.md` - Sensitive tracking

### 3. Pre-Commit Hook

Prevents accidental commits:

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check for sensitive files in wrong location
if git diff --cached --name-only | grep -E "^docs/[^/]+/.*\.(FINDINGS|REPORT|AUDIT|ANALYSIS|METRICS)" | grep -v "/private/"; then
  echo "❌ ERROR: Sensitive file detected in public docs/"
  echo "   Move to appropriate docs/[category]/private/ folder before committing"
  exit 1
fi

# Check for accidentally committed secrets
if git diff --cached | grep -E "PRIVATE_KEY|API_KEY|PASSWORD|SECRET"; then
  echo "❌ ERROR: Possible credential detected in code"
  echo "   Use environment variables or .env.local instead"
  exit 1
fi

exit 0
```

### 4. CI/CD Validation

GitHub Actions workflow validates docs structure:

```yaml
- name: Validate docs structure
  run: |
    # Check for sensitive files in public docs (outside private/ folders)
    if find docs -type f \( -name "*FINDINGS*" -o -name "*AUDIT*" \) -not -path "*/private/*"; then
      echo "❌ Sensitive files found in public docs"
      echo "   Move to appropriate docs/[category]/private/ folder"
      exit 1
    fi
```

### 5. File Header Requirements

**Public docs must include:**

```markdown
# Document Title

**Audience:** Public / Contributors / Users  
**Last Updated:** YYYY-MM-DD  
**Status:** Current / Archived / Draft  

This document is publicly visible. Do not include:
- Security vulnerabilities
- Personal information
- Confidential data
- Internal metrics
```

**Private docs must include:**

```markdown
# Document Title

🔒 **PRIVATE DOCUMENTATION** 🔒
**Audience:** Internal Team Only
**Last Updated:** YYYY-MM-DD
**Clearance Level:** [Internal / Confidential / Secret]

⚠️ This document contains sensitive information.
Do not share publicly or with external parties.
```

---

## 📚 Public Documentation Categories

### `/docs/ai/` - AI & Copilot Guidance
- ✅ Component patterns
- ✅ Code style standards
- ✅ Architecture decisions
- ❌ Performance metrics
- ❌ Internal prompts

### `/docs/api/` - API Documentation
- ✅ Endpoint reference
- ✅ Request/response formats
- ✅ Error handling
- ✅ Rate limiting policies
- ❌ Internal routing logic
- ❌ Database schema details

### `/docs/architecture/` - System Design
- ✅ ADRs (Architecture Decision Records)
- ✅ Technology choices and rationale
- ✅ Data flow diagrams (anonymized)
- ✅ System overview
- ❌ Performance analysis (see private)
- ❌ Infrastructure credentials

### `/docs/automation/` - CI/CD & Processes
- ✅ Build process explanation
- ✅ Deployment procedures (public)
- ✅ Testing standards
- ✅ Performance optimization strategies
- ❌ Detailed metrics (see private)
- ❌ Credential management
- ❌ Emergency procedures

### `/docs/components/` - Component Documentation
- ✅ Component usage
- ✅ Props and API
- ✅ Examples and patterns
- ✅ Accessibility notes
- ❌ Internal implementation details
- ❌ Performance benchmarks

### `/docs/templates/` - Code Templates
- ✅ Copy-paste starting points
- ✅ Best practice examples
- ✅ Common patterns
- ❌ Project-specific implementations

### `/docs/testing/` - Testing Guidance
- ✅ Testing strategies
- ✅ Test patterns and examples
- ✅ Coverage targets
- ❌ Specific test failures (see private)
- ❌ Performance metrics
- ❌ Debugging notes

---

## 🚨 Sensitive Content Checklist

Before committing documentation, verify:

- [ ] No API keys or tokens
- [ ] No database credentials
- [ ] No employee names (unless official team page)
- [ ] No specific vulnerability details (if unpatched)
- [ ] No internal financial data
- [ ] No personnel decisions
- [ ] No security audit findings (if confidential)
- [ ] No vendor assessment scores
- [ ] No infrastructure details
- [ ] No internal decision rationale (unless approved)
- [ ] No performance metrics (operational)
- [ ] No working/ephemeral content (status reports, backlogs)

---

## 📝 Contributor Guidelines Update

### For Contributors Creating Docs

1. **Determine audience first**
   - Is this for public/contributors? → `/docs`
   - Is this internal/sensitive? → `/docs/private`

2. **Use the classification matrix**
   - Check document type in matrix
   - Follow default placement rule
   - If uncertain, ask in PR

3. **Add appropriate header**
   - Include audience statement
   - Note last updated date
   - Flag if contains sensitive info

4. **Sanitize before public**
   - Remove names (generic roles ok)
   - Generalize specifics
   - No metrics or numbers
   - No implementation details

5. **Link appropriately**
   - Public docs can reference private: "See private docs for details"
   - Private docs can reference public: Direct links are ok
   - Avoid exposing private doc paths in public

---

## 🔄 Quarterly Review Process

Every 3 months:

- [ ] Audit `/docs` for inadvertently sensitive content
- [ ] Review `/docs/private` for stale material
- [ ] Verify `.gitignore` protects `/docs/private`
- [ ] Check for outdated classification
- [ ] Update contributor guidelines if needed
- [ ] Validate pre-commit hooks work
- [ ] Document any policy changes

---

## 🎯 Success Criteria

- ✅ No sensitive content in `/docs` (public)
- ✅ No accidental `docs/private` commits to git
- ✅ Clear audience header on all docs
- ✅ Contributors understand public/private split
- ✅ PR review catches misplaced docs
- ✅ Quarterly audits find no violations
- ✅ Zero incidents of public exposure

---

## 📞 FAQ

**Q: Can I move old docs from public to private?**  
A: Yes. Move the file and update any references. Old commit history remains; new commits will show the file in correct location.

**Q: What if a public doc references private data?**  
A: Create a pointer: "For detailed findings, see internal documentation." Don't expose specifics.

**Q: Should ADRs be public or private?**  
A: Generally public (architectural decisions are shared). Only private if decision itself is sensitive (e.g., vendor selection, security vulnerability handling).

**Q: Can team members access private documentation?**
A: Yes, files in `docs/[category]/private/` folders are in the repo but gitignored from public view. Works just like other docs for the team.

**Q: How do I handle a security finding discovered post-publication?**  
A: Move to private, sanitize public doc, revert git history (or just remove sensitive details in new commit).

**Q: What about customer data or incident details?**  
A: Always private. If incident lessons can be shared, create public version with details removed.

---

## 📖 Related Documentation

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Updated with doc guidelines
- [.gitignore](../.gitignore) - Includes `docs/*/private/` exclusion
- [AGENTS.md](../AGENTS.md) - Reference for documentation standards
- [docs/README.md](./README.md) - Public docs index
- [DOCUMENTATION_CONSOLIDATION_GUIDE.md](./DOCUMENTATION_CONSOLIDATION_GUIDE.md) - Complete documentation index

---

**Status:** Active Policy  
**Maintained By:** Tech Lead  
**Last Review:** December 15, 2025  
**Next Review:** March 15, 2026 (Quarterly)
