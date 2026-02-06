#!/usr/bin/env node
/**
 * AI Cost Tracking Script
 *
 * Tracks Claude Code session costs and logs to JSONL format.
 * Run automatically via Stop hook in .claude/settings.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cost per 1K tokens (input + output averaged)
const COST_PER_1K = {
  'claude-opus-4.5': 0.045, // avg of $0.015 input + $0.075 output
  'claude-sonnet-4.5': 0.009, // avg of $0.003 input + $0.015 output
  'claude-haiku-4.5': 0.00625, // avg of $0.0025 input + $0.01 output
};

async function trackCost() {
  try {
    const sessionStatePath = path.join(process.cwd(), '.claude/.session-state.json');

    // Check if session state exists
    if (!fs.existsSync(sessionStatePath)) {
      console.log('ℹ️  No session state found (may be first session)');
      return;
    }

    const sessionState = JSON.parse(fs.readFileSync(sessionStatePath, 'utf8'));

    // Extract session data
    const model = sessionState.model || 'claude-opus-4.5';
    const estimatedTokens = sessionState.estimated_tokens || 10000;
    const branch = sessionState.branch || 'unknown';
    const turns = sessionState.turns || 1;

    // Calculate cost
    const costPerToken = COST_PER_1K[model] || COST_PER_1K['claude-opus-4.5'];
    const cost = (estimatedTokens / 1000) * costPerToken;

    // Create log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      model,
      tokens: estimatedTokens,
      cost: parseFloat(cost.toFixed(4)),
      branch,
      turns,
    };

    // Ensure log directory exists
    const logDir = path.join(process.env.HOME, '.claude/usage');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Append to JSONL log
    const logFile = path.join(logDir, 'ai-usage.jsonl');
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

    // Also create CSV version for easier analysis
    // CWE-367 Prevention: Use atomic flag 'a' to avoid race condition (TOCTOU)
    const csvFile = path.join(logDir, 'ai-usage.csv');
    const csvLine = `${logEntry.timestamp},${model},${estimatedTokens},${cost.toFixed(4)},${branch},${turns}\n`;

    // Use atomic append - creates file if missing, appends if exists
    try {
      fs.appendFileSync(csvFile, csvLine, { flag: 'a', encoding: 'utf-8' });
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist - write with header
        const header = 'timestamp,model,tokens,cost,branch,turns\n';
        fs.writeFileSync(csvFile, header + csvLine, { encoding: 'utf-8' });
      } else {
        throw error;
      }
    }

    // Output summary
    console.log(
      `💰 Session cost: $${cost.toFixed(4)} (${estimatedTokens.toLocaleString()} tokens, ${turns} turns)`
    );

    // Check daily budget
    checkDailyBudget(logFile);
  } catch (error) {
    console.error('⚠️  Failed to track AI costs:', error.message);
  }
}

function checkDailyBudget(logFile) {
  const today = new Date().toISOString().split('T')[0];
  const dailyLimit = 10.0; // $10/day

  // Read all entries for today
  const logs = fs.readFileSync(logFile, 'utf8').trim().split('\n');
  const todayEntries = logs.map((line) => JSON.parse(line)).filter((entry) => entry.date === today);

  const dailyCost = todayEntries.reduce((sum, entry) => sum + entry.cost, 0);

  if (dailyCost > dailyLimit) {
    console.log(
      `⚠️  BUDGET ALERT: Daily cost ($${dailyCost.toFixed(2)}) exceeds limit ($${dailyLimit})`
    );
    console.log(`   Consider switching to Sonnet or Haiku models`);
  } else {
    console.log(
      `✓ Daily budget: $${dailyCost.toFixed(2)} / $${dailyLimit} (${((dailyCost / dailyLimit) * 100).toFixed(1)}%)`
    );
  }
}

// Run tracking
trackCost();
