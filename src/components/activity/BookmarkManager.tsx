/**
 * BookmarkManager Component
 *
 * Comprehensive UI for managing bookmarked activities with search,
 * filtering, export/import, and notes/tags management.
 */

"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bookmark,
  Search,
  Tag,
  Download,
  Upload,
  Trash2,
  Edit,
  Calendar,
  X,
  Plus,
  FileJson,
  FileText,
  Import,
  BookmarkX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SPACING, TYPOGRAPHY, SEMANTIC_COLORS } from "@/lib/design-tokens";
import { useBookmarks } from "@/hooks/use-bookmarks";
import type { Bookmark as BookmarkType, ExportFormat } from "@/lib/activity/bookmarks";

export interface BookmarkManagerProps {
  className?: string;
}

export function BookmarkManager({ className }: BookmarkManagerProps) {
  const {
    collection,
    loading,
    getAllTags,
    searchBookmarks,
    filterByTag,
    updateNotes,
    updateTags,
    remove,
    exportToJSON,
    exportToCSV,
    importFromJSON,
    download,
  } = useBookmarks();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [editingBookmark, setEditingBookmark] = useState<BookmarkType | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [mergeImport, setMergeImport] = useState(true);

  // Filter bookmarks based on search and tag
  const filteredBookmarks = useMemo(() => {
    let bookmarks = collection.bookmarks;

    if (searchQuery.trim()) {
      bookmarks = searchBookmarks(searchQuery);
    }

    if (selectedTag !== "all") {
      bookmarks = filterByTag(selectedTag);
    }

    return bookmarks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [collection.bookmarks, searchQuery, selectedTag, searchBookmarks, filterByTag]);

  const allTags = getAllTags();

  const handleExport = (format: ExportFormat) => {
    download(format);
  };

  const handleImport = () => {
    try {
      importFromJSON(importText, mergeImport);
      setImportText("");
      setShowImport(false);
    } catch (error) {
      alert(`Import failed: ${error}`);
    }
  };

  const handleEditBookmark = (bookmark: BookmarkType) => {
    setEditingBookmark(bookmark);
  };

  const handleSaveEdit = () => {
    if (!editingBookmark) return;

    updateNotes(editingBookmark.activityId, editingBookmark.notes || "");
    updateTags(editingBookmark.activityId, editingBookmark.tags || []);
    setEditingBookmark(null);
  };

  const handleRemoveBookmark = (bookmark: BookmarkType) => {
    if (confirm("Remove this bookmark?")) {
      remove(bookmark.activityId);
    }
  };

  const handleAddTag = () => {
    if (!editingBookmark) return;
    
    const tag = prompt("Add tag:");
    if (tag && tag.trim()) {
      const newTags = [...(editingBookmark.tags || []), tag.trim()];
      setEditingBookmark({ ...editingBookmark, tags: newTags });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!editingBookmark) return;
    
    const newTags = editingBookmark.tags?.filter(tag => tag !== tagToRemove) || [];
    setEditingBookmark({ ...editingBookmark, tags: newTags });
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-sm text-muted-foreground">Loading bookmarks...</div>
      </div>
    );
  }

  return (
    <div className={cn(SPACING.subsection, className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={TYPOGRAPHY.h2.standard}>Bookmarks</h2>
          <p className="text-sm text-muted-foreground">
            {collection.count} bookmark{collection.count !== 1 ? "s" : ""} saved
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImport(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          
          <Select onValueChange={(value) => handleExport(value as ExportFormat)}>
            <SelectTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <FileJson className="h-4 w-4" />
                  JSON
                </div>
              </SelectItem>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  CSV
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {collection.count === 0 ? (
        /* Empty state */
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <BookmarkX className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className={TYPOGRAPHY.h3.standard}>No bookmarks yet</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Bookmark activity items to save them for later reference. Click the bookmark
              icon on any activity to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notes and tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All tags</SelectItem>
                    {allTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        <div className="flex items-center gap-2">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bookmarks list */}
          <div className="grid gap-4">
            {filteredBookmarks.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No bookmarks match your search criteria.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredBookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.activityId}
                  bookmark={bookmark}
                  onEdit={() => handleEditBookmark(bookmark)}
                  onRemove={() => handleRemoveBookmark(bookmark)}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Edit bookmark dialog */}
      {editingBookmark && (
        <Dialog open={true} onOpenChange={() => setEditingBookmark(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Bookmark</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about this bookmark..."
                  value={editingBookmark.notes || ""}
                  onChange={(e) =>
                    setEditingBookmark({ ...editingBookmark, notes: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Tags</Label>
                <div className="mt-2 space-y-2">
                  {editingBookmark.tags && editingBookmark.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {editingBookmark.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No tags</p>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddTag}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add tag
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingBookmark(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Import dialog */}
      {showImport && (
        <Dialog open={true} onOpenChange={setShowImport}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Import Bookmarks</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="import-data">JSON Data</Label>
                <Textarea
                  id="import-data"
                  placeholder="Paste exported bookmark JSON here..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="mt-2 font-mono text-sm"
                  rows={8}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="merge"
                  checked={mergeImport}
                  onChange={(e) => setMergeImport(e.target.checked)}
                />
                <Label htmlFor="merge">Merge with existing bookmarks</Label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowImport(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!importText.trim()}>
                <Import className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ============================================================================
// BOOKMARK CARD COMPONENT
// ============================================================================

interface BookmarkCardProps {
  bookmark: BookmarkType;
  onEdit: () => void;
  onRemove: () => void;
}

function BookmarkCard({ bookmark, onEdit, onRemove }: BookmarkCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {/* eslint-disable-next-line no-restricted-syntax -- Bookmark status color (icon color, not semantic) */}
              <Bookmark className="h-4 w-4 text-amber-500 shrink-0" />
              <code className="text-sm bg-muted px-2 py-0.5 rounded font-mono">
                {bookmark.activityId}
              </code>
            </div>
            
            {bookmark.notes && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {bookmark.notes}
              </p>
            )}
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <time dateTime={bookmark.createdAt.toISOString()}>
                {bookmark.createdAt.toLocaleDateString()}
              </time>
              
              {bookmark.tags && bookmark.tags.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex gap-1">
                    {bookmark.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs px-1 py-0"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {bookmark.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        +{bookmark.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}