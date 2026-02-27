/**
 * Redis Infrastructure Module
 *
 * Consolidated exports for Redis client, cache versioning, and Credly cache
 * Provides unified access to all Redis-related utilities
 *
 * @module redis
 */

export { redis, closeRedis, getRedisEnvironment, getRedisKeyPrefix } from '../redis-client';
export { VersionedCache } from '../cache-versioning';
