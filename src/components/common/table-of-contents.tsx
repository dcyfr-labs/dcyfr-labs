"use client";

import * as React from "react";
import { List, Link2, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TocHeading } from "@/lib/toc";
import { trackToCClick } from "@/lib/analytics";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toastSuccess } from "@/lib/toast";
import { HOVER_EFFECTS, TYPOGRAPHY, BORDERS, SHADOWS } from "@/lib/design-tokens";

/**
 * Props for the TableOfContents component
 * @typedef {Object} TableOfContentsProps
 * @property {TocHeading[]} headings - Array of headings (h2/h3) to render in TOC
 * @property {string} [slug] - Optional: Blog post slug for analytics tracking
 * @property {boolean} [hideFAB] - Optional: Hide the FAB button (for external control)
 * @property {boolean} [externalOpen] - Optional: Control sheet open state externally
 * @property {(open: boolean) => void} [onOpenChange] - Optional: Callback when sheet state changes
 */
type TableOfContentsProps = {
  headings: TocHeading[];
  slug?: string;
  hideFAB?: boolean;
  externalOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * TableOfContents Component
 *
 * A responsive table of contents for blog posts that adapts to screen size:
 * - Mobile/Tablet (< 2XL): Floating action button that opens a bottom sheet drawer
 * - Desktop (≥ 2XL): Fixed sidebar on the right side of the viewport
 *
 * Features:
 * - Automatically highlights the currently visible heading as the user scrolls
 * - Smooth scroll to heading on click with offset for fixed header
 * - Hierarchical indentation for h3 sub-headings
 * - Collapsible on desktop (expanded by default for better UX)
 * - Keyboard and screen reader accessible
 * - Touch-friendly 48px FAB button on mobile
 *
 * @component
 * @param {TableOfContentsProps} props - Component props
 * @param {TocHeading[]} props.headings - Array of headings from parsed MDX content
 *
 * @returns {React.ReactElement | null} Navigation element or null if no headings
 *
 * @example
 * // Render TOC for blog post
 * const headings = [
 *   { id: "intro", level: 2, text: "Introduction" },
 *   { id: "setup", level: 2, text: "Setup" },
 *   { id: "setup-step1", level: 3, text: "Step 1" },
 * ];
 * <TableOfContents headings={headings} />
 *
 * @implementation
 * - Uses IntersectionObserver to track which heading is currently visible
 * - rootMargin="-80px 0px -80% 0px" activates heading when near top
 * - Smooth scrolls to heading with 80px offset (accounting for fixed header)
 * - Mobile: Sheet component with large touch targets (min 48px)
 * - Desktop: Fixed position sidebar at 2xl+ breakpoint (1536px+), collapsible
 * - Breakpoint ensures no overlap: content (672px) + gap (64px) + TOC (256px) + margins (64px) = 1056px minimum
 *
 * @accessibility
 * - nav has aria-label="Table of contents"
 * - Links are actual anchor tags for native browser behavior
 * - Collapse button has aria-expanded attribute
 * - Mobile FAB has aria-label for screen readers
 * - Keyboard navigation works with Tab/Enter
 *
 * @performance
 * - Only rendered on client (checks typeof window)
 * - Returns null if no headings (prevents empty nav)
 * - Cleanup on unmount prevents memory leaks from observer
 * - Sheet auto-closes on navigation for better mobile UX
 */
export function TableOfContents({ headings, slug, hideFAB = false, externalOpen, onOpenChange }: TableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string>("");
  const [isExpanded, setIsExpanded] = React.useState(() => {
    // Restore from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("toc-expanded");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);
  
  // Use external control if provided, otherwise use internal state
  const isSheetOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsSheetOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalOpen(open);
    }
  };

  // Persist expanded state to localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("toc-expanded", String(isExpanded));
    }
  }, [isExpanded]);

  // Show FAB after scrolling down a bit
  React.useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 400px (consistent with BackToTop)
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    // Only run on client
    if (typeof window === "undefined" || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first heading that's intersecting and visible
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: "-80px 0px -80% 0px", // Activate when heading is near top
        threshold: 1.0,
      }
    );

    // Observe all heading elements
    const headingElements = headings
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [headings]);

  // Don't render if no headings
  if (headings.length === 0) {
    return null;
  }

  // Filter headings based on search query
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
        // Track copy action in analytics
        trackToCClick(slug, text, 0); // level 0 indicates copy action
      }
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    const maxIndex = filteredHeadings.length - 1;
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, maxIndex));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        if (focusedIndex >= 0) {
          e.preventDefault();
          const heading = filteredHeadings[focusedIndex];
          if (heading) {
            const fakeEvent = { preventDefault: () => {} } as React.MouseEvent<HTMLAnchorElement>;
            handleClick(fakeEvent, heading.id, heading);
          }
        }
        break;
      case "Escape":
        setIsSheetOpen(false);
        break;
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string, heading: TocHeading) => {
    e.preventDefault();
    
    // Track analytics if slug is provided
    if (slug) {
      trackToCClick(slug, heading.text, heading.level);
    }
    
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(id);
      // Delay sheet close to allow scroll animation to complete (~1000ms)
      // This ensures the user can see the target section scroll into view
      setTimeout(() => setIsSheetOpen(false), 1000);
    }
  };

  // Shared TOC list component
  const TocList = ({ scrollContainerRef }: { scrollContainerRef?: React.RefObject<HTMLDivElement | null> }) => {
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
    const listRef = React.useRef<HTMLUListElement>(null);
    const itemRefs = React.useRef<Map<string, HTMLLIElement>>(new Map());

    // Track active item for sliding indicator
    React.useEffect(() => {
      const index = headings.findIndex((h) => h.id === activeId);
      setActiveIndex(index >= 0 ? index : null);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeId, headings]);

    // Auto-scroll active item into view with smoother transition
    React.useEffect(() => {
      if (activeId && itemRefs.current.has(activeId)) {
        const activeElement = itemRefs.current.get(activeId);
        const scrollContainer = scrollContainerRef?.current || activeElement?.closest('.overflow-y-auto');
        
        if (activeElement && scrollContainer instanceof HTMLElement) {
          // Use requestAnimationFrame for smoother rendering
          requestAnimationFrame(() => {
            const containerRect = scrollContainer.getBoundingClientRect();
            const elementRect = activeElement.getBoundingClientRect();
            
            // Check if element is not fully visible
            const isAboveView = elementRect.top < containerRect.top + 20; // 20px buffer
            const isBelowView = elementRect.bottom > containerRect.bottom - 20; // 20px buffer
            
            if (isAboveView || isBelowView) {
              // Calculate smooth scroll position
              const elementTop = activeElement.offsetTop;
              const containerHeight = scrollContainer.clientHeight;
              const elementHeight = activeElement.clientHeight;
              const scrollTo = elementTop - (containerHeight / 2) + (elementHeight / 2);
              
              scrollContainer.scrollTo({
                top: scrollTo,
                behavior: 'smooth',
              });
            }
          });
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeId]);

    return (
      <ul ref={listRef} className="relative space-y-2 text-sm border-l-2 border-border">
        {/* Sliding active indicator */}
        {activeIndex !== null && (
          <motion.div
            layoutId="toc-active-indicator"
            className="absolute left-0 -ml-0.5 w-0.5 bg-primary"
            initial={false}
            animate={{
              top: `${activeIndex * 44 + (activeIndex * 8)}px`, // item height (44px) + gap (8px)
              height: "44px",
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          />
        )}
        
        {filteredHeadings.map((heading, index) => {
          const isActive = activeId === heading.id;
          const isH3 = heading.level === 3;
          const isFocused = focusedIndex === index;

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
                    : "border-transparent text-muted-foreground",
                  isFocused && "ring-2 ring-primary ring-inset"
                )}
                onKeyDown={(e) => handleKeyDown(e, index)}
                tabIndex={0}
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
    );
  };

  // Desktop ToC component with ref
  const DesktopToC = ({ isExpanded, setIsExpanded }: { isExpanded: boolean; setIsExpanded: (v: boolean) => void }) => {
    const desktopScrollRef = React.useRef<HTMLDivElement>(null);
    
    return (
      <nav
        className="fixed top-24 right-8 hidden 2xl:block w-64 max-h-[calc(100vh-12rem)] z-30"
        aria-label="Table of contents"
      >
        <div className="space-y-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn("flex w-full items-center justify-between text-foreground hover:text-primary transition-colors", TYPOGRAPHY.label.small)}
            aria-expanded={isExpanded}
          >
            <span>On this page</span>
            <motion.svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </motion.svg>
          </button>
          
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="relative"
              >
                {/* Search filter for long TOCs (15+ headings) */}
                {headings.length >= 15 && (
                  <div className="relative mb-3">
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
                <div ref={desktopScrollRef} className="max-h-[calc(100vh-20rem)] overflow-y-auto scrollbar-hide">
                  <TocList scrollContainerRef={desktopScrollRef} />
                </div>
                {/* Bottom gradient fade */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-background to-transparent pointer-events-none" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    );
  };

  return (
    <>
      {/* Mobile TOC - Floating Action Button with Sheet */}
      <div className="2xl:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          {!hideFAB && (
            <SheetTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={
                  isVisible
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.8 }
                }
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="md:hidden fixed bottom-44 right-4 sm:right-6 z-40"
              >
                <Button
                  size="icon"
                  className={`h-14 w-14 ${BORDERS.circle} ${SHADOWS.lg} ${HOVER_EFFECTS.button}`}
                  aria-label="Open table of contents"
                  style={{ pointerEvents: isVisible ? "auto" : "none" }}
                >
                  <List className="h-6 w-6" />
                </Button>
              </motion.div>
            </SheetTrigger>
          )}
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Table of Contents</SheetTitle>
            </SheetHeader>
            {/* Search filter for long TOCs (15+ headings) */}
            {headings.length >= 15 && (
              <div className="relative mt-4 mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search headings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9 h-10"
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
            <nav
              className={cn(
                "overflow-y-auto",
                headings.length >= 15 ? "mt-2 h-[calc(80vh-10rem)]" : "mt-6 h-[calc(80vh-5rem)]"
              )}
              aria-label="Table of contents"
            >
              <TocList scrollContainerRef={undefined} />
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop TOC - Fixed Sidebar */}
      <DesktopToC isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
    </>
  );
}
