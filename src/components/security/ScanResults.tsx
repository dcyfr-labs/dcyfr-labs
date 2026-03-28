'use client';

/**
 * ScanResults
 *
 * Displays the output of a completed prompt security scan:
 * - Overall score / severity badge
 * - Remediation summary
 * - Findings table with filtering by severity and sorting by severity/confidence/category
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SPACING, TYPOGRAPHY, HOVER_EFFECTS } from '@/lib/design-tokens';
import type {
  ScanResult,
  ScanFinding,
  FindingSeverityFilter,
  FindingSortKey,
  SortDirection,
} from '@/lib/security/scan-types';

// ─── Severity helpers ─────────────────────────────────────────────────────────

const SEVERITY_RANK: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  safe: 0,
};

const SEVERITY_BADGE_CLASS: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  safe: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBadge({ riskScore, severity }: { riskScore: number; severity: string }) {
  const cls = SEVERITY_BADGE_CLASS[severity] ?? SEVERITY_BADGE_CLASS.low;
  return (
    <div className="flex items-center gap-3">
      <span className="text-3xl font-bold tabular-nums">{riskScore}</span>
      <span className="text-muted-foreground text-sm">/100</span>
      <Badge className={cls}>{severity.toUpperCase()}</Badge>
    </div>
  );
}

interface FindingRowProps {
  finding: ScanFinding;
}

function FindingRow({ finding }: FindingRowProps) {
  const cls = SEVERITY_BADGE_CLASS[finding.severity] ?? '';
  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-2 pr-4">
        <Badge className={cls}>{finding.severity}</Badge>
      </td>
      <td className="py-2 pr-4 text-sm font-medium">{finding.category}</td>
      <td className="py-2 pr-4 text-sm text-muted-foreground font-mono break-all max-w-xs">
        {finding.pattern}
      </td>
      <td className="py-2 pr-4 text-sm tabular-nums">{Math.round(finding.confidence * 100)}%</td>
      <td className="py-2 text-sm text-muted-foreground capitalize">{finding.source}</td>
    </tr>
  );
}

// ─── Filtering and sorting ────────────────────────────────────────────────────

function filterAndSort(
  findings: ScanFinding[],
  severityFilter: FindingSeverityFilter,
  sortKey: FindingSortKey,
  sortDir: SortDirection
): ScanFinding[] {
  const filtered =
    severityFilter === 'all' ? findings : findings.filter((f) => f.severity === severityFilter);

  return [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'severity') {
      cmp = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
    } else if (sortKey === 'confidence') {
      cmp = b.confidence - a.confidence;
    } else if (sortKey === 'category') {
      cmp = a.category.localeCompare(b.category);
    }
    return sortDir === 'desc' ? cmp : -cmp;
  });
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ScanResultsProps {
  scan: ScanResult;
}

export function ScanResults({ scan }: ScanResultsProps) {
  const [severityFilter, setSeverityFilter] = useState<FindingSeverityFilter>('all');
  const [sortKey, setSortKey] = useState<FindingSortKey>('severity');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  const findings = scan.findings ?? [];

  const displayedFindings = useMemo(
    () => filterAndSort(findings, severityFilter, sortKey, sortDir),
    [findings, severityFilter, sortKey, sortDir]
  );

  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const f of findings) counts[f.severity] = (counts[f.severity] ?? 0) + 1;
    return counts;
  }, [findings]);

  function toggleSort(key: FindingSortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const severityOptions: FindingSeverityFilter[] = ['all', 'critical', 'high', 'medium', 'low'];

  return (
    <div className={SPACING.content}>
      {/* Score card */}
      <Card>
        <CardHeader>
          <CardTitle className={TYPOGRAPHY.h3.standard}>Scan Results</CardTitle>
        </CardHeader>
        <CardContent className={SPACING.content}>
          {scan.safe !== undefined && scan.riskScore !== undefined && scan.severity && (
            <ScoreBadge riskScore={scan.riskScore} severity={scan.severity} />
          )}

          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mt-4">
            <div>
              <dt className="text-muted-foreground">Safe</dt>
              <dd className="font-medium">{scan.safe ? 'Yes' : 'No'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Findings</dt>
              <dd className="font-medium">{findings.length}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Attempts</dt>
              <dd className="font-medium">{scan.attempts}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Completed</dt>
              <dd className="font-medium">
                {scan.completedAt ? new Date(scan.completedAt).toLocaleTimeString() : '—'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Remediation summary */}
      {scan.remediationSummary && (
        <Card>
          <CardHeader>
            <CardTitle className={TYPOGRAPHY.h4.mdx}>Remediation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap font-sans text-muted-foreground">
              {scan.remediationSummary}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Findings table */}
      {findings.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <CardTitle className={TYPOGRAPHY.h4.mdx}>
                Findings ({displayedFindings.length}/{findings.length})
              </CardTitle>

              {/* Severity filter pills */}
              <div className="flex flex-wrap gap-2">
                {severityOptions.map((opt) => {
                  const count = opt === 'all' ? findings.length : (severityCounts[opt] ?? 0);
                  const active = severityFilter === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setSeverityFilter(opt)}
                      className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                        active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : `border-border bg-background text-muted-foreground ${HOVER_EFFECTS.button}`
                      }`}
                    >
                      {opt} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                    {(
                      [
                        { key: 'severity', label: 'Severity' },
                        { key: 'category', label: 'Category' },
                      ] as { key: FindingSortKey; label: string }[]
                    ).map(({ key, label }) => (
                      <th key={key} className="pb-2 pr-4">
                        <button
                          onClick={() => toggleSort(key)}
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          {label}
                          {sortKey === key && (
                            <span className="ml-1">{sortDir === 'desc' ? '↓' : '↑'}</span>
                          )}
                        </button>
                      </th>
                    ))}
                    <th className="pb-2 pr-4">Pattern</th>
                    <th className="pb-2 pr-4">
                      <button
                        onClick={() => toggleSort('confidence')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Confidence
                        {sortKey === 'confidence' && (
                          <span className="ml-1">{sortDir === 'desc' ? '↓' : '↑'}</span>
                        )}
                      </button>
                    </th>
                    <th className="pb-2">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedFindings.map((f) => (
                    <FindingRow key={f.id} finding={f} />
                  ))}
                  {displayedFindings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-sm text-muted-foreground">
                        No findings match the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
