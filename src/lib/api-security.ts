import { NextRequest, NextResponse } from 'next/server';

/**
 * Security utility for Inngest webhooks - allow Inngest service only
 */
export function blockExternalAccessExceptInngest(request: NextRequest): NextResponse | null {
  // Block all external access in production except Inngest
  if (process.env.NODE_ENV === 'production') {
    const userAgent = request.headers.get('user-agent') || '';
    const inngestSignature = request.headers.get('x-inngest-signature');
    const inngestTimestamp = request.headers.get('x-inngest-timestamp');
    
    // Allow Inngest service (has signature headers and user agent)
    if (inngestSignature && inngestTimestamp && userAgent.includes('inngest')) {
      return null; // Allow request
    }
    
    // Block all other external access
    return new NextResponse('API access disabled', { 
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
  
  // In development, be more permissive
  return null;
}

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