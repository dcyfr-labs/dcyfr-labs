<!-- TLP:CLEAR -->

# Operational Documentation Policy

**Version:** 1.0.0
**Last Updated:** January 24, 2026
**Purpose:** Define standards for what constitutes public reference documentation vs. operational/point-in-time documentation

---

## Problem Statement

The `/docs/` directory contains a mix of:

- ✅ **Reference documentation** (how-to guides, architecture decisions, patterns)
- ⚠️ **Operational documentation** (implementation summaries, status reports, analysis)
- ⚠️ **Point-in-time artifacts** (completion reports, validation summaries, session logs)

**Issue:** Operational docs clutter the public repository and provide limited long-term value to external contributors.

---

## Documentation Classification

### 📘 Public Reference Documentation (Keep in Public `/docs/`)

**Characteristics:**

- Timeless educational value
- Reusable patterns and examples
- Architecture decisions (ADRs)
- How-to guides and tutorials
- Best practices and standards
- Quick reference materials
- System design documentation

**Examples:**

- ✅ `docs/ai/component-patterns.md` - Reusable component patterns
- ✅ `docs/architecture/best-practices.md` - Architecture guidelines
- ✅ `docs/testing/README.md` - Testing strategy
- ✅ `docs/blog/content-creation.md` - Content authoring guide
- ✅ `docs/templates/` - Copy-paste templates

**File Naming Convention:**

- Descriptive nouns: `component-patterns.md`, `testing-strategy.md`
- No dates in filename (unless archival reference)
- No status indicators: `SUMMARY`, `COMPLETE`, `STATUS`

---

### 🔒 Private Operational Documentation (Move to `/private/`)

**Characteristics:**

- Point-in-time status reports
- Implementation summaries
- Completion reports
- Analysis artifacts
- Validation reports
- Session logs
- Audit findings (security/performance)

**Examples:**

- ⚠️ `docs/analysis/config-gaps-implementation-2026-01-23.md` → `docs/analysis/private/`
- ⚠️ `docs/operations/CLEANUP_SUMMARY_2025-12-26.md` → `docs/operations/private/`
- ⚠️ `docs/operations/INNGEST_CONSOLIDATION_COMPLETE.md` → `docs/operations/private/`
- ⚠️ `docs/sessions/opencode-github-copilot-migration-summary.md` → `docs/sessions/private/`

**File Naming Convention (Operational):**

- Include date: `YYYY-MM-DD` or `YYYY-MM` format
- Status indicators acceptable: `SUMMARY`, `COMPLETE`, `ANALYSIS`, `REPORT`, `VALIDATION`
- Examples: `implementation-summary-2026-01-23.md`, `CLEANUP_COMPLETE_2025-12.md`

---

### 📦 Archival Documentation (Move to `/docs/archive/`)

**Characteristics:**

- Historical reference (rarely accessed)
- Superseded by newer documentation
- Deprecated features/patterns
- Migration guides (completed)
- Old planning documents (executed)

**Examples:**

- ⚠️ Completed migration guides (>6 months old)
- ⚠️ Deprecated feature documentation
- ⚠️ Old roadmap documents (historical context only)

**Archive Structure:**

```
docs/archive/
├── 2025/
│   ├── Q4/
│   │   ├── migration-summaries/
│   │   ├── analysis-reports/
│   │   └── implementation-logs/
│   └── README.md (index of archived content)
└── 2026/
    └── Q1/
```

---

## Decision Matrix

### When Creating New Documentation

```
START: "I need to document something"
  │
  ├─ Is this a reusable pattern/guide?
  │  └─ YES → Public reference doc (docs/[category]/filename.md)
  │     Examples: How-to, architecture decision, design pattern
  │
  ├─ Is this a point-in-time status update?
  │  └─ YES → Private operational doc (docs/[category]/private/filename-YYYY-MM-DD.md)
  │     Examples: Implementation summary, validation report, completion status
  │
  ├─ Is this a security/audit finding?
  │  └─ YES → Private sensitive doc (docs/security/private/)
  │     Examples: CodeQL findings, security audits, vulnerability analysis
  │
  ├─ Is this historical reference (>6 months old)?
  │  └─ YES → Archive doc (docs/archive/YYYY/QX/)
  │     Examples: Completed migrations, old roadmaps, deprecated features
  │
  └─ Is this a session/work log?
     └─ YES → Private session doc (docs/sessions/private/YYYY-MM-DD.md)
        Examples: Daily work logs, debugging sessions, troubleshooting notes
```

---

## Filename Pattern Recognition

AI agents should automatically detect operational documentation by these patterns:

### Indicators of Operational Documentation (→ Private)

**Filename Patterns:**

- `*-summary.md` - Implementation/completion summaries
- `*-complete.md` - Completion reports
- `*-status.md` - Status updates
- `*-report.md` - Audit/analysis reports
- `*-validation.md` - Validation reports
- `*-implementation-YYYY-MM-DD.md` - Dated implementation docs
- `*-analysis-YYYY-MM-DD.md` - Dated analysis docs
- `*SUMMARY*.md` - All-caps summary indicators
- `*STATUS*.md` - All-caps status indicators
- `*COMPLETE*.md` - All-caps completion indicators
- `*REPORT*.md` - All-caps report indicators

**Content Patterns:**

- Contains "Status: COMPLETE" or "Implementation Status: ✅"
- Contains "Implementation Complete: [date]"
- Contains "Total Implementation Time: X hours"
- Contains multiple dated sections (before/after comparisons)
- Primarily lists of completed tasks/checkboxes
- Session logs with timestamps

**Directory Patterns:**

- `docs/sessions/` (unless explicitly reference material)
- Files with dates in any category (unless explicitly archival reference)

### Indicators of Reference Documentation (→ Public)

**Filename Patterns:**

- `README.md` - Category indexes
- `quick-reference.md` - Quick reference guides
- `best-practices.md` - Best practice guides
- `architecture.md` - Architecture decisions
- `[feature]-guide.md` - How-to guides
- `[pattern].md` - Design patterns

**Content Patterns:**

- How-to sections ("How to...", "Getting Started")
- Code examples and templates
- Architecture Decision Records (ADRs)
- Pattern explanations with examples
- Configuration reference
- API documentation

---

## Migration Strategy

### Phase 1: Identify Operational Docs (Automated)

Create script to scan and categorize:

```bash
# scripts/classify-docs.mjs
# Scans docs/ for operational patterns
# Generates move commands

npm run docs:classify
```

**Output:**

```
Operational Documentation Found (82 files):

CATEGORY: analysis/
- config-gaps-implementation-2026-01-23.md → private/

CATEGORY: operations/
- CLEANUP_SUMMARY_2025-12-26.md → private/
- INNGEST_CONSOLIDATION_COMPLETE.md → private/
- GITHUB_WORKFLOWS_OPTIMIZATION_2026-01-13.md → private/
[...]

CATEGORY: sessions/
- opencode-github-copilot-migration-summary.md → private/
- 2026-01-11-integration-cleanup-api-monitoring.md → private/

Total: 82 files to move
```

### Phase 2: Review and Approve

Manual review of classification:

```bash
# Review suggested moves
npm run docs:classify:review

# Approve specific categories
npm run docs:classify:approve analysis operations sessions
```

### Phase 3: Execute Migration

```bash
# Move approved files to private/
npm run docs:classify:migrate

# Update cross-references
npm run docs:update-references
```

### Phase 4: Update AI Agents

Add policy to AI agent instructions (see below).

---

## AI Agent Instructions

### For DCYFR Agent (.github/agents/DCYFR.agent.md)

Add to **Rule #7: Documentation Placement**:

```markdown
### Rule #7: Documentation Placement (MANDATORY)

**Quick Decision:**

- Reusable pattern/guide → Public `docs/[category]/`
- Point-in-time status/summary → Private `docs/[category]/private/`
- Security/audit finding → Private `docs/security/private/`
- Session/work log → Private `docs/sessions/private/`

**Operational Documentation Indicators:**

- Filename contains: `-summary`, `-complete`, `-status`, `-report`, `-validation`
- Filename contains date: `YYYY-MM-DD`
- Content contains: "Status: COMPLETE", "Implementation Complete", task checklists
- Content is point-in-time snapshot, not reusable reference

**If creating operational documentation:**

1. Place in `docs/[category]/private/` subdirectory
2. Include date in filename: `operation-summary-2026-01-24.md`
3. Add clear header with date and purpose
4. Do NOT create in root `docs/[category]/`

**Examples:**
```

✅ CORRECT:

- docs/ai/private/claude-config-implementation-2026-01-23.md
- docs/operations/private/cleanup-summary-2026-01-05.md
- docs/security/private/audit-report-2026-01-11.md

❌ WRONG:

- docs/ai/claude-config-implementation-2026-01-23.md (should be private/)
- docs/operations/CLEANUP_SUMMARY.md (should be private/ + dated)
- docs/security/audit-findings.md (should be private/)

```

**Reference Documentation (Public):**
- How-to guides: `component-patterns.md`, `testing-strategy.md`
- Architecture: `best-practices.md`, `architecture-decisions.md`
- Quick references: `quick-reference.md`, `commands.md`
- Templates: `template-name.md` in `docs/templates/`
```

### For GitHub Copilot (.github/copilot-instructions.md)

Add to quick reference:

```markdown
## Documentation Placement

**Quick Rule:**

- Reusable guide → `docs/[category]/filename.md`
- Status/summary → `docs/[category]/private/filename-YYYY-MM-DD.md`
- Security findings → `docs/security/private/`
```

### For Claude General (CLAUDE.md)

Add to constraints:

```markdown
## Documentation Standards

When creating documentation:

- **Reference docs** (how-to, patterns) → `docs/[category]/`
- **Operational docs** (summaries, status) → `docs/[category]/private/`
- **Security findings** → `docs/security/private/`

Check filename patterns: `-summary`, `-complete`, `-status`, dates → private/
```

---

## Implementation Checklist

### Immediate Actions

- [x] Create policy document (`OPERATIONAL_DOCUMENTATION_POLICY.md`)
- [ ] Create classification script (`scripts/classify-docs.mjs`)
- [ ] Run classification on existing docs
- [ ] Review and approve classifications
- [ ] Update AI agent instructions (DCYFR, Copilot, Claude)
- [ ] Migrate flagged files to private/
- [ ] Update cross-references
- [ ] Add pre-commit hook to validate doc placement

### Validation Script

```bash
# scripts/validate-doc-placement.mjs
# Runs in pre-commit hook
# Checks for operational patterns in public docs/
# Blocks commit if violations found

Example output:
❌ Operational documentation in public directory:
- docs/operations/implementation-summary-2026-01-24.md
  → Should be: docs/operations/private/implementation-summary-2026-01-24.md

Fix with:
  mv docs/operations/implementation-summary-2026-01-24.md \
     docs/operations/private/
```

### Long-term Maintenance

- [ ] Quarterly review of docs/ for misplaced operational docs
- [ ] Archive old operational docs (>1 year) to `docs/archive/`
- [ ] Update INDEX.md to reflect new structure
- [ ] Document policy in CONTRIBUTING.md

---

## Examples of Correct Placement

### Before (Current State)

```
docs/
├── analysis/
│   └── config-gaps-implementation-2026-01-23.md  ❌ PUBLIC (operational)
├── operations/
│   ├── CLEANUP_SUMMARY_2025-12-26.md  ❌ PUBLIC (operational)
│   ├── INNGEST_CONSOLIDATION_COMPLETE.md  ❌ PUBLIC (operational)
│   └── deployment-guide.md  ✅ PUBLIC (reference)
└── sessions/
    └── opencode-migration-summary.md  ❌ PUBLIC (operational)
```

### After (Compliant)

```
docs/
├── analysis/
│   ├── private/
│   │   └── config-gaps-implementation-2026-01-23.md  ✅ PRIVATE
│   └── README.md  ✅ PUBLIC (index)
├── operations/
│   ├── private/
│   │   ├── cleanup-summary-2025-12-26.md  ✅ PRIVATE
│   │   └── inngest-consolidation-complete-2026-01.md  ✅ PRIVATE
│   ├── deployment-guide.md  ✅ PUBLIC (reference)
│   └── README.md  ✅ PUBLIC (index)
└── sessions/
    ├── private/
    │   └── opencode-migration-summary-2026-01-11.md  ✅ PRIVATE
    └── README.md  ✅ PUBLIC (index)
```

---

## Benefits

### For Public Repository

1. **Cleaner documentation tree** - Easier for external contributors to find reference material
2. **Clear separation** - Educational content vs. internal operations
3. **Reduced noise** - Point-in-time artifacts don't clutter search results
4. **Better organization** - Private/ subdirectories keep related content together

### For Internal Team

1. **Preserved history** - Operational docs retained for internal reference
2. **Audit trail** - Implementation summaries available for review
3. **Context preservation** - Session logs and analysis available when needed
4. **Compliance** - Security/audit findings properly segregated

### For AI Agents

1. **Clear guidelines** - Automated decision making for doc placement
2. **Pattern recognition** - Filename/content patterns trigger correct placement
3. **Validation** - Pre-commit hooks prevent policy violations
4. **Consistency** - All agents follow same classification rules

---

## Related Policies

- [DOCS_GOVERNANCE.md](DOCS_GOVERNANCE.md) - Overall documentation governance
- [AGENT_DOCUMENTATION_ENFORCEMENT.md](AGENT_DOCUMENTATION_ENFORCEMENT.md) - AI agent documentation rules
- [DOCUMENTATION_GOVERNANCE_AUDIT_2026-01-24.md](private/DOCUMENTATION_GOVERNANCE_AUDIT_2026-01-24.md) - Governance audit results

---

## FAQ

**Q: What about implementation guides that ARE reference material?**
A: If the implementation guide is reusable (e.g., "How to add a new API route"), it's reference documentation and stays public. If it's a specific implementation completion report (e.g., "Contact Form Implementation - Complete"), it's operational and goes to private/.

**Q: Can operational docs ever be public?**
A: Yes, if they have educational value beyond the specific implementation. Example: "Migration from X to Y - Lessons Learned" could be public if it teaches reusable migration patterns.

**Q: What about docs with both reference and operational content?**
A: Extract the reference content into a separate public doc (e.g., `pattern-guide.md`) and keep the implementation details in private/ (e.g., `implementation-2026-01.md`).

**Q: How long do operational docs stay in private/?**
A: Forever, unless archived. After 1 year, consider moving to `docs/archive/YYYY/QX/` for historical reference.

**Q: Do README.md files in private/ subdirectories stay private?**
A: README.md files that index private content should stay private. They provide context for the operational docs.

---

**Status:** ✅ **APPROVED - Ready for Implementation**
**Next Steps:** Create classification script, run on existing docs, update AI agents
**Owner:** DCYFR Labs Governance Team
**Review Cadence:** Quarterly (April 2026)
