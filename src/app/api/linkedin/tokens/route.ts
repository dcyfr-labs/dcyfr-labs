import { NextRequest, NextResponse } from 'next/server';
import { LinkedInTokenManager } from '@/lib/linkedin-token-manager';

/**
 * LinkedIn Token Status API
 * 
 * Provides token status information and manual refresh capabilities.
 * Protected by admin API key.
 */
export async function GET(request: NextRequest) {
  // Check admin authentication
  const authHeader = request.headers.get('Authorization');
  const adminApiKey = process.env.ADMIN_API_KEY;
  
  if (!adminApiKey || !authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const token = authHeader.split(' ')[1];
  if (token !== adminApiKey) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  try {
    const tokenStatus = await LinkedInTokenManager.getTokenStatus();
    
    return NextResponse.json({
      success: true,
      status: tokenStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking LinkedIn token status:', error);
    return NextResponse.json({
      error: 'Failed to check token status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Force token refresh
 */
export async function POST(request: NextRequest) {
  // Check admin authentication
  const authHeader = request.headers.get('Authorization');
  const adminApiKey = process.env.ADMIN_API_KEY;
  
  if (!adminApiKey || !authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const token = authHeader.split(' ')[1];
  if (token !== adminApiKey) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  try {
    const { tokenType } = await request.json();
    
    if (!tokenType || !['openid', 'posting'].includes(tokenType)) {
      return NextResponse.json({
        error: 'Invalid tokenType. Must be "openid" or "posting"'
      }, { status: 400 });
    }

    const success = await LinkedInTokenManager.attemptTokenRefresh(tokenType);
    const newStatus = await LinkedInTokenManager.getTokenStatus();
    
    return NextResponse.json({
      success: true,
      refreshed: success,
      tokenType,
      newStatus: newStatus[tokenType as 'openid' | 'posting'],
      message: success 
        ? `Successfully refreshed ${tokenType} token`
        : `Failed to refresh ${tokenType} token - manual re-authorization may be required`
    });
  } catch (error) {
    console.error('Error refreshing LinkedIn token:', error);
    return NextResponse.json({
      error: 'Failed to refresh token',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}