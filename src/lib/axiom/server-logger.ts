/**
 * Axiom server-side logger factory
 *
 * Creates a Logger instance with:
 *  - ConsoleTransport (always present — required by the Logger type)
 *  - SimpleFetchTransport to Axiom (only when AXIOM_TOKEN is configured)
 *
 * Calling code gets full Axiom observability in production and safe console
 * output in development/CI, with zero code-path changes needed.
 *
 * Usage:
 *   import { createServerLogger } from '@/lib/axiom/server-logger';
 *   const logger = createServerLogger('dcyfr-labs');
 *   logger.info('request processed', { path: '/api/chat', duration_ms: 42 });
 */

import { Logger, SimpleFetchTransport, ConsoleTransport } from '@axiomhq/logging';
import type { Transport } from '@axiomhq/logging';

const AXIOM_API_URL = 'https://api.axiom.co/v1/datasets';

export type ServerLoggerOptions = {
  /** Axiom dataset name. Falls back to AXIOM_DATASET_LABS env var, then 'dcyfr-labs'. */
  dataset?: string;
};

/**
 * Build a server-side Logger wired to Axiom when credentials are available.
 * Safe to call during module initialisation (no side-effects if token is absent).
 */
export function createServerLogger(dataset?: string): Logger {
  const resolvedDataset = dataset ?? process.env.AXIOM_DATASET_LABS ?? 'dcyfr-labs';

  const transports: [Transport, ...Transport[]] = [
    new ConsoleTransport({
      prettyPrint: process.env.NODE_ENV === 'development',
    }),
  ];

  if (process.env.AXIOM_TOKEN) {
    transports.push(
      new SimpleFetchTransport({
        input: `${AXIOM_API_URL}/${resolvedDataset}/ingest`,
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
