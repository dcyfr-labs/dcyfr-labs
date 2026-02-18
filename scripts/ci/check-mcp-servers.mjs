#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { parse as parseJsonc } from 'jsonc-parser';

const ROOT = process.cwd();

function parseEnvFile(filePath) {
  try {
    const text = fs.readFileSync(filePath, 'utf8');
    const lines = text.split(/\r?\n/);
    const out = {};
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      // Remove surrounding quotes
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      out[key] = val;
    }
    return out;
  } catch (err) {
    return {};
  }
}

function expandPlaceholders(value, root) {
  if (typeof value !== 'string') return value;
  return value.replace(/\$\{([^}]+)\}/g, (match, name) => {
    if (name === 'workspaceFolder' || name === 'workspaceRoot') return root;
    if (name === 'workspaceFolderBasename') return path.basename(root);
    // Environment variables (e.g., PERPLEXITY_API_KEY)
    if (process.env[name] !== undefined) return process.env[name];
    // Unknown placeholder; return original match
    return match;
  });
}

function expandObject(obj, root) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((v) => expandObject(v, root));
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') out[k] = expandPlaceholders(v, root);
    else if (Array.isArray(v))
      out[k] = v.map((item) =>
        typeof item === 'string' ? expandPlaceholders(item, root) : expandObject(item, root)
      );
    else out[k] = expandObject(v, root);
  }
  return out;
}

/**
 * Validates that a URL is safe for MCP server connections.
 * Defense in depth - even though URLs come from version-controlled config,
 * we validate at runtime to prevent accidents or config compromise.
 *
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL is safe for MCP server connections
 */
function isValidMCPServerURL(url) {
  try {
    const parsed = new URL(url);

    // Only allow HTTPS and localhost HTTP (for development)
    const isHTTPS = parsed.protocol === 'https:';
    const isLocalHTTP =
      parsed.protocol === 'http:' &&
      (parsed.hostname === 'localhost' ||
        parsed.hostname === '127.0.0.1' ||
        parsed.hostname === '0.0.0.0');

    if (!isHTTPS && !isLocalHTTP) {
      console.warn(`⚠️  Invalid MCP server URL protocol: ${url}`);
      console.warn('   Only HTTPS or localhost HTTP allowed');
      return false;
    }

    // Reject suspicious paths or query params that could be exploitation attempts
    const suspiciousPatterns = [
      /\.\.\//, // Directory traversal
      /[<>"'`]/, // HTML/JS injection attempts
      /file:\/\//i, // File protocol
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url)) {
        console.warn(`⚠️  Suspicious pattern in MCP server URL: ${url}`);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.warn(`⚠️  Invalid MCP server URL format: ${url}`);
    return false;
  }
}

function readMcpConfig(configPath = path.join(ROOT, '.vscode', 'mcp.json')) {
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    const cfg = parseJsonc(raw);
    // Support both `servers` and `mcpServers` (repo-level configs)
    const servers = cfg.servers || cfg.mcpServers || {};
    // Expand placeholders like ${workspaceFolder}
    const root = path.dirname(path.resolve(configPath));
    const expanded = {};
    for (const [name, s] of Object.entries(servers)) {
      expanded[name] = expandObject(s, root);
    }
    return expanded;
  } catch (err) {
    return {};
  }
}

/**
 * Build auth headers by guessing token env var names for a server.
 * Returns {headers, tokenNameUsed}.
 */
function buildAuthHeaders(name, server, env) {
  const headers = {};
  let tokenNameUsed = undefined;
  if (server && server.auth && server.auth.envVar) {
    const varName = server.auth.envVar;
    if (env[varName]) {
      headers['Authorization'] = `Bearer ${env[varName]}`;
      tokenNameUsed = varName;
    }
  }
  if (!tokenNameUsed) {
    const tokensToTry = [
      `${name.toUpperCase()}_API_KEY`,
      `${name.toUpperCase()}_API_TOKEN`,
      `${name.toUpperCase()}_ACCESS_TOKEN`,
      `${name.toUpperCase()}_TOKEN`,
      `${name.toUpperCase()}_KEY`,
      `${name.toUpperCase()}_AUTH_TOKEN`,
    ];
    for (const t of tokensToTry) {
      if (env[t]) {
        headers['Authorization'] = `Bearer ${env[t]}`;
        tokenNameUsed = t;
        break;
      }
    }
  }
  return { headers, tokenNameUsed };
}

/**
 * Build a check result object from a fetch response.
 */
function buildFetchResult(name, res, method, tokenNameUsed, startTime) {
  return {
    name,
    ok: res.ok || [401, 403, 405].includes(res.status),
    status: res.status,
    statusText: res.statusText,
    method,
    tokenNameUsed,
    elapsedMs: Date.now() - startTime,
  };
}

async function checkUrlServer(name, server, env = {}, timeoutMs = 5000, opts = {}) {
  const url = server.url;
  if (!url) return { name, ok: false, error: 'no-url' };
  const { headers, tokenNameUsed } = buildAuthHeaders(name, server, env);

  // SECURITY: Validate URL before making request (defense in depth)
  if (!isValidMCPServerURL(url)) {
    return {
      name,
      ok: false,
      status: 0,
      statusText: 'INVALID_URL',
      method: 'BLOCKED',
      tokenNameUsed,
      elapsedMs: 0,
    };
  }

  // Try HEAD first; fallback to GET if HEAD is not allowed, or if it times out
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    // Safe: URL validated by isValidMCPServerURL() above (HTTPS or localhost only)
    const res = await fetch(url, { method: 'HEAD', headers, signal: controller.signal });
    clearTimeout(timer);
    // If we get a 405 (Method Not Allowed), try GET instead with longer timeout
    if (res.status === 405) {
      const controller2 = new AbortController();
      const timer2 = setTimeout(() => controller2.abort(), timeoutMs * 2);
      // Safe: URL validated by isValidMCPServerURL() above (HTTPS or localhost only)
      const res2 = await fetch(url, { method: 'GET', headers, signal: controller2.signal });
      clearTimeout(timer2);
      if (opts.debug) console.log({ url, name, method: 'GET (fallback from HEAD 405)', tokenNameUsed, status: res2.status, statusText: res2.statusText });
      return buildFetchResult(name, res2, 'GET', tokenNameUsed, startTime);
    }
    if (opts.debug) console.log({ url, name, method: 'HEAD', tokenNameUsed, status: res.status, statusText: res.statusText });
    return buildFetchResult(name, res, 'HEAD', tokenNameUsed, startTime);
  } catch (err) {
    try {
      const controller3 = new AbortController();
      const timer3 = setTimeout(() => controller3.abort(), timeoutMs * 2);
      // Safe: URL validated by isValidMCPServerURL() above (HTTPS or localhost only)
      const res3 = await fetch(url, { method: 'GET', headers, signal: controller3.signal });
      clearTimeout(timer3);
      if (opts.debug) console.log({ url, name, method: 'GET (fallback from HEAD error)', tokenNameUsed, status: res3.status, statusText: res3.statusText });
      return buildFetchResult(name, res3, 'GET', tokenNameUsed, startTime);
    } catch (err2) {
      if (opts.debug) console.error(`MCP check failed ${name} ${url}:`, err2 || err);
      return {
        name,
        ok: false,
        error: String(err2 || err),
        method: 'GET',
        tokenNameUsed,
        elapsedMs: Date.now() - startTime,
      };
    }
  }
}

function checkCommandServer(name, server) {
  const command = server.command;
  const args = server.args || [];
  if (!command) return { name, ok: false, error: 'no-command' };
  // Append a version check flag if not already present
  const cmdArgs = Array.from(args);
  // Try a bare `command --version` first (safe for npx and many binaries)
  try {
    const resBare = spawnSync(command, ['--version'], { // NOSONAR - Administrative script, inputs from controlled sources
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 10_000,
    });
    if (!resBare.error && resBare.status === 0)
      return { name, ok: true, stdout: resBare.stdout.trim() };
  } catch (err) {
    // ignore; fallback to the full command invocation
  }
  // Some packages want --version, some -v; try both
  cmdArgs.push('--version');
  try {
    const res = spawnSync(command, cmdArgs, { // NOSONAR - Administrative script, inputs from controlled sources
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 10_000,
    });
    if (res.error) return { name, ok: false, error: String(res.error) };
    if (res.status === 0) return { name, ok: true, stdout: res.stdout.trim() };
    // Try running with --help if version failed
    const res2 = spawnSync(command, [...args, '--help'], { // NOSONAR - Administrative script, inputs from controlled sources
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 10_000,
    });
    if (res2.status === 0) return { name, ok: true, stdout: (res2.stdout || res2.stderr).trim() };
    return { name, ok: false, status: res.status, stderr: res.stderr.trim() };
  } catch (err) {
    return { name, ok: false, error: String(err) };
  }
}

/**
 * Check a single server by dispatching to url or command checker.
 */
async function checkOneServer(name, server, env, opts) {
  if (server.url) {
    const r = await checkUrlServer(name, server, env, opts.timeoutMs, opts);
    return { name, type: 'url', ...r };
  }
  if (server.command) {
    const r = checkCommandServer(name, server);
    return { name, type: 'command', ...r };
  }
  return { name, ok: false, error: 'unknown-server-type' };
}

/**
 * Print check results to stdout/stderr.
 */
function reportResults(results, opts) {
  const failures = results.filter((r) => !r.ok);
  if (opts.json) {
    console.log(JSON.stringify({ results, failures }, null, 2));
  } else {
    for (const r of results) {
      if (r.ok) {
        const statusStr = r.status ? ` [${r.status}]` : '';
        console.log(`✓ ${r.name} (${r.type}) - OK${statusStr}`);
      } else {
        const detail = r.error ? `(${r.error})` : r.status ? `[${r.status}]` : '';
        console.error(`✖ ${r.name} (${r.type}) - FAILED ${detail}`);
      }
    }
  }
  return failures;
}

async function run(opts = {}) {
  const servers = readMcpConfig(opts.configPath);
  // If an envFile is set at root mcp.json use it; fallback to .env.local
  let env = process.env;
  const envFile = opts.envFile || '.env.local';
  const envPath = path.isAbsolute(envFile) ? envFile : path.join(ROOT, envFile);
  if (fs.existsSync(envPath)) {
    const parsed = parseEnvFile(envPath);
    env = { ...process.env, ...parsed };
  }
  const results = [];
  for (const [name, server] of Object.entries(servers)) {
    results.push(await checkOneServer(name, server, env, opts));
  }
  const failures = reportResults(results, opts);
  if (failures.length > 0 && opts.fail) {
    process.exit(1);
  }
  return results;
}

// CLI
if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const opts = {
    json: false,
    fail: false,
    timeoutMs: 5000,
    envFile: '.env.local',
    configPath: path.join(ROOT, '.vscode', 'mcp.json'),
    debug: false,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--json') opts.json = true;
    if (a === '--fail') opts.fail = true;
    if (a === '--no-auth') opts.noAuth = true;
    if (a === '--debug') opts.debug = true;
    if ((a === '--timeout' || a === '-t') && args[i + 1]) {
      opts.timeoutMs = parseInt(args[i + 1], 10);
      i++;
    }
    if ((a === '--envFile' || a === '-e') && args[i + 1]) {
      opts.envFile = args[i + 1];
      i++;
    }
    if ((a === '--config' || a === '-c') && args[i + 1]) {
      opts.configPath = args[i + 1];
      i++;
    }
  }
  run(opts).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { parseEnvFile, readMcpConfig, checkUrlServer, checkCommandServer, run };
