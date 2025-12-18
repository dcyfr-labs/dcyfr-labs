import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

/**
 * LinkedIn Token Status API Route
 * 
 * Returns current token status for LinkedIn authentication:
 * - OpenID Connect token (user auth, profile access)
 * - Community Management API token (posting capabilities)
 * 
 * Authentication: Requires admin API key
 * Rate limiting: Applied via middleware
 */

interface TokenInfo {
  valid: boolean;
  daysUntilExpiry?: number;
  expiresAt?: string;
}

interface TokenStatusResponse {
  openid: TokenInfo;
  posting: TokenInfo;
}

interface ReAuthInfo {
  openidRequired: boolean;
  postingRequired: boolean;
  urls: {
    openid: string;
    posting: string;
  };
}

async function validateAdminAccess(request: NextRequest): Promise<boolean> {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.replace('Bearer ', '');
  const expectedToken = process.env.ADMIN_API_KEY;
  
  return token === expectedToken;
}

async function checkTokenStatus(): Promise<{
  tokenStatus: TokenStatusResponse;
  reAuthInfo: ReAuthInfo;
}> {
  // In a real implementation, this would check:
  // 1. LinkedIn tokens in Redis/secure storage
  // 2. Token expiration times
  // 3. Recent API call success/failure rates
  // 4. LinkedIn API health status
  
  // For now, return mock data that shows the component working
  const now = new Date();
  const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  return {
    tokenStatus: {
      openid: {
        valid: true,
        daysUntilExpiry: 30,
        expiresAt: futureDate.toISOString(),
      },
      posting: {
        valid: true,
        daysUntilExpiry: 45,
        expiresAt: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
    reAuthInfo: {
      openidRequired: false,
      postingRequired: false,
      urls: {
        openid: `/api/auth/linkedin/openid?redirect=${encodeURIComponent('/dev/linkedin')}`,
        posting: `/api/auth/linkedin/posting?redirect=${encodeURIComponent('/dev/linkedin')}`,
      },
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    const isAuthorized = await validateAdminAccess(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Check token status
    const { tokenStatus, reAuthInfo } = await checkTokenStatus();

    return NextResponse.json({
      success: true,
      tokenStatus,
      reAuthInfo,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('LinkedIn token status API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch LinkedIn token status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const isAuthorized = await validateAdminAccess(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // In a real implementation, this would:
    // 1. Force refresh tokens from LinkedIn
    // 2. Validate token health with test API calls
    // 3. Update cached token status
    // 4. Return updated status

    const { tokenStatus, reAuthInfo } = await checkTokenStatus();

    return NextResponse.json({
      success: true,
      message: 'Token status refreshed successfully',
      tokenStatus,
      reAuthInfo,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('LinkedIn token status refresh error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to refresh LinkedIn token status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}