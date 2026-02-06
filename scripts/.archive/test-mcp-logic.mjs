/**
 * Test analytics MCP tools directly
 */
import { createClient } from "redis";
import { config } from "dotenv";

config({ path: ".env.local" });

const client = createClient({ url: process.env.REDIS_URL });

async function testGetPageViews() {
  await client.connect();
  console.log("Testing getPageViews logic...\n");

  const keys = await client.keys("views:post:*");
  const baseKeys = keys.filter(key => !key.includes(":day:"));
  
  console.log(`Found ${keys.length} total keys, ${baseKeys.length} base keys`);
  
  if (baseKeys.length === 0) {
    console.log("❌ No base keys found");
    await client.disconnect();
    return;
  }

  let totalViews = 0;
  for (const key of baseKeys) {
    const value = await client.get(key);
    totalViews += parseInt(value || "0", 10);
  }

  console.log(`✅ Total views: ${totalViews}`);
  
  await client.disconnect();
}

testGetPageViews().catch(console.error);
