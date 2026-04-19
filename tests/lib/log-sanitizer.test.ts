import { describe, it, expect, vi } from 'vitest';
import { sanitizeForLog, safeLog } from '@/lib/utils/log-sanitizer';

describe('sanitizeForLog', () => {
  it('returns empty string for null/undefined', () => {
    expect(sanitizeForLog(null)).toBe('');
    expect(sanitizeForLog(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(sanitizeForLog('')).toBe('');
  });

  it('passes through normal text', () => {
    expect(sanitizeForLog('Hello world')).toBe('Hello world');
  });

  it('strips newlines (log injection prevention)', () => {
    expect(sanitizeForLog('line1\nline2')).toBe('line1line2');
    expect(sanitizeForLog('line1\r\nline2')).toBe('line1line2');
  });

  it('strips ANSI escape sequences', () => {
    expect(sanitizeForLog('\x1b[31mred\x1b[0m')).toBe('red');
  });

  it('strips null bytes and control characters', () => {
    expect(sanitizeForLog('hello\x00world')).toBe('helloworld');
    expect(sanitizeForLog('test\x1Fchar')).toBe('testchar');
  });

  it('strips Unicode line/paragraph separators', () => {
    expect(sanitizeForLog('line\u2028separator')).toBe('lineseparator');
    expect(sanitizeForLog('para\u2029separator')).toBe('paraseparator');
  });

  it('truncates to 200 characters', () => {
    const long = 'a'.repeat(300);
    expect(sanitizeForLog(long)).toHaveLength(200);
  });
});

describe('safeLog', () => {
  it('logs sanitized structured data', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    safeLog('info', 'Test message', {
      userInput: 'clean',
      count: 42,
      active: true,
      data: null,
      complex: { nested: true },
    });

    expect(spy).toHaveBeenCalledOnce();
    const logged = JSON.parse(spy.mock.calls[0][0] as string);
    expect(logged.level).toBe('info');
    expect(logged.message).toBe('Test message');
    expect(logged.userInput).toBe('clean');
    expect(logged.count).toBe(42);
    expect(logged.active).toBe(true);
    expect(logged.data).toBeNull();
    expect(logged.complex).toBe('[object]');
    expect(logged.timestamp).toBeDefined();
    spy.mockRestore();
  });

  it('sanitizes malicious string values', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    safeLog('warn', 'User input', {
      input: 'normal\n[CRITICAL] fake alert',
    });

    const logged = JSON.parse(spy.mock.calls[0][0] as string);
    expect(logged.input).toBe('normal[CRITICAL] fake alert');
    spy.mockRestore();
  });

  it('works without metadata', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    safeLog('error', 'Simple message');

    const logged = JSON.parse(spy.mock.calls[0][0] as string);
    expect(logged.level).toBe('error');
    expect(logged.message).toBe('Simple message');
    spy.mockRestore();
  });

  it('preserves undefined values in metadata', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    safeLog('info', 'Test', { value: undefined });

    const logged = JSON.parse(spy.mock.calls[0][0] as string);
    // undefined values don't appear in JSON.stringify
    expect(logged.value).toBeUndefined();
    spy.mockRestore();
  });
});
