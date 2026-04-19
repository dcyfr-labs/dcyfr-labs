import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('logger', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('logger.debug logs in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.resetModules();
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { logger } = await import('@/lib/logger');
    logger.debug('test message');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[DEBUG]'), expect.anything());
    spy.mockRestore();
  });

  it('logger.debug does not log in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.resetModules();
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { logger } = await import('@/lib/logger');
    logger.debug('should not appear');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('logger.info logs in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.resetModules();
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { logger } = await import('@/lib/logger');
    logger.info('event_name', { key: 'value' });
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('[INFO]'),
      expect.stringContaining('key')
    );
    spy.mockRestore();
  });

  it('logger.info does not log in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.resetModules();
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { logger } = await import('@/lib/logger');
    logger.info('event_name');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('logger.warn always logs', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.resetModules();
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { logger } = await import('@/lib/logger');
    logger.warn('warning message');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[WARN]'), expect.anything());
    spy.mockRestore();
  });

  it('logger.error always logs', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.resetModules();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { logger } = await import('@/lib/logger');
    logger.error('error message', new Error('test'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('logger.error sanitizes paths in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.resetModules();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { logger } = await import('@/lib/logger');
    logger.error('failed', new Error('Error at /home/user/secret/file.ts'));
    const call = spy.mock.calls[0];
    const errorMsg = call[1] as string;
    expect(errorMsg).not.toContain('/home/user');
    spy.mockRestore();
  });

  it('logger.error includes context', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.resetModules();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { logger } = await import('@/lib/logger');
    logger.error('err', undefined, { route: '/api/test' });
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR]'),
      expect.anything(),
      expect.stringContaining('route')
    );
    spy.mockRestore();
  });

  it('logger.log delegates to correct method', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.resetModules();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { logger } = await import('@/lib/logger');

    logger.log('warn', 'warning via log');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[WARN]'), expect.anything());

    logger.log('error', 'error via log');
    expect(errorSpy).toHaveBeenCalled();

    logger.log('debug', 'debug via log');
    logger.log('info', 'info via log');

    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('handles context with circular references gracefully', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.resetModules();
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { logger } = await import('@/lib/logger');
    const circular: any = {};
    circular.self = circular;
    // formatContext catches JSON.stringify error and falls back to String()
    logger.warn('circular', circular);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('handles empty context', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.resetModules();
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { logger } = await import('@/lib/logger');
    logger.warn('no context', {});
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[WARN]'), '');
    spy.mockRestore();
  });
});

describe('apiLogger', () => {
  it('request logs method and path', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.resetModules();
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { apiLogger } = await import('@/lib/logger');
    apiLogger.request('GET', '/api/test');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('success logs completion', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.resetModules();
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { apiLogger } = await import('@/lib/logger');
    apiLogger.success('POST', '/api/test', 150);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
