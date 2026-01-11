#!/usr/bin/env tsx
/**
 * Agent Telemetry CLI (v1.0)
 *
 * Command-line interface for viewing agent telemetry and analytics
 *
 * Usage:
 *   tsx scripts/telemetry-cli.ts stats <agent> [period]
 *   tsx scripts/telemetry-cli.ts compare [period]
 *   tsx scripts/telemetry-cli.ts handoffs [period]
 *   tsx scripts/telemetry-cli.ts export
 */

import { telemetry, type AgentType } from '../src/lib/agents/agent-telemetry';

function formatTime(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

async function showAgentStats(agent: AgentType, period = '30d'): Promise<void> {
  console.log(`📊 Agent Statistics: ${agent} (${period})\n`);

  const stats = await telemetry.getAgentStats(agent, period);

  console.log('Overview:');
  console.log(`  Total Sessions: ${stats.totalSessions}`);
  console.log(`  Total Time: ${formatTime(stats.totalTime)}`);
  console.log(`  Average Session: ${formatTime(stats.averageSessionTime)}\n`);

  console.log('Outcomes:');
  console.log(`  ✅ Success: ${stats.outcomes.success} (${formatPercent(stats.outcomes.success / stats.totalSessions)})`);
  console.log(`  ⬆️  Escalated: ${stats.outcomes.escalated} (${formatPercent(stats.outcomes.escalated / stats.totalSessions)})`);
  console.log(`  ❌ Failed: ${stats.outcomes.failed} (${formatPercent(stats.outcomes.failed / stats.totalSessions)})\n`);

  console.log('Quality Metrics:');
  console.log(`  Token Compliance: ${formatPercent(stats.quality.averageTokenCompliance)}`);
  console.log(`  Test Pass Rate: ${formatPercent(stats.quality.averageTestPassRate)}`);
  console.log(`  Total Violations: ${stats.quality.totalViolations}`);
  console.log(`  Violations Fixed: ${stats.quality.violationsFixed} (${formatPercent(stats.quality.violationsFixed / stats.quality.totalViolations || 0)})\n`);

  console.log('Performance:');
  console.log(`  Avg Execution Time: ${formatTime(stats.performance.averageExecutionTime)}`);
  console.log(`  Total Tokens Used: ${stats.performance.totalTokensUsed.toLocaleString()}`);
  console.log(`  Avg Files Modified: ${stats.performance.averageFilesModified.toFixed(1)}\n`);

  console.log('Cost:');
  console.log(`  Total Cost: ${formatCost(stats.cost.totalCost)}`);
  console.log(`  Avg Cost/Session: ${formatCost(stats.cost.averageCostPerSession)}`);
  console.log('  Cost by Task Type:');
  Object.entries(stats.cost.costByTaskType).forEach(([type, cost]) => {
    console.log(`    ${type}: ${formatCost(cost)}`);
  });
  console.log('');

  console.log('Task Types:');
  Object.entries(stats.taskTypes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count} sessions`);
    });
}

async function compareAgents(period = '30d'): Promise<void> {
  console.log(`📊 Agent Comparison (${period})\n`);

  const comparison = await telemetry.compareAgents(period);

  // Create comparison table
  const agents: AgentType[] = ['claude', 'copilot', 'groq', 'ollama'];

  console.log('┌──────────────┬──────────┬──────────┬──────────┬──────────┐');
  console.log('│ Metric       │ Claude   │ Copilot  │ Groq     │ Ollama   │');
  console.log('├──────────────┼──────────┼──────────┼──────────┼──────────┤');

  // Sessions
  const sessions = agents.map((a) => comparison.agents[a].totalSessions);
  console.log(`│ Sessions     │ ${sessions.map((s) => s.toString().padEnd(8)).join(' │ ')} │`);

  // Quality
  const quality = agents.map((a) =>
    formatPercent(comparison.agents[a].quality.averageTokenCompliance),
  );
  console.log(`│ Quality      │ ${quality.map((q) => q.padEnd(8)).join(' │ ')} │`);

  // Cost
  const costs = agents.map((a) => formatCost(comparison.agents[a].cost.totalCost));
  console.log(`│ Cost         │ ${costs.map((c) => c.padEnd(8)).join(' │ ')} │`);

  // Success Rate
  const successRates = agents.map((a) => {
    const stats = comparison.agents[a];
    return formatPercent(stats.outcomes.success / stats.totalSessions || 0);
  });
  console.log(`│ Success Rate │ ${successRates.map((r) => r.padEnd(8)).join(' │ ')} │`);

  console.log('└──────────────┴──────────┴──────────┴──────────┴──────────┘\n');

  console.log('Recommendations:\n');
  comparison.recommendations.forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec}`);
  });
}

async function showHandoffPatterns(period = '30d'): Promise<void> {
  console.log(`🔄 Handoff Patterns (${period})\n`);

  const patterns = await telemetry.getHandoffPatterns(period);

  console.log('Overview:');
  console.log(`  Total Handoffs: ${patterns.totalHandoffs}`);
  console.log(`  Most Common Path: ${patterns.mostCommonPath}\n`);

  console.log('By Reason:');
  Object.entries(patterns.byReason)
    .sort((a, b) => b[1] - a[1])
    .forEach(([reason, count]) => {
      console.log(`  ${reason}: ${count} (${formatPercent(count / patterns.totalHandoffs)})`);
    });
  console.log('');

  console.log('Automatic vs Manual:');
  console.log(`  Automatic: ${patterns.automaticVsManual.automatic} (${formatPercent(patterns.automaticVsManual.automatic / patterns.totalHandoffs)})`);
  console.log(`  Manual: ${patterns.automaticVsManual.manual} (${formatPercent(patterns.automaticVsManual.manual / patterns.totalHandoffs)})`);
}

async function exportTelemetry(): Promise<void> {
  console.log('📤 Exporting telemetry data...\n');

  const comparison = await telemetry.compareAgents('all');
  const handoffs = await telemetry.getHandoffPatterns('all');

  const exportData = {
    exportedAt: new Date().toISOString(),
    comparison,
    handoffs,
  };

  const filename = `telemetry-export-${Date.now()}.json`;

  if (typeof window !== 'undefined') {
    // Browser environment
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  } else {
    // Node.js environment
    const fs = await import('fs');
    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
    console.log(`✅ Exported to: ${filename}`);
  }
}

async function showHelp(): Promise<void> {
  console.log(`
Agent Telemetry CLI v1.0

Usage: npm run telemetry:<command> [options]

Commands:
  stats <agent> [period]    Show statistics for specific agent
                            Agents: claude, copilot, groq, ollama
                            Period: 7d, 30d, all (default: 30d)

  compare [period]          Compare stats across all agents
                            Period: 7d, 30d, all (default: 30d)

  handoffs [period]         Show handoff patterns and analytics
                            Period: 7d, 30d, all (default: 30d)

  export                    Export all telemetry data to JSON

  help                      Show this help message

Examples:
  npm run telemetry:stats claude 7d
  npm run telemetry:compare
  npm run telemetry:handoffs 30d
  npm run telemetry:export

Documentation: docs/operations/AGENT_TELEMETRY_SYSTEM.md
`);
}

// Main CLI logic
async function main() {
  const command = process.argv[2];
  const arg1 = process.argv[3];
  const arg2 = process.argv[4];

  switch (command) {
    case 'stats':
      if (!arg1) {
        console.error('Error: Agent required');
        console.error('Usage: npm run telemetry:stats <agent> [period]');
        process.exit(1);
      }
      await showAgentStats(arg1 as AgentType, arg2 || '30d');
      break;

    case 'compare':
      await compareAgents(arg1 || '30d');
      break;

    case 'handoffs':
      await showHandoffPatterns(arg1 || '30d');
      break;

    case 'export':
      await exportTelemetry();
      break;

    case 'help':
    default:
      await showHelp();
      break;
  }
}

// Run main
main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
