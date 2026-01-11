/**
 * Redis Health Check Utility
 *
 * Validates Redis configuration and connection status.
 * Used by dev tools to diagnose Redis availability.
 */

import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

export interface RedisHealthStatus {
  enabled: boolean;
  configured: boolean;
  connected: boolean;
  message: string;
  error?: string;
  url?: string;
  testResult?: {
    success: boolean;
    latency: number;
    error?: string;
  };
}

/**
 * Check if Redis is configured
 */
export function isRedisConfigured(): boolean {
  return !!redisUrl;
}

/**
 * Test Redis connection
 */
export async function testRedisConnection(): Promise<RedisHealthStatus> {
  const configured = isRedisConfigured();

  if (!configured) {
    return {
      enabled: false,
      configured: false,
      connected: false,
      message: "Redis not configured (REDIS_URL not set)",
      url: undefined,
    };
  }

  try {
    const client = createClient({ url: redisUrl });

    // Add error handler before connecting
    let connectionError: string | null = null;
    client.on("error", (err) => {
      connectionError = err.message;
    });

    const startTime = Date.now();
    await client.connect();
    const latency = Date.now() - startTime;

    // Test connection with a ping
    const pingStart = Date.now();
    const pongResponse = await client.ping();
    const pingLatency = Date.now() - pingStart;

    // Test basic set/get
    const testKey = `redis-health-check-${Date.now()}`;
    const testValue = "test-value";

    await client.set(testKey, testValue);
    const retrievedValue = await client.get(testKey);
    await client.del(testKey);

    const success = pongResponse === "PONG" && retrievedValue === testValue;

    await client.disconnect();

    return {
      enabled: true,
      configured: true,
      connected: success,
      message: "Redis connected successfully",
      url:
        configured && redisUrl
          ? redisUrl.replace(/:[^:]*@/, ":***@")
          : undefined, // Hide password
      testResult: {
        success,
        latency: Math.max(latency, pingLatency),
        error: connectionError || undefined,
      },
    };
  } catch (error) {
    return {
      enabled: true,
      configured: true,
      connected: false,
      message: "Failed to connect to Redis",
      url:
        configured && redisUrl
          ? redisUrl.replace(/:[^:]*@/, ":***@")
          : undefined, // Hide password
      error: error instanceof Error ? error.message : "Unknown error",
      testResult: {
        success: false,
        latency: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Get Redis status summary
 */
export function getRedisStatus(): string {
  if (!isRedisConfigured()) {
    return "Redis not configured (fallback storage in use)";
  }
  return "Redis configured - test connection for status";
}
