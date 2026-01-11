/**
 * Check Redis for analytics keys
 */
import { createClient } from "redis";
import { config } from "dotenv";

config({ path: ".env.local" });

const client = createClient({ url: process.env.REDIS_URL });

try {
  await client.connect();
  console.log("✅ Connected to Redis");

  const viewKeys = await client.keys("views:post:*");
  console.log(`\n📊 Found ${viewKeys.length} total view keys`);
  
  const baseKeys = viewKeys.filter(key => !key.includes(":day:"));
  console.log(`📊 Found ${baseKeys.length} base keys (excluding :day:)`);
  
  if (baseKeys.length > 0) {
    console.log("First 10 base keys:", baseKeys.slice(0, 10));
    const value = await client.get(baseKeys[0]);
    console.log(`Sample: ${baseKeys[0]} = ${value}`);
    
    // Calculate total views
    let total = 0;
    for (const key of baseKeys) {
      const val = await client.get(key);
      total += parseInt(val || "0", 10);
    }
    console.log(`\n📈 Total views across all base keys: ${total}`);
  }

  const likeKeys = await client.keys("likes:post:*");
  console.log(`\n❤️  Found ${likeKeys.length} like keys`);

  const bookmarkKeys = await client.keys("bookmarks:post:*");
  console.log(`\n🔖 Found ${bookmarkKeys.length} bookmark keys`);

  const milestones = await client.get("analytics:milestones");
  console.log(`\n🎯 Milestones key exists: ${!!milestones}`);

  await client.disconnect();
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
