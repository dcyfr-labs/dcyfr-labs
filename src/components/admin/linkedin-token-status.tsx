'use client';

/**
 * LinkedIn Token Status Dashboard Component
 * 
 * Shows current token status, expiration dates, and provides manual refresh buttons.
 * Intended for admin use in development or internal tooling.
 */

import { useState, useEffect } from 'react';
import { SEMANTIC_COLORS, TYPOGRAPHY } from '@/lib/design-tokens';

interface TokenStatusProps {
  className?: string;
}

interface TokenStatus {
  openid: {
    valid: boolean;
    daysUntilExpiry?: number;
    expiresAt?: string;
  };
  posting: {
    valid: boolean;
    daysUntilExpiry?: number;
    expiresAt?: string;
  };
}

interface ReAuthInfo {
  openidRequired: boolean;
  postingRequired: boolean;
  urls: {
    openid: string;
    posting: string;
  };
}

export function LinkedInTokenStatus({ className }: TokenStatusProps) {
  const [tokenStatus, setTokenStatus] = useState<TokenStatus | null>(null);
  const [reAuthInfo, setReAuthInfo] = useState<ReAuthInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokenStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch token status
      const response = await fetch('/api/admin/linkedin/token-status', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_KEY}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setTokenStatus(data.tokenStatus);
      setReAuthInfo(data.reAuthInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch token status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenStatus();
  }, []);

  const formatDaysUntilExpiry = (days?: number) => {
    if (!days) return 'Unknown';
    if (days < 0) return 'Expired';
    if (days === 0) return 'Expires today';
    if (days === 1) return 'Expires tomorrow';
    return `${days} days`;
  };

  const getStatusColor = (valid: boolean, days?: number) => {
    if (!valid || (days !== undefined && days <= 0)) return SEMANTIC_COLORS.alert.critical.text;
    if (days !== undefined && days <= 7) return SEMANTIC_COLORS.alert.warning.text;
    if (days !== undefined && days <= 30) return SEMANTIC_COLORS.alert.info.text;
    return SEMANTIC_COLORS.alert.success.text;
  };

  const getStatusIcon = (valid: boolean, days?: number) => {
    if (!valid || (days !== undefined && days <= 0)) return '🔴';
    if (days !== undefined && days <= 7) return '🟡';
    if (days !== undefined && days <= 30) return '🔵';
    return '🟢';
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg ${className}`}>
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="ml-2 text-sm text-gray-600">Loading token status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg ${className}`}>
        <div className="text-center py-4">
          <div className={SEMANTIC_COLORS.alert.critical.text}>Failed to load token status</div>
          <div className="text-sm text-gray-500 mb-3">{error}</div>
          <button
            onClick={fetchTokenStatus}
            className={`px-4 py-2 ${SEMANTIC_COLORS.alert.info.container} ${SEMANTIC_COLORS.alert.info.text} rounded-md hover:opacity-90 transition-colors`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!tokenStatus) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg ${className}`}>
        <div className="text-center py-4 text-gray-500">
          No token status available
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={TYPOGRAPHY.h3.standard}>
          LinkedIn Token Status
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTokenStatus}
            disabled={loading}
            className={`text-sm ${SEMANTIC_COLORS.alert.info.text} hover:opacity-80 disabled:opacity-50`}
          >
            Refresh
          </button>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* OpenID Connect Token */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {getStatusIcon(tokenStatus.openid.valid, tokenStatus.openid.daysUntilExpiry)}
              </span>
              <h4 className="font-medium">OpenID Connect (Authentication)</h4>
            </div>
            <span className={`text-sm font-medium ${
              getStatusColor(tokenStatus.openid.valid, tokenStatus.openid.daysUntilExpiry)
            }`}>
              {tokenStatus.openid.valid ? 'Active' : 'Expired'}
            </span>
          </div>
          
          <div className="text-sm space-y-1">
            <div>Expires: {formatDaysUntilExpiry(tokenStatus.openid.daysUntilExpiry)}</div>
            {tokenStatus.openid.expiresAt && (
              <div style={{ color: '#6b7280' }}>
                ({new Date(tokenStatus.openid.expiresAt).toLocaleString()})
              </div>
            )}
            <div style={{ color: '#4b5563' }}>Used for: User profile, email access</div>
          </div>

          {reAuthInfo?.openidRequired && (
            <div className="mt-3 p-3 rounded border" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5' }}>
              <div style={{ color: '#991b1b' }} className={`${TYPOGRAPHY.label.small} mb-2`}>
                ⚠️ Re-authorization Required
              </div>
              <a 
                href={reAuthInfo.urls.openid}
                className="inline-flex items-center px-3 py-1 text-white text-sm rounded transition-colors"
                style={{ backgroundColor: '#dc2626' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Re-authorize OpenID →
              </a>
            </div>
          )}
        </div>

        {/* Posting Token */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {getStatusIcon(tokenStatus.posting.valid, tokenStatus.posting.daysUntilExpiry)}
              </span>
              <h4 className="font-medium">Community Management API (Posting)</h4>
            </div>
            <span className={`text-sm font-medium ${
              getStatusColor(tokenStatus.posting.valid, tokenStatus.posting.daysUntilExpiry)
            }`}>
              {tokenStatus.posting.valid ? 'Active' : 'Expired'}
            </span>
          </div>
          
          <div className="text-sm space-y-1">
            <div>Expires: {formatDaysUntilExpiry(tokenStatus.posting.daysUntilExpiry)}</div>
            {tokenStatus.posting.expiresAt && (
              <div style={{ color: '#6b7280' }}>
                ({new Date(tokenStatus.posting.expiresAt).toLocaleString()})
              </div>
            )}
            <div style={{ color: '#4b5563' }}>Used for: Content posting, social management</div>
          </div>

          {reAuthInfo?.postingRequired && (
            <div className="mt-3 p-3 rounded border" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5' }}>
              <div style={{ color: '#991b1b' }} className={`${TYPOGRAPHY.label.small} mb-2`}>
                ⚠️ Re-authorization Required
              </div>
              <a 
                href={reAuthInfo.urls.posting}
                className="inline-flex items-center px-3 py-1 text-white text-sm rounded transition-colors"
                style={{ backgroundColor: '#dc2626' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Re-authorize Posting →
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t text-xs text-gray-500">
        <div>🤖 Tokens are automatically monitored and refreshed when possible</div>
        <div>📧 You&apos;ll receive alerts before tokens expire</div>
        <div>🔄 Manual re-authorization only needed if automatic refresh fails</div>
      </div>
    </div>
  );
}