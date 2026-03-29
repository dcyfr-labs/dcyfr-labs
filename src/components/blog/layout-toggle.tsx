'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutGrid, List, Columns2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SPACING, SPACING_SCALE } from '@/lib/design-tokens';

interface LayoutOption {
  id: 'grid' | 'list' | 'magazine';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: 'magazine',
    label: 'Magazine',
    icon: Columns2,
    title: 'Magazine layout - Hero post with full-width cards',
  },
  {
    id: 'grid',
    label: 'Grid',
    icon: LayoutGrid,
    title: 'Grid layout - Hero post with 2-column grid',
  },
  {
    id: 'list',
    label: 'List',
    icon: List,
    title: 'List layout - Single column with full details',
  },
];

interface LayoutToggleProps {
  /** Current active layout */
  currentLayout: 'grid' | 'list' | 'magazine';
}

/**
 * LayoutToggle Component
 *
 * Desktop-only control for switching blog post layouts.
 * Changes are persisted via URL params, which trigger BlogLayoutManager
 * to save the preference to localStorage.
 *
 * @param {LayoutToggleProps} props - Component props
 * @returns {React.ReactElement} Layout toggle buttons
 */
export function LayoutToggle({ currentLayout }: LayoutToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLayoutChange = (layout: 'grid' | 'list' | 'magazine') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('layout', layout);
    router.push(`/blog?${params.toString()}`, { scroll: false });
  };

  return (
    <div
      className={`hidden md:flex items-center gap-${SPACING_SCALE.xs} rounded-lg border border-border bg-background/50 p-${SPACING_SCALE.xs}`}
    >
      {LAYOUT_OPTIONS.map(({ id, icon: Icon, title }) => (
        <button
          key={id}
          onClick={() => handleLayoutChange(id)}
          title={title}
          aria-label={title}
          aria-pressed={currentLayout === id}
          className={cn(
            `flex items-center justify-center gap-${SPACING_SCALE.sm} px-3 py-2 rounded transition-colors`,
            currentLayout === id
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
