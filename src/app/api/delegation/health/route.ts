/**
 * Delegation Health API Route
 *
 * GET  /api/delegation/health — returns current health snapshot
 * POST /api/delegation/health — trigger an on-demand metrics collection
 *
 * Used by the delegation-health-cron.mjs monitoring script and any
 * internal dashboards that need to surface the delegation system's status.
 * 
 * TODO: RE-ENABLE after @dcyfr/ai@1.0.5 is published
 * This route is temporarily returning stub data because the delegation health 
 * monitoring exports were added to @dcyfr/ai source after v1.0.4 was published.
 * 
 * Action required:
 * 1. Build and publish @dcyfr/ai@1.0.5 with delegation health monitoring exports
 * 2. Update dcyfr-labs package.json to use @dcyfr/ai@^1.0.5
 * 3. Uncomment original imports and handlers below
 * 4. Remove stub handlers and these TODO comments
 */

import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { rateLimit, getClientIp, createRateLimitHeaders } from '@/lib/rate-limit';

// TEMPORARILY DISABLED - See TODO above
// import {
//   getDelegationHealthSnapshot,
//   initDelegationHealthMonitor,
//   reportAlertToSentry,
// } from '@/lib/delegation/health-monitor';

const RATE_LIMIT_CONFIG = {
  limit: 60,
  windowInSeconds: 60,
  failClosed: true,
};

function isAuthorised(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  const validTokens = [process.env.ADMIN_API_KEY, process.env.CRON_SECRET].filter(
    (v): v is string => typeof v === 'string' && v.length > 0
  );

  if (validTokens.length === 0) {
    console.error('[Delegation Health API] ADMIN_API_KEY/CRON_SECRET not configured');
    return false;
  }

  return validTokens.some((candidate) => {
    try {
      const a = Buffer.from(token, 'utf8');
      const b = Buffer.from(candidate, 'utf8');
      return a.length === b.length && timingSafeEqual(a, b);
    } catch {
      return false;
    }
  });
}

// ---------------------------------------------------------------------------
// STUB HANDLERS - TO BE REPLACED WHEN RE-ENABLED
// ---------------------------------------------------------------------------

/** 
 * GET /api/delegation/health
 * STUB: Returns placeholder data until @dcyfr/ai@1.0.5 is published
 */
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await rateLimit(ip, RATE_LIMIT_CONFIG);
  const rlHeaders = createRateLimitHeaders(rl);

  if (!rl.success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429, headers: rlHeaders });
  }

  if (!isAuthorised(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Return stub data
  const stubSnapshot = {
    timestamp: new Date().toISOString(),
    healthScore: 100,
    status: 'healthy' as const,
    sla: {
      verificationTurnaroundOk: true,
      successRateOk: true,
      latencyOk: true,
      reputationOk: true,
      overall: 'passing' as const,
    },
    metrics: {},
    activeAlerts: [],
    recentAlerts: [],
    _stub: true,
    _message: 'Delegation health monitoring is temporarily disabled. Awaiting @dcyfr/ai@1.0.5',
  };

  return NextResponse.json(stubSnapshot, {
    status: 200,
    headers: {
      ...rlHeaders,
      'Cache-Control': 'no-store',
      'X-Delegation-Health': 'healthy',
      'X-Stub-Data': 'true',
    },
  });
}

/** 
 * POST /api/delegation/health
 * STUB: Returns placeholder data until @dcyfr/ai@1.0.5 is published
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await rateLimit(ip, { limit: 10, windowInSeconds: 60, failClosed: true });
  const rlHeaders = createRateLimitHeaders(rl);

  if (!rl.success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429, headers: rlHeaders });
  }

  if (!isAuthorised(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Return stub response
  return NextResponse.json(
    {
      ok: true,
      action: 'snapshot',
      _stub: true,
      _message: 'Delegation health monitoring is temporarily disabled. Awaiting @dcyfr/ai@1.0.5',
    },
    { headers: rlHeaders }
  );
}

/*
// ---------------------------------------------------------------------------
// ORIGINAL HANDLERS - COMMENTED OUT UNTIL @dcyfr/ai@1.0.5 IS PUBLISHED
// ---------------------------------------------------------------------------

// const ip = getClientIp(request);
// const rl = await rateLimit(ip, RATE_LIMIT_CONFIG);
// const rlHeaders = createRateLimitHeaders(rl);
//
// if (!rl.success) {
//   return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429, headers: rlHeaders });
// }
//
// if (!isAuthorised(request)) {
//   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// }
//
// try {
//   // Make sure the monitor is running (lazy-init on first request)
//   initDelegationHealthMonitor();
//
//   const snapshot = getDelegationHealthSnapshot();
//
//   // Forward critical / error alerts to Sentry
//   for (const alert of snapshot.activeAlerts) {
//     reportAlertToSentry(alert);
//   }
//
//   const httpStatus =
//     snapshot.status === 'healthy' ? 200 : snapshot.status === 'degraded' ? 207 : 503;
//
//   return NextResponse.json(snapshot, {
//     status: httpStatus,
//     headers: {
//       ...rlHeaders,
//       'Cache-Control': 'no-store',
//       'X-Delegation-Health': snapshot.status,
//     },
//   });
// } catch (error) {
//   console.error('[Delegation Health API] GET failed:', error);
//   return NextResponse.json(
//     { error: 'Internal server error', details: String(error) },
//     { status: 500 }
//   );
// }

// /** POST /api/delegation/health — trigger on-demand collection (ORIGINAL - COMMENTED OUT) */
// const ip = getClientIp(request);
// const rl = await rateLimit(ip, { limit: 10, windowInSeconds: 60, failClosed: true });
// const rlHeaders = createRateLimitHeaders(rl);
//
// if (!rl.success) {
//   return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429, headers: rlHeaders });
// }
//
// if (!isAuthorised(request)) {
//   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// }
//
// try {
//   const monitor = initDelegationHealthMonitor();
//
//   // Parse optional action from body
//   let action = 'snapshot';
//   try {
//     const body = (await request.json()) as { action?: string };
//     action = body.action ?? 'snapshot';
//   } catch {
//     // no body — default action
//   }
//
//   if (action === 'restart') {
//     monitor.stop();
//     initDelegationHealthMonitor();
//     return NextResponse.json({ ok: true, action: 'restarted' }, { headers: rlHeaders });
//   }
//
//   const snapshot = getDelegationHealthSnapshot();
//
//   for (const alert of snapshot.activeAlerts) {
//     reportAlertToSentry(alert);
//   }
//
//   return NextResponse.json({ ok: true, action: 'snapshot', snapshot }, { headers: rlHeaders });
// } catch (error) {
//   console.error('[Delegation Health API] POST failed:', error);
//   return NextResponse.json(
//     { error: 'Internal server error', details: String(error) },
//     { status: 500 }
//   );
// }

// ---------------------------------------------------------------------------
// END OF COMMENTED CODE
// ---------------------------------------------------------------------------
*/
