"use client";

import { useSectionNavigation } from "@/hooks/use-section-navigation";
import { type ReactNode } from "react";

/**
 * Props for SectionNavigator component
 */
interface SectionNavigatorProps {
  /** Child components (sections) to enable navigation for */
  children: ReactNode;
  /** Custom section selector (default: auto-adds data-section to direct children) */
  sectionSelector?: string;
  /** Scroll behavior (default: "smooth") */
  scrollBehavior?: ScrollBehavior;
  /** Offset from top in pixels for fixed headers (default: 80) */
  scrollOffset?: number;
  /** Disable keyboard navigation */
  disabled?: boolean;
  /** Enable scroll snap behavior (default: false) */
  enableScrollSnap?: boolean;
  /** Custom className for wrapper */
  className?: string;
}

/**
 * SectionNavigator Component
 *
 * Wrapper component that enables smooth keyboard navigation between sections.
 * Automatically handles PageUp/PageDown keyboard events and provides smooth
 * scrolling transitions with optional scroll snap.
 *
 * Features:
 * - Automatic PageUp/PageDown keyboard navigation
 * - Smooth scroll transitions between sections
 * - Optional scroll snap behavior
 * - Respects prefers-reduced-motion
 * - Zero visual impact (transparent wrapper)
 * - TypeScript support
 *
 * @example
 * // Basic usage with auto section detection
 * <SectionNavigator>
 *   <section>Hero Section</section>
 *   <section>Features Section</section>
 *   <section>Projects Section</section>
 * </SectionNavigator>
 *
 * @example
 * // With scroll snap and custom offset
 * <SectionNavigator enableScrollSnap scrollOffset={100}>
 *   <section>Content A</section>
 *   <section>Content B</section>
 *   <section>Content C</section>
 * </SectionNavigator>
 *
 * @example
 * // With custom section selector
 * <SectionNavigator sectionSelector=".custom-section">
 *   <div className="custom-section">Section 1</div>
 *   <div className="custom-section">Section 2</div>
 * </SectionNavigator>
 */
export function SectionNavigator({
  children,
  sectionSelector = "section[data-section]",
  scrollBehavior = "smooth",
  scrollOffset = 80,
  disabled = false,
  enableScrollSnap = false,
  className = "",
}: SectionNavigatorProps) {
  // Initialize keyboard navigation
  useSectionNavigation({
    sectionSelector,
    scrollBehavior,
    scrollOffset,
    disabled,
  });

  // Apply scroll snap styling if enabled
  const scrollSnapStyles = enableScrollSnap
    ? {
        scrollSnapType: "y mandatory",
        scrollPaddingTop: `${scrollOffset}px`,
      }
    : undefined;

  return (
    <div 
      className={className}
      style={scrollSnapStyles}
    >
      {children}
    </div>
  );
}

/**
 * Section Component
 *
 * Pre-configured section component with data-section attribute and
 * optional scroll snap styling.
 *
 * @example
 * <SectionNavigator>
 *   <Section id="hero">Hero Content</Section>
 *   <Section id="features">Features Content</Section>
 *   <Section id="projects">Projects Content</Section>
 * </SectionNavigator>
 */
export function Section({
  children,
  id,
  className = "",
  enableScrollSnap = false,
  ...props
}: {
  children: ReactNode;
  id?: string;
  className?: string;
  enableScrollSnap?: boolean;
} & React.HTMLAttributes<HTMLElement>) {
  const scrollSnapStyle = enableScrollSnap
    ? { scrollSnapAlign: "start" as const }
    : undefined;

  return (
    <section
      id={id}
      data-section
      className={className}
      style={scrollSnapStyle}
      {...props}
    >
      {children}
    </section>
  );
}
