import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import http from 'http';
import https from 'https';
import type { Server as HttpServer } from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

import { parseEnvFile, readMcpConfig, checkUrlServer, checkCommandServer, run } from '../../scripts/ci/check-mcp-servers.mjs';

// Provide a simple node-based fetch for the tests to avoid CORS/DOM policy used
// by the default test environment. We implement a minimal HEAD/GET support.
  globalThis.fetch = ((url: RequestInfo | URL, opts: any = {}) => {
  const { method = 'GET', headers } = opts;
  const parsed = new URL(String(url));
  const lib = parsed.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    const req = lib.request(
      { method, hostname: parsed.hostname, path: parsed.pathname + parsed.search, port: parsed.port, headers },
      (res) => {
        const status = (res.statusCode || 0) as number;
        resolve({ ok: status >= 200 && status < 400, status, statusText: res.statusMessage || '' });
      }
    );
    req.on('error', reject);
    req.end();
  });
  }) as any;

describe('check-mcp-servers', () => {
  let server: HttpServer | null = null;
  let url = '';
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-test-'));
  const envFile = path.join(tmp, '.env.local');
  const mcpFile = path.join(tmp, 'mcp.json');
  const mcpFile2 = path.join(tmp, 'mcp2.json');

  beforeAll(() => {
    server = http.createServer((req, res) => {
      if (req.method === 'HEAD' || req.method === 'GET') {
        res.writeHead(200);
        res.end('ok');
      } else {
        res.writeHead(200);
        res.end('ok');
      }
    }).listen(0);
    const address = server.address();
    // address can be a string or AddressInfo
    // @ts-ignore - address is address info for this local server
    const port = (address as { port: number }).port;
    url = `http://127.0.0.1:${port}`;
    fs.writeFileSync(envFile, 'TEST_TOKEN=abc123\n');
    const mcpJson = { servers: {
      "LocalHttp": { url },
      "NodeCommand": { command: "node", args: ["-v"] }
    } };
    fs.writeFileSync(mcpFile, JSON.stringify(mcpJson, null, 2));
    const mcpJson2 = { mcpServers: {
      "Filesystem": { command: "node", args: ["-e", "console.log('ok')" , "${workspaceFolder}"], disabled: false }
    } };
    fs.writeFileSync(mcpFile2, JSON.stringify(mcpJson2, null, 2));
  });

  afterAll(() => {
    try { server && server.close(); } catch (err) {}
  });

  it('parseEnvFile reads .env-like files', () => {
    const parsed = parseEnvFile(envFile) as Record<string, string>;
    expect(parsed.TEST_TOKEN).toBe('abc123');
  });

  it('readMcpConfig returns servers when config exists', () => {
    const servers = readMcpConfig(mcpFile) as Record<string, any>;
    expect(servers.LocalHttp.url).toBe(url);
    expect(servers.NodeCommand.command).toBe('node');
  });

  it('readMcpConfig supports mcpServers and expands ${workspaceFolder}', () => {
    const servers = readMcpConfig(mcpFile2) as Record<string, any>;
    expect(servers.Filesystem.command).toBe('node');
    // ${workspaceFolder} should be expanded to a string path under tmp
    expect(typeof servers.Filesystem.args[2]).toBe('string');
    expect(servers.Filesystem.args[2]).toContain(tmp);
  });

  it('checkUrlServer returns ok for running local server', async () => {
    const res = await checkUrlServer('LocalHttp', { url }, { TEST_TOKEN: 'abc123' });
    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
  });

  it('checkUrlServer adds Authorization header and authenticates when token is present', async () => {
    let authHeader = '';
    // start a server that requires the Authorization header
    const authServer = http.createServer((req, res) => {
      authHeader = (req.headers['authorization'] || '').toString();
      if (authHeader === 'Bearer my-test-token') {
        res.writeHead(200);
        res.end('ok');
      } else {
        res.writeHead(401);
        res.end('unauthorized');
      }
    }).listen(0);
    const address2 = authServer.address();
    const port2 = (address2 as { port: number }).port;
    const url2 = `http://127.0.0.1:${port2}`;
    const env = { VERCEL_TOKEN: 'my-test-token' };
    // Override global fetch locally to ensure headers are passed in the test environment
    const originalFetch = globalThis.fetch;
    globalThis.fetch = ((url: RequestInfo | URL, opts: any = {}) => {
      const { method = 'GET', headers } = opts;
      const parsed = new URL(String(url));
      const lib = parsed.protocol === 'https:' ? https : http;
      return new Promise((resolve, reject) => {
        const req = lib.request(
          { method, hostname: parsed.hostname, path: parsed.pathname + parsed.search, port: parsed.port, headers },
          (res) => {
            const status = (res.statusCode || 0) as number;
            resolve({ ok: status >= 200 && status < 400, status, statusText: res.statusMessage || '' });
          }
        );
        req.on('error', reject);
        req.end();
      });
    }) as any;
    const res = await checkUrlServer('Vercel', { url: url2 }, env);
    // Restore original fetch implementation
    globalThis.fetch = originalFetch;
    expect(res.ok).toBe(true);
    expect(authHeader).toBe('Bearer my-test-token');
    try { authServer.close(); } catch (err) { }
  });

  it('checkUrlServer falls back to GET when HEAD is not allowed', async () => {
    // Simulate a server that returns 405 for HEAD, but 200 for GET
    let sawHead = false;
    let sawGet = false;
    const server2 = http.createServer((req, res) => {
      if (req.method === 'HEAD') {
        sawHead = true;
        res.writeHead(405);
        res.end();
      } else if (req.method === 'GET') {
        sawGet = true;
        res.writeHead(200);
        res.end('ok');
      } else {
        res.writeHead(405);
        res.end();
      }
    }).listen(0);
    const address = server2.address();
    const port = (address as { port: number }).port;
    const url2 = `http://127.0.0.1:${port}`;
    const res = await checkUrlServer('TestFallback', { url: url2 }, {});
    expect(res.ok).toBe(true);
    expect(sawHead).toBe(true);
    expect(sawGet).toBe(true);
    try { server2.close(); } catch (err) { }
  });

  it('checkUrlServer uses explicit server.auth.envVar when provided', async () => {
    let authHeader = '';
    const authServer = http.createServer((req, res) => {
      authHeader = (req.headers['authorization'] || '').toString();
      if (authHeader === 'Bearer my-custom-token') {
        res.writeHead(200);
        res.end('ok');
      } else {
        res.writeHead(401);
        res.end('unauthorized');
      }
    }).listen(0);
    const address = authServer.address();
    const port = (address as { port: number }).port;
    const url2 = `http://127.0.0.1:${port}`;
    const serverConfig = { url: url2, auth: { envVar: 'CUSTOM_AUTH' } };
    const env = { CUSTOM_AUTH: 'my-custom-token' };
    const res = await checkUrlServer('CustomServer', serverConfig, env);
    expect(res.ok).toBe(true);
    expect(res.tokenNameUsed).toBe('CUSTOM_AUTH');
    expect(authHeader).toBe('Bearer my-custom-token');
    try { authServer.close(); } catch (err) { }
  });

  it('checkCommandServer returns ok for node -v', () => {
    const res = checkCommandServer('NodeCommand', { command: 'node', args: ['-v'] });
    expect(res.ok).toBe(true);
    expect(res.stdout).toMatch(/v\d+\.\d+\.\d+/);
  });

  it('run returns a result list and no failures in non-fail mode', async () => {
    const results = await run({ configPath: mcpFile, envFile, json: false, fail: false });
    const local = results.find(r => r.name === 'LocalHttp');
    const nodeCmd = results.find(r => r.name === 'NodeCommand');
    expect(local && local.ok).toBe(true);
    expect(nodeCmd && nodeCmd.ok).toBe(true);
  });
});
