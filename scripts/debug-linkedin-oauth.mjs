#!/usr/bin/env node

/**
 * LinkedIn OAuth Diagnostic Script
 * 
 * Helps diagnose issues with LinkedIn OpenID Connect authentication
 * Run: node scripts/debug-linkedin-oauth.mjs
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env.local') });

console.log('🔍 LinkedIn OAuth Diagnostics');
console.log('=====================================\n');

// Check required environment variables
const requiredVars = [
  'LINKEDIN_OPENID_CLIENT_ID',
  'LINKEDIN_OPENID_CLIENT_SECRET',
  'NEXT_PUBLIC_SITE_URL'
];

const missingVars = [];
const presentVars = [];

for (const varName of requiredVars) {
  const value = process.env[varName];
  if (!value) {
    missingVars.push(varName);
  } else {
    presentVars.push({
      name: varName,
      value: varName === 'LINKEDIN_OPENID_CLIENT_SECRET' ? '[HIDDEN]' : value
    });
  }
}

console.log('📋 Environment Variables:');
if (presentVars.length > 0) {
  presentVars.forEach(({ name, value }) => {
    console.log(`✅ ${name}: ${value}`);
  });
}

if (missingVars.length > 0) {
  console.log('\n❌ Missing Variables:');
  missingVars.forEach(varName => {
    console.log(`  - ${varName}`);
  });
  console.log('\n⚠️  Set these variables in .env.local to continue');
}

// Test network connectivity
console.log('\n🌐 Testing Network Connectivity:');

const testUrls = [
  'https://www.linkedin.com/oauth/v2/authorization',
  'https://www.linkedin.com/oauth/v2/accessToken',
  'https://api.linkedin.com/v2/me'
];

for (const url of testUrls) {
  try {
    console.log(`Testing ${url}...`);
    const response = await fetch(url, { 
      method: 'GET',
      headers: { 'User-Agent': 'dcyfr-labs/debug-script' }
    });
    
    if (url.includes('authorization')) {
      // LinkedIn auth endpoint should redirect or require parameters
      console.log(`  ✅ ${url} - Status: ${response.status} (expected redirect)`);
    } else if (url.includes('accessToken')) {
      // Token endpoint should require POST with parameters
      console.log(`  ✅ ${url} - Status: ${response.status} (expected method not allowed)`);
    } else if (url.includes('/v2/me')) {
      // API endpoint should require authorization
      console.log(`  ✅ ${url} - Status: ${response.status} (expected unauthorized)`);
    }
  } catch (error) {
    console.log(`  ❌ ${url} - Error: ${error.message}`);
    
    if (error.message.includes('fetch failed')) {
      console.log('     This could indicate a network connectivity issue');
      console.log('     Check your internet connection and firewall settings');
    }
  }
}

// Check redirect URI configuration
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
if (siteUrl) {
  const redirectUri = `${siteUrl}/api/auth/linkedin/callback`;
  console.log(`\n🔗 Redirect URI Configuration:`);
  console.log(`   Expected: ${redirectUri}`);
  console.log(`   Make sure this exact URL is configured in your LinkedIn app settings`);
  console.log(`   LinkedIn Developer Console: https://www.linkedin.com/developers/apps`);
}

// Generate test authorization URL
if (!missingVars.length) {
  const clientId = process.env.LINKEDIN_OPENID_CLIENT_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const redirectUri = `${siteUrl}/api/auth/linkedin/callback`;
  
  const authParams = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state: 'debug-test',
    scope: 'openid profile email',
  });

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${authParams.toString()}`;
  
  console.log(`\n🚀 Test Authorization URL:`);
  console.log(authUrl);
  console.log('\nTo test manually:');
  console.log('1. Open the URL above in your browser');
  console.log('2. Complete the LinkedIn authorization');
  console.log('3. Check server logs for any errors during callback');
}

// Common issues and solutions
console.log('\n🛠️  Common Issues & Solutions:');
console.log('');
console.log('1. Network Connectivity:');
console.log('   - Check if you can access LinkedIn from your environment');
console.log('   - Verify no corporate firewall is blocking OAuth requests');
console.log('   - Try running from a different network');
console.log('');
console.log('2. LinkedIn App Configuration:');
console.log('   - Verify your app has "Sign In with LinkedIn using OpenID Connect" product');
console.log('   - Check redirect URIs match exactly (including http/https)');
console.log('   - Ensure app is in "Live" status, not "Development"');
console.log('');
console.log('3. Environment Variables:');
console.log('   - Double-check CLIENT_ID and CLIENT_SECRET are correct');
console.log('   - Verify NEXT_PUBLIC_SITE_URL matches your app domain');
console.log('   - Make sure .env.local is in the project root');
console.log('');
console.log('4. Development vs Production:');
console.log('   - Use http://localhost:3000 for local development');
console.log('   - Use https://your-domain.com for production');
console.log('   - Never mix http/https in redirect URIs');

console.log('\n📚 Additional Resources:');
console.log('- LinkedIn OAuth 2.0 Guide: https://docs.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow');
console.log('- LinkedIn Developer Portal: https://www.linkedin.com/developers/apps');
console.log('- Project Setup Guide: /docs/features/linkedin-integration.md');

console.log('\n✅ Diagnostic complete');