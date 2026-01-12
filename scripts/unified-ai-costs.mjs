#!/usr/bin/env node

/**
 * Unified AI Cost Dashboard CLI
 * 
 * Displays unified cost data across Claude Code, GitHub Copilot, and OpenCode
 * in the terminal with formatted tables and charts.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Use global fetch (available in Node.js 18+)

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:3000';

// Color codes for terminal output
const COLORS = {
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
  BLUE: '\x1b[34m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  RED: '\x1b[31m',
  CYAN: '\x1b[36m',
};

async function fetchCostData(period = '30d') {
  try {
    const response = await fetch(`${BASE_URL}/api/dev/ai-costs/unified?period=${period}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`${COLORS.RED}Error fetching cost data: ${error.message}${COLORS.RESET}`);
    process.exit(1);
  }
}

function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function printHeader(title) {
  console.log(`\n${COLORS.BOLD}${COLORS.CYAN}${'═'.repeat(80)}${COLORS.RESET}`);
  console.log(`${COLORS.BOLD}${COLORS.CYAN}${title}${COLORS.RESET}`);
  console.log(`${COLORS.BOLD}${COLORS.CYAN}${'═'.repeat(80)}${COLORS.RESET}\n`);
}

function printSection(title) {
  console.log(`${COLORS.BOLD}${title}${COLORS.RESET}`);
  console.log(`${'-'.repeat(40)}`);
}

function printSummaryCards(summary) {
  console.log(
    `${COLORS.BOLD}Total Cost${COLORS.RESET}:    ${formatCurrency(summary.totalCost)} (${formatPercent(summary.monthlyBudgetUsed)} of budget)`,
  );
  console.log(
    `${COLORS.BOLD}Sessions${COLORS.RESET}:       ${summary.totalSessions} (${formatCurrency(summary.averageCostPerSession)}/session)`,
  );
  console.log(
    `${COLORS.BOLD}Tokens${COLORS.RESET}:         ${(summary.totalTokens / 1000).toFixed(0)}K (${(summary.averageTokensPerSession / 1000).toFixed(1)}K/session)`,
  );
  console.log(
    `${COLORS.BOLD}Most Used${COLORS.RESET}:      ${summary.mostUsedTool.replace('-', ' ').toUpperCase()}`,
  );
  console.log(
    `${COLORS.BOLD}Est. Monthly${COLORS.RESET}:    ${formatCurrency(summary.estimatedMonthlyTotal)}`,
  );
}

function printSourceDetails(sources) {
  printSection('Claude Code');
  const claude = sources.claudeCode;
  console.log(`  Sessions:    ${claude.sessions}`);
  console.log(`  Success:     ${formatPercent(claude.successRate || 0)}`);
  console.log(`  Tokens:      ${claude.totalTokens.toLocaleString()}`);
  console.log(`  Cost:        ${formatCurrency(claude.estimatedCost)}`);
  console.log(
    `  Token Compliance: ${formatPercent(claude.qualityMetrics.tokenCompliance)}`,
  );
  console.log(`  Test Pass Rate:  ${formatPercent(claude.qualityMetrics.testPassRate)}`);

  printSection('GitHub Copilot');
  const copilot = sources.copilotVSCode;
  console.log(`  Sessions:    ${copilot.sessions}`);
  console.log(`  Tokens:      ${copilot.totalTokens.toLocaleString()}`);
  console.log(`  Monthly:     ${formatCurrency(copilot.costPerMonth)} (flat fee)`);
  console.log(`  Per Session: ${formatCurrency(copilot.costPerSession)}`);
  console.log(`  Quality:     ${copilot.qualityRating.toFixed(1)}/5`);
  console.log(`  Violations:  ${formatPercent(copilot.violationRate)}`);

  printSection('OpenCode.ai');
  const opencode = sources.opencode;
  console.log(`  Sessions:    ${opencode.sessions}`);
  console.log(`  Tokens:      ${opencode.totalTokens.toLocaleString()}`);
  console.log(
    `  Cost:        ${formatCurrency(opencode.estimatedCost)} (${opencode.sessions > 0 ? 'free GitHub models' : 'N/A'})`,
  );
  console.log(
    `  Free Models: ${formatCurrency(opencode.costByModel['gpt-5-mini'] + opencode.costByModel['raptor-mini'])}`,
  );
  console.log(`  Premium:     ${formatCurrency(opencode.costByModel['claude-sonnet'])}`);
  console.log(`  Quality:     ${opencode.qualityMetrics.averageQuality.toFixed(1)}/5`);
}

function printCostBreakdown(summary) {
  printSection('Cost Breakdown by Source');
  const costs = [
    ['Claude Code', formatCurrency(summary.costBySource['claude-code'])],
    ['GitHub Copilot', formatCurrency(summary.costBySource['copilot-vscode'])],
    ['OpenCode', formatCurrency(summary.costBySource['opencode'])],
  ];

  let maxNameLength = 20;
  costs.forEach(([name, cost]) => {
    const padding = ' '.repeat(Math.max(0, maxNameLength - name.length));
    console.log(`  ${name}${padding} ${COLORS.BOLD}${cost}${COLORS.RESET}`);
  });
}

function printRecommendations(recommendations) {
  if (recommendations.length === 0) return;

  printSection('Recommendations');
  recommendations.forEach((rec) => {
    const severityColor =
      rec.severity === 'critical'
        ? COLORS.RED
        : rec.severity === 'warning'
          ? COLORS.YELLOW
          : COLORS.GREEN;

    console.log(
      `${severityColor}▪${COLORS.RESET} ${COLORS.BOLD}${rec.title}${COLORS.RESET}`,
    );
    console.log(`  ${rec.description}`);
    if (rec.estimatedSavings && rec.estimatedSavings > 0) {
      console.log(`  ${COLORS.GREEN}Potential savings: ${formatCurrency(rec.estimatedSavings)}${COLORS.RESET}`);
    }
    console.log(`  Action: ${rec.action}\n`);
  });
}

async function exportToJSON(data, filename) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`${COLORS.GREEN}✓ Exported to ${filename}${COLORS.RESET}`);
}

async function exportToCSV(data, filename) {
  const sources = data.sources;
  const csvData = [
    'Tool,Sessions,Tokens,Cost,Quality',
    `Claude Code,${sources.claudeCode.sessions},${sources.claudeCode.totalTokens},${sources.claudeCode.estimatedCost},${sources.claudeCode.successRate || 0}`,
    `GitHub Copilot,${sources.copilotVSCode.sessions},${sources.copilotVSCode.totalTokens},${sources.copilotVSCode.costPerMonth},${sources.copilotVSCode.qualityRating}`,
    `OpenCode,${sources.opencode.sessions},${sources.opencode.totalTokens},${sources.opencode.estimatedCost},${sources.opencode.qualityMetrics.averageQuality}`,
  ].join('\n');

  fs.writeFileSync(filename, csvData);
  console.log(`${COLORS.GREEN}✓ Exported to ${filename}${COLORS.RESET}`);
}

async function main() {
  const command = process.argv[2];
  const period = process.argv[3] || '30d';

  if (!command || command === 'view') {
    // Default: display dashboard
    const data = await fetchCostData(period);
    printHeader(`Unified AI Cost Dashboard (${period})`);
    printSection('Summary');
    printSummaryCards(data.summary);
    console.log();
    printSourceDetails(data.sources);
    console.log();
    printCostBreakdown(data.summary);
    console.log();
    printRecommendations(data.recommendations);
  } else if (command === 'export:json') {
    const data = await fetchCostData(period);
    const filename = process.argv[4] || `ai-costs-${new Date().toISOString().split('T')[0]}.json`;
    await exportToJSON(data, filename);
  } else if (command === 'export:csv') {
    const data = await fetchCostData(period);
    const filename = process.argv[4] || `ai-costs-${new Date().toISOString().split('T')[0]}.csv`;
    await exportToCSV(data, filename);
  } else if (command === 'help') {
    console.log(`
${COLORS.BOLD}Unified AI Cost Dashboard CLI${COLORS.RESET}

${COLORS.BOLD}Usage:${COLORS.RESET}
  npm run ai:costs [command] [period] [output]

${COLORS.BOLD}Commands:${COLORS.RESET}
  view           View dashboard in terminal (default)
  export:json    Export data to JSON file
  export:csv     Export data to CSV file
  help           Show this help message

${COLORS.BOLD}Periods:${COLORS.RESET}
  7d             Last 7 days (default for periods)
  30d            Last 30 days (default)
  90d            Last 90 days
  all            All time

${COLORS.BOLD}Examples:${COLORS.RESET}
  npm run ai:costs                              # View 30-day dashboard
  npm run ai:costs view 7d                      # View 7-day dashboard
  npm run ai:costs export:json 30d costs.json   # Export to JSON
  npm run ai:costs export:csv 90d costs.csv     # Export to CSV
    `);
  } else {
    console.error(
      `${COLORS.RED}Unknown command: ${command}${COLORS.RESET}`,
    );
    console.error(`Use ${COLORS.BOLD}npm run ai:costs help${COLORS.RESET} for usage information`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`${COLORS.RED}Error: ${error.message}${COLORS.RESET}`);
  process.exit(1);
});
