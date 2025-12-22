import { NextRequest, NextResponse } from 'next/server';
import { LinkedInTokenManager } from '@/lib/linkedin-token-manager';
import { safeLog, sanitizeForLog } from '@/lib/log-sanitizer';

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
      safeLog('error', 'LinkedIn posting authorization error', {
        error: sanitizeForLog(error),
        errorDescription: sanitizeForLog(errorDescription),
      });
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

    // Log token success with masked values (security best practice)
    console.log('✅ LinkedIn Posting API OAuth successful');
    console.log('📊 Token details:');
    console.log(`   Expires in: ${tokenData.expires_in}s`);
    console.log(`   Scope: ${tokenData.scope}`);
    console.log(`   Purpose: Content posting and management`);
    console.log(`   Access Token (last 8): ***${tokenData.access_token.slice(-8)}`);
    if (tokenData.refresh_token) {
      console.log(`   Refresh Token (last 8): ***${tokenData.refresh_token.slice(-8)}`);
    } else {
      console.log('   Refresh Token: None (normal for LinkedIn)');
    }
    console.log('');
    console.log('🔐 Token stored securely in Redis');
    console.log('🤖 Token will be monitored for expiration');
    console.log('⚠️  To manually configure .env.local (if needed):');
    console.log('   Retrieve tokens from LinkedIn Developer Console');
    console.log('   DO NOT copy from logs (security risk)');

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