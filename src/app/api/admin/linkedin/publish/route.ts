import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { inngest } from '@/inngest/client';

/**
 * LinkedIn Publish API Route
 * 
 * Handles publishing content to LinkedIn:
 * - POST: Publish content immediately or schedule for later
 * - Integrates with LinkedIn API for actual posting
 * - Queues background jobs for scheduled posts
 * - Manages draft lifecycle (published drafts are archived)
 * 
 * Authentication: Requires admin API key
 * Rate limiting: Applied via middleware
 */

interface PublishRequest {
  content: string;
  visibility: 'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN_MEMBERS';
  scheduledFor?: string;
  draftId?: string;
}

interface PublishResponse {
  success: boolean;
  message: string;
  postId?: string;
  linkedinUrl?: string;
  scheduledJobId?: string;
  timestamp: string;
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

async function getLinkedInAccessToken(): Promise<string | null> {
  // In production, this would:
  // 1. Retrieve from Redis/secure storage
  // 2. Check token expiry
  // 3. Refresh if needed
  // 4. Handle token rotation
  
  return process.env.LINKEDIN_ACCESS_TOKEN || null;
}

async function publishToLinkedIn(content: string, visibility: string): Promise<{
  success: boolean;
  postId?: string;
  linkedinUrl?: string;
  error?: string;
}> {
  const accessToken = await getLinkedInAccessToken();
  
  if (!accessToken) {
    throw new Error('LinkedIn access token not available');
  }

  try {
    // LinkedIn API v2 post creation
    const linkedinApiUrl = 'https://api.linkedin.com/v2/ugcPosts';
    
    const postData = {
      author: `urn:li:person:${process.env.LINKEDIN_PERSON_ID}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': visibility
      }
    };

    const response = await fetch(linkedinApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`LinkedIn API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    const postId = result.id;
    
    // Generate LinkedIn URL (format may vary based on actual response)
    const linkedinUrl = `https://www.linkedin.com/feed/update/${postId}`;

    return {
      success: true,
      postId,
      linkedinUrl
    };

  } catch (error) {
    console.error('LinkedIn publishing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish to LinkedIn'
    };
  }
}

function validatePublishRequest(body: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!body.content || typeof body.content !== 'string') {
    errors.push('Content is required and must be a string');
  } else if (body.content.length > 3000) {
    errors.push('Content exceeds maximum length of 3000 characters');
  } else if (body.content.trim().length === 0) {
    errors.push('Content cannot be empty');
  }

  if (!body.visibility || !['PUBLIC', 'CONNECTIONS', 'LOGGED_IN_MEMBERS'].includes(body.visibility)) {
    errors.push('Valid visibility setting is required (PUBLIC, CONNECTIONS, or LOGGED_IN_MEMBERS)');
  }

  if (body.scheduledFor) {
    const scheduledDate = new Date(body.scheduledFor);
    const now = new Date();
    
    if (isNaN(scheduledDate.getTime())) {
      errors.push('Invalid scheduled date format');
    } else if (scheduledDate <= now) {
      errors.push('Scheduled date must be in the future');
    } else if (scheduledDate.getTime() - now.getTime() > 365 * 24 * 60 * 60 * 1000) {
      errors.push('Scheduled date cannot be more than 1 year in the future');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// POST - Publish content
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

    const body: PublishRequest = await request.json();
    
    // Validate request
    const validation = validatePublishRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    const { content, visibility, scheduledFor, draftId } = body;
    const timestamp = new Date().toISOString();

    // Handle scheduled posts
    if (scheduledFor) {
      try {
        // Queue background job for later execution
        const jobResult = await inngest.send({
          name: 'linkedin/publish.scheduled',
          data: {
            content,
            visibility,
            scheduledFor,
            draftId,
            createdAt: timestamp,
          },
        });

        // Update draft status if applicable
        if (draftId) {
          await inngest.send({
            name: 'linkedin/draft.scheduled',
            data: {
              draftId,
              scheduledJobId: jobResult.ids[0],
              scheduledFor,
            },
          });
        }

        const response: PublishResponse = {
          success: true,
          message: `Post scheduled for ${new Date(scheduledFor).toLocaleString()}`,
          scheduledJobId: jobResult.ids[0],
          timestamp,
        };

        return NextResponse.json(response);

      } catch (error) {
        console.error('Failed to schedule post:', error);
        return NextResponse.json(
          { 
            error: 'Failed to schedule post',
            message: error instanceof Error ? error.message : 'Unknown error'
          },
          { status: 500 }
        );
      }
    }

    // Handle immediate publishing
    try {
      const publishResult = await publishToLinkedIn(content, visibility);

      if (!publishResult.success) {
        return NextResponse.json(
          { 
            error: 'Failed to publish to LinkedIn',
            message: publishResult.error 
          },
          { status: 500 }
        );
      }

      // Archive draft if applicable
      if (draftId) {
        await inngest.send({
          name: 'linkedin/draft.published',
          data: {
            draftId,
            postId: publishResult.postId,
            linkedinUrl: publishResult.linkedinUrl,
            publishedAt: timestamp,
          },
        });
      }

      // Queue analytics update
      await inngest.send({
        name: 'linkedin/analytics.update',
        data: {
          postId: publishResult.postId,
          content,
          publishedAt: timestamp,
        },
      });

      const response: PublishResponse = {
        success: true,
        message: 'Post published successfully',
        postId: publishResult.postId,
        linkedinUrl: publishResult.linkedinUrl,
        timestamp,
      };

      return NextResponse.json(response);

    } catch (error) {
      console.error('Failed to publish post immediately:', error);
      
      return NextResponse.json(
        { 
          error: 'Failed to publish post',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('LinkedIn publish API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Invalid request',
        message: error instanceof Error ? error.message : 'Failed to parse request'
      },
      { status: 400 }
    );
  }
}

// GET - Check publish status or retrieve publish history
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

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (jobId) {
      // Check status of specific scheduled job
      // In production, this would query Inngest or job queue
      return NextResponse.json({
        success: true,
        job: {
          id: jobId,
          status: 'scheduled',
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Return recent publish activity
    return NextResponse.json({
      success: true,
      recentActivity: [
        {
          type: 'published',
          postId: 'post-123',
          content: 'Sample published post...',
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          type: 'scheduled',
          jobId: 'job-456',
          content: 'Sample scheduled post...',
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('LinkedIn publish GET error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve publish status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}