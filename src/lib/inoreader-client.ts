/**
 * Inoreader API Client
 *
 * OAuth 2.0 authenticated client for fetching RSS feed contents from Inoreader.
 * Implements rate limiting, token refresh, and caching.
 *
 * Based on official documentation: https://www.inoreader.com/developers/
 */

import type {
  InoreaderArticle,
  InoreaderStreamResponse,
  InoreaderTokenResponse,
  InoreaderSubscriptionList,
  InoreaderUnreadCounts,
  InoreaderUserInfo,
  StreamContentsOptions,
  StreamId,
} from "@/types/inoreader";

const API_BASE_URL = "https://www.inoreader.com";
const TOKEN_ENDPOINT = `${API_BASE_URL}/oauth2/token`;
const API_ENDPOINT = `${API_BASE_URL}/reader/api/0`;

export class InoreaderClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiresAt: number | null = null;
  private clientId: string;
  private clientSecret: string;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * Exchange authorization code for access and refresh tokens
   * Called after user authorizes the app on Inoreader consent page
   */
  async exchangeCodeForTokens(
    code: string,
    redirectUri: string,
  ): Promise<InoreaderTokenResponse> {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "DCYFR-Labs/1.0",
      },
      body: new URLSearchParams({
        code,
        redirect_uri: redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "authorization_code",
        scope: "",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to exchange code: ${errorText}`);
    }

    const tokenData: InoreaderTokenResponse = await response.json();
    this.setTokens(tokenData);
    return tokenData;
  }

  /**
   * Refresh an expired access token
   */
  async refreshAccessToken(): Promise<InoreaderTokenResponse> {
    if (!this.refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "DCYFR-Labs/1.0",
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to refresh token: ${errorText}`);
    }

    const tokenData: InoreaderTokenResponse = await response.json();
    this.setTokens(tokenData);
    return tokenData;
  }

  /**
   * Store tokens and calculate expiration time
   */
  private setTokens(tokenData: InoreaderTokenResponse): void {
    this.accessToken = tokenData.access_token;
    this.refreshToken = tokenData.refresh_token;
    this.tokenExpiresAt = Date.now() + tokenData.expires_in * 1000;
  }

  /**
   * Check if access token is expired or about to expire (within 5 minutes)
   */
  private isTokenExpired(): boolean {
    if (!this.tokenExpiresAt) return true;
    const bufferTime = 5 * 60 * 1000; // 5 minutes
    return Date.now() >= this.tokenExpiresAt - bufferTime;
  }

  /**
   * Ensure we have a valid access token, refreshing if necessary
   */
  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken || this.isTokenExpired()) {
      if (!this.refreshToken) {
        throw new Error("No valid token available. User needs to re-authorize.");
      }
      await this.refreshAccessToken();
    }
  }

  /**
   * Make an authenticated API request
   */
  private async makeRequest<T>(endpoint: string): Promise<T> {
    await this.ensureValidToken();

    const response = await fetch(`${API_ENDPOINT}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "User-Agent": "DCYFR-Labs/1.0",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${errorText}`);
    }

    return response.json();
  }

  /**
   * Get user information
   */
  async getUserInfo(): Promise<InoreaderUserInfo> {
    return this.makeRequest<InoreaderUserInfo>("/user-info");
  }

  /**
   * Get list of all subscriptions (feeds)
   */
  async getSubscriptions(): Promise<InoreaderSubscriptionList> {
    return this.makeRequest<InoreaderSubscriptionList>("/subscription/list");
  }

  /**
   * Get unread counts for all feeds
   */
  async getUnreadCounts(): Promise<InoreaderUnreadCounts> {
    return this.makeRequest<InoreaderUnreadCounts>("/unread-count");
  }

  /**
   * Get articles from a stream (feed, folder, or tag)
   */
  async getStreamContents(
    streamId: StreamId,
    options: StreamContentsOptions = {},
  ): Promise<InoreaderStreamResponse> {
    const encodedStreamId = encodeURIComponent(streamId);

    // Build query parameters
    const params = new URLSearchParams();
    if (options.n !== undefined) params.append("n", options.n.toString());
    if (options.r) params.append("r", options.r);
    if (options.ot !== undefined) params.append("ot", options.ot.toString());
    if (options.xt) params.append("xt", options.xt);
    if (options.it) params.append("it", options.it);
    if (options.c) params.append("c", options.c);
    if (options.output) params.append("output", options.output);
    if (options.includeAllDirectStreamIds !== undefined) {
      params.append("includeAllDirectStreamIds", options.includeAllDirectStreamIds.toString());
    }
    if (options.annotations !== undefined) {
      params.append("annotations", options.annotations.toString());
    }

    const queryString = params.toString();
    const endpoint = `/stream/contents/${encodedStreamId}${queryString ? `?${queryString}` : ""}`;

    return this.makeRequest<InoreaderStreamResponse>(endpoint);
  }

  /**
   * Get unread articles from a specific feed
   */
  async getUnreadArticles(
    feedUrl: string,
    limit: number = 20,
  ): Promise<InoreaderArticle[]> {
    const streamId = `feed/${feedUrl}` as StreamId;
    const response = await this.getStreamContents(streamId, {
      n: limit,
      xt: "user/-/state/com.google/read",
      output: "json",
    });

    return response.items;
  }

  /**
   * Get starred articles
   */
  async getStarredArticles(limit: number = 20): Promise<InoreaderArticle[]> {
    const response = await this.getStreamContents("user/-/state/com.google/starred", {
      n: limit,
      output: "json",
      annotations: true,
    });

    return response.items;
  }

  /**
   * Get articles from a folder (tag)
   */
  async getFolderArticles(
    folderName: string,
    limit: number = 20,
    excludeRead: boolean = false,
  ): Promise<InoreaderArticle[]> {
    const streamId = `user/-/label/${folderName}` as StreamId;
    const response = await this.getStreamContents(streamId, {
      n: limit,
      output: "json",
      ...(excludeRead && { xt: "user/-/state/com.google/read" }),
    });

    return response.items;
  }

  /**
   * Get all unread articles (reading list)
   */
  async getAllUnread(limit: number = 100): Promise<InoreaderArticle[]> {
    const response = await this.getStreamContents("user/-/state/com.google/reading-list", {
      n: limit,
      xt: "user/-/state/com.google/read",
      output: "json",
    });

    return response.items;
  }

  /**
   * Paginate through a stream using continuation tokens
   */
  async *paginateStream(
    streamId: StreamId,
    options: StreamContentsOptions = {},
  ): AsyncGenerator<InoreaderArticle[], void, unknown> {
    let continuation: string | undefined;

    do {
      const response = await this.getStreamContents(streamId, {
        ...options,
        c: continuation,
      });

      yield response.items;

      continuation = response.continuation;
    } while (continuation);
  }

  /**
   * Get consent page URL for OAuth authorization
   */
  static getConsentUrl(
    clientId: string,
    redirectUri: string,
    scope: "read" | "read write" = "read",
    state?: string,
  ): string {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope,
      ...(state && { state }),
    });

    return `${API_BASE_URL}/oauth2/auth?${params.toString()}`;
  }

  /**
   * Restore client from stored tokens
   * Useful for server-side sessions or database storage
   */
  static fromTokens(
    clientId: string,
    clientSecret: string,
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    },
  ): InoreaderClient {
    const client = new InoreaderClient(clientId, clientSecret);
    client.accessToken = tokens.accessToken;
    client.refreshToken = tokens.refreshToken;
    client.tokenExpiresAt = tokens.expiresAt;
    return client;
  }

  /**
   * Serialize tokens for storage
   */
  getTokens(): {
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: number | null;
  } {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      expiresAt: this.tokenExpiresAt,
    };
  }
}
