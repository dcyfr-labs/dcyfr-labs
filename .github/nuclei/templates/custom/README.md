# DCYFR Custom Nuclei Templates

**Purpose:** DCYFR-specific security templates for Nuclei vulnerability scanner

## Overview

This directory contains custom Nuclei templates tailored for dcyfr-labs infrastructure and technology stack. These templates complement the 11,000+ community templates from [projectdiscovery/nuclei-templates](https://github.com/projectdiscovery/nuclei-templates).

## Template Inventory

### Next.js Security (`nextjs-security.yaml`)

**Severity:** High
**Checks:**
- ✅ X-Powered-By header removal
- ✅ Security headers (CSP, X-Frame-Options, HSTS)
- ✅ Source map exposure
- ✅ Protected middleware routes

**Target:** All Next.js 16 routes

### Vercel Misconfiguration (`vercel-misconfig.yaml`)

**Severity:** Medium
**Checks:**
- ✅ Exposed Vercel configuration files
- ✅ Deployment metadata leakage
- ✅ Environment variable exposure
- ✅ Deployment Protection status

**Target:** Vercel deployment endpoints

### Redis Upstash Exposure (`redis-exposure.yaml`)

**Severity:** Critical
**Checks:**
- ✅ Exposed Redis connection strings
- ✅ Credential leakage
- ✅ Unauthenticated Redis endpoints
- ✅ Configuration file exposure

**Target:** Redis API routes (`/api/redis`, `/api/cache`, `/api/analytics`)

### Inngest Security (`inngest-security.yaml`)

**Severity:** High
**Checks:**
- ✅ Webhook signature verification
- ✅ Unauthorized event submission
- ✅ Event schema exposure
- ✅ Signing key leakage

**Target:** Inngest webhook endpoint (`/api/inngest`)

## Template Development

### Creating a New Template

```bash
# 1. Create template file
cd .github/nuclei/templates/custom
touch my-new-template.yaml

# 2. Use existing template as reference
cp nextjs-security.yaml my-new-template.yaml

# 3. Edit template (see Template Structure below)
```

### Template Structure

```yaml
id: dcyfr-template-name

info:
  name: Human-Readable Template Name
  author: dcyfr-security
  severity: [info|low|medium|high|critical]
  description: What this template checks for
  reference:
    - https://docs.example.com/security
  tags: custom,dcyfr,category
  classification:
    cvss-metrics: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N
    cvss-score: 5.3
    cwe-id: CWE-XXX

http:
  - method: GET
    path:
      - "{{BaseURL}}/endpoint"

    matchers:
      - type: status
        status:
          - 200

      - type: word
        part: body
        words:
          - "vulnerability-indicator"
```

### Testing Templates

**Local Testing:**

```bash
# Test individual template
nuclei -t nextjs-security.yaml -target https://dcyfr.dev -debug

# Test all custom templates
nuclei -t ./ -target https://dcyfr.dev -json -o test-results.json
```

**Validate Syntax:**

```bash
# Validate template YAML
nuclei -t my-new-template.yaml -validate

# Expected output:
# ✅ [my-new-template] validated successfully
```

## Template Guidelines

### DO ✅

- ✅ Use descriptive template IDs (`dcyfr-component-check`)
- ✅ Include CVSS scores for severity justification
- ✅ Reference official security documentation
- ✅ Test against preview environment first
- ✅ Use negative matchers to avoid false positives
- ✅ Extract useful information (headers, versions)

### DON'T ❌

- ❌ Use intrusive/destructive tests
- ❌ Include DoS techniques
- ❌ Hardcode credentials or secrets
- ❌ Use excessive requests (rate limits)
- ❌ Scan third-party services
- ❌ Duplicate community templates

## Template Severity Guide

| Severity | CVSS Score | Use When                          | Examples                     |
|----------|------------|-----------------------------------|------------------------------|
| Critical | 9.0-10.0   | Complete system compromise        | Credential exposure, RCE     |
| High     | 7.0-8.9    | Significant security impact       | Auth bypass, data exposure   |
| Medium   | 4.0-6.9    | Moderate security risk            | Info disclosure, misconfig   |
| Low      | 0.1-3.9    | Minor security concerns           | Version disclosure           |
| Info     | 0.0        | Informational only                | Tech fingerprinting          |

## Integration with CI/CD

Custom templates are automatically loaded in `.github/workflows/nuclei-scan.yml`:

```yaml
- name: Run Nuclei vulnerability scan
  run: |
    nuclei \
      -target "$SCAN_TARGET" \
      -config .github/nuclei/config.yaml \
      -templates .github/nuclei/templates/ \  # Includes custom/
      -json -output nuclei-results.json
```

## Maintenance

### Monthly Review

- [ ] Review scan results for false positives
- [ ] Update matchers based on infrastructure changes
- [ ] Retire outdated templates
- [ ] Add templates for new services

### When to Update

- 🔄 New service/API endpoint added
- 🔄 Security header policy changes
- 🔄 Framework version upgrade (Next.js, Vercel)
- 🔄 New vulnerability pattern discovered

## References

- **Nuclei Docs:** https://docs.projectdiscovery.io/nuclei
- **Template Guide:** https://nuclei.projectdiscovery.io/templating-guide/
- **Community Templates:** https://github.com/projectdiscovery/nuclei-templates
- **CVSS Calculator:** https://www.first.org/cvss/calculator/3.1

---

**Last Updated:** February 1, 2026
**Maintainer:** DCYFR Security Team
