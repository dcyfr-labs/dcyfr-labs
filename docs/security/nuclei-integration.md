<!-- TLP:CLEAR -->

# Nuclei External Vulnerability Scanning Integration

## Overview

[ProjectDiscovery Nuclei](https://github.com/projectdiscovery/nuclei) is integrated into our CI/CD pipeline for **external vulnerability scanning** of production infrastructure. This complements our existing internal security tools:

- **CodeQL**: Static code analysis for internal vulnerabilities
- **Semgrep**: SAST scanning for code patterns
- **npm audit**: Dependency vulnerability scanning
- **Nuclei**: External runtime vulnerability detection ← **NEW**

### Deployment Environments

- **Production**: `https://dcyfr.ai` (main branch) - Public deployment, primary scan target
- **Preview**: `https://dcyfr.dev` (preview branch) - Password-protected staging environment

**Default scan target**: Production (`dcyfr.ai`)

**Authentication:**

- Production (`dcyfr.ai`) - No password protection, scans directly
- Preview (`dcyfr.dev`) - Protected via Vercel Deployment Protection, requires bypass token

## What Nuclei Scans For

Nuclei uses **11,000+ community-maintained templates** to detect:

### Critical Vulnerabilities
- **CVEs**: Known vulnerabilities (3,288 templates)
- **RCE**: Remote code execution (786 templates)
- **Authentication Bypass**: Auth/session issues
- **SQL Injection**: Database vulnerabilities
- **XSS**: Cross-site scripting (1,257 templates)

### Exposure & Misconfiguration
- **Exposed Admin Panels** (1,342 templates)
- **Sensitive Data Exposure** (1,107 templates)
- **Cloud Misconfigurations**: AWS, GCP, Azure
- **API Security Issues**: REST/GraphQL vulnerabilities
- **SSL/TLS Issues**: Certificate and protocol problems

### OWASP Top 10
- **Injection Attacks**: SQLi, XSS, LDAP, etc.
- **Broken Authentication**: Session management
- **Security Misconfiguration**: Headers, CORS, CSP
- **Sensitive Data Exposure**: Info leaks
- **XML External Entities (XXE)**
- **Broken Access Control**: IDOR, privilege escalation

## How It Works

### Automatic Scanning

1. **On Production Deploy** (workflow_run trigger)
   - Triggers after successful `deploy.yml` workflow
   - Scans `https://dcyfr.ai` (production) immediately after deployment
   - Creates GitHub issues for critical/high vulnerabilities
   - **No authentication needed** - production is publicly accessible

2. **Daily Scheduled Scan** (3 AM UTC)
   - Catches newly disclosed vulnerabilities
   - Uses latest template updates (250+ new templates/month)
   - Full production infrastructure scan (`dcyfr.ai`)
   - Scans public deployment directly

3. **Manual Trigger** (workflow_dispatch)
   - Ad-hoc security testing
   - Custom target URL support
   - Severity threshold configuration

### Vercel Deployment Protection

**Architecture:**

- **Production (`dcyfr.ai`)**: Public deployment, no password protection
  - Scanned directly without authentication
  - Accessible to Nuclei, search engines, users

- **Preview (`dcyfr.dev`)**: Password-protected via Vercel Deployment Protection
  - Requires `VERCEL_AUTOMATION_BYPASS_SECRET` for automated scans
  - Prevents unauthorized access during staging/testing
  - Bypass token automatically applied when scanning `.dev` URLs

**How bypass works (preview only):**

```bash
# Production - direct access (no bypass):
nuclei -target https://dcyfr.ai  ✅ Works

# Preview - requires bypass token:
nuclei -target https://dcyfr.dev  ❌ Blocked (401/403)
nuclei -target "https://dcyfr.dev?x-vercel-protection-bypass=${SECRET}"  ✅ Works
```

**Required GitHub Secret:**

- `VERCEL_AUTOMATION_BYPASS_SECRET` - Already configured
- Used for: Preview scans (`.dev`), Lighthouse CI on previews, deployment checks
- **Only applied to preview URLs** - production scans directly

**Workflow Logic:**

```bash
# Workflow automatically detects deployment type:
if URL contains ".dev":
  Add bypass token to URL
elif URL contains ".ai":
  Scan directly (public deployment)
```

### Scan Configuration

**File**: [`.nuclei-config.yaml`](../../.nuclei-config.yaml)

```yaml
# Performance
rate-limit: 150 req/s
concurrency: 25
timeout: 10s

# Severity
severity: [medium, high, critical]
exclude-severity: [info]  # Too noisy

# Tags
include: [cve, exposure, misconfiguration, owasp, vulnerability]
exclude: [intrusive, dos, fuzzing]  # Avoid destructive tests
```

### Issue Creation Logic

**Auto-creates GitHub issues for:**

- ✅ **Critical severity**: Always creates individual issues
- ✅ **High severity**: Always creates individual issues
- ✅ **Medium severity (5+)**: Creates summary issue
- ❌ **Low/Info**: Logged in artifacts only

**Issue Labels:**
- `security` - Security-related issue
- `nuclei` - Created by Nuclei scanner
- `severity:critical` / `severity:high` / `severity:medium`
- `external-scan` - External vulnerability (not code)

## Viewing Scan Results

### GitHub Actions

1. Go to **Actions** → **Nuclei External Vulnerability Scan**
2. Click latest workflow run
3. View **Summary** for overview
4. Download **artifacts** for full JSON results

### GitHub Issues

Filter by labels:
- `label:security label:nuclei` - All Nuclei findings
- `label:severity:critical` - Critical vulnerabilities
- `label:external-scan` - External vulnerabilities only

### Artifacts

Each scan produces:
- `nuclei-results.json` - Full vulnerability details (90-day retention)
- `nuclei-report.md` - Human-readable summary

## Security Gate

**Workflow fails if:**
- Critical vulnerabilities detected
- High-severity vulnerabilities found (warning only)

This prevents merging code that introduces critical external vulnerabilities.

## Manual Scanning

### Run via GitHub Actions UI

1. Go to **Actions** → **Nuclei External Vulnerability Scan**
2. Click **Run workflow**
3. Configure:
   - **Target URL**: Custom URL (default: production)
   - **Severity Threshold**: `medium` | `high` | `critical`
   - **Create Issues**: `true` | `false`

### Run Locally

```bash
# Install Nuclei
brew install nuclei  # macOS
# or: wget https://github.com/projectdiscovery/nuclei/releases/latest/download/nuclei_3.3.7_linux_amd64.zip

# Update templates
nuclei -update-templates

# Scan production (public - no bypass needed)
nuclei -target https://dcyfr.ai \
  -severity medium,high,critical \
  -exclude-severity info \
  -json -output results.json \
  -tags cve,exposure,misconfiguration,owasp

# Scan preview environment (password-protected - requires bypass)
export BYPASS_SECRET="your-vercel-bypass-secret"  # From GitHub Settings → Secrets
nuclei -target "https://dcyfr.dev?x-vercel-protection-bypass=${BYPASS_SECRET}" \
  -config .nuclei-config.yaml

# ⚠️ Preview without bypass secret will fail:
# nuclei -target https://dcyfr.dev  ← This will FAIL (401/403)
```

## Template Management

### Updating Templates

Templates auto-update in the workflow via:
```bash
nuclei -update-templates
```

**Community stats:**
- 11,000+ templates
- 900+ contributors
- 250+ new templates/month

### Custom Templates

Create custom templates in `.github/nuclei-templates/`:

```yaml
# .github/nuclei-templates/custom-check.yaml
id: custom-security-check

info:
  name: Custom Security Check
  author: dcyfr-labs
  severity: medium
  description: Project-specific vulnerability check

http:
  - method: GET
    path:
      - "{{BaseURL}}/api/custom-endpoint"

    matchers:
      - type: word
        words:
          - "sensitive-data"
        condition: and

      - type: status
        status:
          - 200
```

Load custom templates:
```bash
nuclei -target https://dcyfr.dev -t .github/nuclei-templates/
```

## Comparison to Other Tools

| Tool | Type | Coverage | Speed | False Positives |
|------|------|----------|-------|-----------------|
| **CodeQL** | SAST | Code-level | Slow | Medium |
| **Semgrep** | SAST | Code patterns | Fast | Low |
| **npm audit** | SCA | Dependencies | Fast | Low |
| **Nuclei** | DAST | External runtime | Fast | Very Low |

**Key advantages of Nuclei:**
1. **Active Exploitation**: Validates vulnerabilities by attempting safe exploitation
2. **Rapid Updates**: New CVE templates within hours/days (not months)
3. **Multi-Protocol**: HTTP, DNS, TCP, SSL (not just web apps)
4. **Zero Cost**: Open-source, no vendor lock-in
5. **Community-Driven**: 11,000+ templates from security researchers

## Compliance & Reporting

### Two-Tier Scanning Strategy

We use a hybrid approach combining **open-source Nuclei** (GitHub Actions) with **ProjectDiscovery Cloud Platform (PDCP) free tier** for compliance:

| Aspect | Open-Source Nuclei (Primary) | PDCP Free Tier (Compliance) |
| ------ | ---------------------------- | ---------------------------- |
| **Frequency** | Daily + on-deploy | Monthly |
| **Target** | Production (`dcyfr.ai`) | Production (`dcyfr.ai`) |
| **Cost** | Free (unlimited) | Free (1 scan/month) |
| **Purpose** | Continuous security monitoring | Compliance reporting |
| **Reports** | GitHub artifacts (JSON) | Professional PDF reports |
| **Issue Tracking** | Auto-create GitHub issues | Cloud dashboard |
| **Audit Trail** | 90-day artifact retention | Cloud history |

### Using PDCP Free Tier for Compliance

**Why use PDCP for compliance?**

- Professional vulnerability reports (PDF format)
- Cloud-based audit trail (permanent history)
- Meets SOC 2/PCI DSS "quarterly scan" requirement
- Executive-friendly dashboards and summaries

**Setup (one-time):**

1. **Sign up for PDCP Free Tier**
   - Visit: <https://cloud.projectdiscovery.io>
   - Sign up with your business email (`@dcyfr.ai`)
   - Confirms free scans for `dcyfr.ai` domain

2. **Configure Monthly Scan**
   - Add asset: `https://dcyfr.ai`
   - Set schedule: Monthly (beginning of month)
   - No authentication needed (production is public)

3. **Download Monthly Reports**
   - Login to PDCP dashboard
   - Navigate to Reports → Monthly Scans
   - Download PDF for compliance records
   - Store in: `docs/private/compliance/nuclei-reports/YYYY-MM.pdf`

**Compliance Workflow:**

```bash
# Monthly (automated via PDCP):
1. PDCP runs scheduled scan on dcyfr.ai
2. Generates professional vulnerability report
3. Archives in cloud dashboard

# Quarterly (manual compliance review):
1. Download last 3 monthly reports from PDCP
2. Review critical/high findings status
3. Document remediation in compliance tracker
4. Include in SOC 2/PCI DSS audit package
```

### SOC 2 / ISO 27001

Nuclei scans support compliance requirements:

- **Quarterly Security Scans** (DCF-18): Daily automated (Nuclei) + monthly professional (PDCP)
- **Vulnerability Management**: Auto-issue creation + tracking
- **Remediation Tracking**: GitHub issue workflow
- **Audit Trail**: 90-day GitHub artifacts + permanent PDCP history

### PCI DSS

**Requirement 11.2**: External vulnerability scanning

- ✅ Automated quarterly scans (monthly PDCP for compliance reporting)
- ✅ Post-deployment scans (daily Nuclei for rapid detection)
- ✅ Documented remediation process (GitHub issues)
- ✅ Risk-based severity classification
- ✅ Professional scan reports (PDCP PDF exports)

## Troubleshooting

### Authentication Errors (401/403)

**Symptom**: Nuclei can't access preview deployment, returns authentication errors

**Cause**: Missing or incorrect Vercel bypass secret (only affects `.dev` preview scans)

**Solution**:

```bash
# Verify secret is configured in GitHub Actions
# Settings → Secrets and variables → Actions → Repository secrets
# Look for: VERCEL_AUTOMATION_BYPASS_SECRET

# Test bypass locally (preview only):
curl -I "https://dcyfr.dev?x-vercel-protection-bypass=${SECRET}"
# Should return 200 OK, not 401/403

# Production should work without bypass:
curl -I "https://dcyfr.ai"
# Should return 200 OK (public deployment)

# Check workflow logs for preview scans:
"✅ Using Vercel automation bypass secret for password-protected preview deployment"

# For production scans:
"✅ Scanning public production deployment (no bypass needed)"
```

### No Vulnerabilities Found

**Expected** - means no known vulnerabilities detected. This is good!

If you expect findings:

1. Check target URL is accessible (with bypass secret!)
2. Verify templates updated: `nuclei -version`
3. Review severity threshold setting
4. Check excluded tags/templates

### Rate Limiting / Timeout Errors

Adjust in [`.nuclei-config.yaml`](../../.nuclei-config.yaml):

```yaml
rate-limit: 100        # Reduce from 150
timeout: 15            # Increase from 10
retries: 2             # Increase from 1
```

### False Positives

**Nuclei has very low false positives** due to active exploitation.

If you encounter one:
1. Review the vulnerability evidence
2. Verify manually: `curl -v https://dcyfr.dev/path`
3. Exclude template if confirmed false positive:
   ```yaml
   exclude-templates:
     - path/to/false-positive-template.yaml
   ```

### Workflow Fails on Low-Severity Findings

Workflow only fails on **critical** vulnerabilities. Check:

```yaml
# In nuclei-scan.yml
SEVERITY_THRESHOLD: 'medium'  # Adjust to 'high' or 'critical'
```

## Integration with Other Tools

### Sentry Integration

Send Nuclei findings to Sentry:

```javascript
// scripts/security/nuclei-to-sentry.mjs
import * as Sentry from '@sentry/node';
import fs from 'fs';

const results = JSON.parse(fs.readFileSync('nuclei-results.json', 'utf-8'));

results.forEach(vuln => {
  if (vuln.info.severity === 'critical' || vuln.info.severity === 'high') {
    Sentry.captureException(new Error(`Nuclei: ${vuln.info.name}`), {
      level: vuln.info.severity === 'critical' ? 'error' : 'warning',
      tags: {
        scanner: 'nuclei',
        template: vuln.templateID,
        severity: vuln.info.severity
      },
      extra: {
        matched: vuln.matched,
        description: vuln.info.description
      }
    });
  }
});
```

### Axiom Logging

Send scan metrics to Axiom:

```bash
# In GitHub Actions
curl -X POST "https://api.axiom.co/v1/datasets/security-scans/ingest" \
  -H "Authorization: Bearer $AXIOM_TOKEN" \
  -H "Content-Type: application/json" \
  -d @nuclei-results.json
```

Query in Axiom:
```apl
['security-scans']
| where scanner == "nuclei"
| summarize count() by severity, bin_auto(_time)
```

## Resources

- **Nuclei Documentation**: https://docs.projectdiscovery.io/tools/nuclei
- **Template Repository**: https://github.com/projectdiscovery/nuclei-templates
- **Community Discord**: https://discord.gg/projectdiscovery
- **Template Contributions**: https://github.com/projectdiscovery/nuclei-templates/blob/main/CONTRIBUTING.md

## Maintenance

### Monthly Tasks

- [ ] Review open Nuclei issues
- [ ] Update template exclusions if needed
- [ ] Review scan performance metrics
- [ ] Validate compliance reports

### Quarterly Tasks

- [ ] Security audit of scan configuration
- [ ] Review custom template effectiveness
- [ ] Update Nuclei version if major release
- [ ] Compliance report generation

---

**Maintained by**: Security Team
**Last Updated**: December 25, 2025
**Workflow**: [`.github/workflows/nuclei-scan.yml`](../../.github/workflows/nuclei-scan.yml)
