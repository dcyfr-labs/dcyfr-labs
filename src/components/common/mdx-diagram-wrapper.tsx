"use client";

/**
 * MDX Diagram Wrapper Components
 * 
 * These are client-side only wrapper components that safely embed
 * diagram presets into MDX-rendered server components.
 * 
 * Using "use client" here ensures:
 * - MDXRemote (RSC) doesn't try to render dynamic imports on server
 * - Diagram presets load only on client side
 * - No "Bail out to client-side rendering" errors
 * - React Flow CSS applies correctly at client hydration
 * 
 * Note: We use dynamic() at the component level (not module level) to ensure
 * props are properly passed through and components render correctly.
 */

import dynamic from "next/dynamic";
import type { DiagramPresetProps } from "./diagram-presets";

// Lazy-load each diagram with client-side-only ssr: false
// Wrapped in component functions to ensure props pass through correctly
const MCPArchitectureDynamic = dynamic(
  () => import("./diagram-presets").then((mod) => mod.MCPArchitecture),
  {
    ssr: false,
    loading: () => (
      <div className="h-[350px] bg-muted animate-pulse rounded-lg" />
    ),
  }
);

export function MDXMCPArchitecture(props: DiagramPresetProps) {
  return <MCPArchitectureDynamic {...props} />;
}

const AuthenticationFlowDynamic = dynamic(
  () => import("./diagram-presets").then((mod) => mod.AuthenticationFlow),
  {
    ssr: false,
    loading: () => (
      <div className="h-[450px] bg-muted animate-pulse rounded-lg" />
    ),
  }
);

export function MDXAuthenticationFlow(props: DiagramPresetProps) {
  return <AuthenticationFlowDynamic {...props} />;
}

const PipelineFlowDynamic = dynamic(
  () => import("./diagram-presets").then((mod) => mod.PipelineFlow),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] bg-muted animate-pulse rounded-lg" />
    ),
  }
);

export function MDXPipelineFlow(props: DiagramPresetProps) {
  return <PipelineFlowDynamic {...props} />;
}

const CVEDecisionTreeDynamic = dynamic(
  () => import("./diagram-presets").then((mod) => mod.CVEDecisionTree),
  {
    ssr: false,
    loading: () => (
      <div className="h-[360px] bg-muted animate-pulse rounded-lg" />
    ),
  }
);

export function MDXCVEDecisionTree(props: DiagramPresetProps) {
  return <CVEDecisionTreeDynamic {...props} />;
}
