import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { posts } from '@/data/posts';
import { visibleProjects } from '@/data/projects';
import {
  getBlogPostUrl,
  getProjectUrl,
  submitToIndexNowWithResult,
} from '@/lib/indexnow/client';
import { SITE_URL } from '@/lib/site-config';

const BulkRequestSchema = z.object({
  types: z.array(z.enum(['posts', 'projects', 'static'])).min(1).optional(),
});

const DEFAULT_TYPES: Array<'posts' | 'projects' | 'static'> = ['posts', 'projects', 'static'];

function isValidAdminToken(request: NextRequest): boolean {
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey) {
    return false;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return false;
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  const tokenBuffer = Buffer.from(token, 'utf8');
  const keyBuffer = Buffer.from(adminKey, 'utf8');

  if (tokenBuffer.length !== keyBuffer.length) {
    return false;
  }

  return timingSafeEqual(tokenBuffer, keyBuffer);
}

function getStaticUrls(): string[] {
  const base = SITE_URL.replace(/\/$/, '');

  return [
    `${base}/`,
    `${base}/about`,
    `${base}/work`,
    `${base}/blog`,
    `${base}/contact`,
  ];
}

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        {
          error: 'ADMIN_API_KEY not configured',
          message: 'Admin bulk endpoint is disabled until ADMIN_API_KEY is set.',
        },
        { status: 503 }
      );
    }

    if (!isValidAdminToken(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - valid admin bearer token required' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = BulkRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: parsed.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const types = parsed.data.types && parsed.data.types.length > 0 ? parsed.data.types : DEFAULT_TYPES;

    const urls = new Set<string>();
    const breakdown = {
      posts: 0,
      projects: 0,
      static: 0,
    };

    if (types.includes('posts')) {
      for (const post of posts) {
        urls.add(getBlogPostUrl(post.slug));
      }
      breakdown.posts = posts.length;
    }

    if (types.includes('projects')) {
      for (const project of visibleProjects) {
        urls.add(getProjectUrl(project.slug));
      }
      breakdown.projects = visibleProjects.length;
    }

    if (types.includes('static')) {
      const staticUrls = getStaticUrls();
      for (const staticUrl of staticUrls) {
        urls.add(staticUrl);
      }
      breakdown.static = staticUrls.length;
    }

    const urlList = Array.from(urls);

    if (urlList.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No URLs available for selected types',
          types,
          breakdown,
        },
        { status: 400 }
      );
    }

    const result = await submitToIndexNowWithResult(urlList);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to queue IndexNow submission',
          types,
          breakdown,
          attempted: urlList.length,
          submitStatus: result.status,
        },
        { status: result.status >= 400 ? result.status : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bulk IndexNow submission accepted',
      types,
      queued: result.queued,
      collected: urlList.length,
      breakdown,
      submitStatus: result.status,
    });
  } catch (error) {
    console.error('[IndexNow Bulk] Submission error:', error);
    const detail = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' ? { detail } : {}),
      },
      { status: 500 }
    );
  }
}
