/**
 * Tests for ScanStatusPoller component
 *
 * Covers:
 * - Shows loading state initially
 * - Calls fetch with correct URL
 * - Transitions to ScanResults on complete state
 * - Shows error card on failed state
 * - Shows error on fetch failure
 * - Calls onComplete callback when scan reaches terminal state
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ScanStatusPoller } from '../ScanStatusPoller';
import type { ScanResult } from '@/lib/security/scan-types';

// ─── Mock fetch ───────────────────────────────────────────────────────────────

function mockFetchResponse(data: ScanResult) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data }),
  } as Response);
}

function mockFetchError(message: string) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status: 404,
    json: async () => ({ error: message }),
  } as unknown as Response);
}

function queuedScan(): ScanResult {
  return {
    id: 'test-scan-id',
    state: 'queued',
    queuedAt: '2026-03-25T10:00:00Z',
    attempts: 0,
  };
}

function completeScan(): ScanResult {
  return {
    id: 'test-scan-id',
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
  };
}

function failedScan(): ScanResult {
  return {
    id: 'test-scan-id',
    state: 'failed',
    queuedAt: '2026-03-25T10:00:00Z',
    attempts: 3,
    error: 'Scan timed out',
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ScanStatusPoller', () => {
  const scanId = 'test-scan-id';

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {})); // never resolves
    render(<ScanStatusPoller scanId={scanId} />);
    expect(screen.getByText(/Queued|Running|waiting|analysis/i)).toBeInTheDocument();
  });

  it('fetches the correct URL', async () => {
    global.fetch = mockFetchResponse(completeScan());
    render(<ScanStatusPoller scanId={scanId} apiBase="/api/security-scans" />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/security-scans/${scanId}`,
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
    });
  });

  it('renders ScanResults when scan is complete', async () => {
    global.fetch = mockFetchResponse(completeScan());
    render(<ScanStatusPoller scanId={scanId} />);
    await waitFor(() => {
      expect(screen.getByText('Scan Results')).toBeInTheDocument();
    });
  });

  it('shows error card when scan fails', async () => {
    global.fetch = mockFetchResponse(failedScan());
    render(<ScanStatusPoller scanId={scanId} />);
    await waitFor(() => {
      expect(screen.getByText('Scan Failed')).toBeInTheDocument();
      expect(screen.getByText('Scan timed out')).toBeInTheDocument();
    });
  });

  it('shows error when fetch returns non-ok response', async () => {
    global.fetch = mockFetchError('Not found');
    render(<ScanStatusPoller scanId={scanId} />);
    await waitFor(() => {
      expect(screen.getByText('Scan Failed')).toBeInTheDocument();
      expect(screen.getByText('Not found')).toBeInTheDocument();
    });
  });

  it('calls onComplete when scan reaches complete state', async () => {
    const onComplete = vi.fn();
    global.fetch = mockFetchResponse(completeScan());
    render(<ScanStatusPoller scanId={scanId} onComplete={onComplete} />);
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ state: 'complete' }));
    });
  });

  it('calls onComplete when scan reaches failed state', async () => {
    const onComplete = vi.fn();
    global.fetch = mockFetchResponse(failedScan());
    render(<ScanStatusPoller scanId={scanId} onComplete={onComplete} />);
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ state: 'failed' }));
    });
  });

  it('continues polling when scan is still queued', async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(async () => {
      callCount++;
      const scan = callCount >= 2 ? completeScan() : queuedScan();
      return { ok: true, json: async () => ({ data: scan }) } as Response;
    });

    render(<ScanStatusPoller scanId={scanId} />);

    await waitFor(
      () => {
        expect(screen.getByText('Scan Results')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    expect(callCount).toBeGreaterThanOrEqual(2);
  });
});
