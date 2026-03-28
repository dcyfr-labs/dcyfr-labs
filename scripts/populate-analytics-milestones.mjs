#!/usr/bin/env node
/**
 * Populate Analytics Milestones for Testing (DEV ONLY)
 *
 * ⚠️  WARNING: This script creates SAMPLE/TEST milestone data for development.
 * It should ONLY be used in development/staging environments.
 *
 * Do NOT run this in production - it will overwrite real analytics data with test data.
 *
 * In production, analytics milestones should be created by actual monitoring scripts
 * that track real Vercel Analytics, GitHub traffic, and Search Console data.
 *
 * Note: Google Analytics integration was considered but not implemented (removed February 2026).
 */

import { Redis } from '@upstash/redis';

async function populateAnalyticsMilestones() {
  // PRODUCTION CHECK: Prevent running in production
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production' || process.env.VERCEL_ENV === 'production';

  if (isProduction) {
    console.error('❌ BLOCKED: This script is for development/testing only!');
    console.error('   Environment: ' + nodeEnv);
    console.error('   Do NOT populate sample data in production.');
    console.error('');
    console.error('   If you need to set real analytics milestones in production:');
    console.error('   1. Implement real data fetching from Vercel Analytics API');
    console.error('   2. Set up GitHub traffic monitoring (requires admin access)');
    console.error('   3. Integrate Google Analytics data export');
    console.error('   4. Integrate Search Console API');
    process.exit(1);
  }

  console.log('✅ Running in DEV mode: ' + nodeEnv);
  console.log('📝 Note: This will populate TEST DATA in Redis.\n');

  // Check if Redis URL is configured
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.log('⚠️  UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not configured');
    console.log('💡 Add these to your .env.local file to connect to Upstash Redis');
    process.exit(0);
  }

  const redis = new Redis({ url, token });

  try {
    // Sample Vercel Analytics Milestones
    const vercelMilestones = [
      {
        type: 'monthly_visitors',
        threshold: 1000,
        reached_at: '2025-12-01T00:00:00.000Z',
        value: 1250,
      },
      {
        type: 'total_views',
        threshold: 10000,
        reached_at: '2025-11-15T00:00:00.000Z',
        value: 12400,
      },
      {
        type: 'unique_visitors',
        threshold: 5000,
        reached_at: '2025-10-20T00:00:00.000Z',
        value: 5300,
      },
    ];

    // Sample GitHub Traffic Milestones
    const githubMilestones = [
      {
        repo: 'dcyfr-labs',
        type: 'views',
        threshold: 1000,
        reached_at: '2025-12-10T00:00:00.000Z',
        value: 1150,
      },
      {
        repo: 'dcyfr-labs',
        type: 'clones',
        threshold: 50,
        reached_at: '2025-11-28T00:00:00.000Z',
        value: 67,
      },
      {
        repo: 'dcyfr-labs',
        type: 'stars',
        threshold: 10,
        reached_at: '2025-11-05T00:00:00.000Z',
        value: 15,
      },
    ];

    // Google Analytics removed - not implemented (February 2026)
    // If needed in future, implement OAuth 2.0 service account integration

    // Sample Search Console Milestones
    const searchMilestones = [
      {
        type: 'impressions',
        threshold: 5000,
        reached_at: '2025-12-05T00:00:00.000Z',
        value: 5420,
      },
      {
        type: 'clicks',
        threshold: 500,
        reached_at: '2025-11-25T00:00:00.000Z',
        value: 567,
      },
      {
        type: 'position',
        threshold: 3,
        reached_at: '2025-11-10T00:00:00.000Z',
        value: 2,
        query: 'cybersecurity architecture',
      },
      {
        type: 'top_keyword',
        reached_at: '2025-10-30T00:00:00.000Z',
        value: 'next.js security best practices',
      },
    ];

    // Store all milestones in Redis
    await redis.set('analytics:milestones', JSON.stringify(vercelMilestones));
    await redis.set('github:traffic:milestones', JSON.stringify(githubMilestones));
    // Note: Google Analytics not implemented - removed references
    await redis.set('search:console:milestones', JSON.stringify(searchMilestones));

    console.log('✅ Vercel Analytics milestones populated:', vercelMilestones.length);
    console.log('✅ GitHub Traffic milestones populated:', githubMilestones.length);
    console.log('⊘ Google Analytics milestones: REMOVED (not implemented)');
    console.log('✅ Search Console milestones populated:', searchMilestones.length);

    console.log(
      '\n🎯 Total analytics activities:',
      vercelMilestones.length + githubMilestones.length + searchMilestones.length
    );

    console.log('\n✅ Analytics milestones populated successfully!');
    console.log('💡 The activity cache will pick up these milestones on the next refresh.');
  } catch (error) {
    console.error('❌ Error populating analytics milestones:', error.message);
    console.log('');
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Redis connection refused. Please check:');
      console.log('1. Redis server is running locally (redis-server)');
      console.log('2. REDIS_URL is correct in your .env.local file');
      console.log('3. Or use a cloud Redis service like Upstash/Vercel KV');
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('💡 Redis host not found. Please check your REDIS_URL format:');
      console.log('   redis://localhost:6379 (local)');
      console.log('   redis://username:password@host:port (cloud)');
    } else {
      console.log('💡 Check your Redis configuration and try again');
    }

    process.exit(1);
  }
}

populateAnalyticsMilestones();
