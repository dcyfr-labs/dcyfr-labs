import { useEffect, useState } from 'react';

/**
 * Hook to detect whether a CSS media query matches the current viewport.
 *
 * Returns `false` on the server (SSR) and during the initial client render
 * before hydration completes, then updates to the real value once the
 * matchMedia listener is registered. Components that rely on this for
 * a11y semantics (e.g. setting `inert` on a hidden nav) get the correct
 * value on the second render, before user interaction.
 *
 * @example
 * const isDesktop = useMediaQuery('(min-width: 768px)');
 * <nav inert={isDesktop ? undefined : true} aria-label="Bottom navigation">…</nav>
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);

    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
