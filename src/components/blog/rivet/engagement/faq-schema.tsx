'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SPACING, BORDERS, TYPOGRAPHY, ANIMATION, SPACING_SCALE } from '@/lib/design-tokens';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Script from 'next/script';

/**
 * FAQSchema Component
 *
 * Accordion-based FAQ component with schema.org/FAQPage structured data
 * for Google rich results and enhanced SEO.
 *
 * @component
 * @example
 * ```tsx
 * <FAQSchema
 *   items={[
 *     {
 *       id: "what-is-rivet",
 *       question: "What is the RIVET framework?",
 *       answer: "RIVET stands for Reader-centric navigation, Interactive elements..."
 *     }
 *   ]}
 *   title="Frequently Asked Questions"
 *   showGroupControls
 * />
 * ```
 *
 * @features
 * - schema.org/FAQPage JSON-LD for Google rich snippets
 * - Expand All / Collapse All group controls
 * - URL hash deep linking (#faq-item-id)
 * - Smooth accordion animations
 * - Accessible keyboard navigation
 * - Design token compliant
 *
 * @seo
 * - Generates FAQPage structured data for Google Search
 * - Eligible for FAQ rich results in SERPs
 * - Improves click-through rates with expanded previews
 *
 * @accessibility
 * - ARIA accordion pattern via Radix UI
 * - Keyboard navigation (Tab, Enter, Arrow keys)
 * - Screen reader announcements for expand/collapse
 * - Focus management
 */

export interface FAQItem {
  /** Unique identifier (used for URL hash) - auto-generated if not provided */
  id?: string;
  /** Question text */
  question: string;
  /** Answer text (supports plain text or React nodes) */
  answer: string | React.ReactNode;
}

export interface FAQSchemaProps {
  /** Array of FAQ items */
  items: FAQItem[];
  /** Optional title heading */
  title?: string;
  /** Show Expand All / Collapse All buttons (default: true) */
  showGroupControls?: boolean;
  /** Array of FAQ IDs to expand by default */
  defaultExpanded?: string[];
  /** Optional className */
  className?: string;
}

export function FAQSchema({
  items,
  title = 'Frequently Asked Questions',
  showGroupControls = true,
  defaultExpanded = [],
  className,
}: FAQSchemaProps) {
  // Helper function to generate ID from question text
  const generateId = (question: string, index: number): string => {
    return (
      question
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .substring(0, 50) + // Limit length
      `-${index}`
    ); // Ensure uniqueness
  };

  // Process items to ensure they have unique IDs
  const processedItems = React.useMemo(() => {
    return items.map((item, index) => ({
      ...item,
      id: item.id || generateId(item.question, index),
    }));
  }, [items]);

  const [expandedItems, setExpandedItems] = React.useState<string[]>(defaultExpanded);

  // Generate schema.org JSON-LD
  const schemaData = React.useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: processedItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: typeof item.answer === 'string' ? item.answer : '',
        },
      })),
    };
  }, [processedItems]);

  // Handle URL hash on mount
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash.replace('#', '');
    if (hash && processedItems.some((item) => item.id === hash)) {
      setExpandedItems((prev) => [...prev, hash]);
      // Scroll to element after a brief delay
      setTimeout(() => {
        const element = document.getElementById(hash);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [processedItems]);

  const handleExpandAll = () => {
    setExpandedItems(processedItems.map((item) => item.id));
  };

  const handleCollapseAll = () => {
    setExpandedItems([]);
  };

  const handleValueChange = (value: string[]) => {
    setExpandedItems(value);
  };

  return (
    <>
      {/* Inject schema.org JSON-LD */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className={cn('faq-schema-container', `my-${SPACING_SCALE.lg}`, className)}>
        {/* Header */}
        <div className={cn('flex items-center justify-between', `mb-${SPACING_SCALE.md}`)}>
          <h2 className={cn(TYPOGRAPHY.h2.standard, 'm-0')}>{title}</h2>

          {/* Group Controls */}
          {showGroupControls && items.length > 1 && (
            <div className={cn('flex gap-2')}>
              <button
                onClick={handleExpandAll}
                className={cn(
                  'text-sm font-medium text-primary hover:underline',
                  'flex items-center gap-1',
                  'transition-colors'
                )}
                type="button"
                aria-label="Expand all FAQs"
              >
                <ChevronDown className="h-4 w-4" />
                Expand All
              </button>
              <span className="text-muted-foreground">|</span>
              <button
                onClick={handleCollapseAll}
                className={cn(
                  'text-sm font-medium text-primary hover:underline',
                  'flex items-center gap-1',
                  'transition-colors'
                )}
                type="button"
                aria-label="Collapse all FAQs"
              >
                <ChevronUp className="h-4 w-4" />
                Collapse All
              </button>
            </div>
          )}
        </div>

        {/* FAQ Accordion */}
        <Accordion
          type="multiple"
          value={expandedItems}
          onValueChange={handleValueChange}
          className={cn('border rounded-lg', BORDERS.card, 'divide-y')}
        >
          {processedItems.map((item) => (
            <AccordionItem key={item.id} value={item.id} id={item.id} className="border-0">
              <AccordionTrigger
                className={cn(
                  'px-4 py-4 text-left',
                  'hover:bg-muted/50',
                  'transition-colors',
                  ANIMATION.duration.fast
                )}
              >
                <span className="font-semibold">{item.question}</span>
              </AccordionTrigger>
              <AccordionContent className={cn('px-4 pb-4', 'text-muted-foreground')}>
                {typeof item.answer === 'string' ? (
                  <p className="m-0 leading-relaxed">{item.answer}</p>
                ) : (
                  item.answer
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  );
}
