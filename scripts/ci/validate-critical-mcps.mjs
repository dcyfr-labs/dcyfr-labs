#!/usr/bin/env node
/**
 * Critical MCP Server Validation Script
 *
 * Validates that critical DCYFR MCP servers are operational.
 * Used in CI to fail builds if critical infrastructure is down.
 *
 * Critical MCP servers:
 * - DCYFR Analytics (custom analytics tracking)
 * - DCYFR DesignTokens (design system enforcement)
 * - DCYFR ContentManager (content management)
 * - DCYFR SemanticScholar (research paper integration)
 *
 * Usage:
 *   node scripts/ci/validate-critical-mcps.mjs <health-report.json>
 *   node scripts/ci/validate-critical-mcps.mjs --stdin
 *
 * Exit codes:
 *   0 - All critical MCPs are operational
 *   1 - One or more critical MCPs are down
 *   2 - Invalid input or configuration error
 */

import fs from 'fs';
import path from 'path';

// ============================================================================
// CONSTANTS
// ============================================================================

const CRITICAL_MCPS = [
  'DCYFR Analytics',
  'DCYFR DesignTokens',
  'DCYFR ContentManager',
  'DCYFR SemanticScholar',
];

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// ============================================================================
// TYPES
// ============================================================================

/**
 * @typedef {Object} ServerStatus
 * @property {string} name - Server name
 * @property {'ok' | 'degraded' | 'down'} status - Server status
 * @property {number} responseTimeMs - Response time in milliseconds
 * @property {string} [error] - Error message if failed
 */

/**
 * @typedef {Object} HealthReport
 * @property {string} timestamp - ISO timestamp
 * @property {ServerStatus[]} servers - List of server statuses
 * @property {Object} summary - Summary stats
 * @property {number} summary.total - Total servers
 * @property {number} summary.ok - Number of OK servers
 * @property {number} summary.degraded - Number of degraded servers
 * @property {number} summary.down - Number of down servers
 */

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Colorize text for terminal output
 */
function colorize(text, color) {
  return `${COLORS[color] || ''}${text}${COLORS.reset}`;
}

/**
 * Print formatted header
 */
function printHeader(text) {
  console.log('\n' + colorize('═'.repeat(80), 'cyan'));
  console.log(colorize(`  ${text}`, 'bold'));
  console.log(colorize('═'.repeat(80), 'cyan') + '\n');
}

/**
 * Print formatted section
 */
function printSection(text) {
  console.log(colorize(`\n${text}`, 'cyan'));
  console.log(colorize('─'.repeat(80), 'cyan'));
}

/**
 * Read health report from file or stdin
 */
async function readHealthReport(source) {
  try {
    if (source === '--stdin') {
      // Read from stdin
      const chunks = [];
      for await (const chunk of process.stdin) {
        chunks.push(chunk);
      }
      const data = Buffer.concat(chunks).toString('utf8');
      return JSON.parse(data);
    } else {
      // Read from file
      const filePath = path.resolve(process.cwd(), source);
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(colorize('ERROR: Failed to read health report', 'red'));
    console.error(error.message);
    return null;
  }
}

/**
 * Validate health report structure
 */
function validateHealthReport(report) {
  if (!report || typeof report !== 'object') {
    return { valid: false, error: 'Invalid report format (not an object)' };
  }

  if (!Array.isArray(report.servers)) {
    return { valid: false, error: 'Missing or invalid "servers" array' };
  }

  if (!report.summary || typeof report.summary !== 'object') {
    return { valid: false, error: 'Missing or invalid "summary" object' };
  }

  return { valid: true };
}

/**
 * Extract critical server statuses
 */
function getCriticalServers(report) {
  return report.servers.filter((server) =>
    CRITICAL_MCPS.some((critical) =>
      server.name.toLowerCase().includes(critical.toLowerCase())
    )
  );
}

/**
 * Check if all critical servers are operational
 */
function checkCriticalServers(criticalServers) {
  const results = {
    allOk: true,
    downServers: [],
    degradedServers: [],
    okServers: [],
  };

  for (const server of criticalServers) {
    if (server.status === 'down') {
      results.allOk = false;
      results.downServers.push(server);
    } else if (server.status === 'degraded') {
      results.degradedServers.push(server);
    } else {
      results.okServers.push(server);
    }
  }

  return results;
}

// ============================================================================
// REPORTING
// ============================================================================

/**
 * Print validation results
 */
/**
 * Print status for a single critical server entry
 */
function printCriticalServerEntry(criticalName, criticalServers) {
  const server = criticalServers.find((s) =>
    s.name.toLowerCase().includes(criticalName.toLowerCase())
  );
  if (!server) {
    console.log(`  ${colorize('⚠', 'yellow')} ${criticalName}: ${colorize('NOT FOUND', 'yellow')}`);
    return;
  }
  let statusText, statusColor, icon;
  if (server.status === 'ok') {
    statusText = 'OK'; statusColor = 'green'; icon = '✓';
  } else if (server.status === 'degraded') {
    statusText = 'DEGRADED'; statusColor = 'yellow'; icon = '⚠';
  } else {
    statusText = 'DOWN'; statusColor = 'red'; icon = '✖';
  }
  console.log(`  ${colorize(icon, statusColor)} ${server.name}: ${colorize(statusText, statusColor)} (${server.responseTimeMs}ms)`);
  if (server.error) {
    console.log(`     ${colorize('Error: ' + server.error, 'red')}`);
  }
}

/**
 * Print the final verdict section
 */
function printVerdictSection(results) {
  if (results.allOk && results.degradedServers.length === 0) {
    console.log(colorize('🎉 SUCCESS: All critical MCP servers are operational!', 'green'));
  } else if (results.allOk && results.degradedServers.length > 0) {
    console.log(colorize('⚠️  WARNING: Some critical servers are degraded', 'yellow'));
    console.log(colorize('   Build will continue, but performance may be impacted', 'yellow'));
  } else {
    console.log(colorize('❌ FAILURE: Critical MCP servers are down!', 'red'));
    console.log(colorize('   Cannot proceed with build - infrastructure issues detected', 'red'));
  }
}

function printResults(report, criticalServers, results) {
  printHeader('MCP Critical Server Validation Report');
  console.log(`Report Timestamp: ${colorize(report.timestamp, 'cyan')}`);
  console.log(`Total Servers: ${report.summary.total}`);
  console.log(`Critical Servers: ${criticalServers.length}\n`);

  printSection('Critical MCP Servers');
  for (const criticalName of CRITICAL_MCPS) {
    printCriticalServerEntry(criticalName, criticalServers);
  }

  printSection('Validation Summary');
  if (results.okServers.length > 0) {
    console.log(`  ${colorize('✓', 'green')} Operational: ${colorize(results.okServers.length, 'green')} server(s)`);
  }
  if (results.degradedServers.length > 0) {
    console.log(`  ${colorize('⚠', 'yellow')} Degraded: ${colorize(results.degradedServers.length, 'yellow')} server(s)`);
  }
  if (results.downServers.length > 0) {
    console.log(`  ${colorize('✖', 'red')} Down: ${colorize(results.downServers.length, 'red')} server(s)`);
  }
  console.log();
  printVerdictSection(results);
  console.log();
}

/**
 * Print non-critical server summary
 */
function printNonCriticalSummary(report, criticalServers) {
  const nonCriticalServers = report.servers.filter(
    (server) => !criticalServers.includes(server)
  );

  if (nonCriticalServers.length === 0) {
    return;
  }

  printSection('Non-Critical Servers (Informational)');

  const nonCriticalDown = nonCriticalServers.filter((s) => s.status === 'down');
  const nonCriticalDegraded = nonCriticalServers.filter((s) => s.status === 'degraded');
  const nonCriticalOk = nonCriticalServers.filter((s) => s.status === 'ok');

  console.log(`  Total: ${nonCriticalServers.length}`);
  console.log(`  ${colorize('✓', 'green')} OK: ${nonCriticalOk.length}`);
  if (nonCriticalDegraded.length > 0) {
    console.log(`  ${colorize('⚠', 'yellow')} Degraded: ${nonCriticalDegraded.length}`);
  }
  if (nonCriticalDown.length > 0) {
    console.log(`  ${colorize('✖', 'red')} Down: ${nonCriticalDown.length}`);
    console.log(`     (Non-critical failures are logged but do not fail the build)`);
  }

  console.log();
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  // Show help
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
${colorize('Critical MCP Server Validation', 'bold')}

Validates that critical DCYFR MCP servers are operational.

${colorize('Usage:', 'cyan')}
  node scripts/ci/validate-critical-mcps.mjs <health-report.json>
  node scripts/ci/validate-critical-mcps.mjs --stdin

${colorize('Options:', 'cyan')}
  --stdin          Read health report from stdin
  --help, -h       Show this help message

${colorize('Exit Codes:', 'cyan')}
  0 - All critical MCPs operational
  1 - One or more critical MCPs down
  2 - Invalid input or configuration error

${colorize('Critical Servers:', 'cyan')}
${CRITICAL_MCPS.map((name) => `  • ${name}`).join('\n')}
`);
    process.exit(0);
  }

  // Read health report
  const source = args[0];
  const report = await readHealthReport(source);

  if (!report) {
    process.exit(2);
  }

  // Validate report structure
  const validation = validateHealthReport(report);
  if (!validation.valid) {
    console.error(colorize('ERROR: Invalid health report structure', 'red'));
    console.error(validation.error);
    process.exit(2);
  }

  // Extract critical servers
  const criticalServers = getCriticalServers(report);

  if (criticalServers.length === 0) {
    console.error(colorize('ERROR: No critical servers found in health report', 'red'));
    console.error(`Expected servers matching: ${CRITICAL_MCPS.join(', ')}`);
    process.exit(2);
  }

  // Check critical server status
  const results = checkCriticalServers(criticalServers);

  // Print results
  printResults(report, criticalServers, results);
  printNonCriticalSummary(report, criticalServers);

  // Exit with appropriate code
  if (!results.allOk) {
    console.error(colorize('\n❌ Validation failed - exiting with code 1\n', 'red'));
    process.exit(1);
  }

  console.log(colorize('✅ Validation passed - exiting with code 0\n', 'green'));
  process.exit(0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(colorize('FATAL ERROR:', 'red'), error);
    process.exit(2);
  });
}

export { readHealthReport, validateHealthReport, getCriticalServers, checkCriticalServers };
