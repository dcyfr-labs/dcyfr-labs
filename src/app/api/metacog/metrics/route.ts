/**
 * Metacognitive Improvement Metrics — Dashboard Integration Hook
 * TLP:AMBER - Internal Use Only
 *
 * Returns current metacognitive improvement metrics for dashboard visibility.
 * Metrics include proposal throughput, approval ratio, and rollback rate.
 *
 * Access: internal only (blockExternalAccess enforced).
 * Feature flag: disabled when ENABLE_METACOG_RUNTIME is not "true".
 *
 * GET /api/metacog/metrics
 *
 * Response schema:
 * {
 *   enabled: boolean,
 *   timestamp: string,
 *   metrics: MetacogMetrics | null
 * }
 */

import { type NextRequest, NextResponse } from 'next/server';
import { blockExternalAccess } from '@/lib/api/api-security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Shape of the metrics returned by the metacognitive runtime.
 * Mirrors MetacogMetrics from @dcyfr/ai/metacognition without a direct import
 * (dcyfr-labs does not have @dcyfr/ai in its dependency graph).
 */
interface MetacogMetricsSnapshot {
  proposals_submitted: number;
  proposals_evaluated_pass: number;
  proposals_evaluated_fail: number;
  proposals_approved: number;
  proposals_applied: number;
  proposals_rolled_back: number;
  approval_ratio: number | null;
  rollback_rate: number | null;
}

/** Global metrics accumulator — injected by the metacog runtime when enabled. */
let _metricsSnapshot: MetacogMetricsSnapshot | null = null;

/**
 * Register a metrics snapshot from the metacognitive runtime.
 * Called once at startup when ENABLE_METACOG_RUNTIME=true.
 * No-op when the runtime is disabled.
 */
export function registerMetacogMetrics(snapshot: MetacogMetricsSnapshot): void {
  _metricsSnapshot = snapshot;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const blockResponse = blockExternalAccess(request);
  if (blockResponse) return blockResponse;

  const enabled = (process.env['ENABLE_METACOG_RUNTIME'] ?? '').trim().toLowerCase() === 'true';

  return NextResponse.json(
    {
      enabled,
      timestamp: new Date().toISOString(),
      metrics: enabled ? _metricsSnapshot : null,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'X-Metacog-Enabled': String(enabled),
      },
    }
  );
}
