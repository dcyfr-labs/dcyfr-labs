/**
 * Dependency security audit → GitHub issue
 *
 * Turns an `npm audit` result into a deduplicated GitHub tracking issue:
 * one open issue at a time (labelled), updated with a comment on subsequent
 * runs rather than spamming a new issue per audit.
 *
 * The issue-building helpers are pure (no IO, deterministic) so they can be
 * unit-tested; the reporter takes an injected client so it is testable without
 * hitting the GitHub API.
 */

/** Vulnerability counts as produced by `npm audit --json` metadata. */
export interface VulnerabilityCounts {
  critical: number;
  high: number;
  moderate: number;
  low: number;
  info: number;
  total: number;
}

/** Context about what triggered the audit. */
export interface SecurityAuditContext {
  branch: string;
  changedFiles: string[];
}

/** Label used to find the single open tracking issue (dedup key). */
export const SECURITY_AUDIT_LABEL = 'dependency-security';

/** Labels applied to a newly-created tracking issue. */
export const SECURITY_AUDIT_LABELS = [SECURITY_AUDIT_LABEL, 'security', 'dependencies'];

/**
 * Minimal slice of `@octokit/rest`'s `octokit.rest.issues` that the reporter
 * uses. Declaring it locally keeps the reporter trivially mockable in tests;
 * the real Octokit client satisfies it structurally.
 */
export interface SecurityIssueClient {
  listForRepo(params: {
    owner: string;
    repo: string;
    state: 'open';
    labels: string;
    per_page?: number;
  }): Promise<{ data: Array<{ number: number }> }>;
  create(params: {
    owner: string;
    repo: string;
    title: string;
    body: string;
    labels: string[];
  }): Promise<{ data: { number: number; html_url: string } }>;
  createComment(params: {
    owner: string;
    repo: string;
    issue_number: number;
    body: string;
  }): Promise<{ data: unknown }>;
}

export type SecurityIssueAction = 'created' | 'commented' | 'skipped' | 'error';

export interface SecurityIssueResult {
  action: SecurityIssueAction;
  issueNumber?: number;
  url?: string;
  reason?: string;
}

/**
 * Whether an audit result warrants a tracking issue.
 * Critical or high severity only — moderate/low are tracked on the dashboard.
 */
export function shouldOpenSecurityIssue(vulns: VulnerabilityCounts): boolean {
  return vulns.critical > 0 || vulns.high > 0;
}

/**
 * Build a GitHub issue (title/body/labels) for an audit result.
 *
 * Pure and deterministic — no timestamps or environment reads — so the same
 * audit always yields the same issue, which keeps tests stable and avoids
 * noisy diffs when the reporter updates an existing issue.
 */
export function buildSecurityAuditIssue(
  vulns: VulnerabilityCounts,
  context: SecurityAuditContext
): { title: string; body: string; labels: string[] } {
  const parts: string[] = [];
  if (vulns.critical > 0) parts.push(`${vulns.critical} critical`);
  if (vulns.high > 0) parts.push(`${vulns.high} high`);
  const headline = parts.join(' / ') || 'vulnerabilities';

  const title = `🔴 Dependency security: ${headline}`;

  const changed =
    context.changedFiles.length > 0
      ? context.changedFiles.map((f) => `\`${f}\``).join(', ')
      : '_n/a_';

  const body = [
    '## 🔴 Dependency security alert',
    '',
    '`npm audit` surfaced high-impact dependency vulnerabilities that need attention.',
    '',
    '| Severity | Count |',
    '| --- | --- |',
    `| Critical | ${vulns.critical} |`,
    `| High | ${vulns.high} |`,
    `| Moderate | ${vulns.moderate} |`,
    `| Low | ${vulns.low} |`,
    '',
    `**Branch:** \`${context.branch}\``,
    `**Triggered by changes to:** ${changed}`,
    '',
    'Run `npm audit` locally to inspect, then `npm audit fix` (or bump the affected packages) to remediate.',
    '',
    '<sub>Opened automatically by the `dependency-security-audit` Inngest function. Subsequent audits comment here instead of opening duplicates.</sub>',
  ].join('\n');

  return { title, body, labels: SECURITY_AUDIT_LABELS };
}

/**
 * Create or update the dependency-security tracking issue.
 *
 * - No-op (`skipped`) when there are no critical/high vulnerabilities.
 * - Comments on the existing open issue (found by {@link SECURITY_AUDIT_LABEL})
 *   when one is present — one tracking issue at a time, no per-run spam.
 * - Creates a new issue otherwise.
 * - Never throws: any API failure is caught and returned as `error` so the
 *   caller's audit step stays best-effort.
 */
export async function reportSecurityAuditIssue(
  client: SecurityIssueClient,
  repo: { owner: string; repo: string },
  vulns: VulnerabilityCounts,
  context: SecurityAuditContext
): Promise<SecurityIssueResult> {
  if (!shouldOpenSecurityIssue(vulns)) {
    return { action: 'skipped', reason: 'no critical or high vulnerabilities' };
  }

  const { title, body, labels } = buildSecurityAuditIssue(vulns, context);

  try {
    const existing = await client.listForRepo({
      owner: repo.owner,
      repo: repo.repo,
      state: 'open',
      labels: SECURITY_AUDIT_LABEL,
      per_page: 1,
    });

    if (existing.data.length > 0) {
      const issueNumber = existing.data[0].number;
      await client.createComment({
        owner: repo.owner,
        repo: repo.repo,
        issue_number: issueNumber,
        body,
      });
      return { action: 'commented', issueNumber };
    }

    const created = await client.create({
      owner: repo.owner,
      repo: repo.repo,
      title,
      body,
      labels,
    });
    return { action: 'created', issueNumber: created.data.number, url: created.data.html_url };
  } catch (error) {
    console.error('[Security Audit] Failed to create/update GitHub issue:', error);
    return {
      action: 'error',
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}
