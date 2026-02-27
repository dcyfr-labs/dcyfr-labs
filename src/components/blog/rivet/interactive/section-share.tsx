'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SITE_URL } from '@/lib/site-config';
import {
  SPACING,
  SPACING_VALUES,
  TYPOGRAPHY,
  SEMANTIC_COLORS,
  ANIMATION,
} from '@/lib/design-tokens';

/**
 * SectionShare - Per-section share buttons for blog content
 *
 * Features:
 * - Twitter, LinkedIn, copy link sharing
 * - Visual feedback for copy action
 * - Theme-aware styling
 * - Keyboard accessible
 * - Analytics tracking ready
 *
 * @example
 * ```tsx
 * <SectionShare
 *   sectionId="asi01-goal-hijack"
 *   sectionTitle="Agent Goal Hijack"
 * />
 * ```
 */

interface SectionShareProps {
  /** Unique ID for the section (used in URL hash) */
  sectionId: string;
  /** Human-readable title for the section */
  sectionTitle: string;
  /** Optional className for custom styling */
  className?: string;
}

export function SectionShare({ sectionId, sectionTitle, className }: SectionShareProps) {
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();

  // Build the section URL with hash - always use production domain
  const getSectionUrl = () => {
    return `${SITE_URL}${pathname}#${sectionId}`;
  };

  const handleCopyLink = async () => {
    const url = getSectionUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.warn('Failed to copy link:', error);
    }
  };

  const handleTwitterShare = () => {
    const url = getSectionUrl();
    const text = `Check out "${sectionTitle}"`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleLinkedInShare = () => {
    const url = getSectionUrl();
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        'rounded-lg p-2',
        `my-${SPACING_VALUES.md}`,
        TYPOGRAPHY.label.small,
        'bg-muted/50',
        'border border-border/50',
        'transition-colors',
        className
      )}
      role="group"
      aria-label="Share this section"
    >
      Share this section:
      {/* Twitter Share */}
      <button
        type="button"
        onClick={handleTwitterShare}
        className={cn(
          'inline-flex items-center justify-center',
          'w-8 h-8 rounded-md',
          'text-muted-foreground hover:text-foreground',
          'hover:bg-muted',
          SEMANTIC_COLORS.interactive.focus,
          'transition-colors'
        )}
        aria-label={`Share "${sectionTitle}" on Twitter`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>
      {/* LinkedIn Share */}
      <button
        type="button"
        onClick={handleLinkedInShare}
        className={cn(
          'inline-flex items-center justify-center',
          'w-8 h-8 rounded-md',
          'text-muted-foreground hover:text-foreground',
          'hover:bg-muted',
          SEMANTIC_COLORS.interactive.focus,
          'transition-colors'
        )}
        aria-label={`Share "${sectionTitle}" on LinkedIn`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </button>
      {/* Copy Link */}
      <button
        type="button"
        onClick={handleCopyLink}
        className={cn(
          'inline-flex items-center justify-center',
          'w-8 h-8 rounded-md',
          'text-muted-foreground hover:text-foreground',
          'hover:bg-muted',
          SEMANTIC_COLORS.interactive.focus,
          'transition-colors',
          copied && 'text-success bg-success/10'
        )}
        aria-label={copied ? 'Link copied!' : `Copy link to "${sectionTitle}"`}
      >
        {copied ? (
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
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
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
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        )}
      </button>
      {/* Visual feedback text */}
      {copied && (
        <span
          className={cn(TYPOGRAPHY.body.small, 'text-success', 'animate-in fade-in-0 duration-200')}
          role="status"
          aria-live="polite"
        >
          Copied!
        </span>
      )}
    </div>
  );
}
