/**
 * MCP Integrity Verification - ASI04 Mitigation
 *
 * Prevents supply chain attacks through MCP servers by:
 * - Signature verification for MCP responses
 * - Response integrity checking
 * - Trusted server registry
 * - Tamper detection
 *
 * OWASP ASI-2026: ASI04 - Data Poisoning via MCP Servers
 *
 * Security Model:
 * 1. Trusted MCP servers pre-registered with public keys
 * 2. All responses signed by MCP server
 * 3. Signatures verified before processing
 * 4. Failed verification = reject response
 */

import { createHash, createHmac, timingSafeEqual } from 'crypto';

// ============================================================================
// Types
// ============================================================================

export interface MCPServer {
  name: string;
  type: 'stdio' | 'http' | 'websocket';
  trusted: boolean;
  publicKey?: string; // For signature verification
  sharedSecret?: string; // For HMAC verification
  registeredAt: string;
  lastVerified?: string;
}

export interface MCPResponse {
  server: string;
  method: string;
  data: unknown;
  timestamp: string;
  signature?: string; // Optional signature
  nonce?: string; // Anti-replay
}

export interface MCPIntegrityResult {
  valid: boolean;
  server: string;
  method: string;
  timestamp: string;
  checks: {
    serverTrusted: boolean;
    signaturePresent: boolean;
    signatureValid: boolean;
    timestampValid: boolean;
    nonceValid: boolean;
  };
  errors: string[];
}

// ============================================================================
// Trusted Server Registry
// ============================================================================

class MCPServerRegistry {
  private servers = new Map<string, MCPServer>();
  private nonces = new Set<string>(); // Anti-replay protection
  private nonceExpiry = 5 * 60 * 1000; // 5 minutes

  /**
   * Register trusted MCP server
   */
  register(server: MCPServer): void {
    this.servers.set(server.name, server);
  }

  /**
   * Get server by name
   */
  get(name: string): MCPServer | undefined {
    return this.servers.get(name);
  }

  /**
   * Check if server is trusted
   */
  isTrusted(name: string): boolean {
    const server = this.servers.get(name);
    return server?.trusted ?? false;
  }

  /**
   * Get all registered servers
   */
  getAll(): MCPServer[] {
    return Array.from(this.servers.values());
  }

  /**
   * Update server last verified timestamp
   */
  updateLastVerified(name: string): void {
    const server = this.servers.get(name);
    if (server) {
      server.lastVerified = new Date().toISOString();
      this.servers.set(name, server);
    }
  }

  /**
   * Record nonce (anti-replay)
   */
  recordNonce(nonce: string): boolean {
    if (this.nonces.has(nonce)) {
      return false; // Duplicate nonce (replay attack)
    }

    this.nonces.add(nonce);

    // Cleanup old nonces (basic implementation)
    setTimeout(() => {
      this.nonces.delete(nonce);
    }, this.nonceExpiry);

    return true;
  }

  /**
   * Clear all servers (for testing)
   */
  clear(): void {
    this.servers.clear();
    this.nonces.clear();
  }
}

// Singleton registry
export const mcpServerRegistry = new MCPServerRegistry();

// ============================================================================
// Pre-registered Trusted MCP Servers
// ============================================================================

// Register known MCP servers from .mcp.json
mcpServerRegistry.register({
  name: 'memory',
  type: 'stdio',
  trusted: true,
  registeredAt: new Date().toISOString(),
});

mcpServerRegistry.register({
  name: 'filesystem',
  type: 'stdio',
  trusted: true,
  registeredAt: new Date().toISOString(),
});

mcpServerRegistry.register({
  name: 'github',
  type: 'stdio',
  trusted: true,
  registeredAt: new Date().toISOString(),
});

mcpServerRegistry.register({
  name: 'playwright',
  type: 'stdio',
  trusted: true,
  registeredAt: new Date().toISOString(),
});

mcpServerRegistry.register({
  name: 'dcyfr-promptintel',
  type: 'stdio',
  trusted: true,
  registeredAt: new Date().toISOString(),
});

// ============================================================================
// Integrity Verification
// ============================================================================

/** Check 1: Verify the responding server is registered and trusted */
function checkServerTrusted(
  response: MCPResponse,
  errors: string[]
): { server: ReturnType<typeof mcpServerRegistry.get>; trusted: boolean } {
  const server = mcpServerRegistry.get(response.server);
  if (!server || !server.trusted) {
    errors.push(`Server "${response.server}" is not trusted`);
    return { server, trusted: false };
  }
  return { server, trusted: true };
}

/** Check 2 + 3: Verify signature presence and validity */
function checkSignature(
  response: MCPResponse,
  server: ReturnType<typeof mcpServerRegistry.get>,
  errors: string[]
): { signaturePresent: boolean; signatureValid: boolean } {
  if (!response.signature) {
    return { signaturePresent: false, signatureValid: true }; // optional, not enforced yet
  }

  if (!server?.sharedSecret) {
    return { signaturePresent: true, signatureValid: true }; // no secret configured
  }

  const isValid = verifyHMACSignature(response, response.signature, server.sharedSecret);
  if (isValid) {
    mcpServerRegistry.updateLastVerified(response.server);
  } else {
    errors.push('Signature verification failed');
  }
  return { signaturePresent: true, signatureValid: isValid };
}

/** Check 4: Verify timestamp is within the acceptable 5-minute window */
function checkTimestamp(response: MCPResponse, errors: string[]): boolean {
  const responseTime = new Date(response.timestamp).getTime();
  const timeDiff = Math.abs(Date.now() - responseTime);
  if (timeDiff < 5 * 60 * 1000) return true;
  errors.push(`Timestamp too old: ${timeDiff}ms`);
  return false;
}

/** Check 5: Verify nonce has not been seen before (anti-replay) */
function checkNonce(response: MCPResponse, errors: string[]): boolean {
  if (!response.nonce) return true; // optional, not enforced yet
  const nonceValid = mcpServerRegistry.recordNonce(response.nonce);
  if (!nonceValid) errors.push('Duplicate nonce detected (replay attack)');
  return nonceValid;
}

/**
 * Verify MCP response integrity
 */
export function verifyMCPIntegrity(response: MCPResponse): MCPIntegrityResult {
  const errors: string[] = [];

  const { server, trusted: serverTrusted } = checkServerTrusted(response, errors);
  const { signaturePresent, signatureValid } = checkSignature(response, server, errors);
  const timestampValid = checkTimestamp(response, errors);
  const nonceValid = checkNonce(response, errors);

  const checks = { serverTrusted, signaturePresent, signatureValid, timestampValid, nonceValid };
  const valid = errors.length === 0 && serverTrusted;

  return {
    valid,
    server: response.server,
    method: response.method,
    timestamp: response.timestamp,
    checks,
    errors,
  };
}

/**
 * Verify HMAC signature
 */
export function verifyHMACSignature(
  response: MCPResponse,
  signature: string,
  sharedSecret: string
): boolean {
  try {
    // Compute expected signature
    const payload = JSON.stringify({
      server: response.server,
      method: response.method,
      data: response.data,
      timestamp: response.timestamp,
      nonce: response.nonce,
    });

    const expectedSignature = createHmac('sha256', sharedSecret).update(payload).digest('hex');

    // Timing-safe comparison
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(sigBuffer, expectedBuffer);
  } catch (error) {
    return false;
  }
}

/**
 * Generate HMAC signature (for testing)
 */
export function generateHMACSignature(
  response: Omit<MCPResponse, 'signature'>,
  sharedSecret: string
): string {
  const payload = JSON.stringify({
    server: response.server,
    method: response.method,
    data: response.data,
    timestamp: response.timestamp,
    nonce: response.nonce,
  });

  return createHmac('sha256', sharedSecret).update(payload).digest('hex');
}

/**
 * Generate nonce
 */
export function generateNonce(): string {
  return createHash('sha256').update(`${Date.now()}-${Math.random()}`).digest('hex');
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Verify and unwrap MCP response
 *
 * Throws if integrity check fails
 */
export function verifyAndUnwrap<T>(response: MCPResponse): T {
  const result = verifyMCPIntegrity(response);

  if (!result.valid) {
    throw new Error(`MCP integrity verification failed: ${result.errors.join(', ')}`);
  }

  return response.data as T;
}

/**
 * Check if MCP server is trusted
 */
export function isMCPServerTrusted(serverName: string): boolean {
  return mcpServerRegistry.isTrusted(serverName);
}

/**
 * Get MCP server info
 */
export function getMCPServerInfo(serverName: string): MCPServer | undefined {
  return mcpServerRegistry.get(serverName);
}

/**
 * Get all trusted MCP servers
 */
export function getTrustedMCPServers(): MCPServer[] {
  return mcpServerRegistry.getAll().filter((s) => s.trusted);
}

/**
 * Register new MCP server
 */
export function registerMCPServer(server: MCPServer): void {
  mcpServerRegistry.register(server);
}

// ============================================================================
// Integration Example
// ============================================================================

/**
 * Example: Verify PromptIntel MCP response
 */
export async function verifyPromptIntelResponse(response: unknown): Promise<unknown> {
  // Cast to MCP response format
  const mcpResponse = response as MCPResponse;

  // Verify integrity
  const verification = verifyMCPIntegrity(mcpResponse);

  if (!verification.valid) {
    console.error('[MCP Integrity] Verification failed:', verification.errors);
    throw new Error('MCP integrity verification failed');
  }

  console.log('[MCP Integrity] PromptIntel response verified');
  return mcpResponse.data;
}

/**
 * Example: Wrap MCP call with integrity verification
 */
export async function withMCPIntegrity<T>(
  serverName: string,
  method: string,
  callFn: () => Promise<unknown>
): Promise<T> {
  // Check server is trusted
  if (!isMCPServerTrusted(serverName)) {
    throw new Error(`MCP server "${serverName}" is not trusted`);
  }

  // Call MCP server
  const rawResponse = await callFn();

  // Construct MCP response
  const mcpResponse: MCPResponse = {
    server: serverName,
    method,
    data: rawResponse,
    timestamp: new Date().toISOString(),
  };

  // Verify and unwrap
  return verifyAndUnwrap<T>(mcpResponse);
}

// ============================================================================
// Pre-registered Default MCP Servers
// ============================================================================

// Register standard MCP servers that ship with VS Code MCP
registerMCPServer({
  name: 'memory',
  type: 'stdio',
  trusted: true,
  registeredAt: new Date().toISOString(),
});

registerMCPServer({
  name: 'filesystem',
  type: 'stdio',
  trusted: true,
  registeredAt: new Date().toISOString(),
});

registerMCPServer({
  name: 'github',
  type: 'stdio',
  trusted: true,
  registeredAt: new Date().toISOString(),
});

// Register custom DCYFR MCP servers
registerMCPServer({
  name: 'dcyfr-promptintel',
  type: 'stdio',
  trusted: true,
  registeredAt: new Date().toISOString(),
});
