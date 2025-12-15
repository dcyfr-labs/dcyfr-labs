#!/usr/bin/env node

/**
 * Analyze performance metrics from perf-monitor workflow runs
 * 
 * Usage:
 *   npm run perf:analyze              # Analyze latest metrics
 *   npm run perf:analyze -- --days=7  # Analyze last 7 days
 * 
 * Tracks:
 *   - Build duration trends
 *   - Cache hit rates
 *   - Performance improvements vs baseline
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = path.join(__dirname, '../reports/performance');
const METRICS_FILE = path.join(REPORTS_DIR, 'metrics-history.json');

// Baseline metrics (from December 14, 2025)
const BASELINE = {
  buildDuration: 52.3, // seconds
  nextCacheHit: false,
  nodeCacheHit: false,
};

// Target metrics (30% reduction goal)
const TARGET = {
  buildDuration: BASELINE.buildDuration * 0.7, // ~36.6 seconds
  cacheHitRate: 0.8, // 80% combined cache hit rate
};

/**
 * Load metrics history from file
 */
function loadMetrics() {
  if (!fs.existsSync(METRICS_FILE)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(METRICS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Failed to load metrics: ${err.message}`);
    return [];
  }
}

/**
 * Save metrics history to file
 */
function saveMetrics(metrics) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));
}

/**
 * Add new metric entry
 */
function addMetric(metric) {
  const metrics = loadMetrics();
  metrics.push({
    ...metric,
    addedAt: new Date().toISOString(),
  });
  saveMetrics(metrics);
}

/**
 * Analyze metrics within date range
 */
function analyzeMetrics(daysBack = 7) {
  const metrics = loadMetrics();
  
  if (metrics.length === 0) {
    console.log('📊 No metrics data available yet.');
    console.log('Run the perf-monitor workflow to collect baseline data.');
    return;
  }
  
  const now = Date.now();
  const cutoff = now - daysBack * 24 * 60 * 60 * 1000;
  
  const filtered = metrics.filter(m => {
    const ts = new Date(m.timestamp).getTime();
    return ts >= cutoff;
  });
  
  if (filtered.length === 0) {
    console.log(`📊 No metrics found in the last ${daysBack} days.`);
    return;
  }
  
  // Calculate statistics
  const durations = filtered.map(m => m.performance.build_duration_seconds);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  
  const cacheHits = filtered.map(m => {
    const nextHit = m.caches.next_cache_hit ? 1 : 0;
    const nodeHit = m.caches.node_cache_hit ? 1 : 0;
    return (nextHit + nodeHit) / 2;
  });
  const avgCacheHit = cacheHits.reduce((a, b) => a + b, 0) / cacheHits.length;
  const nextHitRate = filtered.filter(m => m.caches.next_cache_hit).length / filtered.length;
  const nodeHitRate = filtered.filter(m => m.caches.node_cache_hit).length / filtered.length;
  
  // Calculate improvements
  const improvementDuration = ((BASELINE.buildDuration - avgDuration) / BASELINE.buildDuration) * 100;
  const progressToTarget = ((BASELINE.buildDuration - avgDuration) / (BASELINE.buildDuration - TARGET.buildDuration)) * 100;
  
  // Display report
  console.log('\n' + '='.repeat(60));
  console.log('📊 Performance Metrics Analysis');
  console.log('='.repeat(60) + '\n');
  
  console.log(`📈 Period: Last ${daysBack} days (${filtered.length} runs)\n`);
  
  console.log('⏱️  Build Duration:');
  console.log(`  Average:  ${avgDuration.toFixed(1)}s (baseline: ${BASELINE.buildDuration}s)`);
  console.log(`  Min:      ${minDuration.toFixed(1)}s`);
  console.log(`  Max:      ${maxDuration.toFixed(1)}s`);
  console.log(`  Target:   ${TARGET.buildDuration.toFixed(1)}s (30% reduction)\n`);
  
  console.log('🎯 Progress to Target:');
  console.log(`  Improvement: ${improvementDuration > 0 ? '+' : ''}${improvementDuration.toFixed(1)}%`);
  console.log(`  Progress:    ${Math.min(progressToTarget, 100).toFixed(1)}% toward goal\n`);
  
  console.log('💾 Cache Hit Rates:');
  console.log(`  Next.js Cache:    ${(nextHitRate * 100).toFixed(1)}% (${filtered.filter(m => m.caches.next_cache_hit).length}/${filtered.length})`);
  console.log(`  Node Modules:     ${(nodeHitRate * 100).toFixed(1)}% (${filtered.filter(m => m.caches.node_cache_hit).length}/${filtered.length})`);
  console.log(`  Combined Average: ${(avgCacheHit * 100).toFixed(1)}%`);
  console.log(`  Target:           ${(TARGET.cacheHitRate * 100).toFixed(1)}%\n`);
  
  // Recommendations
  console.log('💡 Recommendations:');
  if (nextHitRate < 0.5) {
    console.log('  ⚠️  Next.js cache hit rate is low. Check build cache restore-keys.');
  }
  if (nodeHitRate < 0.5) {
    console.log('  ⚠️  Node modules cache hit rate is low. Consider package-lock stability.');
  }
  if (improvementDuration < 0) {
    console.log('  ⚠️  Build duration is slower than baseline. Investigate recent changes.');
  } else if (improvementDuration < 15) {
    console.log('  📌 Build time improved slightly. Focus on consistent cache hits.');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Display metrics summary from artifact metadata
 */
function reportArtifactMetric(data) {
  if (!data || !data.performance) {
    return;
  }
  
  const { performance, caches, timestamp, branch } = data;
  const duration = performance.build_duration_seconds;
  const improvement = ((BASELINE.buildDuration - duration) / BASELINE.buildDuration) * 100;
  
  console.log('\n📊 Performance Metric Recorded:');
  console.log(`  Duration:     ${duration}s (${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}% vs baseline)`);
  console.log(`  Next.js Hit:  ${caches.next_cache_hit ? '✅' : '❌'}`);
  console.log(`  Node Hit:     ${caches.node_cache_hit ? '✅' : '❌'}`);
  console.log(`  Timestamp:    ${timestamp}`);
  console.log(`  Branch:       ${branch}\n`);
}

/**
 * Main CLI handler
 */
function main() {
  const args = process.argv.slice(2);
  const daysArg = args.find(a => a.startsWith('--days='));
  const days = daysArg ? parseInt(daysArg.split('=')[1]) : 7;
  
  const command = args[0];
  
  if (command === '--add-metric') {
    // For use in CI/CD: read metric from stdin
    const data = JSON.parse(fs.readFileSync(0, 'utf-8'));
    addMetric(data);
    reportArtifactMetric(data);
  } else {
    analyzeMetrics(days);
  }
}

main();
