/**
 * Test Redis storage functionality
 */
import { NextResponse } from "next/server";
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

export async function GET() {
  const result: {
    redisUrl: string | null;
    connected: boolean;
    lpushWorks: boolean;
    lrangeWorks: boolean;
    errorMsg?: string;
  } = {
    redisUrl: redisUrl ? "***configured***" : "not-configured",
    connected: false,
    lpushWorks: false,
    lrangeWorks: false,
  };

  if (!redisUrl) {
    result.errorMsg = "REDIS_URL not set";
    return NextResponse.json(result);
  }

  try {
    const client = createClient({ url: redisUrl });
    console.log("[Test] Attempting to connect...");

    await client.connect();
    result.connected = true;
    console.log("[Test] Connected successfully");

    // Test LPUSH - try different method names
    const testKey = `test-${Date.now()}`;
    const testData = { message: "test", timestamp: new Date().toISOString() };
    console.log("[Test] Available methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(client)).filter(m => m.includes('push') || m.includes('list')));
    
    // Redis v5 uses camelCase
    console.log("[Test] Attempting lPush with key:", testKey);
    const lpushResult = await (client as any).lPush(testKey, JSON.stringify(testData));
    result.lpushWorks = typeof lpushResult === "number";
    console.log("[Test] lPush result:", lpushResult);

    // Test LRANGE
    console.log("[Test] Attempting lRange...");
    const lrangeResult = await (client as any).lRange(testKey, 0, -1);
    result.lrangeWorks = Array.isArray(lrangeResult) && lrangeResult.length > 0;
    console.log("[Test] lRange result:", lrangeResult);

    // Cleanup
    await client.del(testKey);

    await client.disconnect();
    console.log("[Test] Disconnected");
  } catch (err) {
    result.errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Test] Error:", result.errorMsg);
  }

  return NextResponse.json(result);
}
