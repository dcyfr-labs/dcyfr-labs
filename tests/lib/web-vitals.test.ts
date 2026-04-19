import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('web-vitals', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('WEB_VITALS_THRESHOLDS', () => {
    it('defines expected metrics', async () => {
      const { WEB_VITALS_THRESHOLDS } = await import('@/lib/web-vitals');
      expect(WEB_VITALS_THRESHOLDS.LCP.good).toBe(2500);
      expect(WEB_VITALS_THRESHOLDS.LCP.needsImprovement).toBe(4000);
      expect(WEB_VITALS_THRESHOLDS.INP.good).toBe(200);
      expect(WEB_VITALS_THRESHOLDS.INP.needsImprovement).toBe(500);
      expect(WEB_VITALS_THRESHOLDS.FCP.good).toBe(1800);
      expect(WEB_VITALS_THRESHOLDS.CLS.good).toBe(0.1);
      expect(WEB_VITALS_THRESHOLDS.CLS.needsImprovement).toBe(0.25);
      expect(WEB_VITALS_THRESHOLDS.TTFB.good).toBe(800);
    });
  });

  describe('getMetricRating', () => {
    it('returns "good" for values within good threshold', async () => {
      const { getMetricRating } = await import('@/lib/web-vitals');
      expect(getMetricRating('LCP', 2000)).toBe('good');
      expect(getMetricRating('LCP', 2500)).toBe('good');
      expect(getMetricRating('INP', 100)).toBe('good');
      expect(getMetricRating('CLS', 0.05)).toBe('good');
    });

    it('returns "needs-improvement" for moderate values', async () => {
      const { getMetricRating } = await import('@/lib/web-vitals');
      expect(getMetricRating('LCP', 3000)).toBe('needs-improvement');
      expect(getMetricRating('LCP', 4000)).toBe('needs-improvement');
      expect(getMetricRating('INP', 300)).toBe('needs-improvement');
      expect(getMetricRating('CLS', 0.15)).toBe('needs-improvement');
    });

    it('returns "poor" for values exceeding thresholds', async () => {
      const { getMetricRating } = await import('@/lib/web-vitals');
      expect(getMetricRating('LCP', 5000)).toBe('poor');
      expect(getMetricRating('INP', 600)).toBe('poor');
      expect(getMetricRating('CLS', 0.3)).toBe('poor');
    });

    it('returns "good" for unknown metrics', async () => {
      const { getMetricRating } = await import('@/lib/web-vitals');
      expect(getMetricRating('UNKNOWN', 99999)).toBe('good');
    });

    it('rates FCP correctly', async () => {
      const { getMetricRating } = await import('@/lib/web-vitals');
      expect(getMetricRating('FCP', 1500)).toBe('good');
      expect(getMetricRating('FCP', 2500)).toBe('needs-improvement');
      expect(getMetricRating('FCP', 4000)).toBe('poor');
    });

    it('rates TTFB correctly', async () => {
      const { getMetricRating } = await import('@/lib/web-vitals');
      expect(getMetricRating('TTFB', 500)).toBe('good');
      expect(getMetricRating('TTFB', 1000)).toBe('needs-improvement');
      expect(getMetricRating('TTFB', 2000)).toBe('poor');
    });
  });

  describe('getMetricDescription', () => {
    it('returns description for known metrics', async () => {
      const { getMetricDescription } = await import('@/lib/web-vitals');
      expect(getMetricDescription('LCP')).toContain('Largest Contentful Paint');
      expect(getMetricDescription('INP')).toContain('Interaction to Next Paint');
      expect(getMetricDescription('FCP')).toContain('First Contentful Paint');
      expect(getMetricDescription('CLS')).toContain('Cumulative Layout Shift');
      expect(getMetricDescription('TTFB')).toContain('Time to First Byte');
    });

    it('returns the name for unknown metrics', async () => {
      const { getMetricDescription } = await import('@/lib/web-vitals');
      expect(getMetricDescription('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('formatMetricValue', () => {
    it('formats CLS with 3 decimal places', async () => {
      const { formatMetricValue } = await import('@/lib/web-vitals');
      expect(formatMetricValue('CLS', 0.1234)).toBe('0.123');
      expect(formatMetricValue('CLS', 0)).toBe('0.000');
    });

    it('formats other metrics as milliseconds', async () => {
      const { formatMetricValue } = await import('@/lib/web-vitals');
      expect(formatMetricValue('LCP', 2500)).toBe('2500ms');
      expect(formatMetricValue('INP', 150.7)).toBe('151ms');
      expect(formatMetricValue('TTFB', 800)).toBe('800ms');
    });
  });

  describe('reportWebVitals', () => {
    it('logs in non-production without explicit enable', async () => {
      vi.stubEnv('NODE_ENV', 'test');
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { reportWebVitals } = await import('@/lib/web-vitals');
      reportWebVitals({
        name: 'LCP',
        value: 2500,
        rating: 'good',
        id: 'v1-123',
        delta: 0,
        entries: [],
        navigationType: 'navigate',
      } as any);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
