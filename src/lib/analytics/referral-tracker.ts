/**
 * Referral Tracking System
 *
 * Detects social media referrals and tracks them for analytics.
 * Supports multiple platforms including Twitter/X, DEV, LinkedIn, Reddit, Hacker News, and GitHub.
 *
 * @example
 * ```typescript
 * const referral = detectReferralSource();
 * if (referral) {
 *   await trackReferral(postId, sessionId);
 * }
 * ```
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ReferralSource {
  /** Social media platform or traffic source */
  platform: 'twitter' | 'dev' | 'linkedin' | 'reddit' | 'hackernews' | 'github' | 'direct' | 'other';
  /** Full referrer URL */
  referrer: string;
  /** UTM source parameter (if present) */
  utmSource?: string;
  /** UTM medium parameter (if present) */
  utmMedium?: string;
  /** UTM campaign parameter (if present) */
  utmCampaign?: string;
  /** UTM content parameter (if present) */
  utmContent?: string;
}

export interface ReferralTrackingResult {
  success: boolean;
  error?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Social media platform domain mappings
 * Used to identify traffic sources from referrer URLs
 */
const SOCIAL_DOMAINS = {
  twitter: ['twitter.com', 't.co', 'x.com'],
  dev: ['dev.to'],
  linkedin: ['linkedin.com', 'lnkd.in'],
  reddit: ['reddit.com', 'redd.it'],
  hackernews: ['news.ycombinator.com'],
  github: ['github.com'],
} as const;

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Detect the referral source from document.referrer and UTM parameters
 *
 * @param referrer - The referrer URL (defaults to document.referrer)
 * @param searchParams - URL search parameters (defaults to window.location.search)
 * @returns ReferralSource object or null if no referral detected
 *
 * @example
 * ```typescript
 * // Automatic detection
 * const source = detectReferralSource();
 *
 * // Manual detection
 * const source = detectReferralSource('https://twitter.com/post/123', '?utm_source=twitter');
 * ```
 */
export function detectReferralSource(
  referrer: string = typeof document !== 'undefined' ? document.referrer : '',
  searchParams: string = typeof window !== 'undefined' ? window.location.search : ''
): ReferralSource | null {
  // Check UTM parameters first (higher priority)
  const urlParams = new URLSearchParams(searchParams);
  const utmSource = urlParams.get('utm_source');
  const utmMedium = urlParams.get('utm_medium');
  const utmCampaign = urlParams.get('utm_campaign');
  const utmContent = urlParams.get('utm_content');

  if (utmSource) {
    // Try to match UTM source to known platforms
    const normalizedUtmSource = utmSource.toLowerCase();
    const platform = Object.keys(SOCIAL_DOMAINS).find(
      p => normalizedUtmSource.includes(p)
    ) as ReferralSource['platform'];

    return {
      platform: platform || 'other',
      referrer,
      utmSource,
      utmMedium: utmMedium || undefined,
      utmCampaign: utmCampaign || undefined,
      utmContent: utmContent || undefined,
    };
  }

  // No referrer means direct traffic
  if (!referrer) {
    return {
      platform: 'direct',
      referrer: '',
    };
  }

  // Parse referrer URL
  try {
    const url = new URL(referrer);
    const hostname = url.hostname.replace('www.', '');

    // Check against known social media domains
    for (const [platform, domains] of Object.entries(SOCIAL_DOMAINS)) {
      if (domains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`))) {
        return {
          platform: platform as ReferralSource['platform'],
          referrer,
        };
      }
    }

    // Referrer exists but not from known social platforms
    return {
      platform: 'other',
      referrer,
    };
  } catch (error) {
    console.error('[Referral Tracker] Failed to parse referrer:', error);
    return null;
  }
}

/**
 * Track a referral event in the analytics system
 *
 * @param postId - The ID of the blog post being visited
 * @param sessionId - The user's session ID
 * @param source - Optional: manually provide referral source (defaults to auto-detection)
 * @returns Promise with tracking result
 *
 * @example
 * ```typescript
 * // Automatic detection
 * await trackReferral('post-123', 'session-abc');
 *
 * // Manual source
 * const source = detectReferralSource();
 * await trackReferral('post-123', 'session-abc', source);
 * ```
 */
export async function trackReferral(
  postId: string,
  sessionId: string,
  source?: ReferralSource | null
): Promise<ReferralTrackingResult> {
  // Auto-detect if not provided
  const referralSource = source !== undefined ? source : detectReferralSource();

  if (!referralSource) {
    return {
      success: false,
      error: 'No referral source detected',
    };
  }

  // Don't track direct traffic
  if (referralSource.platform === 'direct') {
    return {
      success: true,
    };
  }

  try {
    const response = await fetch('/api/analytics/referral', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId,
        sessionId,
        ...referralSource,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Referral Tracker] API error:', error);
      return {
        success: false,
        error: `API error: ${response.status}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('[Referral Tracker] Network error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Get the platform name for display purposes
 *
 * @param platform - The platform identifier
 * @returns Human-readable platform name
 *
 * @example
 * ```typescript
 * getPlatformDisplayName('twitter') // Returns "Twitter/X"
 * getPlatformDisplayName('dev') // Returns "DEV"
 * ```
 */
export function getPlatformDisplayName(platform: ReferralSource['platform']): string {
  const displayNames: Record<ReferralSource['platform'], string> = {
    twitter: 'Twitter/X',
    dev: 'DEV',
    linkedin: 'LinkedIn',
    reddit: 'Reddit',
    hackernews: 'Hacker News',
    github: 'GitHub',
    direct: 'Direct',
    other: 'Other',
  };

  return displayNames[platform];
}

/**
 * Check if referral tracking is enabled
 * Respects user privacy settings and Do Not Track
 *
 * @returns true if tracking should proceed
 *
 * @example
 * ```typescript
 * if (shouldTrackReferral()) {
 *   await trackReferral(postId, sessionId);
 * }
 * ```
 */
export function shouldTrackReferral(): boolean {
  // Check if running in browser
  if (typeof window === 'undefined') {
    return false;
  }

  // Respect Do Not Track
  if (navigator.doNotTrack === '1' || (window as any).doNotTrack === '1') {
    return false;
  }

  // Check if analytics are disabled in localStorage
  try {
    const analyticsDisabled = localStorage.getItem('analytics-disabled');
    if (analyticsDisabled === 'true') {
      return false;
    }
  } catch {
    // localStorage might not be available
  }

  return true;
}
