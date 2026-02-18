import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp, createRateLimitHeaders } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/error-handler';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { getMemory, type MemorySearchResult } from '@dcyfr/ai';

/**
 * POST /api/memory/search
 *
 * Search user memories using semantic search.
 *
 * Rate limit: 20 requests per minute per IP
 * Fail closed on Redis errors to protect against abuse during outages
 *
 * @param request - Next.js request object
 * @returns JSON response with array of matching memories
 */

const RATE_LIMIT_CONFIG = {
  limit: 20, // 20 requests per minute (more permissive for read operations)
  windowInSeconds: 60,
  failClosed: true,
};

const DEFAULT_LIMIT = 3;
const MAX_LIMIT = 10;

type SearchMemoryRequest = {
  userId: string;
  query: string;
  limit?: number;
};

type MemoryResult = {
  id: string;
  content: string;
  importance?: number;
  topic?: string;
  createdAt?: string;
};

function validateSearchMemoryBody(
  body: unknown,
  authenticatedUserId: string
): { error: string; status: number } | { data: Required<SearchMemoryRequest> } {
  if (!body || typeof body !== 'object') {
    return { error: 'Request body must be a JSON object', status: 400 };
  }
  const { userId, query, limit = DEFAULT_LIMIT } = body as SearchMemoryRequest;
  if (!userId || typeof userId !== 'string') {
    return { error: 'userId is required and must be a string', status: 400 };
  }
  if (authenticatedUserId !== userId) {
    return { error: 'Forbidden: Cannot read memory for a different user', status: 403 };
  }
  if (!query || typeof query !== 'string') {
    return { error: 'query is required and must be a string', status: 400 };
  }
  if (query.trim().length < 1) {
    return { error: 'query cannot be empty', status: 400 };
  }
  if (query.length > 1000) {
    return { error: 'query cannot exceed 1,000 characters', status: 400 };
  }
  if (typeof limit !== 'number' || limit < 1) {
    return { error: 'limit must be a positive number', status: 400 };
  }
  if (limit > MAX_LIMIT) {
    return { error: `limit cannot exceed ${MAX_LIMIT}`, status: 400 };
  }
  return { data: { userId, query, limit } };
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

    try {
      rawBody = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Invalid JSON in request body',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 400 }
      );
    }

    const validation = validateSearchMemoryBody(rawBody, user.id);
    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }
    const { userId, query, limit } = validation.data;

    try {
      const memory = getMemory();
      const results = await memory.searchUserMemories(userId, query, limit);

      const memories: MemoryResult[] = results.map((result: MemorySearchResult) => ({
        id: result.id,
        content: result.content,
        importance: result.importance,
        topic: result.topic,
        createdAt: result.createdAt.toISOString(),
      }));

      console.log('Memory search completed:', {
        userId: userId.substring(0, 8) + '...',
        queryLength: query.length,
        resultCount: memories.length,
        limit,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        { memories, count: memories.length, limit },
        { status: 200, headers: createRateLimitHeaders(rateLimitResult) }
      );
    } catch (memoryError) {
      console.error(
        'Failed to search memories:',
        memoryError instanceof Error ? memoryError.message : String(memoryError)
      );
      return NextResponse.json(
        { error: 'Failed to search memories. Please try again later.' },
        { status: 500 }
      );
    }
  } catch (error) {
    const body =
      rawBody && typeof rawBody === 'object' ? (rawBody as SearchMemoryRequest) : null;
    const errorInfo = handleApiError(error, {
      route: '/api/memory/search',
      method: 'POST',
      additionalData: body ? { userId: body.userId?.substring(0, 8) + '...' } : {},
    });

    if (errorInfo.isConnectionError) {
      return new Response(null, { status: errorInfo.statusCode });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: errorInfo.statusCode });
  }
}
