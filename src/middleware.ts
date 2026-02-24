/**
 * Next.js Edge Middleware — request logging via Axiom
 *
 * Every request is logged to Axiom (path, method, status, duration) when
 * AXIOM_TOKEN is configured. Gracefully no-ops in development or when
 * the token is absent.
 *
 * Excludes static assets, _next internals, and image optimisation routes
 * to avoid log noise.
 */

import { NextRequest, NextResponse } from 'next/server';
import { transformMiddlewareRequest } from '@axiomhq/nextjs';
import { Logger, SimpleFetchTransport, ConsoleTransport } from '@axiomhq/logging';
import type { Transport } from '@axiomhq/logging';

// Build logger at module-init time (edge-compatible, no Node.js APIs)
function buildEdgeLogger(): Logger {
  const dataset = process.env.AXIOM_DATASET_LABS ?? 'dcyfr-labs';

  const transports: [Transport, ...Transport[]] = [new ConsoleTransport({ prettyPrint: false })];

  if (process.env.AXIOM_TOKEN) {
    transports.push(
      new SimpleFetchTransport({
        input: `https://api.axiom.co/v1/datasets/${dataset}/ingest`,
        init: {
          headers: {
            Authorization: `Bearer ${process.env.AXIOM_TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      })
    );
  }

  return new Logger({ transports });
}

const logger = buildEdgeLogger();

export function middleware(request: NextRequest): NextResponse {
  const [message, report] = transformMiddlewareRequest(request);
  void logger.info(message, report);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - public assets (images, icons, manifests)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|eot)).*)',
  ],
};
