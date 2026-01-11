"use client";

import { Tags } from "lucide-react";
import { FilterBadges } from "@/components/common";

interface ProjectTagFilterProps {
  tagList: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

/**
 * Project Tag Filter Section
 *
 * Tag filter badges for project filtering.
 */
export function ProjectTagFilter({
  tagList,
  selectedTags,
  onTagToggle,
}: ProjectTagFilterProps) {
  if (tagList.length === 0) return null;

  return (
    <FilterBadges
      items={tagList}
      selected={selectedTags}
      onToggle={onTagToggle}
      icon={Tags}
      label="Tags"
      caseInsensitive
    />
  );
}
