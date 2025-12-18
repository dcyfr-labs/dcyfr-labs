'use client';

import { useState, useEffect } from 'react';
import { SPACING, TYPOGRAPHY, SEMANTIC_COLORS } from '@/lib/design-tokens';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Send, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  Eye,
  Image,
  Link2,
  Hash
} from 'lucide-react';

interface PostingState {
  content: string;
  scheduledFor: string;
  visibility: 'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN_MEMBERS';
  isDraft: boolean;
  isPosting: boolean;
  lastPostResult: {
    success: boolean;
    message: string;
    postId?: string;
    timestamp: string;
  } | null;
}

interface LinkedInDraft {
  id: string;
  title: string;
  content: string;
  scheduledFor?: string;
}

/**
 * LinkedIn Remote Posting Interface
 * 
 * Provides functionality for posting content to LinkedIn:
 * - Direct posting with real-time character counting
 * - Schedule posts for future publication
 * - Import content from saved drafts
 * - Preview posts before publishing
 * - Track posting status and results
 * - Configure post visibility and audience
 */
export function LinkedInPosting() {
  const [postState, setPostState] = useState<PostingState>({
    content: '',
    scheduledFor: '',
    visibility: 'PUBLIC',
    isDraft: false,
    isPosting: false,
    lastPostResult: null,
  });
  const [availableDrafts, setAvailableDrafts] = useState<LinkedInDraft[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string>('');

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const response = await fetch('/api/admin/linkedin/drafts', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_KEY}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableDrafts(data.drafts || []);
      }
    } catch (error) {
      console.error('Failed to fetch drafts:', error);
    }
  };

  const loadDraft = (draftId: string) => {
    const draft = availableDrafts.find(d => d.id === draftId);
    if (draft) {
      setPostState(prev => ({
        ...prev,
        content: draft.content,
        scheduledFor: draft.scheduledFor || '',
      }));
      setSelectedDraftId(draftId);
    }
  };

  const publishPost = async () => {
    if (!postState.content.trim()) return;

    setPostState(prev => ({ ...prev, isPosting: true }));

    try {
      const response = await fetch('/api/admin/linkedin/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_KEY}`,
        },
        body: JSON.stringify({
          content: postState.content,
          visibility: postState.visibility,
          scheduledFor: postState.scheduledFor || null,
          draftId: selectedDraftId || null,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setPostState(prev => ({
          ...prev,
          lastPostResult: {
            success: true,
            message: postState.scheduledFor 
              ? 'Post scheduled successfully!' 
              : 'Post published successfully!',
            postId: result.postId,
            timestamp: new Date().toISOString(),
          },
          content: '', // Clear content after successful post
          scheduledFor: '',
        }));
        setSelectedDraftId('');
      } else {
        throw new Error(result.error || 'Failed to publish post');
      }
    } catch (error) {
      setPostState(prev => ({
        ...prev,
        lastPostResult: {
          success: false,
          message: error instanceof Error ? error.message : 'Failed to publish post',
          timestamp: new Date().toISOString(),
        },
      }));
    } finally {
      setPostState(prev => ({ ...prev, isPosting: false }));
    }
  };

  const characterLimit = 3000;
  const characterCount = postState.content.length;
  const progressPercent = (characterCount / characterLimit) * 100;

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'PUBLIC': return 'Public';
      case 'CONNECTIONS': return 'Connections only';
      case 'LOGGED_IN_MEMBERS': return 'LinkedIn members only';
      default: return visibility;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.content }}>
      {/* Header */}
      <div>
        <h2 className={TYPOGRAPHY.h2.standard}>LinkedIn Posting</h2>
        <p className="text-sm text-muted-foreground">
          Create and publish content directly to your LinkedIn profile
        </p>
      </div>

      {/* Last Post Result */}
      {postState.lastPostResult && (
        <Alert variant={postState.lastPostResult.success ? 'default' : 'destructive'}>
          <div className="flex items-center gap-2">
            {postState.lastPostResult.success ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {postState.lastPostResult.message}
              {postState.lastPostResult.postId && (
                <span className="block text-xs mt-1">
                  Post ID: {postState.lastPostResult.postId}
                </span>
              )}
            </AlertDescription>
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Posting Interface */}
        <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: SPACING.content }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Create Post
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Draft Selector */}
              {availableDrafts.length > 0 && (
                <div>
                  <Label>Load from Draft</Label>
                  <Select value={selectedDraftId} onValueChange={loadDraft}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a draft to load..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDrafts.map((draft) => (
                        <SelectItem key={draft.id} value={draft.id}>
                          {draft.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="content">Post Content</Label>
                  <span className={`text-xs ${characterCount > characterLimit ? SEMANTIC_COLORS.alert.critical.text : 'text-muted-foreground'}`}>
                    {characterCount}/{characterLimit}
                  </span>
                </div>
                <Textarea
                  id="content"
                  value={postState.content}
                  onChange={(e) => setPostState(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="What do you want to share with your network?"
                  className="min-h-[200px] resize-none"
                  maxLength={characterLimit}
                />
                <Progress 
                  value={Math.min(progressPercent, 100)} 
                  className={`mt-2 h-1 ${progressPercent > 100 ? 'bg-red-50' : ''}`}
                />
              </div>

              {/* Scheduling */}
              <div>
                <Label htmlFor="scheduled">Schedule Post (optional)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="scheduled"
                    type="datetime-local"
                    value={postState.scheduledFor}
                    onChange={(e) => setPostState(prev => ({ ...prev, scheduledFor: e.target.value }))}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                {postState.scheduledFor && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Will be published on {new Date(postState.scheduledFor).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Visibility */}
              <div>
                <Label>Post Visibility</Label>
                <Select 
                  value={postState.visibility} 
                  onValueChange={(value: any) => setPostState(prev => ({ ...prev, visibility: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public - Anyone can see</SelectItem>
                    <SelectItem value="CONNECTIONS">Connections only</SelectItem>
                    <SelectItem value="LOGGED_IN_MEMBERS">LinkedIn members only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Publish Button */}
              <Button
                onClick={publishPost}
                disabled={!postState.content.trim() || postState.isPosting || characterCount > characterLimit}
                className="w-full"
              >
                {postState.isPosting ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    {postState.scheduledFor ? 'Scheduling...' : 'Publishing...'}
                  </>
                ) : (
                  <>
                    {postState.scheduledFor ? (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Schedule Post
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Publish Now
                      </>
                    )}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview & Tips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.subsection }}>
          {/* Preview */}
          {postState.content && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="h-4 w-4" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${SEMANTIC_COLORS.alert.info.container} rounded-full flex items-center justify-center ${SEMANTIC_COLORS.alert.info.text} text-sm font-medium`}>
                        DC
                      </div>
                      <div>
                        <div className="font-medium text-sm">Drew Clements</div>
                        <div className="text-xs text-muted-foreground">
                          {getVisibilityLabel(postState.visibility)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      {postState.content}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Posting Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <Hash className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span>Use relevant hashtags to increase visibility</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Link2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span>Include links to drive traffic to your content</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span>Best posting times: 8-10 AM and 5-7 PM</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span>Keep posts under 1,300 characters for optimal engagement</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}