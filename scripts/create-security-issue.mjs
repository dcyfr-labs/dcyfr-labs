#!/usr/bin/env node

/**
 * Create or update GitHub security advisory issue
 * Used by security-advisory-monitor workflow
 */

import { getOrCreateIssue } from './github-api.mjs';

const summary = process.env.ADVISORY_SUMMARY;
const count = process.env.ADVISORY_COUNT;
const date = new Date().toISOString().split('T')[0];

const body = `## 🚨 Security Advisory Alert - ${date}

**${count} new security advisor(y/ies) detected** for monitored packages.

### Affected Packages

${summary}

### Action Required

1. Review the advisories linked above
2. Check if our current package versions are affected
3. Upgrade affected packages immediately if vulnerable
4. Deploy updated versions to production

### Automated Detection

This issue was created by the Security Advisory Monitor workflow.
- Polling frequency: Every 2 hours (business hours) / 6 hours (overnight)
- Monitored packages: next, react, react-dom, react-server-dom-*

---
<!-- Signature: security-advisory-monitor-${date} -->
`;

try {
  await getOrCreateIssue({
    label: 'security',
    signature: 'security-advisory-monitor-' + date,
    title: '🚨 Security Advisory: ' + count + ' new vulnerabilities detected',
    body,
    labels: ['security', 'priority:critical', 'automated'],
    updateIfExists: true
  });
  console.log('✅ Security issue created/updated successfully');
} catch (error) {
  console.error('❌ Error creating security issue:', error);
  process.exit(1);
}
