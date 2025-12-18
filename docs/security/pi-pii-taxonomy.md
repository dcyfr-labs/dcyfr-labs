# PI vs PII Classification Taxonomy

**Version:** 1.0.0  
**Last Updated:** December 12, 2025  
**Purpose:** Complete reference guide for Personally Identifiable Information (PII) vs Proprietary Information (PI) classification, detection patterns, and handling procedures.

---

## 📋 Overview

This taxonomy defines how dcyfr-labs classifies sensitive data into categories and provides detection patterns for each. The scanner (`check-for-pii.mjs`) uses these patterns to identify and flag potential data leaks.

### Classification Hierarchy

```
┌─────────────────────────────────────────────────────┐
│ SENSITIVE DATA CLASSIFICATION                       │
├─────────────────────────────────────────────────────┤
│                                                     │
├─ PII (Personally Identifiable Information) 👤      │
│  └─ Direct Identifiers                             │
│     └─ Information that directly identifies people │
│                                                     │
└─ PI (Proprietary Information) 🔐                   │
   └─ Business & Technical Secrets                  │
      └─ Information valuable to business            │
                                                     │
```

---

## 🏷️ Category Definitions

### PII (Personally Identifiable Information)

**Definition:** Information that directly identifies or could reasonably identify an individual.

**Scope:** Covered by GDPR, CCPA, HIPAA, COPPA, and similar regulations.

**Key Characteristics:**
- Directly links to a real person
- Could enable re-identification when combined with other data
- Must be protected under law
- Includes both explicit identifiers and quasi-identifiers

**Regulatory Context:**
- **GDPR (EU):** Any information relating to an identified or identifiable natural person
- **CCPA (California):** Information that identifies, relates to, or could be linked to a particular consumer
- **HIPAA (Healthcare):** Protected health information linked to individuals

---

### PI (Proprietary Information)

**Definition:** Information that provides competitive advantage and must be protected for business reasons.

**Scope:** Covered by trade secret laws, contractual agreements, and business policies.

**Key Characteristics:**
- Valuable to business operations
- Not necessarily personally identifying
- Loss creates competitive disadvantage
- Includes technical, business, and operational secrets

**Examples:**
- API keys and authentication tokens
- Private cryptographic keys
- Unreleased product features
- Customer lists and databases
- Internal documentation and roadmaps

---

## 📊 Classification Matrix

| Category | Severity | Examples | Regulations | Action |
|----------|----------|----------|-------------|--------|
| **PII - Direct Identifiers** | CRITICAL | SSN, email, phone number | GDPR, CCPA, HIPAA | BLOCK |
| **PII - Government IDs** | CRITICAL | Passport, driver's license, tax ID | GDPR, CCPA | BLOCK |
| **PII - Biometric** | CRITICAL | Fingerprint, face scan, DNA | GDPR, CCPA | BLOCK |
| **PII - Financial** | CRITICAL | Credit card, bank account, routing number | PCI-DSS, GDPR, CCPA | BLOCK |
| **PII - Health/Medical** | CRITICAL | Diagnosis, medication, medical record | HIPAA, GDPR, CCPA | BLOCK |
| **PII - Location** | HIGH | Home address, GPS coordinates, geofence data | GDPR, CCPA | BLOCK |
| **PII - Device/Online** | HIGH | IP address logged, device ID, fingerprinting | GDPR, CCPA | BLOCK |
| **PI - Auth Credentials** | CRITICAL | API keys, OAuth tokens, JWT, passwords | Internal | BLOCK |
| **PI - Cryptographic Keys** | CRITICAL | Private keys (RSA, EC, OpenSSH) | Internal, Legal | BLOCK |
| **PI - API Endpoints** | HIGH | Internal URLs, private services, endpoints | Internal | REVIEW |
| **PI - Business Secrets** | HIGH | Proprietary algorithms, trade secrets | Internal, Legal | REVIEW |
| **PI - Technical Details** | MEDIUM | Architecture, service names, token formats | Internal | WARN |
| **PI - Customer Data** | HIGH | Customer IDs, transaction IDs, account numbers | Internal, Legal | REVIEW |

---

## 🔍 Detection Patterns

### PII Patterns (Personally Identifiable Information)

#### 1. **Email Addresses** 
| Aspect | Details |
|--------|---------|
| **Pattern Name** | email |
| **Classification** | PII |
| **Severity** | HIGH |
| **Regex** | `/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g` |
| **False Positive Risk** | Medium (obfuscated/example emails common in docs) |
| **Allowlist Strategy** | Domain-based (e.g., `allowlist.emailDomains: ["example.com"]`) |
| **Example Match** | `user@example.com`, `test.user+tag@domain.co.uk` |
| **Context** | Often acceptable in docs for examples if domain is allowlisted |

#### 2. **Phone Numbers**
| Aspect | Details |
|--------|---------|
| **Pattern Name** | phone |
| **Classification** | PII |
| **Severity** | HIGH |
| **Regex** | `` /(?:\+?\d{1,3}[-.\s]?)?(?:\(\d{3}\)\|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}/g `` |
| **False Positive Risk** | Medium (epoch timestamps, ZIP codes) |
| **Allowlist Strategy** | Path-based (e.g., `allowlist.piPaths: ["docs/examples/**"]`) |
| **Example Match** | `+1 (555) 123-4567`, `555.123.4567`, `(555) 123 4567` |
| **Filtering** | Filters epoch timestamps (1600000000-2000000000) and placeholder sequences |

#### 3. **Social Security Numbers (SSN)**
| Aspect | Details |
|--------|---------|
| **Pattern Name** | ssn |
| **Classification** | PII |
| **Severity** | CRITICAL |
| **Regex** | `` /\b\d{3}-\d{2}-\d{4}\b/g `` |
| **False Positive Risk** | Low (specific pattern) |
| **Allowlist Strategy** | Rarely applicable; should never appear |
| **Example Match** | `123-45-6789` (hypothetical) |
| **Note** | Never acceptable in code or docs; always block |

#### 4. **IP Address Logging**
| Aspect | Details |
|--------|---------|
| **Pattern Name** | ip_logging |
| **Classification** | PII |
| **Severity** | HIGH |
| **Regex** | `/console\.(log\|error\|warn\|info\|debug)\([^)]*\$\{[^}]*\b(clientIp\|ipAddress\|ip\|realIp\|forwardedIp\|remoteIp)\b/gi` |
| **False Positive Risk** | Low (specific console patterns) |
| **Allowlist Strategy** | Document explicitly if logging is necessary with anonymization |
| **Example Match** | `console.log(`Client IP: ${clientIp}`)` |
| **Regulatory Context** | GDPR/CCPA: Logging IPs without user consent is problematic |
| **Note** | Code-only pattern; not checked in documentation |

---

### PI Patterns (Proprietary Information)

#### 1. **AWS Access Keys**
| Aspect | Details |
|--------|---------|
| **Pattern Name** | aws_key |
| **Classification** | PI |
| **Severity** | CRITICAL |
| **Regex** | `` /AKIA[0-9A-Z]{16}/g `` |
| **False Positive Risk** | Extremely low (AWS-specific format) |
| **Allowlist Strategy** | Not applicable; should never appear |
| **Example Match** | `AKIA2EXAMPLE1234` (hypothetical) |
| **Note** | Only AKIA format (standard access keys); does not match secret access keys (must be caught via other means) |

#### 2. **Private Cryptographic Keys**
| Aspect | Details |
|--------|---------|
| **Pattern Name** | private_key |
| **Classification** | PI |
| **Severity** | CRITICAL |
| **Regex** | `/-----BEGIN (RSA \|EC \|OPENSSH \|ENCRYPTED )?PRIVATE KEY-----/g` |
| **False Positive Risk** | Low (specific format) |
| **Allowlist Strategy** | Path-based for documentation (must include "EXAMPLE", "REDACTED", etc. markers) |
| **Formats Matched** | RSA, EC, OpenSSH, encrypted PEM blocks |
| **Example Match** | `-----BEGIN RSA PRIVATE KEY-----` |
| **Note** | Checks surrounding context for placeholder markers; logs warnings for allowlisted docs without markers |

---

### PI Patterns (Additional / Expanded)

#### 3. **API Keys and Service Tokens** (NEW - Expansion)
| Aspect | Details |
|--------|---------|
| **Pattern Name** | api_key |
| **Classification** | PI |
| **Severity** | CRITICAL |
| **Regex Variants** | Multiple patterns for different services |
| **Scope** | Generic API key patterns (not service-specific) |
| **False Positive Risk** | Medium-High (many services use "API" in legitimate contexts) |
| **Allowlist Strategy** | Service-based allowlist; domain/service context detection |
| **Example Matches** | API_KEY=xyz..., api_key: "secret", Bearer token assignments |
| **Note** | Requires careful filtering to avoid false positives in configuration examples |

#### 4. **OAuth and JWT Tokens** (NEW - Expansion)
| Aspect | Details |
|--------|---------|
| **Pattern Name** | oauth_token, jwt_token |
| **Classification** | PI |
| **Severity** | CRITICAL |
| **Regex Variants** | OAuth 2.0 tokens, JWT Bearer tokens, refresh tokens |
| **Scope** | Bearer tokens, access tokens, refresh tokens |
| **False Positive Risk** | Low-Medium (distinctive JWT format) |
| **Allowlist Strategy** | Path-based for examples; context detection for test fixtures |
| **Example Matches** | `Bearer eyJhbGciOiJIUzI1NiIs...` (JWT structure) |
| **Note** | JWT format is distinctive (3 base64 parts); easier to validate |

#### 5. **Database Connection Strings** (NEW - Expansion)
| Aspect | Details |
|--------|---------|
| **Pattern Name** | db_connection_string |
| **Classification** | PI |
| **Severity** | CRITICAL |
| **Regex Variants** | Multiple for different databases (PostgreSQL, MongoDB, MySQL, Redis, etc.) |
| **Scope** | Credentials embedded in connection URIs |
| **False Positive Risk** | Medium (example connection strings are common in docs) |
| **Allowlist Strategy** | Path-based for documentation; require `example.com`, `localhost`, placeholder hostnames |
| **Example Matches** | `postgresql://user:pass@host:5432/db`, `mongodb+srv://user:pass@cluster...` |
| **Note** | Should detect credentials in URI; filter for common example placeholders |

#### 6. **Business Identifiers - Customer IDs** (NEW - Expansion)
| Aspect | Details |
|--------|---------|
| **Pattern Name** | customer_id |
| **Classification** | PI |
| **Severity** | MEDIUM |
| **Regex Pattern** | Service-specific or numeric pattern heuristics |
| **Scope** | Numeric or UUID-based customer identifiers |
| **False Positive Risk** | High (many legitimate numeric sequences) |
| **Allowlist Strategy** | Context-based; require proximity to customer/account keywords |
| **Example Matches** | `customer_id: 12345678`, `CUST-2024-001234` |
| **Note** | Requires context detection to minimize false positives |

#### 7. **Business Identifiers - Order/Transaction Numbers** (NEW - Expansion)
| Aspect | Details |
|--------|---------|
| **Pattern Name** | order_number, transaction_id |
| **Classification** | PI |
| **Severity** | MEDIUM |
| **Regex Pattern** | Contextual patterns: ORD-, TXN-, TRANS-, prefixed numbers |
| **Scope** | Order tracking and transaction identifiers |
| **False Positive Risk** | Medium (contextual matching required) |
| **Allowlist Strategy** | Require example/placeholder context (e.g., `ORD-2024-EXAMPLE`) |
| **Example Matches** | `ORD-2024-001234`, `TXN-987654321`, `invoice_id: INV-2024-056` |
| **Note** | Context detection essential; many false positives in generic code |

#### 8. **Business Identifiers - Account Numbers** (NEW - Expansion)
| Aspect | Details |
|--------|---------|
| **Pattern Name** | account_number |
| **Classification** | PI |
| **Severity** | MEDIUM |
| **Regex Pattern** | Account-specific patterns, may overlap with credit card detection |
| **Scope** | Financial and business account identifiers |
| **False Positive Risk** | High (overlaps with ZIP codes, model numbers, etc.) |
| **Allowlist Strategy** | Keyword context: "account", "account_no", "acct" |
| **Example Matches** | `account_number: 98765432`, `acct: ACC-12345678` |
| **Note** | Requires strong contextual validation |

#### 9. **Proprietary Code/Feature Markers** (NEW - Expansion)
| Aspect | Details |
|--------|---------|
| **Pattern Name** | proprietary_marker |
| **Classification** | PI |
| **Severity** | MEDIUM |
| **Regex** | `/\b(PROPRIETARY\|CONFIDENTIAL\|PROPRIETARY INFORMATION\|TRADE SECRET\|DO NOT SHARE)\b/gi` |
| **False Positive Risk** | Very low (explicit markers) |
| **Allowlist Strategy** | Path-based for documentation of policies |
| **Example Match** | `[CONFIDENTIAL] Project Codename`, `TRADE SECRET: Algorithm` |
| **Note** | Flags explicit proprietary markers; already implemented but documented here |

---

## 📍 Allowlist Configuration

The `.pii-allowlist.json` file controls which patterns are allowed in specific paths and contexts.

### Structure

```json
{
  "emailDomains": [
    "example.com",
    "test.local",
    "placeholder.dev"
  ],
  "emails": [
    "user@example.com",
    "test@test.local"
  ],
  "paths": [
    "docs/**",
    "examples/**",
    "tests/__fixtures__/**"
  ],
  "piiPaths": [
    "docs/security/**",
    "tests/__fixtures__/user-data/**"
  ],
  "piPaths": [
    "docs/architecture/**",
    "docs/api/**",
    "tests/__fixtures__/configs/**"
  ],
  "proprietaryPaths": [
    "docs/security/**",
    "docs/internal/**"
  ],
  "privateKeyPaths": [
    "certs/**",
    "docs/security/key-examples/**"
  ],
  "allowlistReasons": {
    "docs/security/PI_PII_TAXONOMY.md": "Reference documentation for classification system",
    "tests/__fixtures__/configs/": "Test fixtures require example credentials",
    "certs/": "Development certificates; non-production keys"
  }
}
```

### Allowlist Categories

| Category | Purpose | Common Paths |
|----------|---------|--------------|
| **emailDomains** | Email domains allowed in PII scanning | `["example.com", "test.local"]` |
| **emails** | Specific email addresses allowed | `["user@example.com"]` |
| **paths** | General paths where PII/PI patterns may appear | `["docs/**", "examples/**"]` |
| **piiPaths** | Paths where PII patterns are acceptable (with justification) | `["docs/security/**"]` |
| **piPaths** | Paths where PI patterns are acceptable | `["docs/architecture/**"]` |
| **proprietaryPaths** | Paths containing proprietary information | `["docs/internal/**"]` |
| **privateKeyPaths** | Paths containing key examples/documentation | `["certs/**", "docs/**"]` |
| **allowlistReasons** | Justification map for allowlisted patterns | `{"path": "reason"}` |

---

## 🚀 Implementation Patterns

### Pattern Implementation Template

```javascript
{
  name: "pattern_name",
  classification: 'PII' | 'PI',
  regex: /regex_pattern/g,
  message: "Human-readable description of what was matched",
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM', // Optional, defaults to classification-based
  codeOnly: true | false,  // Optional, only check in code files
  contentOnly: true | false, // Optional, only check in content/docs files
  contextFilter: function(match, surroundingText) {
    // Optional: Return false to exclude this match
  }
}
```

### Filter Strategy

Each pattern can define a filter function to reduce false positives:

```javascript
// Example: Filter epoch timestamps from phone pattern
if (t.name === 'phone') {
  matches = matches.filter(m => {
    const digits = m.replace(/[^0-9]/g, '');
    const value = Number(digits);
    if (value >= 1600000000 && value <= 2000000000) return false; // Skip epoch
    return true;
  });
}
```

### Context Detection

For patterns with high false-positive risk, use surrounding context:

```javascript
// Example: API key requires "api" keyword nearby
const surrounding = content.slice(
  Math.max(0, content.indexOf(m) - 100),
  content.indexOf(m) + m.length + 100
);
const isLikelyApiKey = /\bapi\b|api_key|apikey|authorization/i.test(surrounding);
if (!isLikelyApiKey) return false;
```

---

## 📚 Classification Decision Tree

```
START: Detected pattern
  │
  ├─ Is it a person-specific identifier? (name, email, phone, SSN, etc.)
  │  └─ YES → PII (CRITICAL/HIGH)
  │     └─ Protected by GDPR, CCPA, HIPAA, etc.
  │
  ├─ Is it a secret/credential? (key, token, password, etc.)
  │  └─ YES → PI (CRITICAL)
  │     └─ Protects business operations
  │
  ├─ Is it business data? (customer ID, order number, etc.)
  │  └─ YES → PI (MEDIUM/HIGH)
  │     └─ Proprietary business information
  │
  ├─ Is it marked as proprietary/confidential?
  │  └─ YES → PI (MEDIUM)
  │     └─ Explicit business classification
  │
  └─ Is it in an allowlisted path with justification?
     └─ YES → May skip, but log warning if not marked
     └─ NO → FLAG as sensitive data leak
```

---

## 🔄 Maintenance & Updates

### When to Add New Patterns

- New service integrations expose new credential formats
- New regulatory requirements emerge
- False positive patterns identified in scanning results
- Business classification rules change

### When to Adjust Allowlist

- Documentation examples need sensitive data
- Test fixtures require real-world patterns
- Development certificates stored in repo
- Temporary allowances during refactoring

### Reviewing Allowlist

```bash
# Check what's currently in allowlist
cat .pii-allowlist.json | jq '.paths, .piiPaths, .piPaths'

# Find all patterns flagged recently
npm run test:pii -- --all | tail -20

# Audit allowlist usage
npm run lint:pii-audit
```

---

## 🛡️ Best Practices

1. **Default Deny**: If unsure, block patterns
2. **Context First**: Use surrounding text to reduce false positives
3. **Justify Allowlisting**: Always provide reason in `allowlistReasons`
4. **Regular Audits**: Monthly review of allowlist entries
5. **Test Fixtures**: Use `__fixtures__/` for sensitive test data
6. **Documentation**: Explicitly mark example data as EXAMPLE/REDACTED
7. **Monitoring**: Track detection patterns over time

---

## 📖 Related Documentation

- `.pii-allowlist.json` - Configuration file
- `scripts/check-for-pii.mjs` - Scanner implementation
- `tests/scripts/check-for-pii.test.ts` - Test suite
- DCYFR Security Guide - Security best practices

---

**Status:** Production Ready v1.0  
**Scope:** dcyfr-labs PII/PI detection and classification  
**Maintained By:** Security Team

For pattern updates, see [DCYFR.agent.md](../../.github/agents/dcyfr.agent) enforcement rules.
