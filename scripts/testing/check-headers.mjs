#!/usr/bin/env node
/**
 * Check Permissions-Policy header on live site
 * 
 * Usage: node scripts/check-headers.mjs [url]
 */

const url = process.argv[2] || 'http://localhost:3000';

console.log(`🔍 Checking headers for: ${url}\n`);

try {
  const response = await fetch(url);
  const permissionsPolicy = response.headers.get('Permissions-Policy');
  const csp = response.headers.get('Content-Security-Policy');
  
  console.log('📋 Permissions-Policy header:');
  console.log(permissionsPolicy || '  (not set)');
  console.log('');
  
  if (permissionsPolicy?.includes('interest-cohort')) {
    console.log('❌ Found deprecated "interest-cohort" directive!');
  } else {
    console.log('✅ No deprecated directives found');
  }
  
  console.log('\n📋 Content-Security-Policy header:');
  console.log(csp ? csp.substring(0, 100) + '...' : '  (not set)');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
