/**
 * Test updated engagement query logic
 */
import { createClient } from "redis";
import { config } from "dotenv";

config({ path: ".env.local" });

const client = createClient({ url: process.env.REDIS_URL });

try {
  await client.connect();
  console.log("✅ Connected to Redis\n");

  // Query all engagement keys (matching MCP logic)
  const [postLikes, projectLikes, activityLikes, postBookmarks, projectBookmarks, activityBookmarks] = await Promise.all([
    client.keys("likes:post:*"),
    client.keys("likes:project:*"),
    client.keys("likes:activity:*"),
    client.keys("bookmarks:post:*"),
    client.keys("bookmarks:project:*"),
    client.keys("bookmarks:activity:*"),
  ]);

  const likeKeys = [...postLikes, ...projectLikes, ...activityLikes];
  const bookmarkKeys = [...postBookmarks, ...projectBookmarks, ...activityBookmarks];

  console.log("📊 Combined Keys:");
  console.log(`  Total like keys: ${likeKeys.length}`);
  console.log(`  Total bookmark keys: ${bookmarkKeys.length}\n`);

  // Sum all likes
  let totalLikes = 0;
  for (const key of likeKeys) {
    const value = await client.get(key);
    totalLikes += parseInt(value || "0", 10);
  }

  // Sum all bookmarks
  let totalBookmarks = 0;
  for (const key of bookmarkKeys) {
    const value = await client.get(key);
    totalBookmarks += parseInt(value || "0", 10);
  }

  console.log("📈 Engagement Totals:");
  console.log(`  Total likes: ${totalLikes}`);
  console.log(`  Total bookmarks: ${totalBookmarks}`);
  console.log(`  Total interactions: ${totalLikes + totalBookmarks}\n`);

  await client.disconnect();
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
