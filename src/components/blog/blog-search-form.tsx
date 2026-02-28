"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { SPACING, SPACING_SCALE } from '@/lib/design-tokens';

/**
 * Props for the BlogSearchForm component
 * @typedef {Object} BlogSearchFormProps
 * @property {string} query - Current search query string (from URL params)
 * @property {string} tag - Currently selected tag filter (from URL params)
 * @property {string} readingTime - Currently selected reading time filter (from URL params)
 */
type BlogSearchFormProps = {
  query: string;
  tag: string;
  readingTime?: string;
};

/**
 * BlogSearchForm Component
 *
 * A client-side search form for filtering blog posts by title/content and tags.
 * Manages search state through Next.js App Router URL parameters for:
 * - Server-side filtering without client-side search complexity
 * - Shareable search URLs
 * - Browser history navigation support
 * - Preservation of tag and reading time filters across searches
 *
 * @component
 * @param {BlogSearchFormProps} props - Component props
 * @param {string} props.query - Current search query from URL parameters
 * @param {string} props.tag - Current tag filter from URL parameters
 * @param {string} props.readingTime - Current reading time filter from URL parameters
 *
 * @returns {React.ReactElement} Form with search input and submit button
 *
 * @example
 * // Display search form with no initial query
 * <BlogSearchForm query="" tag="" />
 *
 * @example
 * // Display search form with existing search
 * <BlogSearchForm query="typescript" tag="web" readingTime="quick" />
 *
 * @behavior
 * - Debounces search input by 250ms to reduce unnecessary URL updates
 * - Updates URL parameters when input changes (after debounce) or form is submitted
 * - Preserves tag and reading time filters when searching
 * - Syncs with URL parameters when they change externally
 * - Shows "Searching..." indicator while transition is pending
 *
 * @accessibility
 * - Form has role="search" for semantic HTML
 * - Input has aria-label for screen readers
 * - Uses aria-live="polite" for live region updates
 * - Hidden tag input for form data consistency
 *
 * @see /blog page for usage context
 * @see src/lib/blog.ts for server-side filtering logic
 */
export function BlogSearchForm({
  query,
  tag,
  readingTime,
}: BlogSearchFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(query);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setValue(query);
  }, [query, tag, readingTime]);

  const applySearch = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next) {
        params.set("q", next);
      } else {
        params.delete("q");
      }

      if (tag) {
        params.set("tag", tag);
      } else {
        params.delete("tag");
      }

      if (readingTime) {
        params.set("readingTime", readingTime);
      }

      const target =
        params.size > 0 ? `${pathname}?${params.toString()}` : pathname;

      startTransition(() => {
        router.replace(target, { scroll: false });
      });
    },
    [pathname, router, searchParams, tag, readingTime]
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const normalized = value.trim();
      if (normalized === query.trim()) {
        return;
      }
      applySearch(normalized);
    }, 250);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [value, query, applySearch]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applySearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="mt-6">
      <div
        className={`flex w-full items-center gap-${SPACING_SCALE.sm}`}
        aria-live="polite"
      >
        <Input
          type="search"
          name="q"
          placeholder="Search posts..."
          aria-label="Search blog posts"
          autoComplete="off"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="w-full"
          autoFocus
        />
        {tag && <input type="hidden" name="tag" value={tag} />}
      </div>
    </form>
  );
}
