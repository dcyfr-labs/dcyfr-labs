'use client';

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { SPACING, TYPOGRAPHY, SEMANTIC_COLORS, ANIMATION } from '@/lib/design-tokens';

/**
 * GlossaryTooltip - Interactive tooltip for technical terms
 *
 * Features:
 * - Hover/click activation
 * - Keyboard navigation (Tab, Escape)
 * - LocalStorage for visited state
 * - Theme-aware styling
 * - WCAG AA accessible
 *
 * @example
 * ```tsx
 * <GlossaryTooltip term="Prompt Injection" definition="A technique where attackers...">
 *   prompt injection
 * </GlossaryTooltip>
 * ```
 */

interface GlossaryTooltipProps {
  /** Technical term being defined */
  term: string;
  /** Definition/explanation of the term */
  definition: string;
  /** Text to display (defaults to term) */
  children?: React.ReactNode;
  /** Optional className for custom styling */
  className?: string;
}

const STORAGE_KEY = 'dcyfr-glossary-visited';

export function GlossaryTooltip({ term, definition, children, className }: GlossaryTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [forceRecalc, setForceRecalc] = useState(0);

  // Load visited state from localStorage using lazy initialization
  const [isVisited, setIsVisited] = useState(() => {
    try {
      const visited = localStorage.getItem(STORAGE_KEY);
      if (visited) {
        const visitedTerms = JSON.parse(visited) as string[];
        return visitedTerms.includes(term);
      }
    } catch (error) {
      console.warn('Failed to load visited glossary terms:', error);
    }
    return false;
  });

  const [position, setPosition] = useState<'top' | 'bottom'>('bottom');
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [arrowOffset, setArrowOffset] = useState<string>('50%');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Graceful close function with fade-out animation
  const fadeOut = useCallback(() => {
    if (isOpen && !isClosing) {
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 150); // Duration slightly shorter than fade-out animation
    }
  }, [isOpen, isClosing]);

  // Calculate tooltip position based on viewport (using useLayoutEffect for synchronous layout reads)
  useLayoutEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const isMobile = window.innerWidth < 768; // md breakpoint

      // Mobile-specific positioning
      if (isMobile) {
        // On mobile, position tooltip to fill most of screen width with padding
        const style: React.CSSProperties = {
          position: 'fixed',
          left: '1rem',
          right: '1rem',
          zIndex: 50,
          width: 'auto', // Let it fill the available space
        };

        // Calculate arrow position relative to the trigger button
        const triggerCenter = rect.left + rect.width / 2;
        const tooltipLeft = 16; // 1rem
        const tooltipWidth = window.innerWidth - 32; // Full width minus 2rem padding
        const arrowPosition = ((triggerCenter - tooltipLeft) / tooltipWidth) * 100;

        // Constrain arrow position to stay within tooltip bounds (with some padding)
        const constrainedArrowPosition = Math.max(8, Math.min(92, arrowPosition));

        // Determine if tooltip should appear above or below
        const newPosition = spaceBelow < 200 && spaceAbove > 200 ? 'top' : 'bottom';

        if (newPosition === 'top') {
          style.bottom = `${window.innerHeight - rect.top + 8}px`;
        } else {
          style.top = `${rect.bottom + 8}px`;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect -- useLayoutEffect with setState is appropriate for layout measurements per React docs
        setPosition(newPosition);
        setTooltipStyle(style);
        setArrowOffset(`${constrainedArrowPosition}%`);
      } else {
        // Desktop positioning (existing logic)
        const tooltipWidth = 320; // w-80 equivalent
        const newPosition = spaceBelow < 300 && spaceAbove > 300 ? 'top' : 'bottom';

        // Calculate horizontal position, ensuring it doesn't overflow viewport
        let left = rect.left + rect.width / 2;
        const halfTooltipWidth = tooltipWidth / 2;

        // Adjust if tooltip would overflow right edge
        if (left + halfTooltipWidth > window.innerWidth - 16) {
          left = window.innerWidth - halfTooltipWidth - 16;
        }

        // Adjust if tooltip would overflow left edge
        if (left - halfTooltipWidth < 16) {
          left = halfTooltipWidth + 16;
        }

        const style: React.CSSProperties = {
          position: 'fixed',
          left: `${left}px`,
          transform: 'translateX(-50%)',
          zIndex: 50,
        };

        if (newPosition === 'top') {
          style.bottom = `${window.innerHeight - rect.top + 8}px`;
        } else {
          style.top = `${rect.bottom + 8}px`;
        }

        setPosition(newPosition);
        setTooltipStyle(style);
        setArrowOffset('50%'); // Center arrow for desktop
      }
    }
  }, [isOpen, forceRecalc]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isClosing) {
        fadeOut();
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, fadeOut, isClosing]);

  // Recalculate position on window resize (for device rotation)
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        // Force recalculation by incrementing the counter
        setForceRecalc((prev) => prev + 1);
      }
    };

    if (isOpen) {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isOpen]);

  // Close on scroll to prevent tooltip from staying fixed while content moves
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen && !isClosing) {
        fadeOut();
      }
    };

    if (isOpen) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isOpen, fadeOut, isClosing]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        !isClosing &&
        triggerRef.current &&
        tooltipRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        fadeOut();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, fadeOut, isClosing]);

  const handleToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    // Mark as visited when opening
    if (newIsOpen && !isVisited) {
      try {
        const visited = localStorage.getItem(STORAGE_KEY);
        const visitedTerms = visited ? (JSON.parse(visited) as string[]) : [];
        if (!visitedTerms.includes(term)) {
          visitedTerms.push(term);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(visitedTerms));
          setIsVisited(true);
        }
      } catch (error) {
        console.warn('Failed to save visited glossary term:', error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <span className={cn('relative inline-block', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-describedby={isOpen ? `tooltip-${term.replace(/\s+/g, '-')}` : undefined}
        className={cn(
          'inline-flex items-center gap-1',
          'text-primary dark:text-primary',
          'underline decoration-primary/40 decoration-dotted underline-offset-4',
          'hover:decoration-primary/70 hover:decoration-2',
          SEMANTIC_COLORS.interactive.focus,
          ANIMATION.transition.colors,
          'cursor-help'
        )}
      >
        {children || term}
        {/* Visual indicator for unvisited terms */}
        {!isVisited && (
          <span
            className={cn(
              'inline-block w-1.5 h-1.5 rounded-full',
              'bg-primary dark:bg-primary',
              'animate-pulse'
            )}
            aria-hidden="true"
          />
        )}
      </button>

      {/* Tooltip Content - Rendered via Portal */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={tooltipRef}
            id={`tooltip-${term.replace(/\s+/g, '-')}`}
            role="tooltip"
            style={tooltipStyle}
            className={cn(
              'w-full md:w-80 max-w-[calc(100vw-2rem)]',
              'p-4 rounded-lg',
              'bg-popover dark:bg-popover',
              'border border-border dark:border-border',
              'shadow-lg dark:shadow-2xl',
              ANIMATION.transition.appearance,
              isClosing
                ? 'animate-out fade-out-0 zoom-out-95 duration-200'
                : 'animate-in fade-in-0 zoom-in-95 duration-200'
            )}
          >
            {/* Arrow */}
            <div
              className={cn(
                'absolute w-3 h-3',
                position === 'top' ? 'bottom-[-6px]' : 'top-[-6px]',
                'rotate-45',
                'bg-popover dark:bg-popover',
                'border-r border-b border-border dark:border-border'
              )}
              style={{
                left: arrowOffset,
                transform: 'translateX(-50%)',
              }}
              aria-hidden="true"
            />

            {/* Content */}
            <div className="relative space-y-2">
              <h4
                className={cn(
                  TYPOGRAPHY.h4.mdx,
                  'text-popover-foreground dark:text-popover-foreground',
                  'font-semibold'
                )}
              >
                {term}
              </h4>
              <p
                className={cn(
                  TYPOGRAPHY.body.small,
                  'text-popover-foreground/80 dark:text-popover-foreground/80',
                  'leading-relaxed'
                )}
              >
                {definition}
              </p>
            </div>

            {/* Close button for mobile */}
            <button
              type="button"
              onClick={fadeOut}
              className={cn(
                'absolute top-2 right-2',
                'w-6 h-6 rounded-md',
                'flex items-center justify-center',
                'text-popover-foreground/60 hover:text-popover-foreground',
                'hover:bg-popover-foreground/10',
                SEMANTIC_COLORS.interactive.focus,
                ANIMATION.transition.colors,
                'md:hidden'
              )}
              aria-label="Close tooltip"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>,
          document.body
        )}
    </span>
  );
}
