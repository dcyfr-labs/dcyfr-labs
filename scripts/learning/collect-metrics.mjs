#!/usr/bin/env node

/**
 * Collect Agent Metrics
 *
 * Records execution metrics for agent performance tracking
 *
 * Usage: npm run learning:collect --agent <name> --tokens <num> --time <ms> --outcome <result>
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const METRICS_PATH = path.join(__dirname, '../../.github/agents/learning-data/metrics.json');

async function collectMetrics(options) {
  const { agent, tokens, time, outcome = 'success', filesModified = 0 } = options;

  const metrics = JSON.parse(await fs.readFile(METRICS_PATH, 'utf8'));

  const session = {
    sessionId: randomUUID(),
    timestamp: new Date().toISOString(),
    agent,
    metrics: {
      tokensUsed: parseInt(tokens),
      executionTimeMs: parseInt(time),
      filesModified: parseInt(filesModified),
      outcome
    }
  };

  metrics.sessions.push(session);

  // Update aggregates
  metrics.aggregates.totalSessions = metrics.sessions.length;
  metrics.aggregates.avgTokensPerSession = Math.round(
    metrics.sessions.reduce((sum, s) => sum + s.metrics.tokensUsed, 0) / metrics.sessions.length
  );
  metrics.aggregates.successRate = metrics.sessions.filter(s => s.metrics.outcome === 'success').length / metrics.sessions.length;
  metrics.aggregates.lastUpdated = new Date().toISOString();

  await fs.writeFile(METRICS_PATH, JSON.stringify(metrics, null, 2));

  console.log('✅ Metrics recorded');
  console.log(`   Agent: ${agent}`);
  console.log(`   Tokens: ${tokens}`);
  console.log(`   Time: ${time}ms`);
  console.log(`   Outcome: ${outcome}`);
}

// Parse CLI args
const args = process.argv.slice(2);
const options = {};
for (let i = 0; i < args.length; i += 2) {
  options[args[i].replace('--', '')] = args[i + 1];
}

collectMetrics(options).catch(err => {
  console.error('❌ Failed to collect metrics:', err.message);
  process.exit(1);
});
