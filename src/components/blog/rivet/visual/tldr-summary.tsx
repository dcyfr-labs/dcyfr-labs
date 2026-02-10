'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SPACING, TYPOGRAPHY, SEMANTIC_COLORS, ANIMATION } from '@/lib/design-tokens';

/**
 * TLDRSummary Component
 *
 * Executive summary box positioned at top of blog posts.
 * Three-section format highlighting key categorized items with jump link to full content.
 *
 * @component
 * @example
 * ```tsx
 * <TLDRSummary
 *   title="30-Second Security Brief"
 *   sections={[
 *     {
 *       title: "Most Common",
 *       items: ["ASI01 Goal Hijack - Prompt injection attacks"]
 *     },
 *     {
 *       title: "Most Dangerous",
 *       items: ["ASI10 Rogue Agents - Persistent malicious behavior"]
 *     },
 *     {
 *       title: "Hardest to Detect",
 *       items: ["ASI06 Memory Poisoning - Subtle context manipulation"]
 *     }
 *   ]}
 *   jumpLink="#the-owasp-agentic-top-10-a-breakdown"
 * />
 *
 * // Or let it auto-discover the next section (recommended)
 * <TLDRSummary
 *   title="Architecture Highlights"
 *   sections={[
 *     {
 *       title: "Key Benefits",
 *       items: ["Scalability", "Performance", "Security"]
 *     },
 *     {
 *       title: "Trade-offs",
 *       items: ["Complexity", "Learning curve"]
 *     }
 *   ]}
 * />
 * ```
 *
 * @implementation
 * - **Theme Support**: Full light/dark mode with inverted theme-aware gradients
 * - **Design Tokens**: SEMANTIC_COLORS, TYPOGRAPHY, ANIMATION, SPACING
 * - **Gradient Background**: Light secondary in light mode, dark secondary in dark mode
 * - **Three Sections**: Categorized bullet lists with semantic headings
 * - **Jump Link**: Auto-discovers next H2-H4 heading with ID, or use custom jumpLink prop
 * - **Responsive**: Mobile-first grid layout (1 col mobile, 3 col desktop)
 *
 * @accessibility
 * - Semantic HTML: `<section>` with ARIA label
 * - Jump link: Keyboard accessible with focus ring
 * - Theme-aware contrast: Passes WCAG AA in both light/dark modes
 * - Screen reader: Descriptive list structure with semantic headings
 *
 * @performance
 * - Client component for interactive link behavior
 * - Auto-discovery runs once via useEffect with dependency on jumpLink prop
 * - CSS-only animations via ANIMATION tokens
 * - Minimal JavaScript footprint
 */

interface TLDRSection {
  /** Section title (e.g., "Most Common", "Key Risks", "Top Threats") */
  title: string;
  /** List of items in this section */
  items: string[];
}

interface TLDRSummaryProps {
  /** Array of sections with custom titles and items */
  sections: TLDRSection[];
  /** Jump link target (e.g., "#full-analysis"). If not provided, auto-discovers next H2-H4 heading with ID */
  jumpLink?: string;
  /** Optional custom title (default: "Blog Post Brief") */
  title?: string;
  /** Optional className */
  className?: string;
}

function TLDRSectionComponent({ title, items }: TLDRSection) {
  if (!items || items.length === 0) return null;

  return (
    <div className={SPACING.compact}>
      <h3
        className={cn(
          TYPOGRAPHY.h4.mdx,
          'text-secondary-foreground dark:text-secondary-foreground font-semibold'
        )}
      >
        {title}
      </h3>
      <ul className="space-y-1.5 list-none">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-secondary-foreground/90 dark:text-secondary-foreground/90 text-sm"
          >
            {/* DCYFR Logo SVG - matches prose content bullets */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              className="w-3 h-3 flex-shrink-0 mt-1.5 text-secondary-foreground/70 dark:text-secondary-foreground/70"
              aria-hidden="true"
            >
              <path
                d="M 100 51.397411 C 91.768944 54.80574 85.209213 57.873196 80.320602 60.599865 C 75.431992 63.32653 71.623482 66.030434 68.894951 68.711655 C 66.211899 71.392883 63.506153 75.164703 60.777626 80.027267 C 58.049099 84.889832 54.934074 91.547333 51.432468 100 L 48.635742 100 C 45.088661 91.547333 41.950901 84.889832 39.222374 80.027267 C 36.493847 75.164703 33.810837 71.392883 31.17326 68.711655 C 28.444733 66.030434 24.636229 63.32653 19.747612 60.599865 C 14.859005 57.873196 8.27653 54.80574 -0 51.397411 L -0 48.602589 C 8.322005 45.19426 14.927217 42.126804 19.815825 39.400135 C 24.704441 36.67347 28.490208 33.969566 31.17326 31.288345 C 33.810837 28.607117 36.493847 24.835297 39.222374 19.972733 C 41.950901 15.110176 45.088661 8.452667 48.635742 0 L 51.432468 0 C 54.934074 8.452667 58.049099 15.110176 60.777626 19.972733 C 63.506153 24.835297 66.211899 28.607117 68.894951 31.288345 C 71.532532 33.969566 75.29557 36.67347 80.184174 39.400135 C 85.072792 42.126804 91.677994 45.19426 100 48.602589 Z"
                fill="currentColor"
              />
            </svg>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TLDRSummary({
  sections,
  jumpLink,
  title = 'Blog Post Brief',
  className,
}: TLDRSummaryProps) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const [autoJumpLink, setAutoJumpLink] = React.useState<string | null>(null);

  const hasContent =
    sections && sections.length > 0 && sections.some((s) => s.items && s.items.length > 0);

  // Auto-discover next section heading for jumpLink
  React.useEffect(() => {
    if (jumpLink || !sectionRef.current) return;

    // Find the next heading after this section
    let nextElement = sectionRef.current.nextElementSibling;
    while (nextElement) {
      // Check if it's a heading (h2, h3, h4, etc.)
      if (nextElement.tagName.match(/^H[2-4]$/i)) {
        const id = nextElement.id;
        if (id) {
          setAutoJumpLink(`#${id}`);
          return;
        }
      }
      nextElement = nextElement.nextElementSibling;
    }
  }, [jumpLink]);

  const effectiveJumpLink = jumpLink ?? autoJumpLink;

  if (!hasContent) return null;

  return (
    <section
      ref={sectionRef}
      className={cn(
        // Container & Layout
        'relative overflow-hidden rounded-lg',
        'p-4 md:p-8',
        'my-8',
        // Inverted theme-aware gradient background
        // Light mode: Light secondary background with subtle gradient
        'bg-gradient-to-br from-secondary via-secondary/80 to-secondary/60',
        // Dark mode: Dark secondary background with gradient
        'dark:bg-gradient-to-br dark:from-secondary dark:via-secondary/90 dark:to-secondary/70',
        // Border for better definition
        'border border-secondary/30 dark:border-secondary/20',
        // Animation
        ANIMATION.transition.theme,
        className
      )}
      aria-label={title}
    >
      {/* Decorative background pattern - theme-aware */}
      <div
        className="absolute inset-0 opacity-10 dark:opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10">
        <h2
          className={cn(
            TYPOGRAPHY.h2.standard,
            'text-secondary-foreground dark:text-secondary-foreground',
            'mb-6 flex items-center gap-2'
          )}
        >
          {title}
        </h2>

        <div className="flex flex-col gap-4">
          {sections.map((section, index) => (
            <TLDRSectionComponent key={index} title={section.title} items={section.items} />
          ))}
        </div>

        {effectiveJumpLink && (
          <a
            href={effectiveJumpLink}
            className={cn(
              'mt-6 inline-flex items-center gap-1',
              'text-sm font-medium',
              'text-secondary-foreground/90 hover:text-secondary-foreground',
              'dark:text-secondary-foreground/90 dark:hover:text-secondary-foreground',
              ANIMATION.transition.theme,
              'underline decoration-secondary-foreground/40 hover:decoration-secondary-foreground',
              'dark:decoration-secondary-foreground/40 dark:hover:decoration-secondary-foreground',
              'underline-offset-4',
              SEMANTIC_COLORS.interactive.focus
            )}
          >
            Read the details
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </div>
    </section>
  );
}
