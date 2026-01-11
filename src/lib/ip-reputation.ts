/**
 * GreyNoise API client for IP reputation lookups
 *
 * Integrates with GreyNoise API v3 to provide IP reputation data
 * Features rate limiting, caching, and error handling
 */

import * as Sentry from "@sentry/nextjs";
import {
  type GreyNoiseIPContext,
  type GreyNoiseQuickCheck,
  type GreyNoiseBulkLookup,
  type GreyNoiseRiotData,
  type IPReputationEntry,
  type IPReputationCheck,
  type IPReputationBulkResult,
} from "@/types/ip-reputation";
import { createClient } from "redis";

const GREYNOISE_BASE_URL = "https://api.greynoise.io/v3";
const CACHE_PREFIX = "ip-reputation:";
const CACHE_TTL_SECONDS = 3600; // 1 hour default cache
const BULK_BATCH_SIZE = 100; // GreyNoise supports up to 500 IPs per request

type RedisClient = ReturnType<typeof createClient>;

declare global {
  var __ipReputationRedisClient: RedisClient | undefined;
}

/**
 * Get or create Redis client for IP reputation caching
 */
async function getIpReputationClient(): Promise<RedisClient | null> {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return null;

  if (!globalThis.__ipReputationRedisClient) {
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
      console.error("IP Reputation Redis error:", error);
      Sentry.captureException(error, {
        tags: { component: "ip-reputation-cache" },
      });
    });

    globalThis.__ipReputationRedisClient = client;
  }

  const client = globalThis.__ipReputationRedisClient;
  if (!client) return null;

  if (!client.isOpen) {
    await client.connect();
  }

  return client;
}

/**
 * GreyNoise API client
 */
export class GreyNoiseClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GREYNOISE_API_KEY || "";
    this.baseUrl = GREYNOISE_BASE_URL;

    if (!this.apiKey) {
      console.warn(
        "GreyNoise API key not configured. Some features may not work."
      );
    }
  }

  /**
   * Make authenticated request to GreyNoise API
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(this.apiKey && { key: this.apiKey }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = new Error(
        `GreyNoise API error: ${response.status} ${response.statusText}`
      );
      Sentry.captureException(error, {
        tags: {
          component: "greynoise-api",
          endpoint,
          status: response.status,
        },
      });
      throw error;
    }

    return response.json();
  }

  /**
   * Get IP context (detailed information)
   */
  async getIpContext(ip: string): Promise<GreyNoiseIPContext> {
    return this.makeRequest<GreyNoiseIPContext>(`/context/${ip}`);
  }

  /**
   * Quick check for IP noise status
   */
  async quickCheck(ip: string): Promise<GreyNoiseQuickCheck> {
    return this.makeRequest<GreyNoiseQuickCheck>(`/quick/${ip}`);
  }

  /**
   * Bulk lookup for multiple IPs
   */
  async bulkLookup(ips: string[]): Promise<GreyNoiseBulkLookup> {
    return this.makeRequest<GreyNoiseBulkLookup>("/context", {
      method: "POST",
      body: JSON.stringify({ ips }),
    });
  }

  /**
   * Check if IP is in RIOT dataset (common business IPs)
   */
  async riotCheck(ip: string): Promise<GreyNoiseRiotData> {
    return this.makeRequest<GreyNoiseRiotData>(`/riot/${ip}`);
  }
}

/**
 * IP Reputation service with caching and analysis
 */
export class IPReputationService {
  private greynoiseClient: GreyNoiseClient;
  private cacheClient: RedisClient | null = null;

  constructor(greynoiseApiKey?: string) {
    this.greynoiseClient = new GreyNoiseClient(greynoiseApiKey);
  }

  /**
   * Initialize Redis cache connection
   */
  async initialize(): Promise<void> {
    this.cacheClient = await getIpReputationClient();
  }

  /**
   * Get cached IP reputation or fetch from GreyNoise
   */
  async getIpReputation(
    ip: string,
    useCache = true
  ): Promise<IPReputationCheck> {
    const startTime = Date.now();

    // Check cache first
    if (useCache && this.cacheClient) {
      try {
        const cached = await this.cacheClient.get(`${CACHE_PREFIX}${ip}`);
        if (cached) {
          const reputation = JSON.parse(cached) as IPReputationEntry;
          return this.buildReputationCheck(ip, reputation, true, startTime);
        }
      } catch (error) {
        console.error("Cache lookup error:", error);
      }
    }

    try {
      // Fetch from GreyNoise API
      const [context, riot] = await Promise.allSettled([
        this.greynoiseClient.getIpContext(ip),
        this.greynoiseClient.riotCheck(ip),
      ]);

      const greynoiseData =
        context.status === "fulfilled" ? context.value : null;
      const riotData = riot.status === "fulfilled" ? riot.value : null;

      // Create reputation entry
      const reputation = this.analyzeReputation(ip, greynoiseData, riotData);

      // Cache the result
      if (this.cacheClient) {
        try {
          await this.cacheClient.setEx(
            `${CACHE_PREFIX}${ip}`,
            CACHE_TTL_SECONDS,
            JSON.stringify(reputation)
          );
        } catch (error) {
          console.error("Cache store error:", error);
        }
      }

      return this.buildReputationCheck(ip, reputation, false, startTime);
    } catch (error) {
      console.error("GreyNoise lookup error:", error);
      Sentry.captureException(error, {
        tags: { component: "ip-reputation", ip },
      });

      // Return unknown classification on error
      const unknownReputation: IPReputationEntry = {
        ip,
        classification: "unknown",
        first_seen: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        source: "greynoise",
        confidence_score: 0,
        tags: ["lookup-failed"],
      };

      return this.buildReputationCheck(ip, unknownReputation, false, startTime);
    }
  }

  /**
   * Bulk check multiple IPs efficiently
   */
  async bulkCheckReputation(ips: string[]): Promise<IPReputationBulkResult> {
    const startTime = Date.now();
    const results: IPReputationCheck[] = [];

    // Process in batches to respect API limits
    const batches = this.chunkArray(ips, BULK_BATCH_SIZE);

    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map((ip) => this.getIpReputation(ip))
      );
      results.push(...batchResults);
    }

    // Calculate statistics
    const malicious_count = results.filter((r) => r.is_malicious).length;
    const suspicious_count = results.filter((r) => r.is_suspicious).length;
    const benign_count = results.filter((r) => r.is_benign).length;
    const unknown_count = results.filter(
      (r) => !r.is_malicious && !r.is_suspicious && !r.is_benign
    ).length;

    return {
      total_checked: results.length,
      malicious_count,
      suspicious_count,
      benign_count,
      unknown_count,
      results,
      processing_time_ms: Date.now() - startTime,
    };
  }

  /**
   * Analyze GreyNoise data to determine reputation
   */
  private analyzeReputation(
    ip: string,
    greynoiseData: GreyNoiseIPContext | null,
    riotData: GreyNoiseRiotData | null
  ): IPReputationEntry {
    const now = new Date().toISOString();

    // RIOT data indicates known business/legitimate services
    if (riotData?.riot) {
      return {
        ip,
        classification: "benign",
        first_seen: greynoiseData?.first_seen || now,
        last_seen: greynoiseData?.last_seen || now,
        last_updated: now,
        source: "greynoise",
        greynoise_data: greynoiseData || undefined,
        riot_data: riotData,
        confidence_score: 95,
        tags: ["riot", riotData.category || "business"].filter(Boolean),
        metadata: {
          country: greynoiseData?.metadata?.country,
          asn: greynoiseData?.metadata?.asn,
          organization: greynoiseData?.metadata?.organization || riotData.name,
          vpn: greynoiseData?.vpn,
          tor: greynoiseData?.metadata?.tor,
          bot: greynoiseData?.bot,
        },
      };
    }

    // Malicious classification
    if (greynoiseData?.classification === "malicious") {
      return {
        ip,
        classification: "malicious",
        first_seen: greynoiseData.first_seen || now,
        last_seen: greynoiseData.last_seen || now,
        last_updated: now,
        source: "greynoise",
        greynoise_data: greynoiseData,
        confidence_score: 90,
        tags: greynoiseData.tags || [],
        metadata: {
          country: greynoiseData.metadata?.country,
          asn: greynoiseData.metadata?.asn,
          organization: greynoiseData.metadata?.organization,
          vpn: greynoiseData.vpn,
          tor: greynoiseData.metadata?.tor,
          bot: greynoiseData.bot,
        },
      };
    }

    // Suspicious indicators
    const suspiciousFactors = [];
    if (greynoiseData?.metadata?.tor) suspiciousFactors.push("tor");
    if (greynoiseData?.vpn) suspiciousFactors.push("vpn");
    if (greynoiseData?.bot) suspiciousFactors.push("bot");
    if (
      greynoiseData?.tags?.some((tag) =>
        ["scanner", "bruteforce", "exploit", "malware"].some((bad) =>
          tag.toLowerCase().includes(bad)
        )
      )
    ) {
      suspiciousFactors.push("scanning");
    }

    if (suspiciousFactors.length > 0) {
      return {
        ip,
        classification: "suspicious",
        first_seen: greynoiseData?.first_seen || now,
        last_seen: greynoiseData?.last_seen || now,
        last_updated: now,
        source: "greynoise",
        greynoise_data: greynoiseData || undefined,
        confidence_score: 70,
        tags: [...(greynoiseData?.tags || []), ...suspiciousFactors],
        metadata: {
          country: greynoiseData?.metadata?.country,
          asn: greynoiseData?.metadata?.asn,
          organization: greynoiseData?.metadata?.organization,
          vpn: greynoiseData?.vpn,
          tor: greynoiseData?.metadata?.tor,
          bot: greynoiseData?.bot,
        },
      };
    }

    // Benign or unknown
    return {
      ip,
      classification: greynoiseData?.classification || "unknown",
      first_seen: greynoiseData?.first_seen || now,
      last_seen: greynoiseData?.last_seen || now,
      last_updated: now,
      source: "greynoise",
      greynoise_data: greynoiseData || undefined,
      confidence_score: greynoiseData ? 60 : 0,
      tags: greynoiseData?.tags || [],
      metadata: {
        country: greynoiseData?.metadata?.country,
        asn: greynoiseData?.metadata?.asn,
        organization: greynoiseData?.metadata?.organization,
        vpn: greynoiseData?.vpn,
        tor: greynoiseData?.metadata?.tor,
        bot: greynoiseData?.bot,
      },
    };
  }

  /**
   * Build standardized reputation check result
   */
  private buildReputationCheck(
    ip: string,
    reputation: IPReputationEntry,
    cacheHit: boolean,
    startTime: number
  ): IPReputationCheck {
    return {
      ip,
      is_malicious: reputation.classification === "malicious",
      is_suspicious: reputation.classification === "suspicious",
      is_benign: reputation.classification === "benign",
      should_block: reputation.classification === "malicious",
      should_rate_limit: ["malicious", "suspicious"].includes(
        reputation.classification
      ),
      confidence: reputation.confidence_score,
      sources: [reputation.source],
      details: reputation,
      cache_hit: cacheHit,
      checked_at: new Date().toISOString(),
    };
  }

  /**
   * Utility to chunk array into batches
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}
