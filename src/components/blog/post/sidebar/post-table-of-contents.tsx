"use client";

import * as React from "react";
import { Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TocHeading } from "@/lib/toc";
import { trackToCClick } from "@/lib/analytics";
import { toastSuccess } from "@/lib/toast";

interface PostTableOfContentsProps {
  headings: TocHeading[];
  slug?: string;
}

/**
 * Post Table of Contents Section
 * 
 * Displays hierarchical navigation for post headings with active state tracking.
 */
export function PostTableOfContents({ headings, slug }: PostTableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string>("");
  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);
  const navRef = React.useRef<HTMLElement>(null);
  const itemRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());

  React.useEffect(() => {
    if (typeof window === "undefined" || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 1.0,
      }
    );

    const headingElements = headings
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [headings]);

  // Auto-scroll active item into view
  React.useEffect(() => {
    if (!activeId || !navRef.current || !itemRefs.current.has(activeId)) return;

    const activeElement = itemRefs.current.get(activeId);
    const container = navRef.current;

    if (!activeElement || !container) return;

    // Use requestAnimationFrame for smoother rendering
    requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect();
      const elementRect = activeElement.getBoundingClientRect();

      // Check if element is not fully visible in the container
      const isAboveView = elementRect.top < containerRect.top + 20; // 20px buffer
      const isBelowView = elementRect.bottom > containerRect.bottom - 20; // 20px buffer

      if (isAboveView || isBelowView) {
        // Calculate scroll position to center the active item
        const elementTop = activeElement.offsetTop;
        const containerHeight = container.clientHeight;
        const elementHeight = activeElement.clientHeight;
        const scrollTo = elementTop - (containerHeight / 2) + (elementHeight / 2);

        container.scrollTo({
          top: scrollTo,
          behavior: 'smooth',
        });
      }
    });
  }, [activeId]);

  const handleCopyLink = async (e: React.MouseEvent, id: string, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    
    try {
      await navigator.clipboard.writeText(url);
      toastSuccess(`Link copied: ${text}`);
      
      if (slug) {
        trackToCClick(slug, text, 0); // level 0 indicates copy action
      }
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const maxIndex = headings.length - 1;
    
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
          const heading = headings[focusedIndex];
          if (heading) {
            const fakeEvent = { preventDefault: () => {} } as React.MouseEvent<HTMLAnchorElement>;
            handleClick(fakeEvent, heading.id, heading);
          }
        }
        break;
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string, heading: TocHeading) => {
    e.preventDefault();
    
    const element = document.getElementById(id);
    if (!element) return;

    const headerOffset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });

    if (slug) {
      trackToCClick(slug, heading.text, heading.level);
    }

    window.history.pushState(null, "", `#${id}`);
  };

  if (headings.length === 0) return null;

  return (
    <div>
      <h2 className="font-semibold mb-3 text-sm">On this page</h2>
      <nav ref={navRef} aria-label="Table of contents" className="max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-hide">
        <ul className="space-y-2 text-sm">
          {headings.map((heading, index) => {
            const isActive = activeId === heading.id;
            const isH3 = heading.level === 3;
            const isFocused = focusedIndex === index;

            return (
              <li key={heading.id} className={cn(isH3 && "ml-4")}>
                <div
                  ref={(el) => {
                    if (el) itemRefs.current.set(heading.id, el);
                  }}
                  className={cn(
                    "group flex items-center justify-between py-1 transition-colors hover:text-foreground",
                    isActive
                      ? "text-foreground font-medium border-l-2 border-primary pl-3 -ml-0.5"
                      : "text-muted-foreground hover:underline",
                    isFocused && "ring-2 ring-primary ring-inset rounded"
                  )}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  tabIndex={0}
                >
                  <a
                    href={`#${heading.id}`}
                    onClick={(e) => handleClick(e, heading.id, heading)}
                    className="flex-1 block"
                  >
                    {heading.text}
                  </a>
                  <button
                    onClick={(e) => handleCopyLink(e, heading.id, heading.text)}
                    className={cn(
                      "opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 transition-opacity",
                      "hover:text-foreground focus:ring-2 focus:ring-primary rounded"
                    )}
                    aria-label={`Copy link to ${heading.text}`}
                    title="Copy link"
                  >
                    <Link2 className="h-3 w-3" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
