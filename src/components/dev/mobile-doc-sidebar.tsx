'use client';

import React, { useState } from 'react';
import { DocSidebar } from '@/components/dev';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Z_INDEX } from '@/lib/design-tokens';
import type { DocFile } from '@/lib/docs';

interface MobileDocSidebarProps {
  docs: DocFile[];
  currentSlug?: string;
}

export function MobileDocSidebar({ docs, currentSlug }: MobileDocSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`lg:hidden fixed top-20 left-4 ${Z_INDEX.dropdown} p-2 rounded-md bg-background border border-border shadow-md`}
        aria-label="Toggle documentation menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-background border-r border-border shadow-lg overflow-y-auto">
            <div className="p-4 pt-20">
              <DocSidebar docs={docs} currentSlug={currentSlug} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
