"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Newspaper, Square } from "lucide-react";
import { useEffect } from "react";

interface ViewToggleProps {
  currentView: "grid" | "list" | "magazine" | "compact";
}

const STORAGE_KEY = "blog-layout-preference";

/**
 * View Toggle Component
 * 
 * Allows users to switch between different post layout views:
 * - Compact: Dense view with smaller thumbnails (default)
 * - Grid: 2-column card layout
 * - List: Single column with expanded metadata
 * - Magazine: Large alternating images
 * 
 * View preference is stored in localStorage and URL params
 */
export function ViewToggle({ currentView }: ViewToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Save preference to localStorage whenever view changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, currentView);
    }
  }, [currentView]);

  const setView = (view: "grid" | "list" | "magazine" | "compact") => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (view === "compact") {
      // Compact is default, remove from URL
      params.delete("layout");
    } else {
      params.set("layout", view);
    }
    
    const query = params.toString();
    router.push(`/blog${query ? `?${query}` : ""}`, { scroll: false });
  };

  const views = [
    { value: "compact", icon: Square, label: "Compact view" },
    { value: "grid", icon: LayoutGrid, label: "Grid view" },
    { value: "list", icon: List, label: "List view" },
    { value: "magazine", icon: Newspaper, label: "Magazine view" },
  ] as const;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 rounded-lg border p-1 bg-card" role="group" aria-label="View options">
        {views.map((view) => {
          const Icon = view.icon;
          const isActive = currentView === view.value;
          
          return (
            <Button
              key={view.value}
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView(view.value)}
              className="h-9 w-9 p-0 hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label={view.label}
              aria-pressed={isActive}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>
    </div>
  );
}
