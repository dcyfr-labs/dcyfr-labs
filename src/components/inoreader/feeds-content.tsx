/**
 * Feeds Content Component
 *
 * Displays aggregated feeds from Inoreader after authentication.
 * Shows articles in card grid with filtering and search capabilities.
 */

import { InoreaderClient } from '@/lib/inoreader-client';
import { redis } from '@/lib/redis';
import { FeedsList } from './feeds-list';
import type { InoreaderArticle } from '@/types/inoreader';

export async function FeedsContent() {
  const articles = await fetchFeeds();

  if (!articles || articles.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">
          No feeds found. Subscribe to feeds in Inoreader to see content here.
        </p>
      </div>
    );
  }

  return <FeedsList articles={articles} />;
}

/**
 * Fetch feeds from Inoreader API
 * Uses Redis caching to minimize API calls
 */
async function fetchFeeds(): Promise<InoreaderArticle[]> {
  try {
    if (!process.env.INOREADER_CLIENT_ID || !process.env.INOREADER_CLIENT_SECRET) {
      console.error('Inoreader credentials not configured');
      return [];
    }

    if (!redis) {
      console.error('Redis not configured for Inoreader caching');
      return [];
    }

    // Check cache first (5-minute TTL)
    const cacheKey = 'inoreader:feeds:latest';
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached as string);
    }

    // Get stored tokens
    const tokensJson = await redis.get('inoreader:tokens');
    if (!tokensJson) {
      console.error('No Inoreader tokens found');
      return [];
    }

    const tokens = JSON.parse(tokensJson as string);

    // Create client from stored tokens
    const client = InoreaderClient.fromTokens(
      process.env.INOREADER_CLIENT_ID,
      process.env.INOREADER_CLIENT_SECRET,
      {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
      }
    );

    // Fetch latest unread articles (limit 50)
    const articles = await client.getAllUnread(50);

    // Cache results for 5 minutes
    await redis.set(cacheKey, JSON.stringify(articles), {
      ex: 60 * 5, // 5 minutes
    });

    return articles;
  } catch (error) {
    console.error('Error fetching Inoreader feeds:', error);
    return [];
  }
}
