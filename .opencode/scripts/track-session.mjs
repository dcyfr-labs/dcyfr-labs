#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, '../.session-log.jsonl');

/**
 * Rough token estimation: 1 token ≈ 4 characters
 * GitHub Copilot models: GPT-5 Mini (16K context), Raptor Mini (8K context)
 * More accurate: average 1 token per 3-4 characters depending on compression
 */
function estimateTokens(text) {
  if (!text) return 0;
  const charCount = text.length;
  const estimatedTokens = Math.ceil(charCount / 4);
  return estimatedTokens;
}

/**
 * Log a session with token estimation
 */
function logSession(data) {
  const entry = {
    timestamp: new Date().toISOString(),
    model: data.model || 'gpt-5-mini',
    userInputLength: (data.userInput || '').length,
    assistantResponseLength: (data.assistantResponse || '').length,
    estimatedInputTokens: estimateTokens(data.userInput || ''),
    estimatedOutputTokens: estimateTokens(data.assistantResponse || ''),
    estimatedTotalTokens: estimateTokens((data.userInput || '') + (data.assistantResponse || '')),
    duration: data.duration || 0, // seconds
    task: data.task || 'unspecified',
    quality: data.quality || 3, // 1-5 rating
    notes: data.notes || ''
  };

  // Ensure directory exists
  const dir = path.dirname(LOG_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Append to log file
  fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n', 'utf-8');
  
  console.log(`✅ Session logged: ${entry.estimatedTotalTokens} tokens estimated`);
  console.log(`   Model: ${entry.model}`);
  console.log(`   Task: ${entry.task}`);
  console.log(`   Duration: ${entry.duration}s`);
  console.log(`   Quality: ${entry.quality}/5`);
  
  return entry;
}

/**
 * Generate usage report from logs
 */
function generateReport(format = 'text') {
  if (!fs.existsSync(LOG_FILE)) {
    console.log('No session logs found yet.');
    console.log('Example: npm run opencode:track log \'{"userInput":"test","task":"feature"}\'');
    return;
  }

  const lines = fs.readFileSync(LOG_FILE, 'utf-8').trim().split('\n');
  const sessions = lines.map(line => JSON.parse(line));

  if (sessions.length === 0) {
    console.log('No valid session logs found.');
    return;
  }

  // Calculate statistics
  const totalTokens = sessions.reduce((sum, s) => sum + s.estimatedTotalTokens, 0);
  const totalInputTokens = sessions.reduce((sum, s) => sum + s.estimatedInputTokens, 0);
  const totalOutputTokens = sessions.reduce((sum, s) => sum + s.estimatedOutputTokens, 0);
  const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
  const avgQuality = sessions.length > 0 ? (sessions.reduce((sum, s) => sum + s.quality, 0) / sessions.length).toFixed(1) : 0;

  // Group by model
  const byModel = {};
  sessions.forEach(s => {
    if (!byModel[s.model]) byModel[s.model] = { tokens: 0, inputTokens: 0, outputTokens: 0, sessions: 0 };
    byModel[s.model].tokens += s.estimatedTotalTokens;
    byModel[s.model].inputTokens += s.estimatedInputTokens;
    byModel[s.model].outputTokens += s.estimatedOutputTokens;
    byModel[s.model].sessions += 1;
  });

  // Group by task
  const byTask = {};
  sessions.forEach(s => {
    if (!byTask[s.task]) byTask[s.task] = { tokens: 0, sessions: 0, avgQuality: 0, qualitySum: 0 };
    byTask[s.task].tokens += s.estimatedTotalTokens;
    byTask[s.task].sessions += 1;
    byTask[s.task].qualitySum += s.quality;
  });
  
  Object.entries(byTask).forEach(([task, data]) => {
    data.avgQuality = (data.qualitySum / data.sessions).toFixed(1);
  });

  if (format === 'json') {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalSessions: sessions.length,
        totalEstimatedTokens: totalTokens,
        totalInputTokens,
        totalOutputTokens,
        totalTimeSeconds: totalTime,
        totalTimeMinutes: Math.round(totalTime / 60),
        averageQuality: parseFloat(avgQuality),
        inputToOutputRatio: (totalInputTokens / totalOutputTokens).toFixed(2)
      },
      byModel,
      byTask,
      sessions: sessions.slice(-10) // Last 10 sessions
    };
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log('\n📊 OpenCode Token Usage Report');
    console.log('================================\n');
    
    console.log(`Total Sessions: ${sessions.length}`);
    console.log(`Total Estimated Tokens: ${totalTokens.toLocaleString()}`);
    console.log(`  Input: ${totalInputTokens.toLocaleString()}`);
    console.log(`  Output: ${totalOutputTokens.toLocaleString()}`);
    console.log(`Total Time: ${Math.round(totalTime / 60)} minutes`);
    console.log(`Average Quality: ${avgQuality}/5\n`);

    console.log('📍 By Model:');
    Object.entries(byModel).forEach(([model, data]) => {
      console.log(`  ${model}:`);
      console.log(`    Sessions: ${data.sessions}`);
      console.log(`    Tokens: ${data.tokens.toLocaleString()} (in: ${data.inputTokens.toLocaleString()}, out: ${data.outputTokens.toLocaleString()})`);
    });

    console.log('\n🎯 By Task:');
    Object.entries(byTask).forEach(([task, data]) => {
      console.log(`  ${task}:`);
      console.log(`    Sessions: ${data.sessions}`);
      console.log(`    Tokens: ${data.tokens.toLocaleString()}`);
      console.log(`    Avg Quality: ${data.avgQuality}/5`);
    });

    // Cost estimation
    console.log('\n💰 Cost Estimation:');
    console.log(`  GitHub Copilot: $0 (included with $20/month subscription)`);
    
    const costPerMToken = 3; // Claude Sonnet 4
    const estimatedCostClaude = (totalTokens / 1_000_000) * costPerMToken;
    console.log(`  If Claude Sonnet 4: $${estimatedCostClaude.toFixed(2)} (${totalTokens.toLocaleString()} tokens @ $3/1M)`);
    
    const costPerMTokenGPT4o = 5;
    const estimatedCostGPT4o = (totalTokens / 1_000_000) * costPerMTokenGPT4o;
    console.log(`  If GPT-4o: $${estimatedCostGPT4o.toFixed(2)} (${totalTokens.toLocaleString()} tokens @ $5/1M)`);
    
    console.log(`\n✅ Savings with GitHub Copilot: $${estimatedCostClaude.toFixed(2)}-${estimatedCostGPT4o.toFixed(2)}/month\n`);
  }
}

// CLI interface
const command = process.argv[2];

if (command === 'report') {
  const format = process.argv[3] === '--json' ? 'json' : 'text';
  generateReport(format);
} else if (command === 'log') {
  try {
    const jsonStr = process.argv[3] || '{}';
    const data = JSON.parse(jsonStr);
    logSession(data);
  } catch (error) {
    console.error('❌ Error parsing JSON:', error.message);
    console.error('Expected format: \'{"userInput":"...","assistantResponse":"...","task":"..."}\'');
    process.exit(1);
  }
} else if (command === 'clear') {
  if (fs.existsSync(LOG_FILE)) {
    fs.unlinkSync(LOG_FILE);
    console.log('✅ Session logs cleared');
  }
} else if (command === 'last') {
  if (!fs.existsSync(LOG_FILE)) {
    console.log('No session logs found.');
    process.exit(0);
  }
  const lines = fs.readFileSync(LOG_FILE, 'utf-8').trim().split('\n');
  const lastSessions = lines.slice(-5).reverse();
  
  console.log('📋 Last 5 Sessions:\n');
  lastSessions.forEach((line, idx) => {
    const session = JSON.parse(line);
    console.log(`${idx + 1}. ${session.task} (${session.timestamp})`);
    console.log(`   Model: ${session.model} | Tokens: ${session.estimatedTotalTokens} | Quality: ${session.quality}/5`);
  });
  console.log();
} else {
  console.log('OpenCode Token Tracking');
  console.log('======================\n');
  console.log('Usage:');
  console.log('  npm run opencode:track report [--json]   # Generate usage report');
  console.log('  npm run opencode:track log <json>        # Log a session');
  console.log('  npm run opencode:track last              # Show last 5 sessions');
  console.log('  npm run opencode:track clear             # Clear all logs\n');
  console.log('Example:');
  console.log('  npm run opencode:track log \'{"userInput":"Implement feature","task":"feature","duration":600,"quality":5}\'');
  console.log('  npm run opencode:track report');
  console.log('  npm run opencode:track report --json');
}
