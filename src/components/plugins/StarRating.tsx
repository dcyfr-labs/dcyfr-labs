'use client';

/**
 * StarRating — interactive or read-only star rating component.
 *
 * Props:
 *   value      – Current rating (0–5); 0 means no rating selected.
 *   onChange   – Called when user clicks a star (interactive mode).
 *   readonly   – Disable interaction (default false).
 *   size       – 'sm' | 'md' | 'lg' (default 'md').
 *   showLabel  – Show text label next to stars (default false).
 *
 * Design tokens used: TYPOGRAPHY, SEMANTIC_COLORS
 */

import { useState } from 'react';
import { TYPOGRAPHY } from '@/lib/design-tokens';
/** StarRating value type (1–5 integer star rating). Mirrors the @dcyfr/ai StarRating type. */
type StarRatingValue = 1 | 2 | 3 | 4 | 5;

const SIZES = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
} as const;

const LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

interface StarRatingProps {
  readonly value: number;
  readonly onChange?: (rating: StarRatingValue) => void;
  readonly readonly?: boolean;
  readonly size?: keyof typeof SIZES;
  readonly showLabel?: boolean;
  readonly className?: string;
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
  showLabel = false,
  className = '',
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number>(0);
  const isInteractive = !readonly && onChange !== undefined;
  const displayValue = isInteractive && hoverValue > 0 ? hoverValue : value;
  const sizeClass = SIZES[size];

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <fieldset
        className="flex items-center gap-0.5 border-none p-0 m-0"
        aria-label={isInteractive ? 'Star rating selector' : `Rating: ${value} out of 5`}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayValue;
          const isHalf = false; // Integer ratings only

          return (
            <button
              key={star}
              type="button"
              disabled={!isInteractive}
              onClick={() => isInteractive && onChange?.(star as StarRatingValue)}
              onMouseEnter={() => isInteractive && setHoverValue(star)}
              onMouseLeave={() => isInteractive && setHoverValue(0)}
              aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
              className={[
                sizeClass,
                'transition-transform duration-100',
                isInteractive
                  ? 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-warning/60 rounded-sm'
                  : 'cursor-default pointer-events-none',
              ].join(' ')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className={`w-full h-full transition-colors duration-100 ${
                  isFilled || isHalf
                    ? 'fill-warning stroke-warning'
                    : 'fill-muted stroke-muted-foreground/40'
                }`}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                />
              </svg>
            </button>
          );
        })}
      </fieldset>

      {showLabel && value > 0 && (
        <span className={`${TYPOGRAPHY.metadata} text-muted-foreground ml-1`}>
          {LABELS[Math.round(value)] ?? `${value.toFixed(1)}`}
        </span>
      )}
    </div>
  );
}
