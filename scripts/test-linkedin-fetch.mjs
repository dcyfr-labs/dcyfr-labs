#!/usr/bin/env node

/**
 * Test the exact fetch call that's failing in the LinkedIn OAuth callback
 * This replicates the failing request to isolate the issue
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env.local') });

console.log('🔍 Testing Exact LinkedIn OAuth Fetch Call');
console.log('===========================================\n');

async function testLinkedInTokenExchange() {
  const clientId = process.env.LINKEDIN_OPENID_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_OPENID_CLIENT_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  console.log('📋 Environment Variables:');
  console.log(`   CLIENT_ID: ${clientId ? '✅ Set' : '❌ Missing'}`);
  console.log(`   CLIENT_SECRET: ${clientSecret ? '✅ Set' : '❌ Missing'}`);
  console.log(`   SITE_URL: ${siteUrl ? '✅ Set' : '❌ Missing'}`);
  console.log('');
  
  if (!clientId || !clientSecret) {
    console.log('❌ Missing required credentials - cannot test token exchange');
    return;
  }
  
  // Simulate the token exchange call that's failing
  const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
  const redirectUri = `${siteUrl}/api/auth/linkedin/callback`;
  
  // Test with a dummy authorization code (this will fail but we can see how it fails)
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: 'test_code_123', // This is fake, but we want to see the network request work
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });
  
  console.log('🌐 Testing Token Exchange Request:');
  console.log(`   URL: ${tokenUrl}`);
  console.log(`   Redirect URI: ${redirectUri}`);
  console.log('   Body: [form data with dummy code]');
  console.log('');
  
  try {
    console.log('📡 Making fetch request...');
    const startTime = Date.now();
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'dcyfr-labs/oauth-test'
      },
      body: body.toString(),
    });
    
    const duration = Date.now() - startTime;
    console.log(`✅ Fetch completed successfully in ${duration}ms`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Status Text: ${response.statusText}`);
    
    const responseText = await response.text();
    console.log(`   Response Length: ${responseText.length} bytes`);
    
    try {
      const responseJson = JSON.parse(responseText);
      console.log('   Response Body (JSON):');
      console.log('   ', JSON.stringify(responseJson, null, 2));
    } catch {
      console.log('   Response Body (Text):');
      console.log('   ', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
    }
    
    // This should work - we expect an error about invalid code, but the network request should succeed
    console.log('\n✅ Network request to LinkedIn successful!');
    console.log('   The OAuth callback "fetch failed" error is NOT due to network connectivity.');
    console.log('   The issue must be in the specific request parameters or environment.');
    
  } catch (error) {
    console.log(`❌ Fetch failed: ${error.message}`);
    console.log('   This reproduces your OAuth callback error.');
    console.log('');
    
    // Detailed error analysis
    if (error.message.includes('fetch failed')) {
      console.log('🔍 This is the same error! Possible causes:');
      console.log('   • Request timeout (LinkedIn taking too long to respond)');
      console.log('   • SSL/TLS certificate issues');
      console.log('   • Request headers causing rejection');
      console.log('   • Body encoding issues');
      console.log('   • Network infrastructure dropping connections');
    }
    
    console.log('\n💡 Let\'s try with different configurations...');
    await testWithDifferentConfigurations(tokenUrl, body);
  }
}

async function testWithDifferentConfigurations(tokenUrl, body) {
  console.log('\n🔧 Testing Alternative Configurations:');
  
  // Test 1: Longer timeout
  console.log('\n1️⃣  Testing with longer timeout...');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: body.toString(),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log(`   ✅ Success with longer timeout - Status: ${response.status}`);
  } catch (error) {
    console.log(`   ❌ Still failed: ${error.message}`);
  }
  
  // Test 2: Different User-Agent
  console.log('\n2️⃣  Testing with different User-Agent...');
  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      body: body.toString(),
    });
    
    console.log(`   ✅ Success with browser User-Agent - Status: ${response.status}`);
  } catch (error) {
    console.log(`   ❌ Still failed: ${error.message}`);
  }
  
  // Test 3: Minimal headers
  console.log('\n3️⃣  Testing with minimal headers...');
  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    
    console.log(`   ✅ Success with minimal headers - Status: ${response.status}`);
  } catch (error) {
    console.log(`   ❌ Still failed: ${error.message}`);
  }
  
  // Test 4: HTTP instead of HTTPS (if it's a certificate issue)
  console.log('\n4️⃣  Testing SSL certificate verification...');
  console.log('   Note: Not testing HTTP - LinkedIn requires HTTPS');
  console.log('   If this is a certificate issue, it would affect all HTTPS requests');
}

// Node.js version and environment info
function printEnvironmentInfo() {
  console.log('\n📊 Environment Information:');
  console.log(`   Node.js Version: ${process.version}`);
  console.log(`   Platform: ${process.platform} ${process.arch}`);
  console.log(`   TLS Version: ${process.versions.openssl || 'unknown'}`);
  console.log('');
}

async function main() {
  printEnvironmentInfo();
  await testLinkedInTokenExchange();
  
  console.log('\n🎯 Summary & Next Steps:');
  console.log('   If the fetch succeeded here but fails in your OAuth callback:');
  console.log('   1. Check the exact request parameters being sent');
  console.log('   2. Verify the authorization code is valid and not expired');
  console.log('   3. Ensure the redirect_uri matches exactly');
  console.log('   4. Check for any middleware interfering with the request');
  console.log('');
  console.log('   If the fetch failed here too:');
  console.log('   1. This confirms it\'s a Node.js fetch configuration issue');
  console.log('   2. Try updating Node.js to the latest version');
  console.log('   3. Consider using a different HTTP client (axios, node-fetch)');
  console.log('   4. Check if running behind a corporate proxy');
}

main().catch(console.error);