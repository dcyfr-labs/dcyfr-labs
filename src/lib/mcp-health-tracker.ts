/**
 * MCP Health Tracking System
 *
 * Provides Redis-backed tracking for MCP server health monitoring.
 * Stores health check results, calculates uptime percentages, and
 * triggers alerts on failures.
 */

import { redis } from '@/lib/redis-client';
import * as Sentry from '@sentry/nextjs';

// ============================================================================
// TYPES
// ============================================================================

export interface McpServerStatus {
  name: string;
  status: 'ok' | 'degraded' | 'down';
  responseTimeMs: number;
  error?: string;
  authUsed?: boolean;
  timestamp: string;
}

export interface McpHealthReport {
  timestamp: string;
  servers: McpServerStatus[];
  summary: {
    total: number;
    ok: number;
    degraded: number;
    down: number;
  };
}

export interface McpUptimeMetrics {
  serverName: string;
  percentage: number;
  lastIncident: string | null;
  avgResponseTime: number;
  totalChecks: number;
  okChecks: number;
}

export interface McpIncident {
  timestamp: string;
  server: string;
  error: string;
  duration: string | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const REDIS_KEY_PREFIX = 'mcp:health:';
const HISTORY_RETENTION_DAYS = 7;
const CRITICAL_MCPS = [
  'DCYFR Analytics',
  'DCYFR DesignTokens',
  'DCYFR ContentManager',
  'DCYFR SemanticScholar',
];

// ============================================================================
// HEALTH REPORTING
// ============================================================================

/**
 * Store health check results in Redis
 */
export async function storeHealthReport(report: McpHealthReport): Promise<void> {
  try {
    // Store latest health status
    await redis.set(
      `${REDIS_KEY_PREFIX}latest`,
      JSON.stringify(report),
      { EX: 24 * 60 * 60 } // 24 hours
    );

    // Store per-server history
    for (const server of report.servers) {
      const serverKey = `${REDIS_KEY_PREFIX}history:${server.name}`;

      // Add to sorted set with timestamp as score
      await redis.zAdd(serverKey, {
        score: Date.parse(report.timestamp),
        value: JSON.stringify(server),
      });

      // Keep only last 7 days
      const cutoffTime = Date.now() - HISTORY_RETENTION_DAYS * 24 * 60 * 60 * 1000;
      await redis.zRemRangeByScore(serverKey, 0, cutoffTime);
    }

    // Check for critical failures and alert
    await checkAndAlert(report);
  } catch (error) {
    console.error('[MCP Health] Failed to store health report:', error);
    throw error;
  }
}

/**
 * Get latest health report
 */
export async function getLatestHealthReport(): Promise<McpHealthReport | null> {
  try {
    const data = await redis.get(`${REDIS_KEY_PREFIX}latest`);
    return data ? JSON.parse(data as string) : null;
  } catch (error) {
    console.error('[MCP Health] Failed to get latest report:', error);
    return null;
  }
}

/**
 * Get health history for a specific server
 */
export async function getServerHistory(
  serverName: string,
  days: number = 7
): Promise<McpServerStatus[]> {
  try {
    const serverKey = `${REDIS_KEY_PREFIX}history:${serverName}`;
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

    const results = await redis.zRangeByScore(serverKey, cutoffTime, Date.now());

    if (!results || !Array.isArray(results)) {
      return [];
    }

    return results.filter((r): r is string => typeof r === 'string').map((r) => JSON.parse(r));
  } catch (error) {
    console.error(`[MCP Health] Failed to get history for ${serverName}:`, error);
    return [];
  }
}

// ============================================================================
// UPTIME CALCULATIONS
// ============================================================================

/**
 * Calculate uptime percentage for a server
 */
export async function calculateUptime(
  serverName: string,
  days: number = 7
): Promise<McpUptimeMetrics> {
  const history = await getServerHistory(serverName, days);

  if (history.length === 0) {
    return {
      serverName,
      percentage: 100,
      lastIncident: null,
      avgResponseTime: 0,
      totalChecks: 0,
      okChecks: 0,
    };
  }

  const okChecks = history.filter((h) => h.status === 'ok').length;
  const percentage = (okChecks / history.length) * 100;

  const lastFailure = history
    .filter((h) => h.status === 'down')
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))[0];

  const avgResponseTime = history.reduce((sum, h) => sum + h.responseTimeMs, 0) / history.length;

  return {
    serverName,
    percentage,
    lastIncident: lastFailure?.timestamp || null,
    avgResponseTime: Math.round(avgResponseTime),
    totalChecks: history.length,
    okChecks,
  };
}

/**
 * Get uptime metrics for all servers
 */
export async function getAllUptimeMetrics(
  days: number = 7
): Promise<Record<string, McpUptimeMetrics>> {
  const latest = await getLatestHealthReport();
  if (!latest) return {};

  const metrics: Record<string, McpUptimeMetrics> = {};

  for (const server of latest.servers) {
    metrics[server.name] = await calculateUptime(server.name, days);
  }

  return metrics;
}

// ============================================================================
// INCIDENTS
// ============================================================================

/**
 * Get recent incidents across all servers
 */
export async function getRecentIncidents(
  days: number = 7,
  limit: number = 20
): Promise<McpIncident[]> {
  const latest = await getLatestHealthReport();
  if (!latest) return [];

  const incidents: McpIncident[] = [];

  for (const server of latest.servers) {
    const history = await getServerHistory(server.name, days);

    const failures = history.filter((h) => h.status === 'down');

    for (const failure of failures) {
      incidents.push({
        timestamp: failure.timestamp,
        server: server.name,
        error: failure.error || 'Unknown error',
        duration: null, // TODO: Calculate duration by finding next 'ok' status
      });
    }
  }

  // Sort by timestamp (newest first) and limit
  return incidents
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, limit);
}

// ============================================================================
// ALERTING
// ============================================================================

/**
 * Check health report and send alerts if needed
 */
async function checkAndAlert(report: McpHealthReport): Promise<void> {
  const downCritical = report.servers.filter(
    (s) => CRITICAL_MCPS.includes(s.name) && s.status === 'down'
  );

  if (downCritical.length > 0) {
    // Critical alert via Sentry
    Sentry.captureMessage('Critical MCP servers down', {
      level: 'error',
      tags: {
        component: 'mcp-health',
        servers: downCritical.map((s) => s.name).join(','),
        count: downCritical.length.toString(),
      },
      extra: {
        downServers: downCritical,
        fullReport: report,
      },
    });

    // Store alert in Redis
    await redis.zAdd(`${REDIS_KEY_PREFIX}alerts`, {
      score: Date.parse(report.timestamp),
      value: JSON.stringify({
        timestamp: report.timestamp,
        level: 'critical',
        servers: downCritical.map((s) => s.name),
        message: `${downCritical.length} critical MCP server(s) down`,
      }),
    });
  }

  // Check for degraded performance (response time > 5s)
  const degraded = report.servers.filter((s) => s.status === 'ok' && s.responseTimeMs > 5000);

  if (degraded.length > 0) {
    // Warning alert
    Sentry.captureMessage('MCP servers experiencing degraded performance', {
      level: 'warning',
      tags: {
        component: 'mcp-health',
        servers: degraded.map((s) => s.name).join(','),
        count: degraded.length.toString(),
      },
      extra: {
        degradedServers: degraded,
        avgResponseTime: degraded.reduce((sum, s) => sum + s.responseTimeMs, 0) / degraded.length,
      },
    });
  }
}

/**
 * Get alert history
 */
export async function getAlertHistory(days: number = 7): Promise<any[]> {
  try {
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    const alerts = await redis.zRangeByScore(`${REDIS_KEY_PREFIX}alerts`, cutoffTime, Date.now());

    if (!alerts || !Array.isArray(alerts)) {
      return [];
    }

    return alerts.filter((a): a is string => typeof a === 'string').map((a) => JSON.parse(a));
  } catch (error) {
    console.error('[MCP Health] Failed to get alert history:', error);
    return [];
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Check if Redis is available
 */
export async function isRedisAvailable(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Clear all health data (for testing/reset)
 */
export async function clearHealthData(): Promise<void> {
  try {
    const keys = await redis.keys(`${REDIS_KEY_PREFIX}*`);
    if (keys.length > 0) {
      // Delete keys in batches to avoid spread operator type issues
      for (const key of keys) {
        await redis.del(key);
      }
    }
  } catch (error) {
    console.error('[MCP Health] Failed to clear health data:', error);
    throw error;
  }
}
