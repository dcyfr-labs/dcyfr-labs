"use client";

import * as React from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TocHeading } from "@/lib/toc";
import { trackToCClick } from "@/lib/analytics";
import { Input } from "@/components/ui/input";
import { TYPOGRAPHY, SCROLL_BEHAVIOR, SPACING } from "@/lib/design-tokens";

// Scroll behavior constants
const SCROLL_OFFSET = SCROLL_BEHAVIOR.offset.standard; // 80px
const ACTIVE_THRESHOLD = SCROLL_BEHAVIOR.offset.tall; // 100px
const BOTTOM_THRESHOLD = 100;

// Group h3 headings under their parent h2
type HeadingGroup = {
  h2: TocHeading;
  h3s: TocHeading[];
};

type TableOfContentsSidebarProps = {
  headings: TocHeading[];
  slug?: string;
};

/**
 * TableOfContentsSidebar Component
 *
 * Simplified architecture:
 * - Single source of truth: scroll position determines active heading
 * - Auto-expand: sections open/close based on active heading only
 * - Click handling: just scrolls to element, scroll detection handles the rest
 * - No manual state management - everything driven by scroll position
 */
/** Determine the active heading id from scroll position */
function resolveActiveHeadingId(headings: TocHeading[]): string {
  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  if (scrollY + viewportHeight >= documentHeight - BOTTOM_THRESHOLD) {
    return headings[headings.length - 1]?.id ?? "";
  }

  for (let i = headings.length - 1; i >= 0; i--) {
    const heading = headings[i];
    const element = document.getElementById(heading.id);
    if (element && element.getBoundingClientRect().top <= ACTIVE_THRESHOLD) {
      return heading.id;
    }
  }

  if (scrollY < ACTIVE_THRESHOLD && headings[0]) {
    return headings[0].id;
  }

  return "";
}

export function TableOfContentsSidebar({
  headings,
  slug,
}: TableOfContentsSidebarProps) {
  const [activeId, setActiveId] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set()
  );
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const updateTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  // Group headings by h2 sections
  const headingGroups = React.useMemo(() => {
    const groups: HeadingGroup[] = [];
    let currentGroup: HeadingGroup | null = null;

    headings.forEach((heading) => {
      if (heading.level === 2) {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = { h2: heading, h3s: [] };
      } else if (heading.level === 3 && currentGroup) {
        // Don't include h3s under FAQ sections
        const isFaqSection =
          currentGroup.h2.text.toLowerCase().includes("faq") ||
          currentGroup.h2.text.toLowerCase().includes("frequently asked");
        if (!isFaqSection) {
          currentGroup.h3s.push(heading);
        }
      }
    });

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }, [headings]);

  // Single effect: scroll position → active heading → auto-expand
  React.useEffect(() => {
    if (typeof window === "undefined" || headings.length === 0) return;

    const updateActiveHeading = () => {
      const currentId = resolveActiveHeadingId(headings);

      // Debounced state update
      if (currentId !== activeId) {
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }

        updateTimeoutRef.current = setTimeout(() => {
          setActiveId(currentId);
        }, 50); // Small debounce to prevent rapid updates
      }
    };

    const handleScroll = () => {
      updateActiveHeading();
    };

    // Initial update
    updateActiveHeading();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [headings, activeId]);

  // Auto-expand and scroll based on active heading
  React.useEffect(() => {
    if (!activeId) {
      setExpandedSections(new Set());
      return;
    }

    // Find which section contains the active heading
    const activeGroup = headingGroups.find(
      (group) =>
        group.h2.id === activeId || group.h3s.some((h3) => h3.id === activeId)
    );

    if (activeGroup) {
      // Auto-expand only the active section
      setExpandedSections(new Set([activeGroup.h2.id]));

      // Auto-scroll TOC to keep active section visible (only if sidebar is scrollable)
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const groupElement = container.querySelector(
          `[data-group-id="${activeGroup.h2.id}"]`
        );

        if (groupElement) {
          const containerRect = container.getBoundingClientRect();
          const elementRect = groupElement.getBoundingClientRect();

          // Only scroll TOC if element is outside visible area
          const isAboveView = elementRect.top < containerRect.top;
          const isBelowView = elementRect.bottom > containerRect.bottom;

          if (isAboveView || isBelowView) {
            groupElement.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }
        }
      }
    }
  }, [activeId, headingGroups]);

  if (headings.length === 0) return null;

  // Manual toggle for chevron clicks (optional, for user control)
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Filter groups for search
  const filteredGroups = searchQuery
    ? headingGroups
        .map((group) => ({
          h2: group.h2,
          h3s: group.h3s.filter((h3) =>
            h3.text.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter(
          (group) =>
            group.h2.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.h3s.length > 0
        )
    : headingGroups;

  // Simplified click: just scroll, let scroll detection handle everything else
  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
    heading: TocHeading
  ) => {
    e.preventDefault();

    if (slug) {
      trackToCClick(slug, heading.text, heading.level);
    }

    const element = document.getElementById(id);
    if (element) {
      const top =
        element.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <nav
      className="h-fit max-h-[calc(100vh-8rem)] bg-background border rounded-lg p-4"
      aria-label="Table of contents"
    >
      <div className={SPACING.content}>
        <h2
          className={cn(
            "font-semibold text-foreground",
            TYPOGRAPHY.label.standard
          )}
        >
          On this page
        </h2>

        {/* Search filter for long TOCs */}
        {headings.length >= 15 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search headings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 h-9 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        <div
          ref={scrollContainerRef}
          className="max-h-[calc(100vh-16rem)] overflow-y-auto scrollbar-hide"
        >
          <ul className="list-none m-0 p-0 space-y-1 text-sm">
            {filteredGroups.map((group) => {
              const isExpanded = expandedSections.has(group.h2.id);
              const isH2Active = activeId === group.h2.id;
              const hasActiveChild = group.h3s.some((h3) => h3.id === activeId);
              const hasChildren = group.h3s.length > 0;

              return (
                <li
                  key={group.h2.id}
                  className="space-y-1"
                  data-group-id={group.h2.id}
                >
                  {/* H2 Heading */}
                  <div
                    className={cn(
                      "group flex items-center justify-between py-2 px-3 rounded-md transition-all",
                      isH2Active || hasActiveChild
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <a
                      href={`#${group.h2.id}`}
                      onClick={(e) => handleClick(e, group.h2.id, group.h2)}
                      className="flex-1 cursor-pointer"
                    >
                      {group.h2.text}
                    </a>
                    {hasChildren && (
                      <button
                        onClick={() => toggleSection(group.h2.id)}
                        className="p-1 hover:bg-background/80 rounded transition-transform"
                        aria-label={
                          isExpanded ? "Collapse section" : "Expand section"
                        }
                        aria-expanded={isExpanded}
                      >
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </button>
                    )}
                  </div>

                  {/* H3 Subsections - Collapsible */}
                  {hasChildren && (
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="list-none m-0 p-0 overflow-hidden space-y-1 pl-4"
                        >
                          {group.h3s.map((h3) => {
                            const isH3Active = activeId === h3.id;

                            return (
                              <li key={h3.id}>
                                <div
                                  className={cn(
                                    "group flex items-center justify-between py-2 px-3 rounded-md transition-colors",
                                    isH3Active
                                      ? "bg-primary/10 text-primary font-medium"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                  )}
                                >
                                  <a
                                    href={`#${h3.id}`}
                                    onClick={(e) => handleClick(e, h3.id, h3)}
                                    className="flex-1 cursor-pointer text-sm"
                                  >
                                    {h3.text}
                                  </a>
                                </div>
                              </li>
                            );
                          })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
