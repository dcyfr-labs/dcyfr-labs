'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const STORAGE_KEY = 'blog-layout-preference';

/**
 * BlogLayoutManager Component
 *
 * Manages blog layout preference persistence.
 * On first visit without a layout URL param, reads from localStorage
 * and applies the saved preference (defaults to "magazine").
 *
 * This runs client-side only and doesn't cause layout shifts since
 * it redirects before content renders.
 */
export function BlogLayoutManager() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const layoutParam = searchParams.get('layout');
    const validLayouts = ['grid', 'list', 'magazine'];

    if (layoutParam && validLayouts.includes(layoutParam)) {
      // Save the current layout preference to localStorage
      localStorage.setItem(STORAGE_KEY, layoutParam);
    } else if (!layoutParam) {
      // If no layout param in URL, check localStorage or use default
      const savedLayout = localStorage.getItem(STORAGE_KEY) || 'magazine';

      // If saved layout is not "magazine" (the default), redirect to apply it
      if (savedLayout !== 'magazine' && validLayouts.includes(savedLayout)) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('layout', savedLayout);
        router.replace(`/blog?${params.toString()}`, { scroll: false });
      }
      // If saved layout is "magazine" or undefined, no redirect needed (it's the server default)
    }
  }, [router, searchParams]); // Run on mount and when router/searchParams change

  return null; // This component doesn't render anything
}
