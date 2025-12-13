import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { blockExternalAccess } from '@/lib/api-security';
import { checkGitHubDataHealth } from '@/lib/github-data';

export const runtime = 'nodejs';

/**
 * Health Check Endpoint with Sentry Monitoring
 * 
 * This endpoint provides a health status for the application and reports
 * check-ins to Sentry for uptime monitoring. It's designed to be called
 * by Vercel cron jobs every 5 minutes.
 * 
 * @returns JSON response with health status and service checks
 * 
 * Response format:
 * {
 *   status: "healthy" | "degraded" | "unhealthy",
 *   timestamp: ISO 8601 string,
 *   services: {
 *     edge: boolean,
 *     vercel: boolean
 *   },
 *   uptime: process.uptime() in seconds
 * }
 */
export async function GET(request: NextRequest) {
  // Block external access
  const blockResponse = blockExternalAccess(request);
  if (blockResponse) return blockResponse;

  // Start Sentry check-in for uptime monitoring
  const checkId = Sentry.captureCheckIn({
    monitorSlug: 'site-health-check',
    status: 'in_progress',
  });

  try {
    // Check GitHub data cache health
    const githubHealth = await checkGitHubDataHealth();
    
    // Perform health checks
    const healthChecks = {
      timestamp: new Date().toISOString(),
      services: {
        // Edge runtime (always operational in this Node.js runtime)
        edge: true,
        // Vercel platform is working if we can respond
        vercel: true,
      },
      serverInfo: {
        runtime: 'nodejs',
        region: process.env.VERCEL_REGION || (process.env.NODE_ENV === 'development' ? 'local' : 'unknown'),
      },
      githubInfo: {
        lastUpdated: githubHealth.lastUpdated,
        totalContributions: githubHealth.totalContributions,
        cacheAvailable: githubHealth.cacheAvailable,
        dataFresh: githubHealth.dataFresh,
      },
    };

    // Determine overall health status
    const allHealthy = Object.values(healthChecks.services).every(Boolean);
    const status = allHealthy ? 'healthy' : 'degraded';

    // Report successful check-in to Sentry
    Sentry.captureCheckIn({
      checkInId: checkId,
      monitorSlug: 'site-health-check',
      status: 'ok',
    });

    return NextResponse.json(
      {
        status,
        ...healthChecks,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    // Report failed check-in to Sentry
    Sentry.captureCheckIn({
      checkInId: checkId,
      monitorSlug: 'site-health-check',
      status: 'error',
    });

    // Also capture the exception for detailed error tracking
    Sentry.captureException(error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
