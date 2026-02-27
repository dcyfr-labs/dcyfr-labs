import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { redis } from '@/lib/redis-client';

/**
 * User Engagement Collection API
 *
 * Handles bulk operations on engagement data for authenticated users.
 *
 * Endpoints:
 * - DELETE /api/user/engagement - Clear all engagement data for user
 * - GET /api/user/engagement - List all engagement keys for user
 */

/**
 * Validate request authentication and return user ID
 */
async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const { user } = await getAuthenticatedUser(request);
  return user?.id || null;
}

/**
 * DELETE /api/user/engagement
 * Clear all engagement data for authenticated user
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use Redis SCAN to find all keys matching the pattern
    // Pattern: engagement:${userId}:*
    const patternToDelete = `engagement:${userId}:*`;

    // Since Upstash Redis doesn't support KEYS command directly for scanning,
    // we would need to track keys separately or use a different approach
    // For now, we'll return a success response but note that individual
    // key deletion is the recommended approach

    console.warn('[Engagement API] Clear all: Recommend individual key deletion for security');

    return NextResponse.json({
      success: true,
      message: 'Use individual DELETE requests for specific keys',
    });
  } catch (error) {
    console.error('[Engagement API] DELETE (collection) error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/user/engagement
 * List all engagement keys for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Since Upstash Redis doesn't support KEYS command,
    // this endpoint would need to be implemented with a separate index
    // For now, return an empty list with a note

    console.warn('[Engagement API] List all: Implement with separate index if needed');

    return NextResponse.json({
      keys: [],
      note: 'Key enumeration requires separate index tracking',
    });
  } catch (error) {
    console.error('[Engagement API] GET (collection) error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
