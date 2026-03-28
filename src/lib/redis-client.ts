/**
 * Redis Client — Upstash-backed adapter
 *
 * Wraps @upstash/redis with a node-redis-compatible interface so all
 * existing consumers work without changes. Credentials come from
 * UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (already configured).
 *
 * Replaces the previous node-redis (redis@5) implementation.
 * After all callers are validated the `redis` npm package can be removed
 * from package.json (manual step — see task 1.6).
 *
 * @module lib/redis-client
 */

import 'server-only';
import { Redis } from '@upstash/redis';

// ---------------------------------------------------------------------------
// Environment helpers (public API preserved)
// ---------------------------------------------------------------------------

export function getRedisEnvironment(): 'production' | 'development' | 'test' {
  if (process.env.NODE_ENV === 'production') return 'production';
  if (process.env.NODE_ENV === 'test') return 'test';
  return 'development';
}

export function getRedisKeyPrefix(): string {
  switch (getRedisEnvironment()) {
    case 'production':
      return 'dcyfr:prod:';
    case 'test':
      return 'dcyfr:test:';
    default:
      return 'dcyfr:dev:';
  }
}

// ---------------------------------------------------------------------------
// Pipeline compatibility wrapper
//
// node-redis multi() returns a pipeline with camelCase methods + exec().
// Upstash pipeline() uses lowercase methods. We proxy the camelCase names.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPipeline = any;
// ---------------------------------------------------------------------------

interface CompatPipeline {
  get(key: string): this;
  set(key: string, value: unknown): this;
  setEx(key: string, ttl: number, value: unknown): this;
  del(...keys: string[]): this;
  exists(...keys: string[]): this;
  incr(key: string): this;
  decr(key: string): this;
  expire(key: string, seconds: number): this;
  ttl(key: string): this;
  pTTL(key: string): this;
  mGet(...keys: string[]): this;
  zAdd(key: string, member: { score: number; value: string }): this;
  zCount(key: string, min: number | string, max: number | string): this;
  zRemRangeByScore(key: string, min: number | string, max: number | string): this;
  zRange(key: string, start: number, stop: number): this;
  zRangeByScore(key: string, min: number | string, max: number | string): this;
  zScore(key: string, member: string): this;
  zRem(key: string, ...members: string[]): this;
  lPush(key: string, ...values: unknown[]): this;
  rPush(key: string, ...values: unknown[]): this;
  lRange(key: string, start: number, stop: number): this;
  lTrim(key: string, start: number, stop: number): this;
  hGet(key: string, field: string): this;
  hGetAll(key: string): this;
  hSet(key: string, field: string, value: unknown): this;
  hDel(key: string, ...fields: string[]): this;
  hExists(key: string, field: string): this;
  hIncrBy(key: string, field: string, increment: number): this;
  exec(): Promise<unknown[]>;
}

function buildCompatPipeline(p: AnyPipeline): CompatPipeline {
  const compat: CompatPipeline = {
    get: (key) => {
      p.get(key);
      return compat;
    },
    set: (key, value) => {
      p.set(key, value);
      return compat;
    },
    setEx: (key, ttl, value) => {
      p.setex(key, ttl, value);
      return compat;
    },
    del: (...keys) => {
      p.del(...keys);
      return compat;
    },
    exists: (...keys) => {
      p.exists(...keys);
      return compat;
    },
    incr: (key) => {
      p.incr(key);
      return compat;
    },
    decr: (key) => {
      p.decr(key);
      return compat;
    },
    expire: (key, seconds) => {
      p.expire(key, seconds);
      return compat;
    },
    ttl: (key) => {
      p.ttl(key);
      return compat;
    },
    pTTL: (key) => {
      p.pttl(key);
      return compat;
    },
    mGet: (...keys) => {
      p.mget(...keys);
      return compat;
    },
    zAdd: (key, member) => {
      p.zadd(key, { score: member.score, member: member.value });
      return compat;
    },
    zCount: (key, min, max) => {
      p.zcount(key, min, max);
      return compat;
    },
    zRemRangeByScore: (key, min, max) => {
      p.zremrangebyscore(key, min, max);
      return compat;
    },
    zRange: (key, start, stop) => {
      p.zrange(key, start, stop);
      return compat;
    },
    zRangeByScore: (key, min, max) => {
      p.zrange(key, min, max, { byScore: true });
      return compat;
    },
    zScore: (key, member) => {
      p.zscore(key, member);
      return compat;
    },
    zRem: (key, ...members) => {
      p.zrem(key, ...members);
      return compat;
    },
    lPush: (key, ...values) => {
      p.lpush(key, ...values);
      return compat;
    },
    rPush: (key, ...values) => {
      p.rpush(key, ...values);
      return compat;
    },
    lRange: (key, start, stop) => {
      p.lrange(key, start, stop);
      return compat;
    },
    lTrim: (key, start, stop) => {
      p.ltrim(key, start, stop);
      return compat;
    },
    hGet: (key, field) => {
      p.hget(key, field);
      return compat;
    },
    hGetAll: (key) => {
      p.hgetall(key);
      return compat;
    },
    hSet: (key, field, value) => {
      p.hset(key, { [field]: value });
      return compat;
    },
    hDel: (key, ...fields) => {
      p.hdel(key, ...fields);
      return compat;
    },
    hExists: (key, field) => {
      p.hexists(key, field);
      return compat;
    },
    hIncrBy: (key, field, increment) => {
      p.hincrby(key, field, increment);
      return compat;
    },
    exec: () => p.exec(),
  };
  return compat;
}

// ---------------------------------------------------------------------------
// Main compatibility client
// ---------------------------------------------------------------------------

interface CompatClient {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown, opts?: { ex?: number; px?: number }): Promise<'OK' | null>;
  setEx(key: string, ttl: number, value: unknown): Promise<'OK'>;
  setex(key: string, ttl: number, value: unknown): Promise<'OK'>;
  del(...keys: string[]): Promise<number>;
  exists(...keys: string[]): Promise<number>;
  ping(): Promise<'PONG'>;
  incr(key: string): Promise<number>;
  decr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<boolean>;
  ttl(key: string): Promise<number>;
  pTTL(key: string): Promise<number>;
  pExpireAt(key: string, timestampMs: number): Promise<boolean>;
  keys(pattern: string): Promise<string[]>;
  mGet(...keys: string[]): Promise<unknown[]>;
  zAdd(key: string, member: { score: number; value: string }): Promise<number>;
  zCount(key: string, min: number | string, max: number | string): Promise<number>;
  zRemRangeByScore(key: string, min: number | string, max: number | string): Promise<number>;
  zRange(key: string, start: number | string, stop: number | string): Promise<string[]>;
  zRangeByScore(key: string, min: number | string, max: number | string): Promise<string[]>;
  zScore(key: string, member: string): Promise<number | null>;
  zRem(key: string, ...members: string[]): Promise<number>;
  lPush(key: string, ...values: unknown[]): Promise<number>;
  rPush(key: string, ...values: unknown[]): Promise<number>;
  lRange(key: string, start: number, stop: number): Promise<string[]>;
  lTrim(key: string, start: number, stop: number): Promise<'OK'>;
  hGet(key: string, field: string): Promise<unknown>;
  hGetAll(key: string): Promise<Record<string, unknown>>;
  hSet(key: string, field: string, value: unknown): Promise<number>;
  hDel(key: string, ...fields: string[]): Promise<number>;
  hExists(key: string, field: string): Promise<boolean>;
  hIncrBy(key: string, field: string, increment: number): Promise<number>;
  sAdd(key: string, ...members: unknown[]): Promise<number>;
  sRem(key: string, ...members: unknown[]): Promise<number>;
  sMembers(key: string): Promise<string[]>;
  sIsMember(key: string, member: unknown): Promise<boolean>;
  sCard(key: string): Promise<number>;
  multi(): CompatPipeline;
  scan(
    cursor: string | number,
    opts?: { MATCH?: string; COUNT?: number }
  ): Promise<{ cursor: number; keys: string[] }>;
  isOpen: boolean;
  isReady: boolean;
  quit(): Promise<void>;
  disconnect(): Promise<void>;
  on(event: string, listener: (...args: unknown[]) => void): this;
}

function buildCompatClient(upstash: Redis): CompatClient {
  const setWithOpts = (
    key: string,
    value: unknown,
    opts?: { ex?: number; px?: number }
  ): Promise<'OK' | null> => {
    if (opts?.ex !== undefined) {
      return upstash.set(key, value as string, { ex: opts.ex }) as Promise<'OK' | null>;
    }
    if (opts?.px !== undefined) {
      return upstash.set(key, value as string, { px: opts.px }) as Promise<'OK' | null>;
    }
    return upstash.set(key, value as string) as Promise<'OK' | null>;
  };

  const toScoreMin = (v: number | string): number | `(${number}` | '-inf' | '+inf' =>
    v as number | `(${number}` | '-inf' | '+inf';

  const client: CompatClient = {
    get: (key) => upstash.get(key),
    set: setWithOpts,
    setEx: (key, ttl, value) => upstash.setex(key, ttl, value as string),
    setex: (key, ttl, value) => upstash.setex(key, ttl, value as string),
    del: (...keys) => upstash.del(...keys),
    exists: (...keys) => upstash.exists(...keys),
    incr: (key) => upstash.incr(key),
    decr: (key) => upstash.decr(key),
    expire: async (key, seconds) => (await upstash.expire(key, seconds)) !== 0,
    ttl: (key) => upstash.ttl(key),
    pTTL: (key) => upstash.pttl(key),
    pExpireAt: async (key, timestampMs) => (await upstash.pexpireat(key, timestampMs)) !== 0,
    keys: (pattern) => upstash.keys(pattern),
    mGet: (...keys) => upstash.mget(...keys) as Promise<unknown[]>,
    zAdd: (key, member) =>
      upstash.zadd(key, { score: member.score, member: member.value }) as Promise<number>,
    zCount: (key, min, max) => upstash.zcount(key, toScoreMin(min), toScoreMin(max)),
    zRemRangeByScore: (key, min, max) =>
      upstash.zremrangebyscore(key, toScoreMin(min), toScoreMin(max)),
    zRange: (key, start, stop) =>
      upstash.zrange(key, start as number, stop as number) as Promise<string[]>,
    zRangeByScore: (key, min, max) =>
      upstash.zrange(key, toScoreMin(min), toScoreMin(max), {
        byScore: true,
      }) as Promise<string[]>,
    zScore: (key, member) => upstash.zscore(key, member),
    zRem: (key, ...members) => upstash.zrem(key, ...members),
    lPush: (key, ...values) => upstash.lpush(key, ...(values as string[])),
    rPush: (key, ...values) => upstash.rpush(key, ...(values as string[])),
    lRange: (key, start, stop) => upstash.lrange(key, start, stop),
    lTrim: (key, start, stop) => upstash.ltrim(key, start, stop),
    hGet: (key, field) => upstash.hget(key, field),
    hGetAll: (key) => upstash.hgetall(key) as Promise<Record<string, unknown>>,
    hSet: (key, field, value) => upstash.hset(key, { [field]: value }),
    hDel: (key, ...fields) => upstash.hdel(key, ...fields),
    hExists: async (key, field) => (await upstash.hexists(key, field)) !== 0,
    hIncrBy: (key, field, increment) => upstash.hincrby(key, field, increment),
    sAdd: (key, ...members) => {
      const [first, ...rest] = members as string[];
      return upstash.sadd(key, first, ...rest);
    },
    sRem: (key, ...members) => upstash.srem(key, ...(members as string[])),
    sMembers: (key) => upstash.smembers(key),
    sIsMember: async (key, member) => (await upstash.sismember(key, member as string)) !== 0,
    sCard: (key) => upstash.scard(key),
    multi: () => buildCompatPipeline(upstash.pipeline()),
    scan: async (cursor, opts) => {
      const result = await upstash.scan(Number(cursor), {
        match: opts?.MATCH,
        count: opts?.COUNT,
      });
      return { cursor: Number(result[0]), keys: result[1] };
    },
    ping: () => upstash.ping() as Promise<'PONG'>,
    isOpen: true,
    isReady: true,
    quit: async () => undefined,
    disconnect: async () => undefined,
    on: () => client,
  };
  return client;
}

// ---------------------------------------------------------------------------
// Stub client (when Upstash credentials are not configured)
// ---------------------------------------------------------------------------

function createStubClient(): CompatClient {
  const noop: CompatPipeline = {
    get: () => noop,
    set: () => noop,
    setEx: () => noop,
    del: () => noop,
    exists: () => noop,
    incr: () => noop,
    decr: () => noop,
    expire: () => noop,
    ttl: () => noop,
    pTTL: () => noop,
    mGet: () => noop,
    zAdd: () => noop,
    zCount: () => noop,
    zRemRangeByScore: () => noop,
    zRange: () => noop,
    zRangeByScore: () => noop,
    zScore: () => noop,
    zRem: () => noop,
    lPush: () => noop,
    rPush: () => noop,
    lRange: () => noop,
    lTrim: () => noop,
    hGet: () => noop,
    hGetAll: () => noop,
    hSet: () => noop,
    hDel: () => noop,
    hExists: () => noop,
    hIncrBy: () => noop,
    exec: async () => [],
  };

  const stub: CompatClient = {
    get: async () => null,
    set: async () => 'OK',
    setEx: async () => 'OK',
    setex: async () => 'OK',
    del: async () => 0,
    exists: async () => 0,
    incr: async () => 1,
    decr: async () => -1,
    expire: async () => false,
    ttl: async () => -2,
    pTTL: async () => -2,
    pExpireAt: async () => false,
    keys: async () => [],
    mGet: async () => [],
    zAdd: async () => 0,
    zCount: async () => 0,
    zRemRangeByScore: async () => 0,
    zRange: async () => [],
    zRangeByScore: async () => [],
    zScore: async () => null,
    zRem: async () => 0,
    lPush: async () => 0,
    rPush: async () => 0,
    lRange: async () => [],
    lTrim: async () => 'OK',
    hGet: async () => null,
    hGetAll: async () => ({}),
    hSet: async () => 0,
    hDel: async () => 0,
    hExists: async () => false,
    hIncrBy: async () => 0,
    sAdd: async () => 0,
    sRem: async () => 0,
    sMembers: async () => [],
    sIsMember: async () => false,
    sCard: async () => 0,
    multi: () => noop,
    scan: async () => ({ cursor: 0, keys: [] }),
    ping: async () => 'PONG' as const,
    isOpen: false,
    isReady: false,
    quit: async () => undefined,
    disconnect: async () => undefined,
    on: () => stub,
  };
  return stub;
}

// ---------------------------------------------------------------------------
// Client factory
// ---------------------------------------------------------------------------

function createRedisClient(): CompatClient {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('[Redis] Upstash credentials not set — Redis operations will be stubbed');
    return createStubClient();
  }

  return buildCompatClient(new Redis({ url, token }));
}

/**
 * Exported Redis client instance.
 * Drop-in replacement for the previous node-redis client.
 */
export const redis = createRedisClient();

/**
 * No-op for Upstash HTTP client (no persistent connection to close).
 * Retained for API compatibility with callers that call closeRedis().
 */
export async function closeRedis(): Promise<void> {
  // Upstash uses HTTP — no persistent connection to close
}
