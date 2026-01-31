/**
 * Credly Data Server-Side Fetcher
 *
 * SERVER-SIDE ONLY - Do not import in client components!
 *
 * Provides direct Redis access for Credly badge data.
 * Used by server components to fetch data and pass to client components as props.
 *
 * Benefits:
 * - No rate limiting (direct Redis access)
 * - No client-side API calls
 * - Shared cache between dev and preview (unified 'preview:' prefix)
 * - Fast server-side rendering
 */

import { redis } from '@/lib/redis';
import { getRedisKeyPrefix } from '@/mcp/shared/redis-client';
import type { CredlyBadge, CredlySkill } from '@/types/credly';

// ============================================================================
// TYPES
// ============================================================================

export interface CredlyBadgesData {
  badges: CredlyBadge[];
  totalCount: number;
  source: 'redis-cache' | 'empty';
  error?: string;
}

export interface CredlySkillsData {
  skills: SkillWithCount[];
  totalCount: number;
  source: 'redis-cache' | 'empty';
  error?: string;
}

export interface SkillWithCount {
  skill: CredlySkill;
  count: number;
  badges: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const REDIS_KEY_BASE = 'credly:badges:';
const DEFAULT_USERNAME = 'dcyfr';

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Create Redis key for Credly badges
 * Uses unified 'preview:' prefix for all non-production environments
 */
function createRedisKey(username: string, limit?: number): string {
  const prefix = getRedisKeyPrefix();
  const key = `${prefix}${REDIS_KEY_BASE}${username}:${limit || 'all'}`;

  console.log('[Credly Data] 🔑 Redis key:', {
    key,
    prefix,
    username,
    limit: limit || 'all',
  });

  return key;
}

// ============================================================================
// DATA FETCHERS (SERVER-SIDE ONLY)
// ============================================================================

/**
 * Fetch Credly badges from Redis cache (SERVER-SIDE ONLY)
 *
 * @param username - Credly username (default: 'dcyfr')
 * @param limit - Optional limit (matches cache keys: 'all', '10', '3')
 * @returns Badge data with source indicator
 */
export async function getCredlyBadges(
  username: string = DEFAULT_USERNAME,
  limit?: number
): Promise<CredlyBadgesData> {
  const redisKey = createRedisKey(username, limit);

  try {
    const cached = await redis.get(redisKey);

    if (cached) {
      // Handle both string and object responses from Upstash
      let data = typeof cached === 'string' ? JSON.parse(cached) : cached;

      // Handle case where cached data is just an array (old format from populate-cache)
      if (Array.isArray(data)) {
        data = {
          badges: data,
          total_count: data.length,
        };
      }

      // Ensure badges array exists
      const badges = Array.isArray(data.badges) ? data.badges : [];
      const totalCount = data.total_count || data.count || badges.length || 0;

      console.log('[Credly Data] ✅ Cache HIT', {
        key: redisKey,
        cachedType: typeof cached,
        badgeCount: badges.length,
        totalCount,
      });

      return {
        badges,
        totalCount,
        source: 'redis-cache',
      };
    }

    console.warn('[Credly Data] ⚠️ Cache MISS', { key: redisKey });

    return {
      badges: [],
      totalCount: 0,
      source: 'empty',
      error: `Cache key not found: ${redisKey}. Run 'npm run populate:cache' or deploy to populate.`,
    };
  } catch (error) {
    console.error('[Credly Data] ❌ Redis error:', error);

    return {
      badges: [],
      totalCount: 0,
      source: 'empty',
      error: error instanceof Error ? error.message : 'Unknown Redis error',
    };
  }
}

/**
 * Fetch and aggregate skills from Credly badges (SERVER-SIDE ONLY)
 *
 * Aggregates skills across all badges, counting occurrences and
 * tracking which badges include each skill.
 *
 * @param username - Credly username (default: 'dcyfr')
 * @param excludeSkills - Optional list of skill names to exclude
 * @returns Aggregated skills sorted by count (descending)
 */
export async function getCredlySkills(
  username: string = DEFAULT_USERNAME,
  excludeSkills: string[] = []
): Promise<CredlySkillsData> {
  // Fetch all badges (no limit) for complete skill aggregation
  const badgesData = await getCredlyBadges(username);

  if (badgesData.source === 'empty' || badgesData.badges.length === 0) {
    return {
      skills: [],
      totalCount: 0,
      source: badgesData.source,
      error: badgesData.error,
    };
  }

  // Aggregate skills from all badges
  const skillMap = new Map<string, SkillWithCount>();
  const excludeSet = new Set(excludeSkills.map((s) => s.toLowerCase()));

  for (const badge of badgesData.badges) {
    const badgeSkills = badge.badge_template?.skills || [];

    for (const skill of badgeSkills) {
      // Skip excluded skills
      if (excludeSet.has(skill.name.toLowerCase())) {
        continue;
      }

      // Skip overly long "skill names" that are actually descriptions
      if (skill.name.length > 80) {
        continue;
      }

      const existing = skillMap.get(skill.id);
      if (existing) {
        existing.count++;
        existing.badges.push(badge.badge_template.name);
      } else {
        skillMap.set(skill.id, {
          skill,
          count: 1,
          badges: [badge.badge_template.name],
        });
      }
    }
  }

  // Convert to array and sort by count (descending), then alphabetically
  const skills = Array.from(skillMap.values()).sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return a.skill.name.localeCompare(b.skill.name);
  });

  console.log('[Credly Data] ✅ Skills aggregated', {
    totalSkills: skills.length,
    fromBadges: badgesData.badges.length,
    excluded: excludeSkills.length,
  });

  return {
    skills,
    totalCount: skills.length,
    source: 'redis-cache',
  };
}

// ============================================================================
// CACHE VALIDATION (FOR DEBUGGING)
// ============================================================================

/**
 * Check if Credly cache is populated (for debugging/validation)
 */
export async function validateCredlyCache(username: string = DEFAULT_USERNAME): Promise<{
  isPopulated: boolean;
  keys: { key: string; found: boolean; count?: number }[];
  prefix: string;
}> {
  const prefix = getRedisKeyPrefix();
  const variants = ['all', '10', '3'] as const;
  const keys: { key: string; found: boolean; count?: number }[] = [];

  for (const limit of variants) {
    const redisKey = createRedisKey(username, limit === 'all' ? undefined : parseInt(limit));
    try {
      const cached = await redis.get(redisKey);
      if (cached && typeof cached === 'string') {
        const data = JSON.parse(cached);
        keys.push({
          key: redisKey,
          found: true,
          count: data.badges?.length || data.count || 0,
        });
      } else {
        keys.push({ key: redisKey, found: false });
      }
    } catch {
      keys.push({ key: redisKey, found: false });
    }
  }

  const isPopulated = keys.some((k) => k.found);

  return { isPopulated, keys, prefix };
}
