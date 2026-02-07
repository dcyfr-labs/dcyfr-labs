'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Z_INDEX } from '@/lib/design-tokens';

// ============================================================================
// TYPES
// ============================================================================

interface ScrollProgressIndicatorProps {
  /** Class name for customization */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ScrollProgressIndicator Component
 *
 * Thin gradient bar fixed at the top of the viewport that shows
 * scroll progress through the page.
 *
 * Features:
 * - Fixed at top of viewport
 * - Smooth spring animation
 * - Gradient background
 * - Auto-hides when at top of page
 * - GPU-accelerated transforms
 *
 * @example
 * ```tsx
 * <ScrollProgressIndicator />
 * ```
 */
export function ScrollProgressIndicator({
  className,
}: Omit<ScrollProgressIndicatorProps, 'gradient'>) {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();

  // Add smooth spring animation to scroll progress
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Show indicator only when scrolled down
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setIsVisible(latest > 0.01);
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <motion.div
      className={cn(
        `fixed top-0 left-0 right-0 h-1 ${Z_INDEX.dropdown} origin-left bg-primary`,
        className
      )}
      style={{ scaleX }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    />
  );
}
