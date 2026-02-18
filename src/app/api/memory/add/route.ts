import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp, createRateLimitHeaders } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/error-handler';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { getMemory } from '@dcyfr/ai';

/**
 * POST /api/memory/add
 *
 * Add a user memory to the memory layer.
 *
 * Rate limit: 10 requests per minute per IP
 * Fail closed on Redis errors to protect against abuse during outages
 *
 * @param request - Next.js request object
 * @returns JSON response with memoryId and stored status
 */

const RATE_LIMIT_CONFIG = {
  limit: 10, // 10 requests per minute
  windowInSeconds: 60,
  failClosed: true,
};

type AddMemoryRequest = {
  userId: string;
  message: string;
  context?: Record<string, unknown>;
};

function validateAddMemoryBody(
  body: unknown,
  authenticatedUserId: string
): { error: string; status: number } | { data: AddMemoryRequest } {
  if (!body || typeof body !== 'object') {
    return { error: 'Request body must be a JSON object', status: 400 };
  }
  const { userId, message, context } = body as AddMemoryRequest;
  if (!userId || typeof userId !== 'string') {
    return { error: 'userId is required and must be a string', status: 400 };
  }
  if (authenticatedUserId !== userId) {
    return { error: 'Forbidden: Cannot write memory for a different user', status: 403 };
  }
  if (!message || typeof message !== 'string') {
    return { error: 'message is required and must be a string', status: 400 };
  }
  if (message.trim().length < 1) {
    return { error: 'message cannot be empty', status: 400 };
  }
  if (message.length > 10000) {
    return { error: 'message cannot exceed 10,000 characters', status: 413 };
  }
  if (context !== undefined && (typeof context !== 'object' || context === null)) {
    return { error: 'context must be an object if provided', status: 400 };
  }
  return { data: { userId, message, context } };
}

async function parseJsonBody(request: NextRequest): Promise<{ ok: true; body: unknown } | { ok: false; response: NextResponse }> {
  try {
    const body = await request.json();
    return { ok: true, body };
  } catch (error) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Invalid JSON in request body', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 400 }
      ),
    };
  }
}

async function storeMemory(userId: string, message: string, context: Record<string, unknown> | undefined, rateLimitHeaders: Record<string, string>): Promise<NextResponse> {
  try {
    const memory = getMemory();
    const result = await memory.addUserMemory(userId, message, context);
    console.log('Memory added:', { userId: userId.substring(0, 8) + '...', messageLength: message.length, hasContext: !!context, timestamp: new Date().toISOString() });
    return NextResponse.json({ memoryId: result, stored: true }, { status: 200, headers: rateLimitHeaders });
  } catch (memoryError) {
    console.error('Failed to add memory:', memoryError instanceof Error ? memoryError.message : String(memoryError));
    return NextResponse.json({ error: 'Failed to store memory. Please try again later.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let rawBody: unknown = null;

  try {
    const { user } = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Apply rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = await rateLimit(clientIp, RATE_LIMIT_CONFIG);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            ...createRateLimitHeaders(rateLimitResult),
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const parsed = await parseJsonBody(request);
    if (!parsed.ok) return parsed.response;
    rawBody = parsed.body;

    const validation = validateAddMemoryBody(rawBody, user.id);
    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }
    const { userId, message, context } = validation.data;

    return await storeMemory(userId, message, context, createRateLimitHeaders(rateLimitResult));
  } catch (error) {
    const body = rawBody && typeof rawBody === 'object' ? (rawBody as AddMemoryRequest) : null;
    const errorInfo = handleApiError(error, {
      route: '/api/memory/add',
      method: 'POST',
      additionalData: body ? { userId: body.userId?.substring(0, 8) + '...' } : {},
    });

    if (errorInfo.isConnectionError) {
      return new Response(null, { status: errorInfo.statusCode });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: errorInfo.statusCode });
  }
}
