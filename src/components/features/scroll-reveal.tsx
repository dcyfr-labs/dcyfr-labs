"use client";

import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import type { ReactNode } from "react";

/**
 * Props for ScrollReveal component
 */
interface ScrollRevealProps {
  children: ReactNode;
  /** Animation type */
  animation?: "fade" | "fade-up" | "fade-down" | "fade-left" | "fade-right" | "scale";
  /** Delay before animation (ms) - mapped to stagger classes */
  delay?: number;
  /** Only animate once */
  triggerOnce?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Map animation types to CSS class names
 */
const animationClasses = {
  fade: "",
  "fade-up": "reveal-up",
  "fade-down": "reveal-down",
  "fade-left": "reveal-left",
  "fade-right": "reveal-right",
  scale: "reveal-scale",
} as const;

/**
 * ScrollReveal Component
 *
 * Wrapper component that reveals children with animation when scrolled into view.
 * Uses IntersectionObserver for efficient scroll detection.
 * 
 * **Animation Philosophy:**
 * - CSS-only animations (no JavaScript animation libraries)
 * - Uses transform + opacity for GPU acceleration (60fps)
 * - Reduced motion handled globally by CSS @media query
 * - Simple, predictable behavior
 *
 * @component
 * @param {ScrollRevealProps} props - Component props
 * @param {ReactNode} props.children - Content to animate
 * @param {"fade" | "fade-up" | "fade-down" | "fade-left" | "fade-right" | "scale"} [props.animation="fade-up"] - Animation preset
 * @param {number} [props.delay=0] - Delay index for staggered animations (0-6, mapped to 50ms increments)
 * @param {boolean} [props.triggerOnce=true] - Only animate once
 * @param {string} [props.className] - Additional CSS classes
 *
 * @returns {React.ReactElement} Animated wrapper around children
 *
 * @example
 * // Basic fade-up on scroll
 * <ScrollReveal animation="fade-up">
 *   <PostCard post={post} />
 * </ScrollReveal>
 *
 * @example
 * // Staggered list animations
 * {posts.map((post, i) => (
 *   <ScrollReveal 
 *     key={post.slug} 
 *     animation="fade-up"
 *     delay={i}
 *   >
 *     <PostCard post={post} />
 *   </ScrollReveal>
 * ))}
 *
 * @accessibility
 * - Respects prefers-reduced-motion via CSS (instant appearance)
 * - Content remains accessible without animation
 * - No keyboard trap or focus issues
 *
 * @performance
 * - CSS-only animations (transform + opacity)
 * - IntersectionObserver for viewport detection
 * - No JavaScript animation libraries
 *
 * @see src/app/globals.css for animation CSS classes
 * @see src/lib/design-tokens.ts for ANIMATION constants
 */
export function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  triggerOnce = true,
  className = "",
}: ScrollRevealProps) {
  const { ref, shouldAnimate } = useScrollAnimation({
    threshold: 0.1,
    triggerOnce,
  });

  // Map delay to stagger class (0-6)
  const staggerClass = delay > 0 && delay <= 6 ? `stagger-${delay}` : "";

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        // Base transition
        "transition-base",
        // Hidden state (always applied, CSS handles the transition)
        "reveal-hidden",
        // Direction variant
        animationClasses[animation],
        // Visible state when in viewport
        shouldAnimate && "reveal-visible",
        // Stagger delay
        staggerClass,
        // Custom classes
        className
      )}
    >
      {children}
    </div>
  );
}
