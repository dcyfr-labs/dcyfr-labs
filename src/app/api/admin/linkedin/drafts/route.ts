import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { inngest } from '@/inngest/client';

/**
 * LinkedIn Drafts API Route
 * 
 * Manages LinkedIn post drafts:
 * - GET: Retrieve all drafts with optional filtering
 * - POST: Create new draft
 * - PUT: Update existing draft
 * - DELETE: Delete draft
 * 
 * Authentication: Requires admin API key
 * Rate limiting: Applied via middleware
 */

interface LinkedInDraft {
  id: string;
  title: string;
  content: string;
  scheduledFor?: string;
  visibility: 'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN_MEMBERS';
  hashtags: string[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'scheduled';
  estimatedReadTime: number;
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

// Mock data storage (in production, this would use Redis/Database)
let mockDrafts: LinkedInDraft[] = [
  {
    id: 'draft-1',
    title: 'AI Development Tools Launch',
    content: 'Excited to announce the launch of our new AI-powered development tools that are revolutionizing how developers build applications. These tools integrate seamlessly with existing workflows and provide intelligent suggestions for code optimization, testing, and deployment.\n\n#AI #Development #Tools #Innovation',
    visibility: 'PUBLIC',
    hashtags: ['AI', 'Development', 'Tools', 'Innovation'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'draft',
    estimatedReadTime: 2,
  },
  {
    id: 'draft-2',
    title: 'Design System Update',
    content: 'Just shipped a major update to our design system. Here\'s what changed and why it matters for consistency across our platform.\n\nKey updates:\n• New color tokens for better accessibility\n• Simplified component API\n• Enhanced documentation\n• Mobile-first responsive patterns\n\n#DesignSystem #UX #UI #WebDevelopment',
    scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    visibility: 'PUBLIC',
    hashtags: ['DesignSystem', 'UX', 'UI', 'WebDevelopment'],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    estimatedReadTime: 3,
  },
  {
    id: 'draft-3',
    title: 'Building in Public Lessons',
    content: 'Building in public: Lessons learned from scaling a Next.js application to handle millions of requests per month.\n\nWhat I wish I knew earlier:\n1. Start with proper monitoring from day one\n2. Design for horizontal scaling early\n3. Cache everything (but cache smart)\n4. Test your error boundaries\n\nMore details in the comments 👇\n\n#NextJS #Scaling #WebDevelopment #BuildingInPublic',
    visibility: 'CONNECTIONS',
    hashtags: ['NextJS', 'Scaling', 'WebDevelopment', 'BuildingInPublic'],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    status: 'draft',
    estimatedReadTime: 3,
  },
];

function extractHashtags(content: string): string[] {
  const hashtagRegex = /#(\w+)/g;
  const matches = content.match(hashtagRegex);
  return matches ? matches.map(tag => tag.replace('#', '')) : [];
}

function calculateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200)); // Average 200 words per minute
}

function generateId(): string {
  return `draft-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

// GET - Retrieve drafts
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
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let filteredDrafts = [...mockDrafts];

    // Filter by status
    if (status && status !== 'all') {
      filteredDrafts = filteredDrafts.filter(draft => draft.status === status);
    }

    // Filter by search term
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredDrafts = filteredDrafts.filter(draft =>
        draft.title.toLowerCase().includes(searchTerm) ||
        draft.content.toLowerCase().includes(searchTerm) ||
        draft.hashtags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Sort by updated date (newest first)
    filteredDrafts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json({
      success: true,
      drafts: filteredDrafts,
      total: filteredDrafts.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('LinkedIn drafts GET error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch LinkedIn drafts',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Create new draft
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

    const body = await request.json();
    const { title, content, scheduledFor, visibility = 'PUBLIC' } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    if (content.length > 3000) {
      return NextResponse.json(
        { error: 'Content exceeds maximum length of 3000 characters' },
        { status: 400 }
      );
    }

    const newDraft: LinkedInDraft = {
      id: generateId(),
      title,
      content,
      scheduledFor,
      visibility,
      hashtags: extractHashtags(content),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: scheduledFor ? 'scheduled' : 'draft',
      estimatedReadTime: calculateReadTime(content),
    };

    mockDrafts.push(newDraft);

    // Queue background task for scheduled posts
    if (scheduledFor) {
      await inngest.send({
        name: 'linkedin/schedule.post',
        data: {
          draftId: newDraft.id,
          scheduledFor,
          content,
          visibility,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Draft created successfully',
      draft: newDraft,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('LinkedIn drafts POST error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create LinkedIn draft',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update existing draft
export async function PUT(request: NextRequest) {
  try {
    // Validate authentication
    const isAuthorized = await validateAdminAccess(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, title, content, scheduledFor, visibility } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Draft ID is required' },
        { status: 400 }
      );
    }

    const draftIndex = mockDrafts.findIndex(draft => draft.id === id);
    if (draftIndex === -1) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    if (content && content.length > 3000) {
      return NextResponse.json(
        { error: 'Content exceeds maximum length of 3000 characters' },
        { status: 400 }
      );
    }

    // Update draft
    const updatedDraft = {
      ...mockDrafts[draftIndex],
      ...(title && { title }),
      ...(content && { 
        content, 
        hashtags: extractHashtags(content),
        estimatedReadTime: calculateReadTime(content),
      }),
      ...(scheduledFor !== undefined && { scheduledFor }),
      ...(visibility && { visibility }),
      updatedAt: new Date().toISOString(),
      status: scheduledFor ? 'scheduled' : 'draft',
    };

    mockDrafts[draftIndex] = updatedDraft;

    return NextResponse.json({
      success: true,
      message: 'Draft updated successfully',
      draft: updatedDraft,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('LinkedIn drafts PUT error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update LinkedIn draft',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete draft
export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Draft ID is required' },
        { status: 400 }
      );
    }

    const draftIndex = mockDrafts.findIndex(draft => draft.id === id);
    if (draftIndex === -1) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    const deletedDraft = mockDrafts[draftIndex];
    mockDrafts.splice(draftIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully',
      draft: deletedDraft,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('LinkedIn drafts DELETE error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to delete LinkedIn draft',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}