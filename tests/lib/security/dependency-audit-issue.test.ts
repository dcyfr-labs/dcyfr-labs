import { describe, expect, it, vi } from 'vitest';
import {
  buildSecurityAuditIssue,
  reportSecurityAuditIssue,
  shouldOpenSecurityIssue,
  SECURITY_AUDIT_LABEL,
  SECURITY_AUDIT_LABELS,
  type SecurityIssueClient,
  type VulnerabilityCounts,
} from '@/lib/security/dependency-audit-issue';

const counts = (over: Partial<VulnerabilityCounts> = {}): VulnerabilityCounts => ({
  critical: 0,
  high: 0,
  moderate: 0,
  low: 0,
  info: 0,
  total: 0,
  ...over,
});

const ctx = { branch: 'main', changedFiles: ['package.json', 'package-lock.json'] };

describe('shouldOpenSecurityIssue', () => {
  it('is true for any critical or high', () => {
    expect(shouldOpenSecurityIssue(counts({ critical: 1 }))).toBe(true);
    expect(shouldOpenSecurityIssue(counts({ high: 2 }))).toBe(true);
  });

  it('is false when only moderate/low/info or nothing', () => {
    expect(shouldOpenSecurityIssue(counts({ moderate: 5, low: 9 }))).toBe(false);
    expect(shouldOpenSecurityIssue(counts())).toBe(false);
  });
});

describe('buildSecurityAuditIssue', () => {
  it('summarizes critical and high in the title', () => {
    const issue = buildSecurityAuditIssue(counts({ critical: 2, high: 3 }), ctx);
    expect(issue.title).toBe('🔴 Dependency security: 2 critical / 3 high');
  });

  it('omits the zero severity from the title', () => {
    expect(buildSecurityAuditIssue(counts({ high: 4 }), ctx).title).toBe(
      '🔴 Dependency security: 4 high'
    );
    expect(buildSecurityAuditIssue(counts({ critical: 1 }), ctx).title).toBe(
      '🔴 Dependency security: 1 critical'
    );
  });

  it('includes the counts table, branch, and changed files in the body', () => {
    const { body } = buildSecurityAuditIssue(counts({ critical: 1, high: 2, moderate: 7 }), ctx);
    expect(body).toContain('| Critical | 1 |');
    expect(body).toContain('| High | 2 |');
    expect(body).toContain('| Moderate | 7 |');
    expect(body).toContain('**Branch:** `main`');
    expect(body).toContain('`package.json`');
    expect(body).toContain('`package-lock.json`');
  });

  it('handles an empty changed-files list', () => {
    const { body } = buildSecurityAuditIssue(counts({ critical: 1 }), {
      branch: 'release',
      changedFiles: [],
    });
    expect(body).toContain('**Triggered by changes to:** _n/a_');
  });

  it('applies the dedup + categorization labels', () => {
    expect(buildSecurityAuditIssue(counts({ critical: 1 }), ctx).labels).toEqual(
      SECURITY_AUDIT_LABELS
    );
    expect(SECURITY_AUDIT_LABELS).toContain(SECURITY_AUDIT_LABEL);
  });

  it('is deterministic for the same input', () => {
    const a = buildSecurityAuditIssue(counts({ critical: 1, high: 1 }), ctx);
    const b = buildSecurityAuditIssue(counts({ critical: 1, high: 1 }), ctx);
    expect(a).toEqual(b);
  });
});

describe('reportSecurityAuditIssue', () => {
  const repo = { owner: 'dcyfr-labs', repo: 'dcyfr-labs' };

  function mockClient(over: Partial<SecurityIssueClient> = {}): SecurityIssueClient {
    return {
      listForRepo: vi.fn().mockResolvedValue({ data: [] }),
      create: vi.fn().mockResolvedValue({ data: { number: 42, html_url: 'https://x/42' } }),
      createComment: vi.fn().mockResolvedValue({ data: {} }),
      ...over,
    };
  }

  it('skips entirely when there are no critical/high vulns (no API calls)', async () => {
    const client = mockClient();
    const result = await reportSecurityAuditIssue(client, repo, counts({ moderate: 3 }), ctx);
    expect(result.action).toBe('skipped');
    expect(client.listForRepo).not.toHaveBeenCalled();
    expect(client.create).not.toHaveBeenCalled();
  });

  it('creates a new issue when none is open', async () => {
    const client = mockClient();
    const result = await reportSecurityAuditIssue(client, repo, counts({ critical: 1 }), ctx);
    expect(result).toEqual({ action: 'created', issueNumber: 42, url: 'https://x/42' });
    expect(client.listForRepo).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: 'dcyfr-labs',
        repo: 'dcyfr-labs',
        state: 'open',
        labels: SECURITY_AUDIT_LABEL,
      })
    );
    expect(client.create).toHaveBeenCalledTimes(1);
    expect(client.createComment).not.toHaveBeenCalled();
  });

  it('comments on the existing open issue instead of creating a duplicate', async () => {
    const client = mockClient({
      listForRepo: vi.fn().mockResolvedValue({ data: [{ number: 7 }] }),
    });
    const result = await reportSecurityAuditIssue(client, repo, counts({ high: 5 }), ctx);
    expect(result).toEqual({ action: 'commented', issueNumber: 7 });
    expect(client.create).not.toHaveBeenCalled();
    expect(client.createComment).toHaveBeenCalledWith(
      expect.objectContaining({ issue_number: 7, owner: 'dcyfr-labs', repo: 'dcyfr-labs' })
    );
  });

  it('never throws — returns an error result if the API fails', async () => {
    const client = mockClient({
      listForRepo: vi.fn().mockRejectedValue(new Error('rate limited')),
    });
    const result = await reportSecurityAuditIssue(client, repo, counts({ critical: 1 }), ctx);
    expect(result.action).toBe('error');
    expect(result.reason).toBe('rate limited');
  });
});
