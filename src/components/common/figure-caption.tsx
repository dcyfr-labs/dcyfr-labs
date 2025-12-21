"use client";

import * as React from "react";
import { SPACING, TYPOGRAPHY } from "@/lib/design-tokens";

/**
 * Figure numbering context for tracking figures in sequence
 * @internal
 */
const FigureCountContext = React.createContext<{
  count: number;
  increment: () => number;
}>({
  count: 0,
  increment: () => 0,
});

/**
 * Overhead display context for modal/lightbox overlay mode
 * @internal
 */
const OverheadContext = React.createContext<boolean>(false);

/**
 * FigureProvider Component
 *
 * Provides context for automatic figure numbering in blog posts.
 * Must wrap the MDX content for captions to work properly.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components/MDX content
 * @returns {React.ReactElement}
 *
 * @example
 * <FigureProvider>
 *   <MDX source={post.body} />
 * </FigureProvider>
 */
export function FigureProvider({ children }: { children: React.ReactNode }) {
  const counterRef = React.useRef(0);

  // Create the increment function once and keep it stable
  const increment = React.useCallback(() => {
    counterRef.current += 1;
    return counterRef.current;
  }, []);

  const contextValue = React.useMemo(
    () => ({
      count: 0,
      increment,
    }),
    [increment]
  );

  return (
    <FigureCountContext.Provider value={contextValue}>
      {children}
    </FigureCountContext.Provider>
  );
}

/**
 * OverheadProvider Component
 *
 * Provides context indicating that figures are being displayed in overhead/modal mode.
 * When active, figure captions are positioned at the bottom of images as overlays.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {boolean} [props.isOverhead=false] - Whether overhead mode is active
 * @returns {React.ReactElement}
 *
 * @example
 * <OverheadProvider isOverhead={true}>
 *   <Figure caption="Caption text"><img src="..." /></Figure>
 * </OverheadProvider>
 */
export function OverheadProvider({ 
  children, 
  isOverhead = false 
}: { 
  children: React.ReactNode;
  isOverhead?: boolean;
}) {
  return (
    <OverheadContext.Provider value={isOverhead}>
      {children}
    </OverheadContext.Provider>
  );
}

/**
 * Figure Component
 *
 * Wraps an image with automatic figure numbering and caption support.
 * Displays as "Fig. # Caption text" below the image (normal mode) or as an overlay
 * at the bottom of the image (overhead/modal mode).
 *
 * Can be used two ways:
 *
 * 1. **Inline in MDX** (automatic numbering):
 * ```mdx
 * <Figure caption="This is my figure caption">
 *   ![alt text](/image.png)
 * </Figure>
 * ```
 *
 * 2. **With img directly**:
 * ```tsx
 * <Figure caption="Figure caption">
 *   <img src="/image.png" alt="description" />
 * </Figure>
 * ```
 *
 * The figure number is automatically assigned based on order of appearance.
 *
 * @component
 * @param {Object} props
 * @param {string} props.caption - Caption text to display below the image
 * @param {React.ReactNode} props.children - Image element(s) to wrap
 * @returns {React.ReactElement}
 *
 * @features
 * - Automatic figure numbering (Fig. 1, Fig. 2, etc.)
 * - Numbering persists across component re-renders
 * - Accessible figure and caption semantics
 * - Responsive layout
 * - Overhead mode: Caption overlays at bottom of image (for modals/lightbox)
 * - Normal mode: Caption below image (for standard display)
 * - Integrates with ZoomableImage hover effects
 */
export function Figure({
  caption,
  children,
}: {
  caption?: string;
  children: React.ReactNode;
}) {
  const context = React.useContext(FigureCountContext);
  const isOverhead = React.useContext(OverheadContext);
  const [figureNumber, setFigureNumber] = React.useState<number | null>(null);

  // Use layoutEffect to ensure the number is set exactly once during mount
  // This prevents double-incrementing in StrictMode
  React.useLayoutEffect(() => {
    if (figureNumber === null) {
      setFigureNumber(context.increment());
    }
  }, [figureNumber, context]);

  if (!caption) {
    // If no caption provided, just render children as-is
    return <>{children}</>;
  }

  // Don't render caption until we have a figure number
  if (figureNumber === null) {
    return <>{children}</>;
  }

  const captionText = (
    <>
      <strong className="font-semibold not-italic">Fig. {figureNumber}:</strong> {caption}
    </>
  );

  if (isOverhead) {
    // Overhead mode: Caption as overlay at bottom of image
    return (
      <figure className="relative inline-block w-full [&>p]:mb-0">
        {children}
        <figcaption
          className={`absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent ${TYPOGRAPHY.body} text-white italic text-center text-sm p-4 [&>p]:mb-0`}
        >
          {captionText}
        </figcaption>
      </figure>
    );
  }

  // Normal mode: Caption below image
  return (
    <figure className={`mb-6 flex flex-col items-center [&>p]:mb-0`}>
      {children}
      <figcaption
        className={`${TYPOGRAPHY.body} text-center italic text-sm text-muted-foreground [&>p]:mb-0`}
      >
        {captionText}
      </figcaption>
    </figure>
  );
}
