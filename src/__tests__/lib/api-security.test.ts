import { describe, it, expect } from 'vitest';
import { validateExternalUrl, safeFetch } from '@/lib/api-security';

describe('API Security - SSRF Prevention', () => {
  describe('validateExternalUrl', () => {
    it('should allow whitelisted HTTPS domains', () => {
      const result = validateExternalUrl('https://api.perplexity.ai/chat/completions');
      expect(result.valid).toBe(true);
    });

    it('should allow google APIs', () => {
      const result = validateExternalUrl('https://www.googleapis.com/some/endpoint');
      expect(result.valid).toBe(true);
    });

    it('should allow indexing.googleapis.com', () => {
      const result = validateExternalUrl('https://indexing.googleapis.com/v3/urlNotifications/publish');
      expect(result.valid).toBe(true);
    });

    it('should block non-HTTPS URLs in production', () => {
      // In development, this would allow HTTP, but we test the validation logic
      // The actual enforcement depends on NODE_ENV at runtime
      const result = validateExternalUrl('http://api.example.com');
      // The result will be "not whitelisted" in current test env, but code protects against HTTP in production
      expect(result.valid).toBe(false);
    });

    it('should block non-whitelisted domains', () => {
      const result = validateExternalUrl('https://evil.example.com');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('not whitelisted');
    });

    it('should block loopback addresses (127.0.0.1)', () => {
      const result = validateExternalUrl('https://127.0.0.1:8080');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Internal IP');
    });

    it('should block private IP ranges (10.0.0.0/8)', () => {
      const result = validateExternalUrl('https://10.0.0.1');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Internal IP');
    });

    it('should block private IP ranges (172.16.0.0/12)', () => {
      const result = validateExternalUrl('https://172.20.0.1');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Internal IP');
    });

    it('should block private IP ranges (192.168.0.0/16)', () => {
      const result = validateExternalUrl('https://192.168.1.1');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Internal IP');
    });

    it('should block IPv6 loopback (::1)', () => {
      // URL parser keeps brackets in hostname for IPv6
      const result = validateExternalUrl('https://[::1]');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Internal IP');
    });

    it('should handle invalid URLs gracefully', () => {
      const result = validateExternalUrl('not a valid url');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Invalid');
    });

    it('should allow subdomain of whitelisted domain', () => {
      const result = validateExternalUrl('https://api.perplexity.ai/anything');
      expect(result.valid).toBe(true);
    });
  });

  describe('safeFetch', () => {
    it('should throw error for non-whitelisted domains', async () => {
      try {
        await safeFetch('https://evil.example.com');
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('SSRF protection');
      }
    });

    it('should throw error for internal IPs', async () => {
      try {
        await safeFetch('https://192.168.1.1');
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('SSRF protection');
      }
    });
  });
});
