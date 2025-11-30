/**
 * Observations Components
 * 
 * ObservationLogger and ObservationList components
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X as XIcon, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import type { Observation, ObservationCategory, ObservationSeverity } from "@/types/maintenance";

interface ObservationLoggerProps {
  onSubmit: () => void;
}

/**
 * Observation logging form
 */
export function ObservationLogger({ onSubmit }: ObservationLoggerProps) {
  const [category, setCategory] = useState<ObservationCategory>("general");
  const [severity, setSeverity] = useState<ObservationSeverity>("info");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/maintenance/observations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          severity,
          title: title.trim(),
          description: description.trim(),
          tags,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to create observation");
      }

      toast.success("Observation logged successfully");

      // Reset form
      setTitle("");
      setDescription("");
      setTags([]);
      setCategory("general");
      setSeverity("info");

      onSubmit();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to log observation";
      console.error("Observation creation error:", errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Observation</CardTitle>
        <CardDescription>Record AI performance issues, dev tool bugs, or workflow notes</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ObservationCategory)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai-performance">AI Performance</SelectItem>
                  <SelectItem value="dev-tools">Dev Tools</SelectItem>
                  <SelectItem value="workflow">Workflow</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as ObservationSeverity)}>
                <SelectTrigger id="severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of the observation"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of what you observed"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tags (press Enter)"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Logging..." : "Log Observation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * List of recent observations
 */
export function ObservationList({ observations }: { observations: Observation[] }) {
  if (observations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No observations logged yet</p>
      </div>
    );
  }

  const severityConfig: Record<string, { variant: "secondary" | "destructive"; icon: typeof CheckCircle2 }> = {
    info: { variant: "secondary", icon: CheckCircle2 },
    warning: { variant: "secondary", icon: AlertCircle },
    error: { variant: "destructive", icon: XCircle },
  };

  return (
    <div className="space-y-4">
      {observations.map((obs) => {
        const config = severityConfig[obs.severity] || severityConfig.info;
        const SeverityIcon = config.icon;

        return (
          <Card key={obs.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{obs.title}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {obs.category}
                    </Badge>
                  </div>
                  <CardDescription>{obs.description}</CardDescription>
                </div>
                <Badge variant={config.variant}>
                  <SeverityIcon className="h-3 w-3 mr-1" />
                  {obs.severity}
                </Badge>
              </div>
            </CardHeader>
            {(obs.tags.length > 0 || obs.createdAt) && (
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex flex-wrap gap-2">
                    {obs.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-muted-foreground">
                    {new Date(obs.createdAt).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
