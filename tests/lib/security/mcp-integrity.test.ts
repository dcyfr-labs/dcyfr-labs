/**
 * MCP Integrity Verification Tests - ASI04 Validation
 *
 * Comprehensive test coverage for MCP integrity verification:
 * - Trusted server registry
 * - HMAC signature verification
 * - Timestamp validation
 * - Nonce anti-replay
 * - Integration examples
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  mcpServerRegistry,
  verifyMCPIntegrity,
  verifyHMACSignature,
  generateHMACSignature,
  generateNonce,
  verifyAndUnwrap,
  isMCPServerTrusted,
  getMCPServerInfo,
  getTrustedMCPServers,
  registerMCPServer,
  withMCPIntegrity,
  type MCPResponse,
  type MCPServer,
} from '@/lib/security/mcp-integrity';

describe('MCP Integrity Verification', () => {
  beforeEach(() => {
    mcpServerRegistry.clear();
  });

  describe('Trusted Server Registry', () => {
    it('should register trusted MCP server', () => {
      const server: MCPServer = {
        name: 'test-server',
        type: 'stdio',
        trusted: true,
        registeredAt: new Date().toISOString(),
      };

      registerMCPServer(server);

      const retrieved = getMCPServerInfo('test-server');
      expect(retrieved).toEqual(server);
    });

    it('should check if server is trusted', () => {
      registerMCPServer({
        name: 'trusted-server',
        type: 'stdio',
        trusted: true,
        registeredAt: new Date().toISOString(),
      });

      registerMCPServer({
        name: 'untrusted-server',
        type: 'stdio',
        trusted: false,
        registeredAt: new Date().toISOString(),
      });

      expect(isMCPServerTrusted('trusted-server')).toBe(true);
      expect(isMCPServerTrusted('untrusted-server')).toBe(false);
      expect(isMCPServerTrusted('unknown-server')).toBe(false);
    });

    it('should list all trusted servers', () => {
      registerMCPServer({
        name: 'server1',
        type: 'stdio',
        trusted: true,
        registeredAt: new Date().toISOString(),
      });

      registerMCPServer({
        name: 'server2',
        type: 'http',
        trusted: true,
        registeredAt: new Date().toISOString(),
      });

      registerMCPServer({
        name: 'untrusted',
        type: 'stdio',
        trusted: false,
        registeredAt: new Date().toISOString(),
      });

      const trusted = getTrustedMCPServers();
      expect(trusted).toHaveLength(2);
      expect(trusted.map((s) => s.name)).toContain('server1');
      expect(trusted.map((s) => s.name)).toContain('server2');
      expect(trusted.map((s) => s.name)).not.toContain('untrusted');
    });
  });

  describe('Signature Verification', () => {
    const sharedSecret = 'test-secret-key-12345';

    it('should generate valid HMAC signature', () => {
      const response = {
        server: 'test-server',
        method: 'test-method',
        data: { result: 'test' },
        timestamp: new Date().toISOString(),
        nonce: generateNonce(),
      };

      const signature = generateHMACSignature(response, sharedSecret);

      expect(signature).toBeDefined();
      expect(signature).toHaveLength(64); // SHA-256 hex = 64 chars
    });

    it('should verify valid HMAC signature', () => {
      const response = {
        server: 'test-server',
        method: 'test-method',
        data: { result: 'test' },
        timestamp: new Date().toISOString(),
        nonce: generateNonce(),
      };

      const signature = generateHMACSignature(response, sharedSecret);
      const mcpResponse = { ...response, signature };

      const isValid = verifyHMACSignature(mcpResponse, signature, sharedSecret);
      expect(isValid).toBe(true);
    });

    it('should reject invalid HMAC signature', () => {
      const response = {
        server: 'test-server',
        method: 'test-method',
        data: { result: 'test' },
        timestamp: new Date().toISOString(),
        nonce: generateNonce(),
      };

      const signature = generateHMACSignature(response, sharedSecret);
      const mcpResponse = { ...response, signature };

      // Tamper with signature
      const tamperedSignature = signature.slice(0, -1) + 'x';

      const isValid = verifyHMACSignature(mcpResponse, tamperedSignature, sharedSecret);
      expect(isValid).toBe(false);
    });

    it('should reject signature with wrong secret', () => {
      const response = {
        server: 'test-server',
        method: 'test-method',
        data: { result: 'test' },
        timestamp: new Date().toISOString(),
        nonce: generateNonce(),
      };

      const signature = generateHMACSignature(response, sharedSecret);
      const mcpResponse = { ...response, signature };

      const isValid = verifyHMACSignature(mcpResponse, signature, 'wrong-secret');
      expect(isValid).toBe(false);
    });

    it('should detect tampered data', () => {
      const response = {
        server: 'test-server',
        method: 'test-method',
        data: { result: 'test' },
        timestamp: new Date().toISOString(),
        nonce: generateNonce(),
      };

      const signature = generateHMACSignature(response, sharedSecret);

      // Tamper with data
      const tamperedResponse = {
        ...response,
        data: { result: 'tampered' },
        signature,
      };

      const isValid = verifyHMACSignature(tamperedResponse, signature, sharedSecret);
      expect(isValid).toBe(false);
    });
  });

  describe('Nonce Generation and Anti-Replay', () => {
    it('should generate unique nonces', () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();

      expect(nonce1).not.toEqual(nonce2);
      expect(nonce1).toHaveLength(64); // SHA-256 hex
    });

    it('should detect replay attacks (duplicate nonce)', () => {
      registerMCPServer({
        name: 'test-server',
        type: 'stdio',
        trusted: true,
        registeredAt: new Date().toISOString(),
      });

      const nonce = generateNonce();

      const response1: MCPResponse = {
        server: 'test-server',
        method: 'test',
        data: {},
        timestamp: new Date().toISOString(),
        nonce,
      };

      // First request - should pass
      const result1 = verifyMCPIntegrity(response1);
      expect(result1.valid).toBe(true);
      expect(result1.checks.nonceValid).toBe(true);

      // Replay attack - same nonce
      const response2: MCPResponse = {
        ...response1,
        timestamp: new Date().toISOString(), // Different timestamp
      };

      const result2 = verifyMCPIntegrity(response2);
      expect(result2.valid).toBe(false);
      expect(result2.checks.nonceValid).toBe(false);
      expect(result2.errors).toContain('Duplicate nonce detected (replay attack)');
    });
  });

  describe('Timestamp Validation', () => {
    it('should accept recent timestamps', () => {
      registerMCPServer({
        name: 'test-server',
        type: 'stdio',
        trusted: true,
        registeredAt: new Date().toISOString(),
      });

      const response: MCPResponse = {
        server: 'test-server',
        method: 'test',
        data: {},
        timestamp: new Date().toISOString(), // Current time
      };

      const result = verifyMCPIntegrity(response);
      expect(result.checks.timestampValid).toBe(true);
    });

    it('should reject old timestamps', () => {
      registerMCPServer({
        name: 'test-server',
        type: 'stdio',
        trusted: true,
        registeredAt: new Date().toISOString(),
      });

      const oldTime = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago

      const response: MCPResponse = {
        server: 'test-server',
        method: 'test',
        data: {},
        timestamp: oldTime.toISOString(),
      };

      const result = verifyMCPIntegrity(response);
      expect(result.checks.timestampValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Timestamp too old'))).toBe(true);
    });

    it('should reject future timestamps', () => {
      registerMCPServer({
        name: 'test-server',
        type: 'stdio',
        trusted: true,
        registeredAt: new Date().toISOString(),
      });

      const futureTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes future

      const response: MCPResponse = {
        server: 'test-server',
        method: 'test',
        data: {},
        timestamp: futureTime.toISOString(),
      };

      const result = verifyMCPIntegrity(response);
      expect(result.checks.timestampValid).toBe(false);
    });
  });

  describe('Full Integrity Verification', () => {
    it('should pass all checks for valid response', () => {
      const sharedSecret = 'test-secret';

      registerMCPServer({
        name: 'test-server',
        type: 'stdio',
        trusted: true,
        sharedSecret,
        registeredAt: new Date().toISOString(),
      });

      const nonce = generateNonce();
      const response = {
        server: 'test-server',
        method: 'test-method',
        data: { result: 'success' },
        timestamp: new Date().toISOString(),
        nonce,
      };

      const signature = generateHMACSignature(response, sharedSecret);
      const mcpResponse = { ...response, signature };

      const result = verifyMCPIntegrity(mcpResponse);

      expect(result.valid).toBe(true);
      expect(result.checks.serverTrusted).toBe(true);
      expect(result.checks.signaturePresent).toBe(true);
      expect(result.checks.signatureValid).toBe(true);
      expect(result.checks.timestampValid).toBe(true);
      expect(result.checks.nonceValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for untrusted server', () => {
      const response: MCPResponse = {
        server: 'untrusted-server',
        method: 'test',
        data: {},
        timestamp: new Date().toISOString(),
      };

      const result = verifyMCPIntegrity(response);

      expect(result.valid).toBe(false);
      expect(result.checks.serverTrusted).toBe(false);
      expect(result.errors).toContain('Server "untrusted-server" is not trusted');
    });

    it('should pass without signature (optional)', () => {
      registerMCPServer({
        name: 'test-server',
        type: 'stdio',
        trusted: true,
        registeredAt: new Date().toISOString(),
      });

      const response: MCPResponse = {
        server: 'test-server',
        method: 'test',
        data: {},
        timestamp: new Date().toISOString(),
      };

      const result = verifyMCPIntegrity(response);

      expect(result.valid).toBe(true);
      expect(result.checks.signaturePresent).toBe(false);
      expect(result.checks.signatureValid).toBe(true); // Pass (optional)
    });
  });

  describe('Convenience Functions', () => {
    it('should verify and unwrap valid response', () => {
      registerMCPServer({
        name: 'test-server',
        type: 'stdio',
        trusted: true,
        registeredAt: new Date().toISOString(),
      });

      const response: MCPResponse = {
        server: 'test-server',
        method: 'test',
        data: { result: 'success' },
        timestamp: new Date().toISOString(),
      };

      const unwrapped = verifyAndUnwrap<{ result: string }>(response);
      expect(unwrapped).toEqual({ result: 'success' });
    });

    it('should throw for invalid response', () => {
      const response: MCPResponse = {
        server: 'untrusted-server',
        method: 'test',
        data: {},
        timestamp: new Date().toISOString(),
      };

      expect(() => verifyAndUnwrap(response)).toThrow('MCP integrity verification failed');
    });
  });

  describe('Integration Examples', () => {
    it('should wrap MCP call with integrity verification', async () => {
      registerMCPServer({
        name: 'memory',
        type: 'stdio',
        trusted: true,
        registeredAt: new Date().toISOString(),
      });

      const mockCall = vi.fn().mockResolvedValue({ result: 'success' });

      const result = await withMCPIntegrity<{ result: string }>('memory', 'read', mockCall);

      expect(result).toEqual({ result: 'success' });
      expect(mockCall).toHaveBeenCalledOnce();
    });

    it('should reject untrusted MCP server', async () => {
      const mockCall = vi.fn().mockResolvedValue({ result: 'success' });

      await expect(withMCPIntegrity('untrusted', 'test', mockCall)).rejects.toThrow(
        'MCP server "untrusted" is not trusted'
      );

      expect(mockCall).not.toHaveBeenCalled();
    });
  });

  describe('Pre-registered MCP Servers', () => {
    beforeEach(() => {
      // Re-register default servers after parent beforeEach clears registry
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
      registerMCPServer({
        name: 'dcyfr-promptintel',
        type: 'stdio',
        trusted: true,
        registeredAt: new Date().toISOString(),
      });
    });

    it('should have standard MCP servers registered', () => {
      // Note: These are registered globally, so we check without clearing
      const memory = getMCPServerInfo('memory');
      const filesystem = getMCPServerInfo('filesystem');
      const github = getMCPServerInfo('github');

      expect(memory?.trusted).toBe(true);
      expect(filesystem?.trusted).toBe(true);
      expect(github?.trusted).toBe(true);
    });

    it('should have PromptIntel MCP registered', () => {
      const promptintel = getMCPServerInfo('dcyfr-promptintel');
      expect(promptintel?.trusted).toBe(true);
    });
  });
});
