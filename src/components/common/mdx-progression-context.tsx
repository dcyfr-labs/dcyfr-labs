"use client";

import * as React from "react";
import { ProgressiveParagraph } from "@/components/common/progressive-content";

/**
 * Context for tracking paragraph progression in MDX content
 */
export const MDXProgressionContext = React.createContext<{
  paragraphCount: number;
  incrementParagraph: () => void;
  useFontContrast: boolean;
} | null>(null);

/**
 * Provider for MDX content progression tracking
 */
export function MDXProgressionProvider({ 
  children, 
  useFontContrast = false 
}: { 
  children: React.ReactNode;
  useFontContrast?: boolean;
}) {
  const [paragraphCount, setParagraphCount] = React.useState(0);
  
  const incrementParagraph = React.useCallback(() => {
    setParagraphCount(count => count + 1);
  }, []);
  
  return (
    <MDXProgressionContext.Provider value={{ 
      paragraphCount, 
      incrementParagraph, 
      useFontContrast 
    }}>
      {children}
    </MDXProgressionContext.Provider>
  );
}

/**
 * MDX Paragraph Component with Progressive Styling
 */
export function MDXParagraphComponent(props: React.HTMLAttributes<HTMLParagraphElement>) {
  const context = React.useContext(MDXProgressionContext);
  const hasIncrementedRef = React.useRef(false);
  
  // Increment once on mount (increment function is stable due to useCallback with empty deps)
  React.useEffect(() => {
    if (!hasIncrementedRef.current && context?.incrementParagraph) {
      hasIncrementedRef.current = true;
      context.incrementParagraph();
    }
    // Depend only on context.incrementParagraph which is stable across renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.incrementParagraph]);
  
  if (!context) {
    return <p {...props} />;
  }

  const { paragraphCount, useFontContrast } = context;
  
  // Determine position based on paragraph count
  let position: 'opening' | 'body' | 'closing' = 'body';
  if (paragraphCount === 0) {
    position = 'opening';
  } else if (paragraphCount > 8) {
    // Later paragraphs get closing treatment
    position = 'closing';
  }
  
  return (
    <ProgressiveParagraph
      position={position}
      useFontContrast={useFontContrast}
      {...props}
    />
  );
}

MDXParagraphComponent.displayName = 'MDXParagraphComponent';
