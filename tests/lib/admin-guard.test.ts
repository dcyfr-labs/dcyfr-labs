import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock next/navigation before imports
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

import { assertAdminOr404, assertFeatureOr404 } from '@/lib/admin-guard';

describe('assertAdminOr404', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not throw when ADMIN_DASHBOARD_ENABLED is true', () => {
    vi.stubEnv('ADMIN_DASHBOARD_ENABLED', 'true');
    expect(() => assertAdminOr404()).not.toThrow();
  });

  it('calls notFound when ADMIN_DASHBOARD_ENABLED is not true', () => {
    vi.stubEnv('ADMIN_DASHBOARD_ENABLED', 'false');
    expect(() => assertAdminOr404()).toThrow('NEXT_NOT_FOUND');
  });

  it('calls notFound when ADMIN_DASHBOARD_ENABLED is unset', () => {
    vi.stubEnv('ADMIN_DASHBOARD_ENABLED', '');
    expect(() => assertAdminOr404()).toThrow('NEXT_NOT_FOUND');
  });
});

describe('assertFeatureOr404', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not throw when env var is true', () => {
    vi.stubEnv('PLUGINS_ENABLED', 'true');
    expect(() => assertFeatureOr404('PLUGINS_ENABLED')).not.toThrow();
  });

  it('calls notFound when env var is false', () => {
    vi.stubEnv('PLUGINS_ENABLED', 'false');
    expect(() => assertFeatureOr404('PLUGINS_ENABLED')).toThrow('NEXT_NOT_FOUND');
  });

  it('calls notFound when env var is missing', () => {
    delete process.env.SOME_FLAG;
    expect(() => assertFeatureOr404('SOME_FLAG')).toThrow('NEXT_NOT_FOUND');
  });
});
