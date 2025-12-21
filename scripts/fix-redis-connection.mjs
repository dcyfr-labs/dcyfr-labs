#!/usr/bin/env node

/**
 * Redis Service Identification and Connection Fix
 * 
 * Identifies the Redis service type and tests different connection methods
 * Run: node scripts/fix-redis-connection.mjs
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env.local') });

console.log('🔧 Redis Connection Diagnostic & Fix');
console.log('====================================\n');

async function analyzeRedisUrl() {
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    console.log('❌ REDIS_URL not configured');
    return null;
  }
  
  console.log('🔍 Analyzing Redis URL:');
  console.log(`   Raw URL: ${redisUrl.replace(/\/\/[^@]+@/, '//***:***@')}`);
  
  const parsed = new URL(redisUrl);
  console.log(`   Protocol: ${parsed.protocol}`);
  console.log(`   Host: ${parsed.hostname}`);
  console.log(`   Port: ${parsed.port}`);
  console.log(`   Username: ${parsed.username}`);
  console.log(`   Password: ${parsed.password ? '***' + parsed.password.slice(-4) : 'none'}`);
  
  // Identify Redis service based on hostname
  // lgtm [js/incomplete-url-substring-sanitization]
  // Safe: hostname is from URL.parse() constructor, not user input.
  // URL.parse() properly validates and extracts the hostname component.
  let serviceType = 'unknown';
  if (parsed.hostname.includes('upstash.io')) { // lgtm[js/incomplete-url-substring-sanitization]
    serviceType = 'upstash';
  } else if (parsed.hostname.includes('redis-cloud.com') || parsed.hostname.includes('redislabs.com')) { // lgtm[js/incomplete-url-substring-sanitization]
    serviceType = 'redis-cloud';
  } else if (parsed.hostname.includes('amazonaws.com')) { // lgtm[js/incomplete-url-substring-sanitization]
    serviceType = 'aws-elasticache';
  } else if (parsed.hostname.includes('azure.com')) { // lgtm[js/incomplete-url-substring-sanitization]
    serviceType = 'azure-redis';
  } else if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
    serviceType = 'local';
  }
  
  console.log(`   Service Type: ${serviceType.toUpperCase()}`);
  
  return {
    url: redisUrl,
    parsed,
    serviceType,
    host: parsed.hostname,
    port: parsed.port,
    username: parsed.username,
    password: parsed.password
  };
}

async function testUpstashClient(redisInfo) {
  console.log('\n🧪 Testing Upstash Client (@upstash/redis):');
  
  try {
    const { Redis } = await import('@upstash/redis');
    
    // Current approach (converting Redis URL to REST format)
    const restUrl = `https://${redisInfo.host}:${redisInfo.port}`;
    const token = redisInfo.password;
    
    console.log(`   Attempting connection to: ${restUrl}`);
    console.log(`   Using token: ***${token?.slice(-4) || 'none'}`);
    
    const redis = new Redis({ url: restUrl, token });
    await redis.ping();
    
    console.log('   ✅ Upstash client successful!');
    return { success: true, client: redis, method: 'upstash-rest' };
    
  } catch (error) {
    console.log(`   ❌ Upstash client failed: ${error.message}`);
    return { success: false, error: error.message, method: 'upstash-rest' };
  }
}

async function testIORedisClient(redisInfo) {
  console.log('\n🧪 Testing ioredis Client (traditional Redis):');
  
  try {
    const { default: IORedis } = await import('ioredis');
    
    console.log(`   Attempting connection to: ${redisInfo.url}`);
    
    const redis = new IORedis(redisInfo.url, {
      connectTimeout: 10000,
      lazyConnect: true,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    });
    
    await redis.ping();
    console.log('   ✅ ioredis client successful!');
    
    // Test basic operations
    await redis.set('test:connection', 'success', 'EX', 60);
    const value = await redis.get('test:connection');
    console.log(`   ✅ Set/Get test: ${value}`);
    
    await redis.del('test:connection');
    await redis.quit();
    
    return { success: true, client: 'ioredis', method: 'ioredis-native' };
    
  } catch (error) {
    console.log(`   ❌ ioredis client failed: ${error.message}`);
    return { success: false, error: error.message, method: 'ioredis-native' };
  }
}

async function testNodeRedisClient(redisInfo) {
  console.log('\n🧪 Testing node-redis Client (official Redis client):');
  
  try {
    const redis = await import('redis');
    
    console.log(`   Attempting connection to: ${redisInfo.url}`);
    
    const client = redis.createClient({
      url: redisInfo.url,
      socket: {
        connectTimeout: 10000
      }
    });
    
    await client.connect();
    await client.ping();
    console.log('   ✅ node-redis client successful!');
    
    // Test basic operations
    await client.setEx('test:connection', 60, 'success');
    const value = await client.get('test:connection');
    console.log(`   ✅ Set/Get test: ${value}`);
    
    await client.del('test:connection');
    await client.quit();
    
    return { success: true, client: 'node-redis', method: 'node-redis-official' };
    
  } catch (error) {
    console.log(`   ❌ node-redis client failed: ${error.message}`);
    return { success: false, error: error.message, method: 'node-redis-official' };
  }
}

async function testBasicNetworkConnectivity(redisInfo) {
  console.log('\n🌐 Testing Basic Network Connectivity:');
  
  // Test basic TCP connectivity
  const host = redisInfo.host;
  const port = redisInfo.port;
  
  try {
    // Use Node.js net module to test raw TCP connection
    const net = await import('net');
    
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let connected = false;
      
      socket.setTimeout(5000);
      
      socket.on('connect', () => {
        connected = true;
        console.log(`   ✅ TCP connection to ${host}:${port} successful`);
        socket.destroy();
        resolve({ success: true });
      });
      
      socket.on('timeout', () => {
        console.log(`   ❌ TCP connection timeout to ${host}:${port}`);
        socket.destroy();
        resolve({ success: false, error: 'timeout' });
      });
      
      socket.on('error', (error) => {
        if (!connected) {
          console.log(`   ❌ TCP connection error: ${error.message}`);
          resolve({ success: false, error: error.message });
        }
      });
      
      socket.connect(parseInt(port), host);
    });
    
  } catch (error) {
    console.log(`   ❌ Network test failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function generateFixedConfiguration(workingMethod, redisInfo) {
  console.log('\n🔧 Generating Fixed Configuration:');
  console.log('==================================');
  
  if (workingMethod.success) {
    console.log(`✅ Working Method: ${workingMethod.method}`);
    
    if (workingMethod.method === 'ioredis-native' || workingMethod.method === 'node-redis-official') {
      // Need to update LinkedInTokenManager to use traditional Redis client
      console.log('\n📝 Required Changes:');
      console.log('1. Install traditional Redis client:');
      console.log('   npm install ioredis');
      console.log('');
      console.log('2. Update LinkedInTokenManager to use ioredis:');
      console.log('   Replace @upstash/redis import with ioredis');
      console.log('   Update Redis client initialization');
      console.log('   Modify Redis commands for ioredis syntax');
      
      return {
        method: workingMethod.method,
        clientLib: workingMethod.method === 'ioredis-native' ? 'ioredis' : 'redis',
        redisUrl: redisInfo.url,
        needsCodeChange: true
      };
      
    } else if (workingMethod.method === 'upstash-rest') {
      console.log('\n📝 Configuration is correct - Upstash client working');
      console.log('✅ No changes needed to LinkedInTokenManager');
      
      return {
        method: workingMethod.method,
        clientLib: '@upstash/redis',
        redisUrl: redisInfo.url,
        needsCodeChange: false
      };
    }
  } else {
    console.log('❌ No working Redis connection method found');
    console.log('\n🔧 Troubleshooting Options:');
    console.log('1. Verify Redis instance is active and accessible');
    console.log('2. Check Redis service status/health');
    console.log('3. Verify credentials are correct');
    console.log('4. Test from different network location');
    console.log('5. Consider creating new Redis instance');
    
    return {
      method: 'none',
      needsCodeChange: false,
      recommendations: [
        'Verify Redis instance status',
        'Check network/firewall restrictions',
        'Validate Redis credentials',
        'Consider alternative Redis provider'
      ]
    };
  }
}

async function main() {
  const redisInfo = await analyzeRedisUrl();
  
  if (!redisInfo) {
    console.log('Cannot proceed without Redis URL');
    return;
  }
  
  // Test network connectivity first
  const networkResult = await testBasicNetworkConnectivity(redisInfo);
  
  if (!networkResult.success) {
    console.log('\n❌ Basic network connectivity failed');
    console.log('   This explains the "fetch failed" errors');
    console.log('   Redis instance may be down, unreachable, or blocked by firewall');
    return;
  }
  
  // Test different Redis clients
  const results = [];
  
  // Test current approach (Upstash)
  if (redisInfo.serviceType === 'upstash' || redisInfo.serviceType === 'unknown') {
    results.push(await testUpstashClient(redisInfo));
  }
  
  // Test traditional Redis clients
  results.push(await testIORedisClient(redisInfo));
  results.push(await testNodeRedisClient(redisInfo));
  
  // Find working method
  const workingMethod = results.find(r => r.success);
  
  // Generate fix
  const fix = await generateFixedConfiguration(workingMethod || { success: false }, redisInfo);
  
  console.log('\n🎯 REDIS FIX SUMMARY:');
  console.log('=====================');
  if (fix.needsCodeChange) {
    console.log(`✅ Solution: Switch to ${fix.clientLib}`);
    console.log('🔧 Code changes required in LinkedInTokenManager');
  } else if (fix.method === 'upstash-rest') {
    console.log('✅ Current configuration works - no changes needed');
  } else {
    console.log('❌ Redis connectivity issues require infrastructure fix');
  }
}

main().catch(console.error);