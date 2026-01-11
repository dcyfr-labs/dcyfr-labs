# Governance Documentation Hub

**Purpose:** Centralized governance policies for documentation, data, and AI agent security.

## Governance Policies

### 1. Documentation Governance
**File:** [DOCS_GOVERNANCE.md](DOCS_GOVERNANCE.md)

**Scope:** Public vs private documentation classification, organizational structure, maintenance schedules

**Key Policies:**
- "Shift Left, Assume Private" - default to private, move to public after review
- Distributed `private/` folders (co-located with topics)
- Pre-commit hooks enforce sensitive file placement
- Quarterly review and cleanup cycles

**Last Updated:** December 15, 2025

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
- [ ] Sensitive files in correct `/private/` location
- [ ] No credentials in code
- [ ] Large files (>5MB) justified
- [ ] Design tokens used (no hardcoded values)
- [ ] Test data excluded from production

See [.husky/pre-commit](../../../.husky/pre-commit) for automated checks.

## Contact

**Questions about governance?**
- Documentation: Review [DOCS_GOVERNANCE.md](DOCS_GOVERNANCE.md)
- Data/Analytics: Review [data-governance-policy.md](data-governance-policy.md)
- AI/Security: Review [AGENT-SECURITY-GOVERNANCE.md](AGENT-SECURITY-GOVERNANCE.md)

**Need clarification?** Open an issue or create a PR with proposed policy amendment.
