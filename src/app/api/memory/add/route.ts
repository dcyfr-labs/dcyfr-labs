import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp, createRateLimitHeaders } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/error-handler';
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

export async function POST(request: NextRequest) {
  let body: AddMemoryRequest | null = null;

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

    const { userId, message, context } = body;

    // Validate required fields
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'userId is required and must be a string' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'message is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.trim().length < 1) {
      return NextResponse.json(
        { error: 'message cannot be empty' },
        { status: 400 }
      );
    }

    if (message.length > 10000) {
      return NextResponse.json(
        { error: 'message cannot exceed 10,000 characters' },
        { status: 413 }
      );
    }

    // Validate context if provided
    if (context !== undefined && (typeof context !== 'object' || context === null)) {
      return NextResponse.json(
        { error: 'context must be an object if provided' },
        { status: 400 }
      );
    }

    // Add memory
    try {
      const memory = getMemory();

      // Add the message to user memory
      const result = await memory.addUserMemory(userId, message, context);

      // Log success (anonymized)
      console.log('Memory added:', {
        userId: userId.substring(0, 8) + '...',
        messageLength: message.length,
        hasContext: !!context,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          memoryId: result,
          stored: true,
        },
        {
          status: 200,
          headers: createRateLimitHeaders(rateLimitResult),
        }
      );
    } catch (memoryError) {
      console.error(
        'Failed to add memory:',
        memoryError instanceof Error ? memoryError.message : String(memoryError)
      );
      return NextResponse.json(
        { error: 'Failed to store memory. Please try again later.' },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorInfo = handleApiError(error, {
      route: '/api/memory/add',
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
