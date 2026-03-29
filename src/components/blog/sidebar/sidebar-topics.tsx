'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TYPOGRAPHY, SPACING } from '@/lib/design-tokens';

const TOPICS_PREVIEW_COUNT = 8;

interface SidebarTopicsProps {
  tagList: Array<{ tag: string; count: number }>;
  selectedTags: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onTagToggle: (tag: string) => void;
}

/**
 * Sidebar Topics Component
 *
 * Collapsible section containing tag filter badges with counts.
 * Shows top 8 tags by default with a "Show all" toggle to reveal the rest.
 * Used in the blog listing page sidebar.
 */
export function SidebarTopics({
  tagList,
  selectedTags,
  isExpanded,
  onToggle,
  onTagToggle,
}: SidebarTopicsProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleTags = showAll ? tagList : tagList.slice(0, TOPICS_PREVIEW_COUNT);
  const hasMore = tagList.length > TOPICS_PREVIEW_COUNT;

  return (
    <div className={SPACING.content}>
      <button
        onClick={onToggle}
        className={`flex items-center justify-between w-full ${TYPOGRAPHY.label.small}`}
      >
        <span>Topics</span>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isExpanded && tagList.length > 0 && (
        <div className="pt-2 space-y-2">
          <div className="flex flex-wrap gap-2">
            {visibleTags.map(({ tag, count }) => {
              const isSelected = selectedTags.some((t) => t.toLowerCase() === tag.toLowerCase());
              return (
                <Badge
                  key={tag}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => onTagToggle(tag)}
                >
                  {tag}
                  <span className="ml-1.5 text-xs opacity-70">({count})</span>
                </Badge>
              );
            })}
          </div>

          {hasMore && (
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className={`${TYPOGRAPHY.metadata} text-muted-foreground hover:text-foreground transition-colors`}
            >
              {showAll ? 'Show less' : `Show all ${tagList.length} topics`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
