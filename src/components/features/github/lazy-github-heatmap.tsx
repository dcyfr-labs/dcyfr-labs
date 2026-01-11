"use client";

import dynamic from "next/dynamic";
import { GitHubHeatmapSkeleton } from "@/components/common";

/**
 * Lazy-loaded GitHub heatmap wrapper
 * 
 * Must be a client component because Next.js 16 doesn't allow
 * `ssr: false` with `next/dynamic` in Server Components.
 * 
 * Defers loading of framer-motion + react-calendar-heatmap (~60KB).
 */

const GitHubHeatmap = dynamic(
  () => import("@/components/features/github/github-heatmap").then(mod => ({ default: mod.GitHubHeatmap })),
  {
    loading: () => <GitHubHeatmapSkeleton />,
    ssr: false,
  }
);

interface LazyGitHubHeatmapProps {
  username?: string;
}

export function LazyGitHubHeatmap({ username }: LazyGitHubHeatmapProps) {
  return <GitHubHeatmap username={username} />;
}
