"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Trash2,
  Download,
  Upload,
  GripVertical,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY, SPACING, CONTAINER_WIDTHS } from "@/lib/design-tokens";
import type { ActivityFilterPreset } from "@/lib/activity";
import {
  deletePreset,
  updatePreset,
  exportPresets,
  importPresets,
  downloadPresetsAsFile,
} from "@/lib/activity";

// ============================================================================
// PROPS
// ============================================================================

interface PresetManagerProps {
  presets: ActivityFilterPreset[];
  onPresetsChange: (presets: ActivityFilterPreset[]) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Preset Management Dialog
 *
 * Allows users to:
 * - Rename custom presets
 * - Delete custom presets
 * - Reorder presets
 * - Export/import presets
 */
export function PresetManager({
  presets,
  onPresetsChange,
}: PresetManagerProps) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleDelete = (id: string) => {
    const updated = deletePreset(presets, id);
    onPresetsChange(updated);
  };

  const handleRename = (id: string) => {
    if (!editingName.trim()) return;

    const updated = updatePreset(presets, id, { name: editingName });
    onPresetsChange(updated);
    setEditingId(null);
    setEditingName("");
  };

  const handleExport = () => {
    downloadPresetsAsFile(presets);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      const result = importPresets(text, presets);

      if (result.success && result.presets) {
        onPresetsChange(result.presets);
      } else {
        alert(`Import failed: ${result.error}`);
      }
    };
    input.click();
  };

  const userPresets = presets.filter((p) => !p.isDefault);
  const defaultPresets = presets.filter((p) => p.isDefault);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={`gap-${SPACING.sm}`}>
          <Settings className="h-4 w-4" />
          Manage Presets
        </Button>
      </DialogTrigger>
      <DialogContent
        className={`${CONTAINER_WIDTHS.standard} max-h-[80vh] overflow-y-auto`}
      >
        <DialogHeader>
          <DialogTitle>Manage Filter Presets</DialogTitle>
          <DialogDescription>
            Customize your saved filter combinations. Default presets cannot be
            edited or deleted.
          </DialogDescription>
        </DialogHeader>

        <div className={SPACING.subsection}>
          {/* Default Presets */}
          <div>
            <h3
              className={cn(
                TYPOGRAPHY.h3.standard,
                "mb-3 flex items-center gap-2"
              )}
            >
              {}
              <Star className="h-4 w-4 text-muted-foreground" />
              Default Presets
            </h3>
            <div className="space-y-2">
              {defaultPresets.map((preset) => (
                <div
                  key={preset.id}
                  className={`flex items-center gap-${SPACING.md} p-${SPACING.md} rounded-lg border bg-muted/30`}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground opacity-50" />
                  <div className="flex-1">
                    <p className={TYPOGRAPHY.label.standard}>{preset.name}</p>
                    <p className={TYPOGRAPHY.metadata}>
                      {preset.filters.sources.length} sources •{" "}
                      {preset.filters.timeRange}
                    </p>
                  </div>
                  <Badge variant="secondary">Default</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* User Presets */}
          <div>
            <h3 className={cn(TYPOGRAPHY.h3.standard, "mb-3")}>Your Presets</h3>
            {userPresets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No custom presets yet. Save your current filters to create one!
              </p>
            ) : (
              <div className="space-y-2">
                {userPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className={`flex items-center gap-${SPACING.md} p-${SPACING.md} rounded-lg border hover:bg-accent/50 transition-theme`}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <div className="flex-1">
                      {editingId === preset.id ? (
                        <div className={`flex items-center gap-${SPACING.sm}`}>
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRename(preset.id);
                              if (e.key === "Escape") {
                                setEditingId(null);
                                setEditingName("");
                              }
                            }}
                            className="h-8"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => handleRename(preset.id)}
                          >
                            Save
                          </Button>
                        </div>
                      ) : (
                        <>
                          <button
                            className={`${TYPOGRAPHY.label.standard} hover:underline text-left`}
                            onClick={() => {
                              setEditingId(preset.id);
                              setEditingName(preset.name);
                            }}
                          >
                            {preset.name}
                          </button>
                          <p className={TYPOGRAPHY.metadata}>
                            {preset.filters.sources.length} sources •{" "}
                            {preset.filters.timeRange}
                            {preset.lastUsedAt && (
                              <>
                                {" "}
                                • Last used{" "}
                                {new Date(
                                  preset.lastUsedAt
                                ).toLocaleDateString()}
                              </>
                            )}
                          </p>
                        </>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(preset.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Export/Import */}
          <div className={`flex gap-${SPACING.sm} pt-${SPACING.md} border-t`}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className={`gap-${SPACING.sm}`}
            >
              <Download className="h-4 w-4" />
              Export All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleImport}
              className={`gap-${SPACING.sm}`}
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
