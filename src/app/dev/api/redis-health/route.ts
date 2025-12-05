/**
 * Dev Tools - Redis Health Check Endpoint
 * 
 * Tests Redis connectivity and configuration.
 * Only accessible in development mode (protected by proxy.ts).
 */

import { NextResponse } from "next/server";
import { assertDevOr404 } from "@/lib/dev-only";
import { testRedisConnection } from "@/lib/redis-health";

export async function GET() {
  // Defense-in-depth: explicit environment check for Vercel Fluid Compute optimization
  assertDevOr404();
  try {
    const status = await testRedisConnection();

    return NextResponse.json(
      {
        ...status,
        timestamp: new Date().toISOString(),
      },
      {
        status: status.connected ? 200 : 503,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        enabled: false,
        configured: false,
        connected: false,
        message: "Failed to check Redis status",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
