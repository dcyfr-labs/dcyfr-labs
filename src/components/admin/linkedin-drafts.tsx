'use client';

import { useState, useEffect } from 'react';
import { SPACING, TYPOGRAPHY, SEMANTIC_COLORS, getContainerClasses } from '@/lib/design-tokens';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  FileText, 
  Eye,
  Save,
  X,
  Clock,
  Send
} from 'lucide-react';

interface LinkedInDraft {
  id: string;
  title: string;
  content: string;
  scheduledFor?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'scheduled' | 'published';
  characterCount: number;
  estimatedReadTime: string;
}

/**
 * LinkedIn Draft Management
 * 
 * Interface for creating, editing, and managing LinkedIn post drafts:
 * - Create new draft posts with rich text editing
 * - Preview posts before publishing
 * - Schedule posts for future publication
 * - Organize drafts with tags and metadata
 * - Track character counts and estimated read times
 */
export function LinkedInDrafts() {
  const [drafts, setDrafts] = useState<LinkedInDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingDraft, setEditingDraft] = useState<LinkedInDraft | null>(null);
  const [newDraft, setNewDraft] = useState({
    title: '',
    content: '',
    scheduledFor: '',
    tags: [] as string[],
  });

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/linkedin/drafts', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_KEY}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDrafts(data.drafts || []);
      }
    } catch (error) {
      console.error('Failed to fetch drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    try {
      const draftData = {
        ...newDraft,
        characterCount: newDraft.content.length,
        estimatedReadTime: Math.ceil(newDraft.content.split(' ').length / 200) + ' min',
      };

      const response = await fetch('/api/admin/linkedin/drafts', {
        method: editingDraft ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_KEY}`,
        },
        body: JSON.stringify({
          ...draftData,
          id: editingDraft?.id,
        }),
      });

      if (response.ok) {
        await fetchDrafts();
        setShowEditor(false);
        setEditingDraft(null);
        setNewDraft({ title: '', content: '', scheduledFor: '', tags: [] });
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const deleteDraft = async (id: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) return;

    try {
      const response = await fetch(`/api/admin/linkedin/drafts?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_KEY}`,
        },
      });

      if (response.ok) {
        await fetchDrafts();
      } else {
        const error = await response.json();
        console.error('Failed to delete draft:', error);
      }
    } catch (error) {
      console.error('Failed to delete draft:', error);
    }
  };

  const editDraft = (draft: LinkedInDraft) => {
    setEditingDraft(draft);
    setNewDraft({
      title: draft.title,
      content: draft.content,
      scheduledFor: draft.scheduledFor || '',
      tags: draft.tags,
    });
    setShowEditor(true);
  };

  const getDraftPreview = (content: string) => {
    if (content.length <= 150) return content;
    return content.substring(0, 147) + '...';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return SEMANTIC_COLORS.status.neutral;
      case 'scheduled': return SEMANTIC_COLORS.status.warning;
      case 'published': return SEMANTIC_COLORS.status.success;
      default: return SEMANTIC_COLORS.status.neutral;
    }
  };

  const characterLimit = 3000; // LinkedIn character limit

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.content }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={TYPOGRAPHY.h2.standard}>Draft Management</h2>
          <p className="text-sm text-muted-foreground">
            Create, edit, and organize your LinkedIn post drafts
          </p>
        </div>
        <Button 
          onClick={() => setShowEditor(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Draft
        </Button>
      </div>

      {/* Drafts Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading drafts...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drafts.map((draft) => (
            <Card key={draft.id} className="relative group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base line-clamp-1">{draft.title}</CardTitle>
                  <Badge variant="secondary" className={getStatusColor(draft.status)}>
                    {draft.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {getDraftPreview(draft.content)}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{draft.characterCount} characters</span>
                  <span>{draft.estimatedReadTime}</span>
                </div>

                {draft.scheduledFor && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Scheduled: {new Date(draft.scheduledFor).toLocaleDateString()}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-muted-foreground">
                    Updated {new Date(draft.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => editDraft(draft)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteDraft(draft.id)}
                      className={`h-8 w-8 p-0 ${SEMANTIC_COLORS.alert.critical.text} hover:${SEMANTIC_COLORS.alert.critical.text}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {drafts.length === 0 && (
            <div className="col-span-full text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className={TYPOGRAPHY.h3.standard}>No drafts yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first draft to get started with LinkedIn content management.
              </p>
              <Button onClick={() => setShowEditor(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Draft
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Draft Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className={`${getContainerClasses('standard')} max-h-[90vh] overflow-y-auto`}>
          <DialogHeader>
            <DialogTitle>
              {editingDraft ? 'Edit Draft' : 'New Draft'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newDraft.title}
                onChange={(e) => setNewDraft({ ...newDraft, title: e.target.value })}
                placeholder="Enter a title for your draft..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="content">Content</Label>
                <span className={`text-xs ${newDraft.content.length > characterLimit ? SEMANTIC_COLORS.alert.critical.text : 'text-muted-foreground'}`}>
                  {newDraft.content.length}/{characterLimit}
                </span>
              </div>
              <Textarea
                id="content"
                value={newDraft.content}
                onChange={(e) => setNewDraft({ ...newDraft, content: e.target.value })}
                placeholder="Write your LinkedIn post content..."
                className="min-h-[200px] resize-none"
                maxLength={characterLimit}
              />
            </div>

            <div>
              <Label htmlFor="scheduled">Schedule for later (optional)</Label>
              <Input
                id="scheduled"
                type="datetime-local"
                value={newDraft.scheduledFor}
                onChange={(e) => setNewDraft({ ...newDraft, scheduledFor: e.target.value })}
              />
            </div>

            {newDraft.content && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className={`${TYPOGRAPHY.label.small} mb-2 flex items-center gap-2`}>
                  <Eye className="h-4 w-4" />
                  Preview
                </h4>
                <div className="text-sm whitespace-pre-wrap bg-white p-3 rounded border">
                  {newDraft.content}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditor(false);
                  setEditingDraft(null);
                  setNewDraft({ title: '', content: '', scheduledFor: '', tags: [] });
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={saveDraft}
                disabled={!newDraft.title.trim() || !newDraft.content.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {editingDraft ? 'Update Draft' : 'Save Draft'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}