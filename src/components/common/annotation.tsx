"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { annotate } from "rough-notation";
import type {
  RoughAnnotation,
  RoughAnnotationConfig,
} from "rough-notation/lib/model";

/**
 * Annotation type options for Rough Notation
 *
 * @see https://roughnotation.com/ for visual examples
 */
export type AnnotationType =
  | "underline" // Underline the element
  | "box" // Box around the element
  | "circle" // Circle around the element
  | "highlight" // Highlight effect (like marker)
  | "strike-through" // Strike through the element
  | "crossed-off" // X pattern over the element
  | "bracket"; // Bracket around the element

/**
 * Bracket type for bracket annotations
 */
export type BracketType = "left" | "right" | "top" | "bottom";

/**
 * Props for the Annotation component
 */
export interface AnnotationProps {
  /** Content to annotate */
  children: ReactNode;
  /** Type of annotation effect */
  type?: AnnotationType;
  /** Whether to show the annotation on mount */
  show?: boolean;
  /** Whether to animate on viewport intersection */
  animateOnScroll?: boolean;
  /** Color of the annotation (CSS color value) */
  color?: string;
  /** Width of the annotation stroke */
  strokeWidth?: number;
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Delay before animation starts */
  animationDelay?: number;
  /** Number of animation iterations */
  iterations?: number;
  /** Padding around the element */
  padding?: number | [number, number] | [number, number, number, number];
  /** Whether to enable multi-line annotations */
  multiline?: boolean;
  /** Bracket type(s) for bracket annotations */
  brackets?: BracketType | BracketType[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * Annotation Component
 *
 * Hand-drawn style annotations using Rough Notation library.
 * Perfect for highlighting text, drawing attention to key points,
 * or adding a playful touch to content.
 *
 * @component
 * @example
 * ```tsx
 * // Basic underline
 * <Annotation type="underline" color="var(--primary)">
 *   Important text
 * </Annotation>
 *
 * // Highlight on scroll
 * <Annotation type="highlight" animateOnScroll color="#fef08a">
 *   Highlighted content
 * </Annotation>
 *
 * // Box with custom styling
 * <Annotation type="box" strokeWidth={2} padding={8}>
 *   Boxed content
 * </Annotation>
 * ```
 *
 * @features
 * - Hand-drawn aesthetic using Rough.js
 * - Multiple annotation types (underline, box, circle, highlight, etc.)
 * - Viewport-based animation with IntersectionObserver
 * - Theme-aware default colors
 * - Configurable animation timing and iterations
 * - Accessible (annotations are purely decorative)
 */
export function Annotation({
  children,
  type = "underline",
  show = false,
  animateOnScroll = false,
  color,
  strokeWidth = 2,
  animationDuration = 800,
  animationDelay = 0,
  iterations = 2,
  padding = 5,
  multiline = true,
  brackets,
  className,
}: AnnotationProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const annotationRef = useRef<RoughAnnotation | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Determine default color based on annotation type
  const getDefaultColor = () => {
    switch (type) {
      case "highlight":
        return "oklch(0.95 0.15 85)"; // Warm yellow highlight
      case "underline":
      case "strike-through":
        return "var(--primary)";
      case "box":
      case "circle":
        return "var(--primary)";
      case "bracket":
        return "var(--muted-foreground)";
      default:
        return "var(--primary)";
    }
  };

  const annotationColor = color || getDefaultColor();

  // Create annotation on mount
  useEffect(() => {
    if (!elementRef.current) return;

    const config: RoughAnnotationConfig = {
      type,
      color: annotationColor,
      strokeWidth,
      animationDuration,
      iterations,
      padding,
      multiline,
    };

    // Add brackets config if applicable
    if (type === "bracket" && brackets) {
      config.brackets = Array.isArray(brackets) ? brackets : [brackets];
    }

    annotationRef.current = annotate(elementRef.current, config);

    return () => {
      if (annotationRef.current) {
        annotationRef.current.remove();
      }
    };
  }, [
    type,
    annotationColor,
    strokeWidth,
    animationDuration,
    iterations,
    padding,
    multiline,
    brackets,
  ]);

  // Handle show prop
  useEffect(() => {
    if (!annotationRef.current) return;

    if (show && !animateOnScroll) {
      const timer = setTimeout(() => {
        annotationRef.current?.show();
      }, animationDelay);
      return () => clearTimeout(timer);
    }
  }, [show, animateOnScroll, animationDelay]);

  // Handle scroll-based animation
  useEffect(() => {
    if (!animateOnScroll || !elementRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setIsVisible(true);
            setHasAnimated(true);
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: "-50px",
      }
    );

    observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, [animateOnScroll, hasAnimated]);

  // Trigger animation when visible
  useEffect(() => {
    if (isVisible && annotationRef.current) {
      const timer = setTimeout(() => {
        annotationRef.current?.show();
      }, animationDelay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, animationDelay]);

  return (
    <span ref={elementRef} className={className}>
      {children}
    </span>
  );
}

/**
 * Pre-configured annotation variants for common use cases
 */
export const AnnotationVariants = {
  /** Yellow highlighter effect */
  Highlight: (props: Omit<AnnotationProps, "type">) => (
    <Annotation type="highlight" color="oklch(0.95 0.15 85)" {...props} />
  ),

  /** Primary color underline */
  Underline: (props: Omit<AnnotationProps, "type">) => (
    <Annotation type="underline" {...props} />
  ),

  /** Circled text */
  Circle: (props: Omit<AnnotationProps, "type">) => (
    <Annotation type="circle" padding={10} {...props} />
  ),

  /** Boxed text */
  Box: (props: Omit<AnnotationProps, "type">) => (
    <Annotation type="box" {...props} />
  ),

  /** Strikethrough for corrections */
  StrikeThrough: (props: Omit<AnnotationProps, "type">) => (
    <Annotation type="strike-through" color="var(--destructive)" {...props} />
  ),

  /** Crossed off (X pattern) */
  CrossedOff: (props: Omit<AnnotationProps, "type">) => (
    <Annotation type="crossed-off" color="var(--destructive)" {...props} />
  ),
};
