#!/usr/bin/env node
/**
 * Export AI Costs to CSV
 *
 * Exports AI usage data in various formats for analysis.
 */

import fs from 'fs';
import path from 'path';

const logFile = path.join(process.env.HOME, '.claude/usage/ai-usage.jsonl');

if (!fs.existsSync(logFile)) {
  console.error('❌ No usage data found');
  process.exit(1);
}

const logs = fs
  .readFileSync(logFile, 'utf8')
  .trim()
  .split('\n')
  .map((line) => JSON.parse(line));

// CSV export
const csvLines = ['timestamp,date,model,tokens,cost,branch,turns'];
logs.forEach((log) => {
  csvLines.push(
    `${log.timestamp},${log.date},${log.model},${log.tokens},${log.cost},${log.branch},${log.turns}`
  );
});

const csvPath = path.join(process.env.HOME, '.claude/usage/ai-usage-export.csv');
fs.writeFileSync(csvPath, csvLines.join('\n'));

console.log(`✓ Exported ${logs.length} sessions to ${csvPath}`);

// Summary stats
const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);
const totalTokens = logs.reduce((sum, log) => sum + log.tokens, 0);
const byModel = {};
logs.forEach((log) => {
  if (!byModel[log.model]) byModel[log.model] = { count: 0, cost: 0, tokens: 0 };
  byModel[log.model].count++;
  byModel[log.model].cost += log.cost;
  byModel[log.model].tokens += log.tokens;
});

console.log('\n📊 Summary:');
console.log(`Total Sessions: ${logs.length}`);
console.log(`Total Cost: $${totalCost.toFixed(2)}`);
console.log(`Total Tokens: ${totalTokens.toLocaleString()}`);
console.log('\nBy Model:');
Object.keys(byModel).forEach((model) => {
  const data = byModel[model];
  console.log(`  ${model}:`);
  console.log(`    Sessions: ${data.count}`);
  console.log(`    Cost: $${data.cost.toFixed(2)}`);
  console.log(`    Tokens: ${data.tokens.toLocaleString()}`);
});
