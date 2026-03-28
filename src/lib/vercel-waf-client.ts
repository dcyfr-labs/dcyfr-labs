/**
 * Vercel WAF Client
 *
 * Manages IP blocking rules in Vercel Firewall via the REST API.
 * Supports deny (malicious) and challenge (suspicious) actions.
 *
 * Required environment variables:
 *   VERCEL_WAF_TOKEN      — Vercel personal access token with firewall write access
 *   NEXT_PUBLIC_SITE_URL  — Production site URL (used to derive hostname)
 *
 * Auto-injected by Vercel at runtime:
 *   VERCEL_PROJECT_ID
 *   VERCEL_TEAM_ID        — (optional, teams only)
 *
 * @see https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules
 */

import 'server-only';
import * as Sentry from '@sentry/nextjs';

const VERCEL_API_BASE = 'https://api.vercel.com';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WAFIPAction = 'deny' | 'challenge' | 'log' | 'bypass';

export interface WAFIPRule {
  id: string;
  hostname: string;
  ip: string;
  action: WAFIPAction;
  notes?: string;
}

interface WAFFirewallConfig {
  // Vercel API wraps the config under an "active" key
  active?: {
    ips?: WAFIPRule[];
    firewallEnabled?: boolean;
    [key: string]: unknown;
  };
  // Fallback in case the shape changes
  ips?: WAFIPRule[];
  [key: string]: unknown;
}

interface WAFPatchBody {
  action: 'ip.insert' | 'ip.update' | 'ip.remove';
  id?: string;
  value?: {
    hostname: string;
    ip: string;
    action: WAFIPAction;
    notes?: string;
  };
}

/**
 * Minimal PUT body for IP-only updates.
 * Only `firewallEnabled` + `ips` are required; other fields (crs, managedRules)
 * are intentionally omitted — Vercel accepts this and leaves them unchanged.
 */
interface WAFIPPutBody {
  firewallEnabled: boolean;
  ips: WAFIPRule[];
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class VercelWAFClient {
  private readonly token: string;
  private readonly projectId: string;
  private readonly teamId: string | undefined;
  private readonly hostname: string;

  constructor() {
    const token = process.env.VERCEL_WAF_TOKEN;
    const projectId = process.env.VERCEL_PROJECT_ID;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!token || !projectId || !siteUrl) {
      throw new Error(
        '[VercelWAFClient] Missing required env: VERCEL_WAF_TOKEN, VERCEL_PROJECT_ID, NEXT_PUBLIC_SITE_URL'
      );
    }

    this.token = token;
    this.projectId = projectId;
    this.teamId = process.env.VERCEL_TEAM_ID || undefined;

    try {
      this.hostname = new URL(siteUrl).hostname;
    } catch {
      throw new Error(`[VercelWAFClient] Invalid NEXT_PUBLIC_SITE_URL: ${siteUrl}`);
    }
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private buildUrl(path: string): string {
    const url = new URL(`${VERCEL_API_BASE}${path}`);
    url.searchParams.set('projectId', this.projectId);
    if (this.teamId) url.searchParams.set('teamId', this.teamId);
    return url.toString();
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await fetch(this.buildUrl(path), {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      // Don't cache — firewall state must always be current
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(
        `[VercelWAFClient] ${method} ${path} → ${response.status}: ${text.slice(0, 200)}`
      );
    }

    return response.json() as Promise<T>;
  }

  private async patch(body: WAFPatchBody): Promise<void> {
    await this.request<unknown>('PATCH', '/v1/security/firewall/config', body);
  }

  /**
   * PUT the full IP ruleset.
   * Vercel's PATCH ip.remove has a known server-side bug (HTTP 500).
   * This PUT approach replaces only the IPs list; CRS/managedRules are
   * intentionally excluded — Vercel accepts {firewallEnabled, ips} and leaves
   * all other config sections untouched.
   */
  private async putIPRules(rules: WAFIPRule[]): Promise<void> {
    const body: WAFIPPutBody = {
      firewallEnabled: true,
      ips: rules,
    };
    await this.request<unknown>('PUT', '/v1/security/firewall/config', body);
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Fetch all current IP blocking rules for this project.
   */
  async getIPRules(): Promise<WAFIPRule[]> {
    const config = await this.request<WAFFirewallConfig>('GET', '/v1/security/firewall/config');
    // Vercel API nests the live config under "active"
    return config.active?.ips ?? config.ips ?? [];
  }

  /**
   * Block an IP with a deny action (malicious traffic).
   * Accepts plain IPs or CIDR notation (e.g. "1.2.3.0/24").
   */
  async blockIP(ip: string, notes?: string): Promise<void> {
    await this.patch({
      action: 'ip.insert',
      value: { hostname: this.hostname, ip, action: 'deny', notes },
    });
  }

  /**
   * Challenge an IP (suspicious traffic — CAPTCHA-style check).
   */
  async challengeIP(ip: string, notes?: string): Promise<void> {
    await this.patch({
      action: 'ip.insert',
      value: { hostname: this.hostname, ip, action: 'challenge', notes },
    });
  }

  /**
   * Find and remove all WAF rules matching a given IP address.
   *
   * Uses GET → filter → PUT because Vercel's PATCH `ip.remove` returns
   * HTTP 500 (confirmed Vercel API bug). The PUT only sends
   * {firewallEnabled, ips} which is the minimal valid body — CRS and
   * managed-rule config are left intact on the Vercel side.
   */
  async removeIPByAddress(ip: string): Promise<number> {
    const current = await this.getIPRules();
    const remaining = current.filter((r) => r.ip !== ip);
    const removed = current.length - remaining.length;

    if (removed > 0) {
      await this.putIPRules(remaining);
    }
    return removed;
  }

  /**
   * Check whether an IP is already present in the WAF ruleset.
   */
  async isIPPresent(ip: string): Promise<WAFIPRule | null> {
    const rules = await this.getIPRules();
    return rules.find((r) => r.ip === ip) ?? null;
  }

  /**
   * Sync a list of IPs into WAF, skipping ones already present.
   * Returns counts of added and skipped entries.
   *
   * @param entries  Array of { ip, action, notes }
   */
  async syncIPBlocklist(
    entries: Array<{ ip: string; action: WAFIPAction; notes?: string }>
  ): Promise<{ added: number; skipped: number; errors: number }> {
    const existingRules = await this.getIPRules();
    const existingIPs = new Set(existingRules.map((r) => r.ip));

    let added = 0;
    let skipped = 0;
    let errors = 0;

    for (const entry of entries) {
      if (existingIPs.has(entry.ip)) {
        skipped++;
        continue;
      }
      try {
        await this.patch({
          action: 'ip.insert',
          value: {
            hostname: this.hostname,
            ip: entry.ip,
            action: entry.action,
            notes: entry.notes,
          },
        });
        added++;
      } catch (err) {
        errors++;
        Sentry.captureException(err, {
          tags: { component: 'vercel-waf', operation: 'sync-insert' },
          extra: { ip: entry.ip, action: entry.action },
        });
      }
    }

    return { added, skipped, errors };
  }
}

// ---------------------------------------------------------------------------
// Singleton factory (lazy — only constructed when credentials are present)
// ---------------------------------------------------------------------------

let _client: VercelWAFClient | null = null;

/**
 * Returns the shared VercelWAFClient instance, or null if credentials are
 * not configured (e.g. local dev without WAF token). Callers should treat
 * null as "WAF unavailable — skip silently".
 */
export function getVercelWAFClient(): VercelWAFClient | null {
  if (_client) return _client;

  if (
    !process.env.VERCEL_WAF_TOKEN ||
    !process.env.VERCEL_PROJECT_ID ||
    !process.env.NEXT_PUBLIC_SITE_URL
  ) {
    return null;
  }

  try {
    _client = new VercelWAFClient();
    return _client;
  } catch (err) {
    console.warn('[VercelWAFClient] Failed to initialise:', err);
    return null;
  }
}
