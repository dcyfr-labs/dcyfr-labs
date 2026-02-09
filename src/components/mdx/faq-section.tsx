/**
 * FAQ Section Component
 *
 * Displays FAQ content with proper semantic HTML and generates
 * structured data for AI optimization.
 *
 * Usage in MDX:
 * ```mdx
 * import { FAQSection } from '@/components/mdx';
 *
 * <FAQSection
 *   items={[
 *     {
 *       question: "What is OWASP Top 10 for Agentic AI?",
 *       answer: "The OWASP Top 10 for Agentic AI is a security framework..."
 *     },
 *     {
 *       question: "How do I secure AI agents?",
 *       answer: "Securing AI agents requires implementing input validation..."
 *     }
 *   ]}
 * />
 * ```
 */

'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { createFAQSchema } from '@/lib/metadata';
import type { FAQItem } from '@/lib/metadata';
import { SPACING, TYPOGRAPHY } from '@/lib/design-tokens';

interface FAQSectionProps {
  items: FAQItem[];
  defaultOpen?: boolean;
}

export function FAQSection({ items, defaultOpen = false }: FAQSectionProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(
    defaultOpen ? new Set(items.map((_, i) => i)) : new Set()
  );

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  // Generate FAQ schema for AI visibility
  const faqSchema = createFAQSchema(items);

  return (
    <>
      {/* FAQ Schema for AI optimization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        suppressHydrationWarning
      />

      {/* FAQ UI */}
      <div
        className={`not-prose border border-border rounded-lg overflow-hidden ${SPACING.section}`}
        role="region"
        aria-label="Frequently Asked Questions"
      >
        <div className="bg-muted/50 px-4 py-4 border-b border-border">
          <h2 className={`${TYPOGRAPHY.h3.standard} mb-0`}>Frequently Asked Questions</h2>
        </div>

        <div className="divide-y divide-border">
          {items.map((item, index) => {
            const isOpen = openItems.has(index);
            return (
              <div key={index} className="border-b border-border last:border-0">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-4 py-4 flex items-start justify-between gap-4 text-left hover:bg-muted/50 transition-colors"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className={`${TYPOGRAPHY.body} font-semibold flex-1`}>{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {isOpen && (
                  <div id={`faq-answer-${index}`} className="px-4 pb-4" role="region">
                    <div
                      className={`${TYPOGRAPHY.body} text-muted-foreground prose prose-sm max-w-none`}
                      dangerouslySetInnerHTML={{ __html: item.answer }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
