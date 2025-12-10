#!/usr/bin/env node

/**
 * Backfill Google Indexing API with existing blog posts
 * 
 * This script submits all existing blog posts to Google's Indexing API
 * for faster indexing. Useful when first setting up the API integration
 * or when you have posts that haven't been indexed yet.
 * 
 * Usage:
 *   node scripts/backfill-google-indexing.mjs
 *   node scripts/backfill-google-indexing.mjs --dry-run
 * 
 * Requirements:
 *   - GOOGLE_INDEXING_API_KEY environment variable configured
 *   - Inngest configured and running
 *   - Development server running (for Inngest dev mode)
 * 
 * @see docs/features/google-indexing-api.md
 */

import { getAllPosts } from "../src/lib/blog.js";
import { SITE_URL } from "../src/lib/site-config.js";

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run") || args.includes("-d");

console.log("🔍 Google Indexing API Backfill Tool\n");

// Check if Google Indexing API is configured
if (!process.env.GOOGLE_INDEXING_API_KEY) {
  console.error("❌ Error: GOOGLE_INDEXING_API_KEY not configured");
  console.error("\nPlease add your Google service account JSON key to .env.local:");
  console.error("  GOOGLE_INDEXING_API_KEY='{ ... }'");
  console.error("\nSee setup guide: docs/features/google-indexing-api.md");
  process.exit(1);
}

// Get all blog posts
const posts = getAllPosts();

if (posts.length === 0) {
  console.log("ℹ️  No blog posts found to submit.");
  process.exit(0);
}

console.log(`📝 Found ${posts.length} blog post(s) to submit:\n`);

// Build URLs for all posts
const urls = posts.map((post) => {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const status = post.published ? "✅" : "🚧 (draft)";
  console.log(`  ${status} ${post.title}`);
  console.log(`     ${url}`);
  return url;
});

console.log("\n" + "=".repeat(60) + "\n");

if (isDryRun) {
  console.log("🏃 DRY RUN MODE - No URLs will be submitted");
  console.log(`\nWould submit ${urls.length} URL(s) to Google Indexing API.`);
  console.log("\nTo actually submit, run without --dry-run flag:");
  console.log("  node scripts/backfill-google-indexing.mjs");
  process.exit(0);
}

// Check if Inngest is available
console.log("🔗 Checking Inngest connection...\n");

// Import Inngest client dynamically (since we're in a script)
const { inngest } = await import("../src/inngest/client.js");

try {
  // Send batch submission event to Inngest
  console.log(`📤 Submitting ${urls.length} URL(s) to Google Indexing API...\n`);
  
  const result = await inngest.send({
    name: "google/urls.batch-submit",
    data: { urls },
  });

  console.log("✅ Batch submission queued successfully!");
  console.log("\nEvent details:", JSON.stringify(result, null, 2));
  
  console.log("\n" + "=".repeat(60) + "\n");
  console.log("📊 What happens next:\n");
  console.log("  1. Inngest will process each URL sequentially");
  console.log("  2. Each URL is submitted to Google with a small delay");
  console.log("  3. Google will schedule a crawl for each URL");
  console.log("  4. Indexing typically completes within 24-48 hours");
  
  console.log("\n🔍 Monitor progress:\n");
  console.log("  • Inngest Dev UI: http://localhost:3000/api/inngest");
  console.log("  • Inngest Dashboard: https://app.inngest.com/");
  console.log("  • Google Search Console: https://search.google.com/search-console");
  
  console.log("\n⚠️  Note: Default quota is 200 requests/day");
  console.log(`    You have submitted ${urls.length} URL(s)`);
  
  if (urls.length > 200) {
    console.log("\n⚠️  WARNING: You've exceeded the daily quota!");
    console.log("    Some submissions may fail with 429 (rate limited).");
    console.log("    Consider spreading submissions across multiple days");
    console.log("    or requesting a quota increase from Google.");
  }
  
  console.log("\n✨ Done! Check Inngest logs for detailed results.\n");
  
} catch (error) {
  console.error("\n❌ Error submitting to Inngest:", error.message);
  console.error("\nTroubleshooting:");
  console.error("  • Is the dev server running? (npm run dev)");
  console.error("  • Is Inngest configured? (INNGEST_EVENT_KEY set)");
  console.error("  • Check docs/features/google-indexing-api.md for setup");
  process.exit(1);
}
