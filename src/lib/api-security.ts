import { NextRequest, NextResponse } from 'next/server';

/**
 * Security utility to block all external API access
 * 
 * This function should be called at the start of every API route
 * to ensure APIs are only accessible to internal services.
 */
export function blockExternalAccess(request: NextRequest): NextResponse | null {
  // Block all external access in production
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('API access disabled', { 
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
      }
    });
  }
  
  // In development, check for specific internal patterns
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';
  
  // Allow localhost and internal services in development
  const isInternal = 
    referer.includes('localhost') ||
    userAgent.includes('vercel-cron') ||
    userAgent.includes('inngest') ||
    request.headers.get('x-vercel-deployment-url') ||
    request.headers.get('x-internal-request');
  
  if (!isInternal) {
    return new NextResponse('API access disabled', { 
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
      }
    });
  }
  
  // Allow request to continue
  return null;
}