import { inngest } from '@/inngest/client';
import { createClient } from 'redis';

// Initialize Redis client with connection management
let redis: ReturnType<typeof createClient> | null = null;

async function getRedisClient() {
  if (!process.env.REDIS_URL) {
    return null;
  }
  
  if (!redis) {
    redis = createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 10000,
        reconnectStrategy: (retries) => {
          if (retries > 3) return false;
          return Math.min(retries * 100, 3000);
        }
      }
    });
    
    redis.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
    
    redis.on('connect', () => {
      console.log('Redis Client Connected');
    });
  }
  
  if (!redis.isOpen) {
    await redis.connect();
  }
  
  return redis;
}

interface TokenInfo {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope: string;
  tokenType: 'openid' | 'posting';
  lastRefreshed: number;
}

/**
 * LinkedIn Token Manager
 * 
 * Handles automatic token refresh and expiration tracking for LinkedIn OAuth tokens.
 * Since LinkedIn rarely provides refresh tokens, this system:
 * 
 * 1. Tracks token expiration dates
 * 2. Attempts refresh when possible
 * 3. Sends alerts before expiration
 * 4. Provides re-authorization URLs when manual intervention needed
 */
export class LinkedInTokenManager {
  private static readonly TOKEN_STORAGE_KEYS = {
    openid: 'linkedin:token:openid',
    posting: 'linkedin:token:posting'
  };

  /**
   * Store token information with expiration tracking
   */
  static async storeToken(tokenData: any, tokenType: 'openid' | 'posting'): Promise<void> {
    const redisClient = await getRedisClient();
    
    if (!redisClient) {
      console.warn('⚠️ Redis not configured - token storage disabled');
      console.log('🔧 Development fallback: Token details logged below:');
      console.log(`   Token Type: ${tokenType}`);
      console.log(`   Access Token: ${tokenData.access_token?.slice(0, 20)}...`);
      console.log(`   Expires In: ${tokenData.expires_in} seconds`);
      console.log(`   Scope: ${tokenData.scope}`);
      return;
    }

    const expiresAt = Date.now() + (tokenData.expires_in * 1000);
    
    const tokenInfo: TokenInfo = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt,
      scope: tokenData.scope,
      tokenType,
      lastRefreshed: Date.now()
    };

    const key = this.TOKEN_STORAGE_KEYS[tokenType];
    
    try {
      console.log(`📡 Storing ${tokenType} token in Redis...`);
      await redisClient.setEx(key, tokenData.expires_in, JSON.stringify(tokenInfo));
      console.log(`✅ Successfully stored ${tokenType} token, expires: ${new Date(expiresAt).toISOString()}`);
      
      // Schedule refresh check only if Redis storage succeeded
      try {
        await inngest.send({
          name: 'linkedin/token.schedule-refresh',
          data: {
            tokenType,
            expiresAt,
            hasRefreshToken: !!tokenData.refresh_token
          }
        });
        console.log(`📅 Scheduled refresh monitoring for ${tokenType} token`);
      } catch (inngestError) {
        const error = inngestError instanceof Error ? inngestError : new Error(String(inngestError));
        console.warn(`⚠️ Failed to schedule token refresh monitoring: ${error.message}`);
        // Don't throw - this is optional
      }
      
    } catch (redisError) {
      const error = redisError instanceof Error ? redisError : new Error(String(redisError));
      console.error(`❌ Failed to store ${tokenType} token in Redis:`, {
        error: error.message,
        tokenType,
        expiresAt: new Date(expiresAt).toISOString()
      });
      
      // For development/debugging: Log token details to console as fallback
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ DEVELOPMENT FALLBACK: ${tokenType.toUpperCase()} token details:`);
        console.warn(`   Access Token: ${tokenData.access_token?.substring(0, 20)}...`);
        console.warn(`   Expires: ${new Date(expiresAt).toISOString()}`);
        console.warn(`   Scope: ${tokenData.scope}`);
        console.warn('   💡 Copy the access token above to manually test LinkedIn APIs');
      }
      
      // Don't throw the error - allow OAuth flow to complete successfully
      // The user gets their token, they just need to re-authenticate more frequently
      console.log(`✅ LinkedIn OAuth completed successfully (token storage failed but non-critical)`);
    }
  }

  /**
   * Get current valid token
   */
  static async getToken(tokenType: 'openid' | 'posting'): Promise<TokenInfo | null> {
    const redisClient = await getRedisClient();
    
    if (!redisClient) {
      console.warn(`⚠️ Redis not available - cannot retrieve ${tokenType} token`);
      return null;
    }

    const key = this.TOKEN_STORAGE_KEYS[tokenType];
    
    try {
      const tokenData = await redisClient.get(key);
      
      if (!tokenData) {
        console.log(`📭 No ${tokenType} token found in storage`);
        return null;
      }

      const tokenInfo: TokenInfo = JSON.parse(tokenData);
      
      // Check if token is still valid (with 1 hour buffer)
      const bufferTime = 60 * 60 * 1000; // 1 hour
      if (tokenInfo.expiresAt - bufferTime <= Date.now()) {
        console.log(`⚠️ ${tokenType} token expires soon, triggering refresh...`);
        await this.attemptTokenRefresh(tokenType);
        return await this.getToken(tokenType); // Recursive call after refresh
      }

      return tokenInfo;
      
    } catch (redisError) {
      const error = redisError instanceof Error ? redisError : new Error(String(redisError));
      console.error(`❌ Failed to retrieve ${tokenType} token from Redis:`, {
        error: error.message,
        tokenType
      });
      
      // Return null instead of throwing - caller can handle missing token
      return null;
    }
  }

  /**
   * Attempt to refresh token using refresh token or re-authorization
   */
  static async attemptTokenRefresh(tokenType: 'openid' | 'posting'): Promise<boolean> {
    const redisClient = await getRedisClient();
    
    if (!redisClient) return false;

    const tokenInfo = await this.getCurrentTokenInfo(tokenType);
    if (!tokenInfo) return false;

    // Try refresh token flow if available
    if (tokenInfo.refreshToken) {
      const refreshed = await this.refreshTokenWithRefreshToken(tokenType, tokenInfo);
      if (refreshed) return true;
    }

    // Fall back to sending re-authorization alert
    await this.sendReAuthorizationAlert(tokenType);
    return false;
  }

  /**
   * Get current token info without refresh logic
   */
  private static async getCurrentTokenInfo(tokenType: 'openid' | 'posting'): Promise<TokenInfo | null> {
    const redisClient = await getRedisClient();
    
    if (!redisClient) return null;

    const key = this.TOKEN_STORAGE_KEYS[tokenType];
    const tokenData = await redisClient.get(key);
    
    return tokenData ? JSON.parse(tokenData) : null;
  }

  /**
   * Attempt to refresh using refresh token
   */
  private static async refreshTokenWithRefreshToken(
    tokenType: 'openid' | 'posting', 
    tokenInfo: TokenInfo
  ): Promise<boolean> {
    try {
      const clientId = tokenType === 'openid' 
        ? process.env.LINKEDIN_OPENID_CLIENT_ID
        : process.env.LINKEDIN_POSTING_CLIENT_ID;
        
      const clientSecret = tokenType === 'openid'
        ? process.env.LINKEDIN_OPENID_CLIENT_SECRET  
        : process.env.LINKEDIN_POSTING_CLIENT_SECRET;

      if (!clientId || !clientSecret || !tokenInfo.refreshToken) {
        return false;
      }

      const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokenInfo.refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (!response.ok) {
        console.error(`Failed to refresh ${tokenType} token:`, await response.text());
        return false;
      }

      const newTokenData = await response.json();
      await this.storeToken(newTokenData, tokenType);
      
      console.log(`✅ Successfully refreshed ${tokenType} token`);
      return true;
      
    } catch (error) {
      console.error(`Error refreshing ${tokenType} token:`, error);
      return false;
    }
  }

  /**
   * Send alert that manual re-authorization is needed
   */
  private static async sendReAuthorizationAlert(tokenType: 'openid' | 'posting'): Promise<void> {
    const reAuthUrl = tokenType === 'openid' 
      ? '/api/auth/linkedin/authorize'
      : '/api/auth/linkedin/posting/authorize';

    await inngest.send({
      name: 'linkedin/token.reauth-required',
      data: {
        tokenType,
        reAuthUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${reAuthUrl}`,
        message: `LinkedIn ${tokenType} token expired and cannot be automatically refreshed. Manual re-authorization required.`,
        severity: 'HIGH'
      }
    });
  }

  /**
   * Check all tokens for upcoming expiration
   */
  static async checkAllTokens(): Promise<void> {
    const openidToken = await this.getCurrentTokenInfo('openid');
    const postingToken = await this.getCurrentTokenInfo('posting');

    const now = Date.now();
    const warningThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days

    for (const [type, token] of [['openid', openidToken], ['posting', postingToken]] as const) {
      if (!token) continue;

      const timeUntilExpiry = token.expiresAt - now;
      
      if (timeUntilExpiry <= warningThreshold) {
        console.log(`⚠️ ${type} token expires in ${Math.round(timeUntilExpiry / (24 * 60 * 60 * 1000))} days`);
        await this.attemptTokenRefresh(type);
      }
    }
  }

  /**
   * Get token status for dashboard/monitoring
   */
  static async getTokenStatus(): Promise<{
    openid: { valid: boolean; expiresAt?: number; daysUntilExpiry?: number };
    posting: { valid: boolean; expiresAt?: number; daysUntilExpiry?: number };
  }> {
    const openidToken = await this.getCurrentTokenInfo('openid');
    const postingToken = await this.getCurrentTokenInfo('posting');
    
    const now = Date.now();
    
    return {
      openid: openidToken ? {
        valid: openidToken.expiresAt > now,
        expiresAt: openidToken.expiresAt,
        daysUntilExpiry: Math.round((openidToken.expiresAt - now) / (24 * 60 * 60 * 1000))
      } : { valid: false },
      posting: postingToken ? {
        valid: postingToken.expiresAt > now,
        expiresAt: postingToken.expiresAt,
        daysUntilExpiry: Math.round((postingToken.expiresAt - now) / (24 * 60 * 60 * 1000))
      } : { valid: false }
    };
  }
}