/**
 * Redis-Backed API Usage Tracking
 *
 * Provides persistent API usage tracking with Redis storage.
 * Replaces in-memory tracking in api-guardrails.ts with
 * distributed, persistent storage that survives deployments.
 *
 * Storage Strategy:
 * - Daily counters: api:usage:{service}:{endpoint}:{YYYY-MM-DD}
 * - Monthly aggregates: api:usage:monthly:{service}:{YYYY-MM}
 * - TTL: 90 days (daily), 12 months (monthly)
 */

import { redis } from '../redis-client';
import * as Sentry from '@sentry/nextjs';
import { API_LIMITS, ALERT_THRESHOLDS } from './api-guardrails';
import type { ApiUsageStats } from './api-guardrails';

// ============================================================================
// TYPES
// ============================================================================

export interface DailyUsageData {
  service: string;
  endpoint?: string;
  date: string; // YYYY-MM-DD
  count: number;
  estimatedCost: number;
  tokens?: number;
  avgDuration?: number;
}

export interface MonthlyUsageAggregate {
  service: string;
  month: string; // YYYY-MM
  totalRequests: number;
  totalCost: number;
  totalTokens: number;
  avgDuration: number;
  daysActive: number;
}

// ============================================================================
// REDIS KEY PATTERNS
// ============================================================================

const REDIS_KEYS = {
  // Daily usage: api:usage:{service}:{endpoint}:{YYYY-MM-DD}
  daily: (service: string, endpoint: string, date: string) =>
    `api:usage:${service}:${endpoint}:${date}`,

  // Monthly aggregate: api:usage:monthly:{service}:{YYYY-MM}
  monthly: (service: string, month: string) => `api:usage:monthly:${service}:${month}`,

  // Service pattern for listing all keys
  servicePattern: (service: string) => `api:usage:${service}:*`,

  // All usage pattern
  allPattern: () => 'api:usage:*',
} as const;

const TTL = {
  daily: 90 * 24 * 60 * 60, // 90 days
  monthly: 365 * 24 * 60 * 60, // 12 months
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get current date in YYYY-MM-DD format
 */
function getDateKey(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Get current month in YYYY-MM format
 */
function getMonthKey(): string {
  const now = new Date();
  return now.toISOString().slice(0, 7);
}

/**
 * Parse date key from Redis key
 */
function parseDateFromKey(key: string): string | null {
  const match = key.match(/(\d{4}-\d{2}-\d{2})$/);
  return match ? match[1] : null;
}

/**
 * Check if Redis is available
 */
async function isRedisAvailable(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.warn('[API Usage] Redis unavailable, falling back to in-memory tracking');
    return false;
  }
}

// ============================================================================
// IN-MEMORY FALLBACK
// ============================================================================

/**
 * In-memory fallback for when Redis is unavailable
 */
const memoryFallback = new Map<string, DailyUsageData>();

// ============================================================================
// CORE TRACKING FUNCTIONS
// ============================================================================

/**
 * Track API usage with Redis persistence
 */
export async function trackApiUsage(
  service: string,
  endpoint: string = 'default',
  options: {
    cost?: number;
    tokens?: number;
    duration?: number;
  } = {}
): Promise<void> {
  const date = getDateKey();
  const month = getMonthKey();
  const dailyKey = REDIS_KEYS.daily(service, endpoint, date);
  const monthlyKey = REDIS_KEYS.monthly(service, month);

  const redisAvailable = await isRedisAvailable();

  if (!redisAvailable) {
    // Fallback to in-memory tracking
    const memKey = `${service}:${endpoint}:${date}`;
    const existing = memoryFallback.get(memKey);

    if (existing) {
      existing.count += 1;
      existing.estimatedCost += options.cost || 0;
      if (options.tokens) existing.tokens = (existing.tokens || 0) + options.tokens;
    } else {
      memoryFallback.set(memKey, {
        service,
        endpoint,
        date,
        count: 1,
        estimatedCost: options.cost || 0,
        tokens: options.tokens,
        avgDuration: options.duration,
      });
    }
    return;
  }

  try {
    // Update daily counter
    const dailyData = await redis.get(dailyKey);
    let usage: DailyUsageData;

    if (dailyData) {
      usage = JSON.parse(dailyData as string);
      usage.count += 1;
      usage.estimatedCost += options.cost || 0;
      if (options.tokens) {
        usage.tokens = (usage.tokens || 0) + options.tokens;
      }
      if (options.duration) {
        // Calculate running average
        const prevAvg = usage.avgDuration || 0;
        const prevCount = usage.count - 1;
        usage.avgDuration = (prevAvg * prevCount + options.duration) / usage.count;
      }
    } else {
      usage = {
        service,
        endpoint,
        date,
        count: 1,
        estimatedCost: options.cost || 0,
        tokens: options.tokens,
        avgDuration: options.duration,
      };
    }

    await redis.set(dailyKey, JSON.stringify(usage), { EX: TTL.daily });

    // Update monthly aggregate
    await updateMonthlyAggregate(service, month, {
      requests: 1,
      cost: options.cost || 0,
      tokens: options.tokens || 0,
      duration: options.duration || 0,
    });

    // Check for alert thresholds
    await checkUsageAlerts(service, endpoint, usage);
  } catch (error) {
    console.error('[API Usage] Failed to track usage:', error);
    Sentry.captureException(error, {
      tags: {
        component: 'api-usage-tracker',
        service,
        endpoint,
      },
    });
  }
}

/**
 * Update monthly aggregate
 */
async function updateMonthlyAggregate(
  service: string,
  month: string,
  delta: {
    requests: number;
    cost: number;
    tokens: number;
    duration: number;
  }
): Promise<void> {
  const monthlyKey = REDIS_KEYS.monthly(service, month);

  try {
    const data = await redis.get(monthlyKey);
    let aggregate: MonthlyUsageAggregate;

    if (data) {
      aggregate = JSON.parse(data as string);
      aggregate.totalRequests += delta.requests;
      aggregate.totalCost += delta.cost;
      aggregate.totalTokens += delta.tokens;

      // Update running average for duration
      const prevAvg = aggregate.avgDuration || 0;
      const prevCount = aggregate.totalRequests - delta.requests;
      aggregate.avgDuration = delta.duration
        ? (prevAvg * prevCount + delta.duration) / aggregate.totalRequests
        : prevAvg;
    } else {
      aggregate = {
        service,
        month,
        totalRequests: delta.requests,
        totalCost: delta.cost,
        totalTokens: delta.tokens,
        avgDuration: delta.duration,
        daysActive: 1,
      };
    }

    await redis.set(monthlyKey, JSON.stringify(aggregate), { EX: TTL.monthly });
  } catch (error) {
    console.error('[API Usage] Failed to update monthly aggregate:', error);
  }
}

/**
 * Check if usage exceeds alert thresholds
 */
async function checkUsageAlerts(
  service: string,
  endpoint: string,
  usage: DailyUsageData
): Promise<void> {
  const limit = getServiceLimit(service);
  const percentUsed = (usage.count / limit) * 100;

  if (percentUsed >= ALERT_THRESHOLDS.critical * 100) {
    const message = `CRITICAL: ${service} usage at ${percentUsed.toFixed(1)}% (${usage.count}/${limit})`;
    console.error(`[API Usage] 🚨 ${message}`);

    Sentry.captureMessage(message, {
      level: 'error',
      tags: {
        component: 'api-usage-tracker',
        service,
        endpoint,
        alert_type: 'critical',
      },
      extra: {
        usage,
        percentUsed,
        limit,
      },
    });
  } else if (percentUsed >= ALERT_THRESHOLDS.warning * 100) {
    const message = `WARNING: ${service} usage at ${percentUsed.toFixed(1)}% (${usage.count}/${limit})`;
    console.warn(`[API Usage] ⚠️  ${message}`);

    Sentry.captureMessage(message, {
      level: 'warning',
      tags: {
        component: 'api-usage-tracker',
        service,
        endpoint,
        alert_type: 'warning',
      },
      extra: {
        usage,
        percentUsed,
        limit,
      },
    });
  }
}

/**
 * Get service limit from API_LIMITS
 */
function getServiceLimit(service: string): number {
  const config = API_LIMITS[service as keyof typeof API_LIMITS];
  if (!config) return 1000;

  if ('maxRequestsPerMonth' in config) {
    return config.maxRequestsPerMonth;
  }
  if ('maxEventsPerMonth' in config) {
    return config.maxEventsPerMonth;
  }
  if ('maxEmailsPerMonth' in config) {
    return config.maxEmailsPerMonth;
  }
  return 1000;
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get daily usage for a service
 */
export async function getDailyUsage(
  service: string,
  endpoint: string = 'default',
  date?: string
): Promise<DailyUsageData | null> {
  const dateKey = date || getDateKey();
  const key = REDIS_KEYS.daily(service, endpoint, dateKey);

  const redisAvailable = await isRedisAvailable();
  if (!redisAvailable) {
    const memKey = `${service}:${endpoint}:${dateKey}`;
    return memoryFallback.get(memKey) || null;
  }

  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data as string) : null;
  } catch (error) {
    console.error('[API Usage] Failed to get daily usage:', error);
    return null;
  }
}

/**
 * Get monthly usage aggregate for a service
 */
export async function getMonthlyUsage(
  service: string,
  month?: string
): Promise<MonthlyUsageAggregate | null> {
  const monthKey = month || getMonthKey();
  const key = REDIS_KEYS.monthly(service, monthKey);

  const redisAvailable = await isRedisAvailable();
  if (!redisAvailable) {
    return null;
  }

  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data as string) : null;
  } catch (error) {
    console.error('[API Usage] Failed to get monthly usage:', error);
    return null;
  }
}

/**
 * Get all usage statistics (compatible with api-guardrails.ts interface)
 */
export async function getAllUsageStats(): Promise<ApiUsageStats[]> {
  const redisAvailable = await isRedisAvailable();

  if (!redisAvailable) {
    // Return in-memory fallback data
    const stats: ApiUsageStats[] = [];
    for (const [key, usage] of memoryFallback.entries()) {
      const limit = getServiceLimit(usage.service);
      stats.push({
        service: usage.service,
        endpoint: usage.endpoint,
        count: usage.count,
        lastReset: new Date(usage.date),
        estimatedCost: usage.estimatedCost,
        limit,
        percentUsed: (usage.count / limit) * 100,
      });
    }
    return stats;
  }

  try {
    const today = getDateKey();
    const keys = await redis.keys(REDIS_KEYS.allPattern());

    // Filter to today's keys only
    const todayKeys = keys.filter((key) => key.includes(today));

    const stats: ApiUsageStats[] = [];

    for (const key of todayKeys) {
      const data = await redis.get(key);
      if (data) {
        const usage: DailyUsageData = JSON.parse(data as string);
        const limit = getServiceLimit(usage.service);
        stats.push({
          service: usage.service,
          endpoint: usage.endpoint,
          count: usage.count,
          lastReset: new Date(usage.date),
          estimatedCost: usage.estimatedCost,
          limit,
          percentUsed: (usage.count / limit) * 100,
        });
      }
    }

    return stats;
  } catch (error) {
    console.error('[API Usage] Failed to get all usage stats:', error);
    return [];
  }
}

/**
 * Get usage statistics for a specific service
 */
export async function getServiceUsageStats(service: string): Promise<ApiUsageStats[]> {
  const allStats = await getAllUsageStats();
  return allStats.filter((stat) => stat.service === service);
}

/**
 * Get historical usage (last N days)
 */
export async function getHistoricalUsage(
  service: string,
  endpoint: string = 'default',
  days: number = 30
): Promise<DailyUsageData[]> {
  const redisAvailable = await isRedisAvailable();
  if (!redisAvailable) {
    return [];
  }

  try {
    const results: DailyUsageData[] = [];
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];

      const usage = await getDailyUsage(service, endpoint, dateKey);
      if (usage) {
        results.push(usage);
      }
    }

    return results.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('[API Usage] Failed to get historical usage:', error);
    return [];
  }
}

/**
 * Get monthly usage history (last N months)
 */
export async function getMonthlyHistory(
  service: string,
  months: number = 6
): Promise<MonthlyUsageAggregate[]> {
  const redisAvailable = await isRedisAvailable();
  if (!redisAvailable) {
    return [];
  }

  try {
    const results: MonthlyUsageAggregate[] = [];
    const now = new Date();

    for (let i = 0; i < months; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);

      const usage = await getMonthlyUsage(service, monthKey);
      if (usage) {
        results.push(usage);
      }
    }

    return results.sort((a, b) => a.month.localeCompare(b.month));
  } catch (error) {
    console.error('[API Usage] Failed to get monthly history:', error);
    return [];
  }
}

// ============================================================================
// SUMMARY & HEALTH
// ============================================================================

/**
 * Get usage summary (compatible with api-guardrails.ts)
 */
export async function getUsageSummary(): Promise<{
  totalServices: number;
  totalCost: number;
  servicesNearLimit: string[];
  servicesAtLimit: string[];
}> {
  const stats = await getAllUsageStats();

  const totalCost = stats.reduce((sum, stat) => sum + (stat.estimatedCost || 0), 0);

  const servicesNearLimit = stats
    .filter((s) => s.percentUsed >= ALERT_THRESHOLDS.warning * 100)
    .map((s) => s.service);

  const servicesAtLimit = stats.filter((s) => s.percentUsed >= 100).map((s) => s.service);

  return {
    totalServices: new Set(stats.map((s) => s.service)).size,
    totalCost,
    servicesNearLimit,
    servicesAtLimit,
  };
}

/**
 * Check if service is within limits
 */
export async function checkServiceLimit(
  service: string,
  endpoint: string = 'default'
): Promise<{ allowed: boolean; reason?: string; stats?: ApiUsageStats }> {
  const usage = await getDailyUsage(service, endpoint);

  if (!usage) {
    return { allowed: true };
  }

  const limit = getServiceLimit(service);

  // Check if at limit
  if (usage.count >= limit) {
    const stats: ApiUsageStats = {
      service,
      endpoint,
      count: usage.count,
      lastReset: new Date(usage.date),
      estimatedCost: usage.estimatedCost,
      limit,
      percentUsed: (usage.count / limit) * 100,
    };

    return {
      allowed: false,
      reason: `${service} monthly limit reached (${usage.count}/${limit})`,
      stats,
    };
  }

  // Check cost limit for paid services
  if (service === 'perplexity' && usage.estimatedCost) {
    const costLimit = API_LIMITS.perplexity.maxCostPerMonth;
    if (usage.estimatedCost >= costLimit) {
      const stats: ApiUsageStats = {
        service,
        endpoint,
        count: usage.count,
        lastReset: new Date(usage.date),
        estimatedCost: usage.estimatedCost,
        limit,
        percentUsed: (usage.count / limit) * 100,
      };

      return {
        allowed: false,
        reason: `${service} cost limit reached ($${usage.estimatedCost.toFixed(2)}/$${costLimit})`,
        stats,
      };
    }
  }

  return { allowed: true };
}

// ============================================================================
// CLEANUP & MAINTENANCE
// ============================================================================

/**
 * Clear all usage data (for testing)
 */
export async function clearAllUsageData(): Promise<void> {
  const redisAvailable = await isRedisAvailable();

  if (!redisAvailable) {
    memoryFallback.clear();
    return;
  }

  try {
    const keys = await redis.keys(REDIS_KEYS.allPattern());
    if (keys.length > 0) {
      // Delete keys in batches to avoid spread operator type issues
      for (const key of keys) {
        await redis.del(key);
      }
    }
    console.warn('[API Usage] All usage data cleared');
  } catch (error) {
    console.error('[API Usage] Failed to clear usage data:', error);
    throw error;
  }
}

/**
 * Clean up old data (automated cleanup for data beyond TTL)
 */
export async function cleanupOldData(): Promise<{ deleted: number }> {
  const redisAvailable = await isRedisAvailable();
  if (!redisAvailable) {
    return { deleted: 0 };
  }

  try {
    const keys = await redis.keys(REDIS_KEYS.allPattern());
    const now = new Date();
    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days ago

    let deleted = 0;

    for (const key of keys) {
      const date = parseDateFromKey(key);
      if (date && new Date(date) < cutoffDate) {
        await redis.del(key);
        deleted++;
      }
    }

    if (deleted > 0) {
      console.warn(`[API Usage] Cleaned up ${deleted} old usage records`);
    }

    return { deleted };
  } catch (error) {
    console.error('[API Usage] Failed to cleanup old data:', error);
    return { deleted: 0 };
  }
}
