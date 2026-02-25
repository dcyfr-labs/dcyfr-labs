/**
 * Delegation System Health Monitor — dcyfr-labs integration
 *
 * Wraps the @dcyfr/ai DelegationHealthMonitor for use in the Next.js context.
 * Provides SLA monitoring, failure-rate alerting, timeout tracking, and
 * reputation anomaly detection.
 *
 * @module lib/delegation/health-monitor
 * @see packages/ai/delegation/monitoring.ts
 *
 * TODO: RE-ENABLE after @dcyfr/ai@1.0.5 is published
 * This file is temporarily disabled because the delegation health monitoring
 * exports were added to @dcyfr/ai source after v1.0.4 was published.
 *
 * Action required:
 * 1. Build and publish @dcyfr/ai@1.0.5 with delegation health monitoring exports
 * 2. Update dcyfr-labs package.json to use @dcyfr/ai@^1.0.5
 * 3. Re-implement using @dcyfr/ai exports
 * 4. Remove stub exports and these TODO comments
 *
 * Original implementation: git show 79b5d437:src/lib/delegation/health-monitor.ts
 */

// ---------------------------------------------------------------------------
// STUB TYPES AND EXPORTS - TO BE REPLACED WHEN RE-ENABLED
// ---------------------------------------------------------------------------

export interface SlaStatus {
  verificationTurnaroundOk: boolean;
  successRateOk: boolean;
  latencyOk: boolean;
  reputationOk: boolean;
  overall: 'passing' | 'degraded' | 'failing';
}

export interface DelegationHealthSnapshot {
  timestamp: string;
  healthScore: number;
  status: 'healthy' | 'degraded' | 'unhealthy';
  sla: SlaStatus;
  metrics: Record<string, unknown>;
  activeAlerts: Array<unknown>;
  recentAlerts: Array<unknown>;
}

/**
 * STUB: Placeholder until @dcyfr/ai@1.0.5 is published
 */
export function initDelegationHealthMonitor(_intervalMs = 30_000): null {
  console.warn('[delegation-health-monitor] DISABLED - waiting for @dcyfr/ai@1.0.5');
  return null;
}

/**
 * STUB: Placeholder until @dcyfr/ai@1.0.5 is published
 */
export function getDelegationHealthSnapshot(): DelegationHealthSnapshot {
  console.warn('[delegation-health-monitor] DISABLED - waiting for @dcyfr/ai@1.0.5');
  return {
    timestamp: new Date().toISOString(),
    healthScore: 100,
    status: 'healthy',
    sla: {
      verificationTurnaroundOk: true,
      successRateOk: true,
      latencyOk: true,
      reputationOk: true,
      overall: 'passing',
    },
    metrics: {},
    activeAlerts: [],
    recentAlerts: [],
  };
}

/**
 * STUB: Placeholder until @dcyfr/ai@1.0.5 is published
 */
export function reportAlertToSentry(_alert: unknown): void {
  console.warn('[delegation-health-monitor] DISABLED - waiting for @dcyfr/ai@1.0.5');
}
