---
name: Critical Secret Detected by Gitleaks
about: Automated issue for critical secret detection requiring immediate remediation
labels: security, critical, gitleaks, automated
assignees: drew
---

## 🚨 Critical Secret Detected

Gitleaks has detected critical secrets in the repository that require immediate remediation.

### Detection Details

This automated scan found secrets matching critical patterns (AWS keys, private keys, API tokens, etc.). These must be rotated and removed from git history immediately.

### Affected Files

See the workflow run link below for detailed list of files and line numbers.

### Remediation Checklist

- [ ] **Rotate Credentials**
  - [ ] Identify the exposed secret type (AWS key, API token, private key, etc.)
  - [ ] Generate new credentials via the appropriate service
  - [ ] Update environment variables/secrets in Vercel, GitHub Actions, or other services
  - [ ] Verify new credentials work correctly before removing old ones
  - [ ] Document what was exposed in this issue for audit trail

- [ ] **Remove from Git History**

  Choose the appropriate method based on your situation:

  ```bash
  # Option 1: BFG Repo-Cleaner (recommended for large repos)
  # Install: npm install -g bfg
  bfg --replace-text passwords.txt
  git reflog expire --expire=now --all
  git gc --prune=now --aggressive
  ```

  ```bash
  # Option 2: git filter-branch (for specific files)
  git filter-branch --force --index-filter \
    'git rm --cached --ignore-unmatch PATH_TO_SECRET_FILE' \
    --prune-empty --tag-name-filter cat -- --all
  ```

- [ ] **Update Secrets Management**
  - [ ] Ensure secret is stored in secure vault (not committed)
  - [ ] Add file path to `.gitignore` if it contains secrets
  - [ ] Use environment variables or GitHub Secrets for runtime values
  - [ ] Update `.pii-allowlist.json` ONLY if this is a legitimate placeholder/example (with detailed reason)
  - [ ] Never commit real secrets; use service-provided secure storage

- [ ] **Verify Remediation**
  - [ ] Run `npm run parse:gitleaks-report` locally to confirm no detection
  - [ ] Verify service access still works with new credentials
  - [ ] Check that the secret is fully removed from git history (`git log -S <secret>`)

- [ ] **Post-Incident Review**
  - [ ] Document how the secret was accidentally committed (was it human error, CI issue, etc?)
  - [ ] Update security practices or pre-commit hooks if needed to prevent recurrence
  - [ ] Close this issue with remediation summary

### References

- [PI/PII Policy & Security Guidelines](../../docs/security/private/pi-policy.md)
- [Security Findings & Action Items](../../docs/security/FINDINGS_AND_ACTION_ITEMS.md)
- [PII Allowlist Documentation](../../.pii-allowlist.json)
- [Gitleaks Documentation](https://github.com/gitleaks/gitleaks)
- [OWASP Credential Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

### Important Notes

🚨 **Do NOT bypass this detection via allowlist without:**

1. Verifying the secret is truly a placeholder/example (not real credentials)
2. Adding detailed justification in `.pii-allowlist.json` with specific reason (e.g., "Placeholder AWS credentials for API documentation")
3. Discussing with security contact if unsure

⚠️ **Real credentials should NEVER be in the repository.** If you're unsure whether something is a placeholder or real credential, treat it as real and remediate.

---

_Automated by `pii-scan` workflow • See workflow run link below for details_
