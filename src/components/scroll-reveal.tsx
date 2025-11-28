"use client";

import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import type { ReactNode } from "react";

/**
 * Props for ScrollReveal component
 */
interface ScrollRevealProps {
  children: ReactNode;
  /** Animation type */
  animation?: "fade" | "fade-up" | "fade-down" | "fade-left" | "fade-right";
  /** Delay before animation (ms) */
  delay?: number;
  /** Duration of animation (ms) */
  duration?: number;
  /** Only animate once */
  triggerOnce?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * ScrollReveal Component
 *
 * Wrapper component that reveals children with animation when scrolled into view.
 * Uses IntersectionObserver for efficient scroll detection.
 * Automatically respects prefers-reduced-motion user preference.
 *
 * Features:
 * - Multiple animation presets (fade, fade-up, fade-down, fade-left, fade-right)
 * - Configurable delay and duration
 * - One-time or repeating animations
 * - GPU-accelerated transforms
 * - Respects prefers-reduced-motion
 * - Lightweight and composable
 *
 * @component
 * @param {ScrollRevealProps} props - Component props
 * @param {ReactNode} props.children - Content to animate
 * @param {"fade" | "fade-up" | "fade-down" | "fade-left" | "fade-right"} [props.animation="fade-up"] - Animation preset
 * @param {number} [props.delay=0] - Delay before animation starts (ms)
 * @param {number} [props.duration=600] - Animation duration (ms)
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
 *     delay={i * 100}
 *   >
 *     <PostCard post={post} />
 *   </ScrollReveal>
 * ))}
 *
 * @example
 * // Custom duration and className
 * <ScrollReveal 
 *   animation="fade-left"
 *   duration={800}
 *   className="my-4"
 * >
 *   <Section />
 * </ScrollReveal>
 *
 * @styling
 * Animation presets use CSS transforms for performance:
 * - fade: opacity only
 * - fade-up: opacity + translateY(20px → 0)
 * - fade-down: opacity + translateY(-20px → 0)
 * - fade-left: opacity + translateX(20px → 0)
 * - fade-right: opacity + translateX(-20px → 0)
 *
 * @accessibility
 * - Respects prefers-reduced-motion (instant appearance)
 * - Content remains accessible without animation
 * - No keyboard trap or focus issues
 * - Semantic HTML preserved
 *
 * @performance
 * - Uses transform and opacity (GPU-accelerated)
 * - IntersectionObserver for scroll detection
 * - No layout thrashing
 * - Efficient re-renders
 *
 * @see src/hooks/use-scroll-animation.ts for hook implementation
 */
export function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 600,
  triggerOnce = true,
  className = "",
}: ScrollRevealProps) {
  const { ref, shouldAnimate } = useScrollAnimation({
    threshold: 0.1,
    delay,
    triggerOnce,
  });

  // Animation variants
  const animations = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    },
    "fade-up": {
      initial: { opacity: 0, transform: "translateY(20px)" },
      animate: { opacity: 1, transform: "translateY(0)" },
    },
    "fade-down": {
      initial: { opacity: 0, transform: "translateY(-20px)" },
      animate: { opacity: 1, transform: "translateY(0)" },
    },
    "fade-left": {
      initial: { opacity: 0, transform: "translateX(20px)" },
      animate: { opacity: 1, transform: "translateX(0)" },
    },
    "fade-right": {
      initial: { opacity: 0, transform: "translateX(-20px)" },
      animate: { opacity: 1, transform: "translateX(0)" },
    },
  };

  const variant = animations[animation];
  const currentStyle = shouldAnimate ? variant.animate : variant.initial;

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      style={{
        ...currentStyle,
        transition: `all ${duration}ms ease-out`,
        willChange: shouldAnimate ? "auto" : "transform, opacity",
      }}
    >
      {children}
    </div>
  );
}
