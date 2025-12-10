"use client";

import dynamic from "next/dynamic";
import type { DiagramPresetProps } from "./diagram-presets";

/**
 * Lazy-loaded diagram presets to prevent SSR CSS conflicts with React Flow.
 * These are dynamically imported with ssr: false to ensure they only load on the client.
 */

export const MCPArchitecture = dynamic(
  () => import("./diagram-presets").then((mod) => mod.MCPArchitecture),
  { ssr: false, loading: () => <div className="h-[350px] bg-muted animate-pulse rounded-lg" /> }
);

export const AuthenticationFlow = dynamic(
  () => import("./diagram-presets").then((mod) => mod.AuthenticationFlow),
  { ssr: false, loading: () => <div className="h-[450px] bg-muted animate-pulse rounded-lg" /> }
);

export const PipelineFlow = dynamic(
  () => import("./diagram-presets").then((mod) => mod.PipelineFlow),
  { ssr: false, loading: () => <div className="h-[420px] bg-muted animate-pulse rounded-lg" /> }
);

export const CVEDecisionTree = dynamic(
  () => import("./diagram-presets").then((mod) => mod.CVEDecisionTree),
  { ssr: false, loading: () => <div className="h-[360px] bg-muted animate-pulse rounded-lg" /> }
);
