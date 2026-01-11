#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { parse as parseJsonc } from "jsonc-parser";

const ROOT = process.cwd();

function parseEnvFile(filePath) {
  try {
    const text = fs.readFileSync(filePath, "utf8");
    const lines = text.split(/\r?\n/);
    const out = {};
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
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
  if (typeof value !== "string") return value;
  return value.replace(/\$\{([^}]+)\}/g, (match, name) => {
    if (name === "workspaceFolder" || name === "workspaceRoot") return root;
    if (name === "workspaceFolderBasename") return path.basename(root);
    // Environment variables (e.g., PERPLEXITY_API_KEY)
    if (process.env[name] !== undefined) return process.env[name];
    // Unknown placeholder; return original match
    return match;
  });
}

function expandObject(obj, root) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map((v) => expandObject(v, root));
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") out[k] = expandPlaceholders(v, root);
    else if (Array.isArray(v))
      out[k] = v.map((item) =>
        typeof item === "string"
          ? expandPlaceholders(item, root)
          : expandObject(item, root)
      );
    else out[k] = expandObject(v, root);
  }
  return out;
}

function readMcpConfig(configPath = path.join(ROOT, ".vscode", "mcp.json")) {
  try {
    const raw = fs.readFileSync(configPath, "utf8");
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

async function checkUrlServer(
  name,
  server,
  env = {},
  timeoutMs = 5000,
  opts = {}
) {
  const url = server.url;
  if (!url) return { name, ok: false, error: "no-url" };
  const headers = {};
  let tokenNameUsed = undefined;
  // Check for explicit per-server auth variable (server.auth.envVar)
  if (server && server.auth && server.auth.envVar) {
    const varName = server.auth.envVar;
    if (env[varName]) {
      headers["Authorization"] = `Bearer ${env[varName]}`;
      tokenNameUsed = varName;
    }
  }
  // Try to guess an auth token from env if explicit var not set
  const tokensToTry = [
    `${name.toUpperCase()}_API_KEY`,
    `${name.toUpperCase()}_API_TOKEN`,
    `${name.toUpperCase()}_ACCESS_TOKEN`,
    `${name.toUpperCase()}_TOKEN`,
    `${name.toUpperCase()}_KEY`,
    `${name.toUpperCase()}_AUTH_TOKEN`,
  ];
  if (!tokenNameUsed) {
    for (const t of tokensToTry) {
      if (env[t]) {
        headers["Authorization"] = `Bearer ${env[t]}`;
        tokenNameUsed = t;
        break;
      }
    }
  }

  // Try HEAD first; fallback to GET if HEAD is not allowed, or if it times out
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    // lgtm[js/file-access-to-http] - URLs come from trusted MCP server configuration loaded from
    // version-controlled .vscode/mcp.json file, not user input. Build-time CI utility only.
    const res = await fetch(url, { // lgtm[js/file-access-to-http]
      method: "HEAD",
      headers,
      signal: controller.signal,
    });
    clearTimeout(timer);
    // If we get a 405 (Method Not Allowed), try GET instead with longer timeout
    if (res.status === 405) {
      // Try GET fallback
      const controller2 = new AbortController();
      const timer2 = setTimeout(() => controller2.abort(), timeoutMs * 2);
      // lgtm[js/file-access-to-http] - Same as above: URLs from trusted MCP server config,
      // never from user input. Fallback for servers that don't support HEAD method.
      const res2 = await fetch(url, { // lgtm[js/file-access-to-http]
        method: "GET",
        headers,
        signal: controller2.signal,
      });
      clearTimeout(timer2);
      if (opts.debug)
        console.log({
          url,
          name,
          method: "GET (fallback from HEAD 405)",
          tokenNameUsed,
          status: res2.status,
          statusText: res2.statusText,
        });
      return {
        name,
        ok: res2.ok || [401, 403, 405].includes(res2.status),
        status: res2.status,
        statusText: res2.statusText,
        method: "GET",
        tokenNameUsed,
        elapsedMs: Date.now() - startTime,
      };
    }
    if (opts.debug)
      console.log({
        url,
        name,
        method: "HEAD",
        tokenNameUsed,
        status: res.status,
        statusText: res.statusText,
      });
    return {
      name,
      ok: res.ok || [401, 403, 405].includes(res.status),
      status: res.status,
      statusText: res.statusText,
      method: "HEAD",
      tokenNameUsed,
      elapsedMs: Date.now() - startTime,
    };
  } catch (err) {
    try {
      const controller3 = new AbortController();
      const timer3 = setTimeout(() => controller3.abort(), timeoutMs * 2);
      // lgtm[js/file-access-to-http] - Same as above: URLs from trusted MCP server config,
      // never from user input. Second-level fallback when HEAD/GET timeout.
      const res3 = await fetch(url, { // lgtm[js/file-access-to-http]
        method: "GET",
        headers,
        signal: controller3.signal,
      });
      clearTimeout(timer3);
      if (opts.debug)
        console.log({
          url,
          name,
          method: "GET (fallback from HEAD error)",
          tokenNameUsed,
          status: res3.status,
          statusText: res3.statusText,
        });
      return {
        name,
        ok: res3.ok || [401, 403, 405].includes(res3.status),
        status: res3.status,
        statusText: res3.statusText,
        method: "GET",
        tokenNameUsed,
        elapsedMs: Date.now() - startTime,
      };
    } catch (err2) {
      if (opts.debug)
        console.error(`MCP check failed ${name} ${url}:`, err2 || err);
      return {
        name,
        ok: false,
        error: String(err2 || err),
        method: "GET",
        tokenNameUsed,
        elapsedMs: Date.now() - startTime,
      };
    }
  }
}

function checkCommandServer(name, server) {
  const command = server.command;
  const args = server.args || [];
  if (!command) return { name, ok: false, error: "no-command" };
  // Append a version check flag if not already present
  const cmdArgs = Array.from(args);
  // Try a bare `command --version` first (safe for npx and many binaries)
  try {
    const resBare = spawnSync(command, ["--version"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 10_000,
    });
    if (!resBare.error && resBare.status === 0)
      return { name, ok: true, stdout: resBare.stdout.trim() };
  } catch (err) {
    // ignore; fallback to the full command invocation
  }
  // Some packages want --version, some -v; try both
  cmdArgs.push("--version");
  try {
    const res = spawnSync(command, cmdArgs, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 10_000,
    });
    if (res.error) return { name, ok: false, error: String(res.error) };
    if (res.status === 0) return { name, ok: true, stdout: res.stdout.trim() };
    // Try running with --help if version failed
    const res2 = spawnSync(command, [...args, "--help"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 10_000,
    });
    if (res2.status === 0)
      return { name, ok: true, stdout: (res2.stdout || res2.stderr).trim() };
    return { name, ok: false, status: res.status, stderr: res.stderr.trim() };
  } catch (err) {
    return { name, ok: false, error: String(err) };
  }
}

async function run(opts = {}) {
  const servers = readMcpConfig(opts.configPath);
  // If an envFile is set at root mcp.json use it; fallback to .env.local
  let env = process.env;
  const envFile = opts.envFile || ".env.local";
  const envPath = path.isAbsolute(envFile) ? envFile : path.join(ROOT, envFile);
  if (fs.existsSync(envPath)) {
    const parsed = parseEnvFile(envPath);
    env = { ...process.env, ...parsed };
  }
  const results = [];
  for (const [name, server] of Object.entries(servers)) {
    if (server.url) {
      const r = await checkUrlServer(name, server, env, opts.timeoutMs, opts);
      results.push({ name, type: "url", ...r });
    } else if (server.command) {
      const r = checkCommandServer(name, server);
      results.push({ name, type: "command", ...r });
    } else {
      results.push({ name, ok: false, error: "unknown-server-type" });
    }
  }
  const failures = results.filter((r) => !r.ok);
  if (opts.json) {
    console.log(JSON.stringify({ results, failures }, null, 2));
  } else {
    for (const r of results) {
      if (r.ok) {
        console.log(
          `✓ ${r.name} (${r.type}) - OK${r.status ? ` [${r.status}]` : ""}`
        );
      } else {
        console.error(
          `✖ ${r.name} (${r.type}) - FAILED ${r.error ? `(${r.error})` : r.status ? `[${r.status}]` : ""}`
        );
      }
    }
  }
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
    envFile: ".env.local",
    configPath: path.join(ROOT, ".vscode", "mcp.json"),
    debug: false,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--json") opts.json = true;
    if (a === "--fail") opts.fail = true;
    if (a === "--no-auth") opts.noAuth = true;
    if (a === "--debug") opts.debug = true;
    if ((a === "--timeout" || a === "-t") && args[i + 1]) {
      opts.timeoutMs = parseInt(args[i + 1], 10);
      i++;
    }
    if ((a === "--envFile" || a === "-e") && args[i + 1]) {
      opts.envFile = args[i + 1];
      i++;
    }
    if ((a === "--config" || a === "-c") && args[i + 1]) {
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
