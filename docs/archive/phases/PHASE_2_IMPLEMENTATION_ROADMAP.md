# Phase 2 Implementation Roadmap - Hybrid Approach

**Decision:** Option C (Hybrid Approach)  
**Timeline:** 1 week  
**Effort:** 40-50 hours  
**Risk:** Low-Medium  
**Status:** Starting December 28, 2025

---

## Overview

The Hybrid Approach combines automated conversion (80% of work) with manual review (20% of work) to achieve design token compliance efficiently while maintaining code quality.

### Strategy Summary

```
┌─────────────────────────────────────────┐
│ 1657 Total Violations                  │
│ across 217 files                        │
└─────────────────────────────────────────┘
           │
           ├─ 80% Straightforward patterns
           │  (Spacing: mb-, mt-, gap-, p-)
           │  └─ AUTOMATED CONVERSION
           │     ~1320 violations
           │
           └─ 20% Complex patterns
              (Typography, containers, responsive)
              └─ MANUAL REVIEW & FIX
                 ~337 violations
```

---

## Week 1 Implementation Schedule

### Day 1: Planning & Prioritization

**Objectives:**
- [ ] Identify highest-impact components (most traffic, most reused)
- [ ] Create batch groups (group similar files)
- [ ] Set up conversion tracking system
- [ ] Create rollback plan

**Deliverables:**
- [ ] Prioritized component list (3-5 batches)
- [ ] Conversion tracking spreadsheet
- [ ] Rollback plan documented

**Commands:**
```bash
# Identify highest-violation files
npm run find:token-violations | head -50

# Sort by component importance (traffic, reuse)
# Manually create batch groups
```

### Day 2-3: Automated Conversion - Batch 1-3

**Batch Strategy:**
- Batch 1: Core layout components (PageLayout, ArticleLayout, ArchiveLayout)
- Batch 2: High-traffic components (BlogCard, ProjectCard, ProfileCard)
- Batch 3: Utility components (helpers, modals, dialogs)

**Process per Batch:**

```bash
# 1. Create feature branch
git checkout -b phase-2/batch-1-layouts

# 2. Run conversion (dry-run first)
npm run fix:tokens -- --dry-run

# 3. Review changes carefully
npm run lint:fix
npm run typecheck

# 4. Run tests for affected components
npm run test:run -- batch-1-layouts

# 5. Test E2E on critical paths
npm run test:e2e -- --grep "layout|navigation"

# 6. Commit with detailed message
git add .
git commit -m "feat: convert batch-1 spacing to design tokens

- PageLayout: 12 spacing violations converted
- ArticleLayout: 8 spacing violations converted  
- ArchiveLayout: 6 spacing violations converted
- Manual review: 3 edge cases flagged for next step

Tests: All passing
Visual: No regressions observed"
```

**For Each Batch:**
- [ ] Run conversion on batch
- [ ] Review changes line-by-line
- [ ] Fix any false positives
- [ ] Run relevant tests
- [ ] Commit with detailed message

### Day 4: Manual Review & Complex Patterns

**Focus Areas:**
- Typography combinations (text-* + font-*)
- Responsive classes (sm:*, md:*, lg:*)
- Dynamic/conditional classes
- Container widths with context

**Process:**
```bash
# Identify remaining violations
npm run find:token-violations > violations.txt

# Review most common patterns
grep "Typography violations" violations.txt | sort | uniq -c

# Create helper script for complex conversions
node scripts/review-complex-patterns.mjs
```

**Expected Work:**
- [ ] Review ~20 complex pattern types
- [ ] Create manual fix guidelines
- [ ] Fix highest-frequency patterns
- [ ] Document edge cases

### Day 5: Testing & Validation

**Full Validation Suite:**
```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Unit tests
npm run test:run

# E2E tests (critical paths)
npm run test:e2e

# Visual regression testing
# (Manual inspection of key pages)

# Performance check
npm run perf:check
```

**Checklist:**
- [ ] 0 TypeScript errors
- [ ] 0 ESLint errors
- [ ] ≥99% test pass rate
- [ ] No visual regressions
- [ ] No performance regressions
- [ ] Design token compliance ≥95%

### Day 6: Enforcement Setup

**ESLint Configuration:**
```bash
# Update ESLint rules from warn to error
# (This prevents NEW violations)

npm run lint -- --fix
```

**Pre-commit Enhancement:**
```bash
# Verify pre-commit hooks block new violations
git config core.hooksPath .githooks
```

**CI/CD Integration:**
```bash
# Add to CI pipeline (GitHub Actions)
# - Fail on new token violations
# - Report compliance metrics
# - Track progress
```

### Day 7: Documentation & Team Alignment

**Documentation:**
- [ ] Document conversion results
- [ ] Update metrics dashboards
- [ ] Create migration guide for team
- [ ] Update DCYFR.agent.md with metrics

**Team Alignment:**
- [ ] Share compliance metrics
- [ ] Train team on design tokens
- [ ] Establish maintenance procedures
- [ ] Set up monitoring

---

## Batch Priority Order

### Priority 1: Core Layouts (Highest Impact)
**Files:** ~12  
**Violations:** ~80  
**Impact:** Affects every page  
**Effort:** 4-6 hours

```
- src/components/layouts/PageLayout.tsx
- src/components/layouts/ArticleLayout.tsx
- src/components/layouts/ArchiveLayout.tsx
- src/components/layouts/index.ts
```

### Priority 2: High-Traffic Components
**Files:** ~25  
**Violations:** ~200  
**Impact:** Most commonly used  
**Effort:** 8-10 hours

```
- src/components/blog/PostCard.tsx
- src/components/work/ProjectCard.tsx
- src/components/resume/SkillCard.tsx
- And 22 others...
```

### Priority 3: Utility Components
**Files:** ~30  
**Violations:** ~250  
**Impact:** Support components  
**Effort:** 6-8 hours

```
- src/components/common/*
- src/components/ui-extensions/*
- src/lib/helpers/*
```

### Priority 4: Edge Cases & Complex Patterns
**Files:** ~150  
**Violations:** ~1127  
**Impact:** Remaining violations  
**Effort:** 8-10 hours

```
- Everything else (complex patterns, edge cases)
- Responsive classes, dynamic content
- Context-dependent styling
```

---

## Tools & Scripts

### Already Created:
```bash
npm run find:token-violations    # Identify violations
npm run validate:tokens          # Check compliance
npm run lint:test-data           # Detect test data
npm run fix:tokens               # Convert tokens (placeholder)
```

### Create During Phase 2:
```bash
scripts/review-complex-patterns.mjs    # Identify manual work
scripts/generate-conversion-report.mjs # Document changes
scripts/create-rollback-plan.mjs       # Safety net
```

---

## Success Criteria

### By End of Week 1:

| Metric | Target | How to Verify |
|--------|--------|---------------|
| Design Token Compliance | ≥95% | `npm run validate:tokens` |
| Test Pass Rate | ≥99% | `npm run test:run` |
| TypeScript Errors | 0 | `npm run typecheck` |
| ESLint Errors | 0 | `npm run lint` |
| Visual Regressions | 0 | E2E + manual inspection |
| Performance Regression | 0% | `npm run perf:check` |
| Pre-commit Blocking | ✅ | Attempt commit with violation |

---

## Risk Mitigation

### Risk 1: Automated Conversion Breaks Styling
**Mitigation:**
- Visual testing for each batch
- E2E tests for critical paths
- Manual spot-check 20% of changes
- Git branches for easy rollback

### Risk 2: Missed Edge Cases
**Mitigation:**
- Comprehensive linting after conversion
- Type checking
- Test coverage validation
- Manual review of complex patterns

### Risk 3: Performance Regressions
**Mitigation:**
- Bundle size check
- Lighthouse CI validation
- Performance metrics tracking
- Profiling before/after

### Risk 4: Breaking Changes
**Mitigation:**
- Use separate branches per batch
- Test before merging
- No direct main branch changes
- PR review process

---

## Decision Checkpoints

### End of Day 3 Checkpoint:
**Question:** Are conversions working as expected?
- If YES → Continue to day 4
- If NO → Adjust conversion script, retry

### End of Day 5 Checkpoint:
**Question:** Are all tests passing with no regressions?
- If YES → Proceed to enforcement
- If NO → Identify and fix issues before enforcement

---

## Team Communication

### Daily Updates (async):
```
Day 1: ✅ Prioritization complete - Starting batch 1 layouts
Day 2: ✅ Batch 1 complete - 80 violations converted, tests passing
Day 3: ✅ Batch 2 & 3 complete - 440 violations converted, validation ongoing
Day 4: ✅ Manual patterns reviewed - 20 edge cases documented
Day 5: ✅ Full test suite passing - Design token compliance 95%
Day 6: ✅ Enforcement enabled - New violations blocked
Day 7: ✅ Complete - Metrics updated, team trained
```

### Final Metrics Report:
```
PHASE 2 COMPLETION REPORT
========================

Starting State:
- 1657 violations across 217 files
- Compliance: ~40%

Ending State:
- Violations: Reduced by 95%+
- Compliance: 95%+
- New violations: Prevented via enforcement

Implementation:
- Automated fixes: 80% (1326 violations)
- Manual review: 20% (331 violations)
- Timeline: 1 week (completed on schedule)
- Effort: 42 hours total

Quality Metrics:
- Test pass rate: 99%
- TypeScript errors: 0
- ESLint errors: 0
- Visual regressions: 0
- Performance impact: Neutral
```

---

## Next Steps (Post-Phase 2)

### Immediate (Week 2):
- Monitor for new violations
- Track team adoption
- Identify patterns for automation

### Short Term (Month 2):
- Achieve 100% compliance through incremental fixes
- Document lessons learned
- Update design system docs

### Long Term (Ongoing):
- Maintain <0 new violations
- Monitor token usage patterns
- Continuously improve design system

---

## Reference Documents

- **Discovery:** [DESIGN_TOKEN_REMEDIATION_PLAN.md](DESIGN_TOKEN_REMEDIATION_PLAN.md)
- **Phase 1:** [PHASE_1_COMPLETION_SUMMARY.md](PHASE_1_COMPLETION_SUMMARY.md)
- **Tokens:** [src/lib/design-tokens.ts](src/lib/design-tokens.ts)
- **Rules:** [.github/agents/enforcement/DESIGN_TOKENS.md](.github/agents/enforcement/DESIGN_TOKENS.md)

---

**Timeline:** December 28, 2025 - January 3, 2026  
**Status:** Ready to begin Day 1 implementation  
**Recommendation:** Start with Priority 1 (Core Layouts) to unblock other changes
