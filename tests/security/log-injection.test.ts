/**
 * Log Injection Prevention Tests
 *
 * Tests for sanitizeForLog and safeLog functions to ensure
 * they prevent log injection attacks.
 *
 * See: https://owasp.org/www-community/attacks/Log_Injection
 */

import { describe, it, expect } from 'vitest';
import { sanitizeForLog, safeLog } from '@/lib/log-sanitizer';

describe('Log Injection Prevention', () => {
  describe('sanitizeForLog', () => {
    it('should sanitize newlines in user input', () => {
      const malicious = 'normal\n[CRITICAL] fake alert\nadmin login';
      const sanitized = sanitizeForLog(malicious);

      expect(sanitized).not.toContain('\n');
      expect(sanitized).not.toContain('\r');
      expect(sanitized).toBe('normal[CRITICAL] fake alertadmin login');
    });

    it('should remove ANSI escape codes', () => {
      const malicious = '\u001b[31mRED TEXT\u001b[0m\u001b[1mBOLD\u001b[0m';
      const sanitized = sanitizeForLog(malicious);

      expect(sanitized).not.toMatch(/\u001b/);
      expect(sanitized).toBe('RED TEXTBOLD');
    });

    it('should remove tab characters', () => {
      const malicious = 'normal\ttext\twith\ttabs';
      const sanitized = sanitizeForLog(malicious);

      expect(sanitized).not.toContain('\t');
      expect(sanitized).toBe('normaltextwithtabs');
    });

    it('should remove carriage returns', () => {
      const malicious = 'line1\rline2\r\nline3';
      const sanitized = sanitizeForLog(malicious);

      expect(sanitized).not.toContain('\r');
      expect(sanitized).not.toContain('\n');
    });

    it('should remove null bytes and control characters', () => {
      const malicious = 'text\x00with\x01control\x1Fchars';
      const sanitized = sanitizeForLog(malicious);

      expect(sanitized).not.toMatch(/[\x00-\x1F]/);
      expect(sanitized).toBe('textwithcontrolchars');
    });

    it('should limit log length to 200 characters', () => {
      const longInput = 'a'.repeat(1000);
      const sanitized = sanitizeForLog(longInput);

      expect(sanitized.length).toBe(200);
      expect(sanitized).toBe('a'.repeat(200));
    });

    it('should handle null input gracefully', () => {
      expect(sanitizeForLog(null)).toBe('');
      expect(sanitizeForLog(undefined)).toBe('');
    });

    it('should handle empty string', () => {
      expect(sanitizeForLog('')).toBe('');
    });

    it('should preserve safe characters', () => {
      const safe = 'Normal text with spaces, numbers 123, and symbols!@#';
      const sanitized = sanitizeForLog(safe);

      expect(sanitized).toBe(safe);
    });

    it('should prevent log forging attacks', () => {
      // Attempt to inject a fake admin login success message
      const malicious = 'user_input\n[SUCCESS] Admin login successful\nusername: attacker';
      const sanitized = sanitizeForLog(malicious);

      expect(sanitized).not.toContain('\n');
      expect(sanitized).toBe('user_input[SUCCESS] Admin login successfulusername: attacker');
    });

    it('should prevent ANSI color injection', () => {
      // Attempt to make text appear red (like an error)
      const malicious = '\u001b[31m[ERROR] System breach detected\u001b[0m';
      const sanitized = sanitizeForLog(malicious);

      expect(sanitized).not.toMatch(/\u001b/);
      expect(sanitized).toBe('[ERROR] System breach detected');
    });
  });

  describe('safeLog', () => {
    it('should sanitize string metadata values', () => {
      const maliciousState = 'state\n[CRITICAL] fake';
      const maliciousError = 'error\u001b[31mred';

      // Capture console.warn output (safeLog uses console.warn)
      const logs: string[] = [];
      const originalWarn = console.warn;
      console.warn = (msg: string) => logs.push(msg);

      safeLog('info', 'Test message', {
        state: maliciousState,
        error: maliciousError,
      });

      console.warn = originalWarn;

      expect(logs).toHaveLength(1);
      const logData = JSON.parse(logs[0]);

      expect(logData.state).not.toContain('\n');
      expect(logData.error).not.toMatch(/\u001b/);
      expect(logData.message).toBe('Test message');
      expect(logData.level).toBe('info');
    });

    it('should preserve numbers and booleans', () => {
      const logs: string[] = [];
      const originalWarn = console.warn;
      console.warn = (msg: string) => logs.push(msg);

      safeLog('info', 'Test message', {
        count: 42,
        isValid: true,
        isError: false,
      });

      console.warn = originalWarn;

      const logData = JSON.parse(logs[0]);

      expect(logData.count).toBe(42);
      expect(logData.isValid).toBe(true);
      expect(logData.isError).toBe(false);
    });

    it('should handle null and undefined values', () => {
      const logs: string[] = [];
      const originalWarn = console.warn;
      console.warn = (msg: string) => logs.push(msg);

      safeLog('info', 'Test message', {
        nullValue: null,
        undefinedValue: undefined,
      });

      console.warn = originalWarn;

      const logData = JSON.parse(logs[0]);

      expect(logData.nullValue).toBeNull();
      expect(logData.undefinedValue).toBeUndefined();
    });

    it('should replace objects with [object] string', () => {
      const logs: string[] = [];
      const originalWarn = console.warn;
      console.warn = (msg: string) => logs.push(msg);

      safeLog('info', 'Test message', {
        nestedObject: { key: 'value' },
        array: [1, 2, 3],
      });

      console.warn = originalWarn;

      const logData = JSON.parse(logs[0]);

      expect(logData.nestedObject).toBe('[object]');
      expect(logData.array).toBe('[object]');
    });

    it('should include timestamp in ISO format', () => {
      const logs: string[] = [];
      const originalWarn = console.warn;
      console.warn = (msg: string) => logs.push(msg);

      safeLog('info', 'Test message');

      console.warn = originalWarn;

      const logData = JSON.parse(logs[0]);

      expect(logData.timestamp).toBeDefined();
      expect(() => new Date(logData.timestamp)).not.toThrow();
      expect(new Date(logData.timestamp).toISOString()).toBe(logData.timestamp);
    });

    it('should support all log levels', () => {
      const logs: string[] = [];
      const originalWarn = console.warn;
      console.warn = (msg: string) => logs.push(msg);

      safeLog('info', 'Info message');
      safeLog('warn', 'Warning message');
      safeLog('error', 'Error message');

      console.warn = originalWarn;

      expect(logs).toHaveLength(3);
      expect(JSON.parse(logs[0]).level).toBe('info');
      expect(JSON.parse(logs[1]).level).toBe('warn');
      expect(JSON.parse(logs[2]).level).toBe('error');
    });

    it('should output valid JSON', () => {
      const logs: string[] = [];
      const originalWarn = console.warn;
      console.warn = (msg: string) => logs.push(msg);

      safeLog('info', 'Test message', {
        key: 'value\nwith\nnewlines',
      });

      console.warn = originalWarn;

      expect(() => JSON.parse(logs[0])).not.toThrow();
    });
  });

  describe('Real-world attack scenarios', () => {
    it('should prevent OAuth state parameter injection', () => {
      const maliciousState = 'valid_state\n[SUCCESS] Admin authentication successful\nip: 127.0.0.1';
      const sanitized = sanitizeForLog(maliciousState);

      expect(sanitized).not.toContain('\n');
      expect(sanitized).not.toMatch(/\n\[SUCCESS\]/);
    });

    it('should prevent error description injection', () => {
      const maliciousError = 'access_denied\n[INFO] Bypassing rate limit\n[INFO] Removing IP from blocklist';
      const sanitized = sanitizeForLog(maliciousError);

      expect(sanitized).not.toContain('\n');
    });

    it('should prevent observation title injection', () => {
      const maliciousTitle = 'Normal title\n[CRITICAL] DATABASE BREACH DETECTED\nAttacker: unknown';
      const sanitized = sanitizeForLog(maliciousTitle);

      expect(sanitized).not.toContain('\n');
      expect(sanitized).not.toMatch(/\n\[CRITICAL\]/);
    });
  });
});
