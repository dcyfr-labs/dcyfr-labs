"use client";

import { type Node, type Edge } from "@xyflow/react";
import { InteractiveDiagram, createLinearFlow, type BaseNodeData } from "@/components/common/interactive-diagram";

export interface DiagramPresetProps {
  showControls?: boolean;
  height?: number | string;
  className?: string;
  caption?: string;
}

/**
 * MCP Architecture Preset
 *
 * Three-tier architecture diagram showing Model Context Protocol flow:
 * AI Client → MCP Server → Data Source
 *
 * @component
 * @example
 * ```tsx
 * <MCPArchitecture height={300} />
 * ```
 */
export function MCPArchitecture({
  showControls = true,
  height = 300,
  className,
  caption
}: DiagramPresetProps) {
  const { nodes: linearNodes, edges: linearEdges } = createLinearFlow([
    { label: "AI Client", description: "Claude, Copilot" },
    { label: "MCP Server", description: "GitHub, Sentry, Database" },
    { label: "Data Source", description: "GitHub, Sentry, Postgres" },
  ]);

  // Convert to horizontal layout
  const nodes = linearNodes.map((node, i) => ({
    ...node,
    position: { x: i * 300 + 50, y: 100 },
  }));

  // Add edge labels
  const edges = linearEdges.map((edge, i) => ({
    ...edge,
    label: i === 0 ? "MCP Protocol" : "API",
    animated: true,
  }));

  return (
    <InteractiveDiagram
      nodes={nodes}
      edges={edges}
      showControls={showControls}
      height={height}
      className={className}
      title="The Architecture"
      description="MCP follows a client-server model"
      caption={caption}
    />
  );
}

/**
 * Authentication Flow Preset
 *
 * Decision-based authentication flow with valid/invalid paths:
 * User → Authentication (decision) → Dashboard or Login Page
 *
 * @component
 * @example
 * ```tsx
 * <AuthenticationFlow height={500} />
 * ```
 */
export function AuthenticationFlow({
  showControls = true,
  height = 500,
  className,
  caption
}: DiagramPresetProps) {
  const nodes: Node<BaseNodeData>[] = [
    { id: '1', type: 'input', position: { x: 250, y: 0 }, data: { label: 'User' } },
    { id: '2', type: 'decision', position: { x: 238, y: 100 }, data: { label: 'Authentication' } },
    { id: '3', type: 'modern', position: { x: 100, y: 240 }, data: { label: 'Dashboard', variant: 'primary' } },
    { id: '4', type: 'modern', position: { x: 400, y: 240 }, data: { label: 'Login Page', variant: 'secondary' } },
    { id: '5', type: 'process', position: { x: 100, y: 340 }, data: { label: 'API Calls' } },
    { id: '6', type: 'output', position: { x: 100, y: 440 }, data: { label: 'Database' } },
  ];

  const edges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e2-3', source: '2', target: '3', label: 'Valid', animated: true },
    { id: 'e2-4', source: '2', target: '4', label: 'Invalid', animated: true },
    { id: 'e3-5', source: '3', target: '5', animated: true },
    { id: 'e5-6', source: '5', target: '6', animated: true },
  ];

  return (
    <InteractiveDiagram
      nodes={nodes}
      edges={edges}
      showControls={showControls}
      height={height}
      className={className}
      title="User Authentication Flow"
      description="Decision-based flow with valid/invalid authentication paths"
      caption={caption}
    />
  );
}

/**
 * Pipeline Flow Preset
 *
 * Linear 6-step MDX processing pipeline showing how markdown
 * is transformed into rendered HTML through multiple stages.
 *
 * @component
 * @example
 * ```tsx
 * <PipelineFlow height={600} />
 * ```
 */
export function PipelineFlow({
  showControls = true,
  height = 600,
  className,
  caption
}: DiagramPresetProps) {
  const { nodes, edges } = createLinearFlow([
    { label: "Start: Markdown Post", description: "Raw .mdx file" },
    { label: "Process with Remark", description: "Parse markdown syntax" },
    { label: "Transform with Rehype", description: "HTML transformations" },
    { label: "Syntax Highlight with Shiki", description: "Code block highlighting" },
    { label: "Render as React Component", description: "MDX compilation" },
    { label: "Display in Browser", description: "Final rendered output" },
  ]);

  // Make edges animated
  const animatedEdges = edges.map(edge => ({
    ...edge,
    animated: true,
  }));

  return (
    <InteractiveDiagram
      nodes={nodes}
      edges={animatedEdges}
      showControls={showControls}
      height={height}
      className={className}
      title="MDX Processing Pipeline"
      description="Six-step transformation from markdown to rendered HTML"
      caption={caption}
    />
  );
}

/**
 * CVE Decision Tree Preset
 *
 * Decision tree for vulnerability assessment showing affected/unaffected paths.
 * Used in security-related blog posts to help readers quickly assess impact.
 *
 * @component
 * @example
 * ```tsx
 * <CVEDecisionTree height={400} />
 * ```
 */
export function CVEDecisionTree({
  showControls = true,
  height = 400,
  className,
  caption
}: DiagramPresetProps) {
  const nodes: Node<BaseNodeData>[] = [
    { 
      id: '1', 
      type: 'decision', 
      position: { x: 250, y: 0 }, 
      data: { label: 'Using RSC?' } 
    },
    { 
      id: '2', 
      type: 'modern', 
      position: { x: 50, y: 120 }, 
      data: { label: 'Not Affected', variant: 'primary' } 
    },
    { 
      id: '3', 
      type: 'decision', 
      position: { x: 400, y: 120 }, 
      data: { label: 'React Version?' } 
    },
    { 
      id: '4', 
      type: 'modern', 
      position: { x: 250, y: 260 }, 
      data: { label: 'Already Patched', variant: 'primary' } 
    },
    { 
      id: '5', 
      type: 'modern', 
      position: { x: 500, y: 260 }, 
      data: { label: 'Vulnerable!', variant: 'secondary' } 
    },
    { 
      id: '6', 
      type: 'output', 
      position: { x: 500, y: 360 }, 
      data: { label: 'Upgrade Now' } 
    },
  ];

  const edges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', label: 'No', animated: true },
    { id: 'e1-3', source: '1', target: '3', label: 'Yes', animated: true },
    { id: 'e3-4', source: '3', target: '4', label: '19.0.1, 19.1.2, 19.2.1+', animated: true },
    { id: 'e3-5', source: '3', target: '5', label: 'Other 19.x', animated: true },
    { id: 'e5-6', source: '5', target: '6', animated: true },
  ];

  return (
    <InteractiveDiagram
      nodes={nodes}
      edges={edges}
      showControls={showControls}
      height={height}
      className={className}
      title="Am I Affected?"
      description="Quick decision tree to assess CVE-2025-55182 impact"
      caption={caption}
    />
  );
}
