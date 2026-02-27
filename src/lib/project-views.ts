import { redis } from '@/lib/redis-client';

const PROJECT_VIEW_KEY_PREFIX = 'views:project:';
const PROJECT_VIEW_HISTORY_KEY_PREFIX = 'views:history:project:';

const formatProjectKey = (projectSlug: string) => `${PROJECT_VIEW_KEY_PREFIX}${projectSlug}`;
const formatProjectHistoryKey = (projectSlug: string) =>
  `${PROJECT_VIEW_HISTORY_KEY_PREFIX}${projectSlug}`;

/**
 * Increment view count for a project by its slug
 * Uses the project slug as the identifier
 * Also records the view in a sorted set for 24-hour tracking
 * @param projectSlug Project slug identifier (from project.slug field)
 * @returns Updated view count, or null if Redis unavailable
 */
export async function incrementProjectViews(projectSlug: string): Promise<number | null> {
  try {
    const count = await redis.incr(formatProjectKey(projectSlug));

    // Record view in sorted set with timestamp for 24-hour tracking
    const now = Date.now();
    await redis.zAdd(formatProjectHistoryKey(projectSlug), {
      score: now,
      value: `${now}`,
    });

    // Clean up views older than 24 hours
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    await redis.zRemRangeByScore(formatProjectHistoryKey(projectSlug), '-inf', twentyFourHoursAgo);

    return count;
  } catch {
    return null;
  }
}

/**
 * Get view count for a project by its slug
 * @param projectSlug Project slug identifier (from project.slug field)
 * @returns View count, or null if Redis unavailable
 */
export async function getProjectViews(projectSlug: string): Promise<number | null> {
  try {
    const value = await redis.get(formatProjectKey(projectSlug));
    const parsed = value === null ? null : Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Get view counts for multiple projects at once (by slug)
 * @param projectSlugs Array of project slug identifiers
 * @returns Map of projectSlug -> view count
 */
export async function getMultipleProjectViews(
  projectSlugs: string[]
): Promise<Map<string, number>> {
  const viewMap = new Map<string, number>();

  try {
    const keys = projectSlugs.map(formatProjectKey);
    const values = await redis.mGet(keys);

    projectSlugs.forEach((slug, index) => {
      const value = values[index];
      const parsed = value === null ? 0 : Number(value);
      if (Number.isFinite(parsed)) {
        viewMap.set(slug, parsed);
      }
    });
  } catch {
    // Return empty map on error
  }

  return viewMap;
}

/**
 * Get view counts for multiple projects in the last 24 hours
 * @param projectSlugs Array of project slug identifiers
 * @returns Map of projectSlug -> 24h view count
 */
export async function getMultipleProjectViews24h(
  projectSlugs: string[]
): Promise<Map<string, number>> {
  const viewMap = new Map<string, number>();

  try {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    // Use Redis pipeline to batch all zCount operations
    const pipeline = redis.multi();
    projectSlugs.forEach((slug) => {
      pipeline.zCount(formatProjectHistoryKey(slug), twentyFourHoursAgo, now);
    });

    const results = await pipeline.exec();

    if (results) {
      results.forEach((result, index) => {
        const count = typeof result === 'number' ? result : 0;
        if (Number.isFinite(count)) {
          viewMap.set(projectSlugs[index], count);
        }
      });
    }
  } catch {
    // Return empty map on error
  }

  return viewMap;
}
