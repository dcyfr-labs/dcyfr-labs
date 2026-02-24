/**
 * Axiom proxy route — receives client-side log/WebVitals events and
 * forwards them to Axiom using server-side credentials.
 *
 * Required by the ProxyTransport used in src/lib/axiom/web-vitals.tsx.
 * POST /api/axiom
 */

import { createProxyRouteHandler } from '@axiomhq/nextjs';
import { createServerLogger } from '@/lib/axiom/server-logger';

const logger = createServerLogger();

export const POST = createProxyRouteHandler(logger);
