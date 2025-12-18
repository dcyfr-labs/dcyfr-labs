import { NextRequest, NextResponse } from 'next/server';

/**
 * LinkedIn Community Management API OAuth Authorization Endpoint
 * 
 * Initiates OAuth 2.0 flow for posting/content management capabilities.
 * Visit: http://localhost:3000/api/auth/linkedin/posting/authorize
 */
export async function GET() {
  try {
    const clientId = process.env.LINKEDIN_POSTING_CLIENT_ID;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const redirectUri = `${siteUrl}/api/auth/linkedin/posting/callback`;
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'LINKEDIN_POSTING_CLIENT_ID not configured. Please set up your Community Management API app credentials.' },
        { status: 500 }
      );
    }

    // Generate state for CSRF protection
    const state = crypto.randomUUID();
    
    // Define scopes for Community Management API
    const scopes = [
      'w_member_social',  // Post to LinkedIn feed
      'r_member_social',  // Read posts and engagement
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

    console.log('🚀 LinkedIn Community Management API Authorization');
    console.log('🔗 Authorization URL:', authUrl);
    console.log('📝 State token (store for CSRF verification):', state);
    console.log('🎯 Redirect URI:', redirectUri);
    console.log('📋 Scopes:', scopes);
    
    return Response.redirect(authUrl);
  } catch (error) {
    console.error('LinkedIn posting authorization error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate LinkedIn posting authorization' },
      { status: 500 }
    );
  }
}