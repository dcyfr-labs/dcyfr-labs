import { NextRequest, NextResponse } from "next/server";
import { unifiedCostAggregator } from "@/lib/unified-cost-aggregator";
import type { TimeRange } from "@/lib/unified-cost-aggregator";

/**
 * Server-Sent Events (SSE) endpoint for real-time cost data streaming
 *
 * Streams cost data updates every 30 seconds instead of client-side polling
 * Reduces client complexity and improves efficiency
 *
 * Usage:
 * ```typescript
 * const eventSource = new EventSource('/api/dev/ai-costs/unified/stream?period=30d');
 * eventSource.onmessage = (event) => {
 *   const data = JSON.parse(event.data);
 *   updateDashboard(data);
 * };
 * ```
 */
export async function GET(request: NextRequest) {
  // Defense in depth: verify dev environment (middleware already blocks in prod)
  const isDev = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development';
  if (!isDev) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const period = (searchParams.get("period") || "30d") as TimeRange;

  // Create SSE response headers
  const encoder = new TextEncoder();

  // Create readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial data immediately
      try {
        const data = await unifiedCostAggregator.getUnifiedCostData(period);
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: "Failed to fetch initial data" })}\n\n`,
          ),
        );
      }

      // Set up interval to send updates every 30 seconds
      const interval = setInterval(async () => {
        try {
          const data = await unifiedCostAggregator.getUnifiedCostData(period);
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Failed to fetch update" })}\n\n`,
            ),
          );
        }
      }, 30000); // 30 seconds

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable buffering in nginx
    },
  });
}
