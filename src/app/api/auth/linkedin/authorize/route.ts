import { NextRequest, NextResponse } from 'next/server';

/**
 * LinkedIn OpenID Connect Authorization Endpoint
 * 
 * Initiates OAuth 2.0 flow for user authentication using OpenID Connect.
 * Visit: http://localhost:3000/api/auth/linkedin/authorize
 */
export async function GET() {
  try {
    const clientId = process.env.LINKEDIN_OPENID_CLIENT_ID;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const redirectUri = `${siteUrl}/api/auth/linkedin/callback`;
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'LINKEDIN_OPENID_CLIENT_ID not configured. Please set up your OpenID Connect app credentials.' },
        { status: 500 }
      );
    }

    // Generate state for CSRF protection
    const state = crypto.randomUUID();
    
    // Define scopes for OpenID Connect
    const scopes = [
      'openid',           // OpenID Connect
      'profile',          // Basic profile info
      'email',            // Email access
    ].join(' ');

    // Build authorization URL
    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      state: state,
      scope: scopes,
    });

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${authParams.toString()}`;

    console.log('🔐 LinkedIn OpenID Connect Authorization');
    console.log('🔗 Authorization URL:', authUrl);
    console.log('📝 State token (store for CSRF verification):', state);
    console.log('🎯 Redirect URI:', redirectUri);
    console.log('📋 Scopes:', scopes);
    
    return Response.redirect(authUrl);
  } catch (error) {
    console.error('LinkedIn OpenID authorization error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate LinkedIn OpenID authorization' },
      { status: 500 }
    );
  }
}