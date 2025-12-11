import { NextRequest, NextResponse } from 'next/server';

/**
 * Catch-all API route that blocks ALL API access
 * 
 * This route catches any API call and returns 404.
 * Placed at /src/app/api/[...catchall]/route.ts to intercept
 * all API routes before they can be processed.
 */
export async function GET() {
  return new NextResponse('API access has been disabled for security reasons.', { 
    status: 404,
    headers: {
      'Content-Type': 'text/plain',
    }
  });
}

export async function POST() {
  return new NextResponse('API access has been disabled for security reasons.', { 
    status: 404,
    headers: {
      'Content-Type': 'text/plain',
    }
  });
}

export async function PUT() {
  return new NextResponse('API access has been disabled for security reasons.', { 
    status: 404,
    headers: {
      'Content-Type': 'text/plain',
    }
  });
}

export async function DELETE() {
  return new NextResponse('API access has been disabled for security reasons.', { 
    status: 404,
    headers: {
      'Content-Type': 'text/plain',
    }
  });
}

export async function PATCH() {
  return new NextResponse('API access has been disabled for security reasons.', { 
    status: 404,
    headers: {
      'Content-Type': 'text/plain',
    }
  });
}

export async function HEAD() {
  return new NextResponse(null, { 
    status: 404,
  });
}

export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 404,
  });
}