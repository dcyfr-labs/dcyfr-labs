/**
 * Axiom proxy route — receives client-side log/WebVitals events and
 * forwards them to Axiom using server-side credentials.
 *
 * Required by the ProxyTransport used in src/lib/axiom/web-vitals.tsx.
 * POST /api/axiom
 *
 * Security: Rate limited to prevent abuse (10 requests/minute per IP)
 */

import { NextRequest } from 'next/server';
import { createProxyRouteHandler } from '@axiomhq/nextjs';
import { createServerLogger } from '@/lib/axiom/server-logger';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { validatePayloadSize, maskIp } from '@/lib/security';

const logger = createServerLogger();

const axiosProxyHandler = createProxyRouteHandler(logger);

export async function POST(request: NextRequest) {
  // Rate limit: 10 requests per minute per IP
  // Fail closed to prevent log flooding during Redis outages
  const clientIp = getClientIp(request);
  const rateLimitResult = await rateLimit(clientIp, {
    limit: 10,
    windowInSeconds: 60,
    failClosed: true,
  });

  if (!rateLimitResult.success) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        limit: rateLimitResult.limit,
        reset: new Date(rateLimitResult.reset).toISOString(),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(rateLimitResult.limit),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(rateLimitResult.reset),
        },
      }
    );
  }

  const configuredMaxPayloadSize = Number.parseInt(
    process.env.MAX_AXIOM_PAYLOAD_SIZE ?? '102400',
    10
  );
  const maxPayloadSize = Number.isFinite(configuredMaxPayloadSize)
    ? configuredMaxPayloadSize
    : 102400;
  const payloadValidation = validatePayloadSize(request, maxPayloadSize);

  if (!payloadValidation.valid) {
    logger.warn('security.axiom.payload_rejected', {
      endpoint: '/api/axiom',
      ip_masked: maskIp(clientIp),
      attempted_size: payloadValidation.size,
      max_size: payloadValidation.maxBytes,
      reason: payloadValidation.reason,
    });

    return new Response(
      JSON.stringify({
        error: 'Payload too large',
        maxBytes: payloadValidation.maxBytes,
        attemptedBytes: payloadValidation.size,
      }),
      {
        status: 413,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return axiosProxyHandler(request);
}
