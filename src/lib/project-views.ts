import { createClient } from "redis";

const PROJECT_VIEW_KEY_PREFIX = "views:project:";
const PROJECT_VIEW_HISTORY_KEY_PREFIX = "views:history:project:";
const redisUrl = process.env.REDIS_URL;

type RedisClient = ReturnType<typeof createClient>;

declare global {
  var __redisClient: RedisClient | undefined;
}

const formatProjectKey = (projectSlug: string) =>
  `${PROJECT_VIEW_KEY_PREFIX}${projectSlug}`;
const formatProjectHistoryKey = (projectSlug: string) =>
  `${PROJECT_VIEW_HISTORY_KEY_PREFIX}${projectSlug}`;

async function getClient(): Promise<RedisClient | null> {
  if (!redisUrl) return null;

  if (!globalThis.__redisClient) {
    const client = createClient({ url: redisUrl });
    client.on("error", (error) => {
      if (process.env.NODE_ENV !== "production") {
        console.error("Redis error", error);
      }
    });
    globalThis.__redisClient = client;
  }

  const client = globalThis.__redisClient;
  if (!client) return null;

  if (!client.isOpen) {
    await client.connect();
  }

  return client;
}

/**
 * Increment view count for a project by its slug
 * Uses the project slug as the identifier
 * Also records the view in a sorted set for 24-hour tracking
 * @param projectSlug Project slug identifier (from project.slug field)
 * @returns Updated view count, or null if Redis unavailable
 */
export async function incrementProjectViews(
  projectSlug: string
): Promise<number | null> {
  const client = await getClient();
  if (!client) return null;
  try {
    const count = await client.incr(formatProjectKey(projectSlug));

    // Record view in sorted set with timestamp for 24-hour tracking
    const now = Date.now();
    await client.zAdd(formatProjectHistoryKey(projectSlug), {
      score: now,
      value: `${now}`,
    });

    // Clean up views older than 24 hours
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    await client.zRemRangeByScore(
      formatProjectHistoryKey(projectSlug),
      "-inf",
      twentyFourHoursAgo
    );

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
export async function getProjectViews(
  projectSlug: string
): Promise<number | null> {
  const client = await getClient();
  if (!client) return null;
  try {
    const value = await client.get(formatProjectKey(projectSlug));
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
  const client = await getClient();
  const viewMap = new Map<string, number>();

  if (!client) return viewMap;

  try {
    const keys = projectSlugs.map(formatProjectKey);
    const values = await client.mGet(keys);

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
  const client = await getClient();
  const viewMap = new Map<string, number>();

  if (!client) return viewMap;

  try {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    // Use Redis pipeline to batch all zCount operations
    const pipeline = client.multi();
    projectSlugs.forEach((slug) => {
      pipeline.zCount(formatProjectHistoryKey(slug), twentyFourHoursAgo, now);
    });

    const results = await pipeline.exec();

    if (results) {
      results.forEach((result, index) => {
        const count = typeof result === "number" ? result : 0;
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
