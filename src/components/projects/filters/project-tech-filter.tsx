"use client";

import { Code2 } from "lucide-react";
import { FilterBadges } from "@/components/common";

interface ProjectTechFilterProps {
  techList: string[];
  selectedTech: string[];
  onTechToggle: (tech: string) => void;
}

/**
 * Project Tech Stack Filter Section
 *
 * Tech stack filter badges for project filtering.
 */
export function ProjectTechFilter({
  techList,
  selectedTech,
  onTechToggle,
}: ProjectTechFilterProps) {
  if (techList.length === 0) return null;

  return (
    <FilterBadges
      items={techList}
      selected={selectedTech}
      onToggle={onTechToggle}
      icon={Code2}
      label="Tech Stack"
    />
  );
}
