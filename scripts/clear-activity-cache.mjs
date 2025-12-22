#!/usr/bin/env node
import { createClient } from 'redis';

async function clearActivityCache() {
  const redis = createClient({ url: process.env.REDIS_URL });
  
  try {
    await redis.connect();
    await redis.del('activity:feed:aggregated');
    console.log('✓ Activity cache cleared successfully');
    console.log('The next page load will fetch fresh data including certifications');
    await redis.quit();
    process.exit(0);
  } catch (error) {
    console.error('Error clearing cache:', error.message);
    await redis.quit();
    process.exit(1);
  }
}

clearActivityCache();
