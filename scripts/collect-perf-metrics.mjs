#!/usr/bin/env node

/**
 * Collect performance metrics from artifact and store history
 * 
 * Usage (in CI):
 *   npm run perf:collect-metrics
 * 
 * This script:
 * 1. Reads metrics JSON from perf-monitor workflow
 * 2. Adds to historical metrics file
 * 3. Generates performance report
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = path.join(__dirname, '../reports/performance');
const METRICS_HISTORY = path.join(REPORTS_DIR, 'metrics-history.json');

/**
 * Ensure metrics directory exists
 */
function ensureMetricsDir() {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

/**
 * Load existing metrics history
 */
function loadMetricsHistory() {
  if (!fs.existsSync(METRICS_HISTORY)) {
    return [];
  }
  
  try {
    return JSON.parse(fs.readFileSync(METRICS_HISTORY, 'utf-8'));
  } catch {
    return [];
  }
}

/**
 * Save metrics history
 */
function saveMetricsHistory(metrics) {
  fs.writeFileSync(METRICS_HISTORY, JSON.stringify(metrics, null, 2));
}

/**
 * Add metric from artifact or stdin
 */
function addMetricFromSource(metricsPath) {
  try {
    let metricData;
    
    if (metricsPath && fs.existsSync(metricsPath)) {
      // Read from file (artifact)
      metricData = JSON.parse(fs.readFileSync(metricsPath, 'utf-8'));
    } else {
      // Read from stdin
      const stdin = fs.readFileSync(0, 'utf-8');
      metricData = JSON.parse(stdin);
    }
    
    const history = loadMetricsHistory();
    
    // Add timestamp if not present
    if (!metricData.addedAt) {
      metricData.addedAt = new Date().toISOString();
    }
    
    history.push(metricData);
    saveMetricsHistory(history);
    
    return metricData;
  } catch (err) {
    console.error('❌ Failed to add metric:', err.message);
    process.exit(1);
  }
}

/**
 * Generate short summary
 */
function generateSummary(metric) {
  const duration = metric.performance.build_duration_seconds;
  const nextHit = metric.caches.next_cache_hit ? '✅' : '❌';
  const nodeHit = metric.caches.node_cache_hit ? '✅' : '❌';
  
  console.log('\n📊 Performance Metric Stored:');
  console.log(`  Build Duration: ${duration.toFixed(1)}s`);
  console.log(`  Next.js Cache:  ${nextHit}`);
  console.log(`  Node Modules:   ${nodeHit}`);
  console.log(`  Timestamp:      ${metric.timestamp}`);
  console.log(`  Branch:         ${metric.branch}\n`);
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const metricsPath = args[0];
  
  ensureMetricsDir();
  
  // Add metric from artifact or stdin
  const metric = addMetricFromSource(metricsPath);
  
  // Generate summary
  generateSummary(metric);
  
  console.log('✅ Metrics collected and saved to reports/performance/metrics-history.json');
  console.log(`📈 Total runs tracked: ${loadMetricsHistory().length}`);
  console.log('\n💡 View trends with: npm run perf:metrics\n');
}

main();
