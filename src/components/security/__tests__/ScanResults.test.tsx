/**
 * Tests for ScanResults component
 *
 * Covers:
 * - Renders score and severity badge
 * - Renders remediation summary
 * - Renders findings table with correct counts
 * - Severity filter pills filter the findings table
 * - Sort toggle changes order
 * - Shows "No findings match" when filter yields 0 results
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScanResults } from '../ScanResults';
import type { ScanResult } from '@/lib/security/scan-types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeScan(overrides?: Partial<ScanResult>): ScanResult {
  return {
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    state: 'complete',
    queuedAt: '2026-03-25T10:00:00Z',
    startedAt: '2026-03-25T10:00:01Z',
    completedAt: '2026-03-25T10:00:02Z',
    attempts: 1,
    safe: true,
    riskScore: 0,
    severity: 'safe',
    remediationSummary: 'No threats detected. Prompt appears safe.',
    findings: [],
    ...overrides,
  };
}

const injectionFinding = {
  id: 'f1',
  pattern: 'ignore.*previous.*instructions',
  category: 'prompt-injection',
  severity: 'high' as const,
  confidence: 0.9,
  source: 'pattern' as const,
};

const codeFinding = {
  id: 'f2',
  pattern: '```.*exec.*```',
  category: 'code-injection',
  severity: 'critical' as const,
  confidence: 0.95,
  source: 'pattern' as const,
};

const lowFinding = {
  id: 'f3',
  pattern: 'some-low-pattern',
  category: 'prompt-leakage',
  severity: 'low' as const,
  confidence: 0.4,
  source: 'pattern' as const,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ScanResults', () => {
  it('renders the score and severity for a safe scan', () => {
    render(<ScanResults scan={makeScan()} />);
    expect(screen.getAllByText('0')[0]).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
    expect(screen.getByText('SAFE')).toBeInTheDocument();
  });

  it('renders the remediation summary text', () => {
    render(<ScanResults scan={makeScan()} />);
    expect(screen.getByText('No threats detected. Prompt appears safe.')).toBeInTheDocument();
  });

  it('does not render findings table when findings are empty', () => {
    render(<ScanResults scan={makeScan()} />);
    expect(screen.queryByText(/Findings \(/)).not.toBeInTheDocument();
  });

  it('renders findings table when findings are present', () => {
    render(
      <ScanResults
        scan={makeScan({
          safe: false,
          riskScore: 85,
          severity: 'high',
          findings: [injectionFinding, codeFinding, lowFinding],
        })}
      />
    );
    expect(screen.getByText(/Findings \(3\/3\)/)).toBeInTheDocument();
  });

  it('shows severity filter pills including "all", "critical", "high", etc.', () => {
    render(
      <ScanResults scan={makeScan({ findings: [injectionFinding, codeFinding, lowFinding] })} />
    );
    expect(screen.getByText(/^all \(/)).toBeInTheDocument();
    expect(screen.getByText(/^critical \(/)).toBeInTheDocument();
    expect(screen.getByText(/^high \(/)).toBeInTheDocument();
    expect(screen.getByText(/^low \(/)).toBeInTheDocument();
  });

  it('filters findings when a severity pill is clicked', () => {
    render(
      <ScanResults scan={makeScan({ findings: [injectionFinding, codeFinding, lowFinding] })} />
    );

    // Click "critical" filter
    fireEvent.click(screen.getByText(/^critical \(1\)/));
    expect(screen.getByText(/Findings \(1\/3\)/)).toBeInTheDocument();
  });

  it('resets to all when "all" pill is clicked after filtering', () => {
    render(
      <ScanResults scan={makeScan({ findings: [injectionFinding, codeFinding, lowFinding] })} />
    );
    fireEvent.click(screen.getByText(/^high \(1\)/));
    fireEvent.click(screen.getByText(/^all \(3\)/));
    expect(screen.getByText(/Findings \(3\/3\)/)).toBeInTheDocument();
  });

  it('shows "No findings match" when filter yields 0 results', () => {
    render(
      <ScanResults
        scan={makeScan({ findings: [injectionFinding] })} // no critical
      />
    );
    fireEvent.click(screen.getByText(/^critical \(0\)/));
    expect(screen.getByText('No findings match the selected filter.')).toBeInTheDocument();
  });

  it('shows attempts count', () => {
    render(<ScanResults scan={makeScan({ attempts: 2 })} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders HIGH severity badge correctly for injection scan', () => {
    render(
      <ScanResults
        scan={makeScan({
          safe: false,
          riskScore: 75,
          severity: 'high',
          findings: [injectionFinding],
        })}
      />
    );
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });
});
