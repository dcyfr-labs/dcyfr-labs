"use client";

import { FolderOpen } from "lucide-react";
import { FilterBadges } from "@/components/common/filters";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "in-progress", label: "In Progress" },
  { value: "archived", label: "Archived" },
];

interface ProjectStatusFilterProps {
  status: string | null;
  onStatusChange: (status: string) => void;
}

/**
 * Project Status Filter Section
 * 
 * Status filter badges for project filtering.
 */
export function ProjectStatusFilter({ status, onStatusChange }: ProjectStatusFilterProps) {
  return (
    <FilterBadges
      items={STATUS_OPTIONS.map(o => o.value)}
      selected={status ? [status] : []}
      onToggle={(s) => onStatusChange(status === s ? "" : s)}
      icon={FolderOpen}
      label="Status"
      displayMap={Object.fromEntries(STATUS_OPTIONS.map(o => [o.value, o.label]))}
    />
  );
}
