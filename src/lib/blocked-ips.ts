/**
 * Blocked IPs management system
 *
 * Provides Redis-based storage and retrieval for blocked/suspicious IP lists
 * Integrates with existing rate limiting and security systems
 */

import { createClient } from "redis";
import * as Sentry from "@sentry/nextjs";
import { type IPReputationEntry } from "@/types/ip-reputation";

type RedisClient = ReturnType<typeof createClient>;

const BLOCKED_IPS_KEY = "security:blocked-ips";
const SUSPICIOUS_IPS_KEY = "security:suspicious-ips";
const IP_REPUTATION_CACHE_KEY = "security:ip-reputation";
const IP_BLOCK_HISTORY_KEY = "security:ip-block-history";

declare global {
  var __blockedIpsRedisClient: RedisClient | undefined;
}

/**
 * Mask an IP address for safe logging/telemetry to avoid exposing raw PII.
 * IPv4: 192.0.2.123 -> 192.0.2.xxx
 * IPv6: 2001:db8::1 -> 2001:db8:...:1
 */
function maskIp(ip?: string): string {
  if (!ip) return "[redacted]";
  if (ip.includes(":")) {
    const parts = ip.split(":").filter(Boolean);
    if (parts.length <= 2) return "[redacted]";
    const first = parts.slice(0, 2).join(":");
    const last = parts[parts.length - 1];
    return `${first}:...:${last}`;
  }
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
  return "[redacted]";
}

/**
 * Get or create Redis client for blocked IPs management
 */
async function getBlockedIpsClient(): Promise<RedisClient | null> {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn(
      "REDIS_URL not configured. Blocked IPs functionality disabled."
    );
    return null;
  }

  if (!globalThis.__blockedIpsRedisClient) {
    const client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 3) return new Error("Max retries exceeded");
          return Math.min(retries * 100, 3000);
        },
      },
    });

    client.on("error", (error) => {
      console.error("Blocked IPs Redis error:", error);
      Sentry.captureException(error, {
        tags: { component: "blocked-ips-cache" },
      });
    });

    globalThis.__blockedIpsRedisClient = client;
  }

  const client = globalThis.__blockedIpsRedisClient;
  if (!client) return null;

  if (!client.isOpen) {
    await client.connect();
  }

  return client;
}

export interface BlockedIPEntry {
  ip: string;
  reason: "malicious" | "suspicious" | "manual" | "honeypot";
  blocked_at: string;
  blocked_until?: string; // For temporary blocks
  source: "greynoise" | "manual" | "honeypot" | "rate-limit";
  confidence_score: number;
  request_count_when_blocked: number;
  metadata?: {
    country?: string;
    asn?: string;
    organization?: string;
    tags?: string[];
  };
}

export interface IPBlockStats {
  total_blocked: number;
  malicious_count: number;
  suspicious_count: number;
  manual_count: number;
  temporary_count: number;
  permanent_count: number;
}

/**
 * Blocked IPs Manager
 */
export class BlockedIPsManager {
  private client: RedisClient | null = null;

  async initialize(): Promise<void> {
    this.client = await getBlockedIpsClient();
  }

  /**
   * Check if an IP is currently blocked
   */
  async isBlocked(ip: string): Promise<{
    is_blocked: boolean;
    reason?: string;
    blocked_until?: string;
    entry?: BlockedIPEntry;
  }> {
    if (!this.client) {
      return { is_blocked: false };
    }

    try {
      // Check permanent blocks
      const blockedEntry = await this.client.hGet(BLOCKED_IPS_KEY, ip);
      if (blockedEntry) {
        const entry: BlockedIPEntry = JSON.parse(blockedEntry);

        // Check if temporary block has expired
        if (entry.blocked_until) {
          const expiryTime = new Date(entry.blocked_until);
          if (new Date() > expiryTime) {
            // Remove expired block
            await this.unblockIP(ip, "temporary-block-expired");
            return { is_blocked: false };
          }
        }

        return {
          is_blocked: true,
          reason: entry.reason,
          blocked_until: entry.blocked_until,
          entry,
        };
      }

      return { is_blocked: false };
    } catch (error) {
      const maskedIp = maskIp(ip);
      console.error("Error checking client address (details redacted).", error);
      Sentry.captureException(error, {
        tags: { component: "blocked-ips", operation: "check" },
        extra: { ip_masked: maskedIp },
      });
      return { is_blocked: false }; // Fail open for availability
    }
  }

  /**
   * Block an IP address
   */
  async blockIP(
    ip: string,
    reason: BlockedIPEntry["reason"],
    source: BlockedIPEntry["source"],
    options: {
      confidence_score?: number;
      request_count?: number;
      temporary_hours?: number;
      metadata?: BlockedIPEntry["metadata"];
    } = {}
  ): Promise<void> {
    if (!this.client) {
      console.warn("Cannot block client address: Redis not available");
      return;
    }

    const blockedAt = new Date().toISOString();
    const blockedUntil = options.temporary_hours
      ? new Date(
          Date.now() + options.temporary_hours * 60 * 60 * 1000
        ).toISOString()
      : undefined;

    const entry: BlockedIPEntry = {
      ip,
      reason,
      blocked_at: blockedAt,
      blocked_until: blockedUntil,
      source,
      confidence_score: options.confidence_score || 0,
      request_count_when_blocked: options.request_count || 0,
      metadata: options.metadata,
    };

    try {
      // Add to blocked IPs set
      await this.client.hSet(BLOCKED_IPS_KEY, ip, JSON.stringify(entry));

      // Add to block history for analytics
      const historyKey = `${IP_BLOCK_HISTORY_KEY}:${new Date().toISOString().split("T")[0]}`;
      await this.client.lPush(
        historyKey,
        JSON.stringify({
          ...entry,
          action: "blocked",
          timestamp: blockedAt,
        })
      );
      await this.client.expire(historyKey, 86400 * 30); // Keep history for 30 days

      // Set expiry for temporary blocks
      if (blockedUntil) {
        const ttlSeconds = Math.floor(
          (new Date(blockedUntil).getTime() - Date.now()) / 1000
        );
        await this.client.expire(`${BLOCKED_IPS_KEY}:${ip}`, ttlSeconds);
      }

      const maskedIp = maskIp(ip);
      console.warn(`Blocked client (reason: ${reason}, source: ${source})`);

      // Log to Sentry for monitoring (mask IPs in telemetry)
      Sentry.addBreadcrumb({
        category: "security",
        message: `Client blocked`,
        level: "info",
        data: {
          ip_masked: maskedIp,
          reason,
          source,
          temporary: !!blockedUntil,
          confidence: options.confidence_score,
        },
      });
    } catch (error) {
      const maskedIp = maskIp(ip);
      console.error("Error blocking client address (details redacted).", error);
      Sentry.captureException(error, {
        tags: { component: "blocked-ips", operation: "block" },
        extra: { ip_masked: maskedIp, reason, source, options },
      });
    }
  }

  /**
   * Unblock an IP address
   */
  async unblockIP(ip: string, reason: string): Promise<void> {
    if (!this.client) {
      console.warn("Cannot unblock client address: Redis not available");
      return;
    }

    try {
      const removed = await this.client.hDel(BLOCKED_IPS_KEY, ip);

      if (removed) {
        // Add to unblock history
        const historyKey = `${IP_BLOCK_HISTORY_KEY}:${new Date().toISOString().split("T")[0]}`;
        await this.client.lPush(
          historyKey,
          JSON.stringify({
            ip,
            action: "unblocked",
            reason,
            timestamp: new Date().toISOString(),
          })
        );

        const maskedIp = maskIp(ip);
        console.warn(`Unblocked client (reason: ${reason})`);

        Sentry.addBreadcrumb({
          category: "security",
          message: `Client unblocked`,
          level: "info",
          data: { ip_masked: maskedIp, reason },
        });
      }
    } catch (error) {
      const maskedIp = maskIp(ip);
      console.error(
        "Error unblocking client address (details redacted).",
        error
      );
      Sentry.captureException(error, {
        tags: { component: "blocked-ips", operation: "unblock" },
        extra: { ip_masked: maskedIp, reason },
      });
    }
  }

  /**
   * Add IP to suspicious list (enhanced rate limiting)
   */
  async markSuspicious(
    ip: string,
    source: string,
    metadata?: BlockedIPEntry["metadata"]
  ): Promise<void> {
    if (!this.client) return;

    try {
      const entry = {
        ip,
        source,
        marked_at: new Date().toISOString(),
        metadata,
      };

      await this.client.hSet(SUSPICIOUS_IPS_KEY, ip, JSON.stringify(entry));

      // Set TTL for suspicious marking (24 hours)
      await this.client.expire(`${SUSPICIOUS_IPS_KEY}:${ip}`, 86400);

      console.warn(`Marked client as suspicious (source: ${source})`);
    } catch (error) {
      const maskedIp = maskIp(ip);
      console.error(
        "Error marking client as suspicious (details redacted).",
        error
      );
    }
  }

  /**
   * Check if IP is marked as suspicious
   */
  async isSuspicious(ip: string): Promise<boolean> {
    if (!this.client) return false;

    try {
      const entry = await this.client.hExists(SUSPICIOUS_IPS_KEY, ip);
      return entry === 1;
    } catch (error) {
      const maskedIp = maskIp(ip);
      console.error(
        "Error checking if client address (details redacted).",
        error
      );
      return false;
    }
  }

  /**
   * Get all blocked IPs
   */
  async getAllBlockedIPs(): Promise<BlockedIPEntry[]> {
    if (!this.client) return [];

    try {
      const entries = await this.client.hGetAll(BLOCKED_IPS_KEY);
      return Object.values(entries).map((entry) => JSON.parse(entry));
    } catch (error) {
      console.error("Error getting all blocked IPs:", error);
      return [];
    }
  }

  /**
   * Get blocking statistics
   */
  async getBlockStats(): Promise<IPBlockStats> {
    const blockedIPs = await this.getAllBlockedIPs();

    return {
      total_blocked: blockedIPs.length,
      malicious_count: blockedIPs.filter((ip) => ip.reason === "malicious")
        .length,
      suspicious_count: blockedIPs.filter((ip) => ip.reason === "suspicious")
        .length,
      manual_count: blockedIPs.filter((ip) => ip.reason === "manual").length,
      temporary_count: blockedIPs.filter((ip) => ip.blocked_until).length,
      permanent_count: blockedIPs.filter((ip) => !ip.blocked_until).length,
    };
  }

  /**
   * Clean up expired temporary blocks
   */
  async cleanupExpiredBlocks(): Promise<number> {
    if (!this.client) return 0;

    try {
      const blockedIPs = await this.getAllBlockedIPs();
      let cleanedCount = 0;

      for (const entry of blockedIPs) {
        if (entry.blocked_until) {
          const expiryTime = new Date(entry.blocked_until);
          if (new Date() > expiryTime) {
            await this.unblockIP(entry.ip, "temporary-block-expired");
            cleanedCount++;
          }
        }
      }

      if (cleanedCount > 0) {
        console.warn(`Cleaned up ${cleanedCount} expired IP blocks`);
      }

      return cleanedCount;
    } catch (error) {
      console.error("Error cleaning up expired blocks:", error);
      return 0;
    }
  }

  /**
   * Bulk block IPs from reputation analysis
   */
  async bulkBlockIPs(
    reputationEntries: IPReputationEntry[],
    source: BlockedIPEntry["source"]
  ): Promise<{ blocked: number; skipped: number }> {
    let blocked = 0;
    let skipped = 0;

    for (const entry of reputationEntries) {
      // Check if already blocked
      const existingBlock = await this.isBlocked(entry.ip);
      if (existingBlock.is_blocked) {
        skipped++;
        continue;
      }

      // Determine block type based on classification
      if (entry.classification === "malicious") {
        await this.blockIP(entry.ip, "malicious", source, {
          confidence_score: entry.confidence_score,
          metadata: {
            country: entry.metadata?.country,
            asn: entry.metadata?.asn,
            organization: entry.metadata?.organization,
            tags: entry.tags,
          },
        });
        blocked++;
      } else if (entry.classification === "suspicious") {
        await this.markSuspicious(entry.ip, source, entry.metadata);
        blocked++;
      }
    }

    return { blocked, skipped };
  }
}

// Singleton instance
let blockedIPsManager: BlockedIPsManager | null = null;

/**
 * Get global blocked IPs manager instance
 */
export async function getBlockedIPsManager(): Promise<BlockedIPsManager> {
  if (!blockedIPsManager) {
    blockedIPsManager = new BlockedIPsManager();
    await blockedIPsManager.initialize();
  }
  return blockedIPsManager;
}

/**
 * Quick helper functions for common operations
 */
export async function isIPBlocked(ip: string): Promise<boolean> {
  const manager = await getBlockedIPsManager();
  const result = await manager.isBlocked(ip);
  return result.is_blocked;
}

export async function isIPSuspicious(ip: string): Promise<boolean> {
  const manager = await getBlockedIPsManager();
  return await manager.isSuspicious(ip);
}
