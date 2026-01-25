# Governance Documentation Hub

**Purpose:** Centralized governance policies for documentation, data, and AI agent security.

## Governance Policies

### 1. Documentation Governance

**File:** [DOCS_GOVERNANCE.md](DOCS_GOVERNANCE.md)

**Scope:** Public vs private documentation classification, TLP standards, organizational structure, maintenance schedules

**Key Policies:**

- "TLP:CLEAR by Default, Private When Necessary"
- Traffic Light Protocol (TLP) classification system
- Subdirectory-specific `private/` folders (docs/\*/private/)
- Automated validation scripts enforce compliance
- Quarterly review and cleanup cycles

**Guardrails:**

- [DOCUMENTATION_GUARDRAILS.md](DOCUMENTATION_GUARDRAILS.md) - Automated validation guide
- [DOCUMENTATION_GUARDRAILS_IMPLEMENTATION.md](DOCUMENTATION_GUARDRAILS_IMPLEMENTATION.md) - Implementation summary
- `npm run check:docs` - Validate TLP compliance and location

**Last Updated:** January 24, 2026

---

### 2. Data Governance

**File:** [data-governance-policy.md](data-governance-policy.md)

**Scope:** Analytics data collection, privacy compliance, retention policies

**Key Policies:**

- View counts: Redis-stored, session-based (no PII)
- Web Vitals: Vercel Analytics (aggregated only)
- Retention: 90-day rolling window for analytics
- Privacy: GDPR-compliant, no tracking across sites

**Last Updated:** November 22, 2025

---

### 3. AI Agent Security Governance

**File:** [AGENT-SECURITY-GOVERNANCE.md](AGENT-SECURITY-GOVERNANCE.md)

**Scope:** AI assistant access controls, tool permissions, security protocols

**Key Policies:**

- Tool approval gates for sensitive operations
- Sandboxed execution environments
- Secrets management (environment variables only)
- Audit logging for all AI actions

**Last Updated:** December 21, 2025

---

## Change Management

### Proposing Governance Changes

1. **Document rationale** - Why is the change needed?
2. **Draft proposal** - Create PR with updated governance file
3. **Review period** - Minimum 48 hours for stakeholder feedback
4. **Approval** - Requires project owner approval
5. **Implementation** - Update docs, scripts, CI/CD to reflect changes

### Version Control

All governance documents follow semantic versioning:

- **Major (1.0 → 2.0):** Breaking changes to policy
- **Minor (1.0 → 1.1):** New policies, significant additions
- **Patch (1.0.0 → 1.0.1):** Clarifications, typo fixes

## Compliance Checklist

Before committing changes:

- [ ] Run automated validation: `npm run check:docs`
- [ ] All public docs have TLP:CLEAR markers
- [ ] Operational files in `docs/*/private/` subdirectories
- [ ] No documentation files outside `docs/` directory
- [ ] Sensitive files in correct `/private/` location
- [ ] No credentials in code
- [ ] Large files (>5MB) justified
- [ ] Design tokens used (no hardcoded values)
- [ ] Test data excluded from production

**Automated validation:**

```bash
npm run check:docs               # Run all documentation validation
npm run validate:tlp              # TLP compliance only
npm run validate:doc-location     # Location validation only
```

See [DOCUMENTATION_GUARDRAILS.md](DOCUMENTATION_GUARDRAILS.md) for complete validation guide.

## Compliance Metrics

**Current Status (January 24, 2026):**

- TLP Classification: 705/705 files passing (100%) ✅
- Location Compliance: 100% (0 violations) ✅
- Errors: 0 ✅
- Warnings: 11 (private files with TLP:CLEAR markers)
- Overall Status: ✅ **100% COMPLIANCE ACHIEVED**

**Achievement:** Automated validation scripts achieved error-free compliance. 332 files received TLP:CLEAR markers via bulk automation, and 11 operational files were relocated to private/ subdirectories.

Run `npm run check:docs` for latest compliance status.

## Contact

**Questions about governance?**

- Documentation: Review [DOCS_GOVERNANCE.md](DOCS_GOVERNANCE.md)
- Data/Analytics: Review [data-governance-policy.md](data-governance-policy.md)
- AI/Security: Review [AGENT-SECURITY-GOVERNANCE.md](AGENT-SECURITY-GOVERNANCE.md)

**Need clarification?** Open an issue or create a PR with proposed policy amendment.
