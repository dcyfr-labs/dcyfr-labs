/**
 * Referral Tracking Tests
 *
 * Tests for social media referral detection and tracking.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  detectReferralSource,
  getPlatformDisplayName,
  shouldTrackReferral,
  trackReferral,
  type ReferralSource,
} from '../referral-tracker';

describe('Referral Tracker', () => {
  describe('detectReferralSource', () => {
    it('should detect Twitter referral from referrer URL', () => {
      const result = detectReferralSource(
        'https://twitter.com/user/status/123',
        ''
      );

      expect(result).toEqual({
        platform: 'twitter',
        referrer: 'https://twitter.com/user/status/123',
      });
    });

    it('should detect Twitter/X referral from x.com domain', () => {
      const result = detectReferralSource(
        'https://x.com/user/status/123',
        ''
      );

      expect(result).toEqual({
        platform: 'twitter',
        referrer: 'https://x.com/user/status/123',
      });
    });

    it('should detect DEV referral', () => {
      const result = detectReferralSource(
        'https://dev.to/dcyfr/my-article',
        ''
      );

      expect(result).toEqual({
        platform: 'dev',
        referrer: 'https://dev.to/dcyfr/my-article',
      });
    });

    it('should detect LinkedIn referral', () => {
      const result = detectReferralSource(
        'https://www.linkedin.com/feed/',
        ''
      );

      expect(result).toEqual({
        platform: 'linkedin',
        referrer: 'https://www.linkedin.com/feed/',
      });
    });

    it('should detect Reddit referral', () => {
      const result = detectReferralSource(
        'https://www.reddit.com/r/programming/',
        ''
      );

      expect(result).toEqual({
        platform: 'reddit',
        referrer: 'https://www.reddit.com/r/programming/',
      });
    });

    it('should detect Hacker News referral', () => {
      const result = detectReferralSource(
        'https://news.ycombinator.com/item?id=123',
        ''
      );

      expect(result).toEqual({
        platform: 'hackernews',
        referrer: 'https://news.ycombinator.com/item?id=123',
      });
    });

    it('should detect GitHub referral', () => {
      const result = detectReferralSource(
        'https://github.com/dcyfr/repo',
        ''
      );

      expect(result).toEqual({
        platform: 'github',
        referrer: 'https://github.com/dcyfr/repo',
      });
    });

    it('should prioritize UTM source over referrer', () => {
      const result = detectReferralSource(
        'https://example.com',
        '?utm_source=twitter&utm_campaign=launch'
      );

      expect(result).toEqual({
        platform: 'twitter',
        referrer: 'https://example.com',
        utmSource: 'twitter',
        utmCampaign: 'launch',
      });
    });

    it('should handle UTM parameters with unknown source', () => {
      const result = detectReferralSource(
        'https://example.com',
        '?utm_source=newsletter&utm_medium=email'
      );

      expect(result).toEqual({
        platform: 'other',
        referrer: 'https://example.com',
        utmSource: 'newsletter',
        utmMedium: 'email',
      });
    });

    it('should return direct traffic when no referrer', () => {
      const result = detectReferralSource('', '');

      expect(result).toEqual({
        platform: 'direct',
        referrer: '',
      });
    });

    it('should return other for unknown referrer', () => {
      const result = detectReferralSource(
        'https://unknown-site.com',
        ''
      );

      expect(result).toEqual({
        platform: 'other',
        referrer: 'https://unknown-site.com',
      });
    });

    it('should handle invalid referrer URL', () => {
      const result = detectReferralSource('not-a-valid-url', '');

      expect(result).toBeNull();
    });

    it('should include all UTM parameters when present', () => {
      const result = detectReferralSource(
        'https://example.com',
        '?utm_source=twitter&utm_medium=social&utm_campaign=launch&utm_content=post1'
      );

      expect(result).toEqual({
        platform: 'twitter',
        referrer: 'https://example.com',
        utmSource: 'twitter',
        utmMedium: 'social',
        utmCampaign: 'launch',
        utmContent: 'post1',
      });
    });
  });

  describe('getPlatformDisplayName', () => {
    it('should return correct display names', () => {
      expect(getPlatformDisplayName('twitter')).toBe('Twitter/X');
      expect(getPlatformDisplayName('dev')).toBe('DEV');
      expect(getPlatformDisplayName('linkedin')).toBe('LinkedIn');
      expect(getPlatformDisplayName('reddit')).toBe('Reddit');
      expect(getPlatformDisplayName('hackernews')).toBe('Hacker News');
      expect(getPlatformDisplayName('github')).toBe('GitHub');
      expect(getPlatformDisplayName('direct')).toBe('Direct');
      expect(getPlatformDisplayName('other')).toBe('Other');
    });
  });

  describe('shouldTrackReferral', () => {
    let originalWindow: any;
    let originalNavigator: any;

    beforeEach(() => {
      originalWindow = global.window;
      originalNavigator = global.navigator;

      // Mock window and navigator
      global.window = {
        doNotTrack: '0',
      } as any;

      global.navigator = {
        doNotTrack: '0',
      } as any;

      // Mock localStorage
      const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      global.localStorage = localStorageMock as any;
    });

    afterEach(() => {
      global.window = originalWindow;
      global.navigator = originalNavigator;
    });

    it('should return true when tracking is allowed', () => {
      expect(shouldTrackReferral()).toBe(true);
    });

    it('should return false when Do Not Track is enabled (navigator)', () => {
      global.navigator = {
        doNotTrack: '1',
      } as any;

      expect(shouldTrackReferral()).toBe(false);
    });

    it('should return false when Do Not Track is enabled (window)', () => {
      global.window = {
        doNotTrack: '1',
      } as any;

      expect(shouldTrackReferral()).toBe(false);
    });

    it('should return false when analytics is disabled in localStorage', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('true');

      expect(shouldTrackReferral()).toBe(false);
    });

    it('should return true when localStorage throws error', () => {
      vi.mocked(localStorage.getItem).mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      expect(shouldTrackReferral()).toBe(true);
    });
  });

  describe('trackReferral', () => {
    beforeEach(() => {
      // Mock fetch
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should track referral successfully', async () => {
      const mockSource: ReferralSource = {
        platform: 'twitter',
        referrer: 'https://twitter.com/test',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = await trackReferral('post-123', 'session-abc', mockSource);

      expect(result).toEqual({ success: true });
      expect(fetch).toHaveBeenCalledWith('/api/analytics/referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: 'post-123',
          sessionId: 'session-abc',
          platform: 'twitter',
          referrer: 'https://twitter.com/test',
        }),
      });
    });

    it('should return error when no referral source detected', async () => {
      const result = await trackReferral('post-123', 'session-abc', null);

      expect(result).toEqual({
        success: false,
        error: 'No referral source detected',
      });
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should skip tracking for direct traffic', async () => {
      const mockSource: ReferralSource = {
        platform: 'direct',
        referrer: '',
      };

      const result = await trackReferral('post-123', 'session-abc', mockSource);

      expect(result).toEqual({ success: true });
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle API error response', async () => {
      const mockSource: ReferralSource = {
        platform: 'twitter',
        referrer: 'https://twitter.com/test',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request',
      } as Response);

      const result = await trackReferral('post-123', 'session-abc', mockSource);

      expect(result).toEqual({
        success: false,
        error: 'API error: 400',
      });
    });

    it('should handle network error', async () => {
      const mockSource: ReferralSource = {
        platform: 'twitter',
        referrer: 'https://twitter.com/test',
      };

      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await trackReferral('post-123', 'session-abc', mockSource);

      expect(result).toEqual({
        success: false,
        error: 'Network error',
      });
    });

    it('should include UTM parameters when tracking', async () => {
      const mockSource: ReferralSource = {
        platform: 'twitter',
        referrer: 'https://example.com',
        utmSource: 'twitter',
        utmCampaign: 'launch',
        utmMedium: 'social',
        utmContent: 'post1',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await trackReferral('post-123', 'session-abc', mockSource);

      expect(fetch).toHaveBeenCalledWith('/api/analytics/referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: 'post-123',
          sessionId: 'session-abc',
          platform: 'twitter',
          referrer: 'https://example.com',
          utmSource: 'twitter',
          utmCampaign: 'launch',
          utmMedium: 'social',
          utmContent: 'post1',
        }),
      });
    });
  });
});
