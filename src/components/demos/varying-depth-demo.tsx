/**
 * Varying Depth System - Visual Example Component
 *
 * This component demonstrates how the varying depth styling system works
 * across different content types and patterns.
 */

import React from "react";
import { Check } from "lucide-react";
import {
  ProgressiveParagraph,
  ContentBlock,
  ContrastText,
} from "@/components/common";
import { TYPOGRAPHY,
  CONTENT_HIERARCHY,
  PROGRESSIVE_TEXT,
  FONT_CONTRAST,
  SPACING,
  SEMANTIC_COLORS, SPACING_SCALE } from '@/lib/design-tokens';

/**
 * Visual demonstration of varying depth styles
 *
 * Usage: Add this component to a page to see the varying depth system in action
 *
 * @example
 * ```tsx
 * import VaryingDepthDemo from "@/components/demos/varying-depth-demo";
 *
 * export default function DemoPage() {
 *   return <VaryingDepthDemo />;
 * }
 * ```
 */
export default function VaryingDepthDemo() {
  return (
    <div className={SPACING.section}>
      {/* Content Hierarchy Examples */}
      <section className={SPACING.content}>
        <h2 className={TYPOGRAPHY.h2.standard}>Content Hierarchy Patterns</h2>
        <p className={TYPOGRAPHY.description}>
          These patterns create visual depth through organized content blocks.
        </p>

        <div className={`grid gap-${SPACING_SCALE.md} md:grid-cols-2`}>
          <ContentBlock variant="primary" title="Primary Content">
            <p>Main information with full emphasis and maximum contrast.</p>
            <p>This is ideal for core message and central ideas.</p>
          </ContentBlock>

          <ContentBlock variant="supporting" title="Supporting Information">
            <p>Contextual details that enhance understanding.</p>
            <p>Slightly muted to show it supports the primary message.</p>
          </ContentBlock>

          <ContentBlock variant="accent" title="Highlighted Information">
            <p>Important details that need emphasis.</p>
            <p>Uses stronger font weight to stand out from regular content.</p>
          </ContentBlock>

          <ContentBlock variant="subtle" title="Background Details">
            <p>Minimal emphasis for reference information.</p>
            <p>Useful for footnotes, citations, and supporting context.</p>
          </ContentBlock>
        </div>
      </section>

      {/* Progressive Paragraph Examples */}
      <section className={SPACING.content}>
        <h2 className={TYPOGRAPHY.h2.standard}>
          Progressive Paragraph Styling
        </h2>
        <p className={TYPOGRAPHY.description}>
          Paragraphs automatically adjust their emphasis based on position and
          length.
        </p>

        <div
          className={`${SPACING.content} rounded-lg border border-border p-4`}
        >
          <div>
            <h3 className="font-semibold mb-2">
              Opening Paragraph (Full Emphasis)
            </h3>
            <ProgressiveParagraph position="opening">
              This opening paragraph receives maximum emphasis with larger text
              size and full contrast. It sets the tone for the entire content
              section and captures reader attention immediately with its
              prominent styling.
            </ProgressiveParagraph>
          </div>

          <div>
            <h3 className="font-semibold mb-2">
              Body Paragraph (Standard Treatment)
            </h3>
            <ProgressiveParagraph position="body">
              This is a standard body paragraph that maintains regular emphasis
              and readability. It provides the main content flow and is sized
              appropriately for comfortable reading over longer sections.
            </ProgressiveParagraph>
          </div>

          <div>
            <h3 className="font-semibold mb-2">
              Extended Paragraph (Slightly Reduced)
            </h3>
            <ProgressiveParagraph position="body" isContextual={false}>
              This paragraph demonstrates length-based styling. When content
              extends beyond 300 characters, it receives a subtle opacity
              reduction to create visual breathing room. This helps maintain
              readability in longer blocks of text while preventing visual
              fatigue. The reduced emphasis draws the reader&apos;s eye to other
              elements on the page, creating natural visual hierarchy through
              progressive depth.
            </ProgressiveParagraph>
          </div>

          <div>
            <h3 className="font-semibold mb-2">
              Closing Paragraph (Subtle Reduction)
            </h3>
            <ProgressiveParagraph position="closing">
              Closing paragraphs receive subtle reduction in emphasis to signal
              the end of a content section. This helps readers understand the
              natural conclusion of an idea or topic.
            </ProgressiveParagraph>
          </div>

          <div>
            <h3 className="font-semibold mb-2">
              Contextual Information (Muted)
            </h3>
            <ProgressiveParagraph isContextual>
              Contextual paragraphs are presented in a more muted style, often
              used for supporting details, examples, or background information
              that enhances understanding without being the main focus.
            </ProgressiveParagraph>
          </div>
        </div>
      </section>

      {/* Font Contrast Examples */}
      <section className={SPACING.content}>
        <h2 className={TYPOGRAPHY.h2.standard}>Font Contrast System</h2>
        <p className={TYPOGRAPHY.description}>
          Light base fonts create optimal contrast against bold emphasis
          elements.
        </p>

        <div className={`${SPACING.content} rounded-lg border border-border p-4`}>
          <p>
            <ContrastText>
              This text uses the base weight (font-light) and normal text shows
              excellent contrast with{" "}
              <ContrastText.Bold>bold emphasis</ContrastText.Bold>.
            </ContrastText>
          </p>

          <p>
            <ContrastText.Heading>
              Heading weight text maintains proper hierarchy while{" "}
              <ContrastText.Emphasis>emphasized sections</ContrastText.Emphasis>{" "}
              stand out clearly.
            </ContrastText.Heading>
          </p>

          <p>
            <ContrastText>
              Light base: &ldquo;Security isn&apos;t about saying no, it&apos;s
              about enabling innovation with{" "}
              <ContrastText.Bold>confidence</ContrastText.Bold>.&rdquo;
            </ContrastText>
          </p>

          <div className="space-y-1 text-sm">
            <p className={FONT_CONTRAST.base}>
              Font-light base (best for contrast)
            </p>
            <p className={FONT_CONTRAST.medium}>
              Font-normal medium (default body)
            </p>
            <p className={FONT_CONTRAST.emphasis}>
              Font-semibold emphasis (clear distinction)
            </p>
            <p className={FONT_CONTRAST.bold}>Font-bold (maximum contrast)</p>
            <p className={FONT_CONTRAST.heading}>
              Font-medium heading (hierarchy)
            </p>
          </div>
        </div>
      </section>

      {/* Depth Token Reference */}
      <section className={SPACING.content}>
        <h2 className={TYPOGRAPHY.h2.standard}>Direct Depth Token Usage</h2>
        <p className={TYPOGRAPHY.description}>
          For custom implementations, use these tokens directly.
        </p>

        <div className={`${SPACING.content} rounded-lg border border-border p-4 text-sm`}>
          <div>
            <p className="font-semibold mb-1">Primary Depth</p>
            <p className={CONTENT_HIERARCHY.primary.content}>
              Font-medium with full foreground contrast. Use for main content
              and primary information.
            </p>
          </div>

          <div>
            <p className="font-semibold mb-1">Secondary Depth</p>
            <p className={CONTENT_HIERARCHY.supporting.content}>
              Font-normal with 90% opacity. Use for supporting content.
            </p>
          </div>

          <div>
            <p className="font-semibold mb-1">Tertiary Depth</p>
            <p className={CONTENT_HIERARCHY.subtle.content}>
              Font-normal with muted-foreground. Use for contextual information.
            </p>
          </div>

          <div>
            <p className="font-semibold mb-1">Accent Depth</p>
            <p className={CONTENT_HIERARCHY.accent.content}>
              Font-semibold with full contrast. Use for highlighted information.
            </p>
          </div>

          <div>
            <p className="font-semibold mb-1">Subtle Depth</p>
            <p className={CONTENT_HIERARCHY.subtle.content}>
              Font-light with 70% muted opacity. Use for minimal emphasis.
            </p>
          </div>
        </div>
      </section>

      {/* Implementation Benefits */}
      <section className={SPACING.content}>
        <h2 className={TYPOGRAPHY.h2.standard}>Implementation Benefits</h2>
        <div className={`grid gap-${SPACING_SCALE.md} md:grid-cols-2`}>
          <div className={`rounded-lg border border-border p-${SPACING_SCALE.md}`}>
            <h3
              className={`font-semibold mb-${SPACING["1.5"]} flex items-center gap-${SPACING_SCALE.sm}`}
            >
              <Check
                className={`w-4 h-4 ${SEMANTIC_COLORS.status.success}`}
                aria-hidden="true"
              />{" "}
              Visual Hierarchy
            </h3>
            <p className="text-sm text-muted-foreground">
              Clear distinction between primary, supporting, and contextual
              information helps readers understand content importance at a
              glance.
            </p>
          </div>

          <div className={`rounded-lg border border-border p-${SPACING_SCALE.md}`}>
            <h3
              className={`font-semibold mb-${SPACING["1.5"]} flex items-center gap-${SPACING_SCALE.sm}`}
            >
              <Check
                className={`w-4 h-4 ${SEMANTIC_COLORS.status.success}`}
                aria-hidden="true"
              />{" "}
              Readability
            </h3>
            <p className="text-sm text-muted-foreground">
              Progressive styling prevents visual fatigue in long-form content
              while maintaining comfortable reading flow.
            </p>
          </div>

          <div className={`rounded-lg border border-border p-${SPACING_SCALE.md}`}>
            <h3
              className={`font-semibold mb-${SPACING["1.5"]} flex items-center gap-${SPACING_SCALE.sm}`}
            >
              <Check
                className={`w-4 h-4 ${SEMANTIC_COLORS.status.success}`}
                aria-hidden="true"
              />{" "}
              Consistency
            </h3>
            <p className="text-sm text-muted-foreground">
              Standardized tokens ensure uniform depth styling across the entire
              site and all content types.
            </p>
          </div>

          <div className={`rounded-lg border border-border p-${SPACING_SCALE.md}`}>
            <h3
              className={`font-semibold mb-${SPACING["1.5"]} flex items-center gap-${SPACING_SCALE.sm}`}
            >
              <Check
                className={`w-4 h-4 ${SEMANTIC_COLORS.status.success}`}
                aria-hidden="true"
              />{" "}
              Accessibility
            </h3>
            <p className="text-sm text-muted-foreground">
              Maintains proper color contrast ratios and semantic HTML structure
              for all users and assistive technologies.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
