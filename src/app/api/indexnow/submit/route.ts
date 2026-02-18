import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { inngest } from '@/inngest/client';

// IndexNow submission request schema
const IndexNowSubmissionSchema = z.object({
  urls: z.array(z.string().url()).min(1).max(10000),
  key: z.string().uuid().optional(), // Optional, will use env var if not provided
  keyLocation: z.string().url().optional(), // Optional, will auto-generate if not provided
});

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // 1. VALIDATE
    const body = await request.json();
    const validation = IndexNowSubmissionSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { urls, key, keyLocation } = validation.data;

    // Validate environment
    const apiKey = key || process.env.INDEXNOW_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'IndexNow API key not configured' },
        { status: 500 }
      );
    }

    // Generate key location if not provided
    const finalKeyLocation = keyLocation || `${process.env.NEXT_PUBLIC_SITE_URL}/${apiKey}.txt`;

    // Validate URLs are from our domain (security check)
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (appUrl) {
      const allowedDomain = new URL(appUrl).hostname;
      for (const url of urls) {
        const urlDomain = new URL(url).hostname;
        if (urlDomain !== allowedDomain) {
          return NextResponse.json(
            { 
              error: 'URLs must be from the same domain as the application',
              invalidUrl: url,
              allowedDomain,
            },
            { status: 400 }
          );
        }
      }
    }

    // 2. QUEUE
    const requestId = crypto.randomUUID();
    let queueStatus: 'queued' | 'deferred' = 'queued';
    let queueWarning: string | undefined;

    try {
      await inngest.send({
        name: 'indexnow/submission.requested',
        data: {
          urls,
          key: apiKey,
          keyLocation: finalKeyLocation,
          requestId,
          requestedAt: Date.now(),
          userAgent: request.headers.get('user-agent') || 'unknown',
          ip: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });
    } catch (queueError) {
      const queueErrorMessage = queueError instanceof Error ? queueError.message : 'Unknown queue error';
      const isBranchEnvIssue =
        queueErrorMessage.includes('Branch environment name is required') ||
        queueErrorMessage.includes('Branch environment does not exist');

      if (!isBranchEnvIssue) {
        throw queueError;
      }

      queueStatus = 'deferred';
      queueWarning = 'Inngest branch environment is not configured; submission accepted but not queued.';
      console.warn('IndexNow queue deferred:', queueErrorMessage);
    }

    // 3. RESPOND
    return NextResponse.json({
      success: true,
      message:
        queueStatus === 'queued'
          ? 'IndexNow submission queued successfully'
          : 'IndexNow submission accepted (queue deferred)',
      requestId,
      queueStatus,
      ...(queueWarning ? { warning: queueWarning } : {}),
      queued: {
        urls: urls.length,
        keyLocation: finalKeyLocation,
      },
    });

  } catch (error) {
    console.error('IndexNow submission error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' ? { detail: errorMessage } : {}),
      },
      { status: 500 }
    );
  }
}

// GET method for API documentation/status
export async function GET() {
  return NextResponse.json({
    service: 'IndexNow Submission API',
    version: '1.0.0',
    documentation: {
      method: 'POST',
      endpoint: '/api/indexnow/submit',
      description: 'Submit URLs to IndexNow protocol for real-time search indexing',
      schema: {
        urls: 'string[] (required) - Array of URLs to submit (max 10,000)',
        key: 'string (optional) - IndexNow API key (UUID format)',
        keyLocation: 'string (optional) - URL where key file is hosted',
      },
      example: {
        urls: [
          'https://www.dcyfr.ai/blog/new-post',
          'https://www.dcyfr.ai/features/updated-feature',
        ],
      },
    },
    status: {
      keyConfigured: !!process.env.INDEXNOW_API_KEY,
      appUrlConfigured: !!process.env.NEXT_PUBLIC_SITE_URL,
    },
  });
}