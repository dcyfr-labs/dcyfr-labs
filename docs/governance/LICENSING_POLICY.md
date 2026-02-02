# Licensing Policy

**Owner:** DCYFR Labs
**Last Updated:** February 2, 2026
**Status:** Active

---

## Overview

DCYFR uses a **dual-licensing model** to balance open source accessibility with sustainable business development.

**Philosophy:** Code should be free for personal use and learning, while commercial use generates revenue to fund continued development.

---

## License Structure

### Public Packages (@dcyfr/ai, @dcyfr/ai-nodejs, @dcyfr/ai-sandbox)

**Base License:** MIT License
**Commercial License:** Required for business use (Developer tier+)

**Reasoning:**
- Maximize adoption and community growth
- Enable students, hobbyists, and researchers to use freely
- Monetize commercial and enterprise deployments

### Private Packages (@dcyfr/agents)

**License:** Proprietary
**Access:** Founder tier and above only ($2,400+/year)

**Reasoning:**
- Protect proprietary security IP and validation logic
- Maintain competitive advantage in quality enforcement
- Exclusive value for premium tiers

### Application (dcyfr-labs)

**Code:** MIT License (personal/non-commercial)
**Documentation:** CC BY-SA 4.0 (`/docs/` directory)
**DCYFR Specs:** Proprietary (`.ai/`, `.claude/`, `.github/agents/`)

**Reasoning:**
- Multi-tier protection for different asset types
- Documentation shareable with attribution
- Proprietary specs protect business methodology

---

## Commercial Use Definition

**Commercial use** = revenue-generating or business-context use

### ✅ Requires Commercial License

- **SaaS products / web services** with revenue
- **Companies with >5 employees** using DCYFR
- **Paid consulting/services** using DCYFR
- **Commercial product distribution** including DCYFR
- **Government or enterprise** deployments

### ❌ MIT License Sufficient

- **Personal projects** (no revenue)
- **Educational use** (students, teachers, coursework)
- **Open source projects** (non-commercial)
- **Evaluation/testing** (pre-production)
- **Small startups** (<5 employees, <$1M revenue - contact for startup program)

---

## Enforcement

### Discovery

Monitor for commercial use without license through:
- GitHub star analysis
- npm download patterns
- Web scraping for "Powered by DCYFR"
- Issue/discussion patterns indicating commercial use

### Compliance Process

1. **Discovery** → Identify potential unlicensed commercial use
2. **Contact** → Friendly outreach to potential violators
3. **Education** → Explain licensing model and options
4. **Compliance** → Offer licensing options with grace period
5. **Legal** → Pursue violations if necessary (rare, last resort)

**Philosophy:** We prefer to work with users to get compliant rather than pursue legal action. Most violations are accidental.

---

## Licensing Tiers

### 👨‍💻 Developer Tier (Pricing TBD)

**License:** Limited Commercial Use License

- Single commercial project
- Pre-release builds
- Implementation support
- No redistribution rights

**Target:** Freelancers, indie developers

### 🚀 Founder Tier ($2,400/year)

**License:** Full Commercial Use License

- Unlimited commercial projects (single entity)
- Production deployment rights
- 1 hour/month consultation services
- Priority support

**Target:** Startups, growing businesses

### 💼 Executive Tier ($4,800/year)

**License:** Business Commercial Use License

- All Founder benefits
- Multi-project deployment
- 2 hours/month consultation
- Up to 50 employees

**Target:** Established businesses, agencies

### 🏢 Enterprise Tier ($9,600/year)

**License:** Enterprise Commercial Use License

- All Executive benefits
- Unlimited projects and employees
- 4 hours/month consultation
- Enterprise SLA
- Custom licensing terms available

**Target:** Large enterprises, government

---

## Compliance Checks

### Internal Audit

Teams should verify licensing compliance:

- [ ] All dependencies properly licensed
- [ ] Commercial use properly licensed
- [ ] Trademark usage follows TRADEMARK.md
- [ ] Attribution requirements met (for CC BY-SA content)

### Dependency Licensing

When adding dependencies to DCYFR packages:

1. **Check license compatibility** - MIT, Apache 2.0, BSD are safe
2. **Avoid GPL/AGPL** - Copyleft licenses may conflict with dual licensing
3. **Document exceptions** - Any non-MIT dependencies require approval
4. **Update package.json** - Ensure license field is accurate

### Contributor Agreements

Future consideration: Implement Contributor License Agreement (CLA) for @dcyfr/ai if external contributions grow significantly.

**Rationale:** CLA ensures DCYFR Labs retains rights to:
- Relicense code if needed
- Offer commercial licenses without contributor consent
- Protect against patent claims from contributors

---

## Trademark Policy Integration

**Trademark protection is separate from copyright:**

- Code is MIT-licensed (open source)
- "DCYFR" trademark is NOT open
- Users can fork code but must rename project
- Cannot use "DCYFR" name/logo without permission

See [TRADEMARK.md](../../TRADEMARK.md) for full policy.

---

## Startup Program

**Eligibility:**
- <5 employees
- <$1M annual revenue
- Funded <$500K total

**Benefits:**
- Free Founder tier for 1 year
- 50% discount on renewal
- Early access to new features
- Startup community access

**Application:** Contact licensing@dcyfr.ai with "Startup Program" in subject

---

## Questions & Contact

**Policy questions:** legal@dcyfr.ai
**Licensing compliance:** licensing@dcyfr.ai
**Commercial sales:** sales@dcyfr.ai
**Enterprise inquiries:** enterprise@dcyfr.ai

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-02 | Initial licensing policy |
