#!/usr/bin/env node

/**
 * Test script for skip-to-content link accessibility feature
 * Verifies the skip link is present and properly configured
 */

import fetch from 'node-fetch';
import { parse } from 'node-html-parser';

const BASE_URL = 'http://localhost:3000';

async function testSkipLink() {
  console.log('🧪 Testing Skip-to-Content Link Implementation\n');

  try {
    // Fetch homepage
    console.log('📄 Fetching homepage...');
    const response = await fetch(BASE_URL);
    const html = await response.text();
    const root = parse(html);

    // Check for skip link
    const skipLink = root.querySelector('a[href="#main-content"]');
    
    if (!skipLink) {
      console.error('❌ Skip link not found!');
      process.exit(1);
    }

    console.log('✅ Skip link found');

    // Check skip link text
    const linkText = skipLink.text.trim();
    if (linkText !== 'Skip to main content') {
      console.error(`❌ Incorrect skip link text: "${linkText}"`);
      process.exit(1);
    }
    console.log(`✅ Skip link text: "${linkText}"`);

    // Check for sr-only class (visually hidden)
    const classes = skipLink.getAttribute('class') || '';
    if (!classes.includes('sr-only')) {
      console.error('❌ Skip link missing sr-only class');
      process.exit(1);
    }
    console.log('✅ Skip link has sr-only class (visually hidden by default)');

    // Check for focus classes
    if (!classes.includes('focus:not-sr-only')) {
      console.error('❌ Skip link missing focus:not-sr-only class');
      process.exit(1);
    }
    console.log('✅ Skip link has focus:not-sr-only class (visible when focused)');

    // Check for position classes
    if (!classes.includes('focus:absolute')) {
      console.error('❌ Skip link missing focus:absolute class');
      process.exit(1);
    }
    console.log('✅ Skip link has focus:absolute class');

    // Check for main content target
    const mainContent = root.querySelector('#main-content');
    if (!mainContent) {
      console.error('❌ Main content element with id="main-content" not found!');
      process.exit(1);
    }
    console.log('✅ Main content target (#main-content) exists');

    // Check main element is actually a <main> tag
    if (mainContent.tagName.toLowerCase() !== 'main') {
      console.error(`❌ #main-content is not a <main> element (found: ${mainContent.tagName})`);
      process.exit(1);
    }
    console.log('✅ #main-content is a semantic <main> element');

    // Verify skip link comes before header
    const header = root.querySelector('header');
    const body = root.querySelector('body');
    
    if (header && body) {
      const bodyHTML = body.innerHTML;
      const skipLinkIndex = bodyHTML.indexOf('Skip to main content');
      const headerIndex = bodyHTML.indexOf(header.outerHTML);
      
      if (skipLinkIndex > headerIndex) {
        console.error('❌ Skip link appears after header in DOM');
        process.exit(1);
      }
      console.log('✅ Skip link appears before header in DOM order');
    }

    console.log('\n🎉 All skip-to-content link tests passed!');
    console.log('\n📝 Implementation Details:');
    console.log('  - Link text: "Skip to main content"');
    console.log('  - Target: #main-content');
    console.log('  - Visibility: Hidden by default, visible on focus');
    console.log('  - Position: Absolute when focused (top-left)');
    console.log('  - DOM order: Before header');
    console.log('\n✨ Keyboard users can now press Tab on any page to reveal the skip link!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testSkipLink();
