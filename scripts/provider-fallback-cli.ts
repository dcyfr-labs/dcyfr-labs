#!/usr/bin/env tsx
/**
 * Provider Fallback CLI (v1.0)
 *
 * Command-line interface for managing provider fallback system
 *
 * Usage:
 *   tsx scripts/provider-fallback-cli.ts status
 *   tsx scripts/provider-fallback-cli.ts health
 *   tsx scripts/provider-fallback-cli.ts fallback
 *   tsx scripts/provider-fallback-cli.ts return
 */

import {
  initializeGlobalFallbackManager,
  getGlobalFallbackManager,
  type FallbackManagerConfig,
  type ProviderHealth,
  type ProviderType,
} from '../src/lib/agents/provider-fallback-manager';

const DEFAULT_CONFIG: FallbackManagerConfig = {
  primaryProvider: 'claude',
  fallbackChain: ['groq', 'ollama'],
  autoReturn: true,
  healthCheckInterval: 60000, // 1 minute
  validationLevel: 'enhanced',
};

function formatHealth(health: ProviderHealth): string {
  const status = health.available ? '✅' : '❌';
  const responseTime = health.responseTime
    ? `${health.responseTime}ms`
    : 'N/A';

  const rateLimit = health.rateLimitRemaining
    ? `${health.rateLimitRemaining} requests remaining`
    : 'N/A';

  const error = health.error ? `\n   Error: ${health.error}` : '';

  return `${status} ${health.provider}
   Available: ${health.available}
   Response Time: ${responseTime}
   Rate Limit: ${rateLimit}
   Last Checked: ${health.lastChecked.toLocaleString()}${error}`;
}

async function showStatus(): Promise<void> {
  const manager = getGlobalFallbackManager();

  if (!manager) {
    console.log('⚠️  Fallback manager not initialized');
    console.log('💡 Initialize with: npm run fallback:init');
    return;
  }

  const currentProvider = manager.getCurrentProvider();
  const healthStatus = manager.getHealthStatus();

  console.log('📊 Provider Fallback Status\n');
  console.log(`Current Provider: ${currentProvider}\n`);
  console.log('Provider Health:');

  healthStatus.forEach((health) => {
    console.log(formatHealth(health));
    console.log('');
  });
}

async function checkHealth(): Promise<void> {
  console.log('🔍 Checking provider health...\n');

  const manager =
    getGlobalFallbackManager() || initializeGlobalFallbackManager(DEFAULT_CONFIG);

  const healthStatus = manager.getHealthStatus();

  healthStatus.forEach((health) => {
    console.log(formatHealth(health));
    console.log('');
  });
}

async function triggerFallback(): Promise<void> {
  const manager = getGlobalFallbackManager();

  if (!manager) {
    console.log('⚠️  Fallback manager not initialized');
    console.log('💡 Initialize with: npm run fallback:init');
    return;
  }

  const currentProvider = manager.getCurrentProvider();
  console.log(`Current provider: ${currentProvider}`);
  console.log('Triggering fallback to next provider...\n');

  await manager.fallbackToNext();

  const newProvider = manager.getCurrentProvider();
  console.log(`✅ Switched to: ${newProvider}`);
}

async function returnToPrimary(): Promise<void> {
  const manager = getGlobalFallbackManager();

  if (!manager) {
    console.log('⚠️  Fallback manager not initialized');
    console.log('💡 Initialize with: npm run fallback:init');
    return;
  }

  console.log('Returning to primary provider...\n');

  await manager.returnToPrimary();

  const provider = manager.getCurrentProvider();
  console.log(`✅ Returned to primary: ${provider}`);
}

async function initializeManager(): Promise<void> {
  console.log('🚀 Initializing Provider Fallback Manager...\n');

  const manager = initializeGlobalFallbackManager(DEFAULT_CONFIG);

  console.log('✅ Manager initialized');
  console.log(`   Primary: ${DEFAULT_CONFIG.primaryProvider}`);
  console.log(`   Fallback Chain: ${DEFAULT_CONFIG.fallbackChain.join(' → ')}`);
  console.log(`   Auto-Return: ${DEFAULT_CONFIG.autoReturn}`);
  console.log(
    `   Health Check Interval: ${DEFAULT_CONFIG.healthCheckInterval / 1000}s\n`,
  );

  await showStatus();
}

async function showHelp(): Promise<void> {
  console.log(`
Provider Fallback CLI v1.0

Usage: npm run fallback:<command>

Commands:
  init       Initialize fallback manager with default config
  status     Show current provider status and health
  health     Check health of all providers
  fallback   Manually trigger fallback to next provider
  return     Return to primary provider
  help       Show this help message

Examples:
  npm run fallback:status
  npm run fallback:health
  npm run fallback:fallback
  npm run fallback:return

Documentation: docs/operations/PROVIDER_FALLBACK_SYSTEM.md
`);
}

// Main CLI logic
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'init':
      await initializeManager();
      break;
    case 'status':
      await showStatus();
      break;
    case 'health':
      await checkHealth();
      break;
    case 'fallback':
      await triggerFallback();
      break;
    case 'return':
      await returnToPrimary();
      break;
    case 'help':
    default:
      await showHelp();
      break;
  }
}

// Cleanup
process.on('SIGINT', () => {
  const manager = getGlobalFallbackManager();
  if (manager) {
    manager.destroy();
  }
  process.exit(0);
});

// Run main
main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
