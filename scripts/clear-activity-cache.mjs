#!/usr/bin/env node
import { createClient } from 'redis';

async function clearActivityCache() {
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    console.log('⚠️  REDIS_URL not configured - no cache to clear');
    return;
  }

  try {
    const redis = createClient({ url: redisUrl });
    await redis.connect();
    
    await redis.del('activity:feed:all');
    console.log('✅ Cleared activity:feed:all cache');
    
    await redis.quit();
  } catch (error) {
    console.error('❌ Failed to clear cache:', error);
    process.exit(1);
  }
}

clearActivityCache();
