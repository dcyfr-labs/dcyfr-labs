#!/usr/bin/env node
/**
 * Populate Analytics Milestones for Testing
 * 
 * This script creates sample milestone data in Redis for testing the analytics
 * activity feed integrations. In production, these milestones would be created
 * by separate monitoring scripts that track real analytics data.
 */

import { createClient } from 'redis';

async function populateAnalyticsMilestones() {
  // Check if Redis URL is configured
  if (!process.env.REDIS_URL) {
    console.log('⚠️  REDIS_URL not configured in environment');
    console.log('💡 This script requires Redis for storing analytics milestones');
    console.log('');
    console.log('To set up Redis:');
    console.log('1. Add REDIS_URL to your .env.local file');
    console.log('2. Use a local Redis server or cloud service like Upstash/Vercel KV');
    console.log('');
    console.log('Example .env.local entry:');
    console.log('REDIS_URL=redis://localhost:6379');
    console.log('');
    console.log('For testing without Redis, the analytics integration will gracefully');
    console.log('handle missing data and not display any analytics milestones.');
    process.exit(0);
  }

  const redis = createClient({ url: process.env.REDIS_URL });
  
  try {
    console.log('🔌 Connecting to Redis...');
    await redis.connect();
    console.log('✅ Connected to Redis');

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

    // Sample Google Analytics Milestones
    const googleMilestones = [
      {
        type: 'monthly_users',
        threshold: 2000,
        reached_at: '2025-12-01T00:00:00.000Z',
        value: 2150,
        month: 'November 2025',
      },
      {
        type: 'session_duration',
        threshold: 180, // 3 minutes in seconds
        reached_at: '2025-11-20T00:00:00.000Z',
        value: 195,
      },
      {
        type: 'pages_per_session',
        threshold: 2.5,
        reached_at: '2025-10-15T00:00:00.000Z',
        value: 2.8,
      },
    ];

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
    await redis.set('google:analytics:milestones', JSON.stringify(googleMilestones));
    await redis.set('search:console:milestones', JSON.stringify(searchMilestones));

    console.log('✅ Vercel Analytics milestones populated:', vercelMilestones.length);
    console.log('✅ GitHub Traffic milestones populated:', githubMilestones.length);
    console.log('✅ Google Analytics milestones populated:', googleMilestones.length);
    console.log('✅ Search Console milestones populated:', searchMilestones.length);
    
    console.log('\n🎯 Total analytics activities:', 
      vercelMilestones.length + githubMilestones.length + 
      googleMilestones.length + searchMilestones.length
    );

    await redis.quit();
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
    
    try {
      await redis.quit();
    } catch (quitError) {
      // Ignore quit errors if already disconnected
    }
    process.exit(1);
  }
}

populateAnalyticsMilestones();