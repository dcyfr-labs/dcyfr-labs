"use client";

import * as React from "react";
import { Link2, Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TocHeading } from "@/lib/toc";
import { trackToCClick } from "@/lib/analytics";
import { Input } from "@/components/ui/input";
import { toastSuccess } from "@/lib/toast";
import { TYPOGRAPHY, SCROLL_BEHAVIOR } from "@/lib/design-tokens";

// Scroll behavior constants derived from design tokens for consistency
const SCROLL_OFFSET = SCROLL_BEHAVIOR.offset.standard; // 80px - Distance from top for scroll-to behavior (matches SmoothScrollToHash)
const ACTIVE_THRESHOLD = SCROLL_BEHAVIOR.offset.tall; // 100px - Distance threshold for marking heading as active
const BOTTOM_THRESHOLD = 100; // Distance from bottom to activate last heading

// TOC list item dimensions for indicator animation
// These match the Tailwind classes: min-h-11 (44px) and space-y-2 (8px gap)
const ITEM_HEIGHT = 44; // px - Height of each TOC item (min-h-11)
const ITEM_GAP = 8; // px - Gap between items (space-y-2)

type TableOfContentsSidebarProps = {
  headings: TocHeading[];
  slug?: string;
};

/**
 * TableOfContentsSidebar Component
 * 
 * Desktop-only sidebar version of TableOfContents for left rail in blog posts.
 * - Always visible on desktop (lg+)
 * - Sticky positioning with scroll tracking
 * - Hierarchical indentation for h3 sub-headings
 * - Smooth scroll to heading on click
 * - Search filter for long TOCs (15+ headings)
 * 
 * @param headings - Array of TocHeading objects from parsed MDX
 * @param slug - Optional blog post slug for analytics tracking
 */
export function TableOfContentsSidebar({ headings, slug }: TableOfContentsSidebarProps) {
  const [activeId, setActiveId] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<Map<string, HTMLLIElement>>(new Map());
  const lastScrollY = React.useRef(0);
  const ticking = React.useRef(false);
  const isScrollingRef = React.useRef(false);

  // Optimized scroll-based heading detection
  React.useEffect(() => {
    if (typeof window === "undefined" || headings.length === 0) return;

    const updateActiveHeading = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Bottom of page - activate last heading
      if (scrollY + viewportHeight >= documentHeight - BOTTOM_THRESHOLD) {
        const lastHeading = headings[headings.length - 1];
        if (lastHeading && activeId !== lastHeading.id) {
          setActiveId(lastHeading.id);
        }
        return;
      }
      
      // Find the current heading based on scroll position
      // Heading is "active" when it's above the threshold line
      let currentId = "";
      
      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        const element = document.getElementById(heading.id);
        
        if (element) {
          const rect = element.getBoundingClientRect();
          // Check if heading is above the active threshold
          if (rect.top <= ACTIVE_THRESHOLD) {
            currentId = heading.id;
            break;
          }
        }
      }
      
      // Fallback to first heading if nothing is active and we're near the top
      if (!currentId && scrollY < ACTIVE_THRESHOLD && headings[0]) {
        currentId = headings[0].id;
      }
      
      if (currentId && currentId !== activeId) {
        setActiveId(currentId);
      }
      
      lastScrollY.current = scrollY;
      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateActiveHeading);
        ticking.current = true;
      }
    };
    
    // Initial update
    updateActiveHeading();
    
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headings, activeId]);

  // Auto-scroll active item into view with debouncing
  React.useEffect(() => {
    if (!activeId || isScrollingRef.current) return;
    
    const activeElement = itemRefs.current.get(activeId);
    const scrollContainer = scrollContainerRef.current;
      
    if (activeElement && scrollContainer) {
      isScrollingRef.current = true;
      
      requestAnimationFrame(() => {
        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = activeElement.getBoundingClientRect();
          
        const isAboveView = elementRect.top < containerRect.top + 20;
        const isBelowView = elementRect.bottom > containerRect.bottom - 20;
          
        if (isAboveView || isBelowView) {
          const elementTop = activeElement.offsetTop;
          const containerHeight = scrollContainer.clientHeight;
          const elementHeight = activeElement.clientHeight;
          const scrollTo = elementTop - (containerHeight / 2) + (elementHeight / 2);
            
          scrollContainer.scrollTo({
            top: scrollTo,
            behavior: 'smooth',
          });
        }
        
        // Reset scrolling flag after animation
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 500);
      });
    }
  }, [activeId]);

  if (headings.length === 0) return null;

  const filteredHeadings = searchQuery
    ? headings.filter((h) =>
        h.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : headings;

  const handleCopyLink = async (e: React.MouseEvent, id: string, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    
    try {
      await navigator.clipboard.writeText(url);
      toastSuccess(`Link copied: ${text}`);
      
      if (slug) {
        trackToCClick(slug, text, 0);
      }
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string, heading: TocHeading) => {
    e.preventDefault();
    
    if (slug) {
      trackToCClick(slug, heading.text, heading.level);
    }
    
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(id);
    }
  };

  const activeIndex = filteredHeadings.findIndex((h) => h.id === activeId);

  return (
    <nav
      className="sticky top-24 h-fit max-h-[calc(100vh-8rem)] bg-background border rounded-lg p-4"
      aria-label="Table of contents"
    >
      <div className="space-y-3">
        <h2 className={cn("font-semibold text-foreground", TYPOGRAPHY.label.standard)}>
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

        <div ref={scrollContainerRef} className="max-h-[calc(100vh-16rem)] overflow-y-auto scrollbar-hide">
          <ul className="relative space-y-2 text-sm border-l-2 border-border">
            {/* Sliding active indicator */}
            {activeIndex >= 0 && (
              <motion.div
                layoutId="toc-sidebar-indicator"
                className="absolute left-0 -ml-0.5 w-0.5 bg-primary"
                initial={false}
                animate={{
                  top: `${activeIndex * (ITEM_HEIGHT + ITEM_GAP)}px`,
                  height: `${ITEM_HEIGHT}px`,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              />
            )}
            
            {filteredHeadings.map((heading) => {
              const isActive = activeId === heading.id;
              const isH3 = heading.level === 3;

              return (
                <li
                  key={heading.id}
                  ref={(el) => {
                    if (el) itemRefs.current.set(heading.id, el);
                  }}
                >
                  <div
                    className={cn(
                      "group flex items-center justify-between py-2 border-l-2 -ml-0.5 transition-colors min-h-11",
                      isH3 ? "pl-8" : "pl-4",
                      isActive
                        ? "border-transparent text-primary font-medium"
                        : "border-transparent text-muted-foreground"
                    )}
                  >
                    <a
                      href={`#${heading.id}`}
                      onClick={(e) => handleClick(e, heading.id, heading)}
                      className={cn(
                        "flex-1 cursor-pointer transition-colors",
                        !isActive && "hover:text-foreground"
                      )}
                    >
                      {heading.text}
                    </a>
                    <button
                      onClick={(e) => handleCopyLink(e, heading.id, heading.text)}
                      className={cn(
                        "opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 mr-2 transition-opacity",
                        "hover:text-foreground focus:ring-2 focus:ring-primary rounded"
                      )}
                      aria-label={`Copy link to ${heading.text}`}
                      title="Copy link"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
