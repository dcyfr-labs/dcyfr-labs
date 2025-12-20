import React from "react";
import { getContentDepthClass, PROGRESSIVE_TEXT, FONT_CONTRAST, CONTENT_HIERARCHY } from "@/lib/design-tokens";

/**
 * Enhanced Paragraph Component
 * 
 * Applies varying depth styling based on content length and position.
 * Implements the dynamic muted text concept from the about page.
 * 
 * Features:
 * - Length-based opacity reduction for long paragraphs
 * - Position-based emphasis for opening/closing paragraphs
 * - Font contrast system with lighter base weights
 * - Contextual styling for supporting information
 * 
 * @example
 * ```tsx
 * <ProgressiveParagraph position="opening">
 *   First paragraph gets full emphasis...
 * </ProgressiveParagraph>
 * 
 * <ProgressiveParagraph>
 *   Regular body paragraph...
 * </ProgressiveParagraph>
 * 
 * <ProgressiveParagraph isContextual>
 *   Supporting contextual information...
 * </ProgressiveParagraph>
 * ```
 */

interface ProgressiveParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Text content */
  children?: React.ReactNode;
  /** Position in content flow */
  position?: 'opening' | 'body' | 'closing';
  /** Whether content is contextual/supporting */
  isContextual?: boolean;
  /** Use font contrast system (lighter base weight) */
  useFontContrast?: boolean;
}

export function ProgressiveParagraph({
  children,
  position = 'body',
  isContextual = false,
  useFontContrast = false,
  className,
  ...props
}: ProgressiveParagraphProps) {
  // Calculate content length for dynamic styling
  const contentLength = typeof children === 'string' ? children.length : 0;
  
  // Get appropriate depth class
  const depthClass = getContentDepthClass({
    length: contentLength,
    position,
    isContextual,
    useFontContrast,
  });
  
  // Combine classes
  const combinedClasses = className ? `${depthClass} ${className}` : depthClass;
  
  return (
    <p className={combinedClasses} {...props}>
      {children}
    </p>
  );
}

/**
 * Content Block Component
 * 
 * Applies consistent hierarchy patterns based on the about page design.
 * Groups title and content with appropriate spacing and emphasis.
 * 
 * @example
 * ```tsx
 * <ContentBlock variant="primary" title="Main Section">
 *   <p>Primary content with full emphasis</p>
 * </ContentBlock>
 * 
 * <ContentBlock variant="supporting" title="Supporting Info">
 *   <p>Contextual information with muted treatment</p>
 * </ContentBlock>
 * ```
 */

interface ContentBlockProps {
  /** Content hierarchy variant */
  variant: 'primary' | 'supporting' | 'accent' | 'subtle';
  /** Block title (optional) */
  title?: React.ReactNode;
  /** Block content */
  children: React.ReactNode;
  /** Custom className for container */
  className?: string;
  /** Custom className for title */
  titleClassName?: string;
  /** Custom className for content */
  contentClassName?: string;
}

export function ContentBlock({
  variant,
  title,
  children,
  className,
  titleClassName,
  contentClassName,
}: ContentBlockProps) {
  const styles = CONTENT_HIERARCHY[variant];
  
  const containerClasses = className ? `${styles.container} ${className}` : styles.container;
  const titleClasses = titleClassName ? `${styles.title} ${titleClassName}` : styles.title;
  const contentClasses = contentClassName ? `${styles.content} ${contentClassName}` : styles.content;
  
  return (
    <div className={containerClasses}>
      {title && (
        typeof title === 'string' ? (
          <p className={titleClasses}>{title}</p>
        ) : title
      )}
      <div className={contentClasses}>
        {children}
      </div>
    </div>
  );
}

/**
 * Font Contrast Text Component
 * 
 * Applies the font contrast system with lighter base weights for better
 * contrast against bold elements. Implements the "thinner base font" concept.
 * 
 * @example
 * ```tsx
 * <ContrastText>
 *   Light base text with <ContrastText.Bold>bold contrast</ContrastText.Bold>
 * </ContrastText>
 * ```
 */

interface ContrastTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Text content */
  children?: React.ReactNode;
  /** Contrast level */
  variant?: 'base' | 'medium' | 'emphasis' | 'bold' | 'heading';
  /** HTML element to render */
  as?: keyof React.JSX.IntrinsicElements;
}

export function ContrastText({
  children,
  variant = 'base',
  as: Component = 'span',
  className,
  ...props
}: ContrastTextProps) {
  const contrastClass = FONT_CONTRAST[variant];
  const combinedClasses = className ? `${contrastClass} ${className}` : contrastClass;
  
  return React.createElement(
    Component as React.ElementType,
    { className: combinedClasses, ...props },
    children
  );
}

// Sub-components for convenience
ContrastText.Medium = function ContrastTextMedium(props: Omit<ContrastTextProps, 'variant'>) {
  return <ContrastText variant="medium" {...props} />;
};

ContrastText.Emphasis = function ContrastTextEmphasis(props: Omit<ContrastTextProps, 'variant'>) {
  return <ContrastText variant="emphasis" {...props} />;
};

ContrastText.Bold = function ContrastTextBold(props: Omit<ContrastTextProps, 'variant'>) {
  return <ContrastText variant="bold" {...props} />;
};

ContrastText.Heading = function ContrastTextHeading(props: Omit<ContrastTextProps, 'variant'>) {
  return <ContrastText variant="heading" {...props} />;
};

/**
 * Dynamic Depth Analyzer
 * 
 * Analyzes content and suggests appropriate depth styling.
 * Useful for programmatic content processing.
 */

export function analyzeContentDepth(content: string | React.ReactNode): {
  suggestedPosition: 'opening' | 'body' | 'closing';
  suggestedVariant: 'primary' | 'supporting' | 'accent' | 'subtle';
  isLongContent: boolean;
  characterCount: number;
} {
  const text = typeof content === 'string' ? content : '';
  const characterCount = text.length;
  const isLongContent = characterCount > 300;
  
  // Simple heuristics for content analysis
  const hasIntroKeywords = /^(introducing|welcome|about|overview|summary)/i.test(text);
  const hasClosingKeywords = /(conclusion|finally|in summary|to summarize)/i.test(text);
  const hasContextualKeywords = /(note:|tip:|example:|see also)/i.test(text);
  
  let suggestedPosition: 'opening' | 'body' | 'closing' = 'body';
  let suggestedVariant: 'primary' | 'supporting' | 'accent' | 'subtle' = 'primary';
  
  if (hasIntroKeywords) {
    suggestedPosition = 'opening';
    suggestedVariant = 'accent';
  } else if (hasClosingKeywords) {
    suggestedPosition = 'closing';
    suggestedVariant = 'supporting';
  } else if (hasContextualKeywords) {
    suggestedVariant = 'subtle';
  } else if (isLongContent) {
    suggestedVariant = 'supporting';
  }
  
  return {
    suggestedPosition,
    suggestedVariant,
    isLongContent,
    characterCount,
  };
}