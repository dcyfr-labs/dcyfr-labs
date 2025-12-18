import { LinkedInTokenManager } from '@/lib/linkedin-token-manager';

/**
 * LinkedIn API Helper
 * 
 * Simplified interface for making LinkedIn API calls with automatic token management.
 */
export class LinkedInAPI {
  
  /**
   * Get a valid access token for the specified token type
   */
  private static async getValidToken(tokenType: 'openid' | 'posting'): Promise<string | null> {
    const tokenInfo = await LinkedInTokenManager.getToken(tokenType);
    return tokenInfo?.accessToken || null;
  }

  /**
   * Make authenticated LinkedIn API call for user profile/authentication
   */
  static async makeAuthenticatedCall(endpoint: string, options: RequestInit = {}) {
    const token = await this.getValidToken('openid');
    
    if (!token) {
      throw new Error('No valid LinkedIn OpenID token available. Re-authorization required.');
    }

    const response = await fetch(`https://api.linkedin.com${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token likely expired, trigger refresh
        await LinkedInTokenManager.attemptTokenRefresh('openid');
        throw new Error('LinkedIn token expired. Please try again.');
      }
      throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Make LinkedIn API call for posting/content management
   */
  static async makePostingCall(endpoint: string, options: RequestInit = {}) {
    const token = await this.getValidToken('posting');
    
    if (!token) {
      throw new Error('No valid LinkedIn posting token available. Re-authorization required.');
    }

    const response = await fetch(`https://api.linkedin.com${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token likely expired, trigger refresh
        await LinkedInTokenManager.attemptTokenRefresh('posting');
        throw new Error('LinkedIn posting token expired. Please try again.');
      }
      throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user profile using OpenID Connect token
   */
  static async getUserProfile() {
    return await this.makeAuthenticatedCall('/v2/me');
  }

  /**
   * Get user email address
   */
  static async getUserEmail() {
    return await this.makeAuthenticatedCall('/v2/emailAddress?q=members&projection=(elements*(handle~))');
  }

  /**
   * Post to LinkedIn using posting token
   */
  static async createPost(content: {
    author: string;
    lifecycleState: string;
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: string };
        shareMediaCategory: string;
      };
    };
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': string;
    };
  }) {
    return await this.makePostingCall('/v2/ugcPosts', {
      method: 'POST',
      body: JSON.stringify(content),
    });
  }

  /**
   * Get LinkedIn profile activity (for activity feed integration)
   */
  static async getProfileActivity() {
    return await this.makePostingCall('/v2/shares?q=owners&owners=urn:li:person:YOUR_PERSON_ID&count=20');
  }

  /**
   * Check if tokens are available and valid
   */
  static async checkTokensAvailable(): Promise<{
    openid: boolean;
    posting: boolean;
    status: any;
  }> {
    const status = await LinkedInTokenManager.getTokenStatus();
    
    return {
      openid: status.openid.valid,
      posting: status.posting.valid,
      status
    };
  }
}

/**
 * Utility functions for common LinkedIn operations
 */
export const linkedinUtils = {
  
  /**
   * Format LinkedIn post content
   */
  formatPost(text: string, authorUrn: string) {
    return {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };
  },

  /**
   * Generate re-authorization URLs
   */
  getReAuthUrls() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return {
      openid: `${baseUrl}/api/auth/linkedin/authorize`,
      posting: `${baseUrl}/api/auth/linkedin/posting/authorize`
    };
  },

  /**
   * Check if manual intervention is required
   */
  async checkReAuthRequired() {
    const urls = this.getReAuthUrls();
    const status = await LinkedInTokenManager.getTokenStatus();
    
    return {
      openidRequired: !status.openid.valid,
      postingRequired: !status.posting.valid,
      urls
    };
  }
};