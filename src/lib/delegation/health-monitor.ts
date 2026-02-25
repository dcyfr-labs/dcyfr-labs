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
 * 3. Uncomment all code below
 * 4. Remove these TODO comments
 */

// TEMPORARILY DISABLED - See TODO above
// import {
//   DelegationHealthMonitor,
//   getHealthMonitor,
//   type SystemHealthMetrics,
//   type Alert,
//   type AlertRule,
// } from '@dcyfr/ai';
// import { createServerLogger } from '@/lib/axiom/server-logger';
// import * as Sentry from '@sentry/nextjs';

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

/*
// ---------------------------------------------------------------------------
// ORIGINAL CODE - COMMENTED OUT UNTIL @dcyfr/ai@1.0.5 IS PUBLISHED
// ---------------------------------------------------------------------------

/*
// ---------------------------------------------------------------------------
// ORIGINAL CODE - COMMENTED OUT UNTIL @dcyfr/ai@1.0.5 IS PUBLISHED
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// SLA constants
// ---------------------------------------------------------------------------

/** Maximum acceptable verification turnaround in ms (5 minutes) */
const SLA_VERIFICATION_TIMEOUT_MS = 5 * 60 * 1000;

/** Minimum acceptable delegation success rate (0-1) */
const SLA_MIN_SUCCESS_RATE = 0.95;

/** Maximum acceptable p95 latency in ms (2 seconds) */
const SLA_MAX_P95_LATENCY_MS = 2000;

/** Minimum acceptable reputation score (0-100) */
const SLA_MIN_REPUTATION_SCORE = 60;

// ---------------------------------------------------------------------------
// Axiom logger
// ---------------------------------------------------------------------------

const logger = createServerLogger(process.env.AXIOM_DATASET_AGENTS ?? 'dcyfr-agents');

// ---------------------------------------------------------------------------
// SLA-specific alert rules
// ---------------------------------------------------------------------------

const SLA_ALERT_RULES: AlertRule[] = [
  {
    id: 'sla-verification-timeout',
    name: 'SLA: Verification Turnaround Exceeded',
    condition: {
      metric: 'performance.p95Latency',
      operator: '>',
      threshold: SLA_VERIFICATION_TIMEOUT_MS,
    },
    severity: 'error',
    channels: ['console', 'mcp'],
    cooldown: 60_000,
    enabled: true,
  },
  {
    id: 'sla-success-rate-drop',
    name: 'SLA: Delegation Success Rate Below Threshold',
    condition: {
      metric: 'contracts.successRate',
      operator: '<',
      threshold: SLA_MIN_SUCCESS_RATE,
    },
    severity: 'critical',
    channels: ['console', 'mcp'],
    cooldown: 120_000,
    enabled: true,
  },
  {
    id: 'sla-p95-latency',
    name: 'SLA: P95 Latency Too High',
    condition: {
      metric: 'performance.p95Latency',
      operator: '>',
      threshold: SLA_MAX_P95_LATENCY_MS,
    },
    severity: 'warning',
    channels: ['console'],
    cooldown: 60_000,
    enabled: true,
  },
  {
    id: 'sla-reputation-anomaly',
    name: 'SLA: Average Reputation Score Degraded',
    condition: {
      metric: 'reputation.averageScore',
      operator: '<',
      threshold: SLA_MIN_REPUTATION_SCORE,
    },
    severity: 'warning',
    channels: ['console', 'mcp'],
    cooldown: 300_000,
    enabled: true,
  },
  {
    id: 'sla-timeout-pattern',
    name: 'SLA: High Queue Depth (Timeout Pattern)',
    condition: {
      metric: 'performance.queueDepth',
      operator: '>',
      threshold: 50,
    },
    severity: 'warning',
    channels: ['console'],
    cooldown: 120_000,
    enabled: true,
  },
];

// ---------------------------------------------------------------------------
// Module-level singleton — lazy-init, so safe in server components
// ---------------------------------------------------------------------------

let _monitor: DelegationHealthMonitor | null = null;
let _initialized = false;

/**
 * Initialise the delegation health monitor with DCYFR-specific SLA rules.
 * Safe to call multiple times (idempotent).
 */
export function initDelegationHealthMonitor(intervalMs = 30_000): DelegationHealthMonitor {
  if (_initialized && _monitor) return _monitor;

  _monitor = getHealthMonitor();

  // Register SLA alert rules
  for (const rule of SLA_ALERT_RULES) {
    _monitor.addAlertRule(rule);
  }

  _monitor.start(intervalMs);
  _initialized = true;

  logger.info('delegation_health_monitor_started', {
    source: 'delegation-health-monitor',
    interval_ms: intervalMs,
    sla_rules: SLA_ALERT_RULES.map((r) => r.id),
  });

  return _monitor;
}

/**
 * Get the current health snapshot.
 */
export function getDelegationHealthSnapshot(): DelegationHealthSnapshot {
  const monitor = _monitor ?? getHealthMonitor();
  const metrics = monitor.getCurrentMetrics();
  const activeAlerts = monitor.getActiveAlerts();
  const recentAlerts = monitor.getAlertHistory(20);

  const slaStatus = evaluateSlaStatus(metrics);

  return {
    timestamp: new Date().toISOString(),
    healthScore: metrics.healthScore,
    status: deriveStatus(metrics.healthScore, activeAlerts),
    sla: slaStatus,
    metrics,
    activeAlerts,
    recentAlerts,
  };
}

// ---------------------------------------------------------------------------
// Types
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
  metrics: SystemHealthMetrics;
  activeAlerts: Alert[];
  recentAlerts: Alert[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function evaluateSlaStatus(metrics: SystemHealthMetrics): SlaStatus {
  const verificationTurnaroundOk = metrics.performance.p95Latency <= SLA_VERIFICATION_TIMEOUT_MS;
  const successRateOk = metrics.contracts.successRate >= SLA_MIN_SUCCESS_RATE;
  const latencyOk = metrics.performance.p95Latency <= SLA_MAX_P95_LATENCY_MS;
  const reputationOk = metrics.reputation.averageScore >= SLA_MIN_REPUTATION_SCORE;

  const allOk = verificationTurnaroundOk && successRateOk && latencyOk && reputationOk;
  const anyFailing = !verificationTurnaroundOk || !successRateOk;

  return {
    verificationTurnaroundOk,
    successRateOk,
    latencyOk,
    reputationOk,
    overall: allOk ? 'passing' : anyFailing ? 'failing' : 'degraded',
  };
}

function deriveStatus(
  healthScore: number,
  activeAlerts: Alert[]
): 'healthy' | 'degraded' | 'unhealthy' {
  const hasCritical = activeAlerts.some((a) => a.severity === 'critical');
  const hasError = activeAlerts.some((a) => a.severity === 'error');

  if (hasCritical || healthScore < 50) return 'unhealthy';
  if (hasError || healthScore < 75) return 'degraded';
  return 'healthy';
}

// ---------------------------------------------------------------------------
// Sentry integration — report critical delegation alerts as exceptions
// ---------------------------------------------------------------------------

/**
 * Report a delegation alert to Sentry when severity is error/critical.
 */
export function reportAlertToSentry(alert: Alert): void {
  if (alert.severity !== 'error' && alert.severity !== 'critical') return;

  Sentry.captureMessage(`[Delegation Alert] ${alert.name}: ${alert.message}`, {
    level: alert.severity === 'critical' ? 'fatal' : 'error',
    tags: {
      delegation_alert_id: alert.id,
      delegation_rule_id: alert.ruleId,
      delegation_severity: alert.severity,
    },
    extra: {
      value: alert.value,
      threshold: alert.threshold,
      timestamp: alert.timestamp.toISOString(),
      context: alert.context,
    },
  });
}

// ---------------------------------------------------------------------------
// END OF COMMENTED CODE
// ---------------------------------------------------------------------------
*/
