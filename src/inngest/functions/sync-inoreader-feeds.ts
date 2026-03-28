/**
 * Inngest Function: Sync Inoreader Feeds
 *
 * Background job that syncs latest articles from Inoreader to Redis cache.
 * Runs every 6 hours to keep feeds fresh and minimize API calls during page loads.
 *
 * Schedule: Every 6 hours
 * Dependencies: Redis, Inoreader OAuth tokens
 */

import { inngest } from '@/inngest/client';
import { InoreaderClient } from '@/lib/inoreader-client';
import { redis } from '@/lib/redis';
import type { InoreaderArticle } from '@/types/inoreader';

export const syncInoreaderFeeds = inngest.createFunction(
  {
    id: 'sync-inoreader-feeds',
    name: 'Sync Inoreader Feeds',
    retries: 3,
  },
  { cron: '0 */6 * * *' }, // Every 6 hours
  async ({ step, logger }) => {
    // Step 1: Validate environment and dependencies
    await step.run('validate-config', async () => {
      if (!process.env.INOREADER_CLIENT_ID || !process.env.INOREADER_CLIENT_SECRET) {
        throw new Error('Inoreader credentials not configured');
      }

      if (!redis) {
        throw new Error('Redis not configured');
      }

      logger.info('Configuration validated');
    });

    // Step 2: Fetch stored tokens
    const tokens = await step.run('fetch-tokens', async () => {
      const tokensJson = await redis!.get('inoreader:tokens');

      if (!tokensJson) {
        throw new Error('No Inoreader tokens found. User needs to authenticate.');
      }

      return JSON.parse(tokensJson as string);
    });

    // Step 3: Create Inoreader client and fetch articles
    const articles: InoreaderArticle[] = await step.run('fetch-articles', async () => {
      logger.info('Creating Inoreader client');

      const client = InoreaderClient.fromTokens(
        process.env.INOREADER_CLIENT_ID!,
        process.env.INOREADER_CLIENT_SECRET!,
        {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
        }
      );

      logger.info('Fetching latest unread articles from Inoreader');

      const unreadArticles = await client.getAllUnread(100);

      logger.info(`Fetched ${unreadArticles.length} articles`);

      return unreadArticles;
    });

    // Step 5: Cache articles in Redis
    await step.run('cache-articles', async () => {
      const cacheKey = 'inoreader:feeds:latest';

      await redis!.set(cacheKey, JSON.stringify(articles), {
        ex: 60 * 60 * 6, // 6 hours TTL (matches cron schedule)
      });

      logger.info(`Cached ${articles.length} articles in Redis`);
    });

    // Step 6: Update feed statistics
    const stats = await step.run('update-stats', async () => {
      // Calculate statistics
      const stats = {
        total_articles: articles.length,
        unique_sources: new Set(articles.map((a) => a.origin.streamId)).size,
        tags: new Set(
          articles.flatMap((a) =>
            a.categories
              .filter((c) => c.startsWith('user/-/label/'))
              .map((c) => c.replace('user/-/label/', ''))
          )
        ).size,
        last_updated: Date.now(),
      };

      // Store statistics
      await redis!.set('inoreader:stats', JSON.stringify(stats), {
        ex: 60 * 60 * 24, // 24 hours TTL
      });

      logger.info('Updated feed statistics', stats);

      return stats;
    });

    // Step 7: Check for content opportunities
    await step.run('analyze-content-opportunities', async () => {
      // Extract trending topics from article titles
      const titleWords = articles
        .flatMap((a) => a.title.toLowerCase().split(/\W+/))
        .filter((word) => word.length > 4); // Filter short words

      // Count word frequency
      const wordFrequency = titleWords.reduce(
        (acc, word) => {
          acc[word] = (acc[word] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      // Get top 10 trending topics
      const trendingTopics = Object.entries(wordFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([word, count]) => ({ word, count }));

      // Store trending topics for blog content ideas
      await redis!.set('inoreader:trending_topics', JSON.stringify(trendingTopics), {
        ex: 60 * 60 * 24, // 24 hours TTL
      });

      logger.info('Analyzed content opportunities', {
        trending_topics: trendingTopics.length,
      });
    });

    return {
      success: true,
      articles_synced: articles.length,
      sources: stats.unique_sources,
      tags: stats.tags,
      timestamp: new Date().toISOString(),
    };
  }
);
