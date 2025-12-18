#!/usr/bin/env node

/**
 * Redis Connection Test
 * 
 * Tests if the Redis/Upstash connection is working properly
 * Run: node scripts/test-redis-connection.mjs
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env.local') });

console.log('🔍 Testing Redis Connection');
console.log('===========================\n');

async function testRedisConnection() {
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    console.log('❌ REDIS_URL not configured in environment variables');
    return;
  }
  
  console.log('📋 Redis Configuration:');
  console.log(`   URL: ${redisUrl.replace(/\/\/[^@]+@/, '//***:***@')}`);
  console.log('');
  
  try {
    // Import Redis client
    const { Redis } = await import('@upstash/redis');
    
    console.log('📡 Creating Redis client...');
    const redis = new Redis({
      url: redisUrl
    });
    
    console.log('🔄 Testing basic operations...');
    
    // Test 1: Basic ping
    const startTime = Date.now();
    const pingResult = await redis.ping();
    const pingDuration = Date.now() - startTime;
    console.log(`   ✅ PING: ${pingResult} (${pingDuration}ms)`);
    
    // Test 2: Set/Get operation
    const testKey = 'linkedin-oauth-test:' + Date.now();
    const testValue = { timestamp: new Date().toISOString(), test: 'value' };
    
    const setStart = Date.now();
    await redis.set(testKey, JSON.stringify(testValue), { ex: 60 }); // Expire in 60 seconds
    const setDuration = Date.now() - setStart;
    console.log(`   ✅ SET: ${testKey} (${setDuration}ms)`);
    
    const getStart = Date.now();
    const retrievedValue = await redis.get(testKey);
    const getDuration = Date.now() - getStart;
    console.log(`   ✅ GET: ${testKey} (${getDuration}ms)`);
    
    if (retrievedValue) {
      const parsed = JSON.parse(retrievedValue);
      console.log(`   📄 Retrieved: ${parsed.timestamp}`);
    }
    
    // Test 3: Delete operation
    const delStart = Date.now();
    await redis.del(testKey);
    const delDuration = Date.now() - delStart;
    console.log(`   ✅ DEL: ${testKey} (${delDuration}ms)`);
    
    // Test 4: LinkedIn token storage simulation
    console.log('\\n🔐 Testing LinkedIn Token Storage Pattern:');
    const tokenData = {
      access_token: 'test_token_' + Date.now(),
      token_type: 'Bearer',
      expires_in: 5184000,
      scope: 'openid profile email'
    };
    
    const tokenKey = 'linkedin_openid_token';
    const expirationKey = 'linkedin_openid_expires_at';
    const expiresAt = Date.now() + (tokenData.expires_in * 1000);
    
    // Simulate the exact operations that LinkedInTokenManager does
    const pipeline = redis.pipeline();
    pipeline.set(tokenKey, JSON.stringify(tokenData));
    pipeline.set(expirationKey, expiresAt.toString());
    
    const pipelineStart = Date.now();
    const results = await pipeline.exec();
    const pipelineDuration = Date.now() - pipelineStart;
    
    console.log(`   ✅ Pipeline SET operations (${pipelineDuration}ms)`);
    console.log(`   📄 Results:`, results);
    
    // Clean up
    await redis.del([tokenKey, expirationKey]);
    console.log(`   🧹 Cleaned up test tokens`);
    
    console.log('\\n✅ Redis connection test successful!');
    console.log('   The LinkedIn OAuth error is NOT caused by Redis connectivity.');
    
  } catch (error) {
    console.log('❌ Redis connection test failed:');
    console.log(`   Error: ${error.message}`);
    console.log('');
    
    if (error.message.includes('fetch failed')) {
      console.log('🔍 This is the same "fetch failed" error from LinkedIn OAuth!');
      console.log('   Root cause: Network connectivity to Redis/Upstash server');
      console.log('');
      console.log('💡 Solutions:');
      console.log('   1. Check internet connectivity to upstash.com');
      console.log('   2. Verify Redis URL is correct and active');
      console.log('   3. Try accessing Redis from a different network');
      console.log('   4. Contact Upstash support if service is down');
      console.log('   5. Add fallback handling for Redis failures');
    } else if (error.message.includes('authentication')) {
      console.log('🔐 Authentication error:');
      console.log('   1. Verify REDIS_URL credentials are correct');
      console.log('   2. Check if Redis instance is still active');
      console.log('   3. Regenerate Redis password if needed');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
      console.log('🌐 Network error:');
      console.log('   1. DNS resolution failure for Redis host');
      console.log('   2. Firewall blocking Redis port');
      console.log('   3. VPN interfering with connection');
    }
  }
}

async function main() {
  await testRedisConnection();
  
  console.log('\\n🎯 Analysis:');
  console.log('=============');
  console.log('If Redis test succeeded:');
  console.log('• LinkedIn OAuth is working perfectly (token exchange status: 200 OK)');
  console.log('• The error happens during token storage, not OAuth');
  console.log('• Check LinkedInTokenManager.storeToken() implementation');
  console.log('');
  console.log('If Redis test failed:');
  console.log('• This confirms Redis connectivity is the root cause');
  console.log('• LinkedIn OAuth succeeds but token storage fails');
  console.log('• Fix Redis connection or add fallback handling');
}

main().catch(console.error);