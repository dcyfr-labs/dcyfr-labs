/**
 * Maintenance Observations API
 * GET/POST endpoints for observation logging
 */

import { NextResponse } from "next/server";
import { createClient } from "redis";
import type { Observation } from "@/types/maintenance";

const redisUrl = process.env.REDIS_URL;
const OBSERVATIONS_KEY = "maintenance:observations";
const MAX_OBSERVATIONS = 100; // Keep last 100 observations

/**
 * Get Redis client (with connection)
 */
async function getRedisClient() {
  if (!redisUrl) return null;

  try {
    const client = createClient({ url: redisUrl });
    if (!client.isOpen) {
      await client.connect();
    }
    return client;
  } catch {
    return null;
  }
}

/**
 * GET /api/maintenance/observations
 * Fetches recent observations
 *
 * Query params:
 * - limit: Number of observations to fetch (default: 20, max: 100)
 * - category: Filter by category (optional)
 * - severity: Filter by severity (optional)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "20", 10),
      MAX_OBSERVATIONS
    );
    const category = searchParams.get("category");
    const severity = searchParams.get("severity");

    const redis = await getRedisClient();
    if (!redis) {
      return NextResponse.json({
        observations: [],
        total: 0,
        message: "Redis unavailable - observations storage disabled",
      });
    }

    // Fetch observations from Redis list
    const observations: Observation[] = [];
    const rawObservations = await redis.lrange(OBSERVATIONS_KEY, 0, limit - 1);

    // Ensure rawObservations is iterable (array of strings)
    const items = Array.isArray(rawObservations) ? rawObservations : [];
    
    for (const raw of items) {
      try {
        if (typeof raw !== 'string') continue;
        const obs = JSON.parse(raw) as Observation;
        // Apply filters if provided
        if (category && obs.category !== category) continue;
        if (severity && obs.severity !== severity) continue;
        observations.push(obs);
      } catch (parseError) {
        console.error("Failed to parse observation:", parseError);
      }
    }

    const total = await redis.llen(OBSERVATIONS_KEY);

    return NextResponse.json({
      observations,
      total,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch observations:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch observations",
        message: error instanceof Error ? error.message : "Unknown error",
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
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const { category, severity, title, description, tags } = body;

    if (!category || !severity || !title || !description) {
      return NextResponse.json(
        { error: "Missing required fields: category, severity, title, description" },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ["ai-performance", "dev-tools", "workflow", "general"];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate severity
    const validSeverities = ["info", "warning", "error"];
    if (!validSeverities.includes(severity)) {
      return NextResponse.json(
        { error: `Invalid severity. Must be one of: ${validSeverities.join(", ")}` },
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
      createdBy: "manual",
      metadata: body.metadata,
    };

    // Store in Redis
    const redis = await getRedisClient();
    if (!redis) {
      return NextResponse.json(
        { error: "Redis unavailable - observation not saved" },
        { status: 503 }
      );
    }

    // Add to front of list (most recent first)
    await redis.lpush(OBSERVATIONS_KEY, JSON.stringify(observation));

    // Trim to keep only last MAX_OBSERVATIONS
    await redis.ltrim(OBSERVATIONS_KEY, 0, MAX_OBSERVATIONS - 1);

    console.log(`[Observation Created] ${severity.toUpperCase()}: ${title}`);

    return NextResponse.json(
      {
        observation,
        message: "Observation created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create observation:", error);

    return NextResponse.json(
      {
        error: "Failed to create observation",
        message: error instanceof Error ? error.message : "Unknown error",
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
