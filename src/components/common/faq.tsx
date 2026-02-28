/**
 * FAQ Component
 *
 * Accessible accordion-style FAQ section for blog posts.
 * Renders with proper semantic structure for SEO and screen readers.
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY, SPACING, SPACING_SCALE } from '@/lib/design-tokens';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface FAQItem {
  question: React.ReactNode;
  answer: React.ReactNode;
}

export interface FAQProps {
  /** Array of FAQ items with questions and answers */
  items?: FAQItem[];
  /** Optional title for the FAQ section */
  title?: string;
  /** Additional className for styling */
  className?: string;
  /** Children to render as FAQ items (for MDX usage) */
  children?: React.ReactNode;
}

/**
 * Individual FAQ Question component for MDX usage
 */
export function FAQQuestion({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("faq-question", className)} data-faq-question>
      {children}
    </span>
  );
}

/**
 * Individual FAQ Answer component for MDX usage
 */
export function FAQAnswer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("faq-answer", className)} data-faq-answer>
      {children}
    </div>
  );
}

/**
 * FAQ Section component
 *
 * Can be used in two ways:
 * 1. With items prop: <FAQ items={[{ question: "...", answer: "..." }]} />
 * 2. With children: Uses h3/h4 headers as questions and following content as answers
 */
export function FAQ({ items, title, className, children }: FAQProps) {
  // If items are provided directly, use them
  if (items && items.length > 0) {
    return (
      <section
        className={cn("my-8", className)}
        aria-labelledby={title ? "faq-title" : undefined}
      >
        {title && (
          <h2
            id="faq-title"
            className={cn(TYPOGRAPHY.accordion.heading, `mb-${SPACING_SCALE.md}`)}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {title}
          </h2>
        )}
        <Accordion
          type="single"
          collapsible
          defaultValue={"item-0"}
          className="w-full"
        >
          {items.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-none"
            >
              <div className="relative">
                <AccordionTrigger className={TYPOGRAPHY.accordion.trigger}>
                  {item.question}
                </AccordionTrigger>
                {/* Bottom border with gradient fade effect */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-border via-border to-transparent" />
              </div>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    );
  }

  // If children are provided, parse them to extract Q&A pairs
  // This handles MDX content where FAQ items are defined inline
  if (children) {
    const faqItems = parseFAQChildren(children);

    if (faqItems.length > 0) {
      return (
        <section
          className={cn("my-8", className)}
          aria-labelledby={title ? "faq-title" : undefined}
        >
          {title && (
            <h2
              id="faq-title"
              className={cn(TYPOGRAPHY.accordion.heading, "mb-4")}
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {title}
            </h2>
          )}
          <Accordion
            type="single"
            collapsible
            defaultValue={"item-0"}
            className="w-full"
          >
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-none"
              >
                <div className="relative">
                  <AccordionTrigger className="text-left font-medium">
                    {item.question}
                  </AccordionTrigger>
                  {/* Bottom border with gradient fade effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-border via-border to-transparent" />
                </div>
                <AccordionContent className="prose prose-sm dark:prose-invert max-w-none">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      );
    }

    // Fallback: just render children as-is
    return (
      <section className={cn("my-8", className)}>
        {title && (
          <h2
            id="faq-title"
            className={cn(TYPOGRAPHY.accordion.heading, `mb-${SPACING_SCALE.md}`)}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {title}
          </h2>
        )}
        {children}
      </section>
    );
  }

  return null;
}

/**
 * Parse children to extract FAQ question/answer pairs
 * Looks for h3/h4 elements as questions and following content as answers
 */
function parseFAQChildren(children: React.ReactNode): FAQItem[] {
  const items: FAQItem[] = [];
  const childArray = React.Children.toArray(children);

  let currentQuestion: React.ReactNode | null = null;
  let currentAnswer: React.ReactNode[] = [];

  const flushCurrentItem = () => {
    if (currentQuestion && currentAnswer.length > 0) {
      items.push({
        question: currentQuestion,
        answer:
          currentAnswer.length === 1 ? currentAnswer[0] : <>{currentAnswer}</>,
      });
    }
    currentQuestion = null;
    currentAnswer = [];
  };

  for (const child of childArray) {
    if (!React.isValidElement(child)) {
      if (currentQuestion) {
        currentAnswer.push(child);
      }
      continue;
    }

    const type = child.type;
    const typeName =
      typeof type === "string"
        ? type
        : typeof type === "function"
          ? type.name
          : "";

    // Check if this is a heading (h3, h4) - treat as question
    if (
      typeName === "h3" ||
      typeName === "h4" ||
      type === "h3" ||
      type === "h4"
    ) {
      flushCurrentItem();
      currentQuestion = (child.props as { children?: React.ReactNode })
        .children;
    } else if (currentQuestion) {
      // This is answer content
      currentAnswer.push(child);
    }
  }

  // Don't forget the last item
  flushCurrentItem();

  return items;
}

export default FAQ;
