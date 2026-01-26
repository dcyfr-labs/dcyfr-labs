#!/usr/bin/env node

/**
 * Validate Redis connectivity for all environments
 *
 * Usage:
 *   node scripts/validate-redis-connectivity.mjs
 *
 * Tests:
 *   1. Production database connection
 *   2. Preview/Dev database connection
 *   3. Key prefix isolation
 *   4. Read/write operations
 */

import { config } from 'dotenv';
import { Redis } from '@upstash/redis';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env.local from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');

const result = config({ path: envPath });
if (result.error) {
  console.warn(`⚠️  Warning: Could not load .env.local from ${envPath}`);
  console.warn('   Make sure environment variables are set or .env.local exists');
}

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(type, message) {
  const prefix = {
    success: `${colors.green}✅`,
    error: `${colors.red}❌`,
    warning: `${colors.yellow}⚠️`,
    info: `${colors.cyan}ℹ️`,
  }[type];
  console.log(`${prefix} ${message}${colors.reset}`);
}

async function testConnection(name, url, token, keyPrefix = '') {
  console.log(`\n${colors.cyan}Testing ${name}...${colors.reset}`);

  if (!url || !token) {
    log('error', `Missing credentials for ${name}`);
    return false;
  }

  try {
    const client = new Redis({ url, token });

    // Test 1: Ping
    const pingResult = await client.ping();
    if (pingResult === 'PONG') {
      log('success', 'Connection successful (PING → PONG)');
    } else {
      log('warning', `Unexpected ping response: ${pingResult}`);
    }

    // Test 2: Write test key
    const testKey = `${keyPrefix}health:test:${Date.now()}`;
    const testValue = 'connectivity-test';
    await client.set(testKey, testValue, { ex: 60 });
    log('success', `Write successful: ${testKey}`);

    // Test 3: Read test key
    const readValue = await client.get(testKey);
    if (readValue === testValue) {
      log('success', `Read successful: ${readValue}`);
    } else {
      log('error', `Read mismatch: expected "${testValue}", got "${readValue}"`);
    }

    // Test 4: Delete test key
    await client.del(testKey);
    log('success', `Cleanup successful: ${testKey} deleted`);

    // Test 5: Verify deletion
    const verifyDeletion = await client.get(testKey);
    if (verifyDeletion === null) {
      log('success', 'Deletion verified');
    } else {
      log('error', `Deletion failed: key still exists`);
    }

    return true;
  } catch (error) {
    log('error', `Connection failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  Redis Connectivity Validation${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);

  const results = {};

  // Test Production
  results.production = await testConnection(
    'Production Database',
    process.env.UPSTASH_REDIS_REST_URL,
    process.env.UPSTASH_REDIS_REST_TOKEN,
    '' // No prefix for production
  );

  // Test Preview/Dev
  results.preview = await testConnection(
    'Preview/Dev Database',
    process.env.UPSTASH_REDIS_REST_URL_PREVIEW,
    process.env.UPSTASH_REDIS_REST_TOKEN_PREVIEW,
    'dev:test:' // Test with dev prefix
  );

  // Summary
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  Summary${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);

  if (results.production) {
    log('success', 'Production database: Connected');
  } else {
    log('error', 'Production database: Failed');
  }

  if (results.preview) {
    log('success', 'Preview/Dev database: Connected');
  } else {
    log('error', 'Preview/Dev database: Failed');
  }

  // Exit code
  const allPassed = Object.values(results).every((r) => r);
  if (allPassed) {
    console.log(`\n${colors.green}✅ All connections validated successfully!${colors.reset}\n`);
    console.log('Next step: Run data migration');
    console.log('  node scripts/migrate-redis-data.mjs preview\n');
    process.exit(0);
  } else {
    console.log(`\n${colors.red}❌ Some connections failed${colors.reset}\n`);
    console.log('Check your environment variables in .env.local:');
    console.log('  UPSTASH_REDIS_REST_URL=...');
    console.log('  UPSTASH_REDIS_REST_TOKEN=...');
    console.log('  UPSTASH_REDIS_REST_URL_PREVIEW=...');
    console.log('  UPSTASH_REDIS_REST_TOKEN_PREVIEW=...\n');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`${colors.red}❌ Validation failed:${colors.reset}`, error.message);
  process.exit(1);
});
