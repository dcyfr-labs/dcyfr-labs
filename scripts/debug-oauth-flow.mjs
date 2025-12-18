#!/usr/bin/env node

/**
 * LinkedIn OAuth Flow Debugger
 * 
 * This helps debug the authorization code flow step by step
 * Run: node scripts/debug-oauth-flow.mjs
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env.local') });

console.log('🔍 LinkedIn OAuth Flow Debugger');
console.log('================================\n');

function generateOAuthURL() {
  const clientId = process.env.LINKEDIN_OPENID_CLIENT_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const redirectUri = `${siteUrl}/api/auth/linkedin/callback`;
  
  if (!clientId) {
    console.log('❌ LINKEDIN_OPENID_CLIENT_ID not configured');
    return null;
  }
  
  const state = 'debug-' + Date.now();
  const scope = 'openid profile email';
  
  const authParams = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state: state,
    scope: scope,
  });
  
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${authParams.toString()}`;
  
  console.log('🔗 Generated OAuth Authorization URL:');
  console.log('=====================================');
  console.log(`URL: ${authUrl}`);
  console.log('');
  console.log('Parameters:');
  console.log(`  • Client ID: ${clientId}`);
  console.log(`  • Redirect URI: ${redirectUri}`);
  console.log(`  • State: ${state}`);
  console.log(`  • Scope: ${scope}`);
  console.log('');
  
  return { authUrl, state, redirectUri };
}

async function testTokenExchange(authCode, state, redirectUri) {
  if (!authCode) {
    console.log('⚠️  No authorization code provided - skipping token exchange test');
    return;
  }
  
  const clientId = process.env.LINKEDIN_OPENID_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_OPENID_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    console.log('❌ Missing LinkedIn credentials');
    return;
  }
  
  console.log('🔄 Testing Token Exchange:');
  console.log('==========================');
  console.log(`  Authorization Code: ${authCode.substring(0, 20)}...`);
  console.log(`  State: ${state}`);
  console.log(`  Redirect URI: ${redirectUri}`);
  console.log('');
  
  const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
  
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: authCode,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });
  
  try {
    console.log('📡 Making token exchange request...');
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'dcyfr-labs/oauth-debug',
      },
      body: body.toString(),
    });
    
    const responseText = await response.text();
    console.log(`Response Status: ${response.status} ${response.statusText}`);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('');
    
    if (response.ok) {
      try {
        const tokenData = JSON.parse(responseText);
        console.log('✅ Token Exchange Successful!');
        console.log('Token Data:');
        console.log(`  • Access Token: ${tokenData.access_token?.substring(0, 20)}...`);
        console.log(`  • Token Type: ${tokenData.token_type}`);
        console.log(`  • Expires In: ${tokenData.expires_in} seconds`);
        console.log(`  • Scope: ${tokenData.scope}`);
        console.log('');
        
        // Test the token with a profile request
        await testProfileRequest(tokenData.access_token);
        
      } catch (parseError) {
        console.log('⚠️  Could not parse response as JSON:', responseText);
      }
    } else {
      console.log('❌ Token Exchange Failed:');
      try {
        const errorData = JSON.parse(responseText);
        console.log(`Error: ${errorData.error}`);
        console.log(`Description: ${errorData.error_description}`);
        
        if (errorData.error === 'invalid_grant') {
          console.log('');
          console.log('💡 This means the authorization code is invalid, expired, or already used:');
          console.log('   • Authorization codes expire in 10 minutes');
          console.log('   • Each code can only be used once');
          console.log('   • The redirect_uri must match exactly');
          console.log('   • Try generating a fresh authorization URL');
        }
      } catch (parseError) {
        console.log('Raw error response:', responseText);
      }
    }
    
  } catch (fetchError) {
    console.log('❌ Network Error during token exchange:');
    console.log(`   Error: ${fetchError.message}`);
    console.log('   This is the same error you\'re experiencing in the OAuth callback!');
    console.log('');
    
    if (fetchError.message.includes('fetch failed')) {
      console.log('🔍 Troubleshooting fetch failed error:');
      console.log('   1. Authorization code may be malformed');
      console.log('   2. Request body encoding issue');
      console.log('   3. Temporary LinkedIn API issue');
      console.log('   4. SSL/TLS handshake problem');
      console.log('   5. Request timeout');
    }
  }
}

async function testProfileRequest(accessToken) {
  if (!accessToken) {
    return;
  }
  
  console.log('👤 Testing Profile Request:');
  console.log('===========================');
  
  try {
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });
    
    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      console.log('✅ Profile Request Successful!');
      console.log(`  Name: ${profile.firstName?.localized?.en_US || 'N/A'} ${profile.lastName?.localized?.en_US || 'N/A'}`);
      console.log(`  ID: ${profile.id}`);
    } else {
      console.log(`❌ Profile Request Failed: ${profileResponse.status} ${profileResponse.statusText}`);
      const errorText = await profileResponse.text();
      console.log(`Error: ${errorText}`);
    }
    
  } catch (error) {
    console.log(`❌ Profile Request Error: ${error.message}`);
  }
}

function printInstructions() {
  console.log('📋 Next Steps:');
  console.log('==============');
  console.log('1. Copy the authorization URL above');
  console.log('2. Open it in your browser');
  console.log('3. Complete the LinkedIn authorization');
  console.log('4. When redirected back to localhost, copy the "code" parameter from the URL');
  console.log('5. Run this script again with the code:');
  console.log('   node scripts/debug-oauth-flow.mjs YOUR_CODE_HERE');
  console.log('');
  console.log('Example:');
  console.log('   node scripts/debug-oauth-flow.mjs AQV8Fn5Z8qT...');
  console.log('');
  console.log('If you get the "fetch failed" error during step 5, that confirms it\'s');
  console.log('happening during the token exchange, not due to network connectivity.');
}

async function main() {
  // Check if authorization code provided as argument
  const authCode = process.argv[2];
  
  if (!authCode) {
    // Generate new OAuth URL
    const oauthInfo = generateOAuthURL();
    if (oauthInfo) {
      printInstructions();
    }
  } else {
    // Test token exchange with provided code
    console.log('🔄 Using provided authorization code for testing...\n');
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const redirectUri = `${siteUrl}/api/auth/linkedin/callback`;
    const state = 'debug-test';
    
    await testTokenExchange(authCode, state, redirectUri);
    
    console.log('\n🎯 Analysis:');
    console.log('=============');
    console.log('If the token exchange succeeded here, but fails in your OAuth callback:');
    console.log('• Check that the authorization code reaches the callback quickly (< 10 min)');
    console.log('• Verify the redirect_uri parameter matches exactly in both requests');
    console.log('• Check for any middleware that might interfere with the request');
    console.log('');
    console.log('If the token exchange failed here with "fetch failed":');
    console.log('• This confirms the issue is with the fetch operation itself');
    console.log('• The authorization code might be malformed or corrupted');
    console.log('• There could be an issue with request body encoding');
  }
}

main().catch(console.error);