"use client";

import { ArrowDownUp } from "lucide-react";
import { FilterBadges } from "@/components/common";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "alpha", label: "A-Z" },
  { value: "status", label: "Status" },
];

interface ProjectSortProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
}

/**
 * Project Sort Section
 *
 * Sort by badges for project filtering.
 */
export function ProjectSort({ sortBy, onSortChange }: ProjectSortProps) {
  return (
    <FilterBadges
      items={SORT_OPTIONS.map((o) => o.value)}
      selected={[sortBy]}
      onToggle={(sort) =>
        onSortChange(sort === sortBy && sort !== "newest" ? "newest" : sort)
      }
      icon={ArrowDownUp}
      label="Sort by"
      displayMap={Object.fromEntries(
        SORT_OPTIONS.map((o) => [o.value, o.label])
      )}
    />
  );
}
