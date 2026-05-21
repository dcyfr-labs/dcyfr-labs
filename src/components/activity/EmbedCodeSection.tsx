'use client';

import { useState } from 'react';
import { Code } from 'lucide-react';
import { CONTAINER_WIDTHS, CONTAINER_PADDING, SPACING } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import { EmbedGenerator } from './EmbedGenerator';

export function EmbedCodeSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn(CONTAINER_WIDTHS.standard, 'mx-auto', CONTAINER_PADDING, 'pb-16')}>
      <div className={cn(CONTAINER_WIDTHS.thread, 'mx-auto', SPACING.content)}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-full',
            'border border-border/50 hover:border-border',
            'text-sm font-medium text-muted-foreground hover:text-foreground',
            'hover:bg-muted/30 transition-colors duration-200'
          )}
        >
          <Code className="w-4 h-4" aria-hidden="true" />
          {open ? 'Hide Embed Code' : 'Show Embed Code'}
        </button>

        {open && <EmbedGenerator />}
      </div>
    </div>
  );
}
