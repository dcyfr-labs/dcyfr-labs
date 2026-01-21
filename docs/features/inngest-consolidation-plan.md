# Inngest Error Alerting Documentation Consolidation Plan

**Status:** Proposed
**Created:** January 21, 2026
**Priority:** Low (Phase 4.3)

---

## Current State

The Inngest error alerting system has **6 documentation files** with overlapping content:

1. `inngest-error-alerting.md` (overview)
2. `inngest-error-alerting-debug.md` (debugging)
3. `inngest-error-alerting-implementation.md` (implementation)
4. `inngest-error-alerting-quick-ref.md` (quick reference)
5. `inngest-error-alerting-examples.md` (code examples)
6. `inngest-error-alerting-summary.md` (summary)
7. `inngest-error-alerting-checklist.md` (checklist)

_(Note: Actually 7 files - plan listed 6)_

---

## Proposed Consolidation (7 → 3 Files)

### Keep These Files

1. **`inngest-error-alerting.md`** (Overview + Quick Start)
   - Merge: Summary content
   - Merge: Quick reference
   - Result: Single entry point for error alerting

2. **`inngest-error-alerting-implementation.md`** (Detailed Implementation)
   - Merge: Debug patterns
   - Merge: Checklist
   - Result: Complete implementation guide

3. **`inngest-error-alerting-examples.md`** (Code Examples)
   - Keep as-is
   - Result: Standalone code reference

### Archive These Files

Move to `docs/archive/superseded/`:

- `inngest-error-alerting-debug.md` → Merge into implementation.md
- `inngest-error-alerting-quick-ref.md` → Merge into main .md
- `inngest-error-alerting-summary.md` → Merge into main .md
- `inngest-error-alerting-checklist.md` → Merge into implementation.md

---

## Benefits of Consolidation

✅ **Reduced Duplication** - Single source of truth for each topic
✅ **Easier Maintenance** - Fewer files to keep in sync
✅ **Better Discoverability** - Clear file hierarchy
✅ **Improved Navigation** - Fewer clicks to find information

---

## Implementation Steps

### 1. Content Audit

- [ ] Review all 7 files for unique content
- [ ] Identify duplicate/overlapping sections
- [ ] Create content map showing what goes where

### 2. Merge Content

- [ ] Merge quick-ref into main overview
- [ ] Merge debug patterns into implementation
- [ ] Merge checklist into implementation
- [ ] Merge summary into main overview
- [ ] Preserve all unique examples

### 3. Update Cross-References

- [ ] Update `/docs/features/inngest/README.md`
- [ ] Update internal links within error alerting docs
- [ ] Update any external references from other docs
- [ ] Check QUICK_REFERENCE.md for links

### 4. Archive Old Files

- [ ] Move consolidated files to `docs/archive/superseded/`
- [ ] Add deprecation notice pointing to new locations
- [ ] Update archive README.md

### 5. Validation

- [ ] Run `npm run lint:docs` to check for broken links
- [ ] Verify all examples still work
- [ ] Test navigation from Inngest README

---

## Risks & Mitigation

| Risk                       | Mitigation                                |
| -------------------------- | ----------------------------------------- |
| Content loss during merge  | Create backup branch before consolidation |
| Broken external links      | Search codebase for all references first  |
| User confusion             | Add redirects/notices in archived files   |
| Loss of historical context | Preserve git history, don't delete        |

---

## Current Workaround

**Until consolidation is complete:**

The newly created `/docs/features/inngest/README.md` provides clear navigation to all error alerting docs, organized by category:

- Overview: `inngest-error-alerting.md`
- Debugging: `inngest-error-alerting-implementation.md`
- Implementation: `inngest-error-alerting-implementation.md`

This reduces confusion even with multiple files.

---

## Decision Needed

**Approve consolidation?**

- ✅ **Yes** - Proceed with 7 → 3 consolidation
- ⏸️ **Defer** - Keep current structure, re-evaluate in Q2 2026
- ❌ **No** - Current structure is acceptable

**Recommendation:** Defer to Q2 2026. Current README organization is sufficient.

---

## Related Documentation

- [Inngest README.md](../inngest/README.md) - Navigation to all docs
- [DOCS_GOVERNANCE.md](../../governance/DOCS_GOVERNANCE.md) - Documentation organization principles
- [Archive README.md](../../archive/README.md) - Archive retention policy

---

**Status:** Awaiting decision
**Next Action:** Review in Q2 2026
**Owner:** DCYFR Labs Team
