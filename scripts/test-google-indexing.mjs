#!/usr/bin/env node

/**
 * Test Google Indexing API Integration
 * 
 * This script validates that the Google Indexing API is correctly configured
 * and can successfully submit URLs to Google.
 * 
 * Usage:
 *   node scripts/test-google-indexing.mjs
 *   node scripts/test-google-indexing.mjs --url https://www.dcyfr.ai/blog/your-post
 * 
 * Requirements:
 *   - GOOGLE_INDEXING_API_KEY environment variable configured
 *   - Development server running (npm run dev)
 *   - Inngest configured
 * 
 * @see docs/features/google-indexing-api.md
 */

import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Parse command line arguments
const args = process.argv.slice(2);
const urlIndex = args.indexOf("--url");
const testUrl = urlIndex !== -1 && args[urlIndex + 1] 
  ? args[urlIndex + 1]
  : "https://www.dcyfr.ai/blog/test-post";

console.log("🧪 Google Indexing API Configuration Test\n");
console.log("=".repeat(60) + "\n");

// Check if Google Indexing API is configured
if (!process.env.GOOGLE_INDEXING_API_KEY) {
  console.error("❌ Error: GOOGLE_INDEXING_API_KEY not configured");
  console.error("\nPlease add your Google service account JSON key to .env.local:");
  console.error("  GOOGLE_INDEXING_API_KEY='{ ... }'");
  console.error("\nSee setup guide: docs/features/google-indexing-api.md");
  process.exit(1);
}

console.log("✅ GOOGLE_INDEXING_API_KEY is configured");

// Validate JSON format
try {
  const credentials = JSON.parse(process.env.GOOGLE_INDEXING_API_KEY);
  
  // Check required fields
  const requiredFields = [
    'type',
    'project_id',
    'private_key_id',
    'private_key',
    'client_email',
    'client_id',
  ];
  
  const missingFields = requiredFields.filter(field => !credentials[field]);
  
  if (missingFields.length > 0) {
    console.error("\n❌ Error: Invalid service account JSON");
    console.error(`   Missing fields: ${missingFields.join(', ')}`);
    process.exit(1);
  }
  
  console.log("✅ Service account JSON is valid");
  console.log(`   Project ID: ${credentials.project_id}`);
  console.log(`   Service Account: ${credentials.client_email}`);
  
} catch (error) {
  console.error("\n❌ Error: Failed to parse GOOGLE_INDEXING_API_KEY");
  console.error(`   ${error.message}`);
  console.error("\nEnsure the JSON is properly formatted and escaped.");
  process.exit(1);
}

console.log(`\n📍 Test URL: ${testUrl}`);
console.log("\n" + "=".repeat(60) + "\n");

console.log("🚀 To test the integration:\n");
console.log("1. Ensure dev server is running:");
console.log("   npm run dev\n");
console.log("2. Open Inngest Dev UI:");
console.log("   http://localhost:3000/api/inngest\n");
console.log("3. Find 'submit-url-to-google' function\n");
console.log("4. Click 'Test' button and enter:");
console.log('   {');
console.log(`     "url": "${testUrl}",`);
console.log('     "type": "URL_UPDATED"');
console.log('   }\n');
console.log("5. Click 'Invoke Function'\n");
console.log("6. Watch the execution in real-time\n");

console.log("=".repeat(60) + "\n");
console.log("📊 Expected Results:\n");
console.log("✅ Step 'authenticate' should complete successfully");
console.log("✅ Step 'submit-url' should show:");
console.log("   '✓ Submitted ... to Google Indexing API'");
console.log("✅ Response should include metadata from Google\n");

console.log("❌ Common Issues:\n");
console.log("• 403 Forbidden:");
console.log("  → Service account not added as owner in Search Console");
console.log("  → Visit: https://search.google.com/search-console");
console.log("  → Settings > Users & Permissions > Add User");
console.log("  → Add: " + JSON.parse(process.env.GOOGLE_INDEXING_API_KEY).client_email);
console.log("  → Permission: Owner\n");
console.log("• 401 Unauthorized:");
console.log("  → Invalid credentials or APIs not enabled");
console.log("  → Check: https://console.cloud.google.com/apis/library");
console.log("  → Enable: 'Indexing API' and 'Google Search Console API'\n");
console.log("• 429 Rate Limited:");
console.log("  → Quota exceeded (200 requests/day default)");
console.log("  → Wait until midnight Pacific Time for reset\n");

console.log("=".repeat(60) + "\n");
console.log("🔍 Verify in Google Search Console (after test):\n");
console.log("1. Visit URL Inspection Tool:");
console.log("   https://search.google.com/search-console/inspect\n");
console.log(`2. Enter URL: ${testUrl}\n`);
console.log("3. Check 'Last crawl' date");
console.log("   (should show recent crawl within 24-48 hours)\n");

console.log("=".repeat(60) + "\n");
console.log("✨ Configuration validated! Open Inngest Dev UI to run test.\n");

