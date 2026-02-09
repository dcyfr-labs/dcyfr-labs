import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp, createRateLimitHeaders } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/error-handler';
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

export async function POST(request: NextRequest) {
  let body: SearchMemoryRequest | null = null;

  try {
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

    // Parse request body
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Invalid JSON in request body',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 400 }
      );
    }

    // Validate the parsed data
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a JSON object' },
        { status: 400 }
      );
    }

    const { userId, query, limit = DEFAULT_LIMIT } = body;

    // Validate required fields
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'userId is required and must be a string' },
        { status: 400 }
      );
    }

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'query is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate query length
    if (query.trim().length < 1) {
      return NextResponse.json({ error: 'query cannot be empty' }, { status: 400 });
    }

    if (query.length > 1000) {
      return NextResponse.json(
        { error: 'query cannot exceed 1,000 characters' },
        { status: 400 }
      );
    }

    // Validate limit
    if (typeof limit !== 'number' || limit < 1) {
      return NextResponse.json(
        { error: 'limit must be a positive number' },
        { status: 400 }
      );
    }

    if (limit > MAX_LIMIT) {
      return NextResponse.json(
        { error: `limit cannot exceed ${MAX_LIMIT}` },
        { status: 400 }
      );
    }

    // Search memories
    try {
      const memory = getMemory();

      // Search user memories
      const results = await memory.searchUserMemories(userId, query, limit);

      // Transform results to match API schema
      const memories: MemoryResult[] = results.map((result: MemorySearchResult) => ({
        id: result.id,
        content: result.content,
        importance: result.importance,
        topic: result.topic,
        createdAt: result.createdAt.toISOString(),
      }));

      // Log success (anonymized)
      console.log('Memory search completed:', {
        userId: userId.substring(0, 8) + '...',
        queryLength: query.length,
        resultCount: memories.length,
        limit,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          memories,
          count: memories.length,
          limit,
        },
        {
          status: 200,
          headers: createRateLimitHeaders(rateLimitResult),
        }
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
    const errorInfo = handleApiError(error, {
      route: '/api/memory/search',
      method: 'POST',
      additionalData: body ? { userId: body.userId?.substring(0, 8) + '...' } : {},
    });

    // For connection errors, return minimal response
    if (errorInfo.isConnectionError) {
      return new Response(null, { status: errorInfo.statusCode });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: errorInfo.statusCode }
    );
  }
}
