#!/usr/bin/env node

/**
 * Test script to verify the unified feed endpoints work correctly
 *
 * Tests:
 * - /blog/feed (default Atom)
 * - /blog/feed?format=atom
 * - /blog/feed?format=rss
 * - /blog/feed?format=json
 * - /work/feed (and formats)
 * - /activity/feed (and formats)
 *
 * Legacy redirects:
 * - /blog/rss.xml → /blog/feed?format=rss
 * - /blog/feed.json → /blog/feed?format=json
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const tests = [
  // Blog feeds
  {
    url: "/blog/feed",
    expectedType: "application/atom+xml",
    description: "Blog Atom (default)",
  },
  {
    url: "/blog/feed?format=atom",
    expectedType: "application/atom+xml",
    description: "Blog Atom (explicit)",
  },
  {
    url: "/blog/feed?format=rss",
    expectedType: "application/rss+xml",
    description: "Blog RSS",
  },
  {
    url: "/blog/feed?format=json",
    expectedType: "application/feed+json",
    description: "Blog JSON",
  },

  // Work feeds
  {
    url: "/work/feed",
    expectedType: "application/atom+xml",
    description: "Work Atom (default)",
  },
  {
    url: "/work/feed?format=rss",
    expectedType: "application/rss+xml",
    description: "Work RSS",
  },
  {
    url: "/work/feed?format=json",
    expectedType: "application/feed+json",
    description: "Work JSON",
  },

  // Activity feeds
  {
    url: "/activity/feed",
    expectedType: "application/atom+xml",
    description: "Activity Atom (default)",
  },
  {
    url: "/activity/feed?format=rss",
    expectedType: "application/rss+xml",
    description: "Activity RSS",
  },
  {
    url: "/activity/feed?format=json",
    expectedType: "application/feed+json",
    description: "Activity JSON",
  },
];

async function testEndpoint(url, expectedType, description) {
  try {
    const response = await fetch(`${BASE_URL}${url}`, { redirect: "follow" });
    const contentType = response.headers.get("content-type") || "";

    const passed = contentType.includes(expectedType);
    const status = response.status;

    console.log(
      `${passed ? "✅" : "❌"} ${description}`,
      `\n   URL: ${url}`,
      `\n   Status: ${status}`,
      `\n   Content-Type: ${contentType}`,
      `\n   Expected: ${expectedType}\n`
    );

    return passed;
  } catch (error) {
    console.error(`❌ ${description} - Error:`, error.message);
    return false;
  }
}

async function runTests() {
  console.log(`\n🧪 Testing Unified Feed Endpoints\n${"=".repeat(50)}\n`);

  const results = await Promise.all(
    tests.map(({ url, expectedType, description }) =>
      testEndpoint(url, expectedType, description)
    )
  );

  const passed = results.filter(Boolean).length;
  const total = results.length;

  console.log(`\n${"=".repeat(50)}`);
  console.log(`\n📊 Results: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log("✅ All tests passed!\n");
    process.exit(0);
  } else {
    console.log("❌ Some tests failed\n");
    process.exit(1);
  }
}

runTests();
