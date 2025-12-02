#!/usr/bin/env node
/**
 * Test Canonical URLs
 * 
 * Verifies that all pages include proper canonical link tags.
 * Run against dev server or production.
 * 
 * Usage: 
 *   npm run dev (in another terminal)
 *   node scripts/test-canonical-urls.mjs
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

const TEST_PAGES = [
  { path: '/', expected: 'https://www.dcyfr.ai/' },
  { path: '/about', expected: 'https://www.dcyfr.ai/about' },
  { path: '/blog', expected: 'https://www.dcyfr.ai/blog' },
  { path: '/blog/ai-development-workflow', expected: 'https://www.dcyfr.ai/blog/ai-development-workflow' },
  { path: '/projects', expected: 'https://www.dcyfr.ai/projects' },
  { path: '/contact', expected: 'https://www.dcyfr.ai/contact' },
];

console.log(`🔍 Testing Canonical URLs\n`);
console.log(`Base URL: ${BASE_URL}`);
console.log(`${'='.repeat(70)}\n`);

let passed = 0;
let failed = 0;

for (const { path, expected } of TEST_PAGES) {
  try {
    const response = await fetch(`${BASE_URL}${path}`);
    
    if (!response.ok) {
      console.log(`❌ ${path}`);
      console.log(`   Status: ${response.status} ${response.statusText}\n`);
      failed++;
      continue;
    }
    
    const html = await response.text();
    const match = html.match(/<link rel="canonical" href="([^"]+)"/);
    
    if (!match) {
      console.log(`❌ ${path}`);
      console.log(`   Error: No canonical tag found\n`);
      failed++;
      continue;
    }
    
    const canonical = match[1];
    
    if (canonical === expected) {
      console.log(`✅ ${path}`);
      console.log(`   Canonical: ${canonical}\n`);
      passed++;
    } else {
      console.log(`⚠️  ${path}`);
      console.log(`   Expected:  ${expected}`);
      console.log(`   Found:     ${canonical}\n`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${path}`);
    console.log(`   Error: ${error.message}\n`);
    failed++;
  }
}

console.log(`${'='.repeat(70)}`);
console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('✅ All canonical URLs are correct!\n');
  process.exit(0);
} else {
  console.log('❌ Some canonical URLs are missing or incorrect.\n');
  process.exit(1);
}
