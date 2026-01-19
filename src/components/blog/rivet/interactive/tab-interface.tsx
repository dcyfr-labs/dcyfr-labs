"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { SPACING, BORDERS, TYPOGRAPHY, ANIMATION } from "@/lib/design-tokens";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

export interface TabInterfaceProps {
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
  variant?: "default" | "pills" | "underline";
  syncWithUrl?: boolean;
  onTabChange?: (tabId: string) => void;
}

/**
 * TabInterface - Multi-tab content switcher with URL hash synchronization
 *
 * Features:
 * - URL hash sync for deep linking (#tab-id)
 * - 3 visual variants (default, pills, underline)
 * - Keyboard navigation (Arrow keys)
 * - Analytics tracking
 * - Smooth transitions
 * - Accessible ARIA tabs pattern
 *
 * @example
 * ```tsx
 * <TabInterface
 *   tabs={[
 *     { id: "overview", label: "Overview", content: <p>Overview content</p> },
 *     { id: "details", label: "Details", content: <p>Details content</p> }
 *   ]}
 *   syncWithUrl
 * />
 * ```
 */
export function TabInterface({
  tabs,
  defaultTab,
  className,
  variant = "default",
  syncWithUrl = true,
  onTabChange,
}: TabInterfaceProps) {
  const [activeTab, setActiveTab] = useState<string>(
    defaultTab || tabs[0]?.id || ""
  );

  // Sync with URL hash on mount
  useEffect(() => {
    if (syncWithUrl && typeof window !== "undefined") {
      const hash = window.location.hash.slice(1);
      const tabExists = tabs.find((tab) => tab.id === hash);
      if (hash && tabExists) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Legitimate use case: syncing state with URL hash on mount
        setActiveTab(hash);
      }
    }
  }, [syncWithUrl, tabs]);

  // Update URL hash when tab changes
  useEffect(() => {
    if (syncWithUrl && typeof window !== "undefined" && activeTab) {
      window.history.replaceState(null, "", `#${activeTab}`);
    }
  }, [activeTab, syncWithUrl]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);

    // Analytics tracking
    if (typeof window !== "undefined" && "gtag" in window) {
      (window as any).gtag("event", "tab_change", {
        event_category: "engagement",
        event_label: tabId,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let newIndex = currentIndex;

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      newIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
    } else if (e.key === "Home") {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      newIndex = tabs.length - 1;
    } else {
      return;
    }

    setActiveTab(tabs[newIndex].id);
    onTabChange?.(tabs[newIndex].id);
  };

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  // Variant styles
  const tabListStyles = {
    default: "border-b border-border",
    pills: "bg-muted/50 p-1 rounded-lg inline-flex",
    underline: "border-b-2 border-border",
  };

  const tabButtonStyles = {
    default: (isActive: boolean) =>
      cn(
        "px-4 py-2 text-sm font-medium transition-colors",
        "border-b-2 -mb-px",
        "hover:text-foreground hover:border-border",
        isActive
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground"
      ),
    pills: (isActive: boolean) =>
      cn(
        "px-4 py-2 text-sm font-medium rounded-md transition-colors",
        "hover:bg-background/50",
        isActive
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground"
      ),
    underline: (isActive: boolean) =>
      cn(
        "px-4 py-2 text-sm font-medium transition-colors",
        "border-b-2 -mb-0.5",
        "hover:text-foreground hover:border-muted-foreground",
        isActive
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground"
      ),
  };

  return (
    <div className={cn("tab-interface", `my-${SPACING.lg}`, className)}>
      {/* Tab List */}
      <div
        role="tablist"
        aria-label="Content tabs"
        className={cn("flex gap-2", tabListStyles[variant])}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => handleTabClick(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={tabButtonStyles[variant](activeTab === tab.id)}
          >
            {tab.icon && (
              <span className="inline-flex mr-2" aria-hidden="true">
                {tab.icon}
              </span>
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          tabIndex={0}
          className={cn(
            `mt-${SPACING.md}`,
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg",
            ANIMATION.transition.base,
            activeTab === tab.id && "opacity-100"
          )}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
