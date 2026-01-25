import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { inngest } from '@/inngest/client';

// GitHub webhook signature header
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || '';
const GITHUB_WEBHOOK_REPO = 'dcyfr/dcyfr-labs';

/**
 * Verify GitHub webhook signature
 * @see https://docs.github.com/en/developers/webhooks-and-events/webhooks/securing-your-webhooks
 */
function verifyGitHubSignature(payload: string, signature: string): boolean {
  if (!GITHUB_WEBHOOK_SECRET) {
    console.warn('[GitHub Webhook] GITHUB_WEBHOOK_SECRET not configured');
    return false;
  }

  const hash = createHmac('sha256', GITHUB_WEBHOOK_SECRET).update(payload).digest('hex');

  const expected = `sha256=${hash}`;
  return signature === expected;
}

/**
 * Extract commit data from GitHub push event
 */
interface CommitData {
  hash: string;
  message: string;
  author: string;
  email: string;
  url: string;
  timestamp: string;
}

function extractCommits(body: any): CommitData[] {
  if (!body.commits || !Array.isArray(body.commits)) {
    return [];
  }

  return body.commits.map((commit: any) => ({
    hash: commit.id.slice(0, 7), // Short SHA
    message: commit.message.split('\n')[0], // First line only
    author: commit.author?.name || 'Unknown',
    email: commit.author?.email || '',
    url: commit.url,
    timestamp: commit.timestamp,
  }));
}

export async function POST(request: NextRequest) {
  try {
    // Read raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature header' }, { status: 401 });
    }

    // Verify signature
    if (!verifyGitHubSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse body
    const body = JSON.parse(rawBody);

    // Only process push events
    const eventType = request.headers.get('x-github-event');
    if (eventType !== 'push') {
      return NextResponse.json({ message: 'Event type not supported', eventType }, { status: 200 });
    }

    // Only process our repository
    if (body.repository?.full_name !== GITHUB_WEBHOOK_REPO) {
      return NextResponse.json(
        { message: 'Repository not configured for this webhook' },
        { status: 200 }
      );
    }

    // Extract commits
    const commits = extractCommits(body);
    if (commits.length === 0) {
      return NextResponse.json({ message: 'No commits in payload' }, { status: 200 });
    }

    // Send to Inngest for processing
    const branchName = body.ref?.split('/').pop() || 'unknown';

    for (const commit of commits) {
      await inngest.send({
        name: 'github/commit.pushed',
        data: {
          hash: commit.hash,
          message: commit.message,
          author: commit.author,
          email: commit.email,
          url: commit.url,
          timestamp: commit.timestamp,
          branch: branchName,
          repository: GITHUB_WEBHOOK_REPO,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        commitsProcessed: commits.length,
        branch: branchName,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GitHub Webhook] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint for webhook verification
 * Used by GitHub to test webhook connectivity
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    webhook: 'github',
    repository: GITHUB_WEBHOOK_REPO,
  });
}
