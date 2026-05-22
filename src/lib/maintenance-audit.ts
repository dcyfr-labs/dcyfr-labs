/**
 * Maintenance audit snapshot store.
 *
 * The dependency-security and design-token Inngest audits write their latest
 * result here; the maintenance dashboard API (`/api/maintenance/metrics`)
 * reads it back. Snapshots carry a TTL so a long-stale audit expires and the
 * dashboard falls back rather than presenting month-old data as current.
 *
 * @module lib/maintenance-audit
 */

import { redis } from '@/lib/redis-client';

const DEPENDENCY_AUDIT_KEY = 'maintenance:audit:dependencies';
const DESIGN_TOKEN_AUDIT_KEY = 'maintenance:audit:design-tokens';

/** Snapshots stay current for 35 days — the monthly audit cadence plus margin. */
const SNAPSHOT_TTL_SECONDS = 60 * 60 * 24 * 35;

/**
 * Latest result of the dependency-security (`npm audit`) Inngest function.
 */
export interface DependencyAuditSnapshot {
  /** ISO timestamp of the audit run. */
  timestamp: string;
  /** Branch the audit ran against. */
  branch: string;
  vulnerabilities: {
    critical: number;
    high: number;
    moderate: number;
    low: number;
    info: number;
    total: number;
  };
  totalDependencies: number;
}

/**
 * Latest result of the design-token compliance Inngest function.
 */
export interface DesignTokenAuditSnapshot {
  /** ISO timestamp of the audit run. */
  timestamp: string;
  /** Branch the audit ran against. */
  branch: string;
  violationsTotal: number;
  /** Violation counts keyed by pattern (spacing, typography, colors, …). */
  violationsByPattern: Record<string, number>;
}

async function writeSnapshot(key: string, snapshot: unknown): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(snapshot), { ex: SNAPSHOT_TTL_SECONDS });
  } catch (error) {
    console.error(`[MaintenanceAudit] Failed to persist ${key}:`, error);
  }
}

async function readSnapshot<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    // Upstash may return the value already deserialized; handle both forms.
    return (typeof raw === 'string' ? JSON.parse(raw) : raw) as T;
  } catch (error) {
    console.error(`[MaintenanceAudit] Failed to read ${key}:`, error);
    return null;
  }
}

/** Persist the latest dependency-security audit result. */
export function persistDependencyAudit(snapshot: DependencyAuditSnapshot): Promise<void> {
  return writeSnapshot(DEPENDENCY_AUDIT_KEY, snapshot);
}

/** Read the latest dependency-security audit result, or null if none is stored. */
export function getDependencyAudit(): Promise<DependencyAuditSnapshot | null> {
  return readSnapshot<DependencyAuditSnapshot>(DEPENDENCY_AUDIT_KEY);
}

/** Persist the latest design-token compliance audit result. */
export function persistDesignTokenAudit(snapshot: DesignTokenAuditSnapshot): Promise<void> {
  return writeSnapshot(DESIGN_TOKEN_AUDIT_KEY, snapshot);
}

/** Read the latest design-token compliance audit result, or null if none is stored. */
export function getDesignTokenAudit(): Promise<DesignTokenAuditSnapshot | null> {
  return readSnapshot<DesignTokenAuditSnapshot>(DESIGN_TOKEN_AUDIT_KEY);
}
