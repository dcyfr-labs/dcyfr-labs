/**
 * Maintenance Observations API
 * GET/POST endpoints for observation logging
 *
 * Stores observations in Redis if available, otherwise uses in-memory storage (dev only).
 */

import { NextRequest, NextResponse } from 'next/server';
import { blockExternalAccess } from '@/lib/api-security';
import { redis } from '@/mcp/shared/redis-client';
import type { Observation } from '@/types/maintenance';

const OBSERVATIONS_KEY = 'maintenance:observations';
const MAX_OBSERVATIONS = 100; // Keep last 100 observations

// In-memory fallback storage for development (not persisted)
let inMemoryObservations: Observation[] = [];

/**
 * GET /api/maintenance/observations
 * Fetches recent observations
 *
 * Query params:
 * - limit: Number of observations to fetch (default: 20, max: 100)
 * - category: Filter by category (optional)
 * - severity: Filter by severity (optional)
 */
export async function GET(request: NextRequest) {
  // Block external access - internal maintenance tools only
  const blockResponse = blockExternalAccess(request);
  if (blockResponse) return blockResponse;

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const category = searchParams.get('category');
    const severity = searchParams.get('severity');

    let observations: Observation[] = [];

    // Try to get from Redis first
    let fetchedFromRedis = false;

    try {
      const cached = await redis.lrange(OBSERVATIONS_KEY, 0, -1);
      const cachedLength = Array.isArray(cached) ? cached.length : 0;
      console.warn(`[Redis LRANGE] Retrieved ${cachedLength} items from ${OBSERVATIONS_KEY}`);

      if (Array.isArray(cached) && cached.length > 0) {
        observations = cached
          .map((item) => {
            try {
              return JSON.parse(item as string) as Observation;
            } catch (parseErr) {
              console.error('Failed to parse observation:', { item, error: parseErr });
              return null;
            }
          })
          .filter((item: Observation | null): item is Observation => item !== null);
        fetchedFromRedis = true;
        console.warn(`[Redis] Successfully parsed ${observations.length} observations`);
      }
    } catch (redisError) {
      console.error('Failed to fetch from Redis:', {
        error: redisError instanceof Error ? redisError.message : String(redisError),
        stack: redisError instanceof Error ? redisError.stack : undefined,
      });
    }

    // Fall back to in-memory storage if Redis not available or empty
    if (observations.length === 0) {
      console.warn(
        `[Fallback] Using in-memory storage with ${inMemoryObservations.length} observations`
      );
      observations = [...inMemoryObservations];
    }

    // Apply filters
    let filtered = observations;
    if (category) {
      filtered = filtered.filter((obs) => obs.category === category);
    }
    if (severity) {
      filtered = filtered.filter((obs) => obs.severity === severity);
    }

    // Apply limit
    filtered = filtered.slice(0, limit);

    return NextResponse.json({
      observations: filtered,
      total: observations.length,
      timestamp: new Date().toISOString(),
      source: fetchedFromRedis ? 'redis' : 'in-memory',
      ...(fetchedFromRedis && { cached: true }),
    });
  } catch (error) {
    console.error('Failed to fetch observations:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch observations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/maintenance/observations
 * Creates a new observation
 *
 * Body:
 * {
 *   category: string,
 *   severity: string,
 *   title: string,
 *   description: string,
 *   tags: string[],
 *   screenshot?: string
 * }
 */
export async function POST(request: NextRequest) {
  // Block external access - internal maintenance tools only
  const blockResponse = blockExternalAccess(request);
  if (blockResponse) return blockResponse;

  try {
    const body = await request.json();

    // Validate required fields
    const { category, severity, title, description, tags } = body;

    if (!category || !severity || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: category, severity, title, description' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['ai-performance', 'dev-tools', 'workflow', 'general'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate severity
    const validSeverities = ['info', 'warning', 'error'];
    if (!validSeverities.includes(severity)) {
      return NextResponse.json(
        { error: `Invalid severity. Must be one of: ${validSeverities.join(', ')}` },
        { status: 400 }
      );
    }

    // Create observation
    const observation: Observation = {
      id: crypto.randomUUID(),
      category,
      severity,
      title,
      description,
      tags: Array.isArray(tags) ? tags : [],
      screenshot: body.screenshot,
      createdAt: new Date().toISOString(),
      createdBy: 'manual',
      metadata: body.metadata,
    };

    // Try to store in Redis, fall back to in-memory
    let usingFallback = false;

    try {
      // Add to front of list (most recent first)
      console.warn(`[Redis] Attempting to store observation: ${observation.id}`);
      const pushResult = await redis.lpush(OBSERVATIONS_KEY, JSON.stringify(observation));
      console.warn(`[Redis LPUSH] Success. New list length: ${pushResult}`);

      // Trim to keep only last MAX_OBSERVATIONS
      await redis.ltrim(OBSERVATIONS_KEY, 0, MAX_OBSERVATIONS - 1);
      console.warn(`[Redis LTRIM] Success. Trimmed to max ${MAX_OBSERVATIONS}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : '';
      console.error(`[Redis ERROR] Failed to store observation:`, {
        message: errorMsg,
        stack: errorStack,
        obsId: observation.id,
        obsTitle: observation.title,
      });
      usingFallback = true;
    }

    // Use in-memory storage if Redis failed
    if (usingFallback) {
      inMemoryObservations = [observation, ...inMemoryObservations].slice(0, MAX_OBSERVATIONS);
      console.warn(
        `[In-Memory] Stored observation. Total in memory: ${inMemoryObservations.length}`
      );
    }

    console.warn('[Observation] Created:', {
      severity: severity.toUpperCase(),
      titleLength: title.length,
      storage: usingFallback ? 'in-memory' : 'Redis',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        observation,
        message: 'Observation created successfully',
        ...(usingFallback && { note: 'Stored in-memory (development only)' }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create observation:', error);

    return NextResponse.json(
      {
        error: 'Failed to create observation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/maintenance/observations/[id]
 * Deletes a specific observation
 * (This would be in a separate [id]/route.ts file in a full implementation)
 */
