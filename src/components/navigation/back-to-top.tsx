"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HOVER_EFFECTS, BORDERS, SHADOWS } from "@/lib/design-tokens";

/**
 * BackToTop Component - Floating Action Button
 *
 * Scroll-to-top button that appears after scrolling down on pages.
 * Note: Blog post pages use BlogFABMenu instead for a consolidated FAB experience.
 *
 * **Animation approach:** Uses CSS animations (Tailwind animate-in) instead of Framer Motion.
 * Simple fade-in/scale effect that CSS handles efficiently without JavaScript overhead.
 *
 * Visibility:
 * - NOT shown on individual blog post pages (/blog/[slug]) - BlogFABMenu handles this
 * - Can be shown on other pages if needed (currently disabled)
 * - Appears after 400px scroll threshold
 *
 * Design System:
 * - Size: 56px (h-14 w-14) - Standard FAB size
 * - Position: bottom-[88px] right-4 on mobile (above BottomNav), hidden on desktop
 * - Z-index: 40 (below modals, above content)
 * - Animation: CSS fade-in + zoom-in (animate-in utilities)
 * - Scroll threshold: 400px
 * - Touch target: Meets 44px minimum (56px exceeds)
 * - Mobile: 88px from bottom (BottomNav 64px + 24px spacing)
 * - Desktop: Not shown (content has standard padding)
 *
 * @component
 * @returns {React.ReactElement} Floating action button or null
 */
export function BackToTop() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  // Skip on individual blog post pages (BlogFABMenu handles this)
  const isOnBlogPost = pathname?.startsWith("/blog/") && pathname !== "/blog";

  useEffect(() => {
    if (isOnBlogPost) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Early return for feature toggle
      setShow(false);
      return;
    }

    const handleScroll = () => {
      // Show after scrolling 400px (about 1.5 viewports)
      setShow(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOnBlogPost]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Don't render on blog post pages
  if (isOnBlogPost) {
    return null;
  }

  return show ? (
    <div className="md:hidden fixed bottom-[88px] right-4 sm:right-6 z-40 animate-in fade-in zoom-in-95 duration-200">
      <Button
        variant="secondary"
        size="icon"
        className={`h-14 w-14 ${BORDERS.circle} ${SHADOWS.lg} ${HOVER_EFFECTS.button}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ChevronUp className="h-7 w-7" strokeWidth={2.5} />
      </Button>
    </div>
  ) : null;
}
