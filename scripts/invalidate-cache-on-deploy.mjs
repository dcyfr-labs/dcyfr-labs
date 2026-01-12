#!/usr/bin/env node
/**
 * Invalidate Cache on Deployment
 *
 * Triggers cache invalidation when deploying to production.
 * This ensures fresh data is fetched after code changes.
 *
 * Usage:
 *   npm run deploy:invalidate
 *   node scripts/invalidate-cache-on-deploy.mjs
 *
 * Environment Variables:
 *   INNGEST_EVENT_KEY - Inngest event key for sending events
 *   VERCEL_ENV - Vercel environment (production, preview, development)
 *   VERCEL_GIT_COMMIT_SHA - Git commit SHA for tracking
 *
 * Triggers:
 *   - activity/cache.invalidate - Clears all activity cache versions
 */

import { config } from 'dotenv';

config({ path: '.env.local' });

const INNGEST_EVENT_KEY = process.env.INNGEST_EVENT_KEY;
const VERCEL_ENV = process.env.VERCEL_ENV || 'development';
const COMMIT_SHA = process.env.VERCEL_GIT_COMMIT_SHA || 'local';

async function invalidateCacheOnDeploy() {
  // Only run in production or when explicitly requested
  if (VERCEL_ENV !== 'production' && process.argv[2] !== '--force') {
    console.log('⏭️  Skipping cache invalidation (not production)');
    console.log('   Use --force to invalidate anyway');
    return;
  }

  if (!INNGEST_EVENT_KEY) {
    console.warn('⚠️  INNGEST_EVENT_KEY not configured - skipping cache invalidation');
    console.warn('   Set this in your Vercel environment variables');
    return;
  }

  try {
    console.log('🔄 Triggering cache invalidation...');
    console.log(`   Environment: ${VERCEL_ENV}`);
    console.log(`   Commit: ${COMMIT_SHA.substring(0, 7)}`);

    const response = await fetch('https://inn.gs/e/dcyfr-labs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${INNGEST_EVENT_KEY}`,
      },
      body: JSON.stringify({
        name: 'activity/cache.invalidate',
        data: {
          reason: 'deployment',
          commit: COMMIT_SHA,
          environment: VERCEL_ENV,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Inngest API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Cache invalidation triggered successfully');
    console.log(`   Event ID: ${result.ids?.[0] || 'unknown'}`);
    console.log('   Activity cache will be refreshed on next request');
  } catch (error) {
    console.error('❌ Failed to trigger cache invalidation:', error);
    // Don't fail the deployment - cache will naturally expire
    console.warn('⚠️  Cache will expire naturally (not critical)');
    process.exit(0); // Exit successfully to not block deployment
  }
}

invalidateCacheOnDeploy();
