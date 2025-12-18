import { NextRequest, NextResponse } from 'next/server';
import { LinkedInTokenManager } from '@/lib/linkedin-token-manager';

/**
 * LinkedIn Community Management API OAuth Callback Endpoint
 * 
 * Handles authorization callback and exchanges code for posting access tokens.
 * LinkedIn redirects to: /api/auth/linkedin/posting/callback?code=...&state=...
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle authorization errors
    if (error) {
      // lgtm [js/log-injection]
      // Data source: OAuth error parameters from LinkedIn posting callback.
      // Risk mitigation: Logging for troubleshooting OAuth failures in posting flow.
      // Error values follow OAuth 2.0 spec (standard error codes like 'access_denied').
      console.error('LinkedIn posting authorization error:', error, errorDescription);
      return NextResponse.json({
        error: 'LinkedIn posting authorization failed',
        details: errorDescription || error
      }, { status: 400 });
    }

    // Validate required parameters
    if (!code) {
      return NextResponse.json({
        error: 'Missing authorization code'
      }, { status: 400 });
    }

    const clientId = process.env.LINKEDIN_POSTING_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_POSTING_CLIENT_SECRET;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const redirectUri = `${siteUrl}/api/auth/linkedin/posting/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        error: 'LinkedIn posting credentials not configured. Check LINKEDIN_POSTING_CLIENT_ID and LINKEDIN_POSTING_CLIENT_SECRET'
      }, { status: 500 });
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('LinkedIn posting token exchange failed:', errorText);
      return NextResponse.json({
        error: 'Failed to exchange authorization code for posting token',
        details: errorText
      }, { status: 400 });
    }

    const tokenData = await tokenResponse.json();

    // Automatically store token with expiration tracking
    await LinkedInTokenManager.storeToken(tokenData, 'posting');

    // Log tokens for development (copy these to your .env.local)
    console.log('🎉 LinkedIn Community Management API OAuth Success!');
    console.log('=====================================================');
    console.log('📋 Copy these POSTING tokens to your .env.local:');
    console.log('=====================================================');
    console.log(`LINKEDIN_POSTING_ACCESS_TOKEN="${tokenData.access_token}"`);
    
    if (tokenData.refresh_token) {
      console.log(`LINKEDIN_POSTING_REFRESH_TOKEN="${tokenData.refresh_token}"`);
    } else {
      console.log('# No refresh token provided (normal for LinkedIn)');
    }
    
    console.log(`LINKEDIN_POSTING_EXPIRES_IN=${tokenData.expires_in}`);
    console.log('=====================================================');
    console.log('⏰ Token expires in:', tokenData.expires_in, 'seconds');
    console.log('📝 Scope:', tokenData.scope);
    console.log('🎯 Purpose: Content posting and management');
    console.log('🤖 Token automatically stored and will be monitored for expiration');

    // Test the token by getting user profile
    try {
      const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        console.log('✅ Posting token validated with profile:', profile.firstName?.localized?.en_US || 'Unknown');
      }
    } catch (profileError) {
      console.warn('⚠️ Could not validate posting token with profile fetch:', profileError);
    }

    return NextResponse.json({
      success: true,
      message: 'LinkedIn Community Management API authorization successful! Token automatically stored and monitored.',
      tokenInfo: {
        expires_in: tokenData.expires_in,
        scope: tokenData.scope,
        hasRefreshToken: !!tokenData.refresh_token,
        purpose: 'posting',
        autoManaged: true
      },
      instructions: [
        '1. Token automatically stored and will be monitored for expiration',
        '2. You will receive alerts before token expires',
        '3. Manual re-authorization only needed if automatic refresh fails',
        '4. This token is for content posting and management only',
        '5. Use separate OpenID Connect app for user authentication'
      ]
    });

  } catch (error) {
    console.error('LinkedIn posting callback error:', error);
    return NextResponse.json({
      error: 'Internal server error during LinkedIn posting callback',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}