import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/** UUID v4 format validation regex */
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * GET /<key>.txt
 *
 * Serves the IndexNow key verification file required for domain ownership proof.
 * Search engines fetch this file to verify the submitted key belongs to this domain
 * before accepting URL submissions.
 *
 * @see https://www.indexnow.org/documentation
 *
 * Response codes:
 * - 200: Key matches `INDEXNOW_API_KEY` — returns key as plain text
 * - 404: Key does not match (or is not a valid UUID v4)
 * - 503: `INDEXNOW_API_KEY` environment variable not configured
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
): Promise<NextResponse> {
  // In Next.js App Router, [key].txt directory captures the segment before
  // the literal ".txt" suffix. params.key is the raw UUID without extension.
  const { key } = await params;

  const configuredKey = process.env.INDEXNOW_API_KEY;

  if (!configuredKey) {
    return new NextResponse('IndexNow key not configured', {
      status: 503,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Retry-After': '3600',
      },
    });
  }

  // Only accept valid UUID v4 format
  if (!UUID_V4_REGEX.test(key)) {
    return new NextResponse(null, { status: 404 });
  }

  // Must match the configured key exactly
  if (key !== configuredKey) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(configuredKey, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
