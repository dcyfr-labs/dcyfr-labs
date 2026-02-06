#!/usr/bin/env node
/**
 * Check for view keys in production Redis
 */
import dotenv from 'dotenv';
import { Redis } from '@upstash/redis';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

console.log('🔍 Checking for view keys in production Redis...\n');

// Check production (no prefix) view keys
const prodViewKeys = await redis.keys('views:post:*');
const prodNonDayKeys = prodViewKeys.filter((k) => !k.includes(':day:'));
console.log('Production view keys (no prefix):', prodNonDayKeys.length);
if (prodNonDayKeys.length > 0) {
  console.log('Sample keys:', prodNonDayKeys.slice(0, 5));
  try {
    const val = await redis.get(prodNonDayKeys[0]);
    console.log(`Sample value (${prodNonDayKeys[0]}):`, val);
  } catch (e) {
    console.log(`Error reading ${prodNonDayKeys[0]}:`, e.message);
  }
}

// Check for preview-prefixed keys
const previewViewKeys = await redis.keys('preview:views:*');
console.log('\nPreview view keys (with prefix):', previewViewKeys.length);
if (previewViewKeys.length > 0) {
  console.log('Sample keys:', previewViewKeys.slice(0, 5));
  try {
    const val = await redis.get(previewViewKeys[0]);
    console.log(`Sample value (${previewViewKeys[0]}):`, val);
  } catch (e) {
    console.log(`Error reading ${previewViewKeys[0]}:`, e.message);
  }
}

// Check all keys matching view pattern
const allViewKeys = await redis.keys('*views:*');
console.log('\nAll keys matching *views*:', allViewKeys.length);
console.log('Patterns:', [...new Set(allViewKeys.map((k) => k.split(':').slice(0, 2).join(':')))]);
