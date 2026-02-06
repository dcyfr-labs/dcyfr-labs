#!/usr/bin/env node
/**
 * Post-deployment cache refresh script
 *
 * Triggers GitHub data refresh immediately after deployment to ensure
 * the cache is populated before users access the site.
 *
 * Usage:
 *   node scripts/post-deploy-refresh.mjs
 *
 * Environment Variables:
 *   VERCEL_URL - Deployment URL (auto-set by Vercel)
 *   GITHUB_REFRESH_TOKEN - Auth token for refresh endpoint
 *
 * Or use with Vercel Deploy Hooks:
 *   Set as a deploy hook in Vercel dashboard to run after each deployment
 */

const TIMEOUT = 10000; // 10 second timeout

async function refreshGitHubCache() {
  // Determine the deployment URL
  const deploymentUrl =
    process.env.VERCEL_URL || // Vercel preview/production
    process.env.DEPLOYMENT_URL || // Custom
    'localhost:3000'; // Local fallback

  const protocol = deploymentUrl.includes('localhost') ? 'http' : 'https';
  const url = `${protocol}://${deploymentUrl}/api/github/refresh`;

  console.log('🔄 Triggering GitHub cache refresh...');
  console.log(`   URL: ${url}`);
  console.log(`   Environment: ${process.env.VERCEL_ENV || 'development'}`);

  const headers = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  if (process.env.GITHUB_REFRESH_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_REFRESH_TOKEN}`;
    console.log('   Auth: Bearer token');
  } else {
    console.log('   Auth: Vercel internal (x-vercel-deployment-url)');
    headers['x-vercel-deployment-url'] = deploymentUrl;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ force: true }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`HTTP ${response.status}: ${error.message || error.error}`);
    }

    const result = await response.json();
    console.log('✅ GitHub cache refresh triggered successfully');
    console.log(`   ${result.note || 'Cache will be updated shortly'}`);

    return true;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Request timed out after', TIMEOUT / 1000, 'seconds');
    } else {
      console.error('❌ Failed to trigger cache refresh:', error.message);
    }

    // Don't fail the deployment, just warn
    console.warn('⚠️  Deployment will continue, but cache may not be immediately available');
    console.warn('   The hourly cron job will populate the cache within 1 hour');

    return false;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  refreshGitHubCache()
    .then((success) => {
      process.exit(success ? 0 : 0); // Always exit 0 to not fail deployment
    })
    .catch((error) => {
      console.error('Unexpected error:', error);
      process.exit(0); // Still exit 0 to not fail deployment
    });
}

export { refreshGitHubCache };
