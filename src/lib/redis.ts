/**
 * Redis Client
 *
 * Provides access to Redis for caching and analytics storage.
 * Uses the shared Redis client from MCP with auto-connection.
 */

export { redis, closeRedisClient } from '@/mcp/shared/redis-client';
