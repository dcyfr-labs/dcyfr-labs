"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, Columns2, Square, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutOption {
  id: "grid" | "list" | "magazine" | "compact" | "hybrid" | "grouped";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: "magazine",
    label: "Magazine",
    icon: Columns2,
    title: "Magazine layout - Featured posts with alternating full-width cards",
  },
  {
    id: "hybrid",
    label: "Hybrid",
    icon: LayoutGrid,
    title: "Hybrid layout - Hero post with 2-column grid",
  },
  {
    id: "grid",
    label: "Grid",
    icon: LayoutGrid,
    title: "Grid layout - 2-column card grid",
  },
  {
    id: "list",
    label: "List",
    icon: List,
    title: "List layout - Single column with full details",
  },
  {
    id: "compact",
    label: "Compact",
    icon: Square,
    title: "Compact layout - Minimal cards",
  },
  {
    id: "grouped",
    label: "Grouped",
    icon: FolderKanban,
    title: "Grouped layout - Posts organized by category",
  },
];

interface LayoutToggleProps {
  /** Current active layout */
  currentLayout: "grid" | "list" | "magazine" | "compact" | "hybrid" | "grouped";
}

/**
 * LayoutToggle Component
 *
 * Desktop-only control for switching blog post layouts.
 * Changes are persisted via URL params, which trigger BlogLayoutManager
 * to save the preference to localStorage.
 *
 * @param {LayoutToggleProps} props - Component props
 * @returns {React.ReactElement} Layout toggle buttons
 */
export function LayoutToggle({ currentLayout }: LayoutToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLayoutChange = (layout: "grid" | "list" | "magazine" | "compact" | "hybrid" | "grouped") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("layout", layout);
    router.push(`/blog?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="hidden md:flex items-center gap-1 rounded-lg border border-border bg-background/50 p-1">
      {LAYOUT_OPTIONS.map(({ id, icon: Icon, title }) => (
        <button
          key={id}
          onClick={() => handleLayoutChange(id)}
          title={title}
          aria-label={title}
          aria-pressed={currentLayout === id}
          className={cn(
            "flex items-center justify-center gap-2 px-3 py-2 rounded transition-colors",
            currentLayout === id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
