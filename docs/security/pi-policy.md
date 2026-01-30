<!-- TLP:CLEAR -->

# Proprietary Information (PI) & Sensitive Content Policy

**Last Updated:** 2025-12-10

This document defines how the project treats Proprietary Information (PI) and Personally Identifiable Information (PII) and provides practical guidance for authors and contributors.

## Definitions

- **PI (Proprietary Information)** — Information that confers competitive or business advantage and should not be publicly disclosed, per NIST: [Proprietary Information](https://csrc.nist.gov/glossary/term/proprietary_information)
- **PII (Personally Identifiable Information)** — Information that can identify a person (names, emails, phones, SSN, etc.).

### Distinguishing PI and PII

- PI generally includes business-sensitive artifacts such as proprietary agent instruction sets, detailed internal architecture diagrams, revenue models, and any unpublished algorithms or training datasets that reveal competitive advantage.
- PII refers to information that can be used to identify an individual and is protected by privacy laws or internal policies — emails, phone numbers, SSNs, or personal account identifiers.

These classifications drive different handling, detection, and remediation processes:

- Detection: PII is primarily discovered via field-based patterns such as email, phone, SSN, and name detection; PI is often discovered via markers (`PROPRIETARY`/`CONFIDENTIAL`) or by scanning for secret-material patterns (private keys/AWS keys/API keys).
- Allowlists: PII allowlists are conservative, focusing on known test addresses and public placeholders; PI allowlists require a stronger justification and owner approval for docs that define or note 'proprietary' terms.
- Response: PII incidents often trigger privacy incident workflows (redaction, removal, and notification), while PI incidents may involve legal/stakeholder review and may require broader handling depending on business sensitivity.

## Policy

- Do not store PI or PII in this repository. Use secure external storage (e.g., Notion, Google Drive with access controls, encrypted vaults) for drafts or private docs containing PI/PII.
- If a document must be stored in the repo temporarily, add it to `docs/operations/private/` and ensure it is gitignored (see `.gitignore`). Prefer using a secure external store instead.
- Treat proprietary documents as restricted: any change to `docs/ai/agents/` and other proprietary areas requires explicit code review and approval per CODEOWNERS and `APPROVAL_GATES`.

## Examples of PI

- Internal architecture diagrams with proprietary algorithms or routing
- Business process diagrams, revenue models, or unpublished metrics
- Proprietary agent instructions, enforcement rules, or model training details

## IP Address Collection & Handling

**IP addresses are considered PII under GDPR, CCPA, and other privacy regulations.** This section documents how the project collects, uses, and retains IP addresses.

### Legitimate Use Cases

IP addresses are collected **only** for the following security and operational purposes:

1. **Rate Limiting** (`src/lib/rate-limit.ts`, `src/app/api/contact/route.ts`)
   - Purpose: Prevent abuse and protect API endpoints from spam/DoS attacks
   - Method: Extract from `x-forwarded-for` or `x-real-ip` headers
   - Storage: Ephemeral Redis keys with 60-second TTL (rate limit window)
   - Retention: Automatically expired after rate limit window (typically 60 seconds)

2. **Security Monitoring** (`src/proxy.ts`)
   - Purpose: CSP violation tracking and security incident response
   - Method: Extract from request headers for logging context
   - Storage: Development console logs only (not persisted in production)
   - Retention: Not stored; used only for real-time debugging

3. **Abuse Prevention**
   - Purpose: Honeypot field detection, bot identification
   - Method: Used as rate limit identifier
   - Storage: Same as rate limiting (ephemeral, 60s TTL)
   - Retention: No long-term storage

### What We DO NOT Do

- ❌ **No persistent storage**: IPs are never stored in databases or logs beyond the rate limit window
- ❌ **No user profiling**: IPs are not correlated with user accounts, emails, or identity
- ❌ **No analytics tracking**: IPs are not sent to third-party analytics services
- ❌ **No cross-session tracking**: Each rate limit window is independent
- ❌ **No geolocation**: We do not perform IP-to-location lookups

### Retention Policy

| Use Case | Storage Location | Retention Period | Auto-Deletion |
|----------|------------------|------------------|---------------|
| Rate limiting | Redis (in-memory) | 60 seconds | ✅ Automatic (TTL) |
| Dev logging | Console output | Session only | ✅ Not persisted |
| CSP violations | Dev console | Not stored | ✅ N/A |

### Compliance Notes

- **GDPR Article 6(1)(f)**: Legitimate interest basis (security and fraud prevention)
- **CCPA**: IP addresses used solely for security purposes (exempt from sale restrictions)
- **Data Minimization**: Only the minimum necessary IP data is collected (first IP in `x-forwarded-for` chain)
- **Right to Erasure**: Not applicable (data is ephemeral and auto-deleted within 60 seconds)

### Logging Guidelines

IP addresses should **never** be logged in clear text. See [docs/ai/LOGGING_SECURITY.md](../ai/logging-security) for detailed guidelines.

**Correct approach**:

```typescript
// ✅ Log the action, not the IP
console.log('Rate limit applied to request');

// ✅ If debugging is truly needed, mask the IP
const maskedIp = ip.split('.').map((octet, i) => i < 2 ? octet : 'xxx').join('.');
console.log(`Debug: ${maskedIp}`); // Output: "192.168.xxx.xxx"
```

**Incorrect approach**:

```typescript
// ❌ NEVER log full IP addresses
console.log(`Request from IP: ${clientIp}`);
console.error(`Rate limit exceeded for ${ip}`);
```

### Code Locations

For reference, IP address handling code exists in:

- [src/lib/rate-limit.ts:270-285](../../src/lib/rate-limit.ts) - `getClientIp()` function
- [src/app/api/contact/route.ts:68](../../src/app/api/contact/route.ts) - Contact form rate limiting
- [src/proxy.ts:103-217](../../src/proxy.ts) - CSP violation context (dev only)

## Handling Guidance

1. Drafts with PI/PII should be stored in a secure external doc store (Notion, Google Drive, or encrypted repository).
2. If you must keep a copy in this repository for short-term collaboration, add to `docs/operations/private/` and use the template in `docs/operations/private/README.template.md`.
3. Never commit secrets or credentials to the repository; check `.gitignore` for ignored patterns (env, secrets, credentials, private folders).

## Audit & Detection

- Automated checks (pre-commit and CI) will scan commits and pull requests for likely PII/PI.
- Use `npm run scan:pi` locally to test the scan (runs the project's PII/PI checker across staged files).
- Add allowlist entries to `.pii-allowlist.json` if you need to allow common project addresses or test fixtures (e.g., `@dcyfr.ai`, `@example.com`, `src/__tests__/**`). Only allow well-known test or internal addresses — do not add sensitive addresses to the allowlist.

**CI enforcement details**
- The GitHub Action `pii-scan.yml` runs a repository-level PI/PII scan and integrates with `gitleaks` for secret scanning. The pipeline includes these enforcement rules:
	- `gitleaks` runs and generates a JSON report; the pipeline parses the report and will fail the job if critical secrets (e.g., private keys, provisioning keys, AWS access keys) are detected.
	- Allowlist changes are validated in CI using `scripts/validate-allowlist.mjs`; PRs that add new allowlist entries must include `allowlistReasons` or the job fails.
	- The `pii-scan` job posts scan output in PR comments to help authors triage issues.
	- A focused workflow `reports-pii-scan.yml` runs on PRs that add or modify report artifacts (e.g., `playwright-report/`, `coverage/`, `test-results/`) and will fail the PR when the report-specific scanner (`npm run scan:reports`) finds likely PII.

## Automated Remediation

When `gitleaks` detects critical secrets (AWS keys, private keys, API tokens, etc.), an **automated GitHub issue is created** with:

- **Detection details and affected files** - Specific file paths, line numbers, and rule names that triggered the detection
- **Step-by-step remediation checklist** - Including credential rotation, git history cleanup, and secrets management best practices  
- **Links to security policies and documentation** - Direct references to this policy, allowlist documentation, and security guidelines
- **Workflow run information for debugging** - Links to the exact CI run that detected the secrets for troubleshooting

**Important: Do NOT bypass critical secret detection via allowlist without:**

1. **Verifying the secret is truly a placeholder/example** - Confirm it's not real credentials by checking with the service provider or team
2. **Adding detailed justification in `.pii-allowlist.json`** - Include specific reasoning like "Placeholder AWS credentials for API documentation examples"
3. **Getting approval from security contact** - Discuss with `@dcyfr` if there's any uncertainty about whether the secret is legitimate

**Real credentials should NEVER be committed to the repository.** The automated remediation process ensures that:
- Critical security incidents are tracked and resolved systematically
- There's an audit trail of secret detection and remediation steps
- Security best practices are followed consistently across all incidents
- The security team has visibility into all critical secret exposures

The remediation issues are automatically labeled with `security`, `critical`, `gitleaks`, and `automated` for easy filtering and priority management.

## Allowlist Maintenance

- The allowlist is defined in `.pii-allowlist.json`. It supports:
	- `paths`: path prefixes to ignore for non-sensitive checks (email/phone).
	- `proprietaryPaths`: paths where explanatory 'proprietary' text is allowed (e.g., definition pages).
	- `privateKeyPaths`: paths where private-key blocks are expected as placeholders (e.g., sample files) but **must** be redacted or explicitly labeled as `EXAMPLE`/`REDACTED`.
	- `allowlistReasons`: a mapping of path (or domain/email) to a short justification.

- To add an allowlist entry:
	1. Update `.pii-allowlist.json` in a PR and add a `allowlistReasons` entry with a short justification and the approver's handle.
	2. Provide a clear justification in the PR description (why is this required, what is the audit and remediation plan).
	3. Request a review and approval from the security team (`@dcyfr`).

- Allowlisting is reserved for:
	- Documentation definitions and templates (`docs/`) that include placeholder text.
	- Approved test data and example addresses.
	- Additions must never be used to bypass remediation of actual secrets - if a real secret is present it must be removed and rotated.


## Reporting

- If you accidentally committed PI/PII, follow the security incident response steps in `SECURITY.md`: rotate secrets, remove from history, and notify the security contact.

---

This policy augments `SECURITY.md` and the project's logging and data handling rules. If in doubt, escalate to the security owner.
