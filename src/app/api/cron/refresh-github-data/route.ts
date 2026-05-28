import { NextResponse } from 'next/server';
import { validateCronRequest } from '@/lib/cron-auth';
import { redis, getRedisEnvironment } from '@/lib/redis-client';
import {
  fetchGitHubContributions,
  GITHUB_CACHE_KEY,
  GITHUB_CACHE_DURATION,
} from '@/inngest/github-functions';

// Fallback key is rotated alongside the main cache so a future cron
// outage degrades to "at most ~1h stale" instead of "frozen for a year".
// Reader at src/lib/github-data.ts:182 reads this key on main-cache miss.
const FALLBACK_CACHE_KEY = 'github:fallback-data';
const FALLBACK_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days — auto-clean if cron is broken for weeks

/** Schedule: Hourly at minute 0 — migrated from Inngest refreshGitHubData */
export async function GET(request: Request) {
  if (!validateCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.warn('[cron/refresh-github-data] Fetching GitHub contributions...');
    const freshData = await fetchGitHubContributions();

    if (!freshData) {
      // Loud failure: silent fetch-failed for weeks was the cause of the
      // 2026-05-27 stale-banner incident. Surface as HTTP 500 so Vercel cron
      // monitoring + Sentry both notice. fetchGitHubContributions() already
      // captured the underlying error to Sentry with full context (auth vs
      // network vs GraphQL); this is the cron-level signal.
      console.error(
        '[cron/refresh-github-data] fetch-failed — see prior Sentry event from fetchGitHubContributions'
      );
      try {
        const Sentry = await import('@sentry/nextjs');
        Sentry.captureMessage('GitHub cache refresh failed (fetch returned null)', {
          level: 'error',
          tags: {
            component: 'github-cache',
            source: 'cron/refresh-github-data',
            reason: 'fetch-failed',
          },
        });
      } catch {
        // Sentry unavailable — console.error above is the floor.
      }
      return NextResponse.json({ success: false, reason: 'fetch-failed' }, { status: 500 });
    }

    if (!redis) {
      console.error('[cron/refresh-github-data] Redis not available', {
        environment: getRedisEnvironment(),
        hasProductionUrl: !!process.env.UPSTASH_REDIS_REST_URL,
      });
      return NextResponse.json({ success: false, reason: 'redis-not-configured' }, { status: 500 });
    }

    const cleanData = {
      contributions: freshData.contributions,
      source: freshData.source,
      totalContributions: freshData.totalContributions,
      lastUpdated: freshData.lastUpdated,
    };

    const ttlSeconds = Math.floor(GITHUB_CACHE_DURATION / 1000);
    const cleanJson = JSON.stringify(cleanData);

    await redis.setEx(GITHUB_CACHE_KEY, ttlSeconds, cleanJson);

    const verification = await redis.get(GITHUB_CACHE_KEY);
    if (!verification) {
      console.error('[cron/refresh-github-data] write-verification-failed');
      return NextResponse.json(
        { success: false, reason: 'write-verification-failed' },
        { status: 500 }
      );
    }

    // Refresh the fallback in lockstep so on the next cron failure the reader
    // shows "Last updated ~1h ago" instead of a year-old frozen snapshot.
    // Best-effort: a fallback-write failure is logged but does not fail the
    // cron — the main cache is the contract; fallback is best-effort durability.
    try {
      await redis.setEx(FALLBACK_CACHE_KEY, FALLBACK_TTL_SECONDS, cleanJson);
    } catch (fallbackError) {
      console.error(
        '[cron/refresh-github-data] fallback-write failed (non-fatal):',
        fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
      );
    }

    return NextResponse.json({
      success: true,
      totalContributions: cleanData.totalContributions,
      cachedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[cron/refresh-github-data] Error:', error);
    try {
      const Sentry = await import('@sentry/nextjs');
      Sentry.captureException(error, {
        level: 'error',
        tags: { component: 'github-cache', source: 'cron/refresh-github-data' },
      });
    } catch {
      // Sentry unavailable.
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
