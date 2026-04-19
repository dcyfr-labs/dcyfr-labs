import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  addBreadcrumb: vi.fn(),
}));

import {
  isConnectionError,
  handleApiError,
  withErrorHandling,
  isResponseWritable,
  ErrorSeverity,
  getErrorSeverity,
} from '@/lib/error-handler';

describe('error-handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isConnectionError', () => {
    it('returns false for null/undefined', () => {
      expect(isConnectionError(null)).toBe(false);
      expect(isConnectionError(undefined)).toBe(false);
    });

    it('returns false for non-objects', () => {
      expect(isConnectionError('string')).toBe(false);
      expect(isConnectionError(42)).toBe(false);
    });

    it('detects EPIPE error code', () => {
      const err = Object.assign(new Error('write failed'), { code: 'EPIPE' });
      expect(isConnectionError(err)).toBe(true);
    });

    it('detects ECONNRESET error code', () => {
      const err = Object.assign(new Error('reset'), { code: 'ECONNRESET' });
      expect(isConnectionError(err)).toBe(true);
    });

    it('detects ECONNABORTED error code', () => {
      const err = Object.assign(new Error('abort'), { code: 'ECONNABORTED' });
      expect(isConnectionError(err)).toBe(true);
    });

    it('detects ECANCELED error code', () => {
      const err = Object.assign(new Error('canceled'), { code: 'ECANCELED' });
      expect(isConnectionError(err)).toBe(true);
    });

    it('detects "aborted" in message', () => {
      expect(isConnectionError(new Error('request aborted'))).toBe(true);
    });

    it('detects "socket hang up" in message', () => {
      expect(isConnectionError(new Error('socket hang up'))).toBe(true);
    });

    it('detects "connection reset" in message', () => {
      expect(isConnectionError(new Error('connection reset by peer'))).toBe(true);
    });

    it('detects "connection closed" in message', () => {
      expect(isConnectionError(new Error('connection closed'))).toBe(true);
    });

    it('detects "client disconnected" in message', () => {
      expect(isConnectionError(new Error('client disconnected'))).toBe(true);
    });

    it('returns false for regular errors', () => {
      expect(isConnectionError(new Error('Something went wrong'))).toBe(false);
    });

    it('returns false for object without code or message', () => {
      expect(isConnectionError({ foo: 'bar' })).toBe(false);
    });
  });

  describe('handleApiError', () => {
    it('returns connection error response for EPIPE', () => {
      const err = Object.assign(new Error('broken pipe'), { code: 'EPIPE' });
      const result = handleApiError(err);
      expect(result.isConnectionError).toBe(true);
      expect(result.shouldRetry).toBe(false);
      expect(result.statusCode).toBe(499);
      expect(result.logLevel).toBe('debug');
    });

    it('returns 500 for regular errors', () => {
      const result = handleApiError(new Error('db failed'));
      expect(result.isConnectionError).toBe(false);
      expect(result.shouldRetry).toBe(true);
      expect(result.statusCode).toBe(500);
      expect(result.logLevel).toBe('error');
      expect(result.message).toBe('Internal server error');
    });

    it('includes route in log when context provided', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      handleApiError(new Error('fail'), { route: '/api/test', method: 'POST' });
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('handles non-Error objects', () => {
      const result = handleApiError('string error');
      expect(result.statusCode).toBe(500);
    });
  });

  describe('withErrorHandling', () => {
    it('passes through successful responses', async () => {
      const handler = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));
      const wrapped = withErrorHandling(handler, { route: '/api/test' });
      const response = await wrapped();
      expect(response.status).toBe(200);
    });

    it('returns 500 for thrown errors', async () => {
      const handler = vi.fn().mockRejectedValue(new Error('boom'));
      const wrapped = withErrorHandling(handler, { route: '/api/test' });
      const response = await wrapped();
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.code).toBe('INTERNAL_ERROR');
    });

    it('returns 499 for connection errors', async () => {
      const err = Object.assign(new Error('broken pipe'), { code: 'EPIPE' });
      const handler = vi.fn().mockRejectedValue(err);
      const wrapped = withErrorHandling(handler);
      const response = await wrapped();
      expect(response.status).toBe(499);
    });
  });

  describe('isResponseWritable', () => {
    it('always returns true', () => {
      expect(isResponseWritable()).toBe(true);
      expect(isResponseWritable(new Response())).toBe(true);
    });
  });

  describe('ErrorSeverity', () => {
    it('has expected values', () => {
      expect(ErrorSeverity.DEBUG).toBe('debug');
      expect(ErrorSeverity.INFO).toBe('info');
      expect(ErrorSeverity.WARNING).toBe('warning');
      expect(ErrorSeverity.ERROR).toBe('error');
      expect(ErrorSeverity.CRITICAL).toBe('critical');
    });
  });

  describe('getErrorSeverity', () => {
    it('returns DEBUG for connection errors', () => {
      const err = Object.assign(new Error('pipe'), { code: 'EPIPE' });
      expect(getErrorSeverity(err)).toBe(ErrorSeverity.DEBUG);
    });

    it('returns INFO for rate limit errors', () => {
      expect(getErrorSeverity(new Error('rate limit exceeded'))).toBe(ErrorSeverity.INFO);
    });

    it('returns INFO for too many requests', () => {
      expect(getErrorSeverity(new Error('too many requests'))).toBe(ErrorSeverity.INFO);
    });

    it('returns INFO for validation errors', () => {
      expect(getErrorSeverity(new Error('validation failed'))).toBe(ErrorSeverity.INFO);
    });

    it('returns INFO for invalid input', () => {
      expect(getErrorSeverity(new Error('invalid input'))).toBe(ErrorSeverity.INFO);
    });

    it('returns WARNING for timeout errors', () => {
      expect(getErrorSeverity(new Error('request timeout'))).toBe(ErrorSeverity.WARNING);
    });

    it('returns WARNING for timed out', () => {
      expect(getErrorSeverity(new Error('connection timed out'))).toBe(ErrorSeverity.WARNING);
    });

    it('returns ERROR for database errors', () => {
      expect(getErrorSeverity(new Error('database connection lost'))).toBe(ErrorSeverity.ERROR);
    });

    it('returns ERROR for redis errors', () => {
      expect(getErrorSeverity(new Error('redis error'))).toBe(ErrorSeverity.ERROR);
    });

    it('returns ERROR for unknown errors', () => {
      expect(getErrorSeverity(new Error('something unexpected'))).toBe(ErrorSeverity.ERROR);
    });
  });
});
