'use client';

/**
 * ScanStatusPoller
 *
 * Polls GET /api/security-scans/:id on an interval and renders:
 * - A progress/loading state for queued or running scans
 * - The full ScanResults component once complete
 * - An error state if the scan fails
 *
 * Uses exponential backoff: 1s → 2s → 4s (capped at 8s) once running.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SPACING, TYPOGRAPHY } from '@/lib/design-tokens';
import { ScanResults } from './ScanResults';
import type { ScanResult, ScanState } from '@/lib/security/scan-types';

// ─── Constants ────────────────────────────────────────────────────────────────

const POLL_INTERVALS_MS = [1000, 2000, 4000, 8000];
const TERMINAL_STATES: ScanState[] = ['complete', 'failed'];

// ─── Loading UI ───────────────────────────────────────────────────────────────

function ScanLoading({ state, attempts }: { state: ScanState; attempts: number }) {
  const label = state === 'queued' ? 'Queued — waiting for worker...' : 'Running analysis...';
  return (
    <Card>
      <CardHeader>
        <CardTitle className={TYPOGRAPHY.h4.mdx}>Prompt Security Scan</CardTitle>
      </CardHeader>
      <CardContent className={SPACING.content}>
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
          </span>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        {attempts > 0 && <p className="text-xs text-muted-foreground">Attempt {attempts}</p>}
      </CardContent>
    </Card>
  );
}

function ScanError({ message }: { message: string }) {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className={TYPOGRAPHY.h4.mdx}>Scan Failed</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-destructive">{message}</p>
      </CardContent>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ScanStatusPollerProps {
  scanId: string;
  /** Base URL for the security scan API. Defaults to /api/security-scans */
  apiBase?: string;
  /** Called once the scan reaches a terminal state */
  onComplete?: (scan: ScanResult) => void;
}

export function ScanStatusPoller({
  scanId,
  apiBase = '/api/security-scans',
  onComplete,
}: ScanStatusPollerProps) {
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const pollIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const poll = useCallback(async () => {
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${apiBase}/${scanId}`, { signal: controller.signal });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const json = (await res.json()) as { data: ScanResult };
      const latest = json.data;
      setScan(latest);
      setFetchError(null);

      if (TERMINAL_STATES.includes(latest.state)) {
        onComplete?.(latest);
        return; // stop polling
      }

      // Advance poll interval (backoff)
      pollIndexRef.current = Math.min(pollIndexRef.current + 1, POLL_INTERVALS_MS.length - 1);
      const delay = POLL_INTERVALS_MS[pollIndexRef.current]!;
      timerRef.current = setTimeout(poll, delay);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setFetchError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [scanId, apiBase, onComplete]);

  useEffect(() => {
    pollIndexRef.current = 0;
    poll();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, [poll]);

  if (fetchError) return <ScanError message={fetchError} />;
  if (!scan) return <ScanLoading state="queued" attempts={0} />;
  if (scan.state === 'failed') return <ScanError message={scan.error ?? 'Scan failed'} />;
  if (scan.state === 'complete') return <ScanResults scan={scan} />;
  return <ScanLoading state={scan.state} attempts={scan.attempts} />;
}
