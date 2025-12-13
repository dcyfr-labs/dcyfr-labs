#!/usr/bin/env node

/**
 * Quick HTML Structure Test
 * Verifies skip link and main content are present and properly configured
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

console.log('🧪 Quick HTML Structure Test\n');
console.log('Testing skip link implementation...\n');

async function testPage(url, name) {
  console.log(`📄 Testing: ${name} (${url})`);
  
  try {
    const response = await fetch(`${BASE_URL}${url}`);
    const html = await response.text();
    
    // Test 1: Skip link exists
    const hasSkipLink = html.includes('Skip to main content');
    console.log(`   ${hasSkipLink ? '✅' : '❌'} Skip link text present`);
    
    // Test 2: Skip link href
    const hasCorrectHref = html.includes('href="#main-content"');
    console.log(`   ${hasCorrectHref ? '✅' : '❌'} Skip link href="#main-content"`);
    
    // Test 3: Main content id
    const hasMainId = html.includes('id="main-content"');
    console.log(`   ${hasMainId ? '✅' : '❌'} Main element has id="main-content"`);
    
    // Test 4: Skip link has sr-only class
    const hasSrOnly = html.includes('sr-only');
    console.log(`   ${hasSrOnly ? '✅' : '❌'} Skip link has sr-only class`);
    
    // Test 5: Skip link has focus classes
    const hasFocusClasses = html.includes('focus:not-sr-only') && html.includes('focus:absolute');
    console.log(`   ${hasFocusClasses ? '✅' : '❌'} Skip link has focus visibility classes`);
    
    // Test 6: HTML lang attribute
    const hasLangAttr = html.includes('<html lang="en"');
    console.log(`   ${hasLangAttr ? '✅' : '❌'} HTML has lang="en" attribute`);
    
    // Check DOM order (skip link should come before header)
    const skipLinkIndex = html.indexOf('Skip to main content');
    const headerIndex = html.indexOf('<header');
    const correctOrder = skipLinkIndex > 0 && headerIndex > 0 && skipLinkIndex < headerIndex;
    console.log(`   ${correctOrder ? '✅' : '❌'} Skip link appears before header in DOM`);
    
    const allPassed = hasSkipLink && hasCorrectHref && hasMainId && hasSrOnly && hasFocusClasses && hasLangAttr && correctOrder;
    console.log(`   ${allPassed ? '✅' : '⚠️'} Overall: ${allPassed ? 'PASSED' : 'NEEDS REVIEW'}\n`);
    
    return allPassed;
  } catch (error) {
    console.error(`   ❌ Failed to test ${name}: ${error.message}\n`);
    return false;
  }
}

async function main() {
  const pages = [
    { url: '/', name: 'Homepage' },
    { url: '/blog', name: 'Blog List' },
    { url: '/about', name: 'About Page' },
    { url: '/contact', name: 'Contact Form' },
  ];
  
  const results = [];
  
  for (const page of pages) {
    const passed = await testPage(page.url, page.name);
    results.push({ ...page, passed });
  }
  
  console.log('═'.repeat(60));
  console.log('📊 Summary\n');
  
  const allPassed = results.every(r => r.passed);
  const passedCount = results.filter(r => r.passed).length;
  
  console.log(`Pages Tested: ${results.length}`);
  console.log(`Passed: ${passedCount}/${results.length}`);
  console.log(`Status: ${allPassed ? '✅ ALL PASSED' : '⚠️ SOME FAILURES'}\n`);
  
  if (allPassed) {
    console.log('✅ Skip link implementation verified on all pages!');
    console.log('');
    console.log('📝 Next Steps:');
    console.log('   1. Test manually with keyboard (Tab, Enter)');
    console.log('   2. Test with screen reader (VoiceOver)');
    console.log('   3. Test in both light and dark themes');
    console.log('   4. Test on multiple browsers');
    console.log('');
    console.log('💡 Run manual testing script: node scripts/test-accessibility-manual.mjs');
  } else {
    console.log('⚠️  Some tests failed. Please review the output above.');
  }
  
  console.log('═'.repeat(60));
}

main();
