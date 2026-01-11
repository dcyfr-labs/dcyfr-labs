/**
 * Check for engagement keys by type
 */
import { createClient } from "redis";
import { config } from "dotenv";

config({ path: ".env.local" });

const client = createClient({ url: process.env.REDIS_URL });

try {
  await client.connect();
  console.log("✅ Connected to Redis\n");

  const activityLikes = await client.keys("likes:activity:*");
  const activityBookmarks = await client.keys("bookmarks:activity:*");
  const postLikes = await client.keys("likes:post:*");
  const postBookmarks = await client.keys("bookmarks:post:*");
  const projectLikes = await client.keys("likes:project:*");
  const projectBookmarks = await client.keys("bookmarks:project:*");

  console.log("📊 Engagement Keys Found:");
  console.log(`  Activity likes: ${activityLikes.length}`);
  console.log(`  Activity bookmarks: ${activityBookmarks.length}`);
  console.log(`  Post likes: ${postLikes.length}`);
  console.log(`  Post bookmarks: ${postBookmarks.length}`);
  console.log(`  Project likes: ${projectLikes.length}`);
  console.log(`  Project bookmarks: ${projectBookmarks.length}\n`);

  if (activityLikes.length > 0) {
    console.log("Sample activity like keys:", activityLikes.slice(0, 5));
    const val = await client.get(activityLikes[0]);
    console.log(`  ${activityLikes[0]} = ${val}\n`);
  }

  if (postLikes.length > 0) {
    console.log("Sample post like keys:", postLikes.slice(0, 5));
  }

  await client.disconnect();
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
