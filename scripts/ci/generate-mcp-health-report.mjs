#!/usr/bin/env node
/**
 * MCP Health Report Generator
 *
 * Wrapper around check-mcp-servers.mjs that transforms output
 * into the McpHealthReport format expected by the health API.
 *
 * Usage:
 *   node scripts/ci/generate-mcp-health-report.mjs [options]
 *
 * Options are passed through to check-mcp-servers.mjs:
 *   --timeout <ms>      Request timeout in milliseconds (default: 5000)
 *   --envFile <path>    Path to .env file (default: .env.local)
 *   --config <path>     Path to mcp.json (default: .vscode/mcp.json)
 *   --no-auth           Skip authentication headers
 *   --debug             Enable debug logging
 */

import { fileURLToPath } from 'url';
import { run } from './check-mcp-servers.mjs';

// ============================================================================
// TRANSFORMATION
// ============================================================================

/**
 * Transform check-mcp-servers.mjs output to McpHealthReport format
 */
function transformToHealthReport(checkResults) {
  const timestamp = new Date().toISOString();
  
  const servers = checkResults.results.map((result) => {
    // Determine status
    let status;
    if (result.ok) {
      // Check if response time is degraded (>5000ms)
      if (result.responseTime && result.responseTime > 5000) {
        status = 'degraded';
      } else {
        status = 'ok';
      }
    } else {
      status = 'down';
    }

    // Extract response time
    const responseTimeMs = result.responseTime || 0;

    // Build server status object
    const serverStatus = {
      name: result.name,
      status,
      responseTimeMs,
      timestamp,
    };

    // Add error if present
    if (result.error) {
      serverStatus.error = result.error;
    }

    // Add auth info if available
    if (result.authUsed !== undefined) {
      serverStatus.authUsed = result.authUsed;
    }

    return serverStatus;
  });

  // Calculate summary
  const summary = {
    total: servers.length,
    ok: servers.filter(s => s.status === 'ok').length,
    degraded: servers.filter(s => s.status === 'degraded').length,
    down: servers.filter(s => s.status === 'down').length,
  };

  return {
    timestamp,
    servers,
    summary,
  };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  
  // Parse options
  const opts = {
    json: true, // Always use JSON mode
    fail: false, // Don't fail on errors (let validator handle that)
    timeoutMs: 5000,
    envFile: '.env.local',
    configPath: undefined, // Use default from check-mcp-servers.mjs
    debug: false,
    noAuth: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--no-auth') opts.noAuth = true;
    if (arg === '--debug') opts.debug = true;
    if ((arg === '--timeout' || arg === '-t') && args[i + 1]) {
      opts.timeoutMs = parseInt(args[i + 1], 10);
      i++;
    }
    if ((arg === '--envFile' || arg === '-e') && args[i + 1]) {
      opts.envFile = args[i + 1];
      i++;
    }
    if ((arg === '--config' || arg === '-c') && args[i + 1]) {
      opts.configPath = args[i + 1];
      i++;
    }
  }

  try {
    // Suppress console output from check-mcp-servers.mjs
    const originalLog = console.log;
    const originalError = console.error;
    const capturedLogs = [];
    
    console.log = (...args) => {
      // Capture but don't output
      capturedLogs.push(args.join(' '));
    };
    console.error = (...args) => {
      // Capture but don't output
      capturedLogs.push(args.join(' '));
    };

    // Run MCP server checks
    const checkResults = await run(opts);

    // Restore console
    console.log = originalLog;
    console.error = originalError;

    // Transform to health report format
    const healthReport = transformToHealthReport({ results: checkResults });

    // Output as JSON
    console.log(JSON.stringify(healthReport, null, 2));
  } catch (error) {
    console.error('Error generating health report:', error);
    process.exit(1);
  }
}

// Run if called directly
if (fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { transformToHealthReport };
