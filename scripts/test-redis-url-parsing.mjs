#!/usr/bin/env node

/**
 * Test Redis URL parsing for LinkedIn Token Manager
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env.local') });

// Replicate the parseRedisUrl function from LinkedInTokenManager
function parseRedisUrl(url) {
  console.log('Original URL:', url);
  
  try {
    const parsed = new URL(url);
    console.log('Parsed URL components:');
    console.log('  Protocol:', parsed.protocol);
    console.log('  Username:', parsed.username);
    console.log('  Password:', parsed.password ? '***' + parsed.password.slice(-4) : 'undefined');
    console.log('  Hostname:', parsed.hostname);
    console.log('  Port:', parsed.port);
    console.log('  Pathname:', parsed.pathname);
    
    const token = parsed.password;
    const host = parsed.hostname;
    const port = parsed.port;
    
    // Convert to Upstash REST API format
    const restUrl = `https://${host}:${port}`;
    
    console.log('\\nConverted for Upstash:');
    console.log('  URL:', restUrl);
    console.log('  Token:', token ? '***' + token.slice(-4) : 'undefined');
    
    return { url: restUrl, token };
  } catch (error) {
    console.error('Error parsing Redis URL:', error.message);
    return null;
  }
}

async function testRedisUrlParsing() {
  console.log('🔍 Testing Redis URL Parsing');
  console.log('=============================\\n');
  
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    console.log('❌ REDIS_URL not found in environment');
    return;
  }
  
  const result = parseRedisUrl(redisUrl);
  
  if (result) {
    console.log('\\n✅ URL parsing successful');
    console.log('\\n🧪 Testing Upstash connection with parsed URL...');
    
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis(result);
      
      console.log('📡 Testing connection...');
      const pingResult = await redis.ping();
      console.log(`✅ PING successful: ${pingResult}`);
      
      // Test the exact operation that's failing
      console.log('\\n🔐 Testing token storage operation...');
      const testTokenData = {
        access_token: 'test_token',
        expires_in: 3600,
        scope: 'test'
      };
      
      const expiresAt = Date.now() + (testTokenData.expires_in * 1000);
      const tokenInfo = {
        accessToken: testTokenData.access_token,
        expiresAt,
        scope: testTokenData.scope,
        tokenType: 'openid',
        lastRefreshed: Date.now()
      };
      
      const key = 'linkedin:token:test';
      await redis.setex(key, testTokenData.expires_in, JSON.stringify(tokenInfo));
      console.log('✅ Token storage operation successful');
      
      // Clean up
      await redis.del(key);
      console.log('🧹 Test cleanup complete');
      
    } catch (error) {
      console.log(`❌ Upstash connection failed: ${error.message}`);
      
      if (error.message.includes('fetch failed')) {
        console.log('\\n🔍 This is the same "fetch failed" error!');
        console.log('   The issue is network connectivity to Upstash Redis.');
      }
    }
  } else {
    console.log('❌ URL parsing failed');
  }
}

async function main() {
  await testRedisUrlParsing();
  
  console.log('\\n🎯 Summary:');
  console.log('============');
  console.log('• LinkedIn OAuth works perfectly (status 200 OK)');
  console.log('• Error occurs during Redis token storage operation');
  console.log('• If Redis test fails with "fetch failed" → Network issue to Upstash');
  console.log('• If Redis test succeeds → Check LinkedInTokenManager implementation');
}

main().catch(console.error);